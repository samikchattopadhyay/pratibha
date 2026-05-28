import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

// Use serverless runtime for better compatibility with long-lived connections
// Note: Vercel's serverless functions have a 30s timeout by default
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const session = await getEdgeSession(req);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  const lastSeenAtParam = req.nextUrl.searchParams.get("lastSeenAt");
  let lastSeenAt = lastSeenAtParam ? new Date(lastSeenAtParam) : new Date(Date.now() - 5 * 60000); // Default to 5 minutes ago

  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const sendHeartbeat = () => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          controller.close();
        }
      };

      const sendNotification = async () => {
        try {
          // Poll for new notifications since lastSeenAt
          const newNotifications = await prisma.notification.findMany({
            where: {
              userId,
              createdAt: { gt: lastSeenAt },
            },
            orderBy: { createdAt: "asc" },
            take: 10, // Limit to avoid overwhelming
          });

          if (newNotifications.length > 0) {
            for (const notif of newNotifications) {
              const data = {
                id: notif.id,
                type: notif.type,
                title: notif.title,
                body: notif.body,
                read: notif.read,
                actionUrl: notif.actionUrl,
                createdAt: notif.createdAt,
              };

              controller.enqueue(
                encoder.encode(`event: new_notification\ndata: ${JSON.stringify(data)}\n\n`)
              );

              lastSeenAt = new Date(Math.max(lastSeenAt.getTime(), notif.createdAt.getTime()));
            }
          }
        } catch (e) {
          console.error("SSE notification fetch error:", e);
        }
      };

      let pollInterval: NodeJS.Timeout | null = null;
      let heartbeatInterval: NodeJS.Timeout | null = null;

      try {
        // Initial notification fetch
        await sendNotification();

        // Set up polling (every 15 seconds)
        pollInterval = setInterval(sendNotification, 15000);

        // Set up heartbeat (every 30 seconds)
        heartbeatInterval = setInterval(sendHeartbeat, 30000);

        // Clean up on client disconnect
        req.signal.addEventListener("abort", () => {
          if (pollInterval) clearInterval(pollInterval);
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          controller.close();
        });
      } catch (e) {
        console.error("SSE setup error:", e);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

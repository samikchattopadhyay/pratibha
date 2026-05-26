import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { sendTelegramWithTracking } from "@/lib/notifications";
import { DeliveryStatus } from "@prisma/client";

/**
 * POST /api/admin/notifications/telegram/retry
 * Retry failed Telegram deliveries
 * Query params:
 *   - deliveryId: specific delivery to retry
 *   - limit: number of failed deliveries to retry (default: 10)
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const deliveryId = searchParams.get("deliveryId");
    const limit = parseInt(searchParams.get("limit") || "10");

    let deliveriesToRetry;

    if (deliveryId) {
      // Retry specific delivery
      deliveriesToRetry = await prisma.telegramMessageDelivery.findMany({
        where: { id: deliveryId },
        include: { notification: true },
      });
    } else {
      // Retry failed deliveries that are due for retry
      deliveriesToRetry = await prisma.telegramMessageDelivery.findMany({
        where: {
          status: DeliveryStatus.TEMPORARILY_FAILED,
          nextRetryAt: { lte: new Date() },
        },
        take: limit,
        include: { notification: true },
        orderBy: { nextRetryAt: "asc" },
      });
    }

    const results = {
      attempted: 0,
      succeeded: 0,
      failed: 0,
      details: [] as Array<{ deliveryId: string; status: "succeeded" | "failed"; chatId: string; error?: string }>,
    };

    for (const delivery of deliveriesToRetry) {
      results.attempted++;

      try {
        // Get the message content from notification
        const notification = delivery.notification;
        const message = `<b>${notification.title}</b>\n\n${notification.body}`;

        // Attempt to send
        await sendTelegramWithTracking(
          notification.id,
          delivery.chatId,
          message
        );

        results.succeeded++;
        results.details.push({
          deliveryId: delivery.id,
          status: "succeeded",
          chatId: delivery.chatId,
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          deliveryId: delivery.id,
          status: "failed",
          chatId: delivery.chatId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error retrying Telegram deliveries:", error);
    return NextResponse.json(
      { error: "Failed to retry deliveries" },
      { status: 500 }
    );
  }
}

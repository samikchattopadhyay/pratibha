import { NextRequest, NextResponse } from "next/server";
import { getFailedTelegramDeliveriesDueForRetry } from "@/lib/db/queries";
import { sendTelegramWithTracking } from "@/lib/notifications";

/**
 * POST /api/cron/telegram-retry
 * Retry temporarily failed Telegram messages
 * Requires CRON_SECRET bearer token in Authorization header
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all temporarily failed deliveries that are due for retry
    const failedDeliveries = await getFailedTelegramDeliveriesDueForRetry();

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      details: [] as { deliveryId: string; chatId: string; status: string; previousFailures: number; error?: string; }[],
    };

    console.log(
      `[Telegram Retry Cron] Starting retry for ${failedDeliveries.length} temporarily failed deliveries`
    );

    for (const delivery of failedDeliveries) {
      results.processed++;

      try {
        const notification = delivery.notification;
        const message = `<b>${notification.title}</b>\n\n${notification.body}`;

        await sendTelegramWithTracking(
          notification.id,
          delivery.chatId,
          message
        );

        results.succeeded++;
        results.details.push({
          deliveryId: delivery.id,
          chatId: delivery.chatId,
          status: "retried_succeeded",
          previousFailures: delivery.failureCount,
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          deliveryId: delivery.id,
          chatId: delivery.chatId,
          status: "retried_failed",
          error: error instanceof Error ? error.message : "Unknown error",
          previousFailures: delivery.failureCount,
        });
      }
    }

    console.log(
      `[Telegram Retry Cron] Completed: ${results.succeeded} succeeded, ${results.failed} failed out of ${results.processed}`
    );

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Telegram Retry Cron] Error:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

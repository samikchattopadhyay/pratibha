import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { getUserByEmail } from "@/lib/db/queries";
import {
  getTelegramDeliveriesWithFilters,
  getTelegramDeliveryCount,
  getTelegramDeliveryStatsByStatus,
} from "@/lib/db/queries";

/**
 * GET /api/admin/notifications/telegram/delivery-status
 * Retrieve Telegram message delivery statistics and records
 * Query params:
 *   - status: filter by delivery status (QUEUED, SENDING, SENT, TEMPORARILY_FAILED, PERMANENTLY_FAILED)
 *   - chatId: filter by specific chat ID
 *   - limit: pagination limit (default: 50, max: 500)
 *   - offset: pagination offset (default: 0)
 *   - sortBy: sort field (createdAt, sentAt, failureCount) (default: createdAt)
 *   - sortOrder: asc or desc (default: desc)
 */
export async function GET(request: NextRequest) {
  const session = await getEdgeSession(request);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const chatId = searchParams.get("chatId");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50"),
      500
    );
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    const totalCount = await getTelegramDeliveryCount(status, chatId);

    const deliveries = await getTelegramDeliveriesWithFilters(
      status,
      chatId,
      limit,
      offset,
      sortBy,
      sortOrder
    );

    const stats = await getTelegramDeliveryStatsByStatus(status, chatId);

    const statusCounts = {
      QUEUED: 0,
      SENDING: 0,
      SENT: 0,
      TEMPORARILY_FAILED: 0,
      PERMANENTLY_FAILED: 0,
    };

    stats.forEach((stat: any) => {
      statusCounts[stat.status as keyof typeof statusCounts] = stat.count;
    });

    // Calculate delivery rate
    const sentCount =
      statusCounts.SENT +
      statusCounts.TEMPORARILY_FAILED +
      statusCounts.PERMANENTLY_FAILED;
    const deliveryRate =
      sentCount > 0 ? ((statusCounts.SENT / sentCount) * 100).toFixed(2) : "0";

    return NextResponse.json({
      success: true,
      data: {
        pagination: {
          limit,
          offset,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
        statistics: {
          statusCounts,
          deliveryRate: `${deliveryRate}%`,
          totalProcessed: sentCount,
        },
        deliveries: deliveries.map((d: any) => ({
          id: d.id,
          notificationId: d.notificationId,
          chatId: d.chatId,
          messageId: d.messageId,
          status: d.status,
          errorType: d.errorType,
          errorCode: d.errorCode,
          errorMessage: d.errorMessage,
          failureCount: d.failureCount,
          sentAt: d.sentAt ? new Date(d.sentAt).toISOString() : null,
          lastAttemptAt: d.lastAttemptAt ? new Date(d.lastAttemptAt).toISOString() : null,
          nextRetryAt: d.nextRetryAt ? new Date(d.nextRetryAt).toISOString() : null,
          createdAt: new Date(d.createdAt).toISOString(),
          updatedAt: new Date(d.updatedAt).toISOString(),
          notification: d.notification,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching delivery status:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery status" },
      { status: 500 }
    );
  }
}

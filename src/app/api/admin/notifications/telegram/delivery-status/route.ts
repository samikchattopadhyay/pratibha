import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import { DeliveryStatus } from "@prisma/client";

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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as DeliveryStatus | null;
    const chatId = searchParams.get("chatId");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50"),
      500
    );
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: { status?: DeliveryStatus; chatId?: { contains: string } } = {};
    if (status) {
      where.status = status;
    }
    if (chatId) {
      where.chatId = { contains: chatId };
    }

    // Get total count
    const totalCount = await prisma.telegramMessageDelivery.count({ where });

    // Get deliveries
    const deliveries = await prisma.telegramMessageDelivery.findMany({
      where,
      include: {
        notification: {
          select: {
            id: true,
            type: true,
            title: true,
            body: true,
            userId: true,
            createdAt: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: sortOrder },
    });

    // Calculate statistics
    const stats = await prisma.telegramMessageDelivery.groupBy({
      by: ["status"],
      where,
      _count: true,
    });

    const statusCounts = {
      QUEUED: 0,
      SENDING: 0,
      SENT: 0,
      TEMPORARILY_FAILED: 0,
      PERMANENTLY_FAILED: 0,
    };

    stats.forEach((stat) => {
      statusCounts[stat.status as keyof typeof statusCounts] = stat._count;
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
        deliveries: deliveries.map((d) => ({
          id: d.id,
          notificationId: d.notificationId,
          chatId: d.chatId,
          messageId: d.messageId,
          status: d.status,
          errorType: d.errorType,
          errorCode: d.errorCode,
          errorMessage: d.errorMessage,
          failureCount: d.failureCount,
          sentAt: d.sentAt,
          lastAttemptAt: d.lastAttemptAt,
          nextRetryAt: d.nextRetryAt,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
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

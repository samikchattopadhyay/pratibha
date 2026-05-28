import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    // Fetch paginated notifications from the database
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    const mappedNotifications: NotificationItem[] = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      read: n.read,
      actionUrl: n.actionUrl || undefined,
      createdAt: n.createdAt.toISOString(),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      notifications: mappedNotifications,
      unreadCount,
      totalCount,
      page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const body = await request.json();
    const { id, markAll } = body;

    let updated = 0;

    if (markAll) {
      // Mark all unread notifications as read
      const result = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true, readAt: new Date() },
      });
      updated = result.count;
    } else if (id) {
      // Mark single notification as read
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }

      await prisma.notification.update({
        where: { id },
        data: { read: true, readAt: new Date() },
      });
      updated = 1;
    } else {
      return NextResponse.json(
        { error: "Either 'id' or 'markAll' must be provided" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
    }

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error("Notification delete error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import { NotificationChannel, NotificationType } from "@prisma/client";

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await prisma.notificationPreference.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Notification preferences fetch error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { type, channel, enabled } = body;

    if (!type || !channel) {
      return NextResponse.json(
        { error: "type and channel are required" },
        { status: 400 }
      );
    }

    // Validate channel is one of the allowed values
    if (!Object.values(NotificationChannel).includes(channel)) {
      return NextResponse.json(
        { error: `Invalid channel: ${channel}` },
        { status: 400 }
      );
    }

    // Validate type is one of the allowed values
    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type: ${type}` },
        { status: 400 }
      );
    }

    const preference = await prisma.notificationPreference.upsert({
      where: {
        userId_type_channel: {
          userId,
          type,
          channel,
        },
      },
      update: {
        enabled: enabled !== undefined ? enabled : true,
      },
      create: {
        userId,
        type,
        channel,
        enabled: enabled !== undefined ? enabled : true,
      },
    });

    return NextResponse.json({
      message: "Preference updated successfully",
      preference,
    });
  } catch (error) {
    console.error("Notification preference update error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

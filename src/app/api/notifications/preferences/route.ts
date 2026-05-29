import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getNotificationPreferencesByUserId,
  upsertNotificationPreference,
} from "@/lib/db/queries";

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

    const preferences = await getNotificationPreferencesByUserId(userId);

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

    // Validate channel and type are valid strings (simple validation)
    const validChannels = ["EMAIL", "TELEGRAM", "WHATSAPP"];
    const validTypes = [
      "REGISTRATION_CREATED",
      "PAYMENT_RECEIVED",
      "SCORING_REMINDER",
      "RESULT_DECLARED",
      "CERTIFICATE_GENERATED",
      "PRIZE_AWARDED",
    ];

    if (!validChannels.includes(channel)) {
      return NextResponse.json(
        { error: `Invalid channel: ${channel}` },
        { status: 400 }
      );
    }

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type: ${type}` },
        { status: 400 }
      );
    }

    const result = await upsertNotificationPreference({
      userId,
      type,
      channel,
      enabled: enabled !== undefined ? enabled : true,
    });

    const preference = result[0];

    return NextResponse.json({
      message: "Preference updated successfully",
      preference,
    });
  } catch (error) {
    console.error("Notification preference update error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

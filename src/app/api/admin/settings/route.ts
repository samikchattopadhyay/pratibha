import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";

// Temporary in-memory config store
const config = {
  whatsAppApiUrl: "https://api.whatsapp.com/v1/messages",
  razorpayWebhookSecret: "••••••••••••••••",
  fbScrapeIntervalMinutes: "30",
};

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    return NextResponse.json({ config });
  } catch {
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const body = await request.json();
    const { whatsAppApiUrl, fbScrapeIntervalMinutes } = body;

    if (whatsAppApiUrl) config.whatsAppApiUrl = whatsAppApiUrl;
    if (fbScrapeIntervalMinutes) config.fbScrapeIntervalMinutes = fbScrapeIntervalMinutes;

    return NextResponse.json({ message: "Configuration parameters persisted successfully", config });
  } catch {
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

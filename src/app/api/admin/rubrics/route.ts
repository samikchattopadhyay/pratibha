import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import defaultRubrics from "@/lib/rubric-defaults.json";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];
const SETTING_KEY = "rubric-defaults";

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const setting = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEY },
    });

    if (setting) {
      return NextResponse.json(setting.value);
    }

    return NextResponse.json(defaultRubrics);
  } catch (error) {
    console.error("Fetch rubrics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getEdgeSession(req);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const data = await req.json();
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    await prisma.systemSetting.upsert({
      where: { key: SETTING_KEY },
      update: { value: data },
      create: { key: SETTING_KEY, value: data },
    });

    return NextResponse.json({ success: true, message: "Rubrics saved successfully" });
  } catch (error) {
    console.error("Save rubrics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

// POST /api/admin/judges/verify — verify a judge and set their tier
export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { judgeId, tier } = body;

    if (!judgeId) return NextResponse.json({ error: "judgeId is required" }, { status: 400 });

    const validTiers = ["LOCAL", "REGIONAL", "NATIONAL", "EXPERT"];
    if (tier && !validTiers.includes(tier)) {
      return NextResponse.json({ error: "Invalid tier. Must be LOCAL, REGIONAL, NATIONAL, or EXPERT" }, { status: 400 });
    }

    const updated = await prisma.judge.update({
      where: { id: judgeId },
      data: {
        isVerified: true,
        ...(tier ? { tier } : {}),
      },
      select: { id: true, name: true, tier: true, isVerified: true },
    });

    return NextResponse.json({ message: `Judge ${updated.name} verified as ${updated.tier}`, judge: updated });
  } catch (error) {
    console.error("Judge verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

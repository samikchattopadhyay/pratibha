import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

// GET /api/admin/qualifications — all rules + slot stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const rules = await prisma.qualificationRule.findMany({
      include: {
        stateCompetition: { select: { id: true, title: true, scope: true } },
        nationalCompetition: { select: { id: true, title: true, scope: true, registrationDeadline: true } },
        slots: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = rules.map((rule) => ({
      id: rule.id,
      stateCompetitionId: rule.stateCompetitionId,
      stateCompetitionTitle: rule.stateCompetition.title,
      nationalCompetitionId: rule.nationalCompetitionId,
      nationalCompetitionTitle: rule.nationalCompetition.title,
      nationalRegistrationDeadline: rule.nationalCompetition.registrationDeadline,
      slotsPerCategory: rule.slotsPerCategory,
      wildCardSlots: rule.wildCardSlots,
      minScoreThreshold: rule.minScoreThreshold ? Number(rule.minScoreThreshold) : null,
      discountPercent: rule.discountPercent,
      slotExpiryDays: rule.slotExpiryDays,
      isActive: rule.isActive,
      slotStats: {
        total: rule.slots.length,
        offered: rule.slots.filter((s) => s.status === "OFFERED").length,
        accepted: rule.slots.filter((s) => s.status === "ACCEPTED").length,
        expired: rule.slots.filter((s) => s.status === "EXPIRED").length,
        declined: rule.slots.filter((s) => s.status === "DECLINED").length,
        wildCards: rule.slots.filter((s) => s.isWildCard).length,
        acceptanceRate: rule.slots.length > 0
          ? ((rule.slots.filter((s) => s.status === "ACCEPTED").length / rule.slots.length) * 100).toFixed(1) + "%"
          : "0%",
      },
    }));

    return NextResponse.json({ rules: formatted });
  } catch (error) {
    console.error("Qualifications GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/qualifications — create a qualification rule
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const {
      stateCompetitionId,
      nationalCompetitionId,
      slotsPerCategory = 3,
      wildCardSlots = 1,
      minScoreThreshold,
      discountPercent = 50,
      slotExpiryDays = 14,
    } = body;

    if (!stateCompetitionId || !nationalCompetitionId) {
      return NextResponse.json({ error: "Both stateCompetitionId and nationalCompetitionId are required" }, { status: 400 });
    }

    const [stateComp, nationalComp] = await Promise.all([
      prisma.competition.findUnique({ where: { id: stateCompetitionId }, select: { scope: true, resultDate: true } }),
      prisma.competition.findUnique({ where: { id: nationalCompetitionId }, select: { scope: true, registrationDeadline: true } }),
    ]);

    if (!stateComp || stateComp.scope !== "STATE") {
      return NextResponse.json({ error: "stateCompetitionId must reference a STATE-scope competition" }, { status: 400 });
    }
    if (!nationalComp || nationalComp.scope !== "NATIONAL") {
      return NextResponse.json({ error: "nationalCompetitionId must reference a NATIONAL-scope competition" }, { status: 400 });
    }
    if (stateComp.resultDate >= nationalComp.registrationDeadline) {
      return NextResponse.json({
        error: "State competition result date must be before national competition registration deadline",
      }, { status: 400 });
    }

    const rule = await prisma.qualificationRule.create({
      data: {
        stateCompetitionId,
        nationalCompetitionId,
        slotsPerCategory,
        wildCardSlots,
        minScoreThreshold: minScoreThreshold ? parseFloat(minScoreThreshold) : null,
        discountPercent,
        slotExpiryDays,
        isActive: true,
      },
    });

    return NextResponse.json({ message: "Qualification rule created", rule: { id: rule.id } });
  } catch (error) {
    console.error("Qualifications POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

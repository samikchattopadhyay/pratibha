import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { db } from "@/lib/db/drizzle";
import {
  getAllQualificationRules,
  createQualificationRule,
  getCompetitionById,
} from "@/lib/db/queries";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const rules = await getAllQualificationRules();

    const formatted = rules.map((rule: any) => ({
      id: rule.id,
      stateCompetitionId: rule.stateCompetitionId,
      stateCompetitionTitle: rule.stateCompetition.title,
      nationalCompetitionId: rule.nationalCompetitionId,
      nationalCompetitionTitle: rule.nationalCompetition.title,
      nationalRegistrationDeadline: rule.nationalCompetition.registrationDeadline,
      slotsPerCategory: rule.slotsPerCategory,
      wildCardSlots: rule.wildCardSlots,
      minScoreThreshold: rule.minScoreThreshold ? parseFloat(rule.minScoreThreshold.toString()) : null,
      discountPercent: rule.discountPercent,
      slotExpiryDays: rule.slotExpiryDays,
      isActive: rule.isActive,
      slotStats: {
        total: rule.slots.length,
        offered: rule.slots.filter((s: any) => s.status === "OFFERED").length,
        accepted: rule.slots.filter((s: any) => s.status === "ACCEPTED").length,
        expired: rule.slots.filter((s: any) => s.status === "EXPIRED").length,
        declined: rule.slots.filter((s: any) => s.status === "DECLINED").length,
        wildCards: rule.slots.filter((s: any) => s.isWildCard).length,
        acceptanceRate: rule.slots.length > 0
          ? ((rule.slots.filter((s: any) => s.status === "ACCEPTED").length / rule.slots.length) * 100).toFixed(1) + "%"
          : "0%",
      },
    }));

    return NextResponse.json({ rules: formatted });
  } catch (error) {
    console.error("Qualifications GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
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
      getCompetitionById(stateCompetitionId),
      getCompetitionById(nationalCompetitionId),
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

    const result = await createQualificationRule({
      stateCompetitionId,
      nationalCompetitionId,
      slotsPerCategory,
      wildCardSlots,
      minScoreThreshold: minScoreThreshold ? minScoreThreshold.toString() : null,
      discountPercent,
      slotExpiryDays,
      isActive: true,
    });

    return NextResponse.json({ message: "Qualification rule created", rule: { id: result[0].id } });
  } catch (error) {
    console.error("Qualifications POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

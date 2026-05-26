import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

import { JudgeTier } from "@prisma/client";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const tierFilter = searchParams.get("tier"); // LOCAL | REGIONAL | NATIONAL | EXPERT
    const competitionId = searchParams.get("competitionId"); // returns eligible judges only
    const verifiedOnly = searchParams.get("verified") === "true";

    // If competitionId given, find competition scope to determine eligible tiers
    let eligibleTiers: string[] | undefined;
    let competitionScope: string | null = null;
    let competitionStateList: string[] = [];

    if (competitionId) {
      const comp = await prisma.competition.findUnique({
        where: { id: competitionId },
        select: { scope: true, eligibleStates: true },
      });
      if (comp) {
        competitionScope = comp.scope;
        competitionStateList = comp.eligibleStates;
        // Plan 03: NATIONAL competitions require REGIONAL, NATIONAL, or EXPERT
        if (comp.scope === "NATIONAL") {
          eligibleTiers = ["REGIONAL", "NATIONAL", "EXPERT"];
        }
      }
    }

    const judges = await prisma.judge.findMany({
      where: {
        ...(tierFilter ? { tier: tierFilter as JudgeTier } : {}),
        ...(eligibleTiers ? { tier: { in: eligibleTiers as JudgeTier[] } } : {}),
        ...(verifiedOnly ? { isVerified: true } : {}),
        isAvailable: true,
      },
      include: {
        assignments: {
          include: { score: true },
        },
      },
      orderBy: [{ tier: "asc" }, { name: "asc" }],
    });

    const allSubmittedScores = await prisma.score.findMany({ select: { totalScore: true } });
    const globalAvg =
      allSubmittedScores.length > 0
        ? allSubmittedScores.reduce((acc, curr) => acc + curr.totalScore, 0) / allSubmittedScores.length
        : 75;

    const enriched = judges.map((j) => {
      const submitted = j.assignments.filter((a) => a.isSubmitted);
      const pending = j.assignments.length - submitted.length;
      const scores = submitted.map((a) => a.score?.totalScore).filter((s): s is number => s != null);
      const avgScoreVal = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const deviationPct = globalAvg > 0 ? ((avgScoreVal - globalAvg) / globalAvg) * 100 : 0;
      const isOutlier = Math.abs(deviationPct) > 15 && scores.length >= 3;

      // Plan 03 — conflict of interest detection for state competitions
      let hasConflict = false;
      let conflictReason = "";
      if (competitionScope === "STATE" && j.stateOfResidence && competitionStateList.includes(j.stateOfResidence)) {
        hasConflict = true;
        conflictReason = `Judge resides in ${j.stateOfResidence}, which is in this competition's eligible states`;
      }

      return {
        id: j.id,
        name: j.name,
        specializations: j.specializations,
        profileImageUrl: j.profileImageUrl,
        // Plan 03 — new fields
        tier: j.tier,
        bio: j.bio,
        credentials: j.credentials,
        stateOfResidence: j.stateOfResidence,
        yearsOfExperience: j.yearsOfExperience,
        isVerified: j.isVerified,
        isAvailable: j.isAvailable,
        // Stats
        evaluationCount: submitted.length,
        pendingCount: pending,
        averageScore: avgScoreVal > 0 ? avgScoreVal.toFixed(1) : "N/A",
        isOutlier,
        deviationPercentage: deviationPct.toFixed(1),
        // Conflict
        hasConflict,
        conflictReason,
      };
    });

    return NextResponse.json({ judges: enriched });
  } catch (error) {
    console.error("Admin judges fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

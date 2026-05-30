import { NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getJudgeWithAssignmentsAndPayouts,
  getAveragePeerScore,
} from "@/lib/db/queries";
import { getJudgeRate } from "@/lib/constants";

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;

    const judge = await getJudgeWithAssignmentsAndPayouts(userId!);

    if (!judge) {
      return NextResponse.json({ error: "Judge profile not found" }, { status: 404 });
    }

    const assignments = judge.assignments;
    const completedAssignments = assignments.filter((asg: any) => asg.isSubmitted);
    const pendingAssignmentsCount = assignments.length - completedAssignments.length;

    let totalUnpaidEarnings = 0;
    let totalEarnings = 0;

    completedAssignments.forEach((asg: any) => {
      const scope = asg.registration.competitionCategory.competition.scope as "STATE" | "NATIONAL";
      const rate = getJudgeRate(judge.tier, scope);
      totalEarnings += rate;
    });

    const totalPaidPayouts = judge.payouts
      .filter((p: any) => p.status === "PAID")
      .reduce((sum: number, p: any) => sum + parseFloat(String(p.amount)), 0);

    totalUnpaidEarnings = Math.max(0, totalEarnings - totalPaidPayouts);

    const judgeAverageScore = judge.averageScoreGiven ? parseFloat(String(judge.averageScoreGiven)) : null;

    const categoryIdsEvaluated = Array.from(
      new Set(
        completedAssignments.map((asg: any) => asg.registration.competitionCategory.categoryId)
      )
    ) as string[];

    const peerAverageScoreStr = await getAveragePeerScore(categoryIdsEvaluated);
    const peerAverageScore = peerAverageScoreStr ? parseFloat(peerAverageScoreStr) : null;

    // Workload category distribution counts
    const categoryCounts: Record<string, number> = {};
    assignments.forEach((asg: any) => {
      const name = asg.registration.competitionCategory.category.name;
      categoryCounts[name] = (categoryCounts[name] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([name, count]: any) => ({
      name,
      count,
    }));

    return NextResponse.json({
      metrics: {
        pendingCount: pendingAssignmentsCount,
        completedCount: completedAssignments.length,
        lifetimeCount: judge.totalEvaluations,
        totalEarnings,
        totalPaidPayouts,
        pendingPayoutBalance: totalUnpaidEarnings,
        judgeAverageScore,
        peerAverageScore,
      },
      categoryDistribution,
    });
  } catch (error) {
    console.error("Judge analytics API failure:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

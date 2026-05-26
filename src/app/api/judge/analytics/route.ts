import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getJudgeRate } from "@/lib/constants";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;

    // Get judge profile
    const judge = await prisma.judge.findUnique({
      where: { userId },
      include: {
        assignments: {
          include: {
            registration: {
              include: {
                competitionCategory: {
                  include: {
                    competition: true,
                    category: true,
                  },
                },
              },
            },
            score: true,
          },
        },
        payouts: true,
      },
    });

    if (!judge) {
      return NextResponse.json({ error: "Judge profile not found" }, { status: 404 });
    }

    const assignments = judge.assignments;
    const completedAssignments = assignments.filter((asg) => asg.isSubmitted);
    const pendingAssignmentsCount = assignments.length - completedAssignments.length;

    // Calculate dynamic earnings based on Plan 07 rate matrix
    let totalUnpaidEarnings = 0;
    let totalEarnings = 0;

    // Dynamic sum of completed evaluations mapped to their specific competition scope rates
    completedAssignments.forEach((asg) => {
      const scope = asg.registration.competitionCategory.competition.scope as "STATE" | "NATIONAL";
      const rate = getJudgeRate(judge.tier, scope);
      totalEarnings += rate;
    });

    // Substract paid payouts to get pending balance
    const totalPaidPayouts = judge.payouts
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    totalUnpaidEarnings = Math.max(0, totalEarnings - totalPaidPayouts);

    // Calculate average score given vs category global average
    const judgeAverageScore = judge.averageScoreGiven ? Number(judge.averageScoreGiven) : null;
    
    // Get list of category IDs this judge evaluated
    const categoryIdsEvaluated = Array.from(
      new Set(
        completedAssignments.map((asg) => asg.registration.competitionCategory.categoryId)
      )
    );

    let peerAverageScore = null;
    if (categoryIdsEvaluated.length > 0) {
      const peerScores = await prisma.score.aggregate({
        where: {
          assignment: {
            registration: {
              competitionCategory: {
                categoryId: { in: categoryIdsEvaluated },
              },
            },
          },
        },
        _avg: {
          totalScore: true,
        },
      });
      peerAverageScore = peerScores._avg.totalScore ? Number(peerScores._avg.totalScore.toFixed(2)) : null;
    }

    // Workload category distribution counts
    const categoryCounts: Record<string, number> = {};
    assignments.forEach((asg) => {
      const name = asg.registration.competitionCategory.category.name;
      categoryCounts[name] = (categoryCounts[name] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([name, count]) => ({
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

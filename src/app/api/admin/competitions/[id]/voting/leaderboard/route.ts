import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getEdgeSession(_);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customUser = session.user as { role?: string };
    if (customUser.role !== "SUPER_ADMIN" && customUser.role !== "MODERATOR") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id: competitionId } = await params;

    // Get current leaderboard with average scores
    const leaderboard = await prisma.registration.findMany({
      where: {
        competitionCategory: { competitionId },
        judgeAssignments: {
          some: {
            score: { isNot: null },
          },
        },
      },
      select: {
        id: true,
        student: { select: { name: true } },
        competitionCategory: {
          select: { category: { select: { name: true } } },
        },
        judgeAssignments: {
          where: { score: { isNot: null } },
          select: { score: { select: { totalScore: true } } },
        },
      },
    });

    const leaderboardData = leaderboard
      .map((reg) => {
        const scores = reg.judgeAssignments
          .map((ja) => ja.score?.totalScore ?? 0)
          .filter((s) => s >= 0); // Include all scores, even 0
        const avgScore =
          scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

        return {
          registrationId: reg.id,
          participantName: reg.student.name,
          categoryName: reg.competitionCategory.category.name,
          scoresReceived: scores.length,
          averageScore: Math.round(avgScore * 100) / 100,
          totalScore: Math.round(scores.reduce((a, b) => a + b, 0)),
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10); // Top 10

    return NextResponse.json({ data: leaderboardData });
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

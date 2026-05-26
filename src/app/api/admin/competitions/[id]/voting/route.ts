import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
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
    const url = new URL(_?.url || "");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Get all judges assigned to this competition
    const judgesData = await prisma.competitionJudge.findMany({
      where: { competitionId },
      select: {
        judge: {
          select: {
            id: true,
            name: true,
            tier: true,
            assignments: {
              where: {
                registration: {
                  competitionCategory: { competitionId },
                },
              },
              select: { isSubmitted: true, score: { select: { totalScore: true } } },
            },
          },
        },
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.competitionJudge.count({
      where: { competitionId },
    });
    const totalPages = Math.ceil(totalCount / limit);

    const votingData = judgesData.map((cj) => {
      const assignments = cj.judge.assignments;
      const submitted = assignments.filter((a) => a.isSubmitted);
      const scores = submitted.map((a) => a.score?.totalScore ?? 0);
      const averageScore =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : undefined;

      return {
        judgeId: cj.judge.id,
        judgeName: cj.judge.name,
        tier: cj.judge.tier,
        assignmentCount: assignments.length,
        submittedCount: submitted.length,
        averageScore: averageScore ? Math.round(averageScore * 10) / 10 : undefined,
        isOutlier: false,
        completionPercentage:
          assignments.length > 0
            ? Math.round((submitted.length / assignments.length) * 100)
            : 0,
      };
    });

    return NextResponse.json({
      data: votingData,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error("Failed to fetch voting data:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

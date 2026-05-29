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

    // Get recent score submissions (last 20)
    const recentScores = await prisma.score.findMany({
      where: {
        assignment: {
          registration: {
            competitionCategory: { competitionId },
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        criteria1: true,
        criteria2: true,
        criteria3: true,
        criteria4: true,
        totalScore: true,
        assignment: {
          select: {
            judge: { select: { id: true, name: true } },
            registration: {
              select: {
                id: true,
                student: { select: { name: true } },
                competitionCategory: {
                  select: { category: { select: { name: true } } },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const activityFeed = recentScores.map((score) => ({
      id: score.id,
      judgeId: score.assignment.judge.id,
      judgeName: score.assignment.judge.name,
      participantName: score.assignment.registration.student.name,
      categoryName: score.assignment.registration.competitionCategory.category.name,
      scores: {
        criteria1: score.criteria1,
        criteria2: score.criteria2,
        criteria3: score.criteria3,
        criteria4: score.criteria4,
        total: score.totalScore,
      },
      submittedAt: score.createdAt,
    }));

    return NextResponse.json({ data: activityFeed });
  } catch (err) {
    console.error("Failed to fetch voting activity:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

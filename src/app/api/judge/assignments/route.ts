import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;

    // Get judge profile linked to user ID
    const judge = await prisma.judge.findUnique({
      where: { userId },
    });

    if (!judge) {
      return NextResponse.json({ error: "Judge profile not found" }, { status: 404 });
    }

    // Parse pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(limit, 100)); // Cap at 100 per page
    const skip = (validPage - 1) * validLimit;

    // Get total count of assignments
    const totalCount = await prisma.judgeAssignment.count({
      where: { judgeId: judge.id },
    });

    // Get paginated assignments
    const assignments = await prisma.judgeAssignment.findMany({
      where: { judgeId: judge.id },
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
      orderBy: { assignedAt: "desc" },
      skip,
      take: validLimit,
    });

    const formatted = assignments.map((asg) => ({
      id: asg.id,
      registrationId: asg.registration.registrationId, // Blinded Roll ID only
      competitionTitle: asg.registration.competitionCategory.competition.title,
      categoryName: asg.registration.competitionCategory.category.name,
      fbPostUrl: asg.registration.fbPostUrl,
      isSubmitted: asg.isSubmitted,
      assignedAt: asg.assignedAt,
      submittedAt: asg.submittedAt,
      scope: asg.registration.competitionCategory.competition.scope,
      score: asg.score
        ? {
            criteria1: asg.score.criteria1,
            criteria2: asg.score.criteria2,
            criteria3: asg.score.criteria3,
            criteria4: asg.score.criteria4 || undefined,
            totalScore: asg.score.totalScore,
            remarks: asg.score.remarks,
          }
        : null,
    }));

    const totalPages = Math.ceil(totalCount / validLimit);

    return NextResponse.json({
      assignments: formatted,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalCount,
        limit: validLimit,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1,
      },
    });
  } catch (error) {
    console.error("Judge assignments fetch error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

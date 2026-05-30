import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getJudgeByUserId,
  getJudgeAssignmentsPaginated,
} from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;

    const judge = await getJudgeByUserId(userId!);

    if (!judge) {
      return NextResponse.json({ error: "Judge profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(limit, 100));
    const skip = (validPage - 1) * validLimit;

    const { assignments, totalCount } = await getJudgeAssignmentsPaginated(
      judge.id,
      validLimit,
      skip
    );

    const formatted = assignments.map((asg: any) => ({
      id: asg.id,
      registrationId: asg.registration.registrationId,
      competitionTitle: asg.registration.competitionCategory.competition.title,
      categoryName: asg.registration.competitionCategory.category.name,
      fbPostUrl: asg.registration.fbPostUrl,
      isSubmitted: asg.isSubmitted,
      assignedAt: new Date(asg.assignedAt).toISOString(),
      submittedAt: asg.submittedAt ? new Date(asg.submittedAt).toISOString() : null,
      scope: asg.registration.competitionCategory.competition.scope,
      score: asg.score
        ? {
            criteria1: asg.score.criteria1 ? parseFloat(String(asg.score.criteria1)) : null,
            criteria2: asg.score.criteria2 ? parseFloat(String(asg.score.criteria2)) : null,
            criteria3: asg.score.criteria3 ? parseFloat(String(asg.score.criteria3)) : null,
            criteria4: asg.score.criteria4 ? parseFloat(String(asg.score.criteria4)) : undefined,
            totalScore: parseFloat(String(asg.score.totalScore)),
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

import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { getStudentCompetitionsPaginated } from "@/lib/db/queries";
import type { PaginatedResponse, StudentRegistrationEntry } from "@/types/student-details";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const filter = searchParams.get("filter") || "ALL";

    const { registrations, totalCount } = await getStudentCompetitionsPaginated(
      id,
      filter,
      limit,
      (page - 1) * limit
    );

    const formatted: StudentRegistrationEntry[] = registrations.map((reg: any) => ({
      id: reg.id,
      registrationId: reg.registrationId,
      competitionTitle: reg.competitionCategory.competition.title,
      competitionId: reg.competitionCategory.competition.id,
      categoryName: reg.competitionCategory.category.name,
      categoryId: reg.competitionCategory.category.id,
      status: reg.status as "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "DISQUALIFIED",
      paymentStatus: reg.paymentStatus as "PENDING" | "SUCCESS" | "FAILED",
      finalScore: reg.finalScore ? parseFloat(String(reg.finalScore)) : null,
      finalRank: reg.finalRank,
      fbPostUrl: reg.fbPostUrl,
      scoringFinalized: reg.scoringFinalized,
      createdAt: new Date(reg.createdAt).toISOString(),
      judgeAssignments: reg.judgeAssignments.map(({ judge, score }: any) => ({
        judgeName: judge.name,
        score: score ? parseFloat(String(score.totalScore)) : null,
      })),
      certificateId: reg.prizeAward?.id,
    }));

    const response: PaginatedResponse<StudentRegistrationEntry> = {
      data: formatted,
      total: totalCount,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Student competitions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

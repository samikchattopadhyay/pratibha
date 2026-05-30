import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { getCompetitionParticipantsPaginated } from "@/lib/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getEdgeSession(request);
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
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const filter = url.searchParams.get("filter") || "ALL";
    const search = url.searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const { registrations, totalCount } = await getCompetitionParticipantsPaginated({
      competitionId,
      limit,
      offset: skip,
      filter,
      search,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: registrations.map((reg: any) => ({
        id: reg.id,
        registrationId: reg.registrationId,
        studentName: reg.student.name,
        categoryName: reg.competitionCategory.category.name,
        status: reg.status,
        paymentStatus: reg.paymentStatus,
        assignedJudges: reg.judgeAssignments.map((ja: any) => ({
          id: ja.judge.id,
          name: ja.judge.name,
          score: ja.score?.totalScore ?? null,
        })),
        createdAt: reg.createdAt.toISOString(),
      })),
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error("Failed to fetch participants:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

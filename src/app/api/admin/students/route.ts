import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { getStudentsForAdminList } from "@/lib/db/queries";
import type { PaginatedResponse, StudentSummary } from "@/types/student-details";

export async function GET(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const search = searchParams.get("search") || "";
    const filter = (searchParams.get("filter") || "ALL") as "ALL" | "HAS_AWARDS" | "PENDING_PAYMENT";

    const { students, totalCount } = await getStudentsForAdminList({
      limit,
      offset: (page - 1) * limit,
      search,
      filter,
    });

    const formatted: StudentSummary[] = students.map((student: any) => ({
      id: student.id,
      name: student.name,
      parentName: student.parent.name,
      competitionCount: student.registrations.length,
      awardCount: student.registrations.filter((reg: any) => reg.prizeAward).length,
      lastRegistrationDate: student.registrations[0]?.createdAt.toISOString() || null,
    }));

    const response: PaginatedResponse<StudentSummary> = {
      data: formatted,
      total: totalCount,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin students fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

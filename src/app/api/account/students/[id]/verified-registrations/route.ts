import { getEdgeSession } from "@/lib/auth-helper";
import {
  getStudentWithParentUser,
  getVerifiedRegistrationsByStudentId,
} from "@/lib/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getEdgeSession(request);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: studentId } = await params;

  // Verify ownership: parent owns the student
  const student = await getStudentWithParentUser(studentId);

  const sessionUserId = (session.user as { id: string }).id;
  if (!student || student.parent.userId !== sessionUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get all verified registrations for this student
  const registrations = await getVerifiedRegistrationsByStudentId(studentId);

  const formattedRegistrations = registrations.map((reg) => ({
    id: reg.id,
    competitionTitle: reg.competitionCategory.competition.title,
    categoryName: reg.competitionCategory.category.name,
    competitionStartDate: reg.competitionCategory.competition.startDate.toISOString(),
    prizeRank: reg.prizeAward?.rank || null,
    isFeatured: reg.isFeatured,
    isHidden: reg.isHidden,
  }));

  return NextResponse.json(formattedRegistrations);
}

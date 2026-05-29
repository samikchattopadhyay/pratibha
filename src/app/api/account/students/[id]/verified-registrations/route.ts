import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
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
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      parent: {
        select: {
          user: {
            select: { id: true },
          },
        },
      },
    },
  });

  const sessionUserId = (session.user as { id: string }).id;
  if (!student || student.parent.user.id !== sessionUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get all verified registrations for this student
  const registrations = await prisma.registration.findMany({
    where: {
      studentId,
      status: "VERIFIED",
    },
    select: {
      id: true,
      competitionCategory: {
        select: {
          competition: {
            select: {
              title: true,
              startDate: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      },
      prizeAward: {
        select: {
          rank: true,
        },
      },
      isFeatured: true,
      isHidden: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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

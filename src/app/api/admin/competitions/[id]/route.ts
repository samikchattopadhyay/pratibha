import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Internal API endpoint called from server component - no session check needed
    // Authorization will be enforced at the page level

    const { id: competitionId } = await params;

    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: {
        id: true,
        title: true,
        scope: true,
        bannerUrl: true,
        isActive: true,
        registrationDeadline: true,
        startDate: true,
        endDate: true,
        categories: {
          select: { id: true },
        },
        assignedJudges: {
          select: { id: true },
        },
      },
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    const categoryNames = await prisma.competitionCategory.findMany({
      where: { competitionId },
      select: { category: { select: { name: true } } },
      take: 1,
    });

    return NextResponse.json({
      id: competition.id,
      title: competition.title,
      scope: competition.scope,
      category: categoryNames[0]?.category.name || "Unknown",
      bannerUrl: competition.bannerUrl,
      isActive: competition.isActive,
      registrationDeadline: competition.registrationDeadline.toISOString(),
      startDate: competition.startDate.toISOString(),
      endDate: competition.endDate.toISOString(),
      totalParticipants: competition.categories.length,
      totalJudges: competition.assignedJudges.length,
    });
  } catch (err) {
    console.error("Failed to fetch competition metadata:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

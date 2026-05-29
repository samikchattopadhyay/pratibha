import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: competitionId } = await params;

    const competition = await db.query.competitions.findFirst({
      where: eq(schema.competitions.id, competitionId),
      columns: {
        id: true,
        title: true,
        scope: true,
        bannerUrl: true,
        isActive: true,
        registrationDeadline: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    const registrationResults = await db
      .select({ count: schema.registrations.id })
      .from(schema.registrations)
      .innerJoin(schema.competitionCategories, eq(schema.registrations.competitionCategoryId, schema.competitionCategories.id))
      .where(eq(schema.competitionCategories.competitionId, competitionId));
    const totalParticipants = registrationResults.length;

    const judgeResults = await db
      .select({ count: schema.competitionJudges.id })
      .from(schema.competitionJudges)
      .where(eq(schema.competitionJudges.competitionId, competitionId));
    const totalJudges = judgeResults.length;

    const categoryResults = await db.query.competitionCategories.findMany({
      where: eq(schema.competitionCategories.competitionId, competitionId),
      with: {
        category: {
          columns: { name: true },
        },
      },
      limit: 1,
    });

    return NextResponse.json({
      id: competition.id,
      title: competition.title,
      scope: competition.scope,
      category: categoryResults[0]?.category.name || "Unknown",
      bannerUrl: competition.bannerUrl,
      isActive: competition.isActive,
      registrationDeadline: competition.registrationDeadline.toISOString(),
      startDate: competition.startDate.toISOString(),
      endDate: competition.endDate.toISOString(),
      totalParticipants,
      totalJudges,
    });
  } catch (err) {
    console.error("Failed to fetch competition metadata:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

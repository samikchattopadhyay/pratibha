import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/prizes/[competitionId] — public prize pool display
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  try {
    const { competitionId } = await params;

    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: {
        id: true,
        title: true,
        scope: true,
        prizePool: {
          include: {
            items: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!competition) return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    if (!competition.prizePool || !competition.prizePool.isPublished) {
      return NextResponse.json({ prizePool: null, message: "Prize pool not yet announced" });
    }

    return NextResponse.json({
      competitionTitle: competition.title,
      competitionScope: competition.scope,
      prizePool: {
        title: competition.prizePool.title,
        description: competition.prizePool.description,
        items: competition.prizePool.items.map((item) => ({
          id: item.id,
          rank: item.rank,
          type: item.type,
          title: item.title,
          description: item.description,
          estimatedValue: item.estimatedValue ? Number(item.estimatedValue) : null,
          isPhysical: item.isPhysical,
          imageUrl: item.imageUrl,
          perCategory: item.perCategory,
        })),
      },
    });
  } catch (error) {
    console.error("Public prizes fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

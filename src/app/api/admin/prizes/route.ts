import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getAllPrizePools,
  getPrizePoolByCompetitionId,
  createPrizePoolWithItems,
  getCompetitionById,
} from "@/lib/db/queries";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const prizePools = await getAllPrizePools();

    const formatted = prizePools.map((pool) => ({
      id: pool.id,
      competitionId: pool.competitionId,
      competitionTitle: pool.competition.title,
      competitionScope: pool.competition.scope,
      title: pool.title,
      description: pool.description,
      isPublished: pool.isPublished,
      itemCount: pool.items.length,
      awardedCount: pool.items.reduce((sum, item) => sum + item.awards.length, 0),
      items: pool.items.map((item) => ({
        id: item.id,
        rank: item.rank,
        type: item.type,
        title: item.title,
        description: item.description,
        estimatedValue: item.estimatedValue ? parseFloat(item.estimatedValue.toString()) : null,
        isPhysical: item.isPhysical,
        imageUrl: item.imageUrl,
        perCategory: item.perCategory,
        awardsCount: item.awards.length,
      })),
    }));

    return NextResponse.json({ prizePools: formatted });
  } catch (error) {
    console.error("Admin prizes GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { competitionId, title, description, items } = body;

    if (!competitionId || !title) {
      return NextResponse.json({ error: "competitionId and title are required" }, { status: 400 });
    }

    const competition = await getCompetitionById(competitionId);
    if (!competition) return NextResponse.json({ error: "Competition not found" }, { status: 404 });

    const existing = await getPrizePoolByCompetitionId(competitionId);
    if (existing) {
      return NextResponse.json({ error: "A prize pool already exists for this competition. Use PATCH to update." }, { status: 409 });
    }

    const prizePool = await createPrizePoolWithItems({
      competitionId,
      title,
      description: description || null,
      isPublished: false,
      items: (items || []).map((item: any) => ({
        rank: item.rank,
        type: item.type,
        title: item.title,
        description: item.description || null,
        estimatedValue: item.estimatedValue ? item.estimatedValue.toString() : null,
        isPhysical: item.isPhysical ?? false,
        imageUrl: item.imageUrl || null,
        perCategory: item.perCategory ?? false,
      })),
    });

    return NextResponse.json({
      message: "Prize pool created successfully",
      prizePool: { id: prizePool.id, title: prizePool.title, itemCount: items?.length ?? 0 },
    });
  } catch (error) {
    console.error("Admin prizes POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

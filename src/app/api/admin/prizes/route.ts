import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

import { PrizeRank } from "@prisma/client";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

// GET /api/admin/prizes — all prize pools with items
export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const prizePools = await prisma.prizePool.findMany({
      include: {
        competition: { select: { id: true, title: true, scope: true } },
        items: {
          include: {
            awards: { select: { id: true, registrationId: true, rank: true, isDispatched: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

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
        estimatedValue: item.estimatedValue ? Number(item.estimatedValue) : null,
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

// POST /api/admin/prizes — create a prize pool for a competition
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

    const competition = await prisma.competition.findUnique({ where: { id: competitionId } });
    if (!competition) return NextResponse.json({ error: "Competition not found" }, { status: 404 });

    // Check if a prize pool already exists
    const existing = await prisma.prizePool.findUnique({ where: { competitionId } });
    if (existing) {
      return NextResponse.json({ error: "A prize pool already exists for this competition. Use PATCH to update." }, { status: 409 });
    }

    const prizePool = await prisma.prizePool.create({
      data: {
        competitionId,
        title,
        description: description || null,
        isPublished: false,
        items: {
          create: (items || []).map((item: { rank: PrizeRank; type: string; title: string; description?: string; estimatedValue?: string; isPhysical?: boolean; imageUrl?: string; perCategory?: boolean }) => ({
            rank: item.rank,
            type: item.type,
            title: item.title,
            description: item.description || null,
            estimatedValue: item.estimatedValue ? parseFloat(item.estimatedValue) : null,
            isPhysical: item.isPhysical ?? false,
            imageUrl: item.imageUrl || null,
            perCategory: item.perCategory ?? false,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({
      message: "Prize pool created successfully",
      prizePool: { id: prizePool.id, title: prizePool.title, itemCount: prizePool.items.length },
    });
  } catch (error) {
    console.error("Admin prizes POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

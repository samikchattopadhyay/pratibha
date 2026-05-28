import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

function requireAdmin(role: string) {
  return ADMIN_ROLES.includes(role);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!requireAdmin(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));

    const [totalCount, competitions] = await prisma.$transaction([
      prisma.competition.count(),
      prisma.competition.findMany({
        include: {
          categories: { include: { category: true } },
          prizePool: { select: { id: true, isPublished: true, items: { select: { rank: true, type: true, title: true } } } },
          panelRequirement: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formatted = competitions.map((comp) => ({
      id: comp.id,
      title: comp.title,
      description: comp.description,
      bannerUrl: comp.bannerUrl,
      entryFeeINR: comp.entryFeeINR.toString(),
      startDate: comp.startDate,
      endDate: comp.endDate,
      registrationDeadline: comp.registrationDeadline,
      resultDate: comp.resultDate,
      isActive: comp.isActive,
      scope: comp.scope,
      eligibleStates: comp.eligibleStates,
      hostState: comp.hostState,
      difficultyLevel: comp.difficultyLevel,
      minJudgesRequired: comp.minJudgesRequired,
      categories: comp.categories.map((c) => c.category.name).join(", "),
      prizePool: comp.prizePool
        ? { id: comp.prizePool.id, isPublished: comp.prizePool.isPublished, itemCount: comp.prizePool.items.length }
        : null,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      competitions: formatted,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Admin competitions fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!requireAdmin(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const {
      title,
      description,
      entryFeeINR,
      categoryId,
      categoryName,
      bannerUrl,
      // Plan 01 — geographic scope
      scope = "STATE",
      eligibleStates = [],
      hostState,
      difficultyLevel,
      minJudgesRequired,
      startDate: startDateInput,
      endDate: endDateInput,
      registrationDeadline: regDeadlineInput,
      resultDate: resultDateInput,
      // Wizard fields
      rules,
      facebookGroupUrl,
      capacity,
      criteriaConfig,
      minAge = 4,
      maxAge = 18,
      language,
      judgeIds = [],
      prizes = [],
    } = body;

    if (!title) return NextResponse.json({ error: "Competition title is required" }, { status: 400 });
    if (!minAge || !maxAge) return NextResponse.json({ error: "Age group is required" }, { status: 400 });

    // Plan 01 — scope-based validation
    if (scope === "STATE" && (!eligibleStates || eligibleStates.length === 0)) {
      return NextResponse.json({ error: "State-level competitions must specify eligible states" }, { status: 400 });
    }

    if (scope === "NATIONAL" && eligibleStates && eligibleStates.length > 0) {
      return NextResponse.json({ error: "National competitions are open to all states — do not restrict eligibleStates" }, { status: 400 });
    }

    // Plan 01 — auto-set difficulty + min judges by scope
    const resolvedDifficulty = difficultyLevel ?? (scope === "NATIONAL" ? 3 : 1);
    const resolvedMinJudges = minJudgesRequired ?? (scope === "NATIONAL" ? 5 : 2);

    // Resolve category by ID or name
    let dbCategory;
    if (categoryId) {
      dbCategory = await prisma.category.findUnique({
        where: { id: categoryId },
      });
    } else if (categoryName) {
      dbCategory = await prisma.category.findFirst({
        where: { name: { equals: categoryName, mode: "insensitive" } },
      });
    }

    if (!dbCategory) {
      return NextResponse.json({ error: `Category not found` }, { status: 404 });
    }

    const now = new Date();
    const startDate = startDateInput ? new Date(startDateInput) : new Date(now);
    const endDate = endDateInput ? new Date(endDateInput) : new Date(now.getTime() + 30 * 86400000);
    const registrationDeadline = regDeadlineInput ? new Date(regDeadlineInput) : new Date(now.getTime() + 20 * 86400000);
    const resultDate = resultDateInput ? new Date(resultDateInput) : new Date(now.getTime() + 45 * 86400000);

    const competition = await prisma.$transaction(async (tx) => {
      // Create competition with all wizard fields
      const comp = await tx.competition.create({
        data: {
          title,
          description: description || `Pratibha Parishad Fine Arts Competition: ${title}`,
          bannerUrl: bannerUrl || null,
          entryFeeINR: parseFloat(entryFeeINR || "50"),
          startDate,
          endDate,
          registrationDeadline,
          resultDate,
          isActive: true,
          // Plan 01
          scope,
          eligibleStates: scope === "NATIONAL" ? [] : eligibleStates,
          hostState: scope === "STATE" ? (hostState || null) : null,
          difficultyLevel: resolvedDifficulty,
          minJudgesRequired: resolvedMinJudges,
          // Wizard fields
          rules: rules || null,
          facebookGroupUrl: facebookGroupUrl || null,
          capacity: capacity || null,
          criteriaConfig: criteriaConfig || null,
          categories: {
            create: { categoryId: dbCategory.id, minAge, maxAge, language: language || null },
          },
          // Plan 03 — auto-create panel requirement
          panelRequirement: {
            create: {
              minJudges: resolvedMinJudges,
              minNationalTierJudges: scope === "NATIONAL" ? 3 : 0,
              requireCrossCategory: false,
            },
          },
        },
        include: {
          categories: { include: { category: true } },
        },
      });

      // Assign judges if provided
      if (judgeIds && judgeIds.length > 0) {
        await tx.competitionJudge.createMany({
          data: judgeIds.map((judgeId: string) => ({
            competitionId: comp.id,
            judgeId,
          })),
          skipDuplicates: true,
        });
      }

      // Create prize pool and items if provided
      if (prizes && prizes.length > 0) {
        const pool = await tx.prizePool.create({
          data: {
            competitionId: comp.id,
            title: `${comp.title} - Prize Pool`,
            description: "Prize pool for competition winners",
            isPublished: false,
          },
        });

        await tx.prizeItem.createMany({
          data: prizes.map((prize: { rank: string; type: string; title?: string; description?: string; estimatedValue?: string }) => ({
            prizePoolId: pool.id,
            rank: prize.rank,
            type: prize.type,
            title: prize.title || `${prize.rank} Prize`,
            description: prize.description || null,
            estimatedValue: prize.estimatedValue ? parseFloat(prize.estimatedValue) : null,
            isPhysical: prize.type === "PHYSICAL_MEDAL" || prize.type === "PHYSICAL_TROPHY",
          })),
        });
      }

      return comp;
    });

    return NextResponse.json({
      message: "Competition created successfully",
      competition: {
        id: competition.id,
        title: competition.title,
        scope: competition.scope,
        isActive: competition.isActive,
        categories: competition.categories.map((c) => c.category.name).join(", "),
      },
    });
  } catch (error) {
    console.error("Admin competition create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

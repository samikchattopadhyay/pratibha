import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { db } from "@/lib/db/drizzle";
import {
  getCompetitionCount,
  getCompetitionsPaginated,
  getCategoryById,
} from "@/lib/db/queries";
import * as schema from "@/lib/db/schema";

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

    const totalCount = await getCompetitionCount();
    const competitions = await getCompetitionsPaginated(limit, (page - 1) * limit);

    const formatted = competitions.map((comp: any) => ({
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
      categories: comp.categories.map((c: any) => c.category.name).join(", "),
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
      scope = "STATE",
      eligibleStates = [],
      hostState,
      difficultyLevel,
      minJudgesRequired,
      startDate: startDateInput,
      endDate: endDateInput,
      registrationDeadline: regDeadlineInput,
      resultDate: resultDateInput,
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

    if (scope === "STATE" && (!eligibleStates || eligibleStates.length === 0)) {
      return NextResponse.json({ error: "State-level competitions must specify eligible states" }, { status: 400 });
    }

    if (scope === "NATIONAL" && eligibleStates && eligibleStates.length > 0) {
      return NextResponse.json({ error: "National competitions are open to all states — do not restrict eligibleStates" }, { status: 400 });
    }

    const resolvedDifficulty = difficultyLevel ?? (scope === "NATIONAL" ? 3 : 1);
    const resolvedMinJudges = minJudgesRequired ?? (scope === "NATIONAL" ? 5 : 2);

    let dbCategory;
    if (categoryId) {
      dbCategory = await getCategoryById(categoryId);
    } else if (categoryName) {
      // Find by name with case-insensitive search
      const allCategories = await db.query.categories.findMany();
      dbCategory = allCategories.find((c: any) => c.name.toLowerCase() === categoryName.toLowerCase());
    }

    if (!dbCategory) {
      return NextResponse.json({ error: `Category not found` }, { status: 404 });
    }

    const now = new Date();
    const startDate = startDateInput ? new Date(startDateInput) : new Date(now);
    const endDate = endDateInput ? new Date(endDateInput) : new Date(now.getTime() + 30 * 86400000);
    const registrationDeadline = regDeadlineInput ? new Date(regDeadlineInput) : new Date(now.getTime() + 20 * 86400000);
    const resultDate = resultDateInput ? new Date(resultDateInput) : new Date(now.getTime() + 45 * 86400000);

    const competition = await db.transaction(async (tx: any) => {
      const compResult = await tx
        .insert(schema.competitions)
        .values({
          title,
          description: description || `Pratibha Parishad Fine Arts Competition: ${title}`,
          bannerUrl: bannerUrl || null,
          entryFeeINR: (entryFeeINR || "50").toString(),
          startDate,
          endDate,
          registrationDeadline,
          resultDate,
          isActive: true,
          scope,
          eligibleStates: scope === "NATIONAL" ? [] : eligibleStates,
          hostState: scope === "STATE" ? (hostState || null) : null,
          difficultyLevel: resolvedDifficulty,
          minJudgesRequired: resolvedMinJudges,
          rules: rules || null,
          facebookGroupUrl: facebookGroupUrl || null,
          capacity: capacity || null,
          criteriaConfig: criteriaConfig || null,
        })
        .returning();

      const comp = compResult[0];

      await tx.insert(schema.competitionCategories).values({
        competitionId: comp.id,
        categoryId: dbCategory!.id,
        minAge,
        maxAge,
        language: language || null,
      });

      await tx.insert(schema.judgePanelRequirements).values({
        competitionId: comp.id,
        minJudges: resolvedMinJudges,
        minNationalTierJudges: scope === "NATIONAL" ? 3 : 0,
        requireCrossCategory: false,
      });

      if (judgeIds && judgeIds.length > 0) {
        await tx.insert(schema.competitionJudges).values(
          judgeIds.map((judgeId: string) => ({
            competitionId: comp.id,
            judgeId,
          }))
        );
      }

      if (prizes && prizes.length > 0) {
        const poolResult = await tx
          .insert(schema.prizePools)
          .values({
            competitionId: comp.id,
            title: `${comp.title} - Prize Pool`,
            description: "Prize pool for competition winners",
            isPublished: false,
          })
          .returning();

        const pool = poolResult[0];

        await tx.insert(schema.prizeItems).values(
          prizes.map((prize: { rank: string; type: string; title?: string; description?: string; estimatedValue?: string }) => ({
            prizePoolId: pool.id,
            rank: prize.rank,
            type: prize.type,
            title: prize.title || `${prize.rank} Prize`,
            description: prize.description || null,
            estimatedValue: prize.estimatedValue ? parseFloat(prize.estimatedValue) : null,
            isPhysical: prize.type === "PHYSICAL_MEDAL" || prize.type === "PHYSICAL_TROPHY",
          }))
        );
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
      },
    });
  } catch (error) {
    console.error("Admin competition create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import {
  getCompetitionWithPrizePool,
  getActiveCompetitions,
} from "@/lib/db/queries";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const scope = searchParams.get("scope"); // STATE | NATIONAL | null (all)
    const stateFilter = searchParams.get("state"); // filter state competitions by eligible state

    // Single competition fetch
    if (id) {
      const competition = await getCompetitionWithPrizePool(id);

      if (!competition) {
        return NextResponse.json({ error: "Competition not found" }, { status: 404 });
      }

      const formattedCategories = competition.categories.map((cc) => ({
        id: cc.id,
        categoryName: `${cc.category.name} (Ages ${cc.minAge}-${cc.maxAge})`,
        minAge: cc.minAge,
        maxAge: cc.maxAge,
      }));

      return NextResponse.json({
        id: competition.id,
        title: competition.title,
        description: competition.description,
        bannerUrl: competition.bannerUrl,
        entryFeeINR: Number(competition.entryFeeINR),
        startDate: competition.startDate,
        endDate: competition.endDate,
        registrationDeadline: competition.registrationDeadline,
        resultDate: competition.resultDate,
        isActive: competition.isActive,
        // Plan 01 — scope fields
        scope: competition.scope,
        eligibleStates: competition.eligibleStates,
        hostState: competition.hostState,
        difficultyLevel: competition.difficultyLevel,
        minJudgesRequired: competition.minJudgesRequired,
        categories: formattedCategories,
        // Plan 02 — prize pool (public preview if published)
        prizePool: competition.prizePool?.isPublished
          ? {
              title: competition.prizePool.title,
              description: competition.prizePool.description,
              items: competition.prizePool.items.map((item) => ({
                rank: item.rank,
                type: item.type,
                title: item.title,
                description: item.description,
                estimatedValue: item.estimatedValue ? Number(item.estimatedValue) : null,
                isPhysical: item.isPhysical,
                imageUrl: item.imageUrl,
              })),
            }
          : null,
      });
    }

    // List competitions with optional scope/state filtering
    let competitions = await getActiveCompetitions(scope || undefined, stateFilter || undefined);

    // Additional filtering after fetch for OR logic (scope NATIONAL OR eligible state)
    if (stateFilter) {
      competitions = competitions.filter((comp) => {
        return comp.scope === "NATIONAL" || (comp.eligibleStates as string[]).includes(stateFilter);
      });
    }

    // Sort by registrationDeadline ascending
    competitions.sort((a, b) => a.registrationDeadline.getTime() - b.registrationDeadline.getTime());

    return NextResponse.json(
      competitions.map((comp) => {
        const minAges = comp.categories.map((c) => c.minAge);
        const maxAges = comp.categories.map((c) => c.maxAge);
        const minAge = minAges.length > 0 ? Math.min(...minAges) : 4;
        const maxAge = maxAges.length > 0 ? Math.max(...maxAges) : 16;

        let prizeSummary = null;
        if (comp.prizePool?.isPublished && comp.prizePool.items.length > 0) {
          const prizeTypes = Array.from(new Set(comp.prizePool.items.map(item => {
            if (item.type === "CASH_PRIZE" && item.estimatedValue) {
              return `₹${Number(item.estimatedValue)} Cash`;
            }
            if (item.type === "PHYSICAL_TROPHY") return "Trophy";
            if (item.type === "PHYSICAL_MEDAL") return "Medal";
            return null;
          }).filter(Boolean)));
          if (prizeTypes.length > 0) {
            prizeSummary = prizeTypes.join(" + ");
          }
        }

        // Count total registrations across all categories in this competition
        const joinees = 0; // Will be calculated differently since Drizzle doesn't have _count
        const capacity = comp.scope === "NATIONAL" ? 1000 : 300;
        const slotsLeft = Math.max(0, capacity - joinees);

        return {
          id: comp.id,
          title: comp.title,
          description: comp.description,
          bannerUrl: comp.bannerUrl,
          entryFeeINR: Number(comp.entryFeeINR),
          startDate: comp.startDate,
          endDate: comp.endDate,
          registrationDeadline: comp.registrationDeadline,
          resultDate: comp.resultDate,
          isActive: comp.isActive,
          scope: comp.scope,
          hostState: comp.hostState,
          eligibleStates: comp.eligibleStates,
          difficultyLevel: comp.difficultyLevel,
          hasPrizePool: comp.prizePool?.isPublished ?? false,
          categoryName: Array.from(new Set(comp.categories.map((c) => c.category.name))).join(", ") || "General Arts",
          minAge,
          maxAge,
          prizeSummary,
          joinees,
          slotsLeft,
          capacity
        };
      })
    );
  } catch (error) {
    console.error("Fetch competition error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { Decimal } from "@prisma/client/runtime/library";

export type PrizeRank = "FIRST_PLACE" | "SECOND_PLACE" | "THIRD_PLACE";

export interface CompetitionResult {
  registrationId: string;
  competitionTitle: string;
  competitionStartDate: string;
  competitionEndDate: string;
  categoryName: string;
  categoryId: string;
  ageGroup: string;
  finalRank: number | null;
  finalScore: Decimal | null;
  prizeRank: PrizeRank | null;
  certificateType: string;
  certificateUrl: string | null;
  certificateIssuedAt: string;
  prizeDispatchedAt: string | null;
  judgeCount: number;
  averageScore: number | null;
  rubricBreakdown: {
    technique: number | null;
    expression: number | null;
    rhythm: number | null;
    originality: number | null;
  };
}

export interface CategorySummary {
  categoryName: string;
  totalRegistrations: number;
  winCount: number;
  winRate: number;
  prizeBreakdown: {
    firstPlace: number;
    secondPlace: number;
    thirdPlace: number;
  };
  averageScore: number | null;
  competitions: CompetitionResult[];
}

export interface TierInfo {
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  label: string;
  score: number;
  pointsToNext: number | null;
}

export interface ProfileStats {
  totalCompetitions: number;
  totalAwards: number;
  totalCategories: number;
  averageScore: number | null;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
}

export function calculateTier(
  goldCount: number,
  silverCount: number,
  bronzeCount: number,
  competitionCount: number,
  avgScore: number | null
): TierInfo {
  const medalScore = goldCount * 3 + silverCount * 2 + bronzeCount * 1;
  const scoreBonus = avgScore ? avgScore / 100 : 0;
  const competitionBonus = Math.floor(competitionCount / 10);
  const totalScore = medalScore + scoreBonus + competitionBonus;

  if (totalScore >= 40) {
    return {
      tier: "PLATINUM",
      label: "Master Competitor",
      score: totalScore,
      pointsToNext: null,
    };
  }
  if (totalScore >= 15) {
    return {
      tier: "GOLD",
      label: "Award Winner",
      score: totalScore,
      pointsToNext: Math.max(0, 40 - Math.floor(totalScore)),
    };
  }
  if (totalScore >= 5) {
    return {
      tier: "SILVER",
      label: "Skilled Performer",
      score: totalScore,
      pointsToNext: Math.max(0, 15 - Math.floor(totalScore)),
    };
  }

  return {
    tier: "BRONZE",
    label: "Rising Talent",
    score: totalScore,
    pointsToNext: Math.max(0, 5 - Math.floor(totalScore)),
  };
}

export function groupByCategory(
  competitions: CompetitionResult[]
): Record<string, CategorySummary> {
  const grouped: Record<string, CategorySummary> = {};

  competitions.forEach((comp) => {
    if (!grouped[comp.categoryName]) {
      grouped[comp.categoryName] = {
        categoryName: comp.categoryName,
        totalRegistrations: 0,
        winCount: 0,
        winRate: 0,
        prizeBreakdown: {
          firstPlace: 0,
          secondPlace: 0,
          thirdPlace: 0,
        },
        averageScore: null,
        competitions: [],
      };
    }

    const cat = grouped[comp.categoryName];
    cat.totalRegistrations++;
    cat.competitions.push(comp);

    if (comp.prizeRank) {
      cat.winCount++;
      if (comp.prizeRank === "FIRST_PLACE") cat.prizeBreakdown.firstPlace++;
      else if (comp.prizeRank === "SECOND_PLACE")
        cat.prizeBreakdown.secondPlace++;
      else if (comp.prizeRank === "THIRD_PLACE") cat.prizeBreakdown.thirdPlace++;
    }

    // Calculate average score for category
    const scores = cat.competitions
      .filter((c) => c.finalScore !== null)
      .map((c) => Number(c.finalScore));
    if (scores.length > 0) {
      cat.averageScore =
        scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  });

  // Calculate win rate for each category
  Object.values(grouped).forEach((cat) => {
    cat.winRate = (cat.winCount / cat.totalRegistrations) * 100;
  });

  return grouped;
}

export function calculatePrizeBreakdown(competitions: CompetitionResult[]) {
  return competitions.reduce(
    (acc, comp) => {
      if (comp.prizeRank === "FIRST_PLACE") acc.gold++;
      else if (comp.prizeRank === "SECOND_PLACE") acc.silver++;
      else if (comp.prizeRank === "THIRD_PLACE") acc.bronze++;
      return acc;
    },
    { gold: 0, silver: 0, bronze: 0 }
  );
}

export function getTopAchievements(
  competitions: CompetitionResult[],
  limit: number = 3
): CompetitionResult[] {
  return competitions
    .filter((c) => c.prizeRank) // Only show prize winners
    .sort((a, b) => {
      // Sort by rank first (gold > silver > bronze)
      const rankOrder = {
        FIRST_PLACE: 3,
        SECOND_PLACE: 2,
        THIRD_PLACE: 1,
      };
      const aRank = rankOrder[a.prizeRank!] || 0;
      const bRank = rankOrder[b.prizeRank!] || 0;
      if (bRank !== aRank) return bRank - aRank;

      // Then by score
      const aScore = a.finalScore ? Number(a.finalScore) : 0;
      const bScore = b.finalScore ? Number(b.finalScore) : 0;
      return bScore - aScore;
    })
    .slice(0, limit);
}

export function calculateProfileStats(
  competitions: CompetitionResult[]
): ProfileStats {
  const prizeBreakdown = calculatePrizeBreakdown(competitions);
  const categories = new Set(competitions.map((c) => c.categoryName));

  const scores = competitions
    .filter((c) => c.finalScore !== null)
    .map((c) => Number(c.finalScore));
  const averageScore =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  return {
    totalCompetitions: competitions.length,
    totalAwards: competitions.filter((c) => c.prizeRank).length,
    totalCategories: categories.size,
    averageScore,
    goldMedals: prizeBreakdown.gold,
    silverMedals: prizeBreakdown.silver,
    bronzeMedals: prizeBreakdown.bronze,
  };
}

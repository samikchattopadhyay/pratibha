"use client";

import { CompetitionResult } from "@/lib/student-profile-utils";

interface AchievementTimelineProps {
  competitions: CompetitionResult[];
}

export default function AchievementTimeline({
  competitions,
}: AchievementTimelineProps) {
  // Group by year and sort by date descending
  const groupedByYear = competitions.reduce(
    (acc, comp) => {
      const year = new Date(comp.competitionStartDate).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(comp);
      return acc;
    },
    {} as Record<number, CompetitionResult[]>
  );

  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const getMedalEmoji = (prizeRank: string | null) => {
    if (!prizeRank) return null;
    if (prizeRank === "FIRST_PLACE") return "🥇";
    if (prizeRank === "SECOND_PLACE") return "🥈";
    if (prizeRank === "THIRD_PLACE") return "🥉";
    return null;
  };

  return (
    <section className="py-6">
      <h2 className="text-xl font-bold text-charcoal dark:text-gold mb-6">
        📅 Achievement Timeline
      </h2>

      <div className="space-y-5">
        {years.map((year) => (
          <div key={year}>
            {/* Year header */}
            <div className="inline-block bg-gold/15 dark:bg-gold/20 text-gold font-bold px-3 py-1 rounded-full text-xs mb-2.5 border border-gold/30">
              {year}
            </div>

            {/* Grid of entries for this year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {groupedByYear[year]
                .sort(
                  (a, b) =>
                    new Date(b.competitionStartDate).getTime() -
                    new Date(a.competitionStartDate).getTime()
                )
                .map((comp) => (
                  <div
                    key={comp.registrationId}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-cream-dark/5 dark:hover:bg-charcoal/50 transition-colors text-xs"
                  >
                    {/* Medal or dot */}
                    <div className="text-base flex-shrink-0 mt-0.5">
                      {getMedalEmoji(comp.prizeRank) || (
                        <span className="text-charcoal/40 dark:text-gold/40">●</span>
                      )}
                    </div>

                    {/* Competition info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-charcoal dark:text-white leading-tight">
                        {comp.competitionTitle}
                      </p>
                      <p className="text-charcoal/70 dark:text-cream/70 text-xs mt-0.5">
                        {comp.categoryName}
                      </p>
                      <p className="text-charcoal/60 dark:text-cream/60 text-xs mt-0.5">
                        Score: <span className="font-semibold text-gold">{comp.finalScore ? Number(comp.finalScore).toFixed(1) : "N/A"}</span>
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

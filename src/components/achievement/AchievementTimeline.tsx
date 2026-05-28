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
    <section className="py-12">
      <h2 className="text-2xl font-bold text-charcoal dark:text-gold mb-8">
        Achievement Timeline
      </h2>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-terracotta to-transparent" />

        <div className="space-y-12 pl-12">
          {years.map((year) => (
            <div key={year}>
              {/* Year header */}
              <div className="mb-6">
                <div className="inline-block bg-gold text-charcoal px-4 py-2 rounded-full font-bold text-lg">
                  {year}
                </div>
              </div>

              {/* Entries for this year */}
              <div className="space-y-3">
                {groupedByYear[year]
                  .sort(
                    (a, b) =>
                      new Date(b.competitionStartDate).getTime() -
                      new Date(a.competitionStartDate).getTime()
                  )
                  .map((comp) => (
                    <div
                      key={comp.registrationId}
                      className="flex items-center gap-3 text-sm"
                    >
                      {/* Medal or dot */}
                      <div className="text-lg">
                        {getMedalEmoji(comp.prizeRank) || (
                          <span className="text-charcoal dark:text-gold">●</span>
                        )}
                      </div>

                      {/* Competition info */}
                      <div className="flex-1">
                        <p className="font-medium text-charcoal dark:text-white">
                          {comp.competitionTitle}
                        </p>
                        <p className="text-charcoal/70 dark:text-cream/70 text-xs">
                          {comp.categoryName} • Score:{" "}
                          {comp.finalScore ? Number(comp.finalScore).toFixed(1) : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  registrationId: string;
  studentName: string;
  age: number;
  categoryName: string;
  finalScore: number;
  schoolName?: string;
  fbPostUrl?: string;
}

interface ResultsLeaderboardProps {
  entries: LeaderboardEntry[];
  competitionTitle: string;
}

export default function ResultsLeaderboard({
  entries,
  competitionTitle,
}: ResultsLeaderboardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-gold" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-silver" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-bronze" />;
    return <Award className="w-5 h-5 text-terracotta/50" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gold/10 border-gold/20";
    if (rank === 2) return "bg-silver/10 border-silver/20";
    if (rank === 3) return "bg-bronze/10 border-bronze/20";
    return "bg-cream-dark/30 dark:bg-charcoal-light/30 border-terracotta/10";
  };

  const getPodiumPosition = (rank: number) => {
    if (rank === 1) return "col-span-1 row-start-2";
    if (rank === 2) return "col-span-1";
    if (rank === 3) return "col-span-1 row-start-3";
    return null;
  };

  const topThree = entries.slice(0, 3);

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-16">
        <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">
          Final Results
        </h2>
        <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
          Ranking of all participants by final score across all categories for {competitionTitle}
        </p>
        <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
      </div>

      {/* PODIUM DISPLAY FOR TOP 3 */}
      {topThree.length > 0 && (
        <div className="mb-16">
          <div className="grid grid-cols-3 gap-4 items-end max-w-2xl mx-auto mb-12">
            {topThree.map((entry, idx) => {
              const rank = idx + 1;
              const heights = ["h-64", "h-80", "h-72"];
              return (
                <div
                  key={entry.registrationId}
                  className={`flex flex-col items-center ${getPodiumPosition(rank)}`}
                >
                  {/* Podium Card */}
                  <div
                    className={`w-full border rounded-t-2xl p-6 space-y-3 text-center ${getRankColor(rank)}`}
                  >
                    {/* Rank Badge */}
                    <div className="flex items-center justify-center gap-2">
                      {getRankIcon(rank)}
                      <span className="font-serif text-2xl font-bold text-charcoal dark:text-cream">
                        #{rank}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream">
                      {entry.studentName}
                    </h3>

                    {/* Score */}
                    <div className="space-y-1">
                      <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 uppercase font-bold">
                        Final Score
                      </p>
                      <p className="font-serif text-3xl font-bold text-terracotta dark:text-gold">
                        {entry.finalScore.toFixed(2)}
                      </p>
                    </div>

                    {/* Category & Age */}
                    <div className="space-y-1 border-t border-terracotta/10 pt-3">
                      <p className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase font-bold">
                        {entry.categoryName}
                      </p>
                      <p className="font-sans text-sm font-semibold text-charcoal/70 dark:text-cream/70">
                        Age {entry.age}
                      </p>
                    </div>
                  </div>

                  {/* Podium Base */}
                  <div className={`w-full ${heights[idx]} bg-gradient-to-b from-terracotta/20 to-terracotta/10 dark:from-gold/20 dark:to-gold/10 border border-terracotta/20 dark:border-gold/20 rounded-b-lg flex items-end justify-center pb-4`}>
                    <span className="font-serif text-5xl font-bold text-terracotta/30 dark:text-gold/30">
                      {rank}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEADERBOARD TABLE FOR ALL ENTRIES */}
      {entries.length > 0 && (
        <div className="border border-terracotta/10 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-terracotta/5 dark:bg-gold/5 border-b border-terracotta/10">
                <th className="py-4 px-6 font-bold text-charcoal dark:text-cream w-16">
                  Rank
                </th>
                <th className="py-4 px-6 font-bold text-charcoal dark:text-cream">
                  Participant
                </th>
                <th className="py-4 px-6 font-bold text-charcoal dark:text-cream">
                  Category
                </th>
                <th className="py-4 px-6 font-bold text-charcoal dark:text-cream text-center w-20">
                  Age
                </th>
                <th className="py-4 px-6 font-bold text-charcoal dark:text-cream text-right w-24">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terracotta/5 dark:divide-terracotta/10">
              {entries.map((entry) => (
                <tr
                  key={entry.registrationId}
                  className={`hover:bg-cream-dark/20 dark:hover:bg-charcoal/30 transition-colors ${
                    entry.rank <= 3
                      ? "bg-terracotta/3 dark:bg-gold/3 font-semibold"
                      : ""
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {entry.rank <= 3 && getRankIcon(entry.rank)}
                      <span className="font-serif font-bold text-charcoal dark:text-cream">
                        #{entry.rank}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-charcoal dark:text-cream">
                        {entry.studentName}
                      </p>
                      {entry.schoolName && (
                        <p className="text-sm text-charcoal/60 dark:text-cream/60">
                          {entry.schoolName}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-charcoal/75 dark:text-cream/75">
                    {entry.categoryName}
                  </td>
                  <td className="py-4 px-6 text-center text-charcoal/75 dark:text-cream/75">
                    {entry.age}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`font-serif font-bold text-lg ${
                        entry.rank <= 3
                          ? "text-terracotta dark:text-gold"
                          : "text-charcoal dark:text-cream"
                      }`}
                    >
                      {entry.finalScore.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-12 bg-cream-dark/10 dark:bg-charcoal-light/10 rounded-xl border border-terracotta/5">
          <p className="font-sans text-charcoal/70 dark:text-cream/70">
            Results will be published once judging is complete and finalized.
          </p>
        </div>
      )}
    </section>
  );
}

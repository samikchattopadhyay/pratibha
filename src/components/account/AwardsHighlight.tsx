"use client";

import React from "react";
import { CompetitionResult } from "@/lib/student-profile-utils";
import VerificationBadge from "./VerificationBadge";

interface AwardsHighlightProps {
  medalCount: {
    gold: number;
    silver: number;
    bronze: number;
  };
  highestScore: {
    value: number;
    category: string;
    competition: string;
  } | null;
  featuredAchievements: CompetitionResult[];
}

function getMedalColor(count: number, isGold: boolean) {
  if (isGold) return "text-yellow-600 dark:text-yellow-400";
  return "text-gray-500 dark:text-gray-400";
}

export default function AwardsHighlight({
  medalCount,
  highestScore,
  featuredAchievements,
}: AwardsHighlightProps) {
  const maxMedals = Math.max(medalCount.gold, medalCount.silver, medalCount.bronze, 1);

  return (
    <div className="bg-gradient-to-br from-terracotta/5 to-gold/5 dark:from-terracotta/20 dark:to-gold/20 border border-terracotta/20 dark:border-terracotta/40 rounded-2xl p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Medal Count - Compact */}
        <div className="sm:col-span-1">
          <h3 className="font-serif text-sm font-bold text-charcoal dark:text-cream mb-2">
            🏅 Medals
          </h3>
          <div className="space-y-1.5">
            {/* Gold Medals */}
            <div className="flex items-center gap-2">
              <span className="text-lg">🥇</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-sans text-xs font-semibold text-charcoal dark:text-cream">
                    First
                  </span>
                  <span className="font-sans font-bold text-yellow-600 dark:text-yellow-400 text-sm">
                    {medalCount.gold}
                  </span>
                </div>
                <div className="w-full bg-charcoal/10 dark:bg-charcoal/30 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full transition-all duration-500"
                    style={{
                      width: `${(medalCount.gold / maxMedals) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Silver Medals */}
            <div className="flex items-center gap-2">
              <span className="text-lg">🥈</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-sans text-xs font-semibold text-charcoal dark:text-cream">
                    Second
                  </span>
                  <span className="font-sans font-bold text-gray-500 dark:text-gray-400 text-sm">
                    {medalCount.silver}
                  </span>
                </div>
                <div className="w-full bg-charcoal/10 dark:bg-charcoal/30 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gray-400 h-full transition-all duration-500"
                    style={{
                      width: `${(medalCount.silver / maxMedals) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bronze Medals */}
            <div className="flex items-center gap-2">
              <span className="text-lg">🥉</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-sans text-xs font-semibold text-charcoal dark:text-cream">
                    Third
                  </span>
                  <span className="font-sans font-bold text-amber-700 dark:text-amber-600 text-sm">
                    {medalCount.bronze}
                  </span>
                </div>
                <div className="w-full bg-charcoal/10 dark:bg-charcoal/30 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-600 h-full transition-all duration-500"
                    style={{
                      width: `${(medalCount.bronze / maxMedals) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Highest Score */}
        {highestScore && (
          <div className="bg-gradient-to-br from-gold/10 to-terracotta/10 dark:from-gold/20 dark:to-terracotta/20 border border-gold/30 dark:border-gold/50 rounded-lg p-3 sm:col-span-1">
            <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60 uppercase tracking-wider">
              Top Score
            </p>
            <p className="font-serif text-2xl font-bold text-gold mt-0.5">
              {highestScore.value}
            </p>
            <p className="font-sans text-xs text-charcoal/70 dark:text-cream/70 mt-1 leading-tight">
              <span className="font-semibold">{highestScore.category}</span>
            </p>
            <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60 mt-0.5 line-clamp-2">
              {highestScore.competition}
            </p>
          </div>
        )}

        {/* Featured Achievements */}
        {featuredAchievements.length > 0 && (
          <div className="sm:col-span-1">
            <h4 className="font-sans text-xs font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider mb-2">
              Top 3
            </h4>
            <div className="space-y-1">
              {featuredAchievements.map((achievement) => (
                <div
                  key={achievement.registrationId}
                  className="bg-cream dark:bg-charcoal rounded p-2 border border-terracotta/10 dark:border-terracotta/20 flex items-start gap-2 text-xs"
                >
                  <span className="text-base flex-shrink-0">
                    {achievement.prizeRank === "FIRST_PLACE"
                      ? "🥇"
                      : achievement.prizeRank === "SECOND_PLACE"
                        ? "🥈"
                        : "🥉"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-charcoal dark:text-cream text-xs leading-tight">
                      {achievement.competitionTitle}
                    </p>
                    {achievement.finalScore && (
                      <p className="font-bold text-gold text-xs mt-0.5">
                        {Number(achievement.finalScore).toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

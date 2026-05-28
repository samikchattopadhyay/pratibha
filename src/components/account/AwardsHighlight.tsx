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
    <div className="bg-gradient-to-br from-terracotta/5 to-gold/5 dark:from-terracotta/20 dark:to-gold/20 border border-terracotta/20 dark:border-terracotta/40 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Medal Count Section */}
      <div>
        <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream mb-4">
          🏅 Medal Breakdown
        </h3>
        <div className="space-y-3">
          {/* Gold Medals */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥇</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-sm font-semibold text-charcoal dark:text-cream">
                  First Place
                </span>
                <span className="font-sans text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {medalCount.gold}
                </span>
              </div>
              <div className="w-full bg-charcoal/10 dark:bg-charcoal/30 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full transition-all duration-500"
                  style={{
                    width: `${(medalCount.gold / maxMedals) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Silver Medals */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥈</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-sm font-semibold text-charcoal dark:text-cream">
                  Second Place
                </span>
                <span className="font-sans text-lg font-bold text-gray-500 dark:text-gray-400">
                  {medalCount.silver}
                </span>
              </div>
              <div className="w-full bg-charcoal/10 dark:bg-charcoal/30 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-gray-400 to-gray-500 h-full transition-all duration-500"
                  style={{
                    width: `${(medalCount.silver / maxMedals) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bronze Medals */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥉</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-sm font-semibold text-charcoal dark:text-cream">
                  Third Place
                </span>
                <span className="font-sans text-lg font-bold text-amber-700 dark:text-amber-600">
                  {medalCount.bronze}
                </span>
              </div>
              <div className="w-full bg-charcoal/10 dark:bg-charcoal/30 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-600 to-amber-700 h-full transition-all duration-500"
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
        <div className="bg-gradient-to-r from-gold/10 to-terracotta/10 dark:from-gold/20 dark:to-terracotta/20 border border-gold/30 dark:border-gold/50 rounded-xl p-4">
          <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60 uppercase tracking-wider mb-1">
            Highest Achievement
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-gold">
              {highestScore.value}
            </span>
            <span className="font-sans text-sm text-charcoal/70 dark:text-cream/70">
              points in{" "}
              <span className="font-semibold text-charcoal dark:text-cream">
                {highestScore.category}
              </span>
            </span>
          </div>
          <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60 mt-2">
            {highestScore.competition}
          </p>
        </div>
      )}

      {/* Featured Achievements */}
      {featuredAchievements.length > 0 && (
        <div>
          <h4 className="font-sans text-xs font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider mb-3">
            Top Achievements
          </h4>
          <div className="space-y-2">
            {featuredAchievements.map((achievement) => (
              <div
                key={achievement.registrationId}
                className="bg-cream dark:bg-charcoal rounded-lg p-3 border border-terracotta/10 dark:border-terracotta/20 flex items-start gap-3"
              >
                <span className="text-lg flex-shrink-0">
                  {achievement.prizeRank === "FIRST_PLACE"
                    ? "🥇"
                    : achievement.prizeRank === "SECOND_PLACE"
                      ? "🥈"
                      : "🥉"}
                </span>
                <div className="flex-1">
                  <p className="font-sans font-semibold text-sm text-charcoal dark:text-cream">
                    {achievement.competitionTitle}
                  </p>
                  <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60">
                    {achievement.categoryName}
                  </p>
                  {achievement.finalScore && (
                    <p className="font-sans text-xs font-bold text-terracotta dark:text-gold mt-1">
                      {Number(achievement.finalScore).toFixed(1)} / 100
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

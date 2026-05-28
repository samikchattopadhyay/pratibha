"use client";

import React, { useState } from "react";
import { CategorySummary } from "@/lib/student-profile-utils";

interface CategoryPerformanceSummaryProps {
  categories: CategorySummary[];
}

type SortKey = "wins" | "score" | "recency";

function getCategoryEmoji(categoryName: string): string {
  const emojiMap: Record<string, string> = {
    "Hindustani Classical Vocal": "🎤",
    "Hindustani Classical Instrumental": "🎺",
    "Carnatic Classical Vocal": "🎤",
    "Carnatic Classical Instrumental": "🎻",
    "Instrumental": "🎸",
    "Vocal": "🎵",
    "Dance": "💃",
    "Visual Arts": "🎨",
    "Drawing": "🖌️",
    "Painting": "🎨",
    "Singing": "🎤",
    "Music": "🎵",
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase())) {
      return emoji;
    }
  }
  return "🎭";
}

export default function CategoryPerformanceSummary({
  categories,
}: CategoryPerformanceSummaryProps) {
  const [sortBy, setSortBy] = useState<SortKey>("wins");

  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === "wins") return b.winCount - a.winCount;
    if (sortBy === "score")
      return (b.averageScore || 0) - (a.averageScore || 0);
    // recency: sort by most recent competition date
    const aDate = new Date(
      a.competitions[0]?.competitionStartDate || 0
    ).getTime();
    const bDate = new Date(
      b.competitions[0]?.competitionStartDate || 0
    ).getTime();
    return bDate - aDate;
  });

  return (
    <div className="space-y-4">
      {/* Sort Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(["wins", "score", "recency"] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
              sortBy === key
                ? "bg-terracotta/20 dark:bg-terracotta/30 text-terracotta dark:text-terracotta/90 border-terracotta/40"
                : "bg-cream-dark/5 dark:bg-charcoal text-charcoal/70 dark:text-cream/70 border-charcoal/10 dark:border-cream/10 hover:border-terracotta/20"
            }`}
          >
            By {key === "wins" ? "Wins" : key === "score" ? "Score" : "Recency"}
          </button>
        ))}
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCategories.map((category) => (
          <div
            key={category.categoryName}
            className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-xl p-4 hover:border-terracotta/30 dark:hover:border-terracotta/40 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getCategoryEmoji(category.categoryName)}</span>
                  <h4 className="font-sans font-semibold text-sm text-charcoal dark:text-cream">
                    {category.categoryName}
                  </h4>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              {/* Win Rate */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal/60 dark:text-cream/60">
                  Win Rate
                </span>
                <span className="text-sm font-bold text-terracotta dark:text-gold">
                  {category.winCount}/{category.totalRegistrations} ({category.winRate.toFixed(0)}%)
                </span>
              </div>

              {/* Prize Breakdown */}
              <div className="flex items-center gap-1">
                {category.prizeBreakdown.firstPlace > 0 && (
                  <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                    🥇 {category.prizeBreakdown.firstPlace}
                  </span>
                )}
                {category.prizeBreakdown.secondPlace > 0 && (
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    🥈 {category.prizeBreakdown.secondPlace}
                  </span>
                )}
                {category.prizeBreakdown.thirdPlace > 0 && (
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-600">
                    🥉 {category.prizeBreakdown.thirdPlace}
                  </span>
                )}
              </div>

              {/* Average Score */}
              {category.averageScore !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-charcoal/60 dark:text-cream/60">
                    Avg Score
                  </span>
                  <span className="text-sm font-bold text-charcoal dark:text-cream">
                    {category.averageScore.toFixed(1)}/100
                  </span>
                </div>
              )}

              {/* Participation Count */}
              <div className="text-xs text-charcoal/60 dark:text-cream/60 pt-2 border-t border-terracotta/10 dark:border-terracotta/20">
                {category.totalRegistrations} registration{
                  category.totalRegistrations > 1 ? "s" : ""
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

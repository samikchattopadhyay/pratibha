"use client";

import React from "react";
import { Trophy } from "lucide-react";

interface TierBadgeProps {
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  label: string;
  pointsToNext?: number | null;
  showLabel?: boolean;
}

export default function TierBadge({
  tier,
  label,
  pointsToNext,
  showLabel = true,
}: TierBadgeProps) {
  const tierStyles = {
    BRONZE: "bg-amber-900/30 text-amber-700 dark:text-amber-500",
    SILVER: "bg-gray-500/30 text-gray-700 dark:text-gray-300",
    GOLD: "bg-yellow-600/30 text-yellow-700 dark:text-yellow-400",
    PLATINUM: "bg-purple-600/30 text-purple-700 dark:text-purple-400",
  };

  const tierIcons = {
    BRONZE: "🏆",
    SILVER: "🥈",
    GOLD: "🥇",
    PLATINUM: "👑",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${tierStyles[tier]}`}
      title={`${label}${pointsToNext ? ` · ${pointsToNext} points to next tier` : ""}`}
    >
      <span className="text-lg">{tierIcons[tier]}</span>
      {showLabel && <span className="text-xs font-semibold">{label}</span>}
    </div>
  );
}

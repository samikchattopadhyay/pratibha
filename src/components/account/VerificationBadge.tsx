"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface VerificationBadgeProps {
  variant?: "inline" | "badge" | "icon";
  size?: "sm" | "md";
}

export default function VerificationBadge({
  variant = "badge",
  size = "md",
}: VerificationBadgeProps) {
  if (variant === "inline") {
    return (
      <div className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
        <CheckCircle2 className="w-4 h-4" />
        <span>Verified by Pratibha Parishad</span>
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <div title="Verified by Pratibha Parishad">
        <CheckCircle2
          className={`${size === "sm" ? "w-4 h-4" : "w-5 h-5"} text-green-600 dark:text-green-400`}
        />
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-950/30 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800">
      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
      <span className="text-xs font-semibold text-green-700 dark:text-green-400">
        Verified
      </span>
    </div>
  );
}

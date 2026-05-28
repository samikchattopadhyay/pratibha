"use client";

import React, { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { CompetitionResult } from "@/lib/student-profile-utils";
import VerificationBadge from "./VerificationBadge";

interface CompetitionResultCardProps {
  competition: CompetitionResult;
  showRubric?: boolean;
}

function getRankLabel(rank: string | null): string {
  if (!rank) return "Participation";
  if (rank === "FIRST_PLACE") return "🥇 First Place";
  if (rank === "SECOND_PLACE") return "🥈 Second Place";
  if (rank === "THIRD_PLACE") return "🥉 Third Place";
  return "Participation";
}

export default function CompetitionResultCard({
  competition,
  showRubric = false,
}: CompetitionResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(showRubric);

  const hasRubric =
    competition.rubricBreakdown.technique !== null ||
    competition.rubricBreakdown.expression !== null ||
    competition.rubricBreakdown.rhythm !== null;

  return (
    <div
      className={`bg-cream dark:bg-charcoal-light border rounded-xl transition-all overflow-hidden ${
        competition.prizeRank
          ? "border-terracotta/30 dark:border-terracotta/40"
          : "border-terracotta/10 dark:border-terracotta/20"
      }`}
    >
      {/* Card Header */}
      <div className="p-4 sm:p-5 space-y-3 cursor-pointer hover:bg-cream-dark/5 dark:hover:bg-charcoal/50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-1">
              <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal dark:text-cream flex-1">
                {competition.competitionTitle}
              </h3>
              <span className="text-xs font-semibold text-charcoal/60 dark:text-cream/60 flex-shrink-0 whitespace-nowrap">
                {new Date(competition.competitionStartDate).toLocaleDateString(
                  "en-US",
                  { month: "short", year: "numeric" }
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-semibold px-2 py-1 bg-terracotta/10 dark:bg-terracotta/20 text-terracotta dark:text-terracotta/90 rounded-full">
                {competition.categoryName}
              </span>
              {competition.ageGroup && (
                <span className="text-xs text-charcoal/60 dark:text-cream/60">
                  Age {competition.ageGroup}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60">
                    {getRankLabel(competition.prizeRank)}
                  </p>
                </div>
              </div>
              {competition.finalScore && (
                <div className="text-right">
                  <p className="font-serif text-2xl font-bold text-gold">
                    {Number(competition.finalScore).toFixed(1)}
                  </p>
                  <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60">
                    / 100
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification and Other Info */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-terracotta/10 dark:border-terracotta/20">
          <VerificationBadge variant="icon" size="sm" />
          {competition.judgeCount > 0 && (
            <span className="text-xs text-charcoal/70 dark:text-cream/70">
              Judged by {competition.judgeCount} judge{competition.judgeCount > 1 ? "s" : ""}
            </span>
          )}
          {competition.prizeDispatchedAt && (
            <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
              ✓ Award dispatched
            </span>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      {(hasRubric || competition.certificateUrl) && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 sm:px-5 py-2 flex items-center justify-between text-xs font-semibold text-terracotta dark:text-gold hover:bg-cream-dark/5 dark:hover:bg-charcoal/50 border-t border-terracotta/10 dark:border-terracotta/20 transition-colors"
          >
            <span>{isExpanded ? "Hide Details" : "View Details"}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>

          {isExpanded && (
            <div className="px-4 sm:px-5 py-4 space-y-4 border-t border-terracotta/10 dark:border-terracotta/20 bg-cream-dark/2 dark:bg-charcoal/30">
              {/* Rubric Breakdown */}
              {hasRubric && (
                <div>
                  <p className="font-sans text-xs font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider mb-3">
                    Scoring Breakdown
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {competition.rubricBreakdown.technique !== null && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-charcoal/70 dark:text-cream/70">
                          Technique
                        </span>
                        <span className="font-semibold text-charcoal dark:text-cream">
                          {competition.rubricBreakdown.technique}/40
                        </span>
                      </div>
                    )}
                    {competition.rubricBreakdown.expression !== null && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-charcoal/70 dark:text-cream/70">
                          Expression
                        </span>
                        <span className="font-semibold text-charcoal dark:text-cream">
                          {competition.rubricBreakdown.expression}/30
                        </span>
                      </div>
                    )}
                    {competition.rubricBreakdown.rhythm !== null && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-charcoal/70 dark:text-cream/70">
                          Rhythm
                        </span>
                        <span className="font-semibold text-charcoal dark:text-cream">
                          {competition.rubricBreakdown.rhythm}/30
                        </span>
                      </div>
                    )}
                    {competition.rubricBreakdown.originality !== null && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-charcoal/70 dark:text-cream/70">
                          Originality
                        </span>
                        <span className="font-semibold text-charcoal dark:text-cream">
                          {competition.rubricBreakdown.originality}/10
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Certificate */}
              {competition.certificateUrl && (
                <a
                  href={competition.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-gold/10 to-terracotta/10 dark:from-gold/20 dark:to-terracotta/20 rounded-lg border border-gold/20 dark:border-gold/40 hover:border-gold/40 dark:hover:border-gold/60 transition-colors"
                >
                  <span className="text-xs font-semibold text-charcoal dark:text-cream">
                    📜 View Certificate
                  </span>
                  <Download className="w-4 h-4 text-gold" />
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

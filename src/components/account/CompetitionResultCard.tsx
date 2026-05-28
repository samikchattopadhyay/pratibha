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
      className={`bg-cream dark:bg-charcoal-light border rounded-lg transition-all overflow-hidden ${
        competition.prizeRank
          ? "border-terracotta/30 dark:border-terracotta/40 shadow-sm"
          : "border-terracotta/10 dark:border-terracotta/20"
      }`}
    >
      {/* Card Header */}
      <div className="p-2.5 sm:p-3 space-y-1.5 cursor-pointer hover:bg-cream-dark/5 dark:hover:bg-charcoal/50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-xs sm:text-sm font-bold text-charcoal dark:text-cream leading-tight">
              {competition.competitionTitle}
            </h3>

            <div className="flex flex-wrap items-center gap-1 mt-1">
              <span className="text-xs font-semibold px-1.5 py-0.5 bg-terracotta/10 dark:bg-terracotta/20 text-terracotta dark:text-terracotta/90 rounded-full whitespace-nowrap">
                {competition.categoryName}
              </span>
              <span className="text-xs font-semibold text-charcoal/60 dark:text-cream/60 whitespace-nowrap">
                {new Date(competition.competitionStartDate).toLocaleDateString(
                  "en-US",
                  { month: "short" }
                )}
              </span>
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <span className="font-sans text-xs text-charcoal/70 dark:text-cream/70">
                {getRankLabel(competition.prizeRank)}
              </span>
              {competition.finalScore && (
                <p className="font-serif text-lg font-bold text-gold leading-none">
                  {Number(competition.finalScore).toFixed(1)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Verification and Other Info */}
        <div className="flex items-center gap-1 pt-1 border-t border-terracotta/10 dark:border-terracotta/20 text-xs">
          <VerificationBadge variant="icon" size="sm" />
          {competition.judgeCount > 0 && (
            <span className="text-charcoal/70 dark:text-cream/70 text-xs">
              {competition.judgeCount}J
            </span>
          )}
          {competition.prizeDispatchedAt && (
            <span className="text-green-600 dark:text-green-400 font-semibold text-xs">
              ✓
            </span>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      {(hasRubric || competition.certificateUrl || competition.judgeInfo.length > 0 || competition.prizeItem) && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs font-semibold text-terracotta dark:text-gold hover:bg-cream-dark/5 dark:hover:bg-charcoal/50 border-t border-terracotta/10 dark:border-terracotta/20 transition-colors"
          >
            <span>{isExpanded ? "Hide" : "Details"}</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>

          {isExpanded && (
            <div className="px-3 sm:px-4 py-3 space-y-3 border-t border-terracotta/10 dark:border-terracotta/20 bg-cream-dark/2 dark:bg-charcoal/30">
              {/* Judge Attribution */}
              {competition.judgeInfo.length > 0 && (
                <div>
                  <p className="font-sans text-xs font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider mb-1">
                    Judges
                  </p>
                  <div className="space-y-0.5">
                    {competition.judgeInfo.map((judge, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-charcoal dark:text-cream">{judge.name}</span>
                        <span className="px-1.5 py-0.5 bg-gold/20 dark:bg-gold/30 text-gold dark:text-gold/90 rounded text-xs font-semibold">
                          {judge.tier}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prize Item */}
              {competition.prizeItem && (
                <div className="p-2.5 bg-gradient-to-r from-terracotta/10 to-gold/10 dark:from-terracotta/20 dark:to-gold/20 rounded-lg border border-terracotta/20 dark:border-terracotta/30">
                  <p className="font-sans text-xs font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider mb-1">
                    Prize
                  </p>
                  <p className="font-semibold text-charcoal dark:text-cream text-sm mb-1">
                    {competition.prizeItem.title}
                  </p>
                  {competition.prizeItem.description && (
                    <p className="text-xs text-charcoal/70 dark:text-cream/70 mb-1.5">
                      {competition.prizeItem.description}
                    </p>
                  )}
                  {competition.prizeItem.type && (
                    <span className="inline-block px-2 py-0.5 bg-charcoal/20 dark:bg-gold/20 text-charcoal dark:text-gold text-xs rounded">
                      {competition.prizeItem.type}
                    </span>
                  )}
                </div>
              )}

              {/* Rubric Breakdown */}
              {hasRubric && (
                <div>
                  <p className="font-sans text-xs font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider mb-2">
                    Scoring
                  </p>
                  <div className="grid grid-cols-2 gap-2">
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

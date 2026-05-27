"use client";

import { useEffect, useState, useCallback } from "react";
import { VotingRecord, PaginatedResponse, SubTabProps } from "@/types/competition-details";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { AlertCircle, CheckCircle, TrendingUp, HelpCircle, X } from "lucide-react";

interface LeaderboardItem {
  registrationId: string;
  participantName: string;
  categoryName: string;
  scoresReceived: number;
  averageScore: number;
  totalScore: number;
}

export default function VotingSubTab({ competitionId }: SubTabProps) {
  const [data, setData] = useState<VotingRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const fetchVotingData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch judge progress
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      const progressRes = await fetch(
        `/api/admin/competitions/${competitionId}/voting?${query.toString()}`
      );
      if (!progressRes.ok) throw new Error("Failed to fetch voting data");
      const { data, pagination } = await progressRes.json() as PaginatedResponse<VotingRecord>;
      setData(data);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.totalCount);

      // Fetch leaderboard
      const leaderboardRes = await fetch(
        `/api/admin/competitions/${competitionId}/voting/leaderboard`
      );
      if (leaderboardRes.ok) {
        const { data: leaderboardData } = await leaderboardRes.json();
        setLeaderboard(leaderboardData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [competitionId, currentPage]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchVotingData();
  }, [fetchVotingData]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-serif text-base font-bold flex items-center gap-2">
          Judge Progress & Live Voting
          <button
            onClick={() => setShowHelp(true)}
            className="text-cream/40 hover:text-gold transition-colors focus:outline-none p-1 rounded hover:bg-cream/5"
            title="Show Voting Guidelines"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </h3>
        <p className="text-sm text-cream/50 mt-1">
          Monitor judge assignments and scoring progress for this competition
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && <Loading variant="overlay" text="Loading voting data..." />}

      {/* Judge Cards Grid */}
      {data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((judge) => (
            <div
              key={judge.judgeId}
              className="bg-charcoal border border-terracotta/10 rounded-xl p-4 space-y-3 hover:border-terracotta/30 transition-all"
            >
              {/* Judge Header */}
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-serif font-bold text-cream truncate">{judge.judgeName}</h4>
                {judge.completionPercentage === 100 ? (
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                ) : judge.isOutlier ? (
                  <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                ) : null}
              </div>

              {/* Stats */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-cream/60">Assignments</span>
                  <span className="text-cream font-bold">{judge.assignmentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cream/60">Submitted</span>
                  <span className="text-cream font-bold">{judge.submittedCount}</span>
                </div>
                {judge.averageScore !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-cream/60">Avg Score</span>
                    <span className="text-gold font-bold">{judge.averageScore}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-charcoal-light border border-terracotta/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-terracotta transition-all"
                    style={{ width: `${judge.completionPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-cream/50 text-right">{judge.completionPercentage}% complete</p>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-cream/40 italic">
          No judges assigned to this competition yet
        </div>
      )}

      {/* Pagination */}
      {totalCount > 10 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-terracotta/10">
          <div className="text-sm text-cream/60 font-sans">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, totalCount)} of {totalCount} judges
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="secondary"
              size="md"
            >
              Previous
            </Button>
            {getPageNumbers().map((page, idx) => (
              <Button
                key={idx}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={page === "..."}
                variant={page === currentPage ? "primary" : page === "..." ? "ghost" : "secondary"}
                size="md"
                className={page === "..." ? "cursor-default" : ""}
              >
                {page}
              </Button>
            ))}
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              variant="secondary"
              size="md"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Live Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="bg-charcoal border border-terracotta/10 rounded-xl p-4">
          <h4 className="font-serif font-bold text-cream mb-4 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold" /> Live Leaderboard
          </h4>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {leaderboard.slice(0, 3).map((entry, idx) => {
              const medals = ["🥇", "🥈", "🥉"];
              const bgColors = [
                "bg-gold/20 border-gold/50",
                "bg-gray-400/20 border-gray-400/50",
                "bg-orange-700/20 border-orange-700/50"
              ];
              return (
                <div
                  key={entry.registrationId}
                  className={`border rounded-lg p-3 text-center space-y-2 ${bgColors[idx]}`}
                >
                  <div className="text-2xl">{medals[idx]}</div>
                  <div>
                    <p className="font-serif font-bold text-cream text-sm truncate">
                      {entry.participantName}
                    </p>
                    <p className="text-cream/60 text-xs">{entry.categoryName}</p>
                  </div>
                  <div className="border-t border-current/20 pt-2">
                    <p className="font-bold text-lg" style={{color: idx === 0 ? "#F4A460" : idx === 1 ? "#C0C0C0" : "#CD7F32"}}>
                      {entry.averageScore}
                    </p>
                    <p className="text-cream/50 text-xs">{entry.scoresReceived} scores</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Remaining Rankings */}
          <div className="space-y-2">
            {leaderboard.slice(3).map((entry, idx) => (
              <div
                key={entry.registrationId}
                className="flex justify-between items-center bg-charcoal-light border border-terracotta/10 rounded p-2.5 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-terracotta w-6 text-center">#{idx + 4}</span>
                    <div>
                      <p className="font-semibold text-cream truncate">
                        {entry.participantName}
                      </p>
                      <p className="text-cream/50 text-xs">{entry.categoryName}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gold text-sm">{entry.averageScore}</p>
                  <p className="text-cream/50">{entry.scoresReceived} score{entry.scoresReceived !== 1 ? "s" : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      {data.length > 0 && (
        <div className="flex flex-wrap gap-4 text-xs text-cream/60 border-t border-terracotta/10 pt-4">
          <div>
            <span className="font-bold text-cream">Total Judges:</span> {totalCount}
          </div>
          <div>
            <span className="font-bold text-cream">Avg Completion:</span>{" "}
            {Math.round(data.reduce((sum, j) => sum + j.completionPercentage, 0) / data.length)}%
          </div>
          <div>
            <span className="font-bold text-cream">Complete:</span>{" "}
            {data.filter((j) => j.completionPercentage === 100).length}
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-4">
          <div className="bg-charcoal-light border border-terracotta/30 p-6 rounded-2xl max-w-3xl w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-cream/50 hover:text-cream transition-colors focus:outline-none p-1 rounded hover:bg-cream/5"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title Banner */}
            <div className="flex items-start gap-3 border-b border-terracotta/10 pb-4">
              <div className="bg-gold/10 p-2.5 rounded-xl border border-gold/20">
                <HelpCircle className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-cream">Judging & Results Guide</h3>
                <p className="text-xs text-cream/40 mt-0.5">Workflow guidelines for monitoring scoring velocity and leaderboards</p>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Left Column: Graphic */}
              <div className="md:col-span-2 space-y-3">
                <div className="w-full h-48 md:h-64 relative rounded-xl overflow-hidden border border-terracotta/20 bg-charcoal flex items-center justify-center">
                  <img
                    src="/images/voting_workflow_infographic.png"
                    alt="Judging & Live Leaderboard Workflow"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-charcoal/50 p-3 rounded-lg border border-terracotta/5 text-[11px] text-cream/50 leading-relaxed font-mono">
                  <span className="text-gold font-bold">ℹ️ Note:</span> Real-time leaderboard updates only include final submitted metrics, not draft scores.
                </div>
              </div>

              {/* Right Column: Descriptions */}
              <div className="md:col-span-3 space-y-4 max-h-[26rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-terracotta/20">
                
                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">1</span>
                    Judge Progress Cards
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    Track the evaluation percentages of assigned judges. Cards show completed evaluations, pending items, and average scoring metrics. A checkmark appears upon reaching 100% completion.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">2</span>
                    Conflict Resolution (Outliers)
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    The system automatically checks for grading conflicts or outlying score spreads. High scoring variance triggers alerts indicating potential panel conflicts that require moderator resolution.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">3</span>
                    Live Leaderboard Rankings
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    The leaderboard podium calculates average scores in real time for final rankings. It displays Top 3 winners (Gold, Silver, Bronze podium blocks) and details remaining rankings dynamically.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">4</span>
                    Scoring Deadlines & Reminders
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    Use automatic system cron notifications or manually prompt unsubmitted judges via their messaging channels to finalize calculations before publishing competition results.
                  </p>
                </div>

              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-3 border-t border-terracotta/10">
              <Button
                onClick={() => setShowHelp(false)}
                variant="primary"
                size="md"
                className="w-full md:w-36 font-bold shadow-md shadow-terracotta/10"
              >
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

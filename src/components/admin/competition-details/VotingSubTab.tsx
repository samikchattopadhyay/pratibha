"use client";

import { useEffect, useState, useCallback } from "react";
import { VotingRecord, PaginatedResponse, SubTabProps } from "@/types/competition-details";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function VotingSubTab({ competitionId }: SubTabProps) {
  const [data, setData] = useState<VotingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVotingData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/voting?${query.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch voting data");
      const { data, pagination } = await res.json() as PaginatedResponse<VotingRecord>;
      setData(data);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.totalCount);
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

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      LOCAL: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      REGIONAL: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
      NATIONAL: "bg-gold/20 text-gold border border-gold/30",
      EXPERT: "bg-red-500/10 text-red-400 border border-red-500/20",
    };
    return colors[tier] || "bg-gray-500/10 text-gray-400";
  };

  return (
    <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-serif text-base font-bold">Live Voting & Judge Progress</h3>
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
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-cream truncate">{judge.judgeName}</h4>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase mt-1 ${getTierColor(judge.tier)}`}>
                    {judge.tier}
                  </span>
                </div>
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

              {/* Status Badge */}
              <div className="flex gap-2">
                {judge.completionPercentage === 100 ? (
                  <span className="flex-1 px-2 py-1.5 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 text-center">
                    ✓ Complete
                  </span>
                ) : judge.completionPercentage >= 75 ? (
                  <span className="flex-1 px-2 py-1.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 text-center">
                    In Progress
                  </span>
                ) : (
                  <span className="flex-1 px-2 py-1.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-center">
                    Pending
                  </span>
                )}
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
    </div>
  );
}

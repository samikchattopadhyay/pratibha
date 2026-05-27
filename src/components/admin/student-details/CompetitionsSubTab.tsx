"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { PaginatedResponse, StudentRegistrationEntry } from "@/types/student-details";
import Loading from "@/components/Loading";

interface CompetitionsSubTabProps {
  readonly studentId: string;
}

export default function CompetitionsSubTab({ studentId }: CompetitionsSubTabProps) {
  const [data, setData] = useState<PaginatedResponse<StudentRegistrationEntry> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("ALL");

  const fetchCompetitions = async (pageNum: number, filterValue: string) => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
        filter: filterValue,
      });

      const res = await fetch(
        `${baseUrl}/api/admin/students/${studentId}/competitions?${params}`,
        { cache: "no-store" }
      );

      if (res.ok) {
        const result = await res.json();
        setData(result);
        setCurrentPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch competitions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCompetitions(1, "ALL");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
    fetchCompetitions(1, newFilter);
  };

  const handlePageChange = (newPage: number) => {
    fetchCompetitions(newPage, filter);
  };

  if (isLoading && !data) {
    return <Loading variant="overlay" text="Loading competitions..." />;
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg p-8 text-center">
        <p className="text-cream/60">No competitions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "VERIFIED", "PENDING", "PAID", "AWARDED"].map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === f
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal"
                : "bg-charcoal-light border border-cream/10 text-cream/60 hover:text-cream"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-terracotta/20 dark:border-terracotta/30 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-terracotta/20 dark:border-terracotta/30 bg-charcoal-light">
              <th className="px-4 py-3 text-left font-bold text-cream">Competition</th>
              <th className="px-4 py-3 text-left font-bold text-cream">Category</th>
              <th className="px-4 py-3 text-left font-bold text-cream">Status</th>
              <th className="px-4 py-3 text-left font-bold text-cream">Payment</th>
              <th className="px-4 py-3 text-right font-bold text-cream">Score</th>
              <th className="px-4 py-3 text-right font-bold text-cream">Rank</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((reg) => (
              <tr
                key={reg.id}
                className="border-b border-terracotta/10 hover:bg-charcoal-light transition-colors"
              >
                <td className="px-4 py-3 text-cream">
                  <Link
                    href={`/admin/dashboard?tab=competitions`}
                    className="hover:text-gold transition-colors"
                  >
                    {reg.competitionTitle}
                  </Link>
                </td>
                <td className="px-4 py-3 text-cream/80">{reg.categoryName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      reg.status === "VERIFIED"
                        ? "bg-green-500/20 text-green-400"
                        : reg.status === "PENDING_VERIFICATION"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {reg.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      reg.paymentStatus === "SUCCESS"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {reg.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-cream">
                  {reg.scoringFinalized && reg.finalScore ? (
                    <div>
                      <p className="font-bold text-gold">{reg.finalScore.toFixed(1)}</p>
                      <p className="text-xs text-cream/50">
                        {reg.judgeAssignments.length} judges
                      </p>
                    </div>
                  ) : (
                    <p className="text-cream/50">—</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-cream">
                  {reg.finalRank ? (
                    <p className="font-bold text-gold">#{reg.finalRank}</p>
                  ) : (
                    <p className="text-cream/50">—</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.limit > 0 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-cream/60">
            Showing {(currentPage - 1) * data.limit + 1} to{" "}
            {Math.min(currentPage * data.limit, data.total)} of {data.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 rounded-lg bg-charcoal-light border border-cream/10 text-cream disabled:opacity-50"
            >
              ← Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage * data.limit >= data.total || isLoading}
              className="px-4 py-2 rounded-lg bg-charcoal-light border border-cream/10 text-cream disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

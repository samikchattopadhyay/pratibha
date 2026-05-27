"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import type { ParticipantAssignment, PaginatedResponse } from "@/types/judges-details";

interface ParticipantsSubTabProps {
  readonly judgeId: string;
}

export default function ParticipantsSubTab({ judgeId }: ParticipantsSubTabProps) {
  const [participants, setParticipants] = useState<ParticipantAssignment[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch participants on mount and when pagination/search changes
  useEffect(() => {
    const fetchParticipants = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(limit),
          ...(search && { search }),
        });

        const res = await fetch(
          `/api/admin/judges/${judgeId}/participants?${params}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error("Failed to fetch participants");

        const data: PaginatedResponse<ParticipantAssignment> = await res.json();
        setParticipants(Array.from(data.data));
        setTotal(data.total);
      } catch (err) {
        console.error("[ParticipantsSubTab] Fetch error:", err);
        setParticipants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [judgeId, currentPage, limit, search]);

  const totalPages = Math.ceil(total / limit);

  // Calculate summary metrics
  const completedCount = participants.filter(p => p.evaluationStatus === "completed").length;
  const inProgressCount = participants.filter(p => p.evaluationStatus === "in-progress").length;
  const pendingCount = participants.filter(p => p.evaluationStatus === "pending").length;
  const scoredParticipants = participants.filter(p => p.submissionScore !== null);
  const averageScore = scoredParticipants.length > 0
    ? (scoredParticipants.reduce((sum, p) => sum + (p.submissionScore || 0), 0) / scoredParticipants.length).toFixed(2)
    : "—";

  // Get page numbers for pagination
  const getPageNumbers = useMemo(() => {
    return () => {
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
  }, [totalPages, currentPage]);

  if (isLoading) {
    return <Loading variant="overlay" text="Loading participants..." />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-charcoal-light border border-terracotta/15 rounded-xl p-4 space-y-1">
          <p className="text-xs uppercase text-cream/40 font-bold tracking-wider">Total Assigned</p>
          <p className="text-2xl font-bold text-cream">{total}</p>
        </div>
        <div className="bg-charcoal-light border border-green-500/20 rounded-xl p-4 space-y-1">
          <p className="text-xs uppercase text-cream/40 font-bold tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-green-400">{completedCount}</p>
        </div>
        <div className="bg-charcoal-light border border-blue-500/20 rounded-xl p-4 space-y-1">
          <p className="text-xs uppercase text-cream/40 font-bold tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-blue-400">{inProgressCount}</p>
        </div>
        <div className="bg-charcoal-light border border-yellow-500/20 rounded-xl p-4 space-y-1">
          <p className="text-xs uppercase text-cream/40 font-bold tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="bg-charcoal-light border border-gold/20 rounded-xl p-4 space-y-1">
          <p className="text-xs uppercase text-cream/40 font-bold tracking-wider">Avg Score</p>
          <p className="text-2xl font-bold text-gold">{averageScore}</p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6">
        <h3 className="font-serif text-xl font-bold text-cream">
          Assigned Participants
        </h3>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search participants..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full bg-charcoal border border-terracotta/20 rounded-xl pl-9 pr-8 py-2.5 text-cream placeholder-cream/35 focus:outline-none focus:border-gold"
          />
          <Search className="w-4 h-4 text-cream/30 absolute left-3 top-3 pointer-events-none" />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-cream/30 hover:text-cream"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream/10">
                <th className="text-left px-4 py-3 text-cream/60 font-semibold uppercase">Name</th>
                <th className="text-left px-4 py-3 text-cream/60 font-semibold uppercase">Category</th>
                <th className="text-left px-4 py-3 text-cream/60 font-semibold uppercase">Status</th>
                <th className="text-right px-4 py-3 text-cream/60 font-semibold uppercase">Score</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-b border-cream/5 hover:bg-cream/5">
                  <td className="px-4 py-3 text-cream">{p.participantName}</td>
                  <td className="px-4 py-3 text-cream/70">{p.categoryName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      p.evaluationStatus === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : p.evaluationStatus === "in-progress"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {p.evaluationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-cream font-semibold">
                    {p.submissionScore !== null ? p.submissionScore : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {participants.length === 0 && (
          <p className="text-center text-cream/50 py-8">No participants assigned yet</p>
        )}

        {/* Pagination Controls */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-cream/10">
            <div className="text-sm text-cream/60 font-sans">
              Showing {total === 0 ? 0 : (currentPage - 1) * limit + 1} to{" "}
              {Math.min(currentPage * limit, total)} of {total} entries
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLoading}
                  variant="secondary"
                  size="md"
                >
                  Previous
                </Button>
                {getPageNumbers().map((p, idx) => (
                  <Button
                    key={idx}
                    onClick={() => typeof p === "number" && setCurrentPage(p)}
                    disabled={p === "..." || isLoading}
                    variant={p === currentPage ? "primary" : (p === "..." ? "ghost" : "secondary")}
                    size="md"
                    className={p === "..." ? "cursor-default" : ""}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  variant="secondary"
                  size="md"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import Loading from "@/components/Loading";
import type { ParticipantAssignment, PaginatedResponse } from "@/types/judges-details";

interface ParticipantsSubTabProps {
  readonly judgeId: string;
}

export default function ParticipantsSubTab({ judgeId }: ParticipantsSubTabProps) {
  const [participants, setParticipants] = useState<ParticipantAssignment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch participants on mount and when pagination/search changes
  useEffect(() => {
    const fetchParticipants = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
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
  }, [judgeId, page, limit, search]);

  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return <Loading variant="overlay" text="Loading participants..." />;
  }

  return (
    <div className="space-y-6">
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
              setPage(0); // Reset to first page on search
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t border-cream/10">
            <p className="text-sm text-cream/60">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded hover:bg-cream/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-2 rounded hover:bg-cream/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

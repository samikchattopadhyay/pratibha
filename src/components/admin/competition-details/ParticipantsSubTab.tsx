"use client";

import { useEffect, useState, useCallback } from "react";
import { ParticipantRecord, PaginatedResponse, SubTabProps } from "@/types/competition-details";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { Check, X, HelpCircle } from "lucide-react";

type FilterType = "ALL" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "DISQUALIFIED";

export default function ParticipantsSubTab({ competitionId }: SubTabProps) {
  const [data, setData] = useState<ParticipantRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    // eslint-disable-next-line
    setCurrentPage(1);
  }, [filter, debouncedSearch]);

  // Fetch participants
  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        filter,
        search: debouncedSearch,
      });
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/participants?${query.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch participants");
      const { data, pagination } = await res.json() as PaginatedResponse<ParticipantRecord>;
      setData(data);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [competitionId, currentPage, filter, debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchParticipants();
  }, [fetchParticipants]);

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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING_VERIFICATION: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      VERIFIED: "bg-green-500/20 text-green-400 border border-green-500/30",
      REJECTED: "bg-red-500/20 text-red-400 border border-red-500/30",
      DISQUALIFIED: "bg-red-600/20 text-red-300 border border-red-600/30",
    };
    return styles[status] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-serif text-base font-bold flex items-center gap-2">
          Competition Participants
          <button
            onClick={() => setShowHelp(true)}
            className="text-cream/40 hover:text-gold transition-colors focus:outline-none p-1 rounded hover:bg-cream/5"
            title="Show Participant Guidelines"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </h3>
        <p className="text-sm text-cream/50 mt-1">
          Manage registrations, verify entries, and assign judges for this competition
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Filters & Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(["ALL", "PENDING_VERIFICATION", "VERIFIED", "REJECTED", "DISQUALIFIED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                filter === f
                  ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal"
                  : "bg-cream/5 text-cream/60 hover:bg-cream/10 hover:text-cream"
              }`}
            >
              {f === "ALL"
                ? "All Entries"
                : f === "PENDING_VERIFICATION"
                  ? "Pending"
                  : f === "VERIFIED"
                    ? "Verified"
                    : f === "REJECTED"
                      ? "Rejected"
                      : "Disqualified"}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by registration ID or student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-charcoal border border-terracotta/30 rounded-lg p-2.5 text-cream text-sm focus:outline-none focus:border-terracotta"
        />
      </div>

      {/* Loading Overlay */}
      {loading && <Loading variant="overlay" text="Loading participants..." />}

      {/* Participants Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-terracotta/10">
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Registration ID</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Student Name</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Category</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Status</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Payment</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Judges Assigned</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="border-b border-terracotta/5 hover:bg-cream/5 transition-colors">
                  <td className="px-4 py-3 text-cream/80 font-mono text-xs">{row.registrationId}</td>
                  <td className="px-4 py-3 text-cream">{row.studentName}</td>
                  <td className="px-4 py-3 text-cream/70 text-xs">{row.categoryName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase inline-block ${getStatusBadge(row.status)}`}>
                      {row.status === "PENDING_VERIFICATION" ? "Pending" : row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.paymentStatus === "SUCCESS" ? (
                      <span className="flex items-center gap-1 text-green-400 text-xs font-bold">
                        <Check className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                        <X className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {row.assignedJudges.length > 0 ? (
                      <div className="space-y-1">
                        {row.assignedJudges.map((judge) => (
                          <div key={judge.id} className="flex items-center gap-1">
                            <span className="text-cream/80">{judge.name}</span>
                            {judge.score && <span className="text-gold font-bold">({judge.score})</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-cream/40 italic">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-cream/40 italic">
                  No participants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount > 10 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-terracotta/10">
          <div className="text-sm text-cream/60 font-sans">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, totalCount)} of {totalCount} participants
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

      {/* Summary */}
      <div className="flex flex-wrap gap-4 text-xs text-cream/60 border-t border-terracotta/10 pt-4">
        <div>
          <span className="font-bold text-cream">Total Entries:</span> {totalCount}
        </div>
        <div>
          <span className="font-bold text-cream">Verified:</span> {data.filter((d) => d.status === "VERIFIED").length}
        </div>
        <div>
          <span className="font-bold text-cream">Unassigned Judges:</span>{" "}
          {data.filter((d) => d.assignedJudges.length === 0).length}
        </div>
      </div>

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
                <h3 className="font-serif text-xl font-bold text-cream">Participant Verification Guide</h3>
                <p className="text-xs text-cream/40 mt-0.5">Workflow guidelines for managing registrations and judge assignments</p>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Left Column: Graphic */}
              <div className="md:col-span-2 space-y-3">
                <div className="w-full h-48 md:h-64 relative rounded-xl overflow-hidden border border-terracotta/20 bg-charcoal flex items-center justify-center">
                  <img
                    src="/images/participants_workflow_infographic.png"
                    alt="Participants Verification Workflow"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-charcoal/50 p-3 rounded-lg border border-terracotta/5 text-[11px] text-cream/50 leading-relaxed font-mono">
                  <span className="text-gold font-bold">ℹ️ Note:</span> Payment status matches Razorpay integrations, while judge lists are custom per category grouping.
                </div>
              </div>

              {/* Right Column: Descriptions */}
              <div className="md:col-span-3 space-y-4 max-h-[26rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-terracotta/20">
                
                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">1</span>
                    Review Submissions
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    Examine each registrant profile, student details, and age classification. Confirm that the selected category matches the age ranges required by division specifications.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">2</span>
                    Reconcile Payments
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    Verify the registration Payment status. Succesfully paid registrations show <strong className="text-green-400">Paid</strong> and are eligible for verification approval. Unpaid registrations remain in sandbox stage until checked.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">3</span>
                    Verify Entry Approved
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    Approving a participant switches their state to <strong className="text-green-400">VERIFIED</strong>, placing them into active queues so judges can access their submissions on their own panels.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">4</span>
                    Panel Judge Assignments
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    Assign authorized evaluators to review the entrants' submissions. Once assigned, you can monitor individual scoring marks directly from the registry grid.
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

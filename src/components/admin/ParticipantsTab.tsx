"use client";

import { Eye, Search } from "lucide-react";
import Button from "@/components/Button";

export interface Judge {
  id: string;
  name: string;
  evaluationCount?: number;
  pendingCount?: number;
  averageScore?: string;
  isOutlier?: boolean;
  deviationPercentage?: string;
  speed?: string;
  consistency?: string;
}

export interface Registration {
  id: string;
  registrationId: string;
  studentName: string;
  competitionTitle: string;
  categoryName: string;
  fbPostUrl: string;
  paymentStatus: string;
  status: string;
  scoringFinalized?: boolean;
  createdAt?: Date | string;
  assignments: {
    id: string;
    judgeName: string;
    isSubmitted: boolean;
    score: number | null;
  }[];
}

interface ParticipantsTabProps {
  registrations: Registration[];
  loading: boolean;
  filter: string;
  setFilter: (f: string) => void;
  search: string;
  setSearch: (s: string) => void;
  judges: Judge[];
  handleVerifyEntry: (id: string) => Promise<void>;
  handleAssignJudge: (regId: string, judgeId: string) => Promise<void>;
  limit: number;
  setLimit: (l: number) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalCount: number;
  totalPages: number;
  navigateToTab: (tab: string) => void;
}

export default function ParticipantsTab({
  registrations,
  loading,
  filter,
  setFilter,
  search,
  setSearch,
  judges,
  handleVerifyEntry,
  handleAssignJudge,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalCount,
  totalPages,
  navigateToTab,
}: ParticipantsTabProps) {
  // Truncated pagination layout generator
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
    <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6 shadow-md relative">
      {/* Filter / Search Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["ALL", "PENDING", "PAID", "UNASSIGNED"].map(f => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? "primary" : "secondary"}
              size="md"
            >
              {f}
            </Button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 font-sans text-sm bg-charcoal border border-terracotta/20 rounded-lg pl-9 pr-4 py-2 text-cream focus:outline-none focus:border-terracotta"
          />
          <Search className="w-4 h-4 text-cream/40 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="overflow-x-auto relative font-sans">
        <table className="w-full text-left font-sans text-sm border-collapse">
          <thead>
            <tr className="border-b border-terracotta/10 text-cream/50 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Entry Details</th>
              <th className="py-3.5 px-4">Submission & Status</th>
              <th className="py-3.5 px-4">Examiner Panel</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-terracotta/5">
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-cream/40 font-medium">
                  No submissions matched the filters.
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-charcoal/45 transition-colors">
                  <td className="py-4 px-4 space-y-2">
                    <div className="font-bold text-cream text-sm">{reg.registrationId}</div>
                    <div className="font-semibold text-cream">{reg.studentName}</div>
                    <div className="text-cream-dark text-sm">{reg.competitionTitle}</div>
                    <div className="text-cream/50 text-sm">{reg.categoryName}</div>
                  </td>
                  <td className="py-4 px-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={reg.fbPostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:underline font-semibold flex items-center gap-1 text-sm"
                      >
                        <Eye className="w-4 h-4" /> Video
                      </a>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                      {reg.paymentStatus === "SUCCESS" ? (
                        <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-bold text-sm uppercase">Paid</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-bold text-sm uppercase">Unpaid</span>
                      )}
                      {reg.status === "VERIFIED" ? (
                        <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-bold text-sm uppercase">Approved</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-bold text-sm uppercase">Pending</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 space-y-1">
                    {reg.assignments.length === 0 ? (
                      <span className="text-sm text-cream/40 italic">Not Assigned</span>
                    ) : (
                      reg.assignments.map(a => (
                        <div key={a.id} className="flex items-center gap-1.5 text-sm">
                          <span
                            onClick={() => {
                              navigateToTab("judges");
                              setSearch(a.judgeName);
                            }}
                            className="font-semibold text-gold cursor-pointer hover:underline"
                          >
                            {a.judgeName.split(" ")[1] || a.judgeName}
                          </span>
                          {a.isSubmitted ? (
                            <span className="text-green-400 font-bold">(Score: {a.score})</span>
                          ) : (
                            <span className="text-yellow-400 font-semibold">(Pending)</span>
                          )}
                        </div>
                      ))
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 flex-col sm:flex-row">
                      {reg.status === "PENDING_VERIFICATION" && (
                        <Button
                          onClick={() => handleVerifyEntry(reg.id)}
                          variant="ghost"
                          size="md"
                          className="bg-green-700 hover:bg-green-800 text-white w-full sm:w-auto"
                          title="Approve Submission"
                        >
                          Approve
                        </Button>
                      )}

                      <select
                        onChange={(e) => handleAssignJudge(reg.id, e.target.value)}
                        defaultValue=""
                        className="bg-charcoal border border-terracotta/30 rounded px-2 py-1.5 text-sm text-cream focus:outline-none focus:border-terracotta w-full sm:w-auto"
                      >
                        <option value="" disabled>+ Assign Examiner</option>
                        {judges.map(j => (
                          <option key={j.id} value={j.id}>{j.name}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-terracotta/10">
        <div className="flex items-center gap-2 text-sm text-cream/60 font-sans">
          <span>Show</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
            className="bg-charcoal border border-terracotta/30 rounded px-2 py-1 text-sm text-cream font-semibold focus:outline-none"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>entries</span>
          <span className="mx-2 text-terracotta/20">|</span>
          <span>
            Showing {totalCount === 0 ? 0 : (currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, totalCount)} of {totalCount} entries
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              variant="secondary"
              size="md"
            >
              Previous
            </Button>
            {getPageNumbers().map((p, idx) => (
              <Button
                key={idx}
                onClick={() => typeof p === "number" && setCurrentPage(p)}
                disabled={p === "..." || loading}
                variant={p === currentPage ? "primary" : (p === "..." ? "ghost" : "secondary")}
                size="md"
                className={p === "..." ? "cursor-default" : ""}
              >
                {p}
              </Button>
            ))}
            <Button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
              variant="secondary"
              size="md"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

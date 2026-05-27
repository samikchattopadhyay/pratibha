"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Eye, Search, ChevronDown, ChevronUp, Download, CheckSquare, Square, User } from "lucide-react";
import Button from "@/components/Button";

export interface Judge {
  id: string;
  name: string;
  email?: string;
  evaluationCount?: number;
  pendingCount?: number;
  averageScore?: string;
  isOutlier?: boolean;
  deviationPercentage?: string;
  speed?: string;
  consistency?: string;
  specializations?: string[];
  tier?: string;
  bio?: string;
  credentials?: string;
  stateOfResidence?: string;
  states?: string[];
  languages?: string[];
  yearsOfExperience?: number;
  isVerified?: boolean;
  isAvailable?: boolean;
}

export interface Registration {
  id: string;
  registrationId: string;
  studentId: string;
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

type SortField = "name" | "date" | "status" | "payment" | "assignments";
type SortDirection = "asc" | "desc";

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
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [verificationFilter, setVerificationFilter] = useState<"ALL" | "VERIFIED" | "PENDING">("ALL");
  const [assignmentFilter, setAssignmentFilter] = useState<"ALL" | "ASSIGNED" | "UNASSIGNED">("ALL");
  const [selectedJudgeFilter, setSelectedJudgeFilter] = useState<string>("ALL");

  const metrics = useMemo(() => {
    const verified = registrations.filter(r => r.status === "VERIFIED").length;
    const pending = registrations.filter(r => r.status === "PENDING_VERIFICATION").length;
    const unassigned = registrations.filter(r => r.assignments.length === 0).length;
    const paid = registrations.filter(r => r.paymentStatus === "SUCCESS").length;
    const paymentRate = totalCount > 0 ? Math.round((paid / totalCount) * 100) : 0;

    const judgeWorkload = judges.map(j => ({
      ...j,
      pendingCount: registrations.filter(r =>
        r.assignments.some(a => a.judgeName === j.name && !a.isSubmitted)
      ).length
    }));

    const categoryDistribution = registrations.reduce((acc, r) => {
      acc[r.categoryName] = (acc[r.categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { verified, pending, unassigned, paid, paymentRate, judgeWorkload, categoryDistribution };
  }, [registrations, judges, totalCount]);

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === registrations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(registrations.map(r => r.id)));
    }
  };

  const handleBulkVerify = async () => {
    for (const id of selectedIds) {
      await handleVerifyEntry(id);
    }
    setSelectedIds(new Set());
  };

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (verificationFilter !== "ALL" && reg.status !== verificationFilter) return false;
    if (assignmentFilter === "ASSIGNED" && reg.assignments.length === 0) return false;
    if (assignmentFilter === "UNASSIGNED" && reg.assignments.length > 0) return false;
    if (selectedJudgeFilter !== "ALL" && !reg.assignments.some(a => a.judgeName === selectedJudgeFilter)) return false;
    return true;
  });

  const exportToCSV = () => {
    const headers = ["Registration ID", "Student Name", "Competition", "Category", "Payment", "Status", "Assigned Examiners"];
    const rows = registrations.map(reg => [
      reg.registrationId,
      reg.studentName,
      reg.competitionTitle,
      reg.categoryName,
      reg.paymentStatus,
      reg.status,
      reg.assignments.map(a => a.judgeName).join("; ") || "Unassigned"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `participants_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-charcoal-light border border-terracotta/20 rounded-xl p-4">
          <div className="text-cream/60 text-xs font-bold uppercase">Total</div>
          <div className="text-2xl font-bold text-gold mt-1">{totalCount}</div>
          <div className="text-cream/40 text-xs mt-1">Registrations</div>
        </div>
        <div className="bg-charcoal-light border border-green-500/20 rounded-xl p-4">
          <div className="text-cream/60 text-xs font-bold uppercase">Verified</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{metrics.verified}</div>
          <div className="text-cream/40 text-xs mt-1">Approved</div>
        </div>
        <div className="bg-charcoal-light border border-yellow-500/20 rounded-xl p-4">
          <div className="text-cream/60 text-xs font-bold uppercase">Pending</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">{metrics.pending}</div>
          <div className="text-cream/40 text-xs mt-1">Verification</div>
        </div>
        <div className="bg-charcoal-light border border-orange-500/20 rounded-xl p-4">
          <div className="text-cream/60 text-xs font-bold uppercase">Unassigned</div>
          <div className="text-2xl font-bold text-orange-400 mt-1">{metrics.unassigned}</div>
          <div className="text-cream/40 text-xs mt-1">Examiners</div>
        </div>
        <div className="bg-charcoal-light border border-terracotta/20 rounded-xl p-4">
          <div className="text-cream/60 text-xs font-bold uppercase">Payment Rate</div>
          <div className="text-2xl font-bold text-terracotta mt-1">{metrics.paymentRate}%</div>
          <div className="text-cream/40 text-xs mt-1">{metrics.paid} Paid</div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-4 shadow-md">
        {/* Primary Filters */}
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

        {/* Secondary Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-terracotta/10">
          <div>
            <label className="text-xs font-bold text-cream/60 uppercase block mb-2">Status</label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value as any)}
              className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-terracotta"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="PENDING">Pending Only</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-cream/60 uppercase block mb-2">Assignment</label>
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value as any)}
              className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-terracotta"
            >
              <option value="ALL">All</option>
              <option value="ASSIGNED">Assigned Only</option>
              <option value="UNASSIGNED">Unassigned Only</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-cream/60 uppercase block mb-2">Examiner</label>
            <select
              value={selectedJudgeFilter}
              onChange={(e) => setSelectedJudgeFilter(e.target.value)}
              className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-terracotta"
            >
              <option value="ALL">All Examiners</option>
              {metrics.judgeWorkload.map(j => (
                <option key={j.id} value={j.name}>
                  {j.name.split(" ")[1]} ({j.pendingCount} pending)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={exportToCSV} variant="outline" size="md" className="flex-1">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between gap-4 p-3 bg-terracotta/10 border border-terracotta/20 rounded-lg mt-2">
            <span className="text-sm font-semibold text-cream">
              {selectedIds.size} selected
            </span>
            <Button
              onClick={handleBulkVerify}
              variant="ghost"
              size="md"
              className="bg-green-700 hover:bg-green-800 text-white"
            >
              Bulk Verify ({selectedIds.size})
            </Button>
          </div>
        )}
      </div>

      {/* Submissions Table */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 shadow-md">
        <div className="overflow-x-auto relative font-sans">
          <table className="w-full text-left font-sans text-sm border-collapse">
            <thead>
              <tr className="border-b border-terracotta/10 text-cream/50 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-8">
                  <button
                    onClick={handleSelectAll}
                    className="text-cream/60 hover:text-cream transition"
                    title={selectedIds.size === registrations.length ? "Deselect all" : "Select all"}
                  >
                    {selectedIds.size === registrations.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-cream" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1.5">
                    Entry Details {getSortIcon("name")}
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-cream" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-1.5">
                    Submission & Status {getSortIcon("status")}
                  </div>
                </th>
                <th className="py-3.5 px-4">Examiner Panel</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terracotta/5">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-cream/40 font-medium">
                    No submissions matched the filters.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-charcoal/45 transition-colors">
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleSelect(reg.id)}
                        className="text-cream/60 hover:text-cream transition"
                      >
                        {selectedIds.has(reg.id) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
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
                          <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-bold text-xs uppercase">Paid</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-bold text-xs uppercase">Unpaid</span>
                        )}
                        {reg.status === "VERIFIED" ? (
                          <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-bold text-xs uppercase">Approved</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-bold text-xs uppercase">Pending</span>
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
                        <Link
                          href={`/admin/students/${reg.studentId}`}
                          className="px-2.5 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white w-full sm:w-auto text-xs font-semibold flex items-center justify-center gap-1.5"
                          title="View Student Profile"
                        >
                          <User className="w-3.5 h-3.5" /> Profile
                        </Link>

                        {reg.status === "PENDING_VERIFICATION" && (
                          <Button
                            onClick={() => handleVerifyEntry(reg.id)}
                            variant="ghost"
                            size="md"
                            className="bg-green-700 hover:bg-green-800 text-white w-full sm:w-auto text-xs"
                            title="Approve Submission"
                          >
                            Approve
                          </Button>
                        )}

                        <select
                          onChange={(e) => handleAssignJudge(reg.id, e.target.value)}
                          defaultValue=""
                          className="bg-charcoal border border-terracotta/30 rounded px-2 py-1.5 text-xs text-cream focus:outline-none focus:border-terracotta w-full sm:w-auto"
                        >
                          <option value="" disabled>+ Assign</option>
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
    </div>
  );
}

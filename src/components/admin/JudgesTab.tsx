"use client";

import { AlertTriangle } from "lucide-react";
import Button from "@/components/Button";
import { Judge, Registration } from "./ParticipantsTab";

export interface KanbanCard {
  id: string;
  status: string;
  name: string;
  score?: number;
  category: string;
  judge: string;
}

interface JudgesTabProps {
  judges: Judge[];
  registrations: Registration[];
  kanbanCards: KanbanCard[];
  itemsPerPage: number;
  kanbanPendingPage: number;
  setKanbanPendingPage: React.Dispatch<React.SetStateAction<number>>;
  kanbanInReviewPage: number;
  setKanbanInReviewPage: React.Dispatch<React.SetStateAction<number>>;
  kanbanCompletedPage: number;
  setKanbanCompletedPage: React.Dispatch<React.SetStateAction<number>>;
  kanbanConflictPage: number;
  setKanbanConflictPage: React.Dispatch<React.SetStateAction<number>>;
  navigateToTab: (tab: string) => void;
  setSearch: (search: string) => void;
  moveKanbanCard: (cardId: string, nextStatus: string) => Promise<void>;
}

export default function JudgesTab({
  judges,
  registrations,
  kanbanCards,
  itemsPerPage,
  kanbanPendingPage,
  setKanbanPendingPage,
  kanbanInReviewPage,
  setKanbanInReviewPage,
  kanbanCompletedPage,
  setKanbanCompletedPage,
  kanbanConflictPage,
  setKanbanConflictPage,
  navigateToTab,
  setSearch,
  moveKanbanCard,
}: JudgesTabProps) {
  const getPageNumbers = () => {
    const totalPages = Math.ceil((registrations?.filter(reg => reg.assignments.length > 0).length || 0) / itemsPerPage);
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, kanbanPendingPage - 1);
      const end = Math.min(totalPages - 1, kanbanPendingPage + 1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const queueTotalPages = Math.ceil((registrations?.filter(reg => reg.assignments.length > 0).length || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      
      {/* Workload Tracker */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-4">
        <h3 className="font-serif text-base font-bold">Jury Panel Workload & Outlier Audit</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {judges && judges.length > 0 ? (
            judges.slice(0, 3).map((j: Judge) => (
              <div
                key={j.id}
                onClick={() => {
                  navigateToTab("participants");
                  setSearch(j.name);
                }}
                className={`p-4 bg-charcoal rounded-xl border cursor-pointer hover:border-terracotta/40 transition-all select-none ${
                  j.isOutlier ? "border-yellow-500/20 hover:bg-charcoal-light" : "border-terracotta/5 hover:bg-charcoal-light"
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigateToTab("participants");
                    setSearch(j.name);
                  }
                }}
              >
                <div className={`font-bold flex items-center gap-1 ${j.isOutlier ? "text-yellow-400" : "text-cream"}`}>
                  {j.isOutlier && <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{j.name}</span>
                  {j.isOutlier && <span>(Outlier Flagged)</span>}
                </div>
                <div className="flex justify-between items-center mt-2 text-sm text-cream/60">
                  <span>Avg Score Consistency: {j.consistency || "N/A"}</span>
                  <span>Grading Speed: {j.speed || "N/A"}</span>
                </div>
                {j.isOutlier && (
                  <p className="text-sm text-cream/50 mt-1">
                    Average points given deviates by {j.deviationPercentage}% from jury benchmark.
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-cream/50 col-span-3">No active jury panel found.</p>
          )}
        </div>
      </div>

      {/* ACTIVE ASSIGNMENTS QUEUE */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-4 shadow-md">
        <h3 className="font-serif text-base font-bold">Active Submissions Queue</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-terracotta/15 text-cream/50 text-sm font-bold">
                <th className="py-3 px-4">Participant & ID</th>
                <th className="py-3 px-4">Status & Category</th>
                <th className="py-3 px-4">Jury Allocation</th>
                <th className="py-3 px-4">Current Score</th>
                <th className="py-3 px-4">Jury Discrepancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terracotta/10 text-cream">
              {registrations && registrations.filter(reg => reg.assignments.length > 0).length > 0 ? (
                registrations
                  .filter(reg => reg.assignments.length > 0)
                  .slice((kanbanPendingPage - 1) * itemsPerPage, kanbanPendingPage * itemsPerPage)
                  .map((reg) => (
                    <tr key={reg.id} className="hover:bg-charcoal/30 text-sm">
                      <td className="py-4 px-4 font-semibold">
                        <div>{reg.studentName}</div>
                        <div className="text-xs text-cream/40">{reg.registrationId}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div>{reg.categoryName}</div>
                        <div className="text-xs text-cream/40">{reg.competitionTitle}</div>
                      </td>
                      <td className="py-4 px-4 font-medium">
                        {reg.assignments.map(a => a.judgeName).join(" & ")}
                      </td>
                      <td className="py-4 px-4 font-serif text-gold font-bold">
                        {reg.assignments.map(a => a.score !== null ? `${a.score} pts` : "Pending").join(" / ")}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          !reg.assignments[0]?.isSubmitted
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-green-500/10 text-green-400"
                        }`}>
                          {!reg.assignments[0]?.isSubmitted ? "High" : "Low"}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-cream/40">No assignments in queue.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {registrations && registrations.filter(reg => reg.assignments.length > 0).length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-terracotta/10">
            <div className="text-sm text-cream/60 font-sans">
              Showing {(kanbanPendingPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(kanbanPendingPage * itemsPerPage, registrations.filter(reg => reg.assignments.length > 0).length)} of{" "}
              {registrations.filter(reg => reg.assignments.length > 0).length} assignments
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <Button
                onClick={() => setKanbanPendingPage(prev => Math.max(1, prev - 1))}
                disabled={kanbanPendingPage === 1}
                variant="secondary"
                size="md"
              >
                Previous
              </Button>
              {getPageNumbers().map((page, idx) => (
                <Button
                  key={idx}
                  onClick={() => typeof page === "number" && setKanbanPendingPage(page)}
                  disabled={page === "..."}
                  variant={page === kanbanPendingPage ? "primary" : (page === "..." ? "ghost" : "secondary")}
                  size="md"
                  className={page === "..." ? "cursor-default" : ""}
                >
                  {page}
                </Button>
              ))}
              <Button
                onClick={() => setKanbanPendingPage(prev => Math.min(queueTotalPages, prev + 1))}
                disabled={kanbanPendingPage === queueTotalPages}
                variant="secondary"
                size="md"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* PENDING COLUMN */}
        {(() => {
          const columnCards = kanbanCards ? kanbanCards.filter(c => c.status === "PENDING") : [];
          const totalColumnPages = Math.ceil(columnCards.length / itemsPerPage);
          const paginatedCards = columnCards.slice((kanbanPendingPage - 1) * itemsPerPage, kanbanPendingPage * itemsPerPage);
          return (
            <div className="border border-cream/20 bg-cream/5 rounded-2xl p-4 flex flex-col gap-3 min-h-[500px]">
              <h4 className="text-sm font-bold uppercase tracking-wider border-b border-cream/10 pb-2">
                Pending Evaluation
                <span className="text-cream/50 font-normal text-[9px] ml-2">({columnCards.length})</span>
              </h4>
              <div className="flex-1 space-y-2">
                {paginatedCards.length > 0 ? (
                  paginatedCards.map(card => (
                    <div key={card.id} className="bg-charcoal border border-terracotta/10 rounded-xl p-3.5 space-y-2 text-sm relative group shadow-sm">
                      <div className="flex justify-between font-bold">
                        <span>{card.name}</span>
                        {card.score && <span className="text-gold font-serif">{card.score} pts</span>}
                      </div>
                      <p className="text-sm text-cream/50">{card.category} | Assigned: {card.judge}</p>
                      <div className="pt-2 flex gap-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => moveKanbanCard(card.id, "IN_REVIEW")} variant="ghost" size="md" className="text-sm h-auto px-1 py-0.5">Review</Button>
                        <Button onClick={() => moveKanbanCard(card.id, "COMPLETED")} variant="ghost" size="md" className="text-sm h-auto px-1 py-0.5 bg-green-700/50">Approve</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-cream/40 italic">No items in this queue</p>
                )}
              </div>
              {columnCards.length > itemsPerPage && (
                <div className="border-t border-cream/10 pt-2 flex items-center justify-between">
                  <span className="text-sm text-cream/50">{(kanbanPendingPage - 1) * itemsPerPage + 1}-{Math.min(kanbanPendingPage * itemsPerPage, columnCards.length)}</span>
                  <div className="flex gap-1">
                    <Button onClick={() => setKanbanPendingPage(prev => Math.max(1, prev - 1))} disabled={kanbanPendingPage === 1} variant="secondary" size="md" className="text-sm h-auto px-2 py-0.5">←</Button>
                    <span className="text-sm text-cream/50 px-1.5">{kanbanPendingPage}/{totalColumnPages}</span>
                    <Button onClick={() => setKanbanPendingPage(prev => Math.min(totalColumnPages, prev + 1))} disabled={kanbanPendingPage === totalColumnPages} variant="secondary" size="md" className="text-sm h-auto px-2 py-0.5">→</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* IN REVIEW COLUMN */}
        {(() => {
          const columnCards = kanbanCards ? kanbanCards.filter(c => c.status === "IN_REVIEW") : [];
          const totalColumnPages = Math.ceil(columnCards.length / itemsPerPage);
          const paginatedCards = columnCards.slice((kanbanInReviewPage - 1) * itemsPerPage, kanbanInReviewPage * itemsPerPage);
          return (
            <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-2xl p-4 flex flex-col gap-3 min-h-[500px]">
              <h4 className="text-sm font-bold uppercase tracking-wider border-b border-cream/10 pb-2">
                In Jury Review
                <span className="text-cream/50 font-normal text-[9px] ml-2">({columnCards.length})</span>
              </h4>
              <div className="flex-1 space-y-2">
                {paginatedCards.length > 0 ? (
                  paginatedCards.map(card => (
                    <div key={card.id} className="bg-charcoal border border-terracotta/10 rounded-xl p-3.5 space-y-2 text-sm relative group shadow-sm">
                      <div className="flex justify-between font-bold">
                        <span>{card.name}</span>
                        {card.score && <span className="text-gold font-serif">{card.score} pts</span>}
                      </div>
                      <p className="text-sm text-cream/50">{card.category} | Assigned: {card.judge}</p>
                      <div className="pt-2 flex gap-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => moveKanbanCard(card.id, "PENDING")} variant="ghost" size="md" className="text-sm h-auto px-1 py-0.5">Re-queue</Button>
                        <Button onClick={() => moveKanbanCard(card.id, "COMPLETED")} variant="ghost" size="md" className="text-sm h-auto px-1 py-0.5 bg-green-700/50">Approve</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-cream/40 italic">No items in this queue</p>
                )}
              </div>
              {columnCards.length > itemsPerPage && (
                <div className="border-t border-cream/10 pt-2 flex items-center justify-between">
                  <span className="text-sm text-cream/50">{(kanbanInReviewPage - 1) * itemsPerPage + 1}-{Math.min(kanbanInReviewPage * itemsPerPage, columnCards.length)}</span>
                  <div className="flex gap-1">
                    <Button onClick={() => setKanbanInReviewPage(prev => Math.max(1, prev - 1))} disabled={kanbanInReviewPage === 1} variant="secondary" size="md" className="text-sm h-auto px-2 py-0.5">←</Button>
                    <span className="text-sm text-cream/50 px-1.5">{kanbanInReviewPage}/{totalColumnPages}</span>
                    <Button onClick={() => setKanbanInReviewPage(prev => Math.min(totalColumnPages, prev + 1))} disabled={kanbanInReviewPage === totalColumnPages} variant="secondary" size="md" className="text-sm h-auto px-2 py-0.5">→</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* COMPLETED COLUMN */}
        {(() => {
          const columnCards = kanbanCards ? kanbanCards.filter(c => c.status === "COMPLETED") : [];
          const totalColumnPages = Math.ceil(columnCards.length / itemsPerPage);
          const paginatedCards = columnCards.slice((kanbanCompletedPage - 1) * itemsPerPage, kanbanCompletedPage * itemsPerPage);
          return (
            <div className="border border-green-500/20 bg-green-500/5 rounded-2xl p-4 flex flex-col gap-3 min-h-[500px]">
              <h4 className="text-sm font-bold uppercase tracking-wider border-b border-cream/10 pb-2">
                Scoring Finalized
                <span className="text-cream/50 font-normal text-[9px] ml-2">({columnCards.length})</span>
              </h4>
              <div className="flex-1 space-y-2">
                {paginatedCards.length > 0 ? (
                  paginatedCards.map(card => (
                    <div key={card.id} className="bg-charcoal border border-terracotta/10 rounded-xl p-3.5 space-y-2 text-sm relative group shadow-sm">
                      <div className="flex justify-between font-bold">
                        <span>{card.name}</span>
                        {card.score && <span className="text-gold font-serif">{card.score} pts</span>}
                      </div>
                      <p className="text-sm text-cream/50">{card.category} | Assigned: {card.judge}</p>
                      <div className="pt-2 flex gap-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => moveKanbanCard(card.id, "PENDING")} variant="ghost" size="md" className="text-sm h-auto px-1 py-0.5">Re-queue</Button>
                        <Button onClick={() => moveKanbanCard(card.id, "IN_REVIEW")} variant="ghost" size="md" className="text-sm h-auto px-1 py-0.5">Review</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-cream/40 italic">No items in this queue</p>
                )}
              </div>
              {columnCards.length > itemsPerPage && (
                <div className="border-t border-cream/10 pt-2 flex items-center justify-between">
                  <span className="text-sm text-cream/50">{(kanbanCompletedPage - 1) * itemsPerPage + 1}-{Math.min(kanbanCompletedPage * itemsPerPage, columnCards.length)}</span>
                  <div className="flex gap-1">
                    <Button onClick={() => setKanbanCompletedPage(prev => Math.max(1, prev - 1))} disabled={kanbanCompletedPage === 1} variant="secondary" size="md" className="text-sm h-auto px-2 py-0.5">←</Button>
                    <span className="text-sm text-cream/50 px-1.5">{kanbanCompletedPage}/{totalColumnPages}</span>
                    <Button onClick={() => setKanbanCompletedPage(prev => Math.min(totalColumnPages, prev + 1))} disabled={kanbanCompletedPage === totalColumnPages} variant="secondary" size="md" className="text-sm h-auto px-2 py-0.5">→</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* CONFLICT FLAGGED COLUMN */}
        {(() => {
          const columnCards = kanbanCards ? kanbanCards.filter(c => c.status === "CONFLICT_FLAGGED") : [];
          const totalColumnPages = Math.ceil(columnCards.length / itemsPerPage);
          const paginatedCards = columnCards.slice((kanbanConflictPage - 1) * itemsPerPage, kanbanConflictPage * itemsPerPage);
          return (
            <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-4 flex flex-col gap-3 min-h-[500px]">
              <h4 className="text-sm font-bold uppercase tracking-wider border-b border-cream/10 pb-2">
                Score Conflicts
                <span className="text-cream/50 font-normal text-[9px] ml-2">({columnCards.length})</span>
              </h4>
              <div className="flex-1 space-y-2">
                {paginatedCards.length > 0 ? (
                  paginatedCards.map(card => (
                    <div key={card.id} className="bg-charcoal border border-terracotta/10 rounded-xl p-3.5 space-y-2 text-sm relative group shadow-sm">
                      <div className="flex justify-between font-bold">
                        <span>{card.name}</span>
                        {card.score && <span className="text-gold font-serif">{card.score} pts</span>}
                      </div>
                      <p className="text-sm text-cream/50">{card.category} | Assigned: {card.judge}</p>
                      <div className="pt-2 flex gap-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => moveKanbanCard(card.id, "PENDING")} variant="ghost" size="md" className="text-sm h-auto px-1 py-0.5">Re-queue</Button>
                        <Button onClick={() => moveKanbanCard(card.id, "IN_REVIEW")} variant="ghost" size="md" className="text-sm h-auto px-1 py-0.5">Review</Button>
                        <Button onClick={() => moveKanbanCard(card.id, "COMPLETED")} variant="ghost" size="md" className="text-sm h-auto px-1 py-0.5 bg-green-700/50">Approve</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-cream/40 italic">No items in this queue</p>
                )}
              </div>
              {columnCards.length > itemsPerPage && (
                <div className="border-t border-cream/10 pt-2 flex items-center justify-between">
                  <span className="text-sm text-cream/50">{(kanbanConflictPage - 1) * itemsPerPage + 1}-{Math.min(kanbanConflictPage * itemsPerPage, columnCards.length)}</span>
                  <div className="flex gap-1">
                    <Button onClick={() => setKanbanConflictPage(prev => Math.max(1, prev - 1))} disabled={kanbanConflictPage === 1} variant="secondary" size="md" className="text-sm h-auto px-2 py-0.5">←</Button>
                    <span className="text-sm text-cream/50 px-1.5">{kanbanConflictPage}/{totalColumnPages}</span>
                    <Button onClick={() => setKanbanConflictPage(prev => Math.min(totalColumnPages, prev + 1))} disabled={kanbanConflictPage === totalColumnPages} variant="secondary" size="md" className="text-sm h-auto px-2 py-0.5">→</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

    </div>
  );
}

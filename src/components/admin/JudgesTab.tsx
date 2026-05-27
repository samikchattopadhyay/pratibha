"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, HelpCircle, X, Search, Filter, Shield, UserPlus } from "lucide-react";
import Button from "@/components/Button";
import { Judge, Registration } from "./ParticipantsTab";

export interface KanbanCard {
  id: string;
  status: string;
  name: string;
  score?: number;
  category: string;
  judge: string;
  rawScores?: number[];
  assignments?: {
    id: string;
    judgeId: string;
    judgeName: string;
    isSubmitted: boolean;
    score: number | null;
  }[];
}

interface JudgesTabProps {
  judges: Judge[];
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
  handleAssignJudge?: (registrationId: string, judgeId: string) => Promise<void>;
}

export default function JudgesTab({
  judges,
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
  handleAssignJudge,
}: JudgesTabProps) {
  const [showHelp, setShowHelp] = useState(false);

  // Local state for jury panel auditing/filters
  const [judgeSearchQuery, setJudgeSearchQuery] = useState("");
  const [judgeSpecFilter, setJudgeSpecFilter] = useState("ALL");

  // Get all unique specializations for filter dropdown
  const specializations = useMemo(() => {
    if (!judges) return [];
    return Array.from(new Set(judges.flatMap((j) => j.specializations || [])));
  }, [judges]);

  // Filtered judges list for the grid view
  const filteredJudges = useMemo(() => {
    if (!judges) return [];
    return judges.filter((j) => {
      const matchesSearch = j.name.toLowerCase().includes(judgeSearchQuery.toLowerCase());
      const matchesSpec =
        judgeSpecFilter === "ALL" ||
        (j.specializations && j.specializations.includes(judgeSpecFilter));
      return matchesSearch && matchesSpec;
    });
  }, [judges, judgeSearchQuery, judgeSpecFilter]);

  return (
    <div className="space-y-6">
      
      {/* Workload Tracker & Jury Auditing */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold flex items-center gap-2 text-cream">
              Jury Panel Workload & Outlier Audit
              <button
                onClick={() => setShowHelp(true)}
                className="text-cream/40 hover:text-gold transition-colors focus:outline-none p-1 rounded hover:bg-cream/5"
                title="Show Jury Guidelines"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </h3>
            <p className="text-xs text-cream/50 mt-1 font-sans">
              Monitor individual judge evaluation speeds, active queue levels, and scoring deviances.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-start lg:self-auto w-full sm:w-auto">
            {/* Search Judges */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search judges..."
                value={judgeSearchQuery}
                onChange={(e) => setJudgeSearchQuery(e.target.value)}
                className="w-full sm:w-48 font-sans text-xs bg-charcoal border border-terracotta/20 rounded-lg pl-8 pr-3 py-2 text-cream focus:outline-none focus:border-terracotta"
              />
              <Search className="w-3.5 h-3.5 text-cream/40 absolute left-2.5 top-2.5" />
            </div>

            {/* Filter Specialization */}
            <div className="relative flex items-center">
              <select
                value={judgeSpecFilter}
                onChange={(e) => setJudgeSpecFilter(e.target.value)}
                className="w-full sm:w-44 font-sans text-xs bg-charcoal border border-terracotta/20 rounded-lg pl-8 pr-3 py-2 text-cream focus:outline-none focus:border-terracotta appearance-none cursor-pointer"
              >
                <option value="ALL">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-cream/40 absolute left-2.5 pointer-events-none" />
            </div>

            <Button
              onClick={() => setShowHelp(true)}
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1.5 text-xs text-cream/70 hover:text-cream border-cream/15 w-full sm:w-auto"
            >
              <Shield className="w-3.5 h-3.5" />
              Jury Rules
            </Button>
          </div>
        </div>

        {/* Judges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-terracotta/20">
          {filteredJudges.length > 0 ? (
            filteredJudges.map((j: Judge) => (
              <div
                key={j.id}
                onClick={() => {
                  navigateToTab("participants");
                  setSearch(j.name);
                }}
                className={`p-4 bg-charcoal rounded-xl border cursor-pointer hover:border-terracotta/40 transition-all select-none ${
                  j.isOutlier ? "border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10" : "border-terracotta/5 hover:bg-charcoal-light"
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
                <div className="flex justify-between items-start gap-2">
                  <div className={`font-bold flex items-center gap-1.5 ${j.isOutlier ? "text-yellow-400" : "text-cream"}`}>
                    {j.isOutlier && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    <span>{j.name}</span>
                  </div>
                  {j.isOutlier && (
                    <span className="text-[10px] bg-yellow-400/10 text-yellow-400 border border-yellow-400/25 px-1.5 py-0.5 rounded font-mono font-bold">
                      OUTLIER
                    </span>
                  )}
                </div>
                
                {/* Judge Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-cream/60 font-sans border-t border-cream/5 pt-2">
                  <div>
                    <span className="block text-[10px] text-cream/40 uppercase">Done / Pending</span>
                    <span className="font-bold text-cream">
                      {j.evaluationCount || 0} / {j.pendingCount || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-cream/40 uppercase">Avg Score / Speed</span>
                    <span className="font-bold text-cream">
                      {j.averageScore !== "N/A" ? `${j.averageScore} pts` : "N/A"}
                    </span>
                  </div>
                </div>

                {j.isOutlier && (
                  <p className="text-[11px] text-yellow-400/70 mt-2 italic">
                    Deviates by {j.deviationPercentage}% from jury benchmark average.
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-cream/50 col-span-3 py-6 text-center italic text-sm">No active jury panel matches the search filters.</p>
          )}
        </div>
      </div>



      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* PENDING COLUMN */}
        {(() => {
          const columnCards = kanbanCards ? kanbanCards.filter(c => c.status === "PENDING") : [];
          const totalColumnPages = Math.ceil(columnCards.length / itemsPerPage);
          const paginatedCards = columnCards.slice((kanbanPendingPage - 1) * itemsPerPage, kanbanPendingPage * itemsPerPage);
          return (
            <div className="border border-cream/20 bg-cream/5 rounded-2xl p-4 flex flex-col gap-3 min-h-[500px]">
              <h4 className="text-xs font-bold uppercase tracking-wider border-b border-cream/10 pb-2 flex justify-between items-center text-cream">
                <span>Pending Evaluation</span>
                <span className="text-cream/50 font-mono text-[10px]">({columnCards.length})</span>
              </h4>
              <div className="flex-1 space-y-3">
                {paginatedCards.length > 0 ? (
                  paginatedCards.map(card => (
                    <div key={card.id} className="bg-charcoal border border-terracotta/10 rounded-xl p-4 space-y-3 text-sm relative group shadow-lg hover:border-terracotta/30 transition-all">
                      <div className="flex justify-between font-bold text-cream">
                        <span>{card.name}</span>
                        {card.score && <span className="text-gold font-serif">{card.score} pts</span>}
                      </div>
                      <p className="text-xs text-cream/50 leading-relaxed font-sans">{card.category} | Assigned: {card.judge}</p>
                      
                      {/* Detailed Score Breakdown */}
                      {card.assignments && card.assignments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-cream/5 space-y-1.5 text-xs text-cream/60">
                          {card.assignments.map((a) => (
                            <div key={a.id} className="flex justify-between items-center">
                              <span className="truncate max-w-[120px]">{a.judgeName}:</span>
                              <span className={a.isSubmitted ? "text-gold font-bold font-mono" : "text-yellow-500/60 font-medium"}>
                                {a.isSubmitted ? `${a.score} pts` : "Pending"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Direct Judge Allocation dropdown inside card */}
                      {handleAssignJudge && (
                        <div className="pt-1.5 border-t border-cream/5 flex items-center gap-1">
                          <UserPlus className="w-3.5 h-3.5 text-cream/40 flex-shrink-0" />
                          <select
                            onChange={(e) => handleAssignJudge(card.id, e.target.value)}
                            defaultValue=""
                            className="w-full bg-charcoal-light border border-terracotta/20 rounded px-2 py-1 text-xs text-cream/70 focus:outline-none cursor-pointer"
                          >
                            <option value="" disabled>+ Alloc Judge</option>
                            {judges
                              .filter(j => !card.assignments?.some(a => a.judgeId === j.id))
                              .map(j => (
                                <option key={j.id} value={j.id}>{j.name}</option>
                              ))}
                          </select>
                        </div>
                      )}

                      <div className="pt-2 flex gap-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity border-t border-cream/5">
                        <Button onClick={() => moveKanbanCard(card.id, "IN_REVIEW")} variant="ghost" size="md" className="text-xs h-auto px-2 py-1">Review</Button>
                        <Button onClick={() => moveKanbanCard(card.id, "COMPLETED")} variant="ghost" size="md" className="text-xs h-auto px-2 py-1 bg-green-700/30 hover:bg-green-700/50 text-green-300">Approve</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-cream/40 italic py-4">No items in this queue</p>
                )}
              </div>
              {columnCards.length > itemsPerPage && (
                <div className="border-t border-cream/10 pt-2 flex items-center justify-between">
                  <span className="text-xs text-cream/50">{(kanbanPendingPage - 1) * itemsPerPage + 1}-{Math.min(kanbanPendingPage * itemsPerPage, columnCards.length)}</span>
                  <div className="flex gap-1">
                    <Button onClick={() => setKanbanPendingPage(prev => Math.max(1, prev - 1))} disabled={kanbanPendingPage === 1} variant="secondary" size="md" className="text-xs h-auto px-2 py-1">←</Button>
                    <span className="text-xs text-cream/50 px-1.5">{kanbanPendingPage}/{totalColumnPages}</span>
                    <Button onClick={() => setKanbanPendingPage(prev => Math.min(totalColumnPages, prev + 1))} disabled={kanbanPendingPage === totalColumnPages} variant="secondary" size="md" className="text-xs h-auto px-2 py-1">→</Button>
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
              <h4 className="text-xs font-bold uppercase tracking-wider border-b border-cream/10 pb-2 flex justify-between items-center text-cream">
                <span>In Jury Review</span>
                <span className="text-cream/50 font-mono text-[10px]">({columnCards.length})</span>
              </h4>
              <div className="flex-1 space-y-3">
                {paginatedCards.length > 0 ? (
                  paginatedCards.map(card => (
                    <div key={card.id} className="bg-charcoal border border-terracotta/10 rounded-xl p-4 space-y-3 text-sm relative group shadow-lg hover:border-terracotta/30 transition-all">
                      <div className="flex justify-between font-bold text-cream">
                        <span>{card.name}</span>
                        {card.score && <span className="text-gold font-serif">{card.score} pts</span>}
                      </div>
                      <p className="text-xs text-cream/50 leading-relaxed font-sans">{card.category} | Assigned: {card.judge}</p>

                      {/* Detailed Score Breakdown */}
                      {card.assignments && card.assignments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-cream/5 space-y-1.5 text-xs text-cream/60">
                          {card.assignments.map((a) => (
                            <div key={a.id} className="flex justify-between items-center">
                              <span className="truncate max-w-[120px]">{a.judgeName}:</span>
                              <span className={a.isSubmitted ? "text-gold font-bold font-mono" : "text-yellow-500/60 font-medium"}>
                                {a.isSubmitted ? `${a.score} pts` : "Pending"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Direct Judge Allocation dropdown inside card */}
                      {handleAssignJudge && (
                        <div className="pt-1.5 border-t border-cream/5 flex items-center gap-1">
                          <UserPlus className="w-3.5 h-3.5 text-cream/40 flex-shrink-0" />
                          <select
                            onChange={(e) => handleAssignJudge(card.id, e.target.value)}
                            defaultValue=""
                            className="w-full bg-charcoal-light border border-terracotta/20 rounded px-2 py-1 text-xs text-cream/70 focus:outline-none cursor-pointer"
                          >
                            <option value="" disabled>+ Alloc Judge</option>
                            {judges
                              .filter(j => !card.assignments?.some(a => a.judgeId === j.id))
                              .map(j => (
                                <option key={j.id} value={j.id}>{j.name}</option>
                              ))}
                          </select>
                        </div>
                      )}

                      <div className="pt-2 flex gap-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity border-t border-cream/5">
                        <Button onClick={() => moveKanbanCard(card.id, "PENDING")} variant="ghost" size="md" className="text-xs h-auto px-2 py-1">Re-queue</Button>
                        <Button onClick={() => moveKanbanCard(card.id, "COMPLETED")} variant="ghost" size="md" className="text-xs h-auto px-2 py-1 bg-green-700/30 hover:bg-green-700/50 text-green-300">Approve</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-cream/40 italic py-4">No items in this queue</p>
                )}
              </div>
              {columnCards.length > itemsPerPage && (
                <div className="border-t border-cream/10 pt-2 flex items-center justify-between">
                  <span className="text-xs text-cream/50">{(kanbanInReviewPage - 1) * itemsPerPage + 1}-{Math.min(kanbanInReviewPage * itemsPerPage, columnCards.length)}</span>
                  <div className="flex gap-1">
                    <Button onClick={() => setKanbanInReviewPage(prev => Math.max(1, prev - 1))} disabled={kanbanInReviewPage === 1} variant="secondary" size="md" className="text-xs h-auto px-2 py-1">←</Button>
                    <span className="text-xs text-cream/50 px-1.5">{kanbanInReviewPage}/{totalColumnPages}</span>
                    <Button onClick={() => setKanbanInReviewPage(prev => Math.min(totalColumnPages, prev + 1))} disabled={kanbanInReviewPage === totalColumnPages} variant="secondary" size="md" className="text-xs h-auto px-2 py-1">→</Button>
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
              <h4 className="text-xs font-bold uppercase tracking-wider border-b border-cream/10 pb-2 flex justify-between items-center text-cream">
                <span>Scoring Finalized</span>
                <span className="text-cream/50 font-mono text-[10px]">({columnCards.length})</span>
              </h4>
              <div className="flex-1 space-y-3">
                {paginatedCards.length > 0 ? (
                  paginatedCards.map(card => (
                    <div key={card.id} className="bg-charcoal border border-terracotta/10 rounded-xl p-4 space-y-3 text-sm relative group shadow-lg hover:border-terracotta/30 transition-all">
                      <div className="flex justify-between font-bold text-cream">
                        <span>{card.name}</span>
                        {card.score && <span className="text-gold font-serif">{card.score} pts</span>}
                      </div>
                      <p className="text-xs text-cream/50 leading-relaxed font-sans">{card.category} | Assigned: {card.judge}</p>

                      {/* Detailed Score Breakdown */}
                      {card.assignments && card.assignments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-cream/5 space-y-1.5 text-xs text-cream/60">
                          {card.assignments.map((a) => (
                            <div key={a.id} className="flex justify-between items-center">
                              <span className="truncate max-w-[120px]">{a.judgeName}:</span>
                              <span className={a.isSubmitted ? "text-gold font-bold font-mono" : "text-yellow-500/60 font-medium"}>
                                {a.isSubmitted ? `${a.score} pts` : "Pending"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 flex gap-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity border-t border-cream/5">
                        <Button onClick={() => moveKanbanCard(card.id, "PENDING")} variant="ghost" size="md" className="text-xs h-auto px-2 py-1">Re-queue</Button>
                        <Button onClick={() => moveKanbanCard(card.id, "IN_REVIEW")} variant="ghost" size="md" className="text-xs h-auto px-2 py-1">Review</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-cream/40 italic py-4">No items in this queue</p>
                )}
              </div>
              {columnCards.length > itemsPerPage && (
                <div className="border-t border-cream/10 pt-2 flex items-center justify-between">
                  <span className="text-xs text-cream/50">{(kanbanCompletedPage - 1) * itemsPerPage + 1}-{Math.min(kanbanCompletedPage * itemsPerPage, columnCards.length)}</span>
                  <div className="flex gap-1">
                    <Button onClick={() => setKanbanCompletedPage(prev => Math.max(1, prev - 1))} disabled={kanbanCompletedPage === 1} variant="secondary" size="md" className="text-xs h-auto px-2 py-1">←</Button>
                    <span className="text-xs text-cream/50 px-1.5">{kanbanCompletedPage}/{totalColumnPages}</span>
                    <Button onClick={() => setKanbanCompletedPage(prev => Math.min(totalColumnPages, prev + 1))} disabled={kanbanCompletedPage === totalColumnPages} variant="secondary" size="md" className="text-xs h-auto px-2 py-1">→</Button>
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
              <h4 className="text-xs font-bold uppercase tracking-wider border-b border-cream/10 pb-2 flex justify-between items-center text-cream">
                <span>Score Conflicts</span>
                <span className="text-cream/50 font-mono text-[10px]">({columnCards.length})</span>
              </h4>
              <div className="flex-1 space-y-3">
                {paginatedCards.length > 0 ? (
                  paginatedCards.map(card => {
                    // Calculate absolute discrepancy for visual help on the card
                    const max = card.rawScores && card.rawScores.length > 0 ? Math.max(...card.rawScores) : 0;
                    const min = card.rawScores && card.rawScores.length > 0 ? Math.min(...card.rawScores) : 0;
                    const diff = max - min;

                    return (
                      <div key={card.id} className="bg-charcoal border border-red-500/20 rounded-xl p-4 space-y-3 text-sm relative group shadow-lg hover:border-red-500/40 transition-all animate-pulse duration-[3000ms]">
                        <div className="flex justify-between font-bold text-cream">
                          <span>{card.name}</span>
                          {card.score && <span className="text-red-400 font-serif">{card.score} pts</span>}
                        </div>
                        <p className="text-xs text-cream/50 leading-relaxed font-sans">{card.category} | Assigned: {card.judge}</p>

                        {/* Visual Discrepancy Tag */}
                        <div className="text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/25 px-2 py-0.5 rounded w-max">
                          Conflict: {diff} Pt Variance
                        </div>

                        {/* Detailed Score Breakdown */}
                        {card.assignments && card.assignments.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-cream/5 space-y-1.5 text-xs text-cream/60">
                            {card.assignments.map((a) => (
                              <div key={a.id} className="flex justify-between items-center">
                                <span className="truncate max-w-[120px]">{a.judgeName}:</span>
                                <span className={a.isSubmitted ? "text-red-400 font-bold font-mono" : "text-yellow-500/60 font-medium"}>
                                  {a.isSubmitted ? `${a.score} pts` : "Pending"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tie-breaker selection */}
                        {handleAssignJudge && (
                          <div className="pt-1.5 border-t border-cream/5 flex items-center gap-1">
                            <UserPlus className="w-3.5 h-3.5 text-red-400/70 flex-shrink-0" />
                            <select
                              onChange={(e) => handleAssignJudge(card.id, e.target.value)}
                              defaultValue=""
                              className="w-full bg-charcoal-light border border-red-500/20 rounded px-2 py-1 text-xs text-cream/70 focus:outline-none cursor-pointer"
                            >
                              <option value="" disabled>+ Assign Tie-breaker</option>
                              {judges
                                .filter(j => !card.assignments?.some(a => a.judgeId === j.id))
                                .map(j => (
                                  <option key={j.id} value={j.id}>{j.name}</option>
                                ))}
                            </select>
                          </div>
                        )}

                        <div className="pt-2 flex gap-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity border-t border-cream/5">
                          <Button onClick={() => moveKanbanCard(card.id, "PENDING")} variant="ghost" size="md" className="text-xs h-auto px-2 py-1">Re-queue</Button>
                          <Button onClick={() => moveKanbanCard(card.id, "IN_REVIEW")} variant="ghost" size="md" className="text-xs h-auto px-2 py-1">Review</Button>
                          <Button onClick={() => moveKanbanCard(card.id, "COMPLETED")} variant="ghost" size="md" className="text-xs h-auto px-2 py-1 bg-green-700/30 hover:bg-green-700/50 text-green-300">Approve</Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-cream/40 italic py-4">No items in this queue</p>
                )}
              </div>
              {columnCards.length > itemsPerPage && (
                <div className="border-t border-cream/10 pt-2 flex items-center justify-between">
                  <span className="text-xs text-cream/50">{(kanbanConflictPage - 1) * itemsPerPage + 1}-{Math.min(kanbanConflictPage * itemsPerPage, columnCards.length)}</span>
                  <div className="flex gap-1">
                    <Button onClick={() => setKanbanConflictPage(prev => Math.max(1, prev - 1))} disabled={kanbanConflictPage === 1} variant="secondary" size="md" className="text-xs h-auto px-2 py-1">←</Button>
                    <span className="text-xs text-cream/50 px-1.5">{kanbanConflictPage}/{totalColumnPages}</span>
                    <Button onClick={() => setKanbanConflictPage(prev => Math.min(totalColumnPages, prev + 1))} disabled={kanbanConflictPage === totalColumnPages} variant="secondary" size="md" className="text-xs h-auto px-2 py-1">→</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-charcoal-light border border-terracotta/30 p-6 rounded-2xl max-w-3xl w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-cream/50 hover:text-cream transition-colors focus:outline-none p-1 rounded hover:bg-cream/5"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title Banner */}
            <div className="flex items-start gap-3 border-b border-terracotta/10 pb-4">
              <div className="bg-gold/10 p-2.5 rounded-xl border border-gold/20">
                <HelpCircle className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-cream">Jury & Evaluation Guide</h3>
                <p className="text-xs text-cream/40 mt-0.5">Workflow guidelines for monitoring jury workload, analyzing score variance, and handling conflicts</p>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Left Column: Graphic */}
              <div className="md:col-span-2 space-y-3">
                <div className="w-full h-48 md:h-64 relative rounded-xl overflow-hidden border border-terracotta/20 bg-charcoal flex items-center justify-center">
                  <img
                    src="/images/judges_workflow_infographic.png"
                    alt="Jury Evaluation Workflow"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-charcoal/50 p-3 rounded-lg border border-terracotta/5 text-[11px] text-cream/50 leading-relaxed font-mono">
                  <span className="text-gold font-bold">ℹ️ Note:</span> Outlier flagging is automated based on variance from the global grading average of other judges for matching categories.
                </div>
              </div>

              {/* Right Column: Descriptions */}
              <div className="md:col-span-3 space-y-4 max-h-[26rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-terracotta/20">
                
                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">1</span>
                    Workload & Outliers
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    Monitor individual judge scoring speeds and consistency averages. Outlier flags highlight judges whose grading deviates significantly from the global average. Filter judges by name or category specialization.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">2</span>
                    Active Submissions Queue
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    Track real-time assignments, current scoring marks, and evaluate precise score discrepancy levels (variance calculated dynamically). Allocate judges or add tie-breaker reviewers directly from the table.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">3</span>
                    Kanban Status Routing
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    Move participant submissions through the evaluation lifecycle: transition them from Pending to In Review, and eventually approve them to mark Scoring as Finalized.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">4</span>
                    Resolve Score Conflicts
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    Entries with highly divergent scores from different judges (variance &gt;15 points) are automatically flagged as conflicts. View individual score breakdowns and allocate tie-breaker judges directly on the card to resolve.
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

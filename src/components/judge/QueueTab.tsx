"use client";

import { Play, ExternalLink, Sliders, Award, Check } from "lucide-react";
import Button from "@/components/Button";

export interface Assignment {
  id: string;
  registrationId: string;
  competitionTitle: string;
  categoryName: string;
  fbPostUrl: string;
  isSubmitted: boolean;
  scope: "STATE" | "NATIONAL";
  score: {
    criteria1: number;
    criteria2: number;
    criteria3: number;
    criteria4?: number;
    totalScore: number;
    remarks: string;
  } | null;
}

interface QueueTabProps {
  assignments: Assignment[];
  selectedAsg: Assignment | null;
  handleSelectAssignment: (asg: Assignment) => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  loadJudgeAssignments: (page: number) => Promise<void>;
  loading: boolean;
  c1: number;
  setC1: (val: number) => void;
  c2: number;
  setC2: (val: number) => void;
  c3: number;
  setC3: (val: number) => void;
  c4: number;
  setC4: (val: number) => void;
  remarks: string;
  setRemarks: (val: string) => void;
  handleSubmitScore: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
}

export default function QueueTab({
  assignments,
  selectedAsg,
  handleSelectAssignment,
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  loadJudgeAssignments,
  loading,
  c1,
  setC1,
  c2,
  setC2,
  c3,
  setC3,
  c4,
  setC4,
  remarks,
  setRemarks,
  handleSubmitScore,
  submitting,
}: QueueTabProps) {
  const isNational = selectedAsg?.scope === "NATIONAL";
  const total = c1 + c2 + c3 + (isNational ? c4 : 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left side: queue list */}
      <div className="lg:col-span-4 bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md space-y-4">
        <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream border-b border-terracotta/20 dark:border-terracotta/20 pb-2">
          Assignments
        </h3>

        {assignments.length === 0 ? (
          <p className="font-sans text-sm text-charcoal/40 dark:text-cream/40 italic text-center py-6">No assignments queue loaded.</p>
        ) : (
          <>
            <div className="space-y-3">
              {assignments.map(asg => {
                const isSelected = selectedAsg?.id === asg.id;
                return (
                  <button
                    key={asg.id}
                    onClick={() => handleSelectAssignment(asg)}
                    className={`w-full text-left p-4 rounded-xl border font-sans text-sm transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "bg-terracotta/5 dark:bg-gold/5 border-terracotta dark:border-gold shadow-sm"
                        : "bg-cream dark:bg-charcoal/50 border-terracotta/10 dark:border-terracotta/20 hover:border-terracotta/30 dark:hover:border-gold/30"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-charcoal dark:text-cream">Roll ID: {asg.registrationId}</span>
                      <div className="flex gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                          asg.scope === "NATIONAL"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}>
                          {asg.scope}
                        </span>
                        {asg.isSubmitted ? (
                          <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-700 font-bold uppercase tracking-wider text-sm">
                            Graded
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-700 font-bold uppercase tracking-wider text-sm">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    <h4 className="font-semibold text-charcoal/70 dark:text-cream/70 mt-1.5 leading-snug">{asg.categoryName}</h4>
                    <p className="text-sm text-charcoal/40 dark:text-cream/40 mt-1">{asg.competitionTitle}</p>
                  </button>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="border-t border-terracotta/10 dark:border-terracotta/20 pt-4 space-y-3">
                <div className="text-sm text-charcoal/60 dark:text-cream/60 font-sans text-center">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={() => loadJudgeAssignments(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                    variant="secondary"
                    size="sm"
                  >
                    ← Previous
                  </Button>
                  <span className="text-sm text-charcoal/60 dark:text-cream/60 font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => loadJudgeAssignments(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || loading}
                    variant="secondary"
                    size="sm"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right side: Grading Form */}
      <div className="lg:col-span-8 space-y-6">
        {selectedAsg ? (
          <div className="bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="border-b border-terracotta/5 dark:border-terracotta/20 pb-4 flex justify-between items-end">
              <div>
                <span className="font-sans text-sm uppercase font-bold text-terracotta/60 dark:text-gold/60">
                  Double-Blind Assignment
                </span>
                <h2 className="font-serif text-xl font-bold text-charcoal dark:text-cream mt-1">
                  Roll ID: {selectedAsg.registrationId} — {selectedAsg.categoryName}
                </h2>
              </div>
              <div className="text-right">
                <span className="font-sans text-sm text-charcoal/40 dark:text-cream/40 uppercase block">Geographic Scope</span>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold tracking-wide border uppercase ${
                  selectedAsg.scope === "NATIONAL"
                    ? "bg-red-500/10 border-red-500/20 text-red-500"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                }`}>
                  {selectedAsg.scope} LEVEL
                </span>
              </div>
            </div>

            {/* Video Widget */}
            <div className="space-y-3">
              <h4 className="font-sans text-sm font-bold text-charcoal/60 dark:text-cream/60 uppercase">Submissions Video Preview</h4>
              <div className="aspect-video bg-charcoal-light dark:bg-charcoal rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-4 border-2 border-dashed border-gold/20">
                <Play className="w-12 h-12 text-gold animate-pulse" />
                <div className="space-y-1">
                  <p className="font-sans text-sm text-cream dark:text-cream font-medium">Facebook Video Post Submitted</p>
                  <p className="font-sans text-sm text-cream/40 dark:text-cream/40 truncate max-w-sm">{selectedAsg.fbPostUrl}</p>
                </div>
                <a
                  href={selectedAsg.fbPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-terracotta hover:bg-terracotta-light dark:bg-gold dark:hover:bg-gold-light text-cream dark:text-charcoal font-sans text-sm font-bold rounded-lg shadow transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" /> Open Video in Facebook
                </a>
              </div>
            </div>

            {/* Scoring Sliders */}
            <form onSubmit={handleSubmitScore} className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-sans text-sm font-bold text-charcoal/60 dark:text-cream/60 uppercase flex items-center gap-1.5 border-b border-terracotta/5 dark:border-terracotta/20 pb-2">
                  <Sliders className="w-3.5 h-3.5 text-terracotta dark:text-gold" /> Score Sliders (Scope: {selectedAsg.scope})
                </h4>

                {/* Slider 1: Technique & Skill */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="font-bold text-charcoal dark:text-cream">Technique & Skill (Max 40)</span>
                    <span className="font-mono font-bold text-terracotta dark:text-gold">{c1} / 40</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    disabled={selectedAsg.isSubmitted}
                    value={c1}
                    onChange={(e) => setC1(Number(e.target.value))}
                    className="w-full h-2 bg-cream-dark dark:bg-charcoal-dark border rounded-lg appearance-none cursor-pointer accent-terracotta dark:accent-gold"
                  />
                  <p className="text-sm text-charcoal/40 dark:text-cream/40 leading-normal">
                    Evaluates posture, breath control (recitation/vocals), strokes accuracy, hand movements, or execution level.
                  </p>
                </div>

                {/* Slider 2: Expression & Presentation */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="font-bold text-charcoal dark:text-cream">
                      Expression & Presentation (Max {isNational ? 25 : 30})
                    </span>
                    <span className="font-mono font-bold text-terracotta dark:text-gold">
                      {c2} / {isNational ? 25 : 30}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={isNational ? 25 : 30}
                    disabled={selectedAsg.isSubmitted}
                    value={c2}
                    onChange={(e) => setC2(Number(e.target.value))}
                    className="w-full h-2 bg-cream-dark dark:bg-charcoal-dark border rounded-lg appearance-none cursor-pointer accent-terracotta dark:accent-gold"
                  />
                  <p className="text-sm text-charcoal/40 dark:text-cream/40 leading-normal">
                    Evaluates emotional capture, facial bhaav, dynamic volume shifts, clarity, and overall stage presence.
                  </p>
                </div>

                {/* Slider 3: Rhythm & Composition */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="font-bold text-charcoal dark:text-cream">
                      Rhythm & Composition (Max {isNational ? 25 : 30})
                    </span>
                    <span className="font-mono font-bold text-terracotta dark:text-gold">
                      {c3} / {isNational ? 25 : 30}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={isNational ? 25 : 30}
                    disabled={selectedAsg.isSubmitted}
                    value={c3}
                    onChange={(e) => setC3(Number(e.target.value))}
                    className="w-full h-2 bg-cream-dark dark:bg-charcoal-dark border rounded-lg appearance-none cursor-pointer accent-terracotta dark:accent-gold"
                  />
                  <p className="text-sm text-charcoal/40 dark:text-cream/40 leading-normal">
                    Evaluates tempo coherence (tala), consistency, synchronization, and choice of traditional literature/composition.
                  </p>
                </div>

                {/* Slider 4: Originality & Innovation (National Only) */}
                {isNational && (
                  <div className="space-y-2 border-t border-dashed border-terracotta/10 dark:border-terracotta/20 pt-4">
                    <div className="flex justify-between text-sm font-sans">
                      <span className="font-bold text-charcoal dark:text-cream flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-gold" />
                        Originality & Innovation (National Extra, Max 10)
                      </span>
                      <span className="font-mono font-bold text-terracotta dark:text-gold">{c4} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      disabled={selectedAsg.isSubmitted}
                      value={c4}
                      onChange={(e) => setC4(Number(e.target.value))}
                      className="w-full h-2 bg-cream-dark dark:bg-charcoal-dark border rounded-lg appearance-none cursor-pointer accent-terracotta dark:accent-gold"
                    />
                    <p className="text-sm text-charcoal/40 dark:text-cream/40 leading-normal">
                      Evaluates creative arrangement, uniqueness of selection, and artistic innovation suitable for national levels.
                    </p>
                  </div>
                )}
              </div>

              {/* Total Box */}
              <div className="bg-cream-dark/20 dark:bg-charcoal-dark/20 border border-terracotta/5 dark:border-terracotta/20 rounded-xl p-4 flex justify-between items-center">
                <span className="font-sans text-sm font-bold text-charcoal dark:text-cream">Calculated Total Score (Sum)</span>
                <span className="font-mono text-xl font-bold text-terracotta dark:text-gold">{total} / 100</span>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5 font-sans text-sm">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-charcoal/60 dark:text-cream/60 uppercase font-sans">Examiner Remarks & Feedback</label>
                  <span className={`text-sm font-semibold ${remarks.trim().length >= 50 ? "text-green-600" : "text-yellow-600"}`}>
                    {remarks.trim().length} / 50 Chars Min
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  disabled={selectedAsg.isSubmitted}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Write constructive technical feedback for the student here (Min 50 characters required)..."
                  className="w-full bg-cream dark:bg-charcoal/50 border border-terracotta/20 dark:border-terracotta/40 rounded-lg p-3 text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none resize-none font-sans text-base"
                />
              </div>

              {/* Action buttons */}
              {!selectedAsg.isSubmitted ? (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={submitting}
                  className="w-full"
                >
                  {submitting ? "Finalizing Grades..." : "Finalize and Submit Scores"}
                </Button>
              ) : (
                <div className="p-4 bg-green-500/10 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>This evaluation has been signed off and submitted. Details cannot be edited.</span>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="bg-cream dark:bg-charcoal border border-dashed border-terracotta/20 dark:border-terracotta/20 rounded-2xl p-12 text-center text-charcoal/40 dark:text-cream/40 font-sans text-sm">
            Please select an assignment roll ID from the queue to start grading.
          </div>
        )}
      </div>
    </div>
  );
}

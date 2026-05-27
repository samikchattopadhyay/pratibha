"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, HelpCircle, X, Search, Filter, Plus, Edit } from "lucide-react";
import Button from "@/components/Button";
import { Judge } from "./ParticipantsTab";
import JudgeFormModal from "./JudgeFormModal";

interface JudgesTabProps {
  readonly judges: readonly Judge[];
  readonly navigateToTab: (tab: string) => void;
  readonly setSearch: (search: string) => void;
  readonly onRefresh?: () => void;
  readonly categories?: readonly { id: string; name: string; grouping?: string | null; icon?: string | null }[];
}

export default function JudgesTab({
  judges,
  navigateToTab,
  setSearch,
  onRefresh,
  categories,
}: JudgesTabProps) {
  const [showHelp, setShowHelp] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null);

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

  const handleAddClick = () => {
    setEditingJudge(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (judge: Judge) => {
    setEditingJudge(judge);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Workload Tracker & Jury Auditing */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Title, Subtitle, Help Trigger and Add Button */}
        <div className="border-b border-terracotta/10 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-serif text-xl font-bold tracking-wide text-cream">
                Jury Panel Workload & Outlier Audit
              </h3>
              <button
                onClick={() => setShowHelp(true)}
                className="text-cream/40 hover:text-gold transition-colors focus:outline-none p-1 rounded hover:bg-cream/5 inline-flex items-center"
                title="Show Jury Guidelines"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-cream/50 font-sans leading-relaxed max-w-2xl">
              Monitor individual judge evaluation speeds, active queue levels, and scoring deviances from the panel average to maintain competition grading standards.
            </p>
          </div>

          <Button
            onClick={handleAddClick}
            variant="primary"
            size="md"
            className="flex items-center gap-1.5 shadow-md shadow-terracotta/10"
          >
            <Plus className="w-4 h-4" /> Add Judge
          </Button>
        </div>

        {/* Filter and Control Bar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search judges by name..."
              value={judgeSearchQuery}
              onChange={(e) => setJudgeSearchQuery(e.target.value)}
              className="w-full font-sans text-sm bg-charcoal border border-terracotta/20 rounded-xl pl-9 pr-8 py-2.5 text-cream placeholder-cream/35 focus:outline-none focus:border-gold hover:border-terracotta/40 transition-all duration-200"
            />
            <Search className="w-4 h-4 text-cream/30 absolute left-3 top-3 pointer-events-none" />
            {judgeSearchQuery && (
              <button
                onClick={() => setJudgeSearchQuery("")}
                className="absolute right-3 top-3 text-cream/30 hover:text-cream transition-colors"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Specialization Filter Dropdown */}
          <div className="relative min-w-[200px] sm:max-w-xs flex items-center">
            <select
              value={judgeSpecFilter}
              onChange={(e) => setJudgeSpecFilter(e.target.value)}
              className="w-full font-sans text-sm bg-charcoal border border-terracotta/20 rounded-xl pl-9 pr-8 py-2.5 text-cream focus:outline-none focus:border-gold hover:border-terracotta/40 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="ALL">All Specializations</option>
              {specializations.map((spec) => {
                const mapping: Record<string, string> = {
                  "classical-vocal": "Classical Vocal",
                  "hindustani-classical-vocals": "Hindustani Classical Vocals",
                  "rabindra-sangeet": "Rabindra Sangeet",
                  "drawing-painting": "Drawing & Painting",
                  "visual-arts": "Visual Arts",
                  "digital-illustration": "Digital Illustration",
                  "classical-instrumental": "Classical Instrumental",
                  "instrumental-sitar": "Instrumental Sitar",
                  "instrumental-flute": "Instrumental Flute",
                  "classical-dance": "Classical Dance",
                  "performing-arts": "Performing Arts",
                  "poetry-recitation": "Poetry Recitation",
                  "creative-writing": "Creative Writing",
                  "story-telling": "Storytelling"
                };
                const displayName = mapping[spec] || spec.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                return (
                  <option key={spec} value={spec}>
                    {displayName}
                  </option>
                );
              })}
            </select>
            <Filter className="w-3.5 h-3.5 text-cream/30 absolute left-3 pointer-events-none" />
            <div className="pointer-events-none absolute right-3 flex items-center text-cream/35">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Judges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[32rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-terracotta/20">
          {filteredJudges.length > 0 ? (
            filteredJudges.map((j: Judge) => (
              <div
                key={j.id}
                onClick={() => {
                  navigateToTab("participants");
                  setSearch(j.name);
                }}
                className={`p-4 bg-charcoal rounded-xl border cursor-pointer hover:border-terracotta/40 transition-all select-none relative group ${
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
                <div className="flex justify-between items-start gap-2 pr-8">
                  <div className={`font-bold flex items-center gap-1.5 ${j.isOutlier ? "text-yellow-400 text-sm" : "text-cream text-sm"}`}>
                    {j.isOutlier && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    <span>{j.name}</span>
                  </div>
                  {j.isOutlier && (
                    <span className="text-sm bg-yellow-400/10 text-yellow-400 border border-yellow-400/25 px-1.5 py-0.5 rounded font-mono font-bold">
                      OUTLIER
                    </span>
                  )}
                </div>

                {/* Edit Button overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(j);
                  }}
                  className="absolute top-3 right-3 text-cream/40 hover:text-gold transition-colors p-1.5 rounded hover:bg-cream/5 inline-flex items-center border border-transparent hover:border-terracotta/20"
                  title="Edit Judge Details"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                
                {/* Judge Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-cream/60 font-sans border-t border-cream/5 pt-2">
                  <div>
                    <span className="block text-sm text-cream/40 uppercase">Done / Pending</span>
                    <span className="font-bold text-cream">
                      {j.evaluationCount || 0} / {j.pendingCount || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-cream/40 uppercase">Avg Score / Tier</span>
                    <span className="font-bold text-cream">
                      {j.averageScore !== "N/A" ? `${j.averageScore} pts` : "N/A"} ({j.tier || "LOCAL"})
                    </span>
                  </div>
                </div>

                {j.isOutlier && (
                  <p className="text-sm text-yellow-400/70 mt-2 italic">
                    Deviates by {j.deviationPercentage}% from jury benchmark average.
                  </p>
                )}

                {/* Specializations details on hover or small font */}
                {j.specializations && j.specializations.length > 0 && (
                  <div className="mt-2 text-sm text-cream/35 flex flex-wrap gap-1">
                    {j.specializations.slice(0, 3).map((spec) => (
                      <span key={spec} className="px-1.5 py-0.5 bg-cream/5 rounded border border-cream/5">
                        {spec}
                      </span>
                    ))}
                    {j.specializations.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-cream/5 rounded border border-cream/5">
                        +{j.specializations.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-cream/50 col-span-3 py-6 text-center italic text-sm">No active jury panel matches the search filters.</p>
          )}
        </div>
      </div>

      {/* Decomposed Form Modal */}
      {isModalOpen && (
        <JudgeFormModal
          key={editingJudge?.id || "new"}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingJudge={editingJudge}
          onRefresh={onRefresh}
          categories={categories}
        />
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-charcoal-light border border-terracotta/30 p-6 rounded-2xl max-w-2xl w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
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
                <h3 className="font-serif text-xl font-bold text-cream">Jury Panel Workload & Outlier Rules</h3>
                <p className="text-sm text-cream/40 mt-0.5">Workflow guidelines for monitoring jury workloads and analyzing score variances</p>
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-4 max-h-[26rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-terracotta/20 font-sans">
              
              <div className="space-y-1.5">
                <h4 className="font-bold text-gold text-sm uppercase tracking-wider">
                  Workload Tracking
                </h4>
                <p className="text-sm text-cream/60 leading-relaxed">
                  Shows how many total assignments each judge has completed (&quot;Done&quot;) versus how many they currently have queued (&quot;Pending&quot;). This helps administrators distribute submissions evenly.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-gold text-sm uppercase tracking-wider">
                  Outlier Flags
                </h4>
                <p className="text-sm text-cream/60 leading-relaxed">
                  The system automatically calculates the global scoring average across all submissions. If a judge&apos;s personal scoring average deviates by more than 15% (either higher or lower) and they have graded at least 3 submissions, they are flagged as an Outlier.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-gold text-sm uppercase tracking-wider">
                  Specialization Filtering
                </h4>
                <p className="text-sm text-cream/60 leading-relaxed">
                  Filter the list to only show judges specializing in specific domains (e.g. Classical Vocal, Drawing & Painting) to easily audit sub-panels.
                </p>
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

"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Star } from "lucide-react";
import SearchableSelect from "./SearchableSelect";
import BannerTemplatePicker from "./BannerTemplatePicker";
import Button from "../Button";
import RichTextEditor from "../RichTextEditor";
import { INDIA_STATES, AGE_GROUPS, SCORING_CRITERIA } from "@/lib/constants";

interface CriterionConfig {
  key: string;
  label: string;
  max: number;
  description?: string;
}

interface PrizeEntry {
  rank: string;
  type: string;
  title: string;
  description?: string;
  estimatedValue?: string;
}

interface DbCategory {
  id: string;
  name: string;
  grouping?: string | null;
  icon?: string | null;
}

interface BannerTemplateProp {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  description: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface WizardData {
  // Step 1 — Basic Details
  title: string;
  description: string;
  scope: "STATE" | "NATIONAL";
  eligibleStates: string[];
  hostState: string;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  resultDate: string;
  categoryId: string;
  categoryName: string;
  minAge: number;
  maxAge: number;
  language: string;
  capacity: string;
  facebookGroupUrl: string;
  difficultyLevel: number;
  entryFeeINR: string;
  entryFeePreset: string;
  bannerSlug: string;

  // Step 2 — Judges
  selectedJudgeIds: string[];

  // Step 3 — Rules
  rules: string;

  // Step 4 — Criteria
  criteriaConfig: CriterionConfig[];

  // Step 5 — Prizes
  prizes: PrizeEntry[];
}

interface CreateCompetitionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dbCategories: DbCategory[];
  bannerTemplates: BannerTemplateProp[];
}

export default function CreateCompetitionWizard({
  isOpen,
  onClose,
  onSuccess,
  dbCategories,
  bannerTemplates,
}: CreateCompetitionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availableJudges, setAvailableJudges] = useState<Array<{id: string; name: string; tier: string; specializations: string[]}>>([]);

  const [data, setData] = useState<WizardData>({
    title: "",
    description: "",
    scope: "STATE",
    eligibleStates: [],
    hostState: "",
    registrationDeadline: "",
    startDate: "",
    endDate: "",
    resultDate: "",
    categoryId: "",
    categoryName: "",
    minAge: 4,
    maxAge: 18,
    language: "Any",
    capacity: "",
    facebookGroupUrl: "",
    difficultyLevel: 1,
    entryFeeINR: "50",
    entryFeePreset: "50",
    bannerSlug: "",
    selectedJudgeIds: [],
    rules: "",
    criteriaConfig: [],
    prizes: [],
  });

  const categoryOptions = useMemo(
    () =>
      dbCategories.map((cat: {id: string; name: string; grouping?: string | null}) => ({
        value: cat.id,
        label: cat.name,
        grouping: cat.grouping || "MUSIC_VOCAL",
      })),
    [dbCategories]
  );

  const stateOptions = useMemo(
    () =>
      INDIA_STATES.map((state) => ({
        value: state,
        label: state,
      })),
    []
  );

  const languageOptions = [
    { value: "Bengali", label: "Bengali" },
    { value: "Hindi", label: "Hindi" },
    { value: "English", label: "English" },
    { value: "Sanskrit", label: "Sanskrit" },
    { value: "Any", label: "Any Language" },
  ];

  const prizeRankOptions = [
    "FIRST_PLACE",
    "SECOND_PLACE",
    "THIRD_PLACE",
    "MERIT_1",
    "MERIT_2",
    "MERIT_3",
    "SPECIAL_MENTION",
    "PEOPLES_CHOICE",
  ];

  const prizeTypeOptions = [
    "DIGITAL_CERTIFICATE",
    "DIGITAL_MEDAL",
    "PHYSICAL_MEDAL",
    "PHYSICAL_TROPHY",
    "CASH_PRIZE",
    "SCHOLARSHIP",
    "RECOGNITION",
  ];

  // Fetch available judges when Step 2 is entered
  const handleEnterStep2 = async () => {
    try {
      const res = await fetch("/api/admin/judges?verified=true");
      if (res.ok) {
        const result = await res.json() as { judges?: Array<{id: string; name: string; tier: string; specializations: string[]} > };
        setAvailableJudges(result.judges || []);
      }
    } catch (err) {
      console.error("Failed to fetch judges:", err);
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!data.title) {
          setError("Competition title is required");
          return false;
        }
        return true;
      case 2:
        return true;
      case 3:
        if (data.scope === "STATE" && data.eligibleStates.length === 0) {
          setError("Select at least one eligible state");
          return false;
        }
        if (data.scope === "STATE" && !data.hostState) {
          setError("Host state is required for state-level competitions");
          return false;
        }
        return true;
      case 4:
        if (!data.categoryId) {
          setError("Select a category specialization");
          return false;
        }
        return true;
      case 5:
        if (!data.registrationDeadline) {
          setError("Registration deadline is required");
          return false;
        }
        if (!data.startDate || !data.endDate || !data.resultDate) {
          setError("All dates are required");
          return false;
        }
        return true;
      case 6:
        if (!data.bannerSlug) {
          setError("Select a banner design theme");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    setError("");
    if (!validateStep(currentStep)) return;
    if (currentStep === 8) handleEnterStep2();
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setError("");
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCategorySelect = (categoryId: string) => {
    const cat = dbCategories.find((c) => c.id === categoryId);
    setData((prev) => ({
      ...prev,
      categoryId,
      categoryName: cat?.name || "",
    }));
  };

  const handleAgeGroupSelect = (value: string) => {
    const [min, max] = value.split("-").map(Number);
    setData((prev) => ({
      ...prev,
      minAge: min,
      maxAge: max,
    }));
  };

  const handleDifficultyChange = (level: number) => {
    setData((prev) => ({
      ...prev,
      difficultyLevel: level,
    }));
  };

  const handleEntryFeeChange = (preset: string) => {
    if (preset === "custom") {
      setData((prev) => ({
        ...prev,
        entryFeePreset: "custom",
      }));
    } else {
      setData((prev) => ({
        ...prev,
        entryFeePreset: preset,
        entryFeeINR: preset,
      }));
    }
  };

  const handleJudgeToggle = (judgeId: string) => {
    setData((prev) => ({
      ...prev,
      selectedJudgeIds: prev.selectedJudgeIds.includes(judgeId)
        ? prev.selectedJudgeIds.filter((id) => id !== judgeId)
        : [...prev.selectedJudgeIds, judgeId],
    }));
  };

  const handleAddPrize = () => {
    setData((prev) => ({
      ...prev,
      prizes: [
        ...prev.prizes,
        {
          rank: "FIRST_PLACE",
          type: "DIGITAL_CERTIFICATE",
          title: "",
          description: "",
          estimatedValue: "",
        },
      ],
    }));
  };

  const handleRemovePrize = (index: number) => {
    setData((prev) => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index),
    }));
  };

  const handleUpdatePrize = (index: number, field: string, value: string) => {
    setData((prev) => {
      const newPrizes = [...prev.prizes];
      newPrizes[index] = { ...newPrizes[index], [field]: value };
      return { ...prev, prizes: newPrizes };
    });
  };

  const handleResetCriteria = () => {
    const defaults = [...SCORING_CRITERIA[data.scope]] as CriterionConfig[];
    setData((prev) => ({
      ...prev,
      criteriaConfig: defaults,
    }));
  };

  const initializeCriteria = () => {
    if (data.criteriaConfig.length === 0) {
      const defaults = [...SCORING_CRITERIA[data.scope]] as CriterionConfig[];
      setData((prev) => ({
        ...prev,
        criteriaConfig: defaults,
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const selected = bannerTemplates.find((t) => t.slug === data.bannerSlug);
      const bannerUrl = selected?.imageUrl || null;

      const payload = {
        title: data.title,
        description: data.description,
        scope: data.scope,
        eligibleStates: data.scope === "STATE" ? data.eligibleStates : [],
        hostState: data.scope === "STATE" ? data.hostState : null,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        minAge: data.minAge,
        maxAge: data.maxAge,
        language: data.language,
        startDate: data.startDate,
        endDate: data.endDate,
        registrationDeadline: data.registrationDeadline,
        resultDate: data.resultDate,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        facebookGroupUrl: data.facebookGroupUrl || null,
        entryFeeINR: data.entryFeeINR,
        bannerUrl,
        difficultyLevel: data.difficultyLevel,
        rules: data.rules || null,
        criteriaConfig: data.criteriaConfig,
        judgeIds: data.selectedJudgeIds,
        prizes: data.prizes,
      };

      const res = await fetch("/api/admin/competitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create competition");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 min-h-screen">
      <div className="bg-cream dark:bg-charcoal rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] border border-terracotta/10 dark:border-terracotta/20 overflow-y-auto flex flex-col">
        {/* Header with Progress Bar */}
        <div className="sticky top-0 bg-gradient-to-r from-terracotta/5 to-gold/5 dark:from-terracotta/10 dark:to-gold/10 border-b border-terracotta/10 dark:border-terracotta/20 flex-shrink-0">
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-charcoal dark:text-cream">
              Create Competition
            </h2>
            <button
              onClick={onClose}
              className="text-charcoal/50 dark:text-cream/50 hover:text-charcoal dark:hover:text-cream transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="px-4">
            <div className="flex-1 h-4 bg-charcoal-light overflow-hidden relative flex items-center justify-end pr-2">
              <div
                className="h-full bg-gradient-to-r from-terracotta to-gold transition-all absolute left-0 top-0"
                style={{ width: `${(currentStep / 10) * 100}%` }}
              />
              <span className="text-xs font-bold text-cream/70 relative z-10">
                {currentStep}/10
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 dark:border-red-500/40 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Step 1: Basic Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Basic Details</h3>
              <div>
                <label className="block text-sm font-semibold text-cream/80 mb-2">
                  Competition Title *
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                  placeholder="e.g., Bengal Fine Arts 2026"
                />
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Description</h3>
              <RichTextEditor
                value={data.description}
                onChange={(html) =>
                  setData((prev) => ({
                    ...prev,
                    description: html,
                  }))
                }
                placeholder="Brief description of the competition..."
              />
            </div>
          )}

          {/* Step 3: Scope & States */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Scope & States</h3>
              <div>
                <label className="block text-sm font-semibold text-cream/80 mb-2">
                  Scope *
                </label>
                <div className="space-y-2">
                  {(["STATE", "NATIONAL"] as const).map((scope) => (
                    <label
                      key={scope}
                      className="flex items-center gap-2 text-cream text-sm"
                    >
                      <input
                        type="radio"
                        value={scope}
                        checked={data.scope === scope}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            scope: e.target.value as "STATE" | "NATIONAL",
                            eligibleStates: [],
                            criteriaConfig: [],
                          }))
                        }
                        className="accent-gold"
                      />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>
              {data.scope === "STATE" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-cream/80 mb-2">
                      Eligible States *
                    </label>
                    <SearchableSelect
                      options={stateOptions}
                      value={data.eligibleStates[0] || ""}
                      onChange={(state) =>
                        setData((prev) => ({
                          ...prev,
                          eligibleStates: [state],
                        }))
                      }
                      placeholder="Select primary state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-cream/80 mb-2">
                      Host State *
                    </label>
                    <SearchableSelect
                      options={stateOptions}
                      value={data.hostState}
                      onChange={(state) =>
                        setData((prev) => ({ ...prev, hostState: state }))
                      }
                      placeholder="Select host state"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Category & Language */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Category & Language</h3>
              <div>
                <label className="block text-sm font-semibold text-cream/80 mb-2">
                  Category Specialization *
                </label>
                <SearchableSelect
                  options={categoryOptions}
                  value={data.categoryId}
                  onChange={handleCategorySelect}
                  placeholder="Search category..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream/80 mb-2">
                  Language
                </label>
                <select
                  value={data.language}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, language: e.target.value }))
                  }
                  className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 5: Age & Dates & Fee */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Age, Dates & Fee</h3>
              <div>
                <label className="block text-sm font-semibold text-cream/80 mb-2">
                  Age Group *
                </label>
                <select
                  value={`${data.minAge}-${data.maxAge}`}
                  onChange={(e) => handleAgeGroupSelect(e.target.value)}
                  className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                >
                  <option value="">Select age group...</option>
                  {AGE_GROUPS.map((group) => (
                    <option key={group.label} value={`${group.min}-${group.max}`}>
                      {group.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-cream/80 mb-2">
                    Registration Deadline *
                  </label>
                  <input
                    type="date"
                    value={data.registrationDeadline}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        registrationDeadline: e.target.value,
                      }))
                    }
                    className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-cream/80 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={data.startDate}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-cream/80 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={data.endDate}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-cream/80 mb-2">
                    Result Date *
                  </label>
                  <input
                    type="date"
                    value={data.resultDate}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        resultDate: e.target.value,
                      }))
                    }
                    className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-cream/80 mb-2">
                    Capacity (Optional)
                  </label>
                  <input
                    type="number"
                    value={data.capacity}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, capacity: e.target.value }))
                    }
                    className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                    placeholder="Max participants"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-cream/80 mb-2">
                    Facebook Group URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={data.facebookGroupUrl}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        facebookGroupUrl: e.target.value,
                      }))
                    }
                    className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                    placeholder="https://facebook.com/groups/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream/80 mb-2">
                  Difficulty Level ({data.difficultyLevel}/5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleDifficultyChange(level)}
                      className={`transition-colors ${
                        level <= data.difficultyLevel
                          ? "text-gold"
                          : "text-cream/30"
                      }`}
                    >
                      <Star
                        className="w-6 h-6"
                        fill={level <= data.difficultyLevel ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream/80 mb-2">
                  Entry Fee (INR)
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {["50", "100", "150", "200"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleEntryFeeChange(preset)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          data.entryFeePreset === preset
                            ? "bg-gold text-charcoal"
                            : "bg-terracotta/20 text-cream border border-terracotta/30 hover:bg-terracotta/30"
                        }`}
                      >
                        ₹{preset}
                      </button>
                    ))}
                    <button
                      onClick={() => handleEntryFeeChange("custom")}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        data.entryFeePreset === "custom"
                          ? "bg-gold text-charcoal"
                          : "bg-terracotta/20 text-cream border border-terracotta/30 hover:bg-terracotta/30"
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                  {data.entryFeePreset === "custom" && (
                    <input
                      type="number"
                      value={data.entryFeeINR}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          entryFeeINR: e.target.value,
                        }))
                      }
                      className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                      placeholder="Enter custom amount"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Banner Design Theme */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Banner Design Theme</h3>
              <BannerTemplatePicker
                templates={bannerTemplates}
                value={data.bannerSlug}
                onChange={(slug) =>
                  setData((prev) => ({ ...prev, bannerSlug: slug }))
                }
              />
            </div>
          )}

          {/* Step 7: Judge Selection */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Judge Selection</h3>
              <p className="text-sm text-cream/70">
                Selected: {data.selectedJudgeIds.length} judges
              </p>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableJudges.length > 0 ? (
                  availableJudges.map((judge) => (
                    <label
                      key={judge.id}
                      className="flex items-start gap-3 p-3 bg-charcoal-light border border-terracotta/20 rounded hover:border-terracotta/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={data.selectedJudgeIds.includes(judge.id)}
                        onChange={() => handleJudgeToggle(judge.id)}
                        className="accent-gold mt-1 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-cream">{judge.name}</p>
                        <p className="text-xs text-cream/60">{judge.tier}</p>
                        {judge.specializations.length > 0 && (
                          <p className="text-xs text-cream/50">
                            {judge.specializations.join(", ")}
                          </p>
                        )}
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-cream/40 italic">Loading judges...</p>
                )}
              </div>
            </div>
          )}

          {/* Step 8: Rules */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Rules & Regulations</h3>
              <p className="text-xs text-cream/60">
                This rulebook will be visible to all participants
              </p>
              <textarea
                value={data.rules}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, rules: e.target.value }))
                }
                className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta resize-none"
                rows={12}
                placeholder="1. Participants must register before the deadline
2. Original work is mandatory
3. ...

Markdown formatting is supported."
              />
            </div>
          )}

          {/* Step 9: Criteria */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-cream">Judging Criteria</h3>
                <button
                  onClick={handleResetCriteria}
                  className="text-xs px-3 py-1 bg-terracotta/20 text-cream border border-terracotta/30 rounded hover:bg-terracotta/30 transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>

              {data.criteriaConfig.length === 0 && (
                <button
                  onClick={initializeCriteria}
                  className="w-full py-2 bg-terracotta/20 text-cream border border-terracotta/30 rounded hover:bg-terracotta/30 transition-colors"
                >
                  Initialize Default Criteria
                </button>
              )}

              <div className="space-y-3">
                {data.criteriaConfig.map((criterion, idx) => (
                  <div
                    key={criterion.key}
                    className="p-4 bg-charcoal-light border border-terracotta/20 rounded space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-cream/70 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={criterion.label}
                          onChange={(e) =>
                            setData((prev) => {
                              const newConfig = [...prev.criteriaConfig];
                              newConfig[idx] = {
                                ...newConfig[idx],
                                label: e.target.value,
                              };
                              return { ...prev, criteriaConfig: newConfig };
                            })
                          }
                          className="w-full bg-charcoal border border-terracotta/20 rounded px-2 py-1 text-cream text-xs focus:outline-none focus:border-terracotta"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-cream/70 mb-1">
                          Max Points: {criterion.max}
                        </label>
                        <div className="text-xs text-cream/50 px-2 py-1">
                          (Fixed)
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-cream/70 mb-1">
                        Description
                      </label>
                      <textarea
                        value={criterion.description || ""}
                        onChange={(e) =>
                          setData((prev) => {
                            const newConfig = [...prev.criteriaConfig];
                            newConfig[idx] = {
                              ...newConfig[idx],
                              description: e.target.value,
                            };
                            return { ...prev, criteriaConfig: newConfig };
                          })
                        }
                        className="w-full bg-charcoal border border-terracotta/20 rounded px-2 py-1 text-cream text-xs focus:outline-none focus:border-terracotta resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-cream/50">
                Note: Max point values are fixed by the scoring system and cannot be changed.
              </p>
            </div>
          )}

          {/* Step 10: Prizes */}
          {currentStep === 10 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Prizes</h3>

              <div className="space-y-3">
                {data.prizes.map((prize, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-charcoal-light border border-terracotta/20 rounded space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-cream">
                        Prize #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleRemovePrize(idx)}
                        className="text-cream/50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-cream/70 mb-1">
                          Rank
                        </label>
                        <select
                          value={prize.rank}
                          onChange={(e) =>
                            handleUpdatePrize(idx, "rank", e.target.value)
                          }
                          className="w-full bg-charcoal border border-terracotta/20 rounded px-2 py-1 text-cream text-xs focus:outline-none focus:border-terracotta"
                        >
                          {prizeRankOptions.map((rank) => (
                            <option key={rank} value={rank}>
                              {rank.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-cream/70 mb-1">
                          Type
                        </label>
                        <select
                          value={prize.type}
                          onChange={(e) =>
                            handleUpdatePrize(idx, "type", e.target.value)
                          }
                          className="w-full bg-charcoal border border-terracotta/20 rounded px-2 py-1 text-cream text-xs focus:outline-none focus:border-terracotta"
                        >
                          {prizeTypeOptions.map((type) => (
                            <option key={type} value={type}>
                              {type.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-cream/70 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={prize.title}
                        onChange={(e) =>
                          handleUpdatePrize(idx, "title", e.target.value)
                        }
                        className="w-full bg-charcoal border border-terracotta/20 rounded px-2 py-1 text-cream text-xs focus:outline-none focus:border-terracotta"
                        placeholder="e.g., Gold Medal – Fine Arts 2026"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-cream/70 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        value={prize.description || ""}
                        onChange={(e) =>
                          handleUpdatePrize(idx, "description", e.target.value)
                        }
                        className="w-full bg-charcoal border border-terracotta/20 rounded px-2 py-1 text-cream text-xs focus:outline-none focus:border-terracotta resize-none"
                        rows={2}
                        placeholder="Additional details about this prize..."
                      />
                    </div>

                    {prize.type === "CASH_PRIZE" && (
                      <div>
                        <label className="block text-xs text-cream/70 mb-1">
                          Estimated Value (INR)
                        </label>
                        <input
                          type="number"
                          value={prize.estimatedValue || ""}
                          onChange={(e) =>
                            handleUpdatePrize(idx, "estimatedValue", e.target.value)
                          }
                          className="w-full bg-charcoal border border-terracotta/20 rounded px-2 py-1 text-cream text-xs focus:outline-none focus:border-terracotta"
                          placeholder="0"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddPrize}
                className="w-full flex items-center justify-center gap-2 py-2 bg-terracotta/20 text-cream border border-terracotta/30 rounded hover:bg-terracotta/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Prize
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-terracotta/5 dark:bg-gold/5 border-t border-terracotta/10 dark:border-terracotta/20 p-6 flex items-center justify-between gap-3 flex-shrink-0">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 1}
            variant="outline"
            size="md"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep === 10 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              isLoading={isSubmitting}
              variant="primary"
              size="md"
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Submit & Deploy"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="primary"
              size="md"
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

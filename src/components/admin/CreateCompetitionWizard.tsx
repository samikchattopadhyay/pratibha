"use client";

import { useState, useMemo, useEffect } from "react";
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
  slug?: string;
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
  const [availableJudges, setAvailableJudges] = useState<Array<{
    id: string;
    name: string;
    tier: string;
    specializations: string[];
    states?: string[];
    languages?: string[];
    profileImageUrl?: string | null;
  }>>([]);
  const [data, setData] = useState<WizardData>({
    title: "",
    description: "",
    scope: "STATE",
    eligibleStates: [],
    registrationDeadline: "",
    startDate: "",
    endDate: "",
    resultDate: "",
    categoryId: "",
    categoryName: "",
    minAge: 0,
    maxAge: 0,
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
  const [judgeSearch, setJudgeSearch] = useState("");
  const [judgeTierFilter, setJudgeTierFilter] = useState("ALL");
  const [judgeSpecFilter, setJudgeSpecFilter] = useState("ALL");
  const [dynamicRubrics, setDynamicRubrics] = useState<any>(null);

  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        const res = await fetch("/api/admin/rubrics");
        if (res.ok) {
          const data = await res.json();
          setDynamicRubrics(data);
        }
      } catch (err) {
        console.error("Failed to fetch rubrics:", err);
      }
    };
    fetchRubrics();
  }, []);

  useEffect(() => {
    if (currentStep === 7 && availableJudges.length === 0) {
      handleEnterStep2();
    }
  }, [currentStep, availableJudges.length]);

  useEffect(() => {
    if (currentStep === 7 && availableJudges.length > 0) {
      // Auto-filter judges by selected category specialization
      if (data.categoryId) {
        const cat = dbCategories.find((c) => c.id === data.categoryId);
        if (cat) {
          const catSlug = (cat.slug || cat.name)
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
          setJudgeSpecFilter(catSlug);
        }
      } else {
        setJudgeSpecFilter("ALL");
      }
    }
  }, [currentStep, data.categoryId, dbCategories, availableJudges.length]);

  useEffect(() => {
    if (currentStep === 9) {
      initializeCriteria();
    }
  }, [currentStep, data.scope, data.categoryId, dynamicRubrics]);

  const judgeTiers = useMemo(() => {
    const tiers = new Set<string>();
    availableJudges.forEach((j) => {
      if (j.tier) tiers.add(j.tier);
    });
    return Array.from(tiers).sort();
  }, [availableJudges]);

  const judgeSpecializations = useMemo(() => {
    const specs = new Set<string>();
    availableJudges.forEach((j) => {
      j.specializations.forEach((s) => {
        if (s) specs.add(s.trim().toLowerCase());
      });
    });
    return Array.from(specs).sort();
  }, [availableJudges]);

  const filteredJudges = useMemo(() => {
    return availableJudges.filter((judge) => {
      const matchesSearch =
        judge.name.toLowerCase().includes(judgeSearch.toLowerCase()) ||
        judge.specializations.some((s) => s.toLowerCase().includes(judgeSearch.toLowerCase()));
      const matchesTier = judgeTierFilter === "ALL" || judge.tier === judgeTierFilter;
      const matchesSpec =
        judgeSpecFilter === "ALL" || judge.specializations.some((s) => s.toLowerCase() === judgeSpecFilter);

      let matchesScopeStates = true;
      if (data.scope === "STATE" && data.eligibleStates.length > 0) {
        // Only show judges that have matching eligible states, or if their states list is empty/unconfigured
        matchesScopeStates =
          !judge.states ||
          judge.states.length === 0 ||
          data.eligibleStates.some((state) => judge.states?.includes(state));
      }

      let matchesLanguage = true;
      if (data.language && data.language !== "Any") {
        // Show judges who speak this language, or if they have no explicit languages configured
        matchesLanguage =
          !judge.languages ||
          judge.languages.length === 0 ||
          judge.languages.includes(data.language);
      }

      return matchesSearch && matchesTier && matchesSpec && matchesScopeStates && matchesLanguage;
    });
  }, [availableJudges, judgeSearch, judgeTierFilter, judgeSpecFilter, data.scope, data.eligibleStates, data.language]);



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
      const res = await fetch("/api/admin/judges");
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
        const isValidAgeGroup = AGE_GROUPS.some(
          (group) => group.min === data.minAge && group.max === data.maxAge
        );
        if (!isValidAgeGroup) {
          setError("Age group is required");
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
      case 7:
        return true;
      case 8:
        if (!data.rules || data.rules.replace(/<[^>]*>/g, "").trim().length < 10) {
          setError("Rules & Regulations are required (at least 10 characters)");
          return false;
        }
        return true;
      case 9:
        if (data.criteriaConfig.length === 0) {
          setError("At least one judging criterion is required");
          return false;
        }
        const totalPoints = data.criteriaConfig.reduce((sum, c) => sum + (c.max || 0), 0);
        if (totalPoints !== 100) {
          setError(`Total max points must equal exactly 100. Current total is ${totalPoints}.`);
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
    const catName = cat?.name || "";
    
    // Check for implicit language
    const nameLower = catName.toLowerCase();
    let implicitLanguage = "";
    if (nameLower.includes("bengali") || nameLower.includes("rabindra") || nameLower.includes("nazrul")) {
      implicitLanguage = "Bengali";
    } else if (nameLower.includes("hindi")) {
      implicitLanguage = "Hindi";
    } else if (nameLower.includes("sanskrit")) {
      implicitLanguage = "Sanskrit";
    } else if (nameLower.includes("english")) {
      implicitLanguage = "English";
    }

    setData((prev) => ({
      ...prev,
      categoryId,
      categoryName: catName,
      language: implicitLanguage || "Any",
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
    const cat = dbCategories.find((c) => c.id === data.categoryId);
    const grouping = cat?.grouping || "MUSIC_VOCAL";
    const source = dynamicRubrics || SCORING_CRITERIA;
    const groupCriteria = source[data.scope]?.[grouping] || source[data.scope]?.["MUSIC_VOCAL"] || [];
    const defaults = groupCriteria.map((c: any) => ({ ...c })) as CriterionConfig[];
    setData((prev) => ({
      ...prev,
      criteriaConfig: defaults,
    }));
  };

  const initializeCriteria = () => {
    const cat = dbCategories.find((c) => c.id === data.categoryId);
    const grouping = cat?.grouping || "MUSIC_VOCAL";
    const source = dynamicRubrics || SCORING_CRITERIA;
    const groupCriteria = source[data.scope]?.[grouping] || source[data.scope]?.["MUSIC_VOCAL"] || [];
    const defaults = groupCriteria.map((c: any) => ({ ...c })) as CriterionConfig[];
    setData((prev) => ({
      ...prev,
      criteriaConfig: defaults,
    }));
  };

  const handleAddCriterion = () => {
    setData((prev) => ({
      ...prev,
      criteriaConfig: [
        ...prev.criteriaConfig,
        {
          key: `criteria_custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          label: "",
          max: 10,
          description: "",
        },
      ],
    }));
  };

  const handleRemoveCriterion = (idx: number) => {
    setData((prev) => ({
      ...prev,
      criteriaConfig: prev.criteriaConfig.filter((_, i) => i !== idx),
    }));
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
        <div className="sticky top-0 z-20 bg-gradient-to-r from-terracotta/5 to-gold/5 dark:from-terracotta/10 dark:to-gold/10 border-b border-terracotta/10 dark:border-terracotta/20 flex-shrink-0">
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

          <div>
            <div className="flex-1 h-4 bg-charcoal-light overflow-hidden relative flex items-center justify-end pr-2">
              <div
                className="h-full bg-gradient-to-r from-terracotta to-gold transition-all absolute left-0 top-0"
                style={{ width: `${(currentStep / 10) * 100}%` }}
              />
              <span className="text-[10px] font-bold text-cream/70 relative z-10">
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
                    placeholder="Select eligible state"
                  />
                </div>
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
              {(() => {
                const nameLower = data.categoryName.toLowerCase();
                const isImplicit = nameLower.includes("bengali") || nameLower.includes("rabindra") || nameLower.includes("nazrul") || nameLower.includes("hindi") || nameLower.includes("sanskrit") || nameLower.includes("english");
                
                if (isImplicit) {
                  return (
                    <div className="p-3 bg-charcoal-light border border-terracotta/10 rounded text-xs text-cream/70">
                      Language: <strong className="text-gold">{data.language}</strong> (implicitly set by category)
                    </div>
                  );
                }

                return (
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
                );
              })()}
            </div>
          )}

          {/* Step 5: Dates & Capacity */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Dates & Capacity</h3>
              <div className="grid grid-cols-2 gap-4">
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
                    onClick={(e) => e.currentTarget.showPicker()}
                    className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta cursor-pointer"
                  />
                </div>
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
                    onClick={(e) => e.currentTarget.showPicker()}
                    className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta cursor-pointer"
                  />
                </div>
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
                    onClick={(e) => e.currentTarget.showPicker()}
                    className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta cursor-pointer"
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
                    onClick={(e) => e.currentTarget.showPicker()}
                    className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta cursor-pointer"
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
                categoryGrouping={dbCategories.find((c) => c.id === data.categoryId)?.grouping || undefined}
              />
            </div>
          )}

          {/* Step 7: Judge Selection */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Judge Selection</h3>
              <div className="flex flex-wrap gap-2 items-center justify-between text-sm text-cream/70">
                <span>Selected: {data.selectedJudgeIds.length} judges</span>
                <span className="text-xs">Showing {filteredJudges.length} of {availableJudges.length}</span>
              </div>

              {/* Filters bar */}
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  placeholder="Search name/specialization..."
                  value={judgeSearch}
                  onChange={(e) => setJudgeSearch(e.target.value)}
                  className="flex-1 min-w-[150px] bg-charcoal border border-terracotta/20 rounded px-2.5 py-1 text-cream text-xs focus:outline-none focus:border-terracotta"
                />
                <select
                  value={judgeTierFilter}
                  onChange={(e) => setJudgeTierFilter(e.target.value)}
                  className="bg-charcoal border border-terracotta/20 rounded px-2 py-1 text-cream text-xs focus:outline-none focus:border-terracotta"
                >
                  <option value="ALL">All Tiers</option>
                  {judgeTiers.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
                <select
                  value={judgeSpecFilter}
                  onChange={(e) => setJudgeSpecFilter(e.target.value)}
                  className="bg-charcoal border border-terracotta/20 rounded px-2 py-1 text-cream text-xs focus:outline-none focus:border-terracotta capitalize"
                >
                  <option value="ALL">All Specializations</option>
                  {judgeSpecializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {filteredJudges.length > 0 ? (
                  filteredJudges.map((judge) => {
                    const isSelected = data.selectedJudgeIds.includes(judge.id);
                    return (
                      <label
                        key={judge.id}
                        className={`flex items-start gap-3 p-3 rounded cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-gold/10 border-gold shadow-lg ring-1 ring-gold/20"
                            : "bg-charcoal-light border-terracotta/20 hover:border-terracotta/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleJudgeToggle(judge.id)}
                          className="sr-only"
                        />
                        {/* Profile Image/Avatar */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-terracotta/10 border border-terracotta/20 flex items-center justify-center">
                          {judge.profileImageUrl ? (
                            <img
                              src={judge.profileImageUrl}
                              alt={judge.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-cream text-xs font-bold">
                              {judge.name.replace(/^(Prof\.|Smt\.|Dr\.|Mr\.|Ms\.)\s+/i, "").charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-cream truncate" title={judge.name}>{judge.name}</p>
                          <p className="text-xs text-cream/60">{judge.tier}</p>
                          {judge.specializations.length > 0 && (
                            <p className="text-xs text-cream/50 truncate" title={judge.specializations.join(", ")}>
                              {judge.specializations.join(", ")}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-sm text-cream/40 italic col-span-3 text-center py-4">
                    {availableJudges.length === 0 ? "Loading judges..." : "No judges match the filters"}
                  </p>
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
              <RichTextEditor
                value={data.rules}
                onChange={(html) =>
                  setData((prev) => ({
                    ...prev,
                    rules: html,
                  }))
                }
                placeholder="1. Participants must register before the deadline.
2. Original work is mandatory.
3. ..."
              />
            </div>
          )}

          {/* Step 9: Criteria */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-cream">Judging Criteria</h3>
                  <p className="text-xs text-cream/60">Define evaluation metrics and their point allocation.</p>
                </div>
                <button
                  onClick={handleResetCriteria}
                  className="text-xs px-3 py-1 bg-terracotta/20 text-cream border border-terracotta/30 rounded hover:bg-terracotta/30 transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>

              {/* Total points summary card */}
              {(() => {
                const totalPoints = data.criteriaConfig.reduce((sum, c) => sum + (c.max || 0), 0);
                const isValid = totalPoints === 100;
                return (
                  <div className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
                    isValid 
                      ? "bg-green-500/10 border-green-500/30 text-green-400" 
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium block">Total Allocated Points</span>
                        <span className="text-xs opacity-75">All criteria must sum up to exactly 100 points.</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold font-mono">{totalPoints}</span>
                        <span className="text-sm font-medium"> / 100</span>
                      </div>
                    </div>

                    {data.criteriaConfig.length > 0 && (
                      <div className="pt-2 border-t border-current/10 space-y-1.5 text-xs">
                        <span className="font-semibold block opacity-80 uppercase tracking-wider text-[10px]">Calculated Summary Rubric:</span>
                        {data.criteriaConfig.map((c, i) => (
                          <div key={c.key || i} className="flex justify-between items-center opacity-90 pl-1 border-l-2 border-current/20">
                            <span className="truncate max-w-[350px] font-medium">{c.label || <span className="italic opacity-55">Unnamed Criterion</span>}</span>
                            <span className="font-mono font-bold whitespace-nowrap">{c.max || 0} pts ({(c.max || 0)}%)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

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
                    className="p-4 bg-charcoal-light border border-terracotta/20 rounded space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gold font-mono uppercase tracking-wider">
                        Criterion #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveCriterion(idx)}
                        className="text-cream/50 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-colors"
                        title="Remove criterion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
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
                          placeholder="e.g., Accuracy"
                          className="w-full bg-charcoal border border-terracotta/20 rounded px-2.5 py-1.5 text-cream text-xs focus:outline-none focus:border-terracotta"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-cream/70 mb-1">
                          Max Points
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={criterion.max}
                          onChange={(e) =>
                            setData((prev) => {
                              const newConfig = [...prev.criteriaConfig];
                              newConfig[idx] = {
                                ...newConfig[idx],
                                max: parseInt(e.target.value) || 0,
                              };
                              return { ...prev, criteriaConfig: newConfig };
                            })
                          }
                          className="w-full bg-charcoal border border-terracotta/20 rounded px-2.5 py-1.5 text-cream text-xs focus:outline-none focus:border-terracotta font-mono font-bold text-center"
                        />
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
                        placeholder="Guidelines for judges evaluating this criterion..."
                        className="w-full bg-charcoal border border-terracotta/20 rounded px-2.5 py-1.5 text-cream text-xs focus:outline-none focus:border-terracotta resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddCriterion}
                className="w-full flex items-center justify-center gap-2 py-2 bg-terracotta/20 text-cream border border-terracotta/30 rounded hover:bg-terracotta/30 transition-colors text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Custom Criterion
              </button>
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
        <div className="sticky bottom-0 z-10 bg-terracotta/5 dark:bg-gold/5 border-t border-terracotta/10 dark:border-terracotta/20 p-6 flex items-center justify-between gap-3 flex-shrink-0">
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

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Star } from "lucide-react";
import SearchableSelect from "./SearchableSelect";
import BannerTemplatePicker from "./BannerTemplatePicker";
import Button from "../Button";
import RichTextEditor from "../RichTextEditor";
import { INDIA_STATES, AGE_GROUPS, SCORING_CRITERIA } from "@/lib/constants";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { competitionSchema } from "@/schemas/admin";
import FormError from "../forms/FormError";
import { z } from "zod";

interface CriterionConfig {
  key: string;
  label: string;
  max: number;
  description?: string;
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

  const { register, handleSubmit: hookHandleSubmit, control, trigger, setValue, watch, reset, formState: { errors } } = useForm<z.input<typeof competitionSchema>>({
    resolver: zodResolver(competitionSchema),
    mode: "onBlur",
    defaultValues: {
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
      capacity: null,
      facebookGroupUrl: "",
      difficultyLevel: 1,
      entryFeeINR: 50,
      bannerTemplateId: "",
      judgeIds: [],
      rules: "",
      scoringCriteria: [],
      prizes: [],
    },
  });

  const watchedValues = watch();
  const [entryFeePreset, setEntryFeePreset] = useState("50");
  const [judgeSearch, setJudgeSearch] = useState("");
  const [judgeTierFilter, setJudgeTierFilter] = useState("ALL");
  const [judgeSpecFilter, setJudgeSpecFilter] = useState("ALL");
  const [dynamicRubrics, setDynamicRubrics] = useState<Record<string, Record<string, CriterionConfig[]>> | null>(null);

  const initializeCriteria = useCallback(() => {
    const cat = dbCategories.find((c) => c.id === watchedValues.categoryId);
    const grouping = cat?.grouping || "MUSIC_VOCAL";
    const source = (dynamicRubrics || SCORING_CRITERIA) as Record<string, Record<string, CriterionConfig[]>>;
    const groupCriteria = source[watchedValues.scope || "STATE"]?.[grouping] || source[watchedValues.scope || "STATE"]?.["MUSIC_VOCAL"] || [];
    const defaults = groupCriteria.map((c: CriterionConfig) => ({ ...c })) as CriterionConfig[];
    setValue("scoringCriteria", defaults, { shouldValidate: true });
  }, [dbCategories, watchedValues.categoryId, watchedValues.scope, dynamicRubrics, setValue]);

  useEffect(() => {
    if (isOpen) {
      reset({
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
        capacity: null,
        facebookGroupUrl: "",
        difficultyLevel: 1,
        entryFeeINR: 50,
        bannerTemplateId: "",
        judgeIds: [],
        rules: "",
        scoringCriteria: [],
        prizes: [],
      });
      setCurrentStep(1);
      setError("");
      setEntryFeePreset("50");
      setJudgeSearch("");
      setJudgeTierFilter("ALL");
      setJudgeSpecFilter("ALL");
    }
  }, [isOpen, reset]);

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
      if (watchedValues.categoryId) {
        const cat = dbCategories.find((c) => c.id === watchedValues.categoryId);
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
  }, [currentStep, watchedValues.categoryId, dbCategories, availableJudges.length]);

  useEffect(() => {
    if (currentStep === 9) {
      initializeCriteria();
    }
  }, [currentStep, initializeCriteria]);

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
      if (watchedValues.scope === "STATE" && (watchedValues.eligibleStates || []).length > 0) {
        // Only show judges that have matching eligible states, or if their states list is empty/unconfigured
        matchesScopeStates =
          !judge.states ||
          judge.states.length === 0 ||
          watchedValues.eligibleStates.some((state) => judge.states?.includes(state));
      }

      let matchesLanguage = true;
      if (watchedValues.language && watchedValues.language !== "Any") {
        // Show judges who speak this language, or if they have no explicit languages configured
        matchesLanguage =
          !judge.languages ||
          judge.languages.length === 0 ||
          judge.languages.includes(watchedValues.language);
      }

      return matchesSearch && matchesTier && matchesSpec && matchesScopeStates && matchesLanguage;
    });
  }, [availableJudges, judgeSearch, judgeTierFilter, judgeSpecFilter, watchedValues.scope, watchedValues.eligibleStates, watchedValues.language]);

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

  const handleNext = async () => {
    setError("");
    let fieldsToValidate: Array<keyof z.input<typeof competitionSchema>> = [];
    if (currentStep === 1) {
      fieldsToValidate = ["title", "minAge", "maxAge", "difficultyLevel", "entryFeeINR"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["description"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["scope", "eligibleStates"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["categoryId", "categoryName", "language"];
    } else if (currentStep === 5) {
      fieldsToValidate = ["startDate", "endDate", "registrationDeadline", "resultDate", "capacity"];
    } else if (currentStep === 6) {
      fieldsToValidate = ["bannerTemplateId"];
    } else if (currentStep === 7) {
      fieldsToValidate = ["judgeIds"];
    } else if (currentStep === 8) {
      fieldsToValidate = ["rules"];
    } else if (currentStep === 9) {
      fieldsToValidate = ["scoringCriteria"];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        setError("Please fix validation errors before continuing.");
        return;
      }
    }

    // Additional checks
    if (currentStep === 9) {
      const criteria = watchedValues.scoringCriteria || [];
      const totalPoints = criteria.reduce((sum, c) => sum + (c.max || 0), 0);
      if (totalPoints !== 100) {
        setError(`Total max points must equal exactly 100. Current total is ${totalPoints}.`);
        return;
      }
    }

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

    setValue("categoryId", categoryId, { shouldValidate: true });
    setValue("categoryName", catName, { shouldValidate: true });
    setValue("language", implicitLanguage || "Any", { shouldValidate: true });
  };

  const handleAgeGroupSelect = (value: string) => {
    if (!value) {
      setValue("minAge", 0, { shouldValidate: true });
      setValue("maxAge", 0, { shouldValidate: true });
      return;
    }
    const [min, max] = value.split("-").map(Number);
    setValue("minAge", min, { shouldValidate: true });
    setValue("maxAge", max, { shouldValidate: true });
  };

  const handleDifficultyChange = (level: number) => {
    setValue("difficultyLevel", level, { shouldValidate: true });
  };

  const handleEntryFeeChange = (preset: string) => {
    setEntryFeePreset(preset);
    if (preset !== "custom") {
      setValue("entryFeeINR", Number(preset), { shouldValidate: true });
    }
  };

  const handleJudgeToggle = (judgeId: string) => {
    const current = watchedValues.judgeIds || [];
    const next = current.includes(judgeId)
      ? current.filter((id) => id !== judgeId)
      : [...current, judgeId];
    setValue("judgeIds", next, { shouldValidate: true });
  };

  const handleAddPrize = () => {
    const current = watchedValues.prizes || [];
    setValue("prizes", [
      ...current,
      {
        rank: "FIRST_PLACE",
        type: "DIGITAL_CERTIFICATE",
        title: "",
        description: "",
        estimatedValue: "",
      },
    ], { shouldValidate: true });
  };

  const handleRemovePrize = (index: number) => {
    const current = watchedValues.prizes || [];
    setValue("prizes", current.filter((_, i) => i !== index), { shouldValidate: true });
  };

  const handleUpdatePrize = (index: number, field: string, value: string) => {
    const current = watchedValues.prizes || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue("prizes", updated, { shouldValidate: true });
  };

  const handleResetCriteria = () => {
    if (!confirm("Reset criteria to defaults for this scope and category? This action cannot be undone.")) {
      return;
    }
    const cat = dbCategories.find((c) => c.id === watchedValues.categoryId);
    const grouping = cat?.grouping || "MUSIC_VOCAL";
    const source = (dynamicRubrics || SCORING_CRITERIA) as Record<string, Record<string, CriterionConfig[]>>;
    const groupCriteria = source[watchedValues.scope || "STATE"]?.[grouping] || source[watchedValues.scope || "STATE"]?.["MUSIC_VOCAL"] || [];
    const defaults = groupCriteria.map((c: CriterionConfig) => ({ ...c })) as CriterionConfig[];
    setValue("scoringCriteria", defaults, { shouldValidate: true });
  };


  const handleAddCriterion = () => {
    const current = watchedValues.scoringCriteria || [];
    setValue("scoringCriteria", [
      ...current,
      {
        key: `criteria_custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        label: "",
        max: 10,
        description: "",
      },
    ], { shouldValidate: true });
  };

  const handleRemoveCriterion = (idx: number) => {
    const current = watchedValues.scoringCriteria || [];
    setValue("scoringCriteria", current.filter((_, i) => i !== idx), { shouldValidate: true });
  };

  const onSubmit = hookHandleSubmit(async (formDataVal) => {
    setIsSubmitting(true);
    setError("");

    try {
      const selected = bannerTemplates.find((t) => t.id === formDataVal.bannerTemplateId);
      const bannerUrl = selected?.imageUrl || null;

      const payload = {
        title: formDataVal.title,
        description: formDataVal.description,
        scope: formDataVal.scope,
        eligibleStates: formDataVal.scope === "STATE" ? formDataVal.eligibleStates : [],
        categoryId: formDataVal.categoryId,
        categoryName: formDataVal.categoryName,
        minAge: formDataVal.minAge,
        maxAge: formDataVal.maxAge,
        language: formDataVal.language,
        startDate: formDataVal.startDate,
        endDate: formDataVal.endDate,
        registrationDeadline: formDataVal.registrationDeadline,
        resultDate: formDataVal.resultDate,
        capacity: formDataVal.capacity,
        facebookGroupUrl: formDataVal.facebookGroupUrl || null,
        entryFeeINR: formDataVal.entryFeeINR.toString(),
        bannerUrl,
        difficultyLevel: formDataVal.difficultyLevel,
        rules: formDataVal.rules || null,
        criteriaConfig: formDataVal.scoringCriteria,
        judgeIds: formDataVal.judgeIds,
        prizes: formDataVal.prizes,
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
  });

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
                  {...register("title")}
                  className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                  placeholder="e.g., Bengal Fine Arts 2026"
                />
                {errors.title && <FormError error={errors.title.message} />}
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream/80 mb-2">
                  Age Group *
                </label>
                <select
                  value={(watchedValues.minAge !== undefined && watchedValues.maxAge !== undefined) ? `${watchedValues.minAge}-${watchedValues.maxAge}` : ""}
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
                {(errors.minAge || errors.maxAge) && <FormError error={errors.minAge?.message || errors.maxAge?.message} />}
              </div>
              <div>
                <label className="block text-sm font-semibold text-cream/80 mb-2">
                  Difficulty Level ({(watchedValues.difficultyLevel || 1)}/5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => handleDifficultyChange(level)}
                      className={`transition-colors ${
                        level <= (watchedValues.difficultyLevel || 1)
                          ? "text-gold"
                          : "text-cream/30"
                      }`}
                    >
                      <Star
                        className="w-6 h-6"
                        fill={level <= (watchedValues.difficultyLevel || 1) ? "currentColor" : "none"}
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
                        type="button"
                        key={preset}
                        onClick={() => handleEntryFeeChange(preset)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          entryFeePreset === preset
                            ? "bg-gold text-charcoal"
                            : "bg-terracotta/20 text-cream border border-terracotta/30 hover:bg-terracotta/30"
                        }`}
                      >
                        ₹{preset}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleEntryFeeChange("custom")}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        entryFeePreset === "custom"
                          ? "bg-gold text-charcoal"
                          : "bg-terracotta/20 text-cream border border-terracotta/30 hover:bg-terracotta/30"
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                  {entryFeePreset === "custom" && (
                    <input
                      type="number"
                      value={watchedValues.entryFeeINR || ""}
                      onChange={(e) =>
                        setValue("entryFeeINR", Number(e.target.value), { shouldValidate: true })
                      }
                      className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                      placeholder="Enter custom amount"
                    />
                  )}
                  {errors.entryFeeINR && <FormError error={errors.entryFeeINR.message} />}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Description</h3>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Brief description of the competition..."
                  />
                )}
              />
              {errors.description && <FormError error={errors.description.message} />}
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
                      className="flex items-center gap-2 text-cream text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        value={scope}
                        checked={watchedValues.scope === scope}
                        onChange={(e) => {
                          const val = e.target.value as "STATE" | "NATIONAL";
                          setValue("scope", val, { shouldValidate: true });
                          setValue("eligibleStates", val === "NATIONAL" ? ["NATIONAL"] : []);
                        }}
                        className="accent-gold cursor-pointer"
                      />
                      {scope}
                    </label>
                  ))}
                </div>
                {errors.scope && <FormError error={errors.scope.message} />}
              </div>
              {watchedValues.scope === "STATE" && (
                <div>
                  <label className="block text-sm font-semibold text-cream/80 mb-2">
                    Eligible States *
                  </label>
                  <Controller
                    control={control}
                    name="eligibleStates"
                    render={({ field }) => (
                      <SearchableSelect
                        options={stateOptions}
                        value={(field.value || [])[0] || ""}
                        onChange={(state) => field.onChange([state])}
                        placeholder="Select eligible state"
                      />
                    )}
                  />
                  {errors.eligibleStates && <FormError error={errors.eligibleStates.message} />}
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
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <SearchableSelect
                      options={categoryOptions}
                      value={field.value || ""}
                      onChange={(val) => {
                        field.onChange(val);
                        handleCategorySelect(val);
                      }}
                      placeholder="Search category..."
                    />
                  )}
                />
                {errors.categoryId && <FormError error={errors.categoryId.message} />}
              </div>
              {(() => {
                const nameLower = (watchedValues.categoryName || "").toLowerCase();
                const isImplicit = nameLower.includes("bengali") || nameLower.includes("rabindra") || nameLower.includes("nazrul") || nameLower.includes("hindi") || nameLower.includes("sanskrit") || nameLower.includes("english");
                
                if (isImplicit) {
                  return (
                    <div className="p-3 bg-charcoal-light border border-terracotta/10 rounded text-xs text-cream/70">
                      Language: <strong className="text-gold">{watchedValues.language}</strong> (implicitly set by category)
                    </div>
                  );
                }

                return (
                  <div>
                    <label className="block text-sm font-semibold text-cream/80 mb-2">
                      Language
                    </label>
                    <select
                      {...register("language")}
                      className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                    >
                      {languageOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.language && <FormError error={errors.language.message} />}
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
                     {...register("startDate")}
                     onClick={(e) => e.currentTarget.showPicker()}
                     className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta cursor-pointer"
                   />
                   {errors.startDate && <FormError error={errors.startDate.message} />}
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-cream/80 mb-2">
                     End Date *
                   </label>
                   <input
                     type="date"
                     {...register("endDate")}
                     onClick={(e) => e.currentTarget.showPicker()}
                     className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta cursor-pointer"
                   />
                   {errors.endDate && <FormError error={errors.endDate.message} />}
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-cream/80 mb-2">
                     Registration Deadline *
                   </label>
                   <input
                     type="date"
                     {...register("registrationDeadline")}
                     onClick={(e) => e.currentTarget.showPicker()}
                     className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta cursor-pointer"
                   />
                   {errors.registrationDeadline && <FormError error={errors.registrationDeadline.message} />}
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-cream/80 mb-2">
                     Result Date *
                   </label>
                   <input
                     type="date"
                     {...register("resultDate")}
                     onClick={(e) => e.currentTarget.showPicker()}
                     className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta cursor-pointer"
                   />
                   {errors.resultDate && <FormError error={errors.resultDate.message} />}
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-cream/80 mb-2">
                     Capacity (Optional)
                   </label>
                   <input
                     type="number"
                     {...register("capacity", {
                       setValueAs: (v) => (v === "" ? null : Number(v)),
                     })}
                     className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                     placeholder="Max participants"
                   />
                   {errors.capacity && <FormError error={errors.capacity.message} />}
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-cream/80 mb-2">
                     Facebook Group URL (Optional)
                   </label>
                   <input
                     type="url"
                     {...register("facebookGroupUrl")}
                     className="w-full bg-charcoal border border-terracotta/20 rounded px-3 py-2 text-cream text-sm focus:outline-none focus:border-terracotta"
                     placeholder="https://facebook.com/groups/..."
                   />
                   {errors.facebookGroupUrl && <FormError error={errors.facebookGroupUrl.message} />}
                 </div>
               </div>
            </div>
          )}

          {/* Step 6: Banner Design Theme */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Banner Design Theme</h3>
              <Controller
                control={control}
                name="bannerTemplateId"
                render={({ field }) => (
                  <BannerTemplatePicker
                    templates={bannerTemplates}
                    value={field.value || ""}
                    onChange={field.onChange}
                    categoryGrouping={dbCategories.find((c) => c.id === watchedValues.categoryId)?.grouping || undefined}
                  />
                )}
              />
              {errors.bannerTemplateId && <FormError error={errors.bannerTemplateId.message} />}
            </div>
          )}

          {/* Step 7: Judge Selection */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Judge Selection</h3>
              <div className="flex flex-wrap gap-2 items-center justify-between text-sm text-cream/70">
                <span>Selected: {(watchedValues.judgeIds || []).length} judges</span>
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
                    const isSelected = (watchedValues.judgeIds || []).includes(judge.id);
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
              {errors.judgeIds && <FormError error={errors.judgeIds.message} />}
            </div>
          )}

          {/* Step 8: Rules */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cream">Rules & Regulations</h3>
              <p className="text-xs text-cream/60">
                This rulebook will be visible to all participants
              </p>
              <Controller
                control={control}
                name="rules"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="1. Participants must register before the deadline.
2. Original work is mandatory.
3. ..."
                  />
                )}
              />
              {errors.rules && <FormError error={errors.rules.message} />}
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
                  type="button"
                  onClick={handleResetCriteria}
                  className="text-xs px-3 py-1 bg-terracotta/20 text-cream border border-terracotta/30 rounded hover:bg-terracotta/30 transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>

              {/* Total points summary card */}
              {(() => {
                const totalPoints = (watchedValues.scoringCriteria || []).reduce((sum, c) => sum + (c.max || 0), 0);
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

                    {(watchedValues.scoringCriteria || []).length > 0 && (
                      <div className="pt-2 border-t border-current/10 space-y-1.5 text-xs">
                        <span className="font-semibold block opacity-80 uppercase tracking-wider text-[10px]">Calculated Summary Rubric:</span>
                        {(watchedValues.scoringCriteria || []).map((c, i) => (
                          <div key={c.key || i} className="flex justify-between items-center opacity-90 pl-1 border-l-2 border-current/20">
                            <span className="truncate max-w-[350px] font-medium">{c.label || <span className="italic opacity-55">Unnamed Criterion</span>}</span>
                            <span className="font-mono font-bold whitespace-nowrap">{c.max || 0} pts ({c.max || 0}%)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {(watchedValues.scoringCriteria || []).length === 0 && (
                <button
                  type="button"
                  onClick={initializeCriteria}
                  className="w-full py-2 bg-terracotta/20 text-cream border border-terracotta/30 rounded hover:bg-terracotta/30 transition-colors"
                >
                  Initialize Default Criteria
                </button>
              )}

              <div className="space-y-3">
                {(watchedValues.scoringCriteria || []).map((criterion, idx) => (
                  <div
                    key={criterion.key}
                    className="p-4 bg-charcoal-light border border-terracotta/20 rounded space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gold font-mono uppercase tracking-wider">
                        Criterion #{idx + 1}
                      </span>
                      <button
                        type="button"
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
                          onChange={(e) => {
                            const current = watchedValues.scoringCriteria || [];
                            const updated = [...current];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setValue("scoringCriteria", updated, { shouldValidate: true });
                          }}
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
                          onChange={(e) => {
                            const current = watchedValues.scoringCriteria || [];
                            const updated = [...current];
                            updated[idx] = { ...updated[idx], max: parseInt(e.target.value) || 0 };
                            setValue("scoringCriteria", updated, { shouldValidate: true });
                          }}
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
                        onChange={(e) => {
                          const current = watchedValues.scoringCriteria || [];
                          const updated = [...current];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setValue("scoringCriteria", updated, { shouldValidate: true });
                        }}
                        placeholder="Guidelines for judges evaluating this criterion..."
                        className="w-full bg-charcoal border border-terracotta/20 rounded px-2.5 py-1.5 text-cream text-xs focus:outline-none focus:border-terracotta resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {errors.scoringCriteria && <FormError error={errors.scoringCriteria.message} />}

              <button
                type="button"
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
                {(watchedValues.prizes || []).map((prize, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-charcoal-light border border-terracotta/20 rounded space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-cream">
                        Prize #{idx + 1}
                      </span>
                      <button
                        type="button"
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
              {errors.prizes && <FormError error={errors.prizes.message} />}

              <button
                type="button"
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
            type="button"
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
              type="button"
              onClick={onSubmit}
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
              type="button"
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

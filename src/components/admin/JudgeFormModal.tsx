"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { Judge } from "./ParticipantsTab";
import ChipMultiSelect from "./ChipMultiSelect";
import SearchableSelect from "./SearchableSelect";
import RichTextEditor from "@/components/RichTextEditor";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { judgeSchema } from "@/schemas/admin";
import FormError from "@/components/forms/FormError";
import { z } from "zod";

interface JudgeFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly editingJudge: Judge | null;
  readonly onRefresh?: () => void;
  readonly categories?: readonly { id: string; name: string; slug?: string | null; grouping?: string | null; icon?: string | null }[];
}

interface JudgePayload {
  id?: string;
  name: string;
  email: string;
  tier: string;
  specializations: string[];
  bio: string;
  credentials: string;
  stateOfResidence: string;
  states: string[];
  languages: string[];
  yearsOfExperience: number | null;
  isVerified: boolean;
  isAvailable: boolean;
}

const AVAILABLE_SPECIALIZATIONS = [
  { value: "classical-vocal", label: "Classical Vocal" },
  { value: "hindustani-classical-vocals", label: "Hindustani Classical Vocals" },
  { value: "rabindra-sangeet", label: "Rabindra Sangeet" },
  { value: "drawing-painting", label: "Drawing & Painting" },
  { value: "visual-arts", label: "Visual Arts" },
  { value: "digital-illustration", label: "Digital Illustration" },
  { value: "classical-instrumental", label: "Classical Instrumental" },
  { value: "instrumental-sitar", label: "Instrumental Sitar" },
  { value: "instrumental-flute", label: "Instrumental Flute" },
  { value: "classical-dance", label: "Classical Dance" },
  { value: "performing-arts", label: "Performing Arts" },
  { value: "poetry-recitation", label: "Poetry Recitation" },
  { value: "creative-writing", label: "Creative Writing" },
  { value: "story-telling", label: "Storytelling" }
];

const CATEGORY_GROUPS = [
  { value: "MUSIC_VOCAL", label: "Music (Vocal)" },
  { value: "MUSIC_INSTRUMENTAL", label: "Music (Instrumental)" },
  { value: "PERFORMING_ARTS", label: "Performing Arts" },
  { value: "VISUAL_ARTS", label: "Visual Arts" },
  { value: "LITERARY_ARTS", label: "Literary Arts" },
  { value: "SPOKEN_WORD", label: "Spoken Word" },
];

const LANGUAGES_OPTIONS = [
  { value: "Bengali", label: "Bengali" },
  { value: "Hindi", label: "Hindi" },
  { value: "English", label: "English" },
  { value: "Sanskrit", label: "Sanskrit" },
];

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

const STATES_OPTIONS = INDIA_STATES.map((state) => ({
  value: state,
  label: state,
}));

const ELIGIBLE_STATES_OPTIONS = [
  { value: "NATIONAL", label: "National (All States)" },
  ...STATES_OPTIONS,
];

export default function JudgeFormModal({
  isOpen,
  onClose,
  editingJudge,
  onRefresh,
  categories,
}: JudgeFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailChecking, setEmailChecking] = useState(false);

  const { register, handleSubmit: hookHandleSubmit, control, trigger, reset, formState: { errors } } = useForm<z.input<typeof judgeSchema>>({
    resolver: zodResolver(judgeSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      tier: "LOCAL",
      specializations: [],
      bio: "",
      credentials: "",
      stateOfResidence: "",
      states: [],
      languages: [],
      yearsOfExperience: null,
      isVerified: false,
      isAvailable: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        editingJudge
          ? {
              name: editingJudge.name || "",
              email: editingJudge.email || "",
              tier: editingJudge.tier || "LOCAL",
              specializations: editingJudge.specializations || [],
              bio: editingJudge.bio || "",
              credentials: editingJudge.credentials || "",
              stateOfResidence: editingJudge.stateOfResidence || "",
              states: editingJudge.states || [],
              languages: editingJudge.languages || [],
              yearsOfExperience: editingJudge.yearsOfExperience ?? null,
              isVerified: editingJudge.isVerified || false,
              isAvailable: editingJudge.isAvailable ?? true,
            }
          : {
              name: "",
              email: "",
              tier: "LOCAL",
              specializations: [],
              bio: "",
              credentials: "",
              stateOfResidence: "",
              states: [],
              languages: [],
              yearsOfExperience: null,
              isVerified: false,
              isAvailable: true,
            }
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStep(1);
      setErrorMsg("");
      setEmailError("");
    }
  }, [isOpen, editingJudge, reset]);

  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");

  // Dynamic groupings list computed from database categories + standard groupings
  const groupings = useMemo(() => {
    const list = new Set<string>();
    categories?.forEach((cat) => {
      if (cat.grouping) list.add(cat.grouping);
    });
    const standardKeys = CATEGORY_GROUPS.map((g) => g.value);
    const uniqueGroups = Array.from(list);

    const combined = [...CATEGORY_GROUPS];
    uniqueGroups.forEach((g) => {
      if (!standardKeys.includes(g)) {
        combined.push({
          value: g,
          label: g.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        });
      }
    });
    return combined;
  }, [categories]);

  // Convert categories to options structure used by ChipMultiSelect
  const specializationOptions = useMemo(() => {
    if (!categories || categories.length === 0) {
      return AVAILABLE_SPECIALIZATIONS.map((spec) => ({
        ...spec,
        grouping: "UNASSIGNED",
      }));
    }
    return categories.map((cat) => {
      const value = (cat.slug || cat.name)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      return {
        value,
        label: cat.name,
        grouping: cat.grouping || "UNASSIGNED",
      };
    });
  }, [categories]);

  // Filter specializations list according to group selection
  const filteredSpecializationOptions = useMemo(() => {
    if (selectedGroup === "ALL") {
      return specializationOptions;
    }
    return specializationOptions.filter((opt) => opt.grouping === selectedGroup);
  }, [specializationOptions, selectedGroup]);

  if (!isOpen) return null;

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/judges/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      return data.exists;
    } catch {
      return false;
    }
  };

  const validateEmailRealTime = async (email: string) => {
    if (!email.trim()) {
      setEmailError("");
      return;
    }

    setEmailChecking(true);
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists && !editingJudge) {
        setEmailError("A user with this email already exists");
      } else if (emailExists && editingJudge && editingJudge.email !== email) {
        setEmailError("A user with this email already exists");
      } else {
        setEmailError("");
      }
    } catch {
      setEmailError("");
    } finally {
      setEmailChecking(false);
    }
  };

  const handleNext = async () => {
    let fieldsToValidate: Array<keyof z.input<typeof judgeSchema>> = [];
    if (currentStep === 1) {
      fieldsToValidate = ["name", "email"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["tier", "yearsOfExperience", "specializations"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["bio", "credentials"];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        setErrorMsg("Please fix validation errors before continuing.");
        return;
      }
    }

    if (currentStep === 1) {
      if (emailError) {
        setErrorMsg(emailError);
        return;
      }
    }

    setErrorMsg("");
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setErrorMsg("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = hookHandleSubmit(async (data) => {
    if (emailError) {
      setErrorMsg(emailError);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const payload: JudgePayload = {
      name: data.name,
      email: data.email,
      tier: data.tier,
      specializations: data.specializations,
      bio: data.bio,
      credentials: data.credentials,
      stateOfResidence: data.stateOfResidence,
      states: data.states,
      languages: data.languages,
      yearsOfExperience: data.yearsOfExperience ?? null,
      isVerified: data.isVerified ?? false,
      isAvailable: data.isAvailable ?? true,
    };

    if (editingJudge) {
      payload.id = editingJudge.id;
    }

    try {
      const method = editingJudge ? "PATCH" : "POST";
      const res = await fetch("/api/admin/judges", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to save judge details");
      }

      onClose();
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-2xl max-w-2xl w-full my-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Header with Progress Bar */}
        <div className="sticky top-0 z-20 bg-charcoal-light border-b border-terracotta/10 flex-shrink-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-cream">
              {editingJudge ? "Edit Judge Profile" : "Add New Judge"}
            </h3>
            <button
              onClick={onClose}
              className="text-cream/50 hover:text-cream transition-colors focus:outline-none p-1 rounded hover:bg-cream/5"
              title="Close Dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Tracker */}
          <div>
            <div className="w-full h-2.5 bg-charcoal relative overflow-hidden flex items-center justify-end pr-3">
              <div
                className="h-full bg-gradient-to-r from-terracotta to-gold transition-all duration-300 absolute left-0 top-0"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
              <span className="text-[10px] font-bold text-cream/70 relative z-10">
                Step {currentStep} of 4
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto relative flex flex-col">
          <div className="p-6 space-y-4 flex-1">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4 font-sans">
            
            {/* Step 1: Account Credentials */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-gold uppercase tracking-wider border-b border-terracotta/10 pb-2">
                  Step 1: Account Credentials
                </h4>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-cream block mb-1">Full Name *</label>
                  <input
                    type="text"
                    {...register("name")}
                    className="w-full h-10 text-base bg-charcoal border border-terracotta/20 rounded-lg px-3 text-cream placeholder-cream/35 focus:outline-none focus:border-gold transition-all duration-200"
                    placeholder="e.g. Pandit Debojyoti Bose"
                  />
                  {errors.name && <FormError error={errors.name.message} />}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-cream block mb-1">Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      {...register("email", {
                        onChange: (e) => validateEmailRealTime(e.target.value)
                      })}
                      className={`w-full h-10 text-base bg-charcoal border rounded-lg px-3 text-cream placeholder-cream/35 focus:outline-none transition-all duration-200 ${
                        emailError || errors.email ? "border-red-500/50 focus:border-red-500" : "border-terracotta/20 focus:border-gold"
                      }`}
                      placeholder="e.g. debojyoti@pratibha.org"
                      autoComplete="email"
                    />
                    {emailChecking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-400 mt-1">{emailError}</p>
                  )}
                  {errors.email && <FormError error={errors.email.message} />}
                </div>
              </div>
            )}

            {/* Step 2: Experience & Specializations */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-gold uppercase tracking-wider border-b border-terracotta/10 pb-2">
                  Step 2: Experience & Specializations
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-cream block mb-1">Seniority Tier *</label>
                    <select
                      {...register("tier")}
                      className="w-full h-10 text-base bg-charcoal border border-terracotta/20 rounded-lg px-3 text-cream focus:outline-none focus:border-gold transition-all duration-200 cursor-pointer"
                    >
                      <option value="LOCAL">LOCAL</option>
                      <option value="REGIONAL">REGIONAL</option>
                      <option value="NATIONAL">NATIONAL</option>
                      <option value="EXPERT">EXPERT</option>
                    </select>
                    {errors.tier && <FormError error={errors.tier.message} />}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-cream block mb-1">Years of Experience</label>
                    <input
                      type="number"
                      {...register("yearsOfExperience", {
                        setValueAs: (v) => (v === "" ? null : Number(v)),
                      })}
                      className="w-full h-10 text-base bg-charcoal border border-terracotta/20 rounded-lg px-3 text-cream placeholder-cream/35 focus:outline-none focus:border-gold transition-all duration-200"
                      placeholder="e.g. 15"
                    />
                    {errors.yearsOfExperience && <FormError error={errors.yearsOfExperience.message} />}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-cream block mb-1">Filter by Grouping</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full h-10 text-base bg-charcoal border border-terracotta/20 rounded-lg px-3 text-cream focus:outline-none focus:border-gold transition-all duration-200 cursor-pointer"
                  >
                    <option value="ALL">All Groupings</option>
                    {groupings.map((group) => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-cream block mb-1">Specializations</label>
                  <Controller
                    control={control}
                    name="specializations"
                    render={({ field }) => (
                      <ChipMultiSelect
                        options={filteredSpecializationOptions}
                        selectedValues={field.value || []}
                        onChange={field.onChange}
                        placeholder="Search and select specializations..."
                        allOptions={specializationOptions}
                      />
                    )}
                  />
                  {errors.specializations && <FormError error={errors.specializations.message} />}
                </div>
              </div>
            )}

            {/* Step 3: Professional Bio & Qualifications */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-gold uppercase tracking-wider border-b border-terracotta/10 pb-2">
                  Step 3: Biography & Credentials
                </h4>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-cream block mb-1">Short Biography</label>
                  <Controller
                    control={control}
                    name="bio"
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Short summary of the judge's achievements, training, and background..."
                      />
                    )}
                  />
                  {errors.bio && <FormError error={errors.bio.message} />}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-cream block mb-1">Credentials & Qualifications</label>
                  <Controller
                    control={control}
                    name="credentials"
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Academic degrees, notable rewards, performance experience, or previous panels..."
                      />
                    )}
                  />
                  {errors.credentials && <FormError error={errors.credentials.message} />}
                </div>
              </div>
            )}

            {/* Step 4: Geographic Scope & Settings */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-gold uppercase tracking-wider border-b border-terracotta/10 pb-2">
                  Step 4: Region & Account Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-cream block mb-1">State of Residence</label>
                    <Controller
                      control={control}
                      name="stateOfResidence"
                      render={({ field }) => (
                        <SearchableSelect
                          options={STATES_OPTIONS}
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Search and select state..."
                          searchPlaceholder="Search states..."
                        />
                      )}
                    />
                    {errors.stateOfResidence && <FormError error={errors.stateOfResidence.message} />}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-cream block mb-1">Languages</label>
                    <Controller
                      control={control}
                      name="languages"
                      render={({ field }) => (
                        <ChipMultiSelect
                          options={LANGUAGES_OPTIONS}
                          selectedValues={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select languages..."
                        />
                      )}
                    />
                    {errors.languages && <FormError error={errors.languages.message} />}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-cream block mb-1">Eligible/Active States</label>
                  <Controller
                    control={control}
                    name="states"
                    render={({ field }) => (
                      <ChipMultiSelect
                        options={ELIGIBLE_STATES_OPTIONS}
                        selectedValues={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select states or National..."
                      />
                    )}
                  />
                  {errors.states && <FormError error={errors.states.message} />}
                </div>

                {/* Toggles: Verified & Available */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-2">
                  <label className="flex items-center gap-2 text-sm text-cream/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register("isVerified")}
                      className="rounded border-terracotta/40 bg-charcoal text-gold focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>Is Verified Account</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm text-cream/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register("isAvailable")}
                      className="rounded border-terracotta/40 bg-charcoal text-gold focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>Available for Assignments</span>
                  </label>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-20 bg-charcoal-light border-t border-terracotta/10 p-6 flex justify-between items-center flex-shrink-0">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={handlePrev}
                variant="secondary"
                size="md"
                disabled={isSubmitting}
                className="flex items-center gap-1 font-bold"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="md"
              disabled={isSubmitting}
              className="w-24 font-bold"
            >
              Cancel
            </Button>
            
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                variant="primary"
                size="md"
                className="w-36 font-bold flex items-center justify-center gap-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loading variant="inline" text="Checking..." className="text-current" />
                ) : (
                  <>
                    Continue <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onSubmit}
                variant="primary"
                size="md"
                className="w-36 font-bold flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loading variant="inline" text="Saving..." className="text-current" />
                ) : (
                  "Save Judge"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

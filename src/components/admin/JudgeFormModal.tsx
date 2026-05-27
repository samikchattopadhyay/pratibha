"use client";

import React, { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { Judge } from "./ParticipantsTab";
import ChipMultiSelect from "./ChipMultiSelect";
import SearchableSelect from "./SearchableSelect";
import RichTextEditor from "@/components/RichTextEditor";

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

  const [formData, setFormData] = useState(() => {
    if (editingJudge) {
      return {
        name: editingJudge.name || "",
        email: editingJudge.email || "",
        tier: editingJudge.tier || "LOCAL",
        specializations: editingJudge.specializations || [],
        bio: editingJudge.bio || "",
        credentials: editingJudge.credentials || "",
        stateOfResidence: editingJudge.stateOfResidence || "",
        states: editingJudge.states || [],
        languages: editingJudge.languages || [],
        yearsOfExperience: editingJudge.yearsOfExperience ? editingJudge.yearsOfExperience.toString() : "",
        isVerified: editingJudge.isVerified || false,
        isAvailable: editingJudge.isAvailable ?? true,
      };
    }
    return {
      name: "",
      email: "",
      tier: "LOCAL",
      specializations: [] as string[],
      bio: "",
      credentials: "",
      stateOfResidence: "",
      states: [] as string[],
      languages: [] as string[],
      yearsOfExperience: "",
      isVerified: false,
      isAvailable: true,
    };
  });

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

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.name.trim()) {
        setErrorMsg("Full Name is required");
        return false;
      }
      if (!formData.email.trim()) {
        setErrorMsg("Email Address is required");
        return false;
      }
    }
    setErrorMsg("");
    return true;
  };

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
    if (!validateStep(currentStep)) return;

    if (currentStep === 1) {
      if (emailError) {
        setErrorMsg(emailError);
        return;
      }
      setErrorMsg("");
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setErrorMsg("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    setErrorMsg("");

    const payload: JudgePayload = {
      name: formData.name,
      email: formData.email,
      tier: formData.tier,
      specializations: formData.specializations,
      bio: formData.bio,
      credentials: formData.credentials,
      stateOfResidence: formData.stateOfResidence,
      states: formData.states,
      languages: formData.languages,
      yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience, 10) : null,
      isVerified: formData.isVerified,
      isAvailable: formData.isAvailable,
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save judge details");
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
  };

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

            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            
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
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 text-base bg-charcoal border border-terracotta/20 rounded-lg px-3 text-cream placeholder-cream/35 focus:outline-none focus:border-gold transition-all duration-200"
                    placeholder="e.g. Pandit Debojyoti Bose"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-cream block mb-1">Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        validateEmailRealTime(e.target.value);
                      }}
                      className={`w-full h-10 text-base bg-charcoal border rounded-lg px-3 text-cream placeholder-cream/35 focus:outline-none transition-all duration-200 ${
                        emailError ? "border-red-500/50 focus:border-red-500" : "border-terracotta/20 focus:border-gold"
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
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                      className="w-full h-10 text-base bg-charcoal border border-terracotta/20 rounded-lg px-3 text-cream focus:outline-none focus:border-gold transition-all duration-200 cursor-pointer"
                    >
                      <option value="LOCAL">LOCAL</option>
                      <option value="REGIONAL">REGIONAL</option>
                      <option value="NATIONAL">NATIONAL</option>
                      <option value="EXPERT">EXPERT</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-cream block mb-1">Years of Experience</label>
                    <input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                      className="w-full h-10 text-base bg-charcoal border border-terracotta/20 rounded-lg px-3 text-cream placeholder-cream/35 focus:outline-none focus:border-gold transition-all duration-200"
                      placeholder="e.g. 15"
                    />
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
                  <ChipMultiSelect
                    options={filteredSpecializationOptions}
                    selectedValues={formData.specializations}
                    onChange={(values) => setFormData((prev) => ({ ...prev, specializations: values }))}
                    placeholder="Search and select specializations..."
                    allOptions={specializationOptions}
                  />
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
                  <RichTextEditor
                    value={formData.bio}
                    onChange={(value) => setFormData((prev) => ({ ...prev, bio: value }))}
                    placeholder="Short summary of the judge's achievements, training, and background..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-cream block mb-1">Credentials & Qualifications</label>
                  <RichTextEditor
                    value={formData.credentials}
                    onChange={(value) => setFormData((prev) => ({ ...prev, credentials: value }))}
                    placeholder="Academic degrees, notable rewards, performance experience, or previous panels..."
                  />
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
                    <SearchableSelect
                      options={STATES_OPTIONS}
                      value={formData.stateOfResidence}
                      onChange={(value) => setFormData({ ...formData, stateOfResidence: value })}
                      placeholder="Search and select state..."
                      searchPlaceholder="Search states..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-cream block mb-1">Languages</label>
                    <ChipMultiSelect
                      options={LANGUAGES_OPTIONS}
                      selectedValues={formData.languages}
                      onChange={(values) => setFormData((prev) => ({ ...prev, languages: values }))}
                      placeholder="Select languages..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-cream block mb-1">Eligible/Active States</label>
                  <ChipMultiSelect
                    options={ELIGIBLE_STATES_OPTIONS}
                    selectedValues={formData.states}
                    onChange={(values) => setFormData((prev) => ({ ...prev, states: values }))}
                    placeholder="Select states or National..."
                  />
                </div>

                {/* Toggles: Verified & Available */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-2">
                  <label className="flex items-center gap-2 text-sm text-cream/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                      className="rounded border-terracotta/40 bg-charcoal text-gold focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>Is Verified Account</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm text-cream/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
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
                onClick={handleSubmit}
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

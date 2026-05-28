"use client";

import React, { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import ChipMultiSelect from "@/components/admin/ChipMultiSelect";
import SearchableSelect from "@/components/admin/SearchableSelect";

interface AddStudentWizardProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: (studentId: string) => void;
  readonly categories: readonly { id: string; name: string; slug?: string | null; grouping?: string }[];
  readonly initialData?: StudentFormData;
  readonly studentId?: string;
}

export interface StudentFormData {
  name: string;
  dateOfBirth: string;
  gender: string;
  schoolClass: string;
  schoolName: string;
  city: string;
  state: string;
  profileImageUrl: string;
  heightCm: string;
  hairColor: string;
  eyeColor: string;
  bio: string;
  disciplineInterests: string[];
  languages: string[];
  trainingInstitutes: string[];
  specialSkills: string[];
}

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

const STATE_OPTIONS = INDIA_STATES.map((state) => ({
  value: state,
  label: state,
}));

const LANGUAGES_OPTIONS = [
  { value: "Bengali", label: "Bengali" },
  { value: "Hindi", label: "Hindi" },
  { value: "English", label: "English" },
  { value: "Sanskrit", label: "Sanskrit" },
  { value: "Odia", label: "Odia" },
  { value: "Tamil", label: "Tamil" },
];

const HAIR_COLORS = ["Black", "Brown", "Golden", "Grey", "Other"];
const EYE_COLORS = ["Brown", "Black", "Blue", "Green", "Other"];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function AddStudentWizard({
  isOpen,
  onClose,
  onSuccess,
  categories,
  initialData,
  studentId,
}: AddStudentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState<StudentFormData>(() => {
    if (initialData) return initialData;
    return {
      name: "",
      dateOfBirth: "",
      gender: "",
      schoolClass: "",
      schoolName: "",
      city: "",
      state: "",
      profileImageUrl: "",
      heightCm: "",
      hairColor: "",
      eyeColor: "",
      bio: "",
      disciplineInterests: [],
      languages: [],
      trainingInstitutes: [],
      specialSkills: [],
    };
  });

  // Tag inputs state
  const [newInstitute, setNewInstitute] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const categoryOptions = useMemo(() => {
    return categories.map((cat) => {
      const val = cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-");
      return {
        value: val,
        label: cat.name,
      };
    });
  }, [categories]);

  // Age calculation helper
  const ageDisplay = useMemo(() => {
    if (!formData.dateOfBirth) return "";
    const birthDate = new Date(formData.dateOfBirth);
    if (isNaN(birthDate.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? `(${age} years old)` : "";
  }, [formData.dateOfBirth]);

  if (!isOpen) return null;

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.name.trim()) {
        setErrorMsg("Full Name is required");
        return false;
      }
      if (!formData.dateOfBirth) {
        setErrorMsg("Date of Birth is required");
        return false;
      }
      if (!formData.gender) {
        setErrorMsg("Gender is required");
        return false;
      }
    }
    setErrorMsg("");
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setErrorMsg("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleAddInstitute = () => {
    if (newInstitute.trim() && !formData.trainingInstitutes.includes(newInstitute.trim())) {
      setFormData((prev) => ({
        ...prev,
        trainingInstitutes: [...prev.trainingInstitutes, newInstitute.trim()],
      }));
      setNewInstitute("");
    }
  };

  const handleRemoveInstitute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      trainingInstitutes: prev.trainingInstitutes.filter((_, i) => i !== index),
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.specialSkills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        specialSkills: [...prev.specialSkills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specialSkills: prev.specialSkills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setErrorMsg("");

    const heightVal = formData.heightCm ? parseInt(formData.heightCm, 10) : null;

    const payload = {
      ...formData,
      heightCm: isNaN(heightVal as any) ? null : heightVal,
    };

    try {
      const method = studentId ? "PATCH" : "POST";
      const url = studentId ? `/api/parent/students/${studentId}` : "/api/parent/students";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save student profile");
      }

      onSuccess(data.studentId || studentId);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl max-w-2xl w-full my-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Sticky Header with Gradient Progress Bar */}
        <div className="sticky top-0 z-20 bg-cream dark:bg-charcoal-light border-b border-terracotta/10 flex-shrink-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream">
              {studentId ? "Edit Student Profile" : "Add New Student"}
            </h3>
            <button
              onClick={onClose}
              className="text-charcoal/50 dark:text-cream/50 hover:text-charcoal dark:hover:text-cream transition-colors p-1 rounded hover:bg-charcoal/5 dark:hover:bg-cream/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Tracker */}
          <div className="w-full h-2.5 bg-cream-dark/20 dark:bg-charcoal relative overflow-hidden flex items-center justify-end pr-3">
            <div
              className="h-full bg-gradient-to-r from-terracotta to-gold transition-all duration-300 absolute left-0 top-0"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
            <span className="text-[10px] font-bold text-charcoal/70 dark:text-cream/70 relative z-10">
              Step {currentStep} of 4
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-charcoal dark:text-cream">
            
            {/* Step 1: Basic Identity */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-terracotta dark:text-gold uppercase tracking-wider border-b border-terracotta/10 pb-2">
                  Step 1: Basic Identity
                </h4>

                <div className="space-y-1">
                  <label className="text-sm font-medium block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                    placeholder="e.g. Bhaskar Chattopadhyay"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium block">Date of Birth * {ageDisplay}</label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth ? formData.dateOfBirth.split("T")[0] : ""}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium block">Gender *</label>
                    <select
                      value={formData.gender}
                      required
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta cursor-pointer"
                    >
                      <option value="">Select gender...</option>
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium block">School Class / Grade</label>
                    <input
                      type="text"
                      value={formData.schoolClass}
                      onChange={(e) => setFormData({ ...formData, schoolClass: e.target.value })}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                      placeholder="e.g. Class 7"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium block">School Name</label>
                    <input
                      type="text"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                      placeholder="e.g. St. Xavier's School"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium block">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                      placeholder="e.g. Kolkata"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium block">State</label>
                    <SearchableSelect
                      options={STATE_OPTIONS}
                      value={formData.state}
                      onChange={(val) => setFormData({ ...formData, state: val })}
                      placeholder="Select state..."
                      searchPlaceholder="Search Indian states..."
                      light={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Appearance & Bio */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-terracotta dark:text-gold uppercase tracking-wider border-b border-terracotta/10 pb-2">
                  Step 2: Appearance & Photo
                </h4>

                <div className="space-y-1">
                  <label className="text-sm font-medium block">Profile Photo URL</label>
                  <input
                    type="url"
                    value={formData.profileImageUrl}
                    onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                    className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium block">Height (in cm)</label>
                    <input
                      type="number"
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                      placeholder="e.g. 142"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium block">Hair Color</label>
                    <select
                      value={formData.hairColor}
                      onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta cursor-pointer"
                    >
                      <option value="">Select color...</option>
                      {HAIR_COLORS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium block">Eye Color</label>
                    <select
                      value={formData.eyeColor}
                      onChange={(e) => setFormData({ ...formData, eyeColor: e.target.value })}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta cursor-pointer"
                    >
                      <option value="">Select color...</option>
                      {EYE_COLORS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium block">About Me / Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    maxLength={300}
                    className="w-full bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 py-2 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                    placeholder="Describe your child's interests, hobbies, or passions..."
                  />
                  <p className="text-[10px] text-charcoal/50 dark:text-cream/50 text-right">
                    {formData.bio.length}/300 characters
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Training & Skills */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-terracotta dark:text-gold uppercase tracking-wider border-b border-terracotta/10 pb-2">
                  Step 3: Training & Skills
                </h4>

                <div className="space-y-1">
                  <label className="text-sm font-medium block">Discipline Interests</label>
                  <ChipMultiSelect
                    options={categoryOptions}
                    selectedValues={formData.disciplineInterests}
                    onChange={(vals) => setFormData((prev) => ({ ...prev, disciplineInterests: vals }))}
                    placeholder="Select discipline interests..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium block">Languages spoken</label>
                  <ChipMultiSelect
                    options={LANGUAGES_OPTIONS}
                    selectedValues={formData.languages}
                    onChange={(vals) => setFormData((prev) => ({ ...prev, languages: vals }))}
                    placeholder="Select languages..."
                  />
                </div>

                {/* Training Institutes - tag style */}
                <div className="space-y-1">
                  <label className="text-sm font-medium block">Training Academies / Institutes</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newInstitute}
                      onChange={(e) => setNewInstitute(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInstitute())}
                      className="flex-1 h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                      placeholder="e.g. Dover Lane Music Academy"
                    />
                    <Button type="button" onClick={handleAddInstitute} variant="secondary" size="md">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.trainingInstitutes.map((inst, idx) => (
                      <span key={idx} className="h-7 inline-flex items-center gap-1.5 bg-terracotta/10 text-terracotta dark:text-gold border border-terracotta/20 rounded-full pl-3 pr-2 text-xs font-semibold">
                        {inst}
                        <button type="button" onClick={() => handleRemoveInstitute(idx)} className="hover:bg-terracotta/20 rounded-full p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Special Skills - tag style */}
                <div className="space-y-1">
                  <label className="text-sm font-medium block">Special Skills / Talent Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                      placeholder="e.g. Classical Vocals, Tabla, Bharatnatyam"
                    />
                    <Button type="button" onClick={handleAddSkill} variant="secondary" size="md">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.specialSkills.map((sk, idx) => (
                      <span key={idx} className="h-7 inline-flex items-center gap-1.5 bg-gold/10 text-gold border border-gold/30 rounded-full pl-3 pr-2 text-xs font-semibold">
                        {sk}
                        <button type="button" onClick={() => handleRemoveSkill(idx)} className="hover:bg-gold/20 rounded-full p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review Summary */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-terracotta dark:text-gold uppercase tracking-wider border-b border-terracotta/10 pb-2">
                  Step 4: Review Details
                </h4>

                <div className="bg-cream-dark/5 dark:bg-charcoal rounded-xl border border-terracotta/10 p-4 space-y-4 text-sm">
                  <div>
                    <h5 className="font-bold text-terracotta dark:text-gold mb-1">👤 Basic Identity</h5>
                    <p><span className="font-semibold">Name:</span> {formData.name}</p>
                    <p><span className="font-semibold">DOB:</span> {formData.dateOfBirth} {ageDisplay}</p>
                    <p><span className="font-semibold">Gender:</span> {formData.gender}</p>
                    {(formData.schoolClass || formData.schoolName) && (
                      <p><span className="font-semibold">School:</span> {formData.schoolName || "N/A"} {formData.schoolClass ? `(${formData.schoolClass})` : ""}</p>
                    )}
                    {(formData.city || formData.state) && (
                      <p><span className="font-semibold">Location:</span> {formData.city}{formData.city && formData.state ? ", " : ""}{formData.state}</p>
                    )}
                  </div>

                  {(formData.profileImageUrl || formData.bio || formData.heightCm || formData.hairColor || formData.eyeColor) && (
                    <div className="border-t border-terracotta/10 pt-3">
                      <h5 className="font-bold text-terracotta dark:text-gold mb-1">🎭 Profile & Appearance</h5>
                      {formData.profileImageUrl && (
                        <p className="truncate"><span className="font-semibold">Photo URL:</span> {formData.profileImageUrl}</p>
                      )}
                      {(formData.heightCm || formData.hairColor || formData.eyeColor) && (
                        <p>
                          {formData.heightCm && <span className="mr-3"><span className="font-semibold">Height:</span> {formData.heightCm} cm</span>}
                          {formData.hairColor && <span className="mr-3"><span className="font-semibold">Hair:</span> {formData.hairColor}</span>}
                          {formData.eyeColor && <span><span className="font-semibold">Eyes:</span> {formData.eyeColor}</span>}
                        </p>
                      )}
                      {formData.bio && (
                        <p className="italic mt-1 text-charcoal/80 dark:text-cream/80">"{formData.bio}"</p>
                      )}
                    </div>
                  )}

                  {(formData.disciplineInterests.length > 0 || formData.languages.length > 0 || formData.trainingInstitutes.length > 0 || formData.specialSkills.length > 0) && (
                    <div className="border-t border-terracotta/10 pt-3">
                      <h5 className="font-bold text-terracotta dark:text-gold mb-1">🎵 Skills & Training</h5>
                      {formData.disciplineInterests.length > 0 && (
                        <p><span className="font-semibold">Disciplines:</span> {formData.disciplineInterests.join(", ")}</p>
                      )}
                      {formData.languages.length > 0 && (
                        <p><span className="font-semibold">Languages:</span> {formData.languages.join(", ")}</p>
                      )}
                      {formData.trainingInstitutes.length > 0 && (
                        <p><span className="font-semibold">Institutes:</span> {formData.trainingInstitutes.join(", ")}</p>
                      )}
                      {formData.specialSkills.length > 0 && (
                        <p><span className="font-semibold">Special Skills:</span> {formData.specialSkills.join(", ")}</p>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-charcoal/60 dark:text-cream/60">
                  Please review the details above. If everything is correct, click the "Save Student Profile" button below to continue.
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 bg-cream dark:bg-charcoal-light border-t border-terracotta/10 p-6 flex justify-between items-center flex-shrink-0">
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
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                variant="primary"
                size="md"
                className="w-48 font-bold flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loading variant="inline" text="Saving..." className="text-current" />
                ) : (
                  "Save Student Profile"
                )}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

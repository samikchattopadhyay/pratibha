"use client";

import React, { useState, useMemo, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Plus, Upload } from "lucide-react";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import SearchableSelect from "@/components/admin/SearchableSelect";
import ChipMultiSelect from "@/components/admin/ChipMultiSelect";
import RichTextEditor from "@/components/RichTextEditor";

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

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function AddStudentWizard({
  isOpen,
  onClose,
  onSuccess,
  categories,
  initialData,
  studentId,
}: AddStudentWizardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
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
    setCurrentStep((prev) => Math.min(prev + 1, 5));
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];

    if (file.size > maxSize) {
      setErrorMsg("File size exceeds 5MB limit");
      return;
    }

    if (!allowedMimes.includes(file.type)) {
      setErrorMsg("Invalid file type. Only JPEG, PNG, and WebP are allowed");
      return;
    }

    setSelectedFile(file);
    setErrorMsg("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      setErrorMsg("Please select a file first");
      return;
    }

    setIsUploadingPhoto(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/parent/students/upload-profile-photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      // Update form with uploaded URL
      setFormData((prev) => ({
        ...prev,
        profileImageUrl: data.url,
      }));

      // Clear upload state
      setSelectedFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setErrorMsg("");

    const payload = {
      ...formData,
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
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
            <span className="text-[10px] font-bold text-charcoal/70 dark:text-cream/70 relative z-10">
              Step {currentStep} of 5
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
                    placeholder="Enter full name"
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
                      placeholder="Enter class or grade"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium block">School Name</label>
                    <input
                      type="text"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                      placeholder="Enter school name"
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
                      placeholder="Enter city"
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

                <div className="space-y-2">
                  <label className="text-sm font-medium block">Profile Photo</label>

                  {/* File Upload Area */}
                  {!formData.profileImageUrl ? (
                    <div className="border-2 border-dashed border-terracotta/30 dark:border-gold/30 rounded-lg p-6 text-center hover:border-terracotta/50 dark:hover:border-gold/50 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex flex-col items-center gap-2 text-charcoal dark:text-cream hover:text-terracotta dark:hover:text-gold transition-colors"
                      >
                        <Upload className="w-6 h-6" />
                        <span className="text-sm font-medium">Click to upload or drag & drop</span>
                        <span className="text-xs text-charcoal/50 dark:text-cream/50">PNG, JPEG, or WebP (max 5MB)</span>
                      </button>

                      {/* Preview after selection */}
                      {photoPreview && (
                        <div className="mt-4 flex flex-col items-center gap-2">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="max-h-32 max-w-32 rounded-lg border border-terracotta/20"
                          />
                          <p className="text-xs text-charcoal/70 dark:text-cream/70">{selectedFile?.name}</p>
                          <Button
                            type="button"
                            onClick={handleUploadPhoto}
                            variant="primary"
                            size="sm"
                            disabled={isUploadingPhoto}
                            className="flex items-center gap-1"
                          >
                            {isUploadingPhoto ? (
                              <Loading variant="inline" text="Uploading..." className="text-current" />
                            ) : (
                              <>
                                <Upload className="w-3 h-3" /> Upload Photo
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-terracotta/5 dark:bg-gold/5 border border-terracotta/20 dark:border-gold/20 rounded-lg p-4 flex items-center gap-4">
                      <img
                        src={formData.profileImageUrl}
                        alt="Profile"
                        className="w-16 h-16 rounded-lg object-cover border border-terracotta/20"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-charcoal dark:text-cream mb-1">Photo Uploaded</p>
                        <p className="text-xs text-charcoal/60 dark:text-cream/60 truncate">{formData.profileImageUrl}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, profileImageUrl: "" }));
                          setSelectedFile(null);
                          setPhotoPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-terracotta dark:text-gold hover:text-terracotta-light dark:hover:text-gold-light transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>


                <div className="space-y-1">
                  <label className="text-sm font-medium block">About Me / Bio</label>
                  <RichTextEditor
                    value={formData.bio}
                    onChange={(val) => setFormData({ ...formData, bio: val })}
                    placeholder="Write a brief bio about yourself..."
                    light={true}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Training & Skills */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-terracotta dark:text-gold uppercase tracking-wider border-b border-terracotta/10 pb-2">
                  Step 3: Training & Skills
                </h4>

                {/* Specialization Group - display only */}
                {formData.disciplineInterests.length > 0 && (
                  <div className="bg-terracotta/10 dark:bg-gold/10 border border-terracotta/20 dark:border-gold/20 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-semibold text-terracotta dark:text-gold uppercase tracking-wider">Specialization Group</p>
                    <p className="text-sm text-charcoal dark:text-cream font-medium">
                      {categories.find(c => c.id === formData.disciplineInterests[0])?.grouping || "Not specified"}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium block">Languages Spoken</label>
                  <ChipMultiSelect
                    options={LANGUAGES_OPTIONS}
                    selectedValues={formData.languages}
                    onChange={(vals) => setFormData((prev) => ({ ...prev, languages: vals }))}
                    placeholder="Select languages..."
                    light={true}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium block">Discipline Interests (Category Specialization) *</label>
                  <SearchableSelect
                    options={categoryOptions}
                    value={formData.disciplineInterests[0] || ""}
                    onChange={(val) => setFormData((prev) => ({ ...prev, disciplineInterests: val ? [val] : [] }))}
                    placeholder="Select discipline interests..."
                    searchPlaceholder="Search disciplines..."
                    light={true}
                  />
                  <p className="text-xs text-charcoal/60 dark:text-cream/60">
                    {formData.disciplineInterests.length === 0 ? "Select at least one discipline" : "Selected"}
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Specialization & Training */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-terracotta dark:text-gold uppercase tracking-wider border-b border-terracotta/10 pb-2">
                  Step 4: Specialization & Training
                </h4>

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
                      placeholder="Enter institute name"
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
                      placeholder="Enter skill or talent"
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

            {/* Step 5: Review Details */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-terracotta dark:text-gold uppercase tracking-wider border-b border-terracotta/10 pb-2">
                  Step 5: Review Details
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

                  {(formData.profileImageUrl || formData.bio) && (
                    <div className="border-t border-terracotta/10 pt-3">
                      <h5 className="font-bold text-terracotta dark:text-gold mb-1">🎭 Profile & Bio</h5>
                      {formData.profileImageUrl && (
                        <p className="truncate"><span className="font-semibold">Photo URL:</span> {formData.profileImageUrl}</p>
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
            
            {currentStep < 5 ? (
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

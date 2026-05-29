"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Plus, Upload, Music, Globe, Layers, BookOpen, Sparkles } from "lucide-react";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import SearchableSelect from "@/components/admin/SearchableSelect";
import ChipMultiSelect from "@/components/admin/ChipMultiSelect";
import RichTextEditor from "@/components/RichTextEditor";
import SlugInput from "./SlugInput";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentFormSchema, StudentFormData } from "@/schemas/entries";
import FormError from "@/components/forms/FormError";
import { z } from "zod";

interface AddStudentWizardProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: (studentId: string) => void;
  readonly categories: readonly { id: string; name: string; slug?: string | null; grouping?: string }[];
  readonly initialData?: StudentFormData;
  readonly studentId?: string;
}

export type { StudentFormData };

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

const CATEGORY_GROUPS_OPTIONS = [
  { value: "MUSIC_VOCAL", label: "Music (Vocal)" },
  { value: "MUSIC_INSTRUMENTAL", label: "Music (Instrumental)" },
  { value: "PERFORMING_ARTS", label: "Performing Arts" },
  { value: "VISUAL_ARTS", label: "Visual Arts" },
  { value: "LITERARY_ARTS", label: "Literary Arts" },
  { value: "SPOKEN_WORD", label: "Spoken Word" },
];

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

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

  const { register, handleSubmit, control, trigger, setValue, watch, reset, formState: { errors } } = useForm<z.input<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    mode: "onBlur",
    defaultValues: initialData || {
      name: "",
      dateOfBirth: "",
      gender: "",
      slug: "",
      schoolClass: "",
      schoolName: "",
      city: "",
      state: "",
      profileImageUrl: "",
      bio: "",
      disciplineInterests: [],
      languages: [],
      categoryGrouping: [],
      trainingInstitutes: [],
      specialSkills: [],
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (isOpen) {
      reset(initialData || {
        name: "",
        dateOfBirth: "",
        gender: "",
        slug: "",
        schoolClass: "",
        schoolName: "",
        city: "",
        state: "",
        profileImageUrl: "",
        bio: "",
        disciplineInterests: [],
        languages: [],
        categoryGrouping: [],
        trainingInstitutes: [],
        specialSkills: [],
      });
      setCurrentStep(1);
      setErrorMsg("");
      setSelectedFile(null);
      setPhotoPreview(null);
    }
  }, [isOpen, initialData, reset]);

  // Slug state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [slugAvailable, setSlugAvailable] = useState(false);

  // Tag inputs state
  const [newInstitute, setNewInstitute] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [categories]);

  const filteredCategoryOptions = useMemo(() => {
    const groupings = watchedValues.categoryGrouping || [];
    if (groupings.length === 0) {
      return categoryOptions;
    }
    return categoryOptions.filter((cat) => {
      const category = categories.find((c) => c.id === cat.value);
      return category && groupings.includes(category.grouping || "");
    });
  }, [categoryOptions, watchedValues.categoryGrouping, categories]);

  // Age calculation helper
  const ageDisplay = useMemo(() => {
    const dob = watchedValues.dateOfBirth;
    if (!dob) return "";
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? `(${age} years old)` : "";
  }, [watchedValues.dateOfBirth]);

  if (!isOpen) return null;

  const handleNext = async () => {
    let fieldsToValidate: Array<keyof z.input<typeof studentFormSchema>> = [];
    if (currentStep === 1) {
      fieldsToValidate = ["name", "dateOfBirth", "gender", "slug", "schoolClass", "schoolName", "city", "state"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["profileImageUrl", "bio"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["languages", "categoryGrouping", "disciplineInterests"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["trainingInstitutes", "specialSkills"];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        setErrorMsg("Please fix validation errors before continuing.");
        return;
      }
    }
    setErrorMsg("");
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setErrorMsg("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleAddInstitute = () => {
    if (newInstitute.trim()) {
      const current = watchedValues.trainingInstitutes || [];
      if (!current.includes(newInstitute.trim())) {
        setValue("trainingInstitutes", [...current, newInstitute.trim()], { shouldValidate: true });
        setNewInstitute("");
      }
    }
  };

  const handleRemoveInstitute = (index: number) => {
    const current = watchedValues.trainingInstitutes || [];
    setValue("trainingInstitutes", current.filter((_: string, i: number) => i !== index), { shouldValidate: true });
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const current = watchedValues.specialSkills || [];
      if (!current.includes(newSkill.trim())) {
        setValue("specialSkills", [...current, newSkill.trim()], { shouldValidate: true });
        setNewSkill("");
      }
    }
  };

  const handleRemoveSkill = (index: number) => {
    const current = watchedValues.specialSkills || [];
    setValue("specialSkills", current.filter((_: string, i: number) => i !== index), { shouldValidate: true });
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
      const formPayload = new FormData();
      formPayload.append("file", selectedFile);

      const res = await fetch("/api/account/students/upload-profile-photo", {
        method: "POST",
        body: formPayload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      // Update form with uploaded URL
      setValue("profileImageUrl", data.url, { shouldValidate: true });

      // Clear upload state
      setSelectedFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : "Failed to upload photo";
      setErrorMsg(errorText);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const method = studentId ? "PATCH" : "POST";
      const url = studentId ? `/api/account/students/${studentId}` : "/api/account/students";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to save student profile");
      }

      onSuccess(resData.studentId || studentId);
      onClose();
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : "An error occurred";
      setErrorMsg(errorText);
    } finally {
      setIsSubmitting(false);
    }
  });

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

          <form onSubmit={onSubmit} className="space-y-4 font-sans text-charcoal dark:text-cream">
            
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
                    {...register("name")}
                    className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                    placeholder="Enter full name"
                  />
                  {errors.name && <FormError error={errors.name.message} />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium block">Date of Birth * {ageDisplay}</label>
                    <input
                      type="date"
                      {...register("dateOfBirth")}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                    />
                    {errors.dateOfBirth && <FormError error={errors.dateOfBirth.message} />}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium block">Gender *</label>
                    <select
                      {...register("gender")}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta cursor-pointer"
                    >
                      <option value="">Select gender...</option>
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    {errors.gender && <FormError error={errors.gender.message} />}
                  </div>
                </div>

                <Controller
                  control={control}
                  name="slug"
                  render={({ field }) => (
                    <SlugInput
                      value={field.value || ""}
                      onChange={field.onChange}
                      onAvailabilityChange={setSlugAvailable}
                      studentId={studentId}
                      label="Public Profile URL Slug (Optional)"
                    />
                  )}
                />
                {errors.slug && <FormError error={errors.slug.message} />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium block">School Class / Grade</label>
                    <input
                      type="text"
                      {...register("schoolClass")}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                      placeholder="Enter class or grade"
                    />
                    {errors.schoolClass && <FormError error={errors.schoolClass.message} />}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium block">School Name</label>
                    <input
                      type="text"
                      {...register("schoolName")}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                      placeholder="Enter school name"
                    />
                    {errors.schoolName && <FormError error={errors.schoolName.message} />}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium block">City</label>
                    <input
                      type="text"
                      {...register("city")}
                      className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                      placeholder="Enter city"
                    />
                    {errors.city && <FormError error={errors.city.message} />}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium block">State</label>
                    <Controller
                      control={control}
                      name="state"
                      render={({ field }) => (
                        <SearchableSelect
                          options={STATE_OPTIONS}
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Select state..."
                          searchPlaceholder="Search Indian states..."
                          light={true}
                        />
                      )}
                    />
                    {errors.state && <FormError error={errors.state.message} />}
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
                  {!watchedValues.profileImageUrl ? (
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
                        src={watchedValues.profileImageUrl}
                        alt="Profile"
                        className="w-16 h-16 rounded-lg object-cover border border-terracotta/20"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-charcoal dark:text-cream mb-1">Photo Uploaded</p>
                        <p className="text-xs text-charcoal/60 dark:text-cream/60 truncate">{watchedValues.profileImageUrl}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setValue("profileImageUrl", "");
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
                  {errors.profileImageUrl && <FormError error={errors.profileImageUrl.message} />}
                </div>


                <div className="space-y-1">
                  <label className="text-sm font-medium block">About Me / Bio</label>
                  <Controller
                    control={control}
                    name="bio"
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Write a brief bio about yourself..."
                        light={true}
                      />
                    )}
                  />
                  {errors.bio && <FormError error={errors.bio.message} />}
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
                {(watchedValues.disciplineInterests || []).length > 0 && (
                  <div className="bg-terracotta/10 dark:bg-gold/10 border border-terracotta/20 dark:border-gold/20 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-semibold text-terracotta dark:text-gold uppercase tracking-wider">Specialization Group</p>
                    <p className="text-sm text-charcoal dark:text-cream font-medium">
                      {categories.find(c => c.id === (watchedValues.disciplineInterests || [])[0])?.grouping || "Not specified"}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium block">Languages Spoken</label>
                  <Controller
                    control={control}
                    name="languages"
                    render={({ field }) => (
                      <ChipMultiSelect
                        options={LANGUAGES_OPTIONS}
                        selectedValues={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select languages..."
                        light={true}
                      />
                    )}
                  />
                  {errors.languages && <FormError error={errors.languages.message} />}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium block">Category Group</label>
                  <Controller
                    control={control}
                    name="categoryGrouping"
                    render={({ field }) => (
                      <ChipMultiSelect
                        options={CATEGORY_GROUPS_OPTIONS}
                        selectedValues={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select category groups..."
                        light={true}
                      />
                    )}
                  />
                  {errors.categoryGrouping && <FormError error={errors.categoryGrouping.message} />}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium block">Category Specialization *</label>
                  <Controller
                    control={control}
                    name="disciplineInterests"
                    render={({ field }) => (
                      <ChipMultiSelect
                        options={filteredCategoryOptions}
                        selectedValues={field.value || []}
                        onChange={field.onChange}
                        placeholder={(watchedValues.categoryGrouping || []).length === 0 ? "Select a Category Group first..." : "Select disciplines..."}
                        light={true}
                      />
                    )}
                  />
                  {errors.disciplineInterests && <FormError error={errors.disciplineInterests.message} />}
                  <p className="text-xs text-charcoal/60 dark:text-cream/60">
                    {(watchedValues.categoryGrouping || []).length === 0
                      ? "Select a Category Group first"
                      : (watchedValues.disciplineInterests || []).length === 0
                      ? "Select at least one discipline"
                      : `${(watchedValues.disciplineInterests || []).length} discipline(s) selected`}
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
                    {(watchedValues.trainingInstitutes || []).map((inst: string, idx: number) => (
                      <span key={idx} className="h-7 inline-flex items-center gap-1.5 bg-terracotta/10 text-terracotta dark:text-gold border border-terracotta/20 rounded-full pl-3 pr-2 text-xs font-semibold">
                        {inst}
                        <button type="button" onClick={() => handleRemoveInstitute(idx)} className="hover:bg-terracotta/20 rounded-full p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {errors.trainingInstitutes && <FormError error={errors.trainingInstitutes.message} />}
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
                    {(watchedValues.specialSkills || []).map((sk: string, idx: number) => (
                      <span key={idx} className="h-7 inline-flex items-center gap-1.5 bg-gold/10 text-gold border border-gold/30 rounded-full pl-3 pr-2 text-xs font-semibold">
                        {sk}
                        <button type="button" onClick={() => handleRemoveSkill(idx)} className="hover:bg-gold/20 rounded-full p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {errors.specialSkills && <FormError error={errors.specialSkills.message} />}
                </div>
              </div>
            )}

            {/* Step 5: Review Details */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-terracotta dark:text-gold uppercase tracking-wider border-b border-terracotta/10 pb-2">
                  Step 5: Review Details
                </h4>

                {/* Header Card: Avatar + Key Info */}
                <div className="bg-white dark:bg-charcoal rounded-xl border border-terracotta/10 dark:border-terracotta/20 p-4">
                  <div className="flex gap-4">
                    {/* Avatar Section */}
                    <div className="flex-shrink-0">
                      {watchedValues.profileImageUrl ? (
                        <img
                          src={watchedValues.profileImageUrl}
                          alt={watchedValues.name}
                          className="w-14 h-14 rounded-lg object-cover border border-terracotta/20"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-terracotta to-gold flex items-center justify-center text-white font-bold text-lg border border-terracotta/20">
                          {watchedValues.name ? getInitials(watchedValues.name) : ""}
                        </div>
                      )}
                    </div>

                    {/* Left Column: Name, Gender, Age */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="font-serif text-lg font-bold text-charcoal dark:text-cream truncate">
                          {watchedValues.name || "Student Name"}
                        </h5>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {watchedValues.gender && (
                          <span className="inline-flex items-center h-5 px-2 bg-charcoal/5 dark:bg-cream/5 text-charcoal dark:text-cream border border-charcoal/10 dark:border-cream/10 rounded-full text-xs font-semibold">
                            {watchedValues.gender}
                          </span>
                        )}
                        {ageDisplay && (
                          <span className="inline-flex items-center h-5 px-2 bg-terracotta/10 text-terracotta border border-terracotta/20 rounded-full text-xs font-semibold">
                            {ageDisplay.replace(/[()]/g, "")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Column: DOB, School, Location */}
                    <div className="flex-1 text-sm space-y-1">
                      {watchedValues.dateOfBirth && (
                        <div>
                          <p className="text-charcoal/60 dark:text-cream/60 text-xs font-semibold uppercase">DOB</p>
                          <p className="text-charcoal dark:text-cream font-medium">
                            {new Date(watchedValues.dateOfBirth).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                      {(watchedValues.schoolName || watchedValues.schoolClass) && (
                        <div>
                          <p className="text-charcoal/60 dark:text-cream/60 text-xs font-semibold uppercase">School</p>
                          <p className="text-charcoal dark:text-cream font-medium truncate">
                            {watchedValues.schoolName || "N/A"} {watchedValues.schoolClass && `(${watchedValues.schoolClass})`}
                          </p>
                        </div>
                      )}
                      {(watchedValues.city || watchedValues.state) && (
                        <div>
                          <p className="text-charcoal/60 dark:text-cream/60 text-xs font-semibold uppercase">Location</p>
                          <p className="text-charcoal dark:text-cream font-medium truncate">
                            {watchedValues.city && watchedValues.state ? `${watchedValues.city}, ${watchedValues.state}` : watchedValues.city || watchedValues.state}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                {(watchedValues.bio || true) && (
                  <div className="bg-white dark:bg-charcoal rounded-xl border border-terracotta/10 dark:border-terracotta/20 p-4">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-4 h-4 text-terracotta dark:text-gold flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-terracotta dark:text-gold uppercase tracking-wider mb-2">About Me</p>
                        {watchedValues.bio ? (
                          <p className="text-sm text-charcoal dark:text-cream leading-relaxed">
                            {stripHtml(watchedValues.bio).slice(0, 180)}
                            {stripHtml(watchedValues.bio).length > 180 && "..."}
                          </p>
                        ) : (
                          <p className="text-sm text-charcoal/50 dark:text-cream/50 italic">Not provided</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Disciplines Section */}
                {((watchedValues.disciplineInterests || []).length > 0 || true) && (
                  <div className="bg-white dark:bg-charcoal rounded-xl border border-terracotta/10 dark:border-terracotta/20 p-4">
                    <div className="flex items-start gap-3">
                      <Music className="w-4 h-4 text-terracotta dark:text-gold flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-terracotta dark:text-gold uppercase tracking-wider mb-2">Disciplines</p>
                        {(watchedValues.disciplineInterests || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {(watchedValues.disciplineInterests || []).map((disciplineId: string) => {
                              const categoryName =
                                categories.find((c) => c.id === disciplineId)?.name || disciplineId;
                              return (
                                <span
                                  key={disciplineId}
                                  className="inline-flex items-center h-6 px-3 bg-terracotta/10 text-terracotta dark:text-terracotta-light border border-terracotta/20 dark:border-terracotta/30 rounded-full text-xs font-semibold"
                                >
                                  {categoryName}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-charcoal/50 dark:text-cream/50 italic">None listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Languages Section */}
                {((watchedValues.languages || []).length > 0 || true) && (
                  <div className="bg-white dark:bg-charcoal rounded-xl border border-terracotta/10 dark:border-terracotta/20 p-4">
                    <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-charcoal/60 dark:text-cream/60 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-charcoal/70 dark:text-cream/70 uppercase tracking-wider mb-2">Languages</p>
                        {(watchedValues.languages || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {(watchedValues.languages || []).map((lang: string) => (
                              <span
                                key={lang}
                                className="inline-flex items-center h-6 px-3 bg-charcoal/5 dark:bg-cream/5 text-charcoal dark:text-cream border border-charcoal/10 dark:border-cream/10 rounded-full text-xs font-semibold"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-charcoal/50 dark:text-cream/50 italic">None listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Groups Section */}
                {((watchedValues.categoryGrouping || []).length > 0 || true) && (
                  <div className="bg-white dark:bg-charcoal rounded-xl border border-terracotta/10 dark:border-terracotta/20 p-4">
                    <div className="flex items-start gap-3">
                      <Layers className="w-4 h-4 text-gold dark:text-gold flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gold dark:text-gold uppercase tracking-wider mb-2">Category Groups</p>
                        {(watchedValues.categoryGrouping || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {(watchedValues.categoryGrouping || []).map((groupVal: string) => {
                              const groupLabel =
                                CATEGORY_GROUPS_OPTIONS.find((opt) => opt.value === groupVal)?.label || groupVal;
                              return (
                                <span
                                  key={groupVal}
                                  className="inline-flex items-center h-6 px-3 bg-gold/10 text-gold border border-gold/20 dark:border-gold/30 rounded-full text-xs font-semibold"
                                >
                                  {groupLabel}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-charcoal/50 dark:text-cream/50 italic">None listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Training Institutes Section */}
                {((watchedValues.trainingInstitutes || []).length > 0 || true) && (
                  <div className="bg-white dark:bg-charcoal rounded-xl border border-terracotta/10 dark:border-terracotta/20 p-4">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-4 h-4 text-charcoal/60 dark:text-cream/60 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-charcoal/70 dark:text-cream/70 uppercase tracking-wider mb-2">Training Institutes</p>
                        {(watchedValues.trainingInstitutes || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {(watchedValues.trainingInstitutes || []).map((inst: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center h-6 px-3 bg-charcoal/5 dark:bg-cream/5 text-charcoal dark:text-cream border border-charcoal/10 dark:border-cream/10 rounded-full text-xs font-semibold"
                              >
                                {inst}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-charcoal/50 dark:text-cream/50 italic">None listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Skills Section */}
                {((watchedValues.specialSkills || []).length > 0 || true) && (
                  <div className="bg-white dark:bg-charcoal rounded-xl border border-terracotta/10 dark:border-terracotta/20 p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-gold dark:text-gold flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gold dark:text-gold uppercase tracking-wider mb-2">Special Skills</p>
                        {(watchedValues.specialSkills || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {(watchedValues.specialSkills || []).map((sk: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center h-6 px-3 bg-gold/10 text-gold border border-gold/20 dark:border-gold/30 rounded-full text-xs font-semibold"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-charcoal/50 dark:text-cream/50 italic">None listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-charcoal/60 dark:text-cream/60">
                  Please review the details above. If everything is correct, click the &quot;Save Student Profile&quot; button below to continue.
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
                onClick={onSubmit}
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

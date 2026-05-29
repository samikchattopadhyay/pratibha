"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ChevronRight, Check } from "lucide-react";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import FormError from "@/components/forms/FormError";
import { profileCompletionSchema, type ProfileCompletionFormData } from "@/schemas/entries";

interface ParentProfile {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  preferredState?: string | null;
  country: string;
}

interface ProfileCompletionModalProps {
  isOpen: boolean;
  parent: ParentProfile;
  onClose: () => void;
  onSuccess: (updatedParent: ParentProfile) => void;
  isRequired?: boolean;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export default function ProfileCompletionModal({
  isOpen,
  parent,
  onClose,
  onSuccess,
  isRequired = false,
}: ProfileCompletionModalProps) {
  const [step, setStep] = useState(1);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProfileCompletionFormData>({
    resolver: zodResolver(profileCompletionSchema),
    mode: "onBlur",
    defaultValues: {
      city: parent.city || "",
      state: parent.state || "",
      profileImageUrl: parent.address || "",
      bio: parent.preferredState || "",
    },
  });

  const formData = watch();

  const canProceedStep1 = formData.profileImageUrl && formData.city;
  const canProceedStep2 = formData.state && formData.bio;

  const onSubmit = useCallback(
    async (data: ProfileCompletionFormData) => {
      setApiError(null);

      try {
        const response = await fetch("/api/account/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: data.profileImageUrl,
            city: data.city,
            state: data.state,
            postalCode: "", // TODO: add if needed
            preferredState: data.bio,
          }),
        });

        const resData = await response.json();

        if (!response.ok) {
          setApiError(resData.error || "Failed to update profile");
          return;
        }

        onSuccess(resData.parent);
        onClose();
      } catch (error) {
        setApiError("Failed to update profile. Please try again.");
        console.error("Profile update error:", error);
      }
    },
    [onSuccess, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-charcoal/50 dark:bg-charcoal/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-charcoal-light rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-terracotta/10 dark:border-terracotta/20">
        {/* Header */}
        <div className="sticky top-0 bg-cream dark:bg-charcoal-light border-b border-terracotta/10 dark:border-terracotta/20 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-cream">
              Complete Your Profile
            </h2>
            <p className="text-sm text-charcoal/60 dark:text-cream/60 mt-1">
              Step {step} of 2
            </p>
          </div>
          {!isRequired && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-terracotta/10 dark:hover:bg-terracotta/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-charcoal dark:text-cream" />
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-6">
          <div className="flex gap-2">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-terracotta dark:bg-gold" : "bg-charcoal/10 dark:bg-charcoal/30"}`} />
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-terracotta dark:bg-gold" : "bg-charcoal/10 dark:bg-charcoal/30"}`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {apiError && (
            <div className="bg-red-500/10 border border-red-300 dark:border-red-700 rounded-lg p-4 text-sm text-red-800 dark:text-red-200">
              {apiError}
            </div>
          )}

          {/* Step 1: Address & City */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="profileImageUrl" className="block text-sm font-bold text-charcoal dark:text-cream mb-2">
                  Street Address
                </label>
                <input
                  id="profileImageUrl"
                  type="text"
                  placeholder="e.g., 123 Main Street"
                  className={`w-full px-4 py-2.5 rounded-lg border font-sans text-sm bg-white dark:bg-charcoal transition-colors ${
                    errors.profileImageUrl
                      ? "border-red-500 dark:border-red-500"
                      : "border-charcoal/10 dark:border-charcoal/30 focus:border-terracotta dark:focus:border-gold"
                  } focus:outline-none`}
                  {...register("profileImageUrl")}
                />
                {errors.profileImageUrl && (
                  <FormError error={errors.profileImageUrl.message} />
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-bold text-charcoal dark:text-cream mb-2">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  placeholder="e.g., Bangalore"
                  className={`w-full px-4 py-2.5 rounded-lg border font-sans text-sm bg-white dark:bg-charcoal transition-colors ${
                    errors.city
                      ? "border-red-500 dark:border-red-500"
                      : "border-charcoal/10 dark:border-charcoal/30 focus:border-terracotta dark:focus:border-gold"
                  } focus:outline-none`}
                  {...register("city")}
                />
                {errors.city && (
                  <FormError error={errors.city.message} />
                )}
              </div>
            </div>
          )}

          {/* Step 2: State & Preferred State */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="state" className="block text-sm font-bold text-charcoal dark:text-cream mb-2">
                  State
                </label>
                <select
                  id="state"
                  className={`w-full px-4 py-2.5 rounded-lg border font-sans text-sm bg-white dark:bg-charcoal transition-colors ${
                    errors.state
                      ? "border-red-500 dark:border-red-500"
                      : "border-charcoal/10 dark:border-charcoal/30 focus:border-terracotta dark:focus:border-gold"
                  } focus:outline-none`}
                  {...register("state")}
                >
                  <option value="">Select a state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <FormError error={errors.state.message} />
                )}
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-bold text-charcoal dark:text-cream mb-2">
                  Preferred State for Competitions
                </label>
                <select
                  id="bio"
                  className={`w-full px-4 py-2.5 rounded-lg border font-sans text-sm bg-white dark:bg-charcoal transition-colors ${
                    errors.bio
                      ? "border-red-500 dark:border-red-500"
                      : "border-charcoal/10 dark:border-charcoal/30 focus:border-terracotta dark:focus:border-gold"
                  } focus:outline-none`}
                  {...register("bio")}
                >
                  <option value="">Select a state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.bio && (
                  <FormError error={errors.bio.message} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-terracotta/10 dark:border-terracotta/20 p-6 bg-cream dark:bg-charcoal-light flex gap-3 flex-col-reverse sm:flex-row">
          {!isRequired && step > 1 && (
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              size="md"
              className="flex-1"
            >
              Back
            </Button>
          )}

          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              variant="primary"
              size="md"
              className="flex-1 flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || !canProceedStep2}
              variant="primary"
              size="md"
              className="flex-1"
            >
              {isSubmitting ? (
                <Loading variant="inline" text="Saving..." />
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save & Complete
                </>
              )}
            </Button>
          )}

          {!isRequired && (
            <Button
              onClick={onClose}
              variant="outline"
              size="md"
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

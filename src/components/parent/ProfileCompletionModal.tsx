"use client";

import { useState, useCallback } from "react";
import { X, ChevronRight, Check } from "lucide-react";
import Button from "@/components/Button";
import Loading from "@/components/Loading";

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
  const [formData, setFormData] = useState({
    address: parent.address || "",
    city: parent.city || "",
    state: parent.state || "",
    postalCode: parent.postalCode || "",
    preferredState: parent.preferredState || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.address.trim()) newErrors.address = "Street address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
    } else if (currentStep === 2) {
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.postalCode.trim()) newErrors.postalCode = "PIN code is required";
      if (!/^\d{6}$/.test(formData.postalCode)) {
        newErrors.postalCode = "PIN code must be 6 digits";
      }
      if (!formData.preferredState) newErrors.preferredState = "Preferred state is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(2);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!validateStep(step)) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch("/api/parent/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.error || "Failed to update profile");
        return;
      }

      onSuccess(data.parent);
      onClose();
    } catch (error) {
      setApiError("Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, onSuccess, onClose, step]);

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
                <label htmlFor="address" className="block text-sm font-bold text-charcoal dark:text-cream mb-2">
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g., 123 Main Street"
                  className={`w-full px-4 py-2.5 rounded-lg border font-sans text-sm bg-white dark:bg-charcoal transition-colors ${
                    errors.address
                      ? "border-red-500 dark:border-red-500"
                      : "border-charcoal/10 dark:border-charcoal/30 focus:border-terracotta dark:focus:border-gold"
                  } focus:outline-none`}
                />
                {errors.address && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-bold text-charcoal dark:text-cream mb-2">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Bangalore"
                  className={`w-full px-4 py-2.5 rounded-lg border font-sans text-sm bg-white dark:bg-charcoal transition-colors ${
                    errors.city
                      ? "border-red-500 dark:border-red-500"
                      : "border-charcoal/10 dark:border-charcoal/30 focus:border-terracotta dark:focus:border-gold"
                  } focus:outline-none`}
                />
                {errors.city && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.city}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: State, PIN Code, Preferred State */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="state" className="block text-sm font-bold text-charcoal dark:text-cream mb-2">
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-lg border font-sans text-sm bg-white dark:bg-charcoal transition-colors ${
                    errors.state
                      ? "border-red-500 dark:border-red-500"
                      : "border-charcoal/10 dark:border-charcoal/30 focus:border-terracotta dark:focus:border-gold"
                  } focus:outline-none`}
                >
                  <option value="">Select a state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.state}</p>
                )}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-bold text-charcoal dark:text-cream mb-2">
                  PIN Code
                </label>
                <input
                  id="postalCode"
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="e.g., 560001"
                  maxLength={6}
                  className={`w-full px-4 py-2.5 rounded-lg border font-sans text-sm bg-white dark:bg-charcoal transition-colors ${
                    errors.postalCode
                      ? "border-red-500 dark:border-red-500"
                      : "border-charcoal/10 dark:border-charcoal/30 focus:border-terracotta dark:focus:border-gold"
                  } focus:outline-none`}
                />
                {errors.postalCode && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.postalCode}</p>
                )}
              </div>

              <div>
                <label htmlFor="preferredState" className="block text-sm font-bold text-charcoal dark:text-cream mb-2">
                  Preferred State for Competitions
                </label>
                <select
                  id="preferredState"
                  name="preferredState"
                  value={formData.preferredState}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-lg border font-sans text-sm bg-white dark:bg-charcoal transition-colors ${
                    errors.preferredState
                      ? "border-red-500 dark:border-red-500"
                      : "border-charcoal/10 dark:border-charcoal/30 focus:border-terracotta dark:focus:border-gold"
                  } focus:outline-none`}
                >
                  <option value="">Select a state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.preferredState && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.preferredState}</p>
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
              onClick={handleNext}
              variant="primary"
              size="md"
              className="flex-1 flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              variant="primary"
              size="md"
              className="flex-1"
            >
              {isLoading ? (
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

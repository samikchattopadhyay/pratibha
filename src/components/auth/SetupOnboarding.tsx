"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Lock, Phone, Mail, MapPin } from "lucide-react";
import Loading from "@/components/Loading";
import SearchableSelect, { SelectOption } from "@/components/admin/SearchableSelect";

interface Step {
  id: "password" | "phone" | "email" | "address";
  label: string;
  icon: React.ReactNode;
  optional: boolean;
}

interface OnboardingStatus {
  passwordSet: boolean;
  phoneSet: boolean;
  emailVerified: boolean;
  addressSet: boolean;
  setupToken?: string;
}

const INDIAN_STATES: SelectOption[] = [
  { value: "Andaman and Nicobar Islands", label: "Andaman and Nicobar Islands" },
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Dadra and Nagar Haveli and Daman and Diu", label: "Dadra and Nagar Haveli and Daman and Diu" },
  { value: "Dadar and Nagar Haveli", label: "Dadar and Nagar Haveli" },
  { value: "Daman and Diu", label: "Daman and Diu" },
  { value: "Delhi", label: "Delhi" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Lakshadweep", label: "Lakshadweep" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Puducherry", label: "Puducherry" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
];

const STEPS: Step[] = [
  { id: "password", label: "Set Password", icon: <Lock className="w-5 h-5" />, optional: false },
  { id: "phone", label: "Phone Number", icon: <Phone className="w-5 h-5" />, optional: false },
  { id: "email", label: "Verify Email", icon: <Mail className="w-5 h-5" />, optional: false },
  { id: "address", label: "Your Address", icon: <MapPin className="w-5 h-5" />, optional: false },
];

export default function SetupOnboarding() {
  const router = useRouter();

  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step form states
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [preferredState, setPreferredState] = useState("");

  // Load onboarding status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await fetch("/api/account/onboarding-status");
        if (!res.ok) {
          throw new Error("Failed to load onboarding status");
        }
        const data = await res.json();
        setStatus(data);

        // Determine which steps still need to be done
        const incompleteSteps = STEPS.filter((step) => {
          if (step.id === "password") return !data.passwordSet;
          if (step.id === "phone") return !data.phoneSet;
          if (step.id === "email") return !data.emailVerified;
          if (step.id === "address") return !data.addressSet;
          return false;
        });

        // If all steps are done, redirect to dashboard
        if (incompleteSteps.length === 0) {
          router.push("/account/dashboard");
          return;
        }
      } catch (err) {
        console.error("Error loading onboarding status:", err);
        setError("Failed to load onboarding status. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [router]);

  if (loading) {
    return <Loading variant="screen" text="Loading onboarding..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-charcoal px-4">
        <div className="w-full max-w-md p-6 bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  // Determine which steps to show
  const visibleSteps = STEPS.filter((step) => {
    if (step.id === "password") return !status.passwordSet;
    if (step.id === "phone") return !status.phoneSet;
    if (step.id === "email") return !status.emailVerified;
    if (step.id === "address") return !status.addressSet;
    return false;
  });

  if (visibleSteps.length === 0) {
    return null;
  }

  const currentStep = visibleSteps[currentStepIndex];
  const completedCount = STEPS.filter((step) => {
    if (step.id === "password") return status.passwordSet;
    if (step.id === "phone") return status.phoneSet;
    if (step.id === "email") return status.emailVerified;
    if (step.id === "address") return status.addressSet;
    return false;
  }).length;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setIsSubmitting(false);
        return;
      }

      if (password !== passwordConfirm) {
        setError("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/auth/setup/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken: status.setupToken, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to set password");
        return;
      }

      // Refresh status and move to next step
      setStatus({ ...status, passwordSet: true });
      setCurrentStepIndex(currentStepIndex + 1);
      setPassword("");
      setPasswordConfirm("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/setup/add-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken: status.setupToken, phone }),
      });

      const data = await response.json();

      if (!data.success) {
        const errorMsg = data.message || data.error || "Failed to add phone number";
        setError(errorMsg);
        return;
      }

      // Refresh status and move to next step
      setStatus({ ...status, phoneSet: true });
      setCurrentStepIndex(currentStepIndex + 1);
      setPhone("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/setup/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken: status.setupToken, code: verificationCode }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to verify email");
        return;
      }

      // Refresh status and move to next step
      setStatus({ ...status, emailVerified: true });
      setCurrentStepIndex(currentStepIndex + 1);
      setVerificationCode("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!address.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
        setError("All address fields are required");
        setIsSubmitting(false);
        return;
      }

      if (!/^\d{6}$/.test(postalCode)) {
        setError("PIN Code must be exactly 6 digits");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/auth/setup/save-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          city,
          state,
          postalCode,
          preferredState: preferredState || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to save address");
        return;
      }

      // All steps complete, redirect to dashboard
      router.push("/account/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-charcoal px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Sidebar - Steps */}
          <div className="space-y-3">
            <div className="mb-8">
              <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-cream mb-2">
                Complete Your Setup
              </h2>
              <p className="text-sm text-charcoal/60 dark:text-cream/60">
                {completedCount} of {STEPS.length} steps
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full h-2 bg-charcoal/10 dark:bg-charcoal/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-terracotta to-gold transition-all duration-300"
                  style={{ width: `${(completedCount / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-2">
              {STEPS.map((step) => {
                const isCompleted =
                  (step.id === "password" && status.passwordSet) ||
                  (step.id === "phone" && status.phoneSet) ||
                  (step.id === "email" && status.emailVerified) ||
                  (step.id === "address" && status.addressSet);
                const isActive = currentStep.id === step.id;

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      const stepIndex = visibleSteps.findIndex((s) => s.id === step.id);
                      if (stepIndex !== -1 && (isCompleted || isActive)) {
                        setCurrentStepIndex(stepIndex);
                      }
                    }}
                    className={`w-full flex items-start gap-3 p-4 rounded-lg transition-all border ${
                      isActive
                        ? "bg-terracotta/10 dark:bg-terracotta/20 border-terracotta dark:border-gold"
                        : isCompleted
                          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 hover:border-green-300"
                          : "bg-white dark:bg-charcoal-light border-terracotta/20 dark:border-terracotta/30"
                    } ${isCompleted && !isActive ? "cursor-pointer" : ""}`}
                    disabled={!isCompleted && !isActive}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : isActive ? (
                        <div className="w-5 h-5 rounded-full border-2 border-terracotta dark:border-gold flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-terracotta dark:bg-gold" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-charcoal/30 dark:text-cream/30" />
                      )}
                    </div>
                    <div className="text-left">
                      <p
                        className={`font-semibold text-sm ${
                          isActive
                            ? "text-terracotta dark:text-gold"
                            : isCompleted
                              ? "text-green-700 dark:text-green-400"
                              : "text-charcoal/60 dark:text-cream/60"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:col-span-2 bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-2xl p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Password Step */}
            {currentStep.id === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal dark:text-cream mb-2">
                    Create a Password
                  </h3>
                  <p className="text-charcoal/60 dark:text-cream/60">
                    Choose a strong password to secure your account
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal dark:text-cream mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-terracotta/20 dark:border-terracotta/30 rounded-lg bg-white dark:bg-charcoal focus:ring-2 focus:ring-terracotta focus:border-transparent dark:text-cream"
                    placeholder="Enter password (min. 8 characters)"
                  />
                  <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal dark:text-cream mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-terracotta/20 dark:border-terracotta/30 rounded-lg bg-white dark:bg-charcoal focus:ring-2 focus:ring-terracotta focus:border-transparent dark:text-cream"
                    placeholder="Confirm your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-terracotta hover:bg-terracotta/90 disabled:bg-terracotta/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loading variant="inline" text="Setting password..." />
                  ) : (
                    "Continue to Phone"
                  )}
                </button>
              </form>
            )}

            {/* Phone Step */}
            {currentStep.id === "phone" && (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal dark:text-cream mb-2">
                    Add Phone Number
                  </h3>
                  <p className="text-charcoal/60 dark:text-cream/60">
                    We'll use this to contact you about competition updates
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal dark:text-cream mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-terracotta/20 dark:border-terracotta/30 rounded-lg bg-white dark:bg-charcoal focus:ring-2 focus:ring-terracotta focus:border-transparent dark:text-cream"
                    placeholder="+91-9876543210"
                  />
                  <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">
                    Format: +91-XXXXXXXXXX or 10-digit number
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-terracotta hover:bg-terracotta/90 disabled:bg-terracotta/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loading variant="inline" text="Continuing..." />
                  ) : (
                    "Continue to Email"
                  )}
                </button>
              </form>
            )}

            {/* Email Step */}
            {currentStep.id === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal dark:text-cream mb-2">
                    Verify Your Email
                  </h3>
                  <p className="text-charcoal/60 dark:text-cream/60">
                    Enter the verification code sent to your email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal dark:text-cream mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-terracotta/20 dark:border-terracotta/30 rounded-lg bg-white dark:bg-charcoal focus:ring-2 focus:ring-terracotta focus:border-transparent dark:text-cream text-center font-mono tracking-wider"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                  <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">
                    Check your email for the verification code
                  </p>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 Can't find the email? Check your spam folder or request a new code.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-terracotta hover:bg-terracotta/90 disabled:bg-terracotta/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loading variant="inline" text="Verifying..." />
                  ) : (
                    "Continue to Address"
                  )}
                </button>
              </form>
            )}

            {/* Address Step */}
            {currentStep.id === "address" && (
              <form onSubmit={handleAddressSubmit} className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal dark:text-cream mb-2">
                    Complete Your Address
                  </h3>
                  <p className="text-charcoal/60 dark:text-cream/60">
                    Help us deliver certificates and stay in touch
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal dark:text-cream mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-terracotta/20 dark:border-terracotta/30 rounded-lg bg-white dark:bg-charcoal focus:ring-2 focus:ring-terracotta focus:border-transparent dark:text-cream"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-cream mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-terracotta/20 dark:border-terracotta/30 rounded-lg bg-white dark:bg-charcoal focus:ring-2 focus:ring-terracotta focus:border-transparent dark:text-cream"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal dark:text-cream mb-2">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-terracotta/20 dark:border-terracotta/30 rounded-lg bg-white dark:bg-charcoal focus:ring-2 focus:ring-terracotta focus:border-transparent dark:text-cream"
                      placeholder="6-digit PIN"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal dark:text-cream mb-2">
                    State
                  </label>
                  <SearchableSelect
                    options={INDIAN_STATES}
                    value={state}
                    onChange={setState}
                    placeholder="Select state"
                    disabled={isSubmitting}
                    searchPlaceholder="Search states..."
                    light
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal dark:text-cream mb-2">
                    Preferred State (Optional)
                  </label>
                  <SearchableSelect
                    options={INDIAN_STATES}
                    value={preferredState}
                    onChange={setPreferredState}
                    placeholder="Skip for now"
                    disabled={isSubmitting}
                    searchPlaceholder="Search states..."
                    light
                  />
                  <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">
                    You can update this later from your profile
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-terracotta hover:bg-terracotta/90 disabled:bg-terracotta/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loading variant="inline" text="Saving..." />
                  ) : (
                    "Complete Setup"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Circle, Lock, Phone, Mail } from "lucide-react";
import Loading from "@/components/Loading";

interface Step {
  id: "password" | "phone" | "email";
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

export default function SetupOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupToken = searchParams.get("token");

  const [currentStep, setCurrentStep] = useState<"password" | "phone" | "email">("password");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState(setupToken);

  // Password step state
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Phone step state
  const [phone, setPhone] = useState("");

  // Email step state
  const [verificationCode, setVerificationCode] = useState("");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-charcoal">
        <div className="w-full max-w-md p-6 bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400">
            Invalid setup link. Please start over.
          </p>
        </div>
      </div>
    );
  }

  const steps: Step[] = [
    {
      id: "password",
      title: "Create Password",
      description: "Set a secure password",
      icon: <Lock className="w-5 h-5" />,
      completed: completedSteps.has("password"),
    },
    {
      id: "phone",
      title: "Add Phone",
      description: "Your contact number",
      icon: <Phone className="w-5 h-5" />,
      completed: completedSteps.has("phone"),
    },
    {
      id: "email",
      title: "Verify Email",
      description: "Confirm your email",
      icon: <Mail className="w-5 h-5" />,
      completed: completedSteps.has("email"),
    },
  ];

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setIsLoading(false);
        return;
      }

      if (password !== passwordConfirm) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/auth/setup/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken: token, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to set password");
        return;
      }

      setCompletedSteps(new Set([...completedSteps, "password"]));
      setToken(data.setupToken);
      setCurrentStep("phone");
      setPassword("");
      setPasswordConfirm("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/setup/add-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken: token, phone }),
      });

      const data = await response.json();

      if (!data.success) {
        const errorMsg = data.message || data.error || "Failed to add phone number";
        setError(errorMsg);
        return;
      }

      setCompletedSteps(new Set([...completedSteps, "phone"]));
      setToken(token); // Token already updated on backend
      setCurrentStep("email");
      setPhone("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/setup/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken: token, code: verificationCode }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to verify email");
        return;
      }

      setCompletedSteps(new Set([...completedSteps, "email"]));
      // Setup complete - redirect to dashboard
      router.push("/parent/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
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
                {completedSteps.size} of {steps.length} steps
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full h-2 bg-charcoal/10 dark:bg-charcoal/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-terracotta to-gold transition-all duration-300"
                  style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => completedSteps.has(step.id) && setCurrentStep(step.id)}
                  className={`w-full flex items-start gap-3 p-4 rounded-lg transition-all border ${
                    currentStep === step.id
                      ? "bg-terracotta/10 dark:bg-terracotta/20 border-terracotta dark:border-gold"
                      : completedSteps.has(step.id)
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 hover:border-green-300"
                      : "bg-white dark:bg-charcoal-light border-terracotta/20 dark:border-terracotta/30"
                  } ${completedSteps.has(step.id) && currentStep !== step.id ? "cursor-pointer" : ""}`}
                  disabled={!completedSteps.has(step.id) && currentStep !== step.id}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {completedSteps.has(step.id) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : currentStep === step.id ? (
                      <div className="w-5 h-5 rounded-full border-2 border-terracotta dark:border-gold flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-terracotta dark:bg-gold" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-charcoal/30 dark:text-cream/30" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold text-sm ${
                      currentStep === step.id
                        ? "text-terracotta dark:text-gold"
                        : completedSteps.has(step.id)
                        ? "text-green-700 dark:text-green-400"
                        : "text-charcoal/60 dark:text-cream/60"
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </button>
              ))}
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
            {currentStep === "password" && (
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-terracotta/20 dark:border-terracotta/30 rounded-lg bg-white dark:bg-charcoal focus:ring-2 focus:ring-terracotta focus:border-transparent dark:text-cream"
                    placeholder="Confirm your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-terracotta hover:bg-terracotta/90 disabled:bg-terracotta/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loading variant="inline" text="Setting password..." />
                  ) : (
                    "Continue to Phone"
                  )}
                </button>
              </form>
            )}

            {/* Phone Step */}
            {currentStep === "phone" && (
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
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-terracotta/20 dark:border-terracotta/30 rounded-lg bg-white dark:bg-charcoal focus:ring-2 focus:ring-terracotta focus:border-transparent dark:text-cream"
                    placeholder="+91-9876543210"
                  />
                  <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">
                    Format: +91-XXXXXXXXXX or 10-digit number
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("password")}
                    disabled={isLoading}
                    className="flex-1 py-2.5 bg-white dark:bg-charcoal hover:bg-cream dark:hover:bg-charcoal-light border border-terracotta/20 text-charcoal dark:text-cream rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 bg-terracotta hover:bg-terracotta/90 disabled:bg-terracotta/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loading variant="inline" text="Continuing..." />
                    ) : (
                      "Continue to Email"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Email Step */}
            {currentStep === "email" && (
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
                    disabled={isLoading}
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

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep("phone")}
                    disabled={isLoading}
                    className="flex-1 py-2.5 bg-white dark:bg-charcoal hover:bg-cream dark:hover:bg-charcoal-light border border-terracotta/20 text-charcoal dark:text-cream rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 bg-terracotta hover:bg-terracotta/90 disabled:bg-terracotta/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loading variant="inline" text="Verifying..." />
                    ) : (
                      "Complete Setup"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

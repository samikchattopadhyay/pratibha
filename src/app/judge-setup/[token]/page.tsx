"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle, CheckCircle, Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormError from "@/components/forms/FormError";

const JudgeSetupSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(12, "Password must be at least 12 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type JudgeSetupFormData = z.infer<typeof JudgeSetupSchema>;

function SetPasswordForm() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [judgeName, setJudgeName] = useState("");
  const [tokenValid, setTokenValid] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<JudgeSetupFormData>({
    resolver: zodResolver(JudgeSetupSchema),
    mode: "onChange",
  });

  const passwordVal = watch("password", "");
  const confirmPasswordVal = watch("confirmPassword", "");
  const passwordStrength = passwordVal.length;
  const passwordsMatch = passwordVal === confirmPasswordVal && passwordVal.length > 0;

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/set-password?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.reason === "expired" ? "This setup link has expired. Please contact support." : "Invalid or expired setup link.");
          setTokenValid(false);
        } else {
          setJudgeName(data.name);
          setTokenValid(true);
        }
      } catch (err) {
        setError("Failed to validate setup link. Please try again.");
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    if (token) {
      validateToken();
    }
  }, [token]);

  const onSubmit = async (data: JudgeSetupFormData) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password, confirmPassword: data.confirmPassword }),
      });

      const resData = await response.json();

      if (!response.ok) {
        setError(resData.error || "Failed to set password");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?msg=password-set");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return <Loading variant="screen" text="Validating setup link..." />;
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream py-16 px-4 flex items-center justify-center alpana-pattern">
        <div className="w-full max-w-md bg-cream border border-terracotta/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <svg
            className="absolute top-0 right-0 opacity-[0.03] w-64 h-64"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" fill="currentColor" />
          </svg>

          <div className="text-center space-y-2 mb-8 relative z-10">
            <div className="flex justify-center mb-4">
              <div className="bg-gold/10 p-3 rounded-full">
                <Lock className="w-6 h-6 text-gold" />
              </div>
            </div>
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              Set Your <span className="text-terracotta">Password</span>
            </h1>
            <p className="font-sans text-sm text-charcoal/60 uppercase font-bold tracking-wider">
              Complete your account setup
            </p>
          </div>

          {!tokenValid && error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-200 rounded-xl flex gap-3 relative z-10">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-semibold">{error}</p>
            </div>
          )}

          {tokenValid && (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-200 rounded-xl flex gap-3 relative z-10">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-semibold">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-200 rounded-xl flex gap-3 relative z-10 animate-in fade-in">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 font-semibold">Password set successfully!</p>
                    <p className="text-xs text-green-700 mt-0.5">Redirecting to login...</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                <div className="space-y-1.5">
                  <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">New Password *</label>
                  <input
                    type="password"
                    {...register("password")}
                    className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                    placeholder="Enter a strong password"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <FormError error={errors.password.message} />
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-200 ${
                          passwordStrength < 8
                            ? "w-1/3 bg-red-500"
                            : passwordStrength < 12
                            ? "w-2/3 bg-yellow-500"
                            : "w-full bg-green-500"
                        }`}
                      />
                    </div>
                    <span className="text-xs text-charcoal/60 font-mono">{passwordStrength}</span>
                  </div>
                  <p className="text-xs text-charcoal/50 mt-1">Minimum 12 characters recommended</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">Confirm Password *</label>
                  <input
                    type="password"
                    {...register("confirmPassword")}
                    className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                    placeholder="Re-enter your password"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <FormError error={errors.confirmPassword.message} />
                  )}
                  {confirmPasswordVal && passwordsMatch && (
                    <p className="text-xs text-green-600 font-semibold">✓ Passwords match</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1.5 mt-4">
                  <p className="text-xs font-semibold text-blue-900">🔒 Password Tips</p>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li>Mix uppercase, lowercase, numbers, and symbols</li>
                    <li>Use a unique password you haven&apos;t used elsewhere</li>
                    <li>Consider using a password manager to store it</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  disabled={!tokenValid || loading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Set Password & Log In</span>
                </Button>
              </form>
            </>
          )}

          {!tokenValid && (
            <div className="text-center space-y-3 relative z-10 mt-6">
              <p className="text-sm text-charcoal/70">
                If you believe this is an error, please contact support at{" "}
                <a href="mailto:support@pratibha.org" className="text-terracotta font-semibold hover:underline">
                  support@pratibha.org
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<Loading variant="screen" />}>
      <SetPasswordForm />
    </Suspense>
  );
}

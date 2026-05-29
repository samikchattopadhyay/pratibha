"use client";

import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import PasswordField from "@/components/forms/PasswordField";
import FormError from "@/components/forms/FormError";
import Loading from "@/components/Loading";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/schemas/auth";
import { Lock, AlertCircle, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [validating, setValidating] = useState(!token);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState(token ? "" : "No reset token provided");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await res.json();

        if (data.valid) {
          setTokenValid(true);
        } else {
          setTokenError(
            data.reason === "expired"
              ? "This reset link has expired. Please request a new one."
              : data.reason === "used"
              ? "This reset link has already been used. Please request a new one."
              : "Invalid reset link. Please request a new one."
          );
        }
      } catch (err) {
        console.error("Token validation error:", err);
        setTokenError("Unable to validate reset link. Please try again.");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError("root", {
          message: responseData.error || "Something went wrong. Please try again.",
        });
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  if (validating) {
    return <Loading variant="screen" text="Validating reset link..." />;
  }

  if (!tokenValid) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-cream py-16 px-4 flex items-center justify-center alpana-pattern">
          <div className="w-full max-w-md bg-cream border border-terracotta/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-charcoal">
                Link <span className="text-terracotta">Invalid</span>
              </h1>
              <p className="font-sans text-sm text-charcoal/60">{tokenError}</p>
              <Link href="/forgot-password">
                <Button variant="primary" size="md" className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-cream py-16 px-4 flex items-center justify-center alpana-pattern">
          <div className="w-full max-w-md bg-cream border border-terracotta/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-charcoal">
                Password <span className="text-terracotta">Updated</span>
              </h1>
              <p className="font-sans text-sm text-charcoal/60">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <Link href="/login">
                <Button variant="primary" size="md" className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const rootError = errors.root?.message;
  const passwordValue = watch("password");

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream py-16 px-4 flex items-center justify-center alpana-pattern">
        <div className="w-full max-w-md bg-cream border border-terracotta/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="text-center space-y-2 mb-8">
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              Reset Your <span className="text-terracotta">Password</span>
            </h1>
            <p className="font-sans text-sm text-charcoal/60 uppercase font-bold tracking-wider">
              Enter your new password
            </p>
          </div>

          {rootError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-200 rounded-xl text-red-800 text-sm font-sans flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{rootError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <PasswordField
              label="New Password"
              placeholder="••••••••"
              error={errors.password?.message}
              showRequirements={true}
              value={passwordValue}
              {...register("password")}
            />

            <div className="space-y-1.5">
              <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors ${
                  errors.confirmPassword ? "border-red-300 focus:border-red-400" : ""
                }`}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <FormError error={errors.confirmPassword.message} />}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full"
            >
              <Lock className="w-4 h-4" />
              <span>Reset Password</span>
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-terracotta/5 text-center font-sans text-sm text-charcoal/60">
            Remember your password?{" "}
            <Link href="/login" className="text-terracotta font-bold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading variant="screen" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

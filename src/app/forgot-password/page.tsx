"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import FormField from "@/components/forms/FormField";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/schemas/auth";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError("root", {
          message: responseData.error || "Something went wrong. Please try again.",
        });
      } else {
        setSubmittedEmail(data.email);
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

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
                Check Your <span className="text-terracotta">Email</span>
              </h1>
              <p className="font-sans text-sm text-charcoal/60">
                We&apos;ve sent a password reset link to <strong>{submittedEmail}</strong>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="font-sans text-sm text-charcoal">
                  <strong>✓ Check your inbox</strong> — Look for an email from Pratibha Parishad
                </p>
                <p className="font-sans text-sm text-charcoal mt-2">
                  <strong>✓ Check spam folder</strong> — Sometimes it ends up there
                </p>
                <p className="font-sans text-sm text-charcoal mt-2">
                  <strong>✓ Valid for 1 hour</strong> — The link expires after 60 minutes
                </p>
              </div>
              <div className="pt-4 flex gap-3">
                <Link href="/login" className="flex-1">
                  <Button variant="secondary" size="md" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const rootError = errors.root?.message;

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream py-16 px-4 flex items-center justify-center alpana-pattern">
        <div className="w-full max-w-md bg-cream border border-terracotta/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="text-center space-y-2 mb-8">
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              Forgot <span className="text-terracotta">Password?</span>
            </h1>
            <p className="font-sans text-sm text-charcoal/60 uppercase font-bold tracking-wider">
              We&apos;ll help you reset it
            </p>
          </div>

          {rootError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-200 rounded-xl text-red-800 text-sm font-sans flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{rootError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <p className="font-sans text-xs text-charcoal/60 pt-2">
              We&apos;ll send a secure password reset link to this email address. The link expires in 1 hour.
            </p>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full"
            >
              <Mail className="w-4 h-4" />
              <span>Send Reset Link</span>
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

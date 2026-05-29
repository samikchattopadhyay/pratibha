"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailToken = searchParams.get("token");
  const setupToken = searchParams.get("setup-token");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // If we have the email token from the verification link click
    if (emailToken) {
      completeVerification();
    } else {
      setIsLoading(false);
    }
  }, [emailToken]);

  const completeVerification = async () => {
    try {
      const response = await fetch("/api/auth/setup/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: emailToken,
          setupToken: setupToken || "",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to verify email");
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard
      setTimeout(() => {
        router.push(data.redirectUrl || "/account/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/auth/setup/resend-verification-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setupToken }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to resend email");
        return;
      }

      setError(null);
      // Show success message
      alert("Verification email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading && emailToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-charcoal">
        <div className="w-full max-w-md p-6 bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg text-center">
          <Loading variant="screen" text="Verifying your email..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-charcoal px-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg">
        <h1 className="text-2xl font-bold text-charcoal dark:text-cream mb-2">
          Verify Your Email
        </h1>
        <p className="text-charcoal/60 dark:text-cream/60 mb-6">
          We've sent a verification link to your email address. Click the link
          to complete your registration.
        </p>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-charcoal/70 dark:text-cream/70">
            Didn't receive the email?
          </p>

          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full py-2 bg-terracotta hover:bg-terracotta/90 disabled:bg-terracotta/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isResending ? (
              <Loading variant="inline" text="Sending..." />
            ) : (
              "Resend Verification Email"
            )}
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full py-2 text-terracotta hover:text-terracotta/90 font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Loading from "@/components/Loading";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<
    "verifying" | "success" | "expired" | "error"
  >("verifying");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setError("Invalid verification link");
      return;
    }

    verifyEmail();
  }, [token, email]);

  const verifyEmail = async () => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "TOKEN_EXPIRED") {
          setStatus("expired");
        } else {
          setError(data.error || "Verification failed");
          setStatus("error");
        }
        return;
      }

      setStatus("success");
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred");
      setStatus("error");
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setError("Verification email sent! Check your inbox.");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to resend email");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-charcoal dark:bg-charcoal-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg p-8">
        {status === "verifying" && (
          <div className="text-center">
            <Loading variant="overlay" text="Verifying email..." />
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-2xl font-bold text-charcoal dark:text-white">
              Email Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your email has been verified successfully.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to login...
            </p>
          </div>
        )}

        {status === "expired" && (
          <div className="text-center space-y-4">
            <div className="text-5xl">⏰</div>
            <h2 className="text-2xl font-bold text-charcoal dark:text-white">
              Link Expired
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your verification link has expired. Please request a new one.
            </p>
            <button
              onClick={handleResend}
              className="w-full bg-terracotta text-white py-2 px-4 rounded-lg font-semibold hover:bg-terracotta/90 transition"
            >
              Resend Verification Email
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <div className="text-5xl">❌</div>
            <h2 className="text-2xl font-bold text-charcoal dark:text-white">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
            <div className="space-y-2">
              <button
                onClick={handleResend}
                className="w-full bg-terracotta text-white py-2 px-4 rounded-lg font-semibold hover:bg-terracotta/90 transition"
              >
                Resend Verification Email
              </button>
              <Link
                href="/login"
                className="block w-full border border-terracotta text-terracotta py-2 px-4 rounded-lg font-semibold hover:bg-terracotta/5 transition text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

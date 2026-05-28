"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import PasswordInput from "@/components/PasswordInput";
import Loading from "@/components/Loading";
import { Lock, AlertCircle, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(!token);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState(token ? "" : "No reset token provided");
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
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

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-200 rounded-xl text-red-800 text-sm font-sans flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              showRequirements={true}
            />

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              isLoading={loading}
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

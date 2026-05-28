"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
                We&apos;ve sent a password reset link to <strong>{email}</strong>
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

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-200 rounded-xl text-red-800 text-sm font-sans flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-sans text-sm font-bold text-charcoal/80 uppercase">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full font-sans text-base bg-cream border border-terracotta/20 rounded-lg px-4 py-3.5 text-charcoal focus:outline-none focus:border-terracotta transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            <p className="font-sans text-xs text-charcoal/60 pt-2">
              We&apos;ll send a secure password reset link to this email address. The link expires in 1 hour.
            </p>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              isLoading={loading}
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

"use client";

import Link from "next/link";
import { useState } from "react";

export default function VerificationFailedPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(
        response.ok
          ? "Verification email sent! Check your inbox."
          : data.error || "Failed to resend email"
      );
    } catch {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal dark:bg-charcoal-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl">❌</div>
          <h2 className="text-2xl font-bold text-charcoal dark:text-white">
            Verification Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            The verification link is invalid or has expired.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-white mb-2">
              Enter your email to get a new link:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-charcoal-light text-charcoal dark:text-white"
            />
          </div>

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full bg-terracotta text-white py-2 px-4 rounded-lg font-semibold hover:bg-terracotta/90 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Resend Verification Email"}
          </button>

          {message && (
            <p
              className={`text-sm text-center ${
                message.includes("sent")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <Link
          href="/login"
          className="block w-full border border-terracotta text-terracotta py-2 px-4 rounded-lg font-semibold hover:bg-terracotta/5 transition text-center"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

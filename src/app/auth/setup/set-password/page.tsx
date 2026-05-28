"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupToken = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!setupToken) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/setup/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to set password");
        return;
      }

      // Redirect to phone verification
      router.push(`/auth/setup/phone?token=${setupToken}`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-charcoal px-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg">
        <h1 className="text-2xl font-bold text-charcoal dark:text-cream mb-2">
          Set Password
        </h1>
        <p className="text-charcoal/60 dark:text-cream/60 mb-6">
          Create a secure password for your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

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
              placeholder="Enter password"
            />
            <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-1">
              At least 8 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-cream mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-terracotta/20 dark:border-terracotta/30 rounded-lg bg-white dark:bg-charcoal focus:ring-2 focus:ring-terracotta focus:border-transparent dark:text-cream"
              placeholder="Confirm password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-terracotta hover:bg-terracotta/90 disabled:bg-terracotta/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loading variant="inline" text="Setting password..." />
            ) : (
              "Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

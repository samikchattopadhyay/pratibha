"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function PhoneVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupToken = searchParams.get("token");

  const [phone, setPhone] = useState("");
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
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/setup/add-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupToken, phone }),
      });

      const data = await response.json();

      if (!data.success) {
        const errorMsg = data.message || data.error || "Failed to add phone number";
        console.error("Add phone error:", { data, errorMsg });
        setError(errorMsg);
        return;
      }

      router.push(`/auth/setup/verify-email?token=${setupToken}`);
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
          Add Phone Number
        </h1>
        <p className="text-charcoal/60 dark:text-cream/60 mb-6">
          We'll use this to contact you about competition updates
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-terracotta hover:bg-terracotta/90 disabled:bg-terracotta/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loading variant="inline" text="Continuing..." />
            ) : (
              "Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

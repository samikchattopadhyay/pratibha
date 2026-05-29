"use client";

import { useState, useCallback, useEffect } from "react";
import Loading from "@/components/Loading";
import { Check, X } from "lucide-react";

interface SlugInputProps {
  value: string;
  onChange: (slug: string) => void;
  onAvailabilityChange: (available: boolean) => void;
  studentId?: string;
  disabled?: boolean;
  label?: string;
  showPreview?: boolean;
}

export default function SlugInput({
  value,
  onChange,
  onAvailabilityChange,
  studentId,
  disabled,
  label,
  showPreview = true,
}: SlugInputProps) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const checkAvailability = useCallback(
    async (slug: string) => {
      if (!slug || slug.length < 3) {
        setAvailable(null);
        setError(null);
        onAvailabilityChange(false);
        return;
      }

      setChecking(true);
      try {
        const res = await fetch("/api/account/students/check-slug", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: slug.toLowerCase().trim(),
            excludeStudentId: studentId,
          }),
        });

        const data = await res.json();

        if (data.available) {
          setAvailable(true);
          setError(null);
          onAvailabilityChange(true);
        } else {
          setAvailable(false);
          setError(
            `Not available${data.suggestions ? `. Try: ${data.suggestions.join(", ")}` : ""}`
          );
          onAvailabilityChange(false);
        }
      } catch {
        setError("Error checking availability");
        setAvailable(null);
        onAvailabilityChange(false);
      } finally {
        setChecking(false);
      }
    },
    [studentId, onAvailabilityChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Sanitize input
    const slug = rawValue
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    onChange(slug);

    // Debounce availability check
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      checkAvailability(slug);
    }, 500);
    setDebounceTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-charcoal dark:text-white">
        {label || "Profile URL Slug"}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="john-doe"
          className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-charcoal-light focus:outline-none focus:ring-2 focus:ring-terracotta/50 disabled:opacity-50"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {checking && <Loading variant="inline" />}
          {!checking && available && (
            <Check className="w-5 h-5 text-green-600" />
          )}
          {!checking && available === false && (
            <X className="w-5 h-5 text-red-600" />
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {showPreview && (
        <p className="text-xs text-charcoal/60 dark:text-white/60">
          https://pratibha.local/profile/{value || "your-slug"}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Loading from "@/components/Loading";

interface Registration {
  id: string;
  competitionTitle: string;
  categoryName: string;
  competitionStartDate: string;
  prizeRank: string | null;
  isFeatured: boolean;
  isHidden: boolean;
}

interface CurationPanelProps {
  studentId: string;
}

export default function CurationPanel({ studentId }: CurationPanelProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [featuredCount, setFeaturedCount] = useState(0);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await fetch(
          `/api/account/students/${studentId}/verified-registrations`
        );
        if (!res.ok) throw new Error("Failed to fetch registrations");
        const data = await res.json();
        setRegistrations(data);
        setFeaturedCount(data.filter((r: Registration) => r.isFeatured).length);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [studentId]);

  const toggleFeatured = async (registrationId: string, current: boolean) => {
    // Check if we're adding a featured item and we already have 3
    if (!current && featuredCount >= 3) {
      setError("Maximum 3 featured selections allowed");
      return;
    }

    setSaving(registrationId);
    try {
      const res = await fetch(
        `/api/account/students/${studentId}/registrations/${registrationId}/curation`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFeatured: !current }),
        }
      );

      if (!res.ok) throw new Error("Failed to update registration");

      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registrationId
            ? { ...r, isFeatured: !current }
            : r
        )
      );

      setFeaturedCount(
        featuredCount + (!current ? 1 : -1)
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setSaving(null);
    }
  };

  const toggleHidden = async (registrationId: string, current: boolean) => {
    setSaving(registrationId);
    try {
      const res = await fetch(
        `/api/account/students/${studentId}/registrations/${registrationId}/curation`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isHidden: !current }),
        }
      );

      if (!res.ok) throw new Error("Failed to update registration");

      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registrationId
            ? { ...r, isHidden: !current }
            : r
        )
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setSaving(null);
    }
  };

  const getMedalEmoji = (prizeRank: string | null) => {
    if (!prizeRank) return null;
    if (prizeRank === "FIRST_PLACE") return "🥇";
    if (prizeRank === "SECOND_PLACE") return "🥈";
    if (prizeRank === "THIRD_PLACE") return "🥉";
    return null;
  };

  if (loading) {
    return <Loading variant="overlay" text="Loading your registrations..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-charcoal dark:text-gold">
            Achievement Curation
          </h3>
          <p className="text-sm text-charcoal/70 dark:text-cream/70">
            Manage which achievements appear on your public profile
          </p>
        </div>
        <div className="bg-gold/10 dark:bg-gold/20 px-4 py-2 rounded-lg">
          <p className="text-sm font-medium text-gold">
            {featuredCount}/3 featured
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {registrations.length === 0 ? (
          <p className="text-charcoal/70 dark:text-cream/70 text-sm py-4">
            No verified registrations found
          </p>
        ) : (
          registrations.map((reg) => (
            <div
              key={reg.id}
              className={`border rounded-lg p-4 transition-all ${
                reg.isFeatured
                  ? "border-gold bg-gold/5 dark:bg-gold/10"
                  : "border-terracotta/20 dark:border-terracotta/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-xl">
                  {getMedalEmoji(reg.prizeRank) || "🎭"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal dark:text-white truncate">
                    {reg.competitionTitle}
                  </p>
                  <p className="text-sm text-charcoal/70 dark:text-cream/70">
                    {reg.categoryName} •{" "}
                    {new Date(reg.competitionStartDate).getFullYear()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFeatured(reg.id, reg.isFeatured)}
                    disabled={saving === reg.id || (!reg.isFeatured && featuredCount >= 3)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      reg.isFeatured
                        ? "bg-gold text-charcoal hover:bg-gold/90"
                        : "bg-gray-200 dark:bg-gray-700 text-charcoal dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
                  >
                    {saving === reg.id ? (
                      <span className="inline-block animate-spin">⟳</span>
                    ) : (
                      "⭐"
                    )}
                    {reg.isFeatured ? "Featured" : "Feature"}
                  </button>

                  <button
                    onClick={() => toggleHidden(reg.id, reg.isHidden)}
                    disabled={saving === reg.id}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      reg.isHidden
                        ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900"
                        : "bg-gray-200 dark:bg-gray-700 text-charcoal dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
                  >
                    {saving === reg.id ? (
                      <span className="inline-block animate-spin">⟳</span>
                    ) : (
                      "👁"
                    )}
                    {reg.isHidden ? "Hidden" : "Show"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

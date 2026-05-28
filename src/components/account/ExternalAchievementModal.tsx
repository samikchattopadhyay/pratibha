"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/Button";
import Loading from "@/components/Loading";

interface ExternalAchievementModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly studentId: string;
  readonly initialData?: AchievementFormData;
  readonly achievementId?: string;
}

export interface AchievementFormData {
  title: string;
  eventName: string;
  category: string;
  year: string;
  rank: string;
  description: string;
  proofUrl: string;
}

export default function ExternalAchievementModal({
  isOpen,
  onClose,
  onSuccess,
  studentId,
  initialData,
  achievementId,
}: ExternalAchievementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState<AchievementFormData>(() => {
    if (initialData) return initialData;
    return {
      title: "",
      eventName: "",
      category: "",
      year: currentYear.toString(),
      rank: "",
      description: "",
      proofUrl: "",
    };
  });

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setErrorMsg("Achievement title is required");
      return false;
    }
    if (!formData.eventName.trim()) {
      setErrorMsg("Event name is required");
      return false;
    }
    const year = parseInt(formData.year, 10);
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      setErrorMsg("Please enter a valid year");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    const payload = {
      title: formData.title.trim(),
      eventName: formData.eventName.trim(),
      category: formData.category.trim() || null,
      year: parseInt(formData.year, 10),
      rank: formData.rank.trim() || null,
      description: formData.description.trim() || null,
      proofUrl: formData.proofUrl.trim() || null,
    };

    try {
      const method = achievementId ? "PATCH" : "POST";
      const url = achievementId
        ? `/api/account/students/${studentId}/external-achievements/${achievementId}`
        : `/api/account/students/${studentId}/external-achievements`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save achievement");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl max-w-lg w-full my-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="sticky top-0 z-20 bg-cream dark:bg-charcoal-light border-b border-terracotta/10 flex-shrink-0 px-6 py-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream">
            {achievementId ? "Edit Achievement" : "Add Achievement"}
          </h3>
          <button
            onClick={onClose}
            className="text-charcoal/50 dark:text-cream/50 hover:text-charcoal dark:hover:text-cream transition-colors p-1 rounded hover:bg-charcoal/5 dark:hover:bg-cream/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-charcoal dark:text-cream">

            {/* Achievement Title */}
            <div className="space-y-1">
              <label className="text-sm font-medium block">Achievement Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                placeholder="e.g. 1st Place – State Art Competition"
              />
            </div>

            {/* Event Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium block">Event / Competition Name *</label>
              <input
                type="text"
                required
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                placeholder="e.g. School Annual Art Festival"
              />
            </div>

            {/* Category and Year Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium block">Category / Discipline</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                  placeholder="e.g. Painting"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium block">Year *</label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  min="1900"
                  max={currentYear + 1}
                  className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                  placeholder="2024"
                />
              </div>
            </div>

            {/* Rank */}
            <div className="space-y-1">
              <label className="text-sm font-medium block">Rank / Result</label>
              <input
                type="text"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                placeholder="e.g. 1st Place, Runner Up, Participation"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 py-2 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                placeholder="Optional details about the achievement..."
              />
            </div>

            {/* Proof URL */}
            <div className="space-y-1">
              <label className="text-sm font-medium block">Proof URL</label>
              <input
                type="url"
                value={formData.proofUrl}
                onChange={(e) => setFormData({ ...formData, proofUrl: e.target.value })}
                className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                placeholder="https://example.com/certificate.pdf"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 bg-cream dark:bg-charcoal-light border-t border-terracotta/10 p-6 flex justify-end items-center gap-3 flex-shrink-0">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            size="md"
            disabled={isSubmitting}
            className="w-24 font-bold"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="w-40 font-bold flex items-center justify-center"
          >
            {isSubmitting ? (
              <Loading variant="inline" text="Saving..." className="text-current" />
            ) : (
              achievementId ? "Update" : "Add Achievement"
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}

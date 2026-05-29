"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormError from "@/components/forms/FormError";

interface ExternalAchievementModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly studentId: string;
  readonly initialData?: AchievementFormDataInput;
  readonly achievementId?: string;
}

export interface AchievementFormDataInput {
  title: string;
  eventName: string;
  category?: string | null;
  year: number | string;
  rank?: string | null;
  description?: string | null;
  proofUrl?: string | null;
}

const achievementSchema = z.object({
  title: z.string().min(1, "Achievement title is required").max(100, "Title is too long"),
  eventName: z.string().min(1, "Event name is required").max(200, "Event name is too long"),
  category: z.string().max(100, "Category name is too long").optional().or(z.literal("")),
  year: z.number().min(1900, "Enter a valid year").max(new Date().getFullYear() + 1, "Enter a valid year"),
  rank: z.string().max(100, "Rank description is too long").optional().or(z.literal("")),
  description: z.string().max(500, "Description is too long").optional().or(z.literal("")),
  proofUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type AchievementFormData = z.infer<typeof achievementSchema>;

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: "",
      eventName: "",
      category: "",
      year: currentYear,
      rank: "",
      description: "",
      proofUrl: "",
    },
  });

  // Sync initialData when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title || "",
          eventName: initialData.eventName || "",
          category: initialData.category || "",
          year: typeof initialData.year === "string" ? parseInt(initialData.year, 10) : initialData.year,
          rank: initialData.rank || "",
          description: initialData.description || "",
          proofUrl: initialData.proofUrl || "",
        });
      } else {
        reset({
          title: "",
          eventName: "",
          category: "",
          year: currentYear,
          rank: "",
          description: "",
          proofUrl: "",
        });
      }
    }
  }, [isOpen, initialData, reset, currentYear]);

  if (!isOpen) return null;

  const onSubmit = async (data: AchievementFormData) => {
    setIsSubmitting(true);
    setErrorMsg("");

    const payload = {
      title: data.title.trim(),
      eventName: data.eventName.trim(),
      category: data.category?.trim() || null,
      year: data.year,
      rank: data.rank?.trim() || null,
      description: data.description?.trim() || null,
      proofUrl: data.proofUrl?.trim() || null,
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

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to save achievement");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred");
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4 font-sans text-charcoal dark:text-cream">
              {/* Achievement Title */}
              <div className="space-y-1">
                <label className="text-sm font-medium block">Achievement Title *</label>
                <input
                  type="text"
                  {...register("title")}
                  className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                  placeholder="e.g. 1st Place – State Art Competition"
                />
                {errors.title && <FormError error={errors.title.message} />}
              </div>

              {/* Event Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium block">Event / Competition Name *</label>
                <input
                  type="text"
                  {...register("eventName")}
                  className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                  placeholder="e.g. School Annual Art Festival"
                />
                {errors.eventName && <FormError error={errors.eventName.message} />}
              </div>

              {/* Category and Year Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium block">Category / Discipline</label>
                  <input
                    type="text"
                    {...register("category")}
                    className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                    placeholder="e.g. Painting"
                  />
                  {errors.category && <FormError error={errors.category.message} />}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium block">Year *</label>
                  <input
                    type="number"
                    {...register("year", { valueAsNumber: true })}
                    min="1900"
                    max={currentYear + 1}
                    className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                    placeholder="2024"
                  />
                  {errors.year && <FormError error={errors.year.message} />}
                </div>
              </div>

              {/* Rank */}
              <div className="space-y-1">
                <label className="text-sm font-medium block">Rank / Result</label>
                <input
                  type="text"
                  {...register("rank")}
                  className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                  placeholder="e.g. 1st Place, Runner Up, Participation"
                />
                {errors.rank && <FormError error={errors.rank.message} />}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-sm font-medium block">Description</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 py-2 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                  placeholder="Optional details about the achievement..."
                />
                {errors.description && <FormError error={errors.description.message} />}
              </div>

              {/* Proof URL */}
              <div className="space-y-1">
                <label className="text-sm font-medium block">Proof URL</label>
                <input
                  type="url"
                  {...register("proofUrl")}
                  className="w-full h-10 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta"
                  placeholder="https://example.com/certificate.pdf"
                />
                {errors.proofUrl && <FormError error={errors.proofUrl.message} />}
              </div>
            </div>
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
              type="submit"
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
        </form>

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import type { JudgeMetadata } from "@/types/judges-details";

interface SettingsSubTabProps {
  readonly judge: JudgeMetadata;
  readonly judgeId: string;
}

const JudgeSettingsSchema = z.object({
  maxEvaluationsPerDay: z.number().min(1).max(50),
  restPeriodHours: z.number().min(0).max(24),
  preferredCategories: z.array(z.string()).min(1, "Select at least 1 category"),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});

type SettingsFormData = z.infer<typeof JudgeSettingsSchema>;

const AVAILABLE_CATEGORIES = [
  "Music Vocal",
  "Music Instrumental",
  "Performing Arts",
  "Visual Arts",
  "Literary Arts",
  "Spoken Word",
];

export default function SettingsSubTab({ judge, judgeId }: SettingsSubTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    judge.specializations.length > 0 ? Array.from(judge.specializations) : []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(JudgeSettingsSchema),
    defaultValues: {
      maxEvaluationsPerDay: 5,
      restPeriodHours: 8,
      preferredCategories: selectedCategories,
      emailNotifications: true,
      smsNotifications: false,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch(`/api/admin/judges/${judgeId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          preferredCategories: selectedCategories,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update settings");
      }

      setSubmitMessage({
        type: "success",
        text: "Settings updated successfully",
      });
      reset();
    } catch (err) {
      console.error("[SettingsSubTab] Submit error:", err);
      setSubmitMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update settings",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-6">
      {/* Settings Form Card */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6">
        <h3 className="font-serif text-xl font-bold text-cream mb-6">
          Judge Settings
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Max Evaluations Per Day */}
          <div>
            <label className="block text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
              Max Evaluations Per Day
            </label>
            <input
              type="number"
              {...register("maxEvaluationsPerDay")}
              className="w-full bg-charcoal border border-terracotta/20 rounded-xl px-4 py-2.5 text-cream placeholder-cream/35 focus:outline-none focus:border-gold"
            />
            {errors.maxEvaluationsPerDay && (
              <p className="text-red-400 text-xs mt-1">
                {errors.maxEvaluationsPerDay.message}
              </p>
            )}
          </div>

          {/* Rest Period Hours */}
          <div>
            <label className="block text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
              Rest Period Hours
            </label>
            <input
              type="number"
              {...register("restPeriodHours")}
              className="w-full bg-charcoal border border-terracotta/20 rounded-xl px-4 py-2.5 text-cream placeholder-cream/35 focus:outline-none focus:border-gold"
            />
            {errors.restPeriodHours && (
              <p className="text-red-400 text-xs mt-1">
                {errors.restPeriodHours.message}
              </p>
            )}
          </div>

          {/* Preferred Categories */}
          <div>
            <label className="block text-xs uppercase text-cream/40 font-bold tracking-wider mb-3">
              Preferred Categories
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {AVAILABLE_CATEGORIES.map((category) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="text-cream text-sm">{category}</span>
                </label>
              ))}
            </div>
            {selectedCategories.length === 0 && (
              <p className="text-red-400 text-xs mt-1">
                Select at least 1 category
              </p>
            )}
          </div>

          {/* Notification Toggles */}
          <div className="pt-4 border-t border-cream/5 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("emailNotifications")}
                className="w-4 h-4 accent-gold"
              />
              <span className="text-cream text-sm">Enable Email Notifications</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("smsNotifications")}
                className="w-4 h-4 accent-gold"
              />
              <span className="text-cream text-sm">Enable SMS Notifications</span>
            </label>
          </div>

          {/* Submit Message */}
          {submitMessage && (
            <div
              className={`p-4 rounded-lg text-sm ${
                submitMessage.type === "success"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {submitMessage.text}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-cream/5">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loading variant="inline" text="" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

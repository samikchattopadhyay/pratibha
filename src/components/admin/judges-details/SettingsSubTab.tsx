"use client";

import { useState, useEffect } from "react";
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
  maxEvaluationsPerDay: z.number().min(1, "Must be at least 1").max(50, "Maximum is 50"),
  restPeriodHours: z.number().min(0, "Must be at least 0").max(24, "Maximum is 24"),
  paymentPerEvaluation: z.number().min(0, "Must be at least 0").max(10000, "Maximum is 10000"),
  revenueShareLOCAL: z.number().min(0).max(100).nullable().optional(),
  revenueShareREGIONAL: z.number().min(0).max(100).nullable().optional(),
  revenueShareNATIONAL: z.number().min(0).max(100).nullable().optional(),
  revenueShareEXPERT: z.number().min(0).max(100).nullable().optional(),
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
  const [isLoading, setIsLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(JudgeSettingsSchema),
    defaultValues: {
      maxEvaluationsPerDay: 5,
      restPeriodHours: 8,
      paymentPerEvaluation: 150,
      revenueShareLOCAL: null,
      revenueShareREGIONAL: null,
      revenueShareNATIONAL: null,
      revenueShareEXPERT: null,
      preferredCategories: judge.specializations.length > 0 ? Array.from(judge.specializations) : [],
      emailNotifications: true,
      smsNotifications: false,
    },
  });

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/admin/judges/${judgeId}/settings`);
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        reset({
          maxEvaluationsPerDay: data.maxEvaluationsPerDay,
          restPeriodHours: data.restPeriodHours,
          paymentPerEvaluation: data.paymentPerEvaluation,
          revenueShareLOCAL: data.revenueShareByTier?.LOCAL ?? null,
          revenueShareREGIONAL: data.revenueShareByTier?.REGIONAL ?? null,
          revenueShareNATIONAL: data.revenueShareByTier?.NATIONAL ?? null,
          revenueShareEXPERT: data.revenueShareByTier?.EXPERT ?? null,
          preferredCategories: data.preferredCategories || [],
          emailNotifications: data.emailNotifications,
          smsNotifications: data.smsNotifications,
        });
      } catch (err) {
        console.error("[SettingsSubTab] Load error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [judgeId, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch(`/api/admin/judges/${judgeId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxEvaluationsPerDay: data.maxEvaluationsPerDay,
          restPeriodHours: data.restPeriodHours,
          paymentPerEvaluation: data.paymentPerEvaluation,
          revenueShareLOCAL: data.revenueShareLOCAL,
          revenueShareREGIONAL: data.revenueShareREGIONAL,
          revenueShareNATIONAL: data.revenueShareNATIONAL,
          revenueShareEXPERT: data.revenueShareEXPERT,
          preferredCategories: data.preferredCategories,
          emailNotifications: data.emailNotifications,
          smsNotifications: data.smsNotifications,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update settings");
      }

      setSubmitMessage({
        type: "success",
        text: "Settings updated successfully",
      });
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

  if (isLoading) {
    return (
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 flex justify-center items-center min-h-[400px]">
        <Loading variant="overlay" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Form Card */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6">
        <h3 className="font-serif text-xl font-bold text-cream mb-6">
          Judge Settings
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Availability Section */}
          <div className="pb-4 border-b border-cream/10">
            <h4 className="text-sm font-bold text-cream mb-4 uppercase tracking-wide">
              Availability & Capacity
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Max Evaluations Per Day */}
              <div>
                <label className="block text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
                  Max Evaluations Per Day
                </label>
                <input
                  type="number"
                  {...register("maxEvaluationsPerDay", { valueAsNumber: true })}
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
                  Rest Period Hours (after evaluations)
                </label>
                <input
                  type="number"
                  {...register("restPeriodHours", { valueAsNumber: true })}
                  className="w-full bg-charcoal border border-terracotta/20 rounded-xl px-4 py-2.5 text-cream placeholder-cream/35 focus:outline-none focus:border-gold"
                />
                {errors.restPeriodHours && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.restPeriodHours.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Compensation Section */}
          <div className="pb-4 border-b border-cream/10">
            <h4 className="text-sm font-bold text-cream mb-4 uppercase tracking-wide">
              Compensation & Payment
            </h4>

            {/* Payment Per Evaluation */}
            <div className="mb-4">
              <label className="block text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
                Payment Per Evaluation (₹)
              </label>
              <p className="text-xs text-cream/50 mb-2">
                Estimated based on judge tier: {judge.tier === "LOCAL" ? "₹100-150" : judge.tier === "REGIONAL" ? "₹200-300" : judge.tier === "NATIONAL" ? "₹400-500" : "₹600+"}
              </p>
              <div className="relative">
                <span className="absolute left-3 top-3 text-cream/60">₹</span>
                <input
                  type="number"
                  {...register("paymentPerEvaluation", { valueAsNumber: true })}
                  placeholder="e.g., 150"
                  className="w-full bg-charcoal border border-terracotta/20 rounded-xl pl-8 pr-4 py-2.5 text-cream placeholder-cream/35 focus:outline-none focus:border-gold"
                />
              </div>
              {errors.paymentPerEvaluation && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.paymentPerEvaluation.message}
                </p>
              )}
              <p className="text-xs text-cream/40 mt-2">
                💡 This is paid for each submission the judge evaluates
              </p>
            </div>

            {/* Revenue Share by Participant Tier */}
            <div>
              <label className="block text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
                Revenue Share (% of Participant Entry Fees)
              </label>
              <p className="text-xs text-cream/50 mb-4">
                Set different percentages based on the tier of participants this judge evaluates
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LOCAL */}
                <div>
                  <label className="block text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
                    LOCAL Tier Participants
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      {...register("revenueShareLOCAL", { valueAsNumber: true })}
                      placeholder="e.g., 20"
                      className="w-full bg-charcoal border border-terracotta/20 rounded-xl px-4 py-2.5 text-cream placeholder-cream/35 focus:outline-none focus:border-gold"
                    />
                    <span className="absolute right-3 top-3 text-cream/60">%</span>
                  </div>
                  {errors.revenueShareLOCAL && (
                    <p className="text-red-400 text-xs mt-1">{errors.revenueShareLOCAL.message}</p>
                  )}
                </div>

                {/* REGIONAL */}
                <div>
                  <label className="block text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
                    REGIONAL Tier Participants
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      {...register("revenueShareREGIONAL", { valueAsNumber: true })}
                      placeholder="e.g., 30"
                      className="w-full bg-charcoal border border-terracotta/20 rounded-xl px-4 py-2.5 text-cream placeholder-cream/35 focus:outline-none focus:border-gold"
                    />
                    <span className="absolute right-3 top-3 text-cream/60">%</span>
                  </div>
                  {errors.revenueShareREGIONAL && (
                    <p className="text-red-400 text-xs mt-1">{errors.revenueShareREGIONAL.message}</p>
                  )}
                </div>

                {/* NATIONAL */}
                <div>
                  <label className="block text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
                    NATIONAL Tier Participants
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      {...register("revenueShareNATIONAL", { valueAsNumber: true })}
                      placeholder="e.g., 50"
                      className="w-full bg-charcoal border border-terracotta/20 rounded-xl px-4 py-2.5 text-cream placeholder-cream/35 focus:outline-none focus:border-gold"
                    />
                    <span className="absolute right-3 top-3 text-cream/60">%</span>
                  </div>
                  {errors.revenueShareNATIONAL && (
                    <p className="text-red-400 text-xs mt-1">{errors.revenueShareNATIONAL.message}</p>
                  )}
                </div>

                {/* EXPERT */}
                <div>
                  <label className="block text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
                    EXPERT Tier Participants
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      {...register("revenueShareEXPERT", { valueAsNumber: true })}
                      placeholder="e.g., 75"
                      className="w-full bg-charcoal border border-terracotta/20 rounded-xl px-4 py-2.5 text-cream placeholder-cream/35 focus:outline-none focus:border-gold"
                    />
                    <span className="absolute right-3 top-3 text-cream/60">%</span>
                  </div>
                  {errors.revenueShareEXPERT && (
                    <p className="text-red-400 text-xs mt-1">{errors.revenueShareEXPERT.message}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-cream/40 mt-4">
                💡 Set to 0 to disable revenue sharing for that tier
              </p>
            </div>
          </div>

          {/* Preferred Categories */}
          <div className="pb-4 border-b border-cream/10">
            <h4 className="text-sm font-bold text-cream mb-4 uppercase tracking-wide">
              Category Preferences
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {AVAILABLE_CATEGORIES.map((category) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={category}
                    {...register("preferredCategories")}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="text-cream text-sm">{category}</span>
                </label>
              ))}
            </div>
            {errors.preferredCategories && (
              <p className="text-red-400 text-xs mt-2">
                {errors.preferredCategories.message}
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

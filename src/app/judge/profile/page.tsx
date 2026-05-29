"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Header from "@/components/Header";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import SettingsLayout, { SettingsSection } from "@/components/SettingsLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormError from "@/components/forms/FormError";

const JudgeProfileSchema = z.object({
  name: z.string().min(1, "Full name is required").max(100, "Name is too long"),
  specializations: z.array(z.string()).min(1, "Select at least one specialization"),
  profileImageUrl: z.string().optional().or(z.literal("")),
});

type JudgeProfileFormData = z.infer<typeof JudgeProfileSchema>;

export default function JudgeProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [email, setEmail] = useState("");
  const [assignmentCount, setAssignmentCount] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<JudgeProfileFormData>({
    resolver: zodResolver(JudgeProfileSchema),
    defaultValues: {
      name: "",
      specializations: [],
      profileImageUrl: "",
    },
  });

  const specializationsVal = watch("specializations", []);
  const profileImageUrlVal = watch("profileImageUrl", "");

  const [tagInput, setTagInput] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/judge/profile");
      if (response.ok) {
        const data = await response.json();
        setEmail(data.email);
        setAssignmentCount(data.assignmentCount);
        reset({
          name: data.name,
          specializations: data.specializations || [],
          profileImageUrl: data.profileImageUrl || "",
        });
      } else {
        setErrorMessage("Failed to load profile data");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      setErrorMessage("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      Promise.resolve().then(() => {
        fetchProfile();
      });
    }
  }, [status, router, fetchProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setValue("profileImageUrl", base64, { shouldValidate: true, shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !specializationsVal.includes(trimmed)) {
      setValue("specializations", [...specializationsVal, trimmed], { shouldValidate: true, shouldDirty: true });
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setValue("specializations", specializationsVal.filter((_, i) => i !== index), { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: JudgeProfileFormData) => {
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/judge/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          specializations: data.specializations,
          profileImage: data.profileImageUrl && data.profileImageUrl.startsWith("data:") ? data.profileImageUrl : null,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Profile updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const resData = await response.json();
        setErrorMessage(resData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setErrorMessage("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <Loading variant="screen" text="Loading profile..." />;
  }

  const sections: SettingsSection[] = [
    {
      id: "account",
      label: "Account",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-terracotta/10 dark:border-terracotta/20">
            <div className="w-24 h-24 rounded-full bg-terracotta/10 dark:bg-gold/10 border-2 border-terracotta/20 dark:border-gold/20 flex items-center justify-center overflow-hidden">
              {profileImageUrlVal ? (
                <img src={profileImageUrlVal} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-terracotta/40 dark:text-gold/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              )}
            </div>
            <label className="px-4 py-2 rounded-lg bg-terracotta/10 dark:bg-gold/10 text-terracotta dark:text-gold font-semibold text-sm cursor-pointer hover:bg-terracotta/20 dark:hover:bg-gold/20 transition-colors">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal/70 dark:text-cream/70 mb-2">
              Email (Read-only)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-terracotta/10 bg-terracotta/5 dark:bg-gold/5 text-charcoal dark:text-cream/70 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal dark:text-cream mb-2">
              Full Name
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-4 py-3 rounded-xl border border-terracotta/20 dark:border-terracotta/40 bg-white dark:bg-charcoal/50 text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:border-terracotta dark:focus:border-gold transition-colors"
            />
            <FormError error={errors.name?.message} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal/70 dark:text-cream/70 mb-2">
              Assignment Count
            </label>
            <div className="px-4 py-3 rounded-xl border border-terracotta/10 bg-terracotta/5 dark:bg-gold/5 text-charcoal dark:text-cream">
              {assignmentCount}
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      ),
    },
    {
      id: "specializations",
      label: "Specializations",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      content: (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-charcoal dark:text-cream mb-3">
              Add Specializations
            </label>
            <div className="mb-4 flex flex-wrap gap-2">
              {specializationsVal.map((spec, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-terracotta/10 dark:bg-gold/10 text-terracotta dark:text-gold text-sm font-bold"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="cursor-pointer hover:text-terracotta-light dark:hover:text-gold-light transition-colors"
                    aria-label="Remove specialization"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add specialization (press Enter or comma)"
                className="flex-1 px-4 py-3 rounded-xl border border-terracotta/20 dark:border-terracotta/40 bg-white dark:bg-charcoal/50 text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 focus:outline-none focus:border-terracotta dark:focus:border-gold transition-colors"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="secondary"
                size="md"
              >
                Add
              </Button>
            </div>
            <FormError error={errors.specializations?.message} />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal flex flex-col">
      <Header isAdmin={false} />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
              {errorMessage}
            </div>
          )}

          <SettingsLayout
            sections={sections}
            defaultSection="account"
          />
        </div>
      </main>
    </div>
  );
}

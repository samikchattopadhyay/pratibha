"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Copy, ExternalLink } from "lucide-react";
import Button from "@/components/Button";
import SlugInput from "./SlugInput";
import AddStudentWizard, { StudentFormData } from "./AddStudentWizard";
import ExternalAchievementModal from "./ExternalAchievementModal";
import CurationPanel from "./CurationPanel";

interface StudentProfile {
  id: string;
  name: string;
  slug?: string;
  dateOfBirth: string;
  gender: string;
  schoolClass: string | null;
  schoolName: string | null;
  city: string | null;
  state: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  disciplineInterests: string[];
  languages: string[];
  categoryGrouping: string[];
  trainingInstitutes: string[];
  specialSkills: string[];
  isPublic: boolean;
  externalAchievements: {
    id: string;
    title: string;
    eventName: string;
    category: string | null;
    year: number;
    rank: string | null;
    description: string | null;
    proofUrl: string | null;
  }[];
}

interface StudentManageLayoutProps {
  readonly student: StudentProfile;
  readonly categories: readonly { id: string; name: string; slug?: string | null; grouping?: string }[];
  readonly onRefresh?: () => void;
}

export default function StudentManageLayout({
  student: initialStudent,
  categories,
  onRefresh,
}: StudentManageLayoutProps) {
  const [student, setStudent] = useState(initialStudent);
  const [isEditWizardOpen, setIsEditWizardOpen] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isPublic, setIsPublic] = useState(student.isPublic);
  const [slug, setSlug] = useState(student.slug || "");
  const [slugAvailable, setSlugAvailable] = useState(!!student.slug);
  const [isSavingSlug, setIsSavingSlug] = useState(false);

  const refetchStudent = useCallback(async () => {
    try {
      const res = await fetch(`/api/account/students/${student.id}`);
      if (res.ok) {
        const updatedStudent = await res.json();
        setStudent(updatedStudent);
      }
    } catch (err) {
      console.error("Failed to refetch student:", err);
    }
  }, [student.id]);

  // Convert student to form data for edit
  const studentFormData: StudentFormData = {
    name: student.name,
    dateOfBirth: student.dateOfBirth,
    gender: student.gender,
    schoolClass: student.schoolClass || "",
    schoolName: student.schoolName || "",
    city: student.city || "",
    state: student.state || "",
    profileImageUrl: student.profileImageUrl || "",
    bio: student.bio || "",
    disciplineInterests: student.disciplineInterests,
    languages: student.languages,
    categoryGrouping: student.categoryGrouping,
    trainingInstitutes: student.trainingInstitutes,
    specialSkills: student.specialSkills,
  };

  const handleDeleteAchievement = useCallback(
    async (achievementId: string) => {
      if (!window.confirm("Are you sure you want to delete this achievement?")) return;

      try {
        const res = await fetch(
          `/api/account/students/${student.id}/external-achievements/${achievementId}`,
          { method: "DELETE" }
        );

        if (!res.ok) {
          const data = await res.json();
          alert(data.error || "Failed to delete achievement");
          return;
        }

        setSuccessMessage("Achievement deleted successfully");
        onRefresh?.();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error(err);
        alert("Failed to delete achievement");
      }
    },
    [student.id, onRefresh]
  );

  const handleTogglePublic = useCallback(async () => {
    try {
      const res = await fetch(`/api/account/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update profile visibility");
        return;
      }

      setIsPublic(!isPublic);
      setSuccessMessage(`Profile is now ${!isPublic ? "public" : "private"}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile visibility");
    }
  }, [student.id, isPublic]);

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const profilePath = student.slug || student.id;
    const link = `${window.location.origin}/profile/${profilePath}`;
    navigator.clipboard.writeText(link);
    setSuccessMessage("Profile link copied to clipboard!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleSaveSlug = useCallback(async () => {
    if (!slug || !slugAvailable) {
      alert("Please enter a valid, available slug");
      return;
    }

    setIsSavingSlug(true);
    try {
      const res = await fetch(`/api/account/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update slug");
        return;
      }

      const updatedStudent = await res.json();
      setStudent(updatedStudent);
      setSuccessMessage("Profile URL slug updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update slug");
    } finally {
      setIsSavingSlug(false);
    }
  }, [slug, slugAvailable, student.id]);

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-sm font-semibold rounded-lg">
          ✓ {successMessage}
        </div>
      )}

      {/* Section A: Edit Profile Wizard */}
      <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md space-y-4">
        <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream border-b border-terracotta/5 pb-2">
          ✏️ Edit Student Profile
        </h3>
        <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">
          Update your student's profile information, appearance details, and skills/training data.
        </p>
        <Button
          onClick={() => setIsEditWizardOpen(true)}
          variant="primary"
          size="md"
          className="font-bold"
        >
          <Edit2 className="w-4 h-4" /> Edit Profile
        </Button>
      </div>

      {/* Section A-A: Profile URL Slug */}
      <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md space-y-4">
        <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream border-b border-terracotta/5 pb-2">
          🔗 Personalized Profile URL
        </h3>
        <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">
          Choose a memorable URL slug for your student's public profile. This makes it easier to share!
        </p>
        <SlugInput
          value={slug}
          onChange={setSlug}
          onAvailabilityChange={setSlugAvailable}
          studentId={student.id}
          disabled={isSavingSlug}
          label="Profile URL Slug"
          showPreview
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSaveSlug}
            variant="primary"
            size="md"
            disabled={!slugAvailable || isSavingSlug || slug === (student.slug || "")}
            className="font-bold"
          >
            {isSavingSlug ? "Saving..." : "Save Profile URL"}
          </Button>
          <Button
            onClick={() => {
              const profileSlug = student.slug || student.id;
              const link = `${typeof window !== "undefined" ? window.location.origin : "https://pratibha.local"}/profile/${profileSlug}`;
              window.open(link, "_blank");
            }}
            variant="secondary"
            size="md"
            disabled={!student.slug}
            className="font-bold"
          >
            <ExternalLink className="w-4 h-4" /> Open Link
          </Button>
        </div>
      </div>

      {/* Section B: External Achievements Manager */}
      <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex justify-between items-center border-b border-terracotta/5 pb-2">
          <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream">
            ✍️ External Achievements
          </h3>
          <Button
            onClick={() => {
              setEditingAchievementId(null);
              setIsAchievementModalOpen(true);
            }}
            variant="secondary"
            size="md"
            className="font-bold"
          >
            <Plus className="w-4 h-4" /> Add Achievement
          </Button>
        </div>

        <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">
          These appear on your child's public profile. Showcase achievements from school competitions, cultural events, or other recognitions.
        </p>

        {student.externalAchievements.length === 0 ? (
          <div className="bg-cream-dark/5 dark:bg-charcoal rounded-lg border border-dashed border-terracotta/20 p-6 text-center text-charcoal/50 dark:text-cream/50 font-sans text-sm">
            No external achievements added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {student.externalAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-cream-dark/5 dark:bg-charcoal rounded-lg border border-terracotta/10 dark:border-terracotta/20 p-4 space-y-2"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-sans font-bold text-charcoal dark:text-cream text-sm">
                      {achievement.title}
                    </h4>
                    <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60">
                      {achievement.eventName} {achievement.category && `• ${achievement.category}`}
                    </p>
                    <p className="font-sans text-xs text-charcoal/50 dark:text-cream/50 mt-1">
                      {achievement.year}{achievement.rank && ` • ${achievement.rank}`}
                    </p>
                    {achievement.description && (
                      <p className="font-sans text-xs text-charcoal/70 dark:text-cream/70 italic mt-2">
                        {achievement.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingAchievementId(achievement.id);
                        setIsAchievementModalOpen(true);
                      }}
                      className="p-2 text-terracotta dark:text-gold hover:bg-terracotta/10 dark:hover:bg-gold/10 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAchievement(achievement.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section C: Public Profile Controls */}
      <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md space-y-4">
        <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream border-b border-terracotta/5 pb-2">
          🌐 Public Profile
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={handleTogglePublic}
              className="w-4 h-4 rounded border-terracotta/30 bg-cream dark:bg-charcoal cursor-pointer accent-terracotta dark:accent-gold"
            />
            <span className="font-sans text-sm font-medium text-charcoal dark:text-cream">
              Make this profile publicly visible
            </span>
          </label>

          <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60">
            {isPublic
              ? "Your child's profile is public and can be shared with anyone who has the link."
              : "Your child's profile is private. Only you can see it."}
          </p>
        </div>

        {isPublic && (
          <div className="bg-terracotta/5 dark:bg-gold/5 rounded-lg border border-terracotta/10 dark:border-gold/10 p-4 space-y-3">
            <p className="font-sans text-xs font-semibold text-charcoal dark:text-cream uppercase tracking-wider">
              Share Profile Link
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                suppressHydrationWarning
                value={`${typeof window !== "undefined" ? window.location.origin : "https://pratibha.local"}/profile/${student.slug || student.id}`}
                className="flex-1 h-9 bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded px-2 text-xs font-mono text-charcoal dark:text-cream focus:outline-none"
              />
              <Button
                onClick={handleCopyLink}
                variant="secondary"
                size="sm"
                className="font-bold"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Link href={`/profile/${student.slug || student.id}`} target="_blank">
              <Button
                variant="ghost"
                size="sm"
                className="w-full font-bold flex justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Preview Public Profile
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Section D: Achievement Curation */}
      {isPublic && (
        <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md">
          <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream border-b border-terracotta/5 pb-2 mb-4">
            ⭐ Achievement Curation
          </h3>
          <CurationPanel studentId={student.id} />
        </div>
      )}

      {/* Modals */}
      <AddStudentWizard
        isOpen={isEditWizardOpen}
        onClose={() => setIsEditWizardOpen(false)}
        onSuccess={() => {
          setIsEditWizardOpen(false);
          onRefresh?.();
        }}
        categories={categories}
        initialData={studentFormData}
        studentId={student.id}
      />

      <ExternalAchievementModal
        isOpen={isAchievementModalOpen}
        onClose={() => {
          setIsAchievementModalOpen(false);
          setEditingAchievementId(null);
        }}
        onSuccess={() => {
          setIsAchievementModalOpen(false);
          setEditingAchievementId(null);
          refetchStudent();
        }}
        studentId={student.id}
        achievementId={editingAchievementId || undefined}
      />
    </div>
  );
}

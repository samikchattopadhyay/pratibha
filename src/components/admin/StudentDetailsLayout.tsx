"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { StudentMetadata, SubTab } from "@/types/student-details";
import Loading from "@/components/Loading";
import OverviewSubTab from "@/components/admin/student-details/OverviewSubTab";
import CompetitionsSubTab from "@/components/admin/student-details/CompetitionsSubTab";
import AchievementsSubTab from "@/components/admin/student-details/AchievementsSubTab";

interface StudentDetailsLayoutProps {
  readonly student: StudentMetadata;
  readonly studentId: string;
}

function StudentDetailsContent({
  student,
  studentId,
}: StudentDetailsLayoutProps) {
  const searchParams = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const subtab = searchParams.get("subtab") as SubTab | null;
    const initial: SubTab =
      subtab && ["overview", "competitions", "achievements"].includes(subtab)
        ? subtab
        : "overview";

    Promise.resolve().then(() => {
      setActiveSubTab(initial);
      setMounted(true);
    });
  }, [searchParams]);

  const handleTabChange = (tab: SubTab) => {
    setActiveSubTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set("subtab", tab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  if (!mounted) return null;

  const age = Math.floor(
    (new Date().getTime() - new Date(student.dateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="flex-1 bg-charcoal p-6 md:p-8 overflow-y-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="space-y-2 pb-4 border-b border-terracotta/10">
        <p className="text-xs uppercase font-bold text-cream/40 tracking-wider">
          Admin Dashboard &gt; Participants
        </p>
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold text-cream truncate">
              {student.name}
            </h1>
            <p className="text-sm text-cream/50 mt-1">
              Student profile, competition history, and achievements
            </p>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-charcoal border border-gold/20 text-gold">
              {age} yrs
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
              student.gender.toLowerCase() === "male"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-pink-500/20 text-pink-400 border border-pink-500/30"
            }`}>
              {student.gender}
            </span>
          </div>
        </div>
      </div>

      {/* Container: Sidebar + Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT SIDEBAR: Sub-Tab Navigation */}
        <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-terracotta/15 pb-4 md:pb-0 md:pr-4 overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => handleTabChange("overview")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "overview"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            👤 Overview
          </button>
          <button
            onClick={() => handleTabChange("competitions")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "competitions"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            🏆 Competitions
          </button>
          <button
            onClick={() => handleTabChange("achievements")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "achievements"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            🎖️ Achievements
          </button>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 min-w-0">
          {activeSubTab === "overview" && (
            <OverviewSubTab student={student} studentId={studentId} />
          )}
          {activeSubTab === "competitions" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading competitions..." />}>
              <CompetitionsSubTab studentId={studentId} />
            </Suspense>
          )}
          {activeSubTab === "achievements" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading achievements..." />}>
              <AchievementsSubTab studentId={studentId} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentDetailsLayout(props: StudentDetailsLayoutProps) {
  return (
    <div className="min-h-screen bg-charcoal text-cream flex flex-col font-sans dark">
      <StudentDetailsContent {...props} />
    </div>
  );
}

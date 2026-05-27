"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { JudgeMetadata, SubTab } from "@/types/judges-details";
import Loading from "@/components/Loading";
import DetailsSubTab from "@/components/admin/judges-details/DetailsSubTab";
import ParticipantsSubTab from "@/components/admin/judges-details/ParticipantsSubTab";
import RevenueSubTab from "@/components/admin/judges-details/RevenueSubTab";
import SettingsSubTab from "@/components/admin/judges-details/SettingsSubTab";

interface JudgesDetailsLayoutProps {
  readonly judge: JudgeMetadata;
  readonly judgeId: string;
}

function JudgesDetailsContent({
  judge,
  judgeId,
}: JudgesDetailsLayoutProps) {
  const searchParams = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("details");
  const [mounted, setMounted] = useState(false);

  // ✅ Pattern: Sync URL → State on mount (back/forward support)
  useEffect(() => {
    const subtab = searchParams.get("subtab") as SubTab | null;
    const initial: SubTab =
      subtab && ["details", "participants", "revenue", "settings"].includes(subtab)
        ? subtab
        : "details";

    Promise.resolve().then(() => {
      setActiveSubTab(initial);
      setMounted(true);
    });
  }, [searchParams]);

  // ✅ Pattern: Tab change updates state AND URL
  const handleTabChange = (tab: SubTab) => {
    setActiveSubTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set("subtab", tab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 bg-charcoal p-6 md:p-8 overflow-y-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="space-y-2 pb-4 border-b border-terracotta/10">
        <p className="text-xs uppercase font-bold text-cream/40 tracking-wider">
          Admin Dashboard &gt; Judges
        </p>
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold text-cream truncate">
              {judge.name}
            </h1>
            <p className="text-sm text-cream/50 mt-1">
              Manage judge details, assigned participants, revenue, and preferences
            </p>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                judge.isActive
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {judge.isActive ? "Active" : "Inactive"}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-charcoal border border-gold/20 text-gold">
              {judge.tier}
            </span>
          </div>
        </div>
      </div>

      {/* Container: Sidebar + Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT SIDEBAR: Sub-Tab Navigation */}
        <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-terracotta/15 pb-4 md:pb-0 md:pr-4 overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => handleTabChange("details")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "details"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            ℹ️ Details
          </button>
          <button
            onClick={() => handleTabChange("participants")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "participants"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            👥 Participants
          </button>
          <button
            onClick={() => handleTabChange("revenue")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "revenue"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            💰 Revenue
          </button>
          <button
            onClick={() => handleTabChange("settings")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "settings"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 min-w-0">
          {activeSubTab === "details" && (
            <DetailsSubTab judge={judge} />
          )}
          {activeSubTab === "participants" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading participants..." />}>
              <ParticipantsSubTab judgeId={judgeId} />
            </Suspense>
          )}
          {activeSubTab === "revenue" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading revenue data..." />}>
              <RevenueSubTab judgeId={judgeId} />
            </Suspense>
          )}
          {activeSubTab === "settings" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading settings..." />}>
              <SettingsSubTab judge={judge} judgeId={judgeId} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JudgesDetailsLayout(props: JudgesDetailsLayoutProps) {
  return (
    <div className="min-h-screen bg-charcoal text-cream flex flex-col font-sans dark">
      <JudgesDetailsContent {...props} />
    </div>
  );
}

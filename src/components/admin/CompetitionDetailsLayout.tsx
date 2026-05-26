"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CompetitionMetadata, SubTab } from "@/types/competition-details";
import Loading from "@/components/Loading";
import ParticipantsSubTab from "@/components/admin/competition-details/ParticipantsSubTab";
import VotingSubTab from "@/components/admin/competition-details/VotingSubTab";
import CertificatesSubTab from "@/components/admin/competition-details/CertificatesSubTab";
import CourierShippingSubTab from "@/components/admin/competition-details/CourierShippingSubTab";

interface CompetitionDetailsLayoutProps {
  competition: CompetitionMetadata;
  competitionId: string;
}

function CompetitionDetailsContent({
  competition,
  competitionId,
}: CompetitionDetailsLayoutProps) {
  const searchParams = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("participants");
  const [mounted, setMounted] = useState(false);

  // Sync URL → State on mount and when URL changes (back/forward support)
  useEffect(() => {
    const subtab = searchParams.get("subtab") as SubTab;
    const initial =
      (subtab && ["participants", "voting", "certificates", "shipping"].includes(subtab)
        ? subtab
        : "participants") || "participants";
    Promise.resolve().then(() => {
      setActiveSubTab(initial);
      setMounted(true);
    });
  }, [searchParams]);

  // Handle sub-tab change: update state AND URL
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
          Admin Dashboard &gt; Competitions
        </p>
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold text-cream truncate">
              {competition.title}
            </h1>
            <p className="text-sm text-cream/50 mt-1">
              Manage participants, judges, certificates, and shipping for this competition
            </p>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                competition.isActive
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {competition.isActive ? "Active" : "Closed"}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-charcoal border border-gold/20 text-gold">
              {competition.scope === "NATIONAL" ? "National" : "State"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT SIDEBAR */}
        <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-terracotta/15 pb-4 md:pb-0 md:pr-4 overflow-x-auto md:overflow-x-visible">
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
            onClick={() => handleTabChange("voting")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "voting"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            ✓ Live Voting
          </button>
          <button
            onClick={() => handleTabChange("certificates")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "certificates"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            📜 Certificates
          </button>
          <button
            onClick={() => handleTabChange("shipping")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "shipping"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            🚚 Courier & Shipping
          </button>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 min-w-0">
          {activeSubTab === "participants" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading participants..." />}>
              <ParticipantsSubTab competitionId={competitionId} />
            </Suspense>
          )}
          {activeSubTab === "voting" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading voting data..." />}>
              <VotingSubTab competitionId={competitionId} />
            </Suspense>
          )}
          {activeSubTab === "certificates" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading certificates..." />}>
              <CertificatesSubTab competitionId={competitionId} />
            </Suspense>
          )}
          {activeSubTab === "shipping" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading shipping..." />}>
              <CourierShippingSubTab competitionId={competitionId} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompetitionDetailsLayout(
  props: CompetitionDetailsLayoutProps
) {
  return (
    <div className="min-h-screen bg-charcoal text-cream flex flex-col font-sans dark">
      <CompetitionDetailsContent {...props} />
    </div>
  );
}

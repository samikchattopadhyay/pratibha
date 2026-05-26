"use client";

import { AlertCircle, Sparkles } from "lucide-react";

export interface UrgentJudge {
  name: string;
  pendingCount: number;
}

export interface DailyRevenue {
  day: string;
  amount: number;
}

export interface HotspotState {
  state: string;
  percentage: number;
  count: number;
}

export interface OverviewDashboardData {
  operations?: {
    endedCompetitions?: string[];
    urgentJudges?: UrgentJudge[];
  };
  metrics?: {
    courierPending?: number;
    activeContests?: number;
    pendingJudging?: number;
    videosPostedToday?: number;
    pendingPayments?: number;
    certificatesGenerated?: number;
  };
  revenue?: {
    totalLast7Days?: number;
    daily?: DailyRevenue[];
  };
  hotspots?: HotspotState[];
}

export interface VotingEntry {
  studentName: string;
  category: string;
  velocityIndex: number;
  likes: number;
  comments: number;
}

interface OverviewTabProps {
  dashboardData: OverviewDashboardData | null;
  votingData: VotingEntry[];
  navigateToTab: (tab: string) => void;
  setFilter: (filter: string) => void;
}

export default function OverviewTab({
  dashboardData,
  votingData,
  navigateToTab,
  setFilter,
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      
      {/* TODAY'S OPERATIONS (MASTER CONTROL) */}
      <div className="bg-charcoal-light border border-terracotta/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2 className="font-serif text-lg font-bold">Today&apos;s Operations Command Center</h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold text-[9px] uppercase animate-pulse">Urgent Actions</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => navigateToTab("competitions")}
            className="p-4 bg-charcoal rounded-xl border border-red-500/10 space-y-2 cursor-pointer hover:bg-charcoal-light hover:border-red-500/30 transition-all select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigateToTab("competitions");
              }
            }}
          >
            <p className="text-sm uppercase text-cream/40 font-bold">Ended Competitions Queue</p>
            <p className="text-sm font-bold text-cream truncate">
              {dashboardData?.operations?.endedCompetitions && dashboardData.operations.endedCompetitions.length > 0
                ? dashboardData.operations.endedCompetitions.join(", ")
                : "No ended competitions"}
            </p>
            <p className="text-sm text-yellow-400">Needs final scoring calculation & certificate freeze</p>
          </div>
          <div 
            onClick={() => navigateToTab("judges")}
            className="p-4 bg-charcoal rounded-xl border border-yellow-500/10 space-y-2 cursor-pointer hover:bg-charcoal-light hover:border-yellow-500/30 transition-all select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigateToTab("judges");
              }
            }}
          >
            <p className="text-sm uppercase text-cream/40 font-bold">Pending Examiner Backlogs</p>
            <div className="space-y-1">
              {dashboardData?.operations?.urgentJudges && dashboardData.operations.urgentJudges.length > 0 ? (
                dashboardData.operations.urgentJudges.map((j: UrgentJudge, idx: number) => (
                  <p key={idx} className="text-sm font-bold text-cream truncate">
                    {j.name} ({j.pendingCount} pending)
                  </p>
                ))
              ) : (
                <p className="text-sm font-bold text-cream">No backlogged judges</p>
              )}
            </div>
            <p className="text-sm text-red-400">Submissions pending over 48h limit</p>
          </div>
          <div 
            onClick={() => navigateToTab("courier")}
            className="p-4 bg-charcoal rounded-xl border border-green-500/10 space-y-2 cursor-pointer hover:bg-charcoal-light hover:border-green-500/30 transition-all select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigateToTab("courier");
              }
            }}
          >
            <p className="text-sm uppercase text-cream/40 font-bold">Courier Operations Queue</p>
            <p className="text-sm font-bold text-cream">{dashboardData?.metrics?.courierPending || 0} Merit Trophies ready</p>
            <p className="text-sm text-green-400">Pending label print batches</p>
          </div>
        </div>
      </div>

      {/* LIVE COMPETITION STATUS CARD GRID */}
      <div className="space-y-3">
        <h3 className="font-serif text-base font-bold">Live Status Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: "Active Contests", val: dashboardData?.metrics?.activeContests || 0, color: "text-gold", tab: "competitions" },
            { label: "Pending Judging", val: dashboardData?.metrics?.pendingJudging || 0, color: "text-yellow-400", tab: "judges" },
            { label: "Videos Posted Today", val: `+${dashboardData?.metrics?.videosPostedToday || 0}`, color: "text-green-400", tab: "voting" },
            { label: "Pending Payments", val: dashboardData?.metrics?.pendingPayments || 0, color: "text-red-400", tab: "participants", filter: "PENDING" },
            { label: "Certificates Generated", val: dashboardData?.metrics?.certificatesGenerated || 0, color: "text-blue-400", tab: "certificates" },
            { label: "Courier Pending", val: dashboardData?.metrics?.courierPending || 0, color: "text-orange-400", tab: "courier" }
          ].map((stat, idx) => (
            <div
              key={idx}
              onClick={() => {
                navigateToTab(stat.tab);
                if (stat.filter) setFilter(stat.filter);
              }}
              className="bg-charcoal-light border border-terracotta/15 rounded-xl p-4 space-y-1 cursor-pointer hover:border-terracotta/40 hover:bg-charcoal transition-all select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigateToTab(stat.tab);
                  if (stat.filter) setFilter(stat.filter);
                }
              }}
            >
              <span className="text-[9px] uppercase tracking-wider text-cream/40 font-bold">{stat.label}</span>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* REVENUE PREVIEW AND RECENT ACTIVITY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SVG Revenue Preview */}
        <div
          onClick={() => navigateToTab("finance")}
          className="lg:col-span-8 bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-4 cursor-pointer hover:border-terracotta/40 hover:bg-charcoal transition-all select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigateToTab("finance");
            }
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold">Revenue Intake Trend (Last 7 Days)</h3>
            <span className="text-sm font-bold text-green-400">Total: ₹{dashboardData?.revenue?.totalLast7Days || 0}</span>
          </div>
          
          {/* SVG Chart */}
          <div className="h-48 w-full bg-charcoal rounded-xl p-2 relative flex items-end">
            <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="#b23b1e" strokeOpacity="0.05" strokeWidth="0.5" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="#b23b1e" strokeOpacity="0.05" strokeWidth="0.5" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#b23b1e" strokeOpacity="0.05" strokeWidth="0.5" />
              
              {/* Area Under Curve */}
              <path 
                d="M 0 50 Q 15 35 30 30 T 60 20 T 90 10 L 100 50 Z" 
                fill="url(#revenue-grad)" 
                opacity="0.15" 
              />
              {/* Line Curve */}
              <path 
                d="M 0 50 Q 15 35 30 30 T 60 20 T 90 10 L 100 10" 
                fill="none" 
                stroke="#d4af37" 
                strokeWidth="1.5" 
              />
              
              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#b23b1e" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* SVG Tooltip Markers */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-charcoal-light border border-gold/40 text-[9px] px-2 py-1 rounded font-bold">
              7-day aggregate revenue
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-sm md:text-sm font-bold text-cream/60 pt-2">
            {dashboardData?.revenue?.daily?.map((d: DailyRevenue, idx: number) => (
              <div key={idx} className="truncate">{d.day} (₹{d.amount})</div>
            ))}
          </div>
        </div>

        {/* AI Insights & Alerts */}
        <div className="lg:col-span-4 bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif text-base font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-gold" /> AI Insights Panel
          </h3>
          <div className="space-y-3 text-sm">
            <div
              onClick={() => navigateToTab("judges")}
              className="p-3 bg-charcoal rounded-lg border-l-2 border-gold cursor-pointer hover:bg-charcoal-light hover:border-gold/50 transition-all select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigateToTab("judges");
                }
              }}
            >
              <p className="font-bold text-gold">Category Surge</p>
              <p className="text-sm text-cream/70 mt-0.5">Recitation submissions have surged. Consider increasing examiner capacity.</p>
            </div>
            <div
              onClick={() => navigateToTab("finance")}
              className="p-3 bg-charcoal rounded-lg border-l-2 border-green-500 cursor-pointer hover:bg-charcoal-light hover:border-green-500/50 transition-all select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigateToTab("finance");
                }
              }}
            >
              <p className="font-bold text-green-400">High Conversion Cohort</p>
              <p className="text-sm text-cream/70 mt-0.5">Parents show strong interest in medal upgrade options.</p>
            </div>
            <div
              onClick={() => navigateToTab("finance")}
              className="p-3 bg-charcoal rounded-lg border-l-2 border-terracotta cursor-pointer hover:bg-charcoal-light hover:border-terracotta/50 transition-all select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigateToTab("finance");
                }
              }}
            >
              <p className="font-bold text-terracotta">Pricing Optimization</p>
              <p className="text-sm text-cream/70 mt-0.5">Upsells at standard ₹50-100 show zero friction; recommend scaling availability.</p>
            </div>
          </div>
        </div>

      </div>

      {/* PEOPLE'S CHOICE PREVIEW & GLOBAL TALENT MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Facebook Scraper Stats */}
        <div
          onClick={() => navigateToTab("voting")}
          className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-4 cursor-pointer hover:border-terracotta/40 hover:bg-charcoal transition-all select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigateToTab("voting");
            }
          }}
        >
          <h3 className="font-serif text-base font-bold">Facebook Viral Engine Tracker</h3>
          <div className="space-y-3">
            {votingData && votingData.length > 0 ? (
              votingData.slice(0, 3).map((entry: VotingEntry, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-charcoal rounded-xl border border-terracotta/5">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-sm font-bold truncate">{entry.studentName} ({entry.category})</p>
                    <p className="text-sm text-cream/40">Engagement Index: {entry.velocityIndex}</p>
                  </div>
                  <div className="text-right text-sm font-bold text-gold shrink-0">
                    <p>{entry.likes} Likes</p>
                    <p className="text-cream/50">{entry.comments} Comments</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-cream/50">No Facebook scraper data synced.</p>
            )}
          </div>
        </div>

        {/* SVG Global Talent Map Preview */}
        <div
          onClick={() => navigateToTab("participants")}
          className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-4 cursor-pointer hover:border-terracotta/40 hover:bg-charcoal transition-all select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigateToTab("participants");
            }
          }}
        >
          <h3 className="font-serif text-base font-bold">Global Enrollment Hotspots</h3>
          <div className="h-40 bg-charcoal rounded-xl relative overflow-hidden flex items-center justify-center border border-terracotta/10">
            
            {/* SVG Map Representation */}
            <svg className="w-full h-full max-w-xs opacity-40" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#b23b1e" strokeWidth="0.5" strokeDasharray="2 2" />
              <circle cx="30" cy="40" r="4" fill="#d4af37" className="animate-ping" />
              <circle cx="30" cy="40" r="3" fill="#d4af37" />
              <circle cx="70" cy="45" r="4" fill="#b23b1e" className="animate-ping" />
              <circle cx="70" cy="45" r="3" fill="#b23b1e" />
              <circle cx="52" cy="70" r="3" fill="#d4af37" />
              <circle cx="48" cy="25" r="2" fill="#b23b1e" />
            </svg>

            <div className="absolute top-2 left-2 bg-charcoal-light/80 p-2 rounded text-[9px] font-semibold border border-terracotta/10 space-y-1">
              {dashboardData?.hotspots?.map((h: HotspotState, idx: number) => (
                <p key={idx} className={idx === 0 ? "text-gold" : "text-cream/70"}>
                  📍 {h.state} ({h.percentage}%): {h.count} enrolled
                </p>
              )) || <p className="text-[9px] text-cream/40">No hotspots data loaded</p>}
            </div>

            <div className="absolute bottom-2 right-2 text-xs text-cream/40 font-bold uppercase tracking-wider">
              Interactive Map Overlay
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

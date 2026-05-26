"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import {
  Check, Award, FileText, Plus,
  RefreshCw, Truck
} from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import OverviewTab, { OverviewDashboardData } from "@/components/admin/OverviewTab";
import CompetitionsTab, { Competition } from "@/components/admin/CompetitionsTab";
import ParticipantsTab, { Judge, Registration } from "@/components/admin/ParticipantsTab";
import JudgesTab, { KanbanCard } from "@/components/admin/JudgesTab";
import VotingTab, { VotingCard } from "@/components/admin/VotingTab";
import CertificatesTab, { CertificateMetrics } from "@/components/admin/CertificatesTab";
import CourierTab from "@/components/admin/CourierTab";
import FinanceTab, { FinanceReport } from "@/components/admin/FinanceTab";
import FacebookTab from "@/components/admin/FacebookTab";
import SettingsTab from "@/components/admin/SettingsTab";
import CreateCompetitionWizard from "@/components/admin/CreateCompetitionWizard";

const mockJudges = [
  { id: "j1", name: "Prof. Swapna Sen (Recitation Scholar)" },
  { id: "j2", name: "Pandit Debojyoti Bose (Classical Musician)" },
  { id: "j3", name: "Smt. Mamata Shankar (Classical Dance)" }
];

const mockRegistrations = [
  {
    id: "reg-1",
    registrationId: "PP-2026-REC-0021",
    studentName: "Bhaskar Chattopadhyay",
    competitionTitle: "Borsha Bodhon 2026",
    categoryName: "Bengali Recitation",
    fbPostUrl: "https://facebook.com/groups/pratibhaparishad/posts/12345",
    paymentStatus: "SUCCESS",
    status: "VERIFIED",
    assignments: [
      { id: "a1", judgeName: "Prof. Swapna Sen (Recitation Scholar)", isSubmitted: true, score: 85 }
    ]
  },
  {
    id: "reg-2",
    registrationId: "PP-2026-ART-0098",
    studentName: "Pooja Chattopadhyay",
    competitionTitle: "Chitra Kala 2026",
    categoryName: "Drawing",
    fbPostUrl: "https://facebook.com/groups/pratibhaparishad/posts/54321",
    paymentStatus: "SUCCESS",
    status: "PENDING_VERIFICATION",
    assignments: []
  },
  {
    id: "reg-3",
    registrationId: "PP-2026-REC-0099",
    studentName: "Arnav Mukherjee",
    competitionTitle: "Borsha Bodhon 2026",
    categoryName: "Bengali Recitation",
    fbPostUrl: "https://facebook.com/groups/pratibhaparishad/posts/99881",
    paymentStatus: "PENDING",
    status: "PENDING_VERIFICATION",
    assignments: []
  }
];

function AdminDashboardContent() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "dashboard";

  // Navigation and UI states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [statusMessage, setStatusMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Data table states
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Pagination & metrics state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isUsingMock, setIsUsingMock] = useState(false);

  // Tab-specific pagination states
  const [competitionsPage, setCompetitionsPage] = useState(1);
  const [competitionsTotalCount, setCompetitionsTotalCount] = useState(0);
  const [competitionsTotalPages, setCompetitionsTotalPages] = useState(1);
  const [votingPage, setVotingPage] = useState(1);
  const [votingTotalCount, setVotingTotalCount] = useState(0);
  const [votingTotalPages, setVotingTotalPages] = useState(1);
  const [financePage, setFinancePage] = useState(1);
  const [financeTotalCount, setFinanceTotalCount] = useState(0);
  const [financeTotalPages, setFinanceTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Kanban column pagination states
  const [kanbanPendingPage, setKanbanPendingPage] = useState(1);
  const [kanbanInReviewPage, setKanbanInReviewPage] = useState(1);
  const [kanbanCompletedPage, setKanbanCompletedPage] = useState(1);
  const [kanbanConflictPage, setKanbanConflictPage] = useState(1);

  // Tab-specific live states
  const [dashboardData, setDashboardData] = useState<OverviewDashboardData | null>(null);
  const [competitionsList, setCompetitionsList] = useState<Competition[]>([]);
  const [votingData, setVotingData] = useState<VotingCard[]>([]);
  const [certificateMetrics, setCertificateMetrics] = useState<CertificateMetrics | null>(null);
  const [financeReport, setFinanceReport] = useState<FinanceReport | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState("https://api.whatsapp.com/v1/messages");
  const [fbInterval, setFbInterval] = useState("30");

  // Kanban Judges State
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>([]);

  // Competition wizard states
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string; grouping?: string | null; icon?: string | null }[]>([]);
  const [bannerTemplates, setBannerTemplates] = useState<{ id: string; name: string; slug: string; imageUrl: string; description: string | null; tags: string[]; isActive: boolean; createdAt: Date; updatedAt: Date }[]>([]);

  // Force dark theme on admin dashboard mount (aligning with parent dashboard design)
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  // Sync active tab from URL search params
  useEffect(() => {
    Promise.resolve().then(() => {
      setActiveTab(tabFromUrl);
    });
  }, [tabFromUrl]);

  // Show Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Navigate to a tab with URL update
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    router.push(`/admin/dashboard?tab=${tab}`);
  };

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to first page when filtering or searching
  useEffect(() => {
    Promise.resolve().then(() => {
      setCurrentPage(1);
    });
  }, [filter, debouncedSearch]);

  // Dynamic loaders for workspaces
  const loadDashboardMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (res.ok) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Dashboard metrics load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCompetitions = useCallback(async (page: number, limitVal: number) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limitVal.toString(),
      });
      const res = await fetch(`/api/admin/competitions?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setCompetitionsList(data.competitions);
        setCompetitionsTotalCount(data.pagination.totalCount);
        setCompetitionsTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Competitions load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadKanbanCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kanban");
      const data = await res.json();
      if (res.ok) {
        setKanbanCards(data.cards);
      }
    } catch (err) {
      console.error("Kanban cards load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVoting = useCallback(async (page: number, limitVal: number) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limitVal.toString(),
      });
      const res = await fetch(`/api/admin/facebook?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setVotingData(data.metrics);
        setVotingTotalCount(data.pagination.totalCount);
        setVotingTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Voting load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/certificates");
      const data = await res.json();
      if (res.ok) {
        setCertificateMetrics(data);
      }
    } catch (err) {
      console.error("Certificates load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFinance = useCallback(async (page: number, limitVal: number) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limitVal.toString(),
      });
      const res = await fetch(`/api/admin/finance?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setFinanceReport(data);
        setFinanceTotalCount(data.pagination.totalCount);
        setFinanceTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Finance load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok) {
        setWhatsappUrl(data.config.whatsAppApiUrl);
        setFbInterval(data.config.fbScrapeIntervalMinutes);
      }
    } catch (err) {
      console.error("Settings load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (res.ok && data.categories) {
        setDbCategories(data.categories);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  const loadBannerTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/banner-templates");
      const data = await res.json();
      if (res.ok && data.templates) {
        setBannerTemplates(data.templates);
      }
    } catch (err) {
      console.error("Failed to load banner templates:", err);
    }
  }, []);

  const handleAddCategory = async (name: string, grouping: string) => {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, grouping }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to add category");
    }
    triggerToast(`Category specialization "${name}" added successfully!`);
    await loadCategories();
  };

  const handleAddBannerTemplate = async (
    name: string,
    imageUrl: string,
    description: string,
    tags: string[]
  ) => {
    const res = await fetch("/api/admin/banner-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, imageUrl, description, tags }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to add banner template");
    }
    triggerToast(`Banner template "${name}" added successfully!`);
    await loadBannerTemplates();
  };

  const loadAdminData = useCallback(async (page: number, limitVal: number, searchVal: string, filterVal: string) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limitVal.toString(),
        search: searchVal,
        filter: filterVal,
      });
      const regRes = await fetch(`/api/admin/registrations?${query.toString()}`);
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.error || "Failed to load registrations");

      const judgeRes = await fetch("/api/admin/judges");
      const judgeData = await judgeRes.json();
      if (!judgeRes.ok) throw new Error(judgeData.error || "Failed to load judges");
      setJudges(judgeData.judges);

      setRegistrations(regData.registrations);
      setTotalCount(regData.pagination.totalCount);
      setTotalPages(regData.pagination.totalPages);
      setIsUsingMock(false);
    } catch (err) {
      console.warn("Loading mock data fallback. Database connection could be unconfigured.", err);
      setIsUsingMock(true);
      setJudges(mockJudges);

      const filtered = mockRegistrations.filter(reg => {
        const matchesSearch =
          reg.studentName.toLowerCase().includes(searchVal.toLowerCase()) ||
          reg.registrationId.toLowerCase().includes(searchVal.toLowerCase()) ||
          reg.categoryName.toLowerCase().includes(searchVal.toLowerCase());

        if (!matchesSearch) return false;

        if (filterVal === "ALL") return true;
        if (filterVal === "PENDING") return reg.status === "PENDING_VERIFICATION";
        if (filterVal === "PAID") return reg.paymentStatus === "SUCCESS";
        if (filterVal === "UNASSIGNED") return reg.assignments.length === 0;

        return true;
      });

      const start = (page - 1) * limitVal;
      const paginated = filtered.slice(start, start + limitVal);

      setRegistrations(paginated);
      setTotalCount(filtered.length);
      setTotalPages(Math.ceil(filtered.length / limitVal));
    } finally {
      setLoading(false);
    }
  }, []);

  // Run tab-specific loader
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      Promise.resolve().then(() => {
        if (activeTab === "dashboard") {
          loadDashboardMetrics();
        } else if (activeTab === "competitions") {
          loadCompetitions(competitionsPage, itemsPerPage);
          loadCategories();
          loadBannerTemplates();
        } else if (activeTab === "participants") {
          loadAdminData(currentPage, limit, debouncedSearch, filter);
        } else if (activeTab === "judges") {
          loadKanbanCards();
        } else if (activeTab === "voting") {
          loadVoting(votingPage, itemsPerPage);
        } else if (activeTab === "certificates") {
          loadCertificates();
        } else if (activeTab === "finance") {
          loadFinance(financePage, itemsPerPage);
        } else if (activeTab === "settings") {
          loadSettings();
          loadCategories();
          loadBannerTemplates();
        }
      });
    }
  }, [
    activeTab,
    sessionStatus,
    currentPage,
    limit,
    debouncedSearch,
    filter,
    competitionsPage,
    votingPage,
    financePage,
    itemsPerPage,
    loadDashboardMetrics,
    loadCompetitions,
    loadAdminData,
    loadKanbanCards,
    loadVoting,
    loadCertificates,
    loadFinance,
    loadSettings,
    loadCategories,
    loadBannerTemplates
  ]);

  // Auth & Roles Redirect Router
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    } else if (sessionStatus === "authenticated") {
      const customUser = session.user as { role?: string; id?: string };
      const role = customUser.role;
      if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
        router.push("/parent/dashboard");
      }
    }
  }, [sessionStatus, session, router]);

  // Sync participants table on parameters change
  useEffect(() => {
    if (sessionStatus === "authenticated" && activeTab === "participants") {
      Promise.resolve().then(() => {
        loadAdminData(currentPage, limit, debouncedSearch, filter);
      });
    }
  }, [sessionStatus, currentPage, limit, debouncedSearch, filter, activeTab, loadAdminData]);

  const handleAssignJudge = async (registrationId: string, judgeId: string) => {
    if (!judgeId) return;
    setStatusMessage("Assigning judge...");

    if (isUsingMock) {
      const judge = judges.find(j => j.id === judgeId);
      if (!judge) return;

      setRegistrations(prev =>
        prev.map(reg => {
          if (reg.id === registrationId) {
            return {
              ...reg,
              assignments: [
                ...reg.assignments,
                { id: "mock-a-" + Math.random(), judgeName: judge.name, isSubmitted: false, score: null }
              ]
            };
          }
          return reg;
        })
      );
      setStatusMessage("Judge assigned in sandbox mode.");
      setTimeout(() => setStatusMessage(""), 2000);
      return;
    }

    try {
      const res = await fetch("/api/admin/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, judgeId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to assign judge");
      } else {
        setStatusMessage("Judge assigned successfully!");
        loadAdminData(currentPage, limit, debouncedSearch, filter);
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting server.");
    } finally {
      setTimeout(() => setStatusMessage(""), 2000);
    }
  };

  const handleVerifyEntry = async (registrationId: string) => {
    setStatusMessage("Updating status...");
    if (isUsingMock) {
      setRegistrations(prev =>
        prev.map(reg => {
          if (reg.id === registrationId) {
            return { ...reg, status: "VERIFIED" };
          }
          return reg;
        })
      );
      setStatusMessage("Entry marked verified in sandbox.");
      setTimeout(() => setStatusMessage(""), 2000);
      return;
    }

    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: registrationId, status: "VERIFIED" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage("Entry verified successfully.");
      triggerToast("Entry approved & marked verified.");
      loadAdminData(currentPage, limit, debouncedSearch, filter);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Failed to verify entry";
      alert(errMsg);
    } finally {
      setTimeout(() => setStatusMessage(""), 2000);
    }
  };

  const moveKanbanCard = async (cardId: string, nextStatus: string) => {
    let action = "";
    if (nextStatus === "PENDING") action = "re-queue";
    if (nextStatus === "IN_REVIEW") action = "review";
    if (nextStatus === "COMPLETED") action = "approve";

    if (!action) return;

    setStatusMessage(`Moving card: ${action}...`);
    try {
      const res = await fetch("/api/admin/kanban", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: cardId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      triggerToast(`Moved applicant: ${action.replace("-", " ")}`);
      loadKanbanCards();
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Failed to move Kanban card";
      alert(errMsg);
    } finally {
      setStatusMessage("");
    }
  };

  const handleBulkGenerateCertificates = async () => {
    setStatusMessage("Generating certificates...");
    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      triggerToast(data.message || "Certificates generated successfully.");
      loadCertificates();
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Failed to generate certificates";
      alert(errMsg);
    } finally {
      setStatusMessage("");
    }
  };

  const handleSaveSettings = async () => {
    setStatusMessage("Saving configurations...");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsAppApiUrl: whatsappUrl,
          fbScrapeIntervalMinutes: fbInterval,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.config);

      triggerToast("Configuration parameters persisted successfully.");
      loadSettings();
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setStatusMessage("");
    }
  };

  const handleExportCSV = () => {
    if (!financeReport || !financeReport.transactions) return;
    const headers = ["Order ID", "Payment ID", "Student Name", "Parent Name", "Amount (INR)", "Status", "Date"];
    const rows = financeReport.transactions.map((tx) => [
      tx.orderId,
      tx.paymentId || "",
      tx.studentName,
      tx.parentName,
      tx.amount.toString(),
      tx.status,
      new Date(tx.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e: string[]) => e.map((val: string) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pratibha_finance_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Finance CSV exported successfully.");
  };

  if (sessionStatus === "loading") {
    return <Loading variant="screen" text="Authenticating..." />;
  }

  return (
    <div className="min-h-screen bg-charcoal text-cream flex flex-col font-sans">
      <Header isAdmin={true} />

      {/* Main Container */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          navigateToTab={navigateToTab}
        />

        <main className="flex-1 bg-charcoal p-6 md:p-8 overflow-y-auto space-y-6 relative">
          {loading && <Loading variant="overlay" text="Loading workspace..." />}
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 bg-gold text-charcoal px-4 py-3 rounded-lg shadow-xl font-bold flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4" /> {toastMessage}
            </div>
          )}

          {/* Quick Action bar & Status */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-terracotta/10">
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-wide capitalize">
                {activeTab.replace("-", " ")} Workspace
              </h1>
              <p className="font-sans text-sm text-cream/50">
                Logged in as Council Super Admin | Security Clear: Superuser
              </p>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setShowCreateWizard(true);
                }}
                variant="primary"
                size="md"
              >
                <Plus className="w-3.5 h-3.5" /> Create Competition
              </Button>
              <Button
                onClick={() => navigateToTab("certificates")}
                variant="outline"
                size="md"
              >
                <FileText className="w-3.5 h-3.5" /> Generate Certificates
              </Button>
              <Button
                onClick={() => navigateToTab("courier")}
                variant="outline"
                size="md"
              >
                <Truck className="w-3.5 h-3.5" /> Request Courier
              </Button>
              <Button
                onClick={() => navigateToTab("voting")}
                variant="outline"
                size="md"
              >
                <Award className="w-3.5 h-3.5" /> Publish Results
              </Button>
            </div>
          </div>

          {/* Status Alert Banner */}
          {(statusMessage || isUsingMock) && (
            <div className="p-3 bg-terracotta/10 border border-terracotta/20 text-gold text-sm font-bold rounded-lg flex items-center justify-between">
              <span>{statusMessage || "⚠️ Database connection offline/unseeded. Running in Local Sandbox fallback."}</span>
              <Button
                onClick={() => loadAdminData(currentPage, limit, debouncedSearch, filter)}
                variant="ghost"
                size="md"
                className="h-auto"
              >
                <RefreshCw className="w-3 h-3 animate-spin" /> Retry Link
              </Button>
            </div>
          )}

          {/* TAB CONTENT 1: HOME DASHBOARD */}
          {activeTab === "dashboard" && (
            <OverviewTab
              dashboardData={dashboardData}
              votingData={votingData}
              navigateToTab={navigateToTab}
              setFilter={setFilter}
            />
          )}

          {/* TAB CONTENT 2: COMPETITIONS MANAGEMENT */}
          {activeTab === "competitions" && (
            <CompetitionsTab
              competitionsList={competitionsList}
              competitionsPage={competitionsPage}
              setCompetitionsPage={setCompetitionsPage}
              itemsPerPage={itemsPerPage}
              setShowCreateModal={setShowCreateWizard}
              totalCount={competitionsTotalCount}
              totalPages={competitionsTotalPages}
            />
          )}

          {/* TAB CONTENT 3: PARTICIPANTS & SUBMISSIONS */}
          {activeTab === "participants" && (
            <ParticipantsTab
              registrations={registrations}
              loading={loading}
              filter={filter}
              setFilter={setFilter}
              search={search}
              setSearch={setSearch}
              judges={judges}
              handleVerifyEntry={handleVerifyEntry}
              handleAssignJudge={handleAssignJudge}
              limit={limit}
              setLimit={setLimit}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalCount={totalCount}
              totalPages={totalPages}
              navigateToTab={navigateToTab}
            />
          )}

          {/* TAB CONTENT 4: JUDGE OPERATIONS & KANBAN */}
          {activeTab === "judges" && (
            <JudgesTab
              judges={judges}
              registrations={registrations}
              kanbanCards={kanbanCards}
              itemsPerPage={itemsPerPage}
              kanbanPendingPage={kanbanPendingPage}
              setKanbanPendingPage={setKanbanPendingPage}
              kanbanInReviewPage={kanbanInReviewPage}
              setKanbanInReviewPage={setKanbanInReviewPage}
              kanbanCompletedPage={kanbanCompletedPage}
              setKanbanCompletedPage={setKanbanCompletedPage}
              kanbanConflictPage={kanbanConflictPage}
              setKanbanConflictPage={setKanbanConflictPage}
              navigateToTab={navigateToTab}
              setSearch={setSearch}
              moveKanbanCard={moveKanbanCard}
            />
          )}

          {/* TAB CONTENT 5: LIVE VOTING & PEOPLES CHOICE */}
          {activeTab === "voting" && (
            <VotingTab
              votingData={votingData}
              votingPage={votingPage}
              setVotingPage={setVotingPage}
              itemsPerPage={itemsPerPage}
              navigateToTab={navigateToTab}
              setSearch={setSearch}
              totalCount={votingTotalCount}
              totalPages={votingTotalPages}
            />
          )}

          {/* TAB CONTENT 6: CERTIFICATES QUEUE */}
          {activeTab === "certificates" && (
            <CertificatesTab
              certificateMetrics={certificateMetrics}
              handleBulkGenerateCertificates={handleBulkGenerateCertificates}
              navigateToTab={navigateToTab}
              setFilter={setFilter}
            />
          )}

          {/* TAB CONTENT 7: COURIER & LOGISTICS */}
          {activeTab === "courier" && (
            <CourierTab
              dashboardData={dashboardData}
              triggerToast={triggerToast}
            />
          )}

          {/* TAB CONTENT 8: DETAILED FINANCE */}
          {activeTab === "finance" && (
            <FinanceTab
              financeReport={financeReport}
              financePage={financePage}
              setFinancePage={setFinancePage}
              itemsPerPage={itemsPerPage}
              handleExportCSV={handleExportCSV}
              navigateToTab={navigateToTab}
              setSearch={setSearch}
              totalCount={financeTotalCount}
              totalPages={financeTotalPages}
            />
          )}

          {/* TAB CONTENT 9: FACEBOOK SCRAPERS */}
          {activeTab === "facebook" && (
            <FacebookTab fbInterval={fbInterval} />
          )}

          {/* TAB CONTENT 10: SETTINGS */}
          {activeTab === "settings" && (
            <SettingsTab
              whatsappUrl={whatsappUrl}
              setWhatsappUrl={setWhatsappUrl}
              fbInterval={fbInterval}
              setFbInterval={setFbInterval}
              handleSaveSettings={handleSaveSettings}
              categories={dbCategories}
              handleAddCategory={handleAddCategory}
              bannerTemplates={bannerTemplates}
              handleAddBannerTemplate={handleAddBannerTemplate}
            />
          )}

        </main>
      </div>

      {/* CREATE COMPETITION WIZARD */}
      <CreateCompetitionWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onSuccess={() => {
          setShowCreateWizard(false);
          triggerToast("Competition created successfully!");
          loadCompetitions(competitionsPage, itemsPerPage);
        }}
        dbCategories={dbCategories}
        bannerTemplates={bannerTemplates}
      />

    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<Loading variant="screen" text="Loading dashboard..." />}>
      <AdminDashboardContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Header from "@/components/Header";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { 
  CheckSquare, 
  AlertTriangle, 
  LogOut, 
  DollarSign, 
  TrendingUp
} from "lucide-react";

import QueueTab, { Assignment } from "@/components/judge/QueueTab";
import EarningsTab from "@/components/judge/EarningsTab";
import AnalyticsTab from "@/components/judge/AnalyticsTab";

interface Financials {
  totalEarnings: number;
  totalPaidPayouts: number;
  pendingPayoutBalance: number;
}

interface BankAccount {
  bankName: string;
  accountNum: string;
  ifscCode: string;
}

interface PayoutLog {
  id: string;
  amount: string;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED";
  assignedCount: number;
  paymentDate: string | null;
  transactionRef: string | null;
  adminNotes: string | null;
  createdAt: string;
}

interface AnalyticsMetrics {
  pendingCount: number;
  completedCount: number;
  lifetimeCount: number;
  totalEarnings: number;
  totalPaidPayouts: number;
  pendingPayoutBalance: number;
  judgeAverageScore: number | null;
  peerAverageScore: number | null;
}

interface CategoryDist {
  name: string;
  count: number;
}

const mockAssignments: Assignment[] = [
  {
    id: "asg-1",
    registrationId: "PP-2026-REC-0021",
    competitionTitle: "Borsha Bodhon 2026",
    categoryName: "Bengali Recitation",
    fbPostUrl: "https://facebook.com/groups/pratibha/posts/12345",
    isSubmitted: false,
    scope: "STATE",
    score: null
  },
  {
    id: "asg-2",
    registrationId: "PP-2026-ART-0098",
    competitionTitle: "Chitra Kala 2026",
    categoryName: "Drawing & Painting",
    fbPostUrl: "https://facebook.com/groups/pratibha/posts/54321",
    isSubmitted: true,
    scope: "NATIONAL",
    score: {
      criteria1: 34,
      criteria2: 21,
      criteria3: 22,
      criteria4: 8,
      totalScore: 85,
      remarks: "Excellent shading work. Lines are clean and composition shows strong maturity."
    }
  }
];

function JudgeDashboardContent() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = (searchParams.get("tab") || "queue") as "queue" | "earnings" | "analytics";

  const activeTab = tabFromUrl;

  const handleTabChange = (tab: "queue" | "earnings" | "analytics") => {
    router.push(`/judge/dashboard?tab=${tab}`);
  };
  
  // Queue States
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // Slider states
  const [c1, setC1] = useState(25); // Technique/Skill (max 40)
  const [c2, setC2] = useState(20); // Expression/Presentation (max 30 / max 25 for national)
  const [c3, setC3] = useState(20); // Rhythm/Composition (max 30 / max 25 for national)
  const [c4, setC4] = useState(5);  // Originality/Innovation (max 10, National only)
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Payouts & Bank States
  const [financials, setFinancials] = useState<Financials>({ totalEarnings: 0, totalPaidPayouts: 0, pendingPayoutBalance: 0 });
  const [bankAccount, setBankAccount] = useState<BankAccount>({ bankName: "", accountNum: "", ifscCode: "" });
  const [payoutLogs, setPayoutLogs] = useState<PayoutLog[]>([]);
  const [savingBank, setSavingBank] = useState(false);

  // Analytics States
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [categoryDist, setCategoryDist] = useState<CategoryDist[]>([]);

  const handleSelectAssignment = useCallback((asg: Assignment) => {
    setSelectedAsg(asg);
    if (asg.isSubmitted && asg.score) {
      setC1(asg.score.criteria1);
      setC2(asg.score.criteria2);
      setC3(asg.score.criteria3);
      setC4(asg.score.criteria4 || 0);
      setRemarks(asg.score.remarks);
    } else {
      setC1(25);
      setC2(20);
      setC3(20);
      setC4(5);
      setRemarks("");
    }
  }, []);

  const loadJudgeAssignments = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      const res = await fetch(`/api/judge/assignments?${query.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load assignments");

      setAssignments(data.assignments);
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.totalCount);

      if (data.assignments.length > 0) {
        handleSelectAssignment(data.assignments[0]);
      }
      setIsUsingMock(false);
    } catch (err) {
      console.warn("Loading mock data fallback. Database connection could be unconfigured.", err);
      setAssignments(mockAssignments);
      handleSelectAssignment(mockAssignments[0]);
      setTotalPages(Math.ceil(mockAssignments.length / itemsPerPage));
      setTotalCount(mockAssignments.length);
      setCurrentPage(page);
      setIsUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, handleSelectAssignment]);

  const loadPayoutInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/judge/payouts");
      const data = await res.json();
      if (res.ok) {
        setFinancials(data.financials);
        setPayoutLogs(data.payouts);
        if (data.bankAccountDetails) {
          setBankAccount(data.bankAccountDetails);
        }
      }
    } catch (err) {
      console.error("Failed to load payout details", err);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/judge/analytics");
      const data = await res.json();
      if (res.ok) {
        setMetrics(data.metrics);
        setCategoryDist(data.categoryDistribution);
      }
    } catch (err) {
      console.error("Failed to load analytics details", err);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    } else if (sessionStatus === "authenticated") {
      const role = (session.user as { role?: string }).role;
      if (role !== "JUDGE" && role !== "SUPER_ADMIN") {
        router.push("/account/dashboard");
      } else {
        Promise.resolve().then(() => {
          loadJudgeAssignments();
          loadPayoutInfo();
          loadAnalytics();
        });
      }
    }
  }, [sessionStatus, session, router, loadJudgeAssignments, loadPayoutInfo, loadAnalytics]);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBank(true);
    try {
      const res = await fetch("/api/judge/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankAccount)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to save bank info");
      } else {
        setStatusMessage("Bank account details saved successfully!");
        setTimeout(() => setStatusMessage(""), 3000);
        loadPayoutInfo();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit details.");
    } finally {
      setSavingBank(false);
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsg) return;
    
    // Technical feedback remark feedback validation check (min 50 chars for constructive review)
    if (remarks.trim().length < 50) {
      alert("To maintain high competition standards, please provide at least 50 characters of constructive feedback.");
      return;
    }

    setSubmitting(true);

    if (isUsingMock) {
      const isNational = selectedAsg.scope === "NATIONAL";
      const totalScore = c1 + c2 + c3 + (isNational ? c4 : 0);
      setAssignments(prev =>
        prev.map(asg => {
          if (asg.id === selectedAsg.id) {
            return {
              ...asg,
              isSubmitted: true,
              score: { criteria1: c1, criteria2: c2, criteria3: c3, criteria4: isNational ? c4 : undefined, totalScore, remarks }
            };
          }
          return asg;
        })
      );
      setSelectedAsg(prev => {
        if (!prev) return null;
        return {
          ...prev,
          isSubmitted: true,
          score: { criteria1: c1, criteria2: c2, criteria3: c3, criteria4: isNational ? c4 : undefined, totalScore, remarks }
        };
      });
      setStatusMessage("Evaluation saved in sandbox mode!");
      setSubmitting(false);
      setTimeout(() => setStatusMessage(""), 2000);
      return;
    }

    try {
      const isNational = selectedAsg.scope === "NATIONAL";
      const res = await fetch("/api/judge/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAsg.id,
          criteria1: c1,
          criteria2: c2,
          criteria3: c3,
          criteria4: isNational ? c4 : undefined,
          remarks
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit scores");
      } else {
        setStatusMessage("Grading submitted successfully!");
        loadJudgeAssignments();
        loadPayoutInfo();
        loadAnalytics();
      }
    } catch (err) {
      console.error(err);
      alert("Network issue occurred.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatusMessage(""), 2000);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return <Loading variant="screen" text="Loading dashboard..." />;
  }

  return (
    <>
      <Header />

      <main className="flex-1 bg-cream-dark/10 dark:bg-charcoal/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Panel */}
          <div className="bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-charcoal dark:text-cream">Examiner Evaluation Portal</h1>
              <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 font-sans">Double-Blind Submissions Scoring | Dynamic State vs. National Rubrics</p>
            </div>
            
            <Button
              onClick={() => signOut({ callbackUrl: "/login" })}
              variant="outline"
              size="md"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          {/* Sandbox alert */}
          {isUsingMock && (
            <div className="p-4 bg-yellow-500/10 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl text-yellow-800 dark:text-yellow-200 text-sm font-sans flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
              <span><strong>Sandbox Preview:</strong> Database is unconfigured. Showing simulated double-blind scoring panel.</span>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 bg-green-500/10 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 text-sm font-bold rounded-lg text-center">
              {statusMessage}
            </div>
          )}

           {/* Navigation Tabs */}
          <div className="flex border-b border-terracotta/10 dark:border-terracotta/20">
            <Button
              onClick={() => handleTabChange("queue")}
              variant="ghost"
              size="md"
              className={`pb-4 px-6 border-b-2 transition-all duration-300 ${
                activeTab === "queue"
                  ? "border-terracotta dark:border-gold text-terracotta dark:text-gold"
                  : "border-transparent text-charcoal/40 dark:text-cream/40"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Assignments Queue ({totalCount})
            </Button>
            <Button
              onClick={() => handleTabChange("earnings")}
              variant="ghost"
              size="md"
              className={`pb-4 px-6 border-b-2 transition-all duration-300 ${
                activeTab === "earnings"
                  ? "border-terracotta dark:border-gold text-terracotta dark:text-gold"
                  : "border-transparent text-charcoal/40 dark:text-cream/40"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Earnings &amp; Payouts
            </Button>
            <Button
              onClick={() => handleTabChange("analytics")}
              variant="ghost"
              size="md"
              className={`pb-4 px-6 border-b-2 transition-all duration-300 ${
                activeTab === "analytics"
                  ? "border-terracotta dark:border-gold text-terracotta dark:text-gold"
                  : "border-transparent text-charcoal/40 dark:text-cream/40"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Performance Analytics
            </Button>
          </div>

          {/* TAB 1: QUEUE WORKSPACE */}
          {activeTab === "queue" && (
            <QueueTab
              assignments={assignments}
              selectedAsg={selectedAsg}
              handleSelectAssignment={handleSelectAssignment}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              itemsPerPage={itemsPerPage}
              loadJudgeAssignments={loadJudgeAssignments}
              loading={loading}
              c1={c1}
              setC1={setC1}
              c2={c2}
              setC2={setC2}
              c3={c3}
              setC3={setC3}
              c4={c4}
              setC4={setC4}
              remarks={remarks}
              setRemarks={setRemarks}
              handleSubmitScore={handleSubmitScore}
              submitting={submitting}
            />
          )}

          {/* TAB 2: EARNINGS & PAYOUTS */}
          {activeTab === "earnings" && (
            <EarningsTab
              financials={financials}
              bankAccount={bankAccount}
              setBankAccount={setBankAccount}
              payoutLogs={payoutLogs}
              savingBank={savingBank}
              handleSaveBank={handleSaveBank}
            />
          )}

          {/* TAB 3: PERFORMANCE ANALYTICS */}
          {activeTab === "analytics" && (
            <AnalyticsTab
              metrics={metrics}
              categoryDist={categoryDist}
            />
          )}

        </div>
      </main>
    </>
  );
}

export default function JudgeDashboard() {
  return (
    <Suspense fallback={<Loading variant="screen" />}>
      <JudgeDashboardContent />
    </Suspense>
  );
}

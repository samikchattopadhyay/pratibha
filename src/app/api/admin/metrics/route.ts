import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getActiveCompetitionsCount,
  getPendingJudgingCount,
  getRegistrationsPostedTodayCount,
  getPendingPaymentsCount,
  getCertificatesCount,
  getCourierPendingCount,
  getSuccessfulTransactionsLast7Days,
  getEndedCompetitions,
  getParentsByState,
  getPendingAssignmentsByJudge,
  getJudgesByIds,
} from "@/lib/db/queries";

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const activeContestsCount = await getActiveCompetitionsCount();
    const pendingJudgingCount = await getPendingJudgingCount();
    const videosPostedTodayCount = await getRegistrationsPostedTodayCount();
    const pendingPaymentsCount = await getPendingPaymentsCount();
    const certificatesCount = await getCertificatesCount();
    const courierPendingCount = await getCourierPendingCount();

    const successfulTransactions = await getSuccessfulTransactionsLast7Days();

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyRevenue: { [key: string]: number } = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      dailyRevenue[dayName] = 0;
    }

    successfulTransactions.forEach((tx: any) => {
      const dayName = daysOfWeek[new Date(tx.createdAt).getDay()];
      if (dailyRevenue[dayName] !== undefined) {
        dailyRevenue[dayName] += parseFloat(tx.amount.toString());
      }
    });

    const revenueData = Object.keys(dailyRevenue).map((day: any) => ({
      day,
      amount: dailyRevenue[day],
    }));

    const totalRevenueSum = successfulTransactions.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount.toString()), 0);

    const stateGroupings = await getParentsByState();

    const totalParents = stateGroupings.reduce((sum: number, g: any) => sum + g.count, 0);
    const hotspots = stateGroupings.map((g: any) => {
      const pct = totalParents > 0 ? Math.round((g.count / totalParents) * 100) : 0;
      return {
        state: g.state || "Other",
        count: g.count,
        percentage: pct,
      };
    });

    const endedCompetitions = await getEndedCompetitions(3);

    const pendingAssignmentsByJudge = await getPendingAssignmentsByJudge();
    const judgeIds = pendingAssignmentsByJudge.map((pa: any) => pa.judgeId);
    const judgesList = judgeIds.length > 0 ? await getJudgesByIds(judgeIds) : [];

    const urgentJudges = judgesList
      .map((j: any) => {
        const pCount = pendingAssignmentsByJudge.find((pa: any) => pa.judgeId === j.id)?.count || 0;
        return {
          name: j.name,
          pendingCount: pCount,
        };
      })
      .filter((j: any) => j.pendingCount > 0)
      .slice(0, 3);

    return NextResponse.json({
      metrics: {
        activeContests: activeContestsCount,
        pendingJudging: pendingJudgingCount,
        videosPostedToday: videosPostedTodayCount,
        pendingPayments: pendingPaymentsCount,
        certificatesGenerated: certificatesCount,
        courierPending: courierPendingCount,
      },
      revenue: {
        totalLast7Days: totalRevenueSum,
        daily: revenueData,
      },
      hotspots,
      operations: {
        endedCompetitions: endedCompetitions.map((c: any) => c.title),
        urgentJudges,
      },
    });
  } catch (error) {
    console.error("Admin metrics fetch error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

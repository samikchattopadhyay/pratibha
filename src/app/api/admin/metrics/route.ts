import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

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

    // 1. Core counters
    const activeContestsCount = await prisma.competition.count({
      where: { isActive: true },
    });

    const pendingJudgingCount = await prisma.judgeAssignment.count({
      where: { isSubmitted: false },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const videosPostedTodayCount = await prisma.registration.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    const pendingPaymentsCount = await prisma.registration.count({
      where: { paymentStatus: "PENDING" },
    });

    const certificatesCount = await prisma.certificate.count();

    const courierPendingCount = await prisma.registration.count({
      where: {
        scoringFinalized: true,
        certificate: null,
      },
    });

    // 2. 7-Day Revenue Intake
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const successfulTransactions = await prisma.transaction.findMany({
      where: {
        status: "SUCCESS",
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Initialize daily revenue map
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyRevenue: { [key: string]: number } = {};
    
    // Fill last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      dailyRevenue[dayName] = 0;
    }

    successfulTransactions.forEach((tx) => {
      const dayName = daysOfWeek[new Date(tx.createdAt).getDay()];
      if (dailyRevenue[dayName] !== undefined) {
        dailyRevenue[dayName] += Number(tx.amount);
      }
    });

    const revenueData = Object.keys(dailyRevenue).map((day) => ({
      day,
      amount: dailyRevenue[day],
    }));

    const totalRevenueSum = successfulTransactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // 3. Hotspots grouping
    const stateGroupings = await prisma.parent.groupBy({
      by: ["state"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 4,
    });

    const totalParents = await prisma.parent.count();
    const hotspots = stateGroupings.map((g) => {
      const count = g._count.id;
      const pct = totalParents > 0 ? Math.round((count / totalParents) * 100) : 0;
      return {
        state: g.state || "Other",
        count,
        percentage: pct,
      };
    });

    // 4. Today's Urgent operations
    const endedCompetitions = await prisma.competition.findMany({
      where: {
        endDate: {
          lt: new Date(),
        },
      },
      take: 3,
      select: {
        title: true,
      },
    });

    const pendingAssignmentsByJudge = await prisma.judgeAssignment.groupBy({
      by: ["judgeId"],
      where: { isSubmitted: false },
      _count: {
        id: true,
      },
    });

    const judgesList = await prisma.judge.findMany({
      where: {
        id: {
          in: pendingAssignmentsByJudge.map((pa) => pa.judgeId),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const urgentJudges = judgesList.map((j) => {
      const pCount = pendingAssignmentsByJudge.find((pa) => pa.judgeId === j.id)?._count.id || 0;
      return {
        name: j.name,
        pendingCount: pCount,
      };
    }).filter(j => j.pendingCount > 0);

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
        endedCompetitions: endedCompetitions.map(c => c.title),
        urgentJudges: urgentJudges.slice(0, 3),
      },
    });
  } catch (error) {
    console.error("Admin metrics fetch error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

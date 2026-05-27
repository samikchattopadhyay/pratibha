import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import type { RevenueMetadata } from "@/types/judges-details";

// ✅ Pattern: Type guard for auth
async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  // TODO: Implement actual auth check
  return true;
}

// ✅ Pattern: Service function for revenue calculation
async function fetchRevenueMetadata(judgeId: string): Promise<RevenueMetadata | null> {
  const payouts = await prisma.judgePayout.findMany({
    where: { judgeId },
    select: { amount: true, status: true },
  });

  if (!payouts) {
    return null;
  }

  const totalEarned = payouts
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount.toNumber(), 0);

  const totalPending = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount.toNumber(), 0);

  // TODO: Get these from database or judge-specific settings
  const hourlyRate = 500;
  const perEvaluationRate = 150;

  // Get last payment date
  const lastPayout = await prisma.judgePayout.findFirst({
    where: { judgeId, status: "PAID" },
    orderBy: { paymentDate: "desc" },
    select: { paymentDate: true },
  });

  return {
    totalEarned,
    totalPending,
    hourlyRate,
    perEvaluationRate,
    lastPaymentDate: lastPayout?.paymentDate?.toISOString() ?? null,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: judgeId } = await params;

    // Check authorization
    const isAuthorized = await checkAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Admin access required" },
        { status: 401 }
      );
    }

    const revenue = await fetchRevenueMetadata(judgeId);
    if (!revenue) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Judge not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(revenue, { status: 200 });
  } catch (err) {
    console.error("[GET /api/admin/judges/[id]/revenue]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}

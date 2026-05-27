import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import type { PaymentRecord, PaginatedResponse } from "@/types/judges-details";

// ✅ Pattern: Pagination params validation
const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// ✅ Pattern: Type guard for auth
async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  // TODO: Implement actual auth check
  return true;
}

// ✅ Pattern: Fetch with Prisma pagination (skip/take)
async function fetchPayments(
  judgeId: string,
  pagination: z.infer<typeof PaginationSchema>
): Promise<PaginatedResponse<PaymentRecord>> {
  const [payouts, total] = await Promise.all([
    prisma.judgePayout.findMany({
      where: { judgeId },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        status: true,
        transactionRef: true,
        createdAt: true,
        paymentDate: true,
      },
    }),
    prisma.judgePayout.count({ where: { judgeId } }),
  ]);

  return {
    data: payouts.map((p) => ({
      id: p.id,
      amount: p.amount.toNumber(),
      status: (p.status.toLowerCase()) as "pending" | "completed" | "failed",
      invoiceNumber: p.transactionRef || p.id.substring(0, 8),
      createdAt: p.createdAt.toISOString(),
      completedAt: p.paymentDate?.toISOString() ?? null,
    })),
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: judgeId } = await params;

    // Get query params
    const searchParams = new URLSearchParams(request.nextUrl.search);
    const params_obj = Object.fromEntries(searchParams);
    const validated = PaginationSchema.safeParse(params_obj);

    if (!validated.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    // Check authorization
    const isAuthorized = await checkAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Admin access required" },
        { status: 401 }
      );
    }

    const result = await fetchPayments(judgeId, validated.data);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[GET /api/admin/judges/[id]/payments]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}

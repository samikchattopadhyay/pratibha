import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { z } from "zod";
import { getJudgePayoutsPaginated } from "@/lib/db/queries";
import type { PaymentRecord, PaginatedResponse } from "@/types/judges-details";

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

async function checkAdminAuth(): Promise<boolean> {
  const session = await getEdgeSession();
  if (!session?.user) return false;

  const role = (session.user as { role?: string }).role;
  return role === "SUPER_ADMIN" || role === "MODERATOR";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: judgeId } = await params;

    const searchParams = new URLSearchParams(request.nextUrl.search);
    const params_obj = Object.fromEntries(searchParams);
    const validated = PaginationSchema.safeParse(params_obj);

    if (!validated.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Admin access required" },
        { status: 401 }
      );
    }

    const { payouts, total } = await getJudgePayoutsPaginated(
      judgeId,
      validated.data.limit,
      (validated.data.page - 1) * validated.data.limit
    );

    const result: PaginatedResponse<PaymentRecord> = {
      data: payouts,
      total,
      page: validated.data.page,
      limit: validated.data.limit,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[GET /api/admin/judges/[id]/payments]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}

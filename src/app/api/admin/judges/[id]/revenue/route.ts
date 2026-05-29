import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { getJudgeRevenueMetadata } from "@/lib/db/queries";
import type { RevenueMetadata } from "@/types/judges-details";

async function checkAdminAuth(): Promise<boolean> {
  const session = await getEdgeSession();
  if (!session?.user) return false;

  const role = (session.user as { role?: string }).role;
  return role === "SUPER_ADMIN" || role === "MODERATOR";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: judgeId } = await params;

    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Admin access required" },
        { status: 401 }
      );
    }

    const revenue = await getJudgeRevenueMetadata(judgeId);
    if (!revenue) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Judge not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(revenue as RevenueMetadata, { status: 200 });
  } catch (err) {
    console.error("[GET /api/admin/judges/[id]/revenue]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}

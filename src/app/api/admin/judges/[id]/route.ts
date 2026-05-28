import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { z } from "zod";
import prisma from "@/lib/db";
import type { JudgeMetadata } from "@/types/judges-details";

// ✅ Pattern: Zod schema for request validation
const JudgeIdParamSchema = z.object({
  id: z.string().uuid("Invalid judge ID"),
});

// ✅ Pattern: Type guard for auth
async function checkAdminAuth(): Promise<boolean> {
  const session = await getEdgeSession();
  if (!session?.user) return false;

  const role = (session.user as { role?: string }).role;
  return role === "SUPER_ADMIN" || role === "MODERATOR";
}

// ✅ Pattern: Service function (business logic separated)
async function fetchJudgeMetadata(judgeId: string): Promise<JudgeMetadata | null> {
  const judge = await prisma.judge.findUnique({
    where: { id: judgeId },
    select: {
      id: true,
      name: true,
      user: { select: { email: true } },
      specializations: true,
      tier: true,
      isAvailable: true,
      createdAt: true,
      totalEvaluations: true,
      averageScoreGiven: true,
    },
  });

  if (!judge) return null;

  // Calculate deviation percentage if we have average score
  let deviationPercentage: number | null = null;
  const avgScore = judge.averageScoreGiven?.toNumber() ?? null;
  if (avgScore !== null && avgScore > 0) {
    // Simple deviation: (100 - avg_score) as percentage
    deviationPercentage = Math.max(0, 100 - avgScore);
  }

  // ✅ Pattern: Return DTO (not Prisma model directly)
  return {
    id: judge.id,
    name: judge.name,
    email: judge.user.email,
    phone: (judge as any).phone || "",
    specializations: judge.specializations,
    tier: judge.tier as "LOCAL" | "REGIONAL" | "NATIONAL" | "EXPERT",
    isActive: judge.isAvailable,
    joinedDate: judge.createdAt.toISOString(),
    totalEvaluations: judge.totalEvaluations,
    averageScore: judge.averageScoreGiven?.toNumber() ?? 0,
    deviationPercentage,
  };
}

// ✅ Pattern: Route handler with error handling
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Extract route param
    const { id: judgeId } = await params;

    // 2. Validate input
    const validated = JudgeIdParamSchema.safeParse({ id: judgeId });
    if (!validated.success) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid judge ID format",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // 3. Check authorization
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Admin access required" },
        { status: 401 }
      );
    }

    // 4. Business logic
    const judge = await fetchJudgeMetadata(validated.data.id);
    if (!judge) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Judge not found" },
        { status: 404 }
      );
    }

    // 5. Response
    return NextResponse.json(judge, { status: 200 });
  } catch (err) {
    console.error("[GET /api/admin/judges/[id]]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}

// ✅ Pattern: PATCH endpoint for updating judge
const UpdateJudgeSchema = z.object({
  name: z.string().min(1),
  specializations: z.array(z.string()).optional(),
  tier: z.enum(["LOCAL", "REGIONAL", "NATIONAL", "EXPERT"]).optional(),
  isAvailable: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: judgeId } = await params;
    const body = await request.json();

    // Validate input
    const validated = UpdateJudgeSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    // Check authorization
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Admin access required" },
        { status: 401 }
      );
    }

    // Update in database
    const updated = await prisma.judge.update({
      where: { id: judgeId },
      data: validated.data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    if ((err as any)?.code === "P2025") {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Judge not found" },
        { status: 404 }
      );
    }
    console.error("[PATCH /api/admin/judges/[id]]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { z } from "zod";
import { db } from "@/lib/db/drizzle";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { JudgeMetadata } from "@/types/judges-details";

const JudgeIdParamSchema = z.object({
  id: z.string().uuid("Invalid judge ID"),
});

async function checkAdminAuth(): Promise<boolean> {
  const session = await getEdgeSession();
  if (!session?.user) return false;

  const role = (session.user as { role?: string }).role;
  return role === "SUPER_ADMIN" || role === "MODERATOR";
}

async function fetchJudgeMetadata(judgeId: string): Promise<JudgeMetadata | null> {
  const judge = await db.query.judges.findFirst({
    where: eq(schema.judges.id, judgeId),
    columns: {
      id: true,
      name: true,
      phone: true,
      specializations: true,
      tier: true,
      isAvailable: true,
      createdAt: true,
      totalEvaluations: true,
      averageScoreGiven: true,
    },
    with: {
      user: {
        columns: { email: true },
      },
    },
  });

  if (!judge) return null;

  let deviationPercentage: number | null = null;
  const avgScore = judge.averageScoreGiven ? parseFloat(judge.averageScoreGiven.toString()) : null;
  if (avgScore !== null && avgScore > 0) {
    deviationPercentage = Math.max(0, 100 - avgScore);
  }

  return {
    id: judge.id,
    name: judge.name,
    email: judge.user.email,
    phone: judge.phone || "",
    specializations: judge.specializations,
    tier: judge.tier as "LOCAL" | "REGIONAL" | "NATIONAL" | "EXPERT",
    isActive: judge.isAvailable,
    joinedDate: judge.createdAt.toISOString(),
    totalEvaluations: judge.totalEvaluations,
    averageScore: avgScore ?? 0,
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

    const validated = UpdateJudgeSchema.safeParse(body);
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

    const updateData: any = { ...validated.data };
    // Map isAvailable to the schema field
    if (updateData.isAvailable !== undefined) {
      delete updateData.isAvailable;
      updateData.isAvailable = validated.data.isAvailable;
    }

    const result = await db
      .update(schema.judges)
      .set(updateData)
      .where(eq(schema.judges.id, judgeId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Judge not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (err) {
    console.error("[PATCH /api/admin/judges/[id]]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}

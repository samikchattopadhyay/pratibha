import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { z } from "zod";
import prisma from "@/lib/db";
import type { JudgeSettings } from "@/types/judges-details";

// ✅ Pattern: Request DTO validation
const UpdateSettingsSchema = z.object({
  maxEvaluationsPerDay: z.number().min(1).max(50),
  restPeriodHours: z.number().min(0).max(24),
  paymentPerEvaluation: z.number().min(0).max(10000),
  revenueShareLOCAL: z.number().min(0).max(100).nullable().optional(),
  revenueShareREGIONAL: z.number().min(0).max(100).nullable().optional(),
  revenueShareNATIONAL: z.number().min(0).max(100).nullable().optional(),
  revenueShareEXPERT: z.number().min(0).max(100).nullable().optional(),
  preferredCategories: z.array(z.string()).min(1),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});

// ✅ Pattern: Type guard for auth
async function checkAdminAuth(): Promise<boolean> {
  const session = await getEdgeSession();
  if (!session?.user) return false;

  const role = (session.user as { role?: string }).role;
  return role === "SUPER_ADMIN" || role === "MODERATOR";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: judgeId } = await params;
    const body: unknown = await request.json();

    // Validate input
    const validated = UpdateSettingsSchema.safeParse(body);
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

    // Update judge with payment and preferred categories
    const updateData: any = {
      specializations: validated.data.preferredCategories,
    };

    if (validated.data.paymentPerEvaluation > 0) {
      updateData.paymentPerEvaluation = validated.data.paymentPerEvaluation;
    }
    if (validated.data.revenueShareLOCAL !== undefined && validated.data.revenueShareLOCAL !== null) {
      updateData.revenueShareLOCAL = validated.data.revenueShareLOCAL;
    }
    if (validated.data.revenueShareREGIONAL !== undefined && validated.data.revenueShareREGIONAL !== null) {
      updateData.revenueShareREGIONAL = validated.data.revenueShareREGIONAL;
    }
    if (validated.data.revenueShareNATIONAL !== undefined && validated.data.revenueShareNATIONAL !== null) {
      updateData.revenueShareNATIONAL = validated.data.revenueShareNATIONAL;
    }
    if (validated.data.revenueShareEXPERT !== undefined && validated.data.revenueShareEXPERT !== null) {
      updateData.revenueShareEXPERT = validated.data.revenueShareEXPERT;
    }

    await prisma.judge.update({
      where: { id: judgeId },
      data: updateData,
    });

    // Return settings DTO
    const settings: JudgeSettings = {
      maxEvaluationsPerDay: validated.data.maxEvaluationsPerDay,
      restPeriodHours: validated.data.restPeriodHours,
      paymentPerEvaluation: validated.data.paymentPerEvaluation,
      revenueShareByTier: {
        LOCAL: validated.data.revenueShareLOCAL ?? null,
        REGIONAL: validated.data.revenueShareREGIONAL ?? null,
        NATIONAL: validated.data.revenueShareNATIONAL ?? null,
        EXPERT: validated.data.revenueShareEXPERT ?? null,
      },
      preferredCategories: validated.data.preferredCategories,
      emailNotifications: validated.data.emailNotifications,
      smsNotifications: validated.data.smsNotifications,
    };

    return NextResponse.json(settings, { status: 200 });
  } catch (err) {
    if ((err as any)?.code === "P2025") {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Judge not found" },
        { status: 404 }
      );
    }
    console.error("[PATCH /api/admin/judges/[id]/settings]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: judgeId } = await params;

    // Check authorization
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Admin access required" },
        { status: 401 }
      );
    }

    const judge = (await prisma.judge.findUnique({
      where: { id: judgeId },
    })) as any;

    if (!judge) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Judge not found" },
        { status: 404 }
      );
    }

    // Return settings with judge's actual values
    const settings: JudgeSettings = {
      maxEvaluationsPerDay: 5,
      restPeriodHours: 8,
      paymentPerEvaluation: judge.paymentPerEvaluation ? Number(judge.paymentPerEvaluation) : 0,
      revenueShareByTier: {
        LOCAL: judge.revenueShareLOCAL ? Number(judge.revenueShareLOCAL) : null,
        REGIONAL: judge.revenueShareREGIONAL ? Number(judge.revenueShareREGIONAL) : null,
        NATIONAL: judge.revenueShareNATIONAL ? Number(judge.revenueShareNATIONAL) : null,
        EXPERT: judge.revenueShareEXPERT ? Number(judge.revenueShareEXPERT) : null,
      },
      preferredCategories: judge.specializations as readonly string[],
      emailNotifications: true,
      smsNotifications: false,
    };

    return NextResponse.json(settings, { status: 200 });
  } catch (err) {
    console.error("[GET /api/admin/judges/[id]/settings]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}

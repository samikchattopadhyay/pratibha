import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { z } from "zod";
import { getJudgeSettings, updateJudgeSettings } from "@/lib/db/queries";
import type { JudgeSettings } from "@/types/judges-details";

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

    const validated = UpdateSettingsSchema.safeParse(body);
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

    await updateJudgeSettings(judgeId, {
      specializations: validated.data.preferredCategories,
      paymentPerEvaluation: validated.data.paymentPerEvaluation.toString(),
      revenueShareLOCAL: validated.data.revenueShareLOCAL?.toString() ?? null,
      revenueShareREGIONAL: validated.data.revenueShareREGIONAL?.toString() ?? null,
      revenueShareNATIONAL: validated.data.revenueShareNATIONAL?.toString() ?? null,
      revenueShareEXPERT: validated.data.revenueShareEXPERT?.toString() ?? null,
    });

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

    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Admin access required" },
        { status: 401 }
      );
    }

    const judge = await getJudgeSettings(judgeId);

    if (!judge) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Judge not found" },
        { status: 404 }
      );
    }

    const settings: JudgeSettings = {
      maxEvaluationsPerDay: 5,
      restPeriodHours: 8,
      paymentPerEvaluation: judge.paymentPerEvaluation ? parseFloat(judge.paymentPerEvaluation.toString()) : 0,
      revenueShareByTier: {
        LOCAL: judge.revenueShareLOCAL ? parseFloat(judge.revenueShareLOCAL.toString()) : null,
        REGIONAL: judge.revenueShareREGIONAL ? parseFloat(judge.revenueShareREGIONAL.toString()) : null,
        NATIONAL: judge.revenueShareNATIONAL ? parseFloat(judge.revenueShareNATIONAL.toString()) : null,
        EXPERT: judge.revenueShareEXPERT ? parseFloat(judge.revenueShareEXPERT.toString()) : null,
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

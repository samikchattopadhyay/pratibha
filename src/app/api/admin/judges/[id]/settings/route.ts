import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import type { JudgeSettings } from "@/types/judges-details";

// ✅ Pattern: Request DTO validation
const UpdateSettingsSchema = z.object({
  maxEvaluationsPerDay: z.coerce.number().min(1).max(50),
  restPeriodHours: z.coerce.number().min(0).max(24),
  preferredCategories: z.array(z.string()).min(1),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});

// ✅ Pattern: Type guard for auth
async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  // TODO: Implement actual auth check
  return true;
}

// For now, we'll store settings in the judge model's specializations field
// TODO: Create a JudgeSettings table if more granular settings management is needed

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
    const isAuthorized = await checkAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Admin access required" },
        { status: 401 }
      );
    }

    // Update judge specializations as preferred categories
    const updated = await prisma.judge.update({
      where: { id: judgeId },
      data: {
        specializations: validated.data.preferredCategories,
      },
    });

    // Return settings DTO
    const settings: JudgeSettings = {
      maxEvaluationsPerDay: validated.data.maxEvaluationsPerDay,
      restPeriodHours: validated.data.restPeriodHours,
      preferredCategories: updated.specializations as readonly string[],
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

    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
      select: { specializations: true },
    });

    if (!judge) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Judge not found" },
        { status: 404 }
      );
    }

    // Return default settings with judge's specializations
    const settings: JudgeSettings = {
      maxEvaluationsPerDay: 5,
      restPeriodHours: 8,
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

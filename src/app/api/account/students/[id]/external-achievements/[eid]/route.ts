/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getParentByUserId,
  getStudentById,
  getExternalAchievementById,
  updateExternalAchievement,
  deleteExternalAchievement,
} from "@/lib/db/queries";
import { z } from "zod";

// ─── SECTION 1: VALIDATION SCHEMAS ────────────────────────────────────────

const achievementUpdateSchema = z.object({
  title: z.string().min(1, "Achievement title is required").optional(),
  eventName: z.string().min(1, "Event name is required").optional(),
  category: z.string().nullable().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  rank: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  proofUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
});

// ─── SECTION 2: REQUEST HANDLERS ──────────────────────────────────────────

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  try {
    // 1. Parse & Auth check
    const session = await getEdgeSession(req);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id: studentId, eid: achievementId } = await params;
    const body = await req.json();

    // 2. Validate
    const parsed = achievementUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = parsed.data;

    // 3. Business logic
    const parent = await getParentByUserId(userId);

    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
    }

    // Verify student ownership
    const student = await getStudentById(studentId);

    if (!student || student.parentId !== parent.id) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Verify achievement ownership
    const achievement = await getExternalAchievementById(achievementId);

    if (!achievement || achievement.studentId !== studentId) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    }

    // Update achievement
    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.eventName !== undefined) updatePayload.eventName = data.eventName;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.year !== undefined) updatePayload.year = data.year;
    if (data.rank !== undefined) updatePayload.rank = data.rank;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.proofUrl !== undefined) updatePayload.proofUrl = data.proofUrl;

    const result = await updateExternalAchievement(achievementId, updatePayload);

    // 4. Response
    return NextResponse.json(
      { message: "Achievement updated successfully", achievementId: result[0].id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Achievement update error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  try {
    // 1. Auth check
    const session = await getEdgeSession(req);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id: studentId, eid: achievementId } = await params;

    // 2. Business logic
    const parent = await getParentByUserId(userId);

    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
    }

    // Verify student ownership
    const student = await getStudentById(studentId);

    if (!student || student.parentId !== parent.id) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Verify achievement ownership
    const achievement = await getExternalAchievementById(achievementId);

    if (!achievement || achievement.studentId !== studentId) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    }

    // Delete achievement
    await deleteExternalAchievement(achievementId);

    // 3. Response
    return NextResponse.json(
      { message: "Achievement deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Achievement deletion error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

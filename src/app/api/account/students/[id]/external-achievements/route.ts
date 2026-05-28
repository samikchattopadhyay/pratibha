/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import { z } from "zod";

// ─── SECTION 1: VALIDATION SCHEMAS ────────────────────────────────────────

const achievementCreateSchema = z.object({
  title: z.string().min(1, "Achievement title is required"),
  eventName: z.string().min(1, "Event name is required"),
  category: z.string().nullable().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  rank: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  proofUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
});

// ─── SECTION 2: REQUEST HANDLERS ──────────────────────────────────────────

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Parse & Auth check
    const session = await getEdgeSession(req);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id: studentId } = await params;
    const body = await req.json();

    // 2. Validate
    const parsed = achievementCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = parsed.data;

    // 3. Business logic
    const parent = await prisma.parent.findUnique({
      where: { userId },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
    }

    // Verify student ownership
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.parentId !== parent.id) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Create achievement
    const achievement = await prisma.externalAchievement.create({
      data: {
        studentId,
        title: data.title,
        eventName: data.eventName,
        category: data.category,
        year: data.year,
        rank: data.rank,
        description: data.description,
        proofUrl: data.proofUrl,
        displayOrder: 0,
      },
    });

    // 4. Response
    return NextResponse.json(
      { message: "Achievement added successfully", achievementId: achievement.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Achievement creation error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

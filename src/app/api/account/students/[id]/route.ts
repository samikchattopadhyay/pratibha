/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

// ─── SECTION 1: VALIDATION SCHEMAS ────────────────────────────────────────

const studentUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  dateOfBirth: z.string().transform((val) => new Date(val)).optional(),
  gender: z.string().min(1, "Gender is required").optional(),
  slug: z.string().optional(),
  schoolClass: z.string().nullable().optional(),
  schoolName: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  profileImageUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  bio: z.string().nullable().optional(),
  heightCm: z.number().nullable().optional(),
  hairColor: z.string().nullable().optional(),
  eyeColor: z.string().nullable().optional(),
  disciplineInterests: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  trainingInstitutes: z.array(z.string()).optional(),
  specialSkills: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

// Helper function to ensure unique slug
async function ensureUniqueSlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.student.findUnique({
      where: { slug },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ─── SECTION 2: REQUEST HANDLERS ──────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Parse & Auth check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id: studentId } = await params;

    // 2. Business logic — verify ownership
    const parent = await prisma.parent.findUnique({
      where: { userId },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        externalAchievements: true,
      },
    });

    if (!student || student.parentId !== parent.id) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // 3. Response
    return NextResponse.json(student, { status: 200 });
  } catch (error: any) {
    console.error("Get student error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Parse & Auth check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id: studentId } = await params;
    const body = await req.json();

    // 2. Validate
    const parsed = studentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = parsed.data;

    // 3. Business logic
    // Find parent profile ID
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

    // Update student
    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.dateOfBirth !== undefined) updatePayload.dateOfBirth = data.dateOfBirth;
    if (data.gender !== undefined) updatePayload.gender = data.gender;
    if (data.slug !== undefined) {
      // Ensure slug is unique (excluding current student)
      const uniqueSlug = await ensureUniqueSlug(data.slug, studentId);
      updatePayload.slug = uniqueSlug;
    }
    if (data.schoolClass !== undefined) updatePayload.schoolClass = data.schoolClass;
    if (data.schoolName !== undefined) updatePayload.schoolName = data.schoolName;
    if (data.city !== undefined) updatePayload.city = data.city;
    if (data.state !== undefined) updatePayload.state = data.state;
    if (data.profileImageUrl !== undefined) updatePayload.profileImageUrl = data.profileImageUrl;
    if (data.bio !== undefined) updatePayload.bio = data.bio;
    if (data.heightCm !== undefined) updatePayload.heightCm = data.heightCm;
    if (data.hairColor !== undefined) updatePayload.hairColor = data.hairColor;
    if (data.eyeColor !== undefined) updatePayload.eyeColor = data.eyeColor;
    if (data.disciplineInterests !== undefined) updatePayload.disciplineInterests = data.disciplineInterests;
    if (data.languages !== undefined) updatePayload.languages = data.languages;
    if (data.trainingInstitutes !== undefined) updatePayload.trainingInstitutes = data.trainingInstitutes;
    if (data.specialSkills !== undefined) updatePayload.specialSkills = data.specialSkills;
    if (data.isPublic !== undefined) updatePayload.isPublic = data.isPublic;

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updatePayload,
      include: {
        externalAchievements: true,
      },
    });

    // 4. Response - Return full student object
    return NextResponse.json({
      id: updatedStudent.id,
      name: updatedStudent.name,
      slug: updatedStudent.slug || undefined,
      dateOfBirth: updatedStudent.dateOfBirth.toISOString(),
      gender: updatedStudent.gender,
      schoolClass: updatedStudent.schoolClass || null,
      schoolName: updatedStudent.schoolName || null,
      city: updatedStudent.city || null,
      state: updatedStudent.state || null,
      profileImageUrl: updatedStudent.profileImageUrl || null,
      bio: updatedStudent.bio || null,
      heightCm: updatedStudent.heightCm || null,
      hairColor: updatedStudent.hairColor || null,
      eyeColor: updatedStudent.eyeColor || null,
      disciplineInterests: updatedStudent.disciplineInterests || [],
      languages: updatedStudent.languages || [],
      categoryGrouping: [], // Derived from competition registrations, not stored on student
      trainingInstitutes: updatedStudent.trainingInstitutes || [],
      specialSkills: updatedStudent.specialSkills || [],
      isPublic: updatedStudent.isPublic || false,
      externalAchievements: updatedStudent.externalAchievements || [],
    }, { status: 200 });
  } catch (error: any) {
    console.error("Student update error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

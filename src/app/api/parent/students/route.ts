/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

// Zod validation schema for student creation
const studentCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dateOfBirth: z.string().transform((val) => new Date(val)),
  gender: z.string().min(1, "Gender is required"),
  schoolClass: z.string().nullable().optional(),
  schoolName: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  profileImageUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  bio: z.string().nullable().optional(),
  heightCm: z.number().nullable().optional(),
  hairColor: z.string().nullable().optional(),
  eyeColor: z.string().nullable().optional(),
  disciplineInterests: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  trainingInstitutes: z.array(z.string()).default([]),
  specialSkills: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    // 1. Parse & Auth check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    // 2. Validate
    const parsed = studentCreateSchema.safeParse(body);
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

    // Create student
    const student = await prisma.student.create({
      data: {
        parentId: parent.id,
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        schoolClass: data.schoolClass,
        schoolName: data.schoolName,
        city: data.city,
        state: data.state,
        profileImageUrl: data.profileImageUrl,
        bio: data.bio,
        heightCm: data.heightCm,
        hairColor: data.hairColor,
        eyeColor: data.eyeColor,
        disciplineInterests: data.disciplineInterests,
        languages: data.languages,
        trainingInstitutes: data.trainingInstitutes,
        specialSkills: data.specialSkills,
        isPublic: data.isPublic,
      },
    });

    // 4. Response
    return NextResponse.json(
      { message: "Student profile added successfully", studentId: student.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Student creation error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

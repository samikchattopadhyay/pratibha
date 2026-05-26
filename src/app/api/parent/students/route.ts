/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, dateOfBirth, gender, disciplineInterests } = body;

    if (!name || !dateOfBirth || !gender) {
      return NextResponse.json({ error: "Please fill in all student profile fields" }, { status: 400 });
    }

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
        name,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        disciplineInterests: Array.isArray(disciplineInterests) ? disciplineInterests : [],
      },
    });

    return NextResponse.json(
      { message: "Student profile added successfully", studentId: student.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Student creation error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import type { StudentMetadata } from "@/types/student-details";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        parent: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const metadata: StudentMetadata = {
      id: student.id,
      name: student.name,
      dateOfBirth: student.dateOfBirth.toISOString(),
      gender: student.gender,
      disciplineInterests: student.disciplineInterests,
      createdAt: student.createdAt.toISOString(),
      parent: {
        id: student.parent.id,
        name: student.parent.name,
        email: student.parent.user.email,
        phone: student.parent.phone,
        city: student.parent.city,
        state: student.parent.state,
      },
    };

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Student metadata fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "JUDGE" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const userId = (session.user as { id?: string }).id;

    const judge = await prisma.judge.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true },
        },
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!judge) {
      return NextResponse.json({ error: "Judge profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: judge.user.email,
      name: judge.name,
      specializations: judge.specializations,
      assignmentCount: judge._count.assignments,
      profileImageUrl: judge.profileImageUrl,
    });
  } catch (error) {
    console.error("Judge profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "JUDGE" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const userId = (session.user as { id?: string }).id;
    const body = await request.json();

    const { name, specializations } = body;

    const updateData: { name?: string; specializations?: string[]; profileImageUrl?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (specializations !== undefined) {
      if (Array.isArray(specializations)) {
        const filtered = specializations.filter((s: unknown): s is string => typeof s === "string" && s.trim().length > 0);
        updateData.specializations = filtered;
      }
    }
    if (body.profileImage !== undefined && body.profileImage !== null) {
      updateData.profileImageUrl = body.profileImage;
    }

    const updatedJudge = await prisma.judge.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          select: { email: true },
        },
        _count: {
          select: { assignments: true },
        },
      },
    });

    return NextResponse.json({
      email: updatedJudge.user.email,
      name: updatedJudge.name,
      specializations: updatedJudge.specializations,
      assignmentCount: updatedJudge._count.assignments,
      profileImageUrl: updatedJudge.profileImageUrl,
    });
  } catch (error) {
    console.error("Judge profile update error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

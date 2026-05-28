/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

const slugSchema = z.object({
  slug: z
    .string()
    .toLowerCase()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Only alphanumeric and hyphens allowed")
    .regex(/^(?!-)(?!.*-)/, "Cannot start or end with hyphen")
    .min(3, "Minimum 3 characters")
    .max(32, "Maximum 32 characters"),
  excludeStudentId: z.string().uuid().optional(),
});

const RESERVED_WORDS = [
  "admin",
  "api",
  "public",
  "verify",
  "dashboard",
  "settings",
  "auth",
  "profile",
  "edit",
  "delete",
  "student",
  "parent",
  "judge",
  "competitions",
  "registrations",
  "entries",
  "certificates",
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slug, excludeStudentId } = slugSchema.parse(body);

    // Check reserved words
    if (RESERVED_WORDS.includes(slug)) {
      return NextResponse.json({
        available: false,
        reason: "Reserved word",
      });
    }

    // Check database
    const existing = await prisma.student.findUnique({
      where: { slug },
    });

    const available = !existing || existing.id === excludeStudentId;

    if (!available) {
      // Generate suggestions
      const suggestions = [
        `${slug}-${Math.floor(Math.random() * 9000) + 1000}`,
        `${slug}-${new Date().getFullYear()}`,
      ];

      return NextResponse.json({
        available: false,
        slug,
        suggestions,
      });
    }

    return NextResponse.json({ available: true, slug });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    console.error("Check slug error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

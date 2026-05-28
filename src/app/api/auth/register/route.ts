/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendParentWelcomeEmail } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = body;

    // Validate fields
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: "Please fill in all required registration fields" },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists with this email address" },
        { status: 400 }
      );
    }

    // Check if phone number already registered
    const existingParent = await prisma.parent.findUnique({
      where: { phone },
    });

    if (existingParent) {
      return NextResponse.json(
        { error: "Account already exists with this phone number" },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User & Parent in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "PARENT",
        },
      });

      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          name,
          phone,
        },
      });

      return { user, parent };
    });

    try {
      await sendParentWelcomeEmail(email, name);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return NextResponse.json(
      { message: "Registration successful", userId: result.user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during registration" },
      { status: 500 }
    );
  }
}

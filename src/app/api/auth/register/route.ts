/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { users, parents } from "@/lib/db/schema";
import { getUserByEmail, getParentByPhone } from "@/lib/db/queries";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/email-verification";
import { sendEmailVerificationLink } from "@/lib/notifications";

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists with this email address" },
        { status: 400 }
      );
    }

    // Check if phone number already registered
    const existingParent = await getParentByPhone(phone);
    if (existingParent) {
      return NextResponse.json(
        { error: "Account already exists with this phone number" },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User & Parent in transaction
    const result = await db.transaction(async (tx) => {
      const userResult = await tx
        .insert(users)
        .values({
          email,
          passwordHash,
          role: "PARENT",
          emailVerified: null,
        })
        .returning();

      const user = userResult[0];

      const parentResult = await tx
        .insert(parents)
        .values({
          userId: user.id,
          name,
          phone,
        })
        .returning();

      const parent = parentResult[0];

      return { user, parent };
    });

    // Generate verification token
    let verificationUrl = "";
    try {
      const verificationToken = await generateVerificationToken(result.user.id);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
      verificationUrl = `${appUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

      // Send verification email
      await sendEmailVerificationLink(email, name, verificationUrl);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails, but log it
    }

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account.",
        userId: result.user.id,
        email: result.user.email,
      },
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

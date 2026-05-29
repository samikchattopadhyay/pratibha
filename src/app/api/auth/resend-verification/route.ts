import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  generateVerificationToken,
  countRecentVerificationRequests,
} from "@/lib/email-verification";
import { sendEmailVerificationLink } from "@/lib/notifications";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 3;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 2. Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified. You can now log in." },
        { status: 200 }
      );
    }

    // 3. Check rate limiting
    const recentRequests = await countRecentVerificationRequests(
      email,
      RATE_LIMIT_WINDOW_MS
    );

    if (recentRequests >= MAX_REQUESTS_PER_HOUR) {
      return NextResponse.json(
        {
          error: `Too many verification requests. Please try again after ${Math.ceil((RATE_LIMIT_WINDOW_MS - 60000) / 60000)} minutes.`,
          code: "RATE_LIMITED",
          retryAfterMinutes: Math.ceil(
            (RATE_LIMIT_WINDOW_MS - 60000) / 60000
          ),
        },
        { status: 429 }
      );
    }

    // 4. Generate new token and send email
    const verificationToken = await generateVerificationToken(user.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
    const verificationUrl = `${appUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    // Get parent name for email
    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
    });

    await sendEmailVerificationLink(
      email,
      parent?.name || "User",
      verificationUrl
    );

    return NextResponse.json(
      {
        message: "Verification email sent. Please check your inbox.",
        email: email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification email error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

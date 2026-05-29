import { NextResponse } from "next/server";
import { getUserByEmail, getParentByUserId } from "@/lib/db/queries";
import {
  verifyEmailToken,
  isTokenExpired,
} from "@/lib/email-verification";
import { sendEmailVerificationSuccess } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json(
        { error: "Missing token or email" },
        { status: 400 }
      );
    }

    // 1. Find user by email
    const user = await getUserByEmail(email);

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

    // 3. Check if token is expired
    const expired = await isTokenExpired(token);
    if (expired) {
      return NextResponse.json(
        {
          error: "Verification link has expired",
          code: "TOKEN_EXPIRED",
        },
        { status: 400 }
      );
    }

    // 4. Verify the token
    const isValid = await verifyEmailToken(token, user.id);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // 5. Send confirmation email
    try {
      const parent = await getParentByUserId(user.id);
      await sendEmailVerificationSuccess(
        email,
        parent?.name || "User"
      );
    } catch (emailError) {
      console.error("Failed to send verification confirmation email:", emailError);
      // Don't fail the verification if confirmation email fails
    }

    return NextResponse.json(
      {
        message: "Email verified successfully. You can now log in.",
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for email verification via link click
 * Redirects to verify-email page with token and email
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json(
      { error: "Missing token or email" },
      { status: 400 }
    );
  }

  // Verify the token
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/verification-failed`
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/verification-success?already=true`
      );
    }

    // Verify token
    const isValid = await verifyEmailToken(token, user.id);

    if (!isValid) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/verification-failed`
      );
    }

    // Send confirmation email
    try {
      const parent = await getParentByUserId(user.id);
      await sendEmailVerificationSuccess(
        email,
        parent?.name || "User"
      );
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/verification-success`
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/verification-failed`
    );
  }
}

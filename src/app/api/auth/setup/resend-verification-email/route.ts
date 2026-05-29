import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getProfileSetupToken } from "@/lib/profile-setup-token";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { setupToken } = await request.json();

    if (!setupToken) {
      return NextResponse.json(
        { success: false, error: "missing_fields" },
        { status: 400 }
      );
    }

    // Get and validate setup token
    const token = await getProfileSetupToken(setupToken);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "invalid_token" },
        { status: 401 }
      );
    }

    // Find or create email verification token
    let emailVerificationToken = await prisma.emailVerificationToken.findFirst(
      {
        where: { userId: token.userId },
        orderBy: { createdAt: "desc" },
      }
    );

    if (!emailVerificationToken || emailVerificationToken.verifiedAt) {
      // Create new token
      const emailToken = crypto.randomBytes(32).toString("hex");
      emailVerificationToken = await prisma.emailVerificationToken.create({
        data: {
          userId: token.userId,
          token: emailToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: token.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "user_not_found" },
        { status: 404 }
      );
    }

    // TODO: Send email verification link
    // const verificationLink = `${baseUrl}/auth/verify-email?token=${emailVerificationToken.token}`;
    // await sendVerificationEmail(user.email, verificationLink);

    console.log(
      `[Email] Verification link: /auth/verify-email?token=${emailVerificationToken.token}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Verification email sent",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Resend verification email error:", error);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { markProfileSetupTokenAsUsed } from "@/lib/profile-setup-token";

export async function POST(request: NextRequest) {
  try {
    const { token, setupToken } = await request.json();

    if (!token || !setupToken) {
      return NextResponse.json(
        { success: false, error: "missing_fields" },
        { status: 400 }
      );
    }

    // Validate email verification token
    const emailToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!emailToken) {
      return NextResponse.json(
        { success: false, error: "invalid_token" },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (emailToken.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "token_expired" },
        { status: 401 }
      );
    }

    // Check if already verified
    if (emailToken.verifiedAt) {
      return NextResponse.json(
        { success: false, error: "already_verified" },
        { status: 400 }
      );
    }

    // Mark email as verified
    const user = await prisma.user.update({
      where: { id: emailToken.userId },
      data: { emailVerified: new Date() },
    });

    // Mark token as verified
    await prisma.emailVerificationToken.update({
      where: { id: emailToken.id },
      data: { verifiedAt: new Date() },
    });

    // Mark setup token as used
    try {
      await markProfileSetupTokenAsUsed(setupToken);
    } catch (e) {
      // Ignore if setup token doesn't exist or is expired
    }

    // Create registration notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "REGISTRATION_CREATED",
        title: "Welcome to Pratibha Parishad!",
        body: "Your account has been successfully created. You can now start registering for competitions.",
        actionUrl: "/parent/dashboard",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
        redirectUrl: "/parent/dashboard",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}

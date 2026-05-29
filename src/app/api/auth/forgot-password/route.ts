import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/db";
import { sendEmailPasswordReset } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Delete any existing unused tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
      });

      // Create new reset token (valid for 1 hour)
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      // Send password reset email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
      const resetUrl = `${appUrl}/reset-password?token=${token}`;

      try {
        await sendEmailPasswordReset(email, resetUrl);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
      }
    }

    // Always return success to avoid email enumeration attacks
    return NextResponse.json(
      { message: "If that email is registered, a reset link has been sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

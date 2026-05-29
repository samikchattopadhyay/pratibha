import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  getProfileSetupToken,
  updateProfileSetupToken,
} from "@/lib/profile-setup-token";

export async function POST(request: NextRequest) {
  try {
    const { setupToken, otpToken, otp } = await request.json();

    if (!setupToken || !otpToken || !otp) {
      return NextResponse.json(
        { success: false, error: "missing_fields" },
        { status: 400 }
      );
    }

    // Get and validate setup token
    const token = await getProfileSetupToken(setupToken);
    if (!token || token.stage !== "phone") {
      return NextResponse.json(
        { success: false, error: "invalid_token" },
        { status: 401 }
      );
    }

    // Get temp data
    const tempData = token.data as Record<string, any>;
    if (!tempData?.otpCode || !tempData?.tempPhone) {
      return NextResponse.json(
        { success: false, error: "setup_incomplete" },
        { status: 400 }
      );
    }

    // Validate OTP token
    if (tempData.otpToken !== otpToken) {
      return NextResponse.json(
        { success: false, error: "invalid_otp_token" },
        { status: 401 }
      );
    }

    // Check OTP expiry
    if (new Date(tempData.otpExpiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: "otp_expired" },
        { status: 401 }
      );
    }

    // Validate OTP code
    if (tempData.otpCode !== otp) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_otp",
          message: "Invalid OTP code",
        },
        { status: 400 }
      );
    }

    // Create Parent profile with verified phone
    const parent = await prisma.parent.create({
      data: {
        userId: token.userId,
        name: tempData.name || "User", // Could be set from Facebook profile
        phone: tempData.tempPhone,
      },
    });

    // Generate email verification token
    import("crypto").then(async (crypto) => {
      const emailToken = crypto.randomBytes(32).toString("hex");
      const emailVerificationToken =
        await prisma.emailVerificationToken.create({
          data: {
            userId: token.userId,
            token: emailToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });

      // TODO: Send email verification link
      // const verificationLink = `${baseUrl}/auth/verify-email?token=${emailToken}`;
      // await sendVerificationEmail(user.email, verificationLink);
    });

    // Update token stage
    await updateProfileSetupToken(setupToken, "email_verify");

    return NextResponse.json(
      {
        success: true,
        nextStage: "email_verify",
        setupToken,
        message: "Phone verified. Check your email for verification link.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Confirm OTP error:", error);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}

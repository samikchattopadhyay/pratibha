import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  getProfileSetupToken,
  updateProfileSetupToken,
} from "@/lib/profile-setup-token";
import {
  validatePhoneFormat,
  normalizePhone,
  generateOTP,
  generateOTPToken,
  sendOTPSMS,
} from "@/lib/phone-verification";
import crypto from "crypto";

const OTP_TOKEN_EXPIRY = parseInt(process.env.OTP_TOKEN_EXPIRY || "600"); // 10 minutes

export async function POST(request: NextRequest) {
  try {
    const { setupToken, phone } = await request.json();

    if (!setupToken || !phone) {
      return NextResponse.json(
        { success: false, error: "missing_fields" },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!validatePhoneFormat(phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_phone",
          message: "Invalid phone format. Use format: +91-XXXXXXXXXX",
        },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    // Get and validate setup token
    const token = await getProfileSetupToken(setupToken);
    if (!token || token.stage !== "phone") {
      return NextResponse.json(
        { success: false, error: "invalid_token" },
        { status: 401 }
      );
    }

    // Check if phone is already registered
    const existingParent = await prisma.parent.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingParent) {
      return NextResponse.json(
        {
          success: false,
          error: "phone_exists",
          message: "This phone number is already registered",
        },
        { status: 409 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpToken = generateOTPToken();

    // Send OTP via SMS
    const smsSent = await sendOTPSMS(normalizedPhone, otp);

    if (!smsSent) {
      return NextResponse.json(
        { success: false, error: "sms_failed" },
        { status: 500 }
      );
    }

    // Store temp phone and OTP in token data
    await updateProfileSetupToken(setupToken, "phone", {
      tempPhone: normalizedPhone,
      otpCode: otp,
      otpToken,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent to your phone",
        otpToken,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify phone error:", error);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}

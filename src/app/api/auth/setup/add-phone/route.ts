import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  getProfileSetupToken,
  updateProfileSetupToken,
} from "@/lib/profile-setup-token";
import {
  validatePhoneFormat,
  normalizePhone,
} from "@/lib/phone-verification";

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

    // Create Parent profile with phone
    const tempData = token.data as Record<string, any> || {};
    await prisma.parent.create({
      data: {
        userId: token.userId,
        name: tempData.name || "User",
        phone: normalizedPhone,
      },
    });

    // Update token stage to email verification
    await updateProfileSetupToken(setupToken, "email_verify");

    return NextResponse.json(
      {
        success: true,
        message: "Phone number saved. Verify your email next.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Add phone error:", error);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}

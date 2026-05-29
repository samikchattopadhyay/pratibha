import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { updateUser } from "@/lib/db/queries";
import {
  getProfileSetupToken,
  updateProfileSetupToken,
  markProfileSetupTokenAsUsed,
} from "@/lib/profile-setup-token";

export async function POST(request: NextRequest) {
  try {
    const { setupToken, password } = await request.json();

    if (!setupToken || !password) {
      return NextResponse.json(
        { success: false, error: "missing_fields" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "weak_password",
          message: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    // Get and validate setup token
    const token = await getProfileSetupToken(setupToken);
    if (!token || token.stage !== "password") {
      return NextResponse.json(
        { success: false, error: "invalid_token" },
        { status: 401 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password
    await updateUser(token.userId, { passwordHash });

    // Update token stage
    await updateProfileSetupToken(setupToken, "phone");

    return NextResponse.json(
      {
        success: true,
        nextStage: "phone",
        setupToken,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { users, passwordSetupTokens, judges } from "@/lib/db/schema";
import { getPasswordSetupTokenByToken, updateUser, updatePasswordSetupToken } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const setupToken = await db.query.passwordSetupTokens.findFirst({
      where: eq(passwordSetupTokens.token, token),
      with: {
        user: true,
      },
    });

    if (!setupToken) {
      return NextResponse.json({ error: "Invalid token", valid: false, reason: "invalid" }, { status: 400 });
    }

    if (setupToken.usedAt) {
      return NextResponse.json({ error: "Token already used", valid: false, reason: "used" }, { status: 400 });
    }

    if (new Date() > setupToken.expiresAt) {
      return NextResponse.json({ error: "Token expired", valid: false, reason: "expired" }, { status: 400 });
    }

    // Try to get judge profile for name
    const judge = await db.query.judges.findFirst({
      where: eq(judges.userId, setupToken.user.id),
    });

    const judgeName = judge?.name || setupToken.user.email;

    return NextResponse.json({
      valid: true,
      name: judgeName,
      email: setupToken.user.email,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Token, password, and confirmPassword are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters long" },
        { status: 400 }
      );
    }

    const setupToken = await getPasswordSetupTokenByToken(token);

    if (!setupToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (setupToken.usedAt) {
      return NextResponse.json({ error: "Token already used" }, { status: 400 });
    }

    if (new Date() > setupToken.expiresAt) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash })
        .where(eq(users.id, setupToken.userId));

      await tx
        .update(passwordSetupTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordSetupTokens.id, setupToken.id));
    });

    return NextResponse.json({ message: "Password set successfully" }, { status: 200 });
  } catch (error) {
    console.error("Password setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateProfileSetupToken } from "@/lib/profile-setup-token";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const setupToken = await generateProfileSetupToken(userId, "password");

    return NextResponse.json({
      token: setupToken.token,
      setupUrl: `/auth/setup/set-password?token=${setupToken.token}`,
    });
  } catch (error: any) {
    console.error("Generate setup token error:", error);
    return NextResponse.json(
      { error: "Failed to generate setup token" },
      { status: 500 }
    );
  }
}

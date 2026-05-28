import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import { generateProfileSetupToken } from "@/lib/profile-setup-token";

interface OnboardingStatusResponse {
  passwordSet: boolean;
  phoneSet: boolean;
  emailVerified: boolean;
  addressSet: boolean;
  setupToken?: string;
}

interface SessionUser {
  id: string;
  email: string;
  role: string;
}

export async function GET(): Promise<NextResponse<OnboardingStatusResponse | { error: string }>> {
  try {
    const session = await getEdgeSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as SessionUser).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "PARENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parent = await prisma.parent.findUnique({
      where: { userId },
    });

    const passwordSet = user.passwordHash !== null;
    const phoneSet = parent !== null && parent.phone !== null;
    const emailVerified = user.emailVerified !== null;
    const addressSet =
      parent !== null &&
      parent.address !== null &&
      parent.city !== null &&
      parent.state !== null &&
      parent.postalCode !== null;

    let setupToken: string | undefined;

    // Generate token only if password or phone steps are needed
    if (!passwordSet || !phoneSet) {
      try {
        const existingToken = await prisma.profileSetupToken.findFirst({
          where: {
            userId,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });

        if (existingToken && existingToken.expiresAt > new Date()) {
          setupToken = existingToken.token;
        } else {
          const newToken = await generateProfileSetupToken(userId, !passwordSet ? "password" : "phone");
          setupToken = newToken.token;
        }
      } catch (error) {
        console.error("Error generating setup token:", error);
      }
    }

    const response: OnboardingStatusResponse = {
      passwordSet,
      phoneSet,
      emailVerified,
      addressSet,
    };

    if (setupToken) {
      response.setupToken = setupToken;
    }

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Onboarding status error:", errorMessage);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

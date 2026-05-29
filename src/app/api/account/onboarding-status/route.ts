import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getUserById,
  getParentByUserId,
  getUnusedProfileSetupToken,
} from "@/lib/db/queries";
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
    const user = await getUserById(userId);

    if (!user || user.role !== "PARENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parent = await getParentByUserId(userId);

    const passwordSet = user.passwordHash !== null;
    const phoneSet = !!parent && parent.phone !== null;
    const emailVerified = user.emailVerified !== null;
    const addressSet =
      !!parent &&
      parent.address !== null &&
      parent.city !== null &&
      parent.state !== null &&
      parent.postalCode !== null;

    let setupToken: string | undefined;

    // Generate token only if password or phone steps are needed
    if (!passwordSet || !phoneSet) {
      try {
        const existingToken = await getUnusedProfileSetupToken(userId);

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

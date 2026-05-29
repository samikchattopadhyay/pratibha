import { NextRequest, NextResponse } from "next/server";
import {
  createOrGetFacebookUser,
  getFacebookSetupToken,
} from "@/lib/facebook-oauth";

export async function POST(request: NextRequest) {
  try {
    const { email, name, facebookId, profileImageUrl } = await request.json();

    if (!email || !facebookId) {
      return NextResponse.json(
        { success: false, error: "missing_fields" },
        { status: 400 }
      );
    }

    const { user, isNewUser, isLinked } = await createOrGetFacebookUser({
      id: facebookId,
      name,
      email,
      picture: profileImageUrl
        ? { data: { url: profileImageUrl } }
        : undefined,
    });

    // Generate setup token for new or newly linked users
    const setupToken = await getFacebookSetupToken(user.id);

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        setupToken: setupToken.token,
        isNewUser,
        isLinked,
        message: isNewUser
          ? "Account created. Complete your profile."
          : "Welcome back! Complete your setup.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Facebook user error:", error);
    return NextResponse.json(
      { success: false, error: "internal_error", message: error.message },
      { status: 500 }
    );
  }
}

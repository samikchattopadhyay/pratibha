import prisma from "@/lib/db";
import { generateProfileSetupToken } from "@/lib/profile-setup-token";

export interface FacebookProfile {
  id: string;
  name?: string;
  email?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

export async function createOrGetFacebookUser(profile: FacebookProfile) {
  // Check if user exists by Facebook ID
  let user = await prisma.user.findFirst({
    where: {
      facebookId: profile.id,
    },
  });

  if (user) {
    return { user, isNewUser: false };
  }

  // Check if user exists by email
  if (profile.email) {
    user = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (user) {
      // Link Facebook ID to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { facebookId: profile.id },
      });
      return { user, isNewUser: false, isLinked: true };
    }
  }

  // Create new user
  if (!profile.email) {
    throw new Error("Facebook email not available");
  }

  user = await prisma.user.create({
    data: {
      email: profile.email,
      facebookId: profile.id,
      passwordHash: null, // OAuth user has no password
      profileImageUrl: profile.picture?.data?.url || null,
      emailVerified: null, // Even if Facebook provided email, mark as unverified
      role: "PARENT",
    },
  });

  return { user, isNewUser: true };
}

export async function getFacebookSetupToken(userId: string) {
  const setupToken = await generateProfileSetupToken(userId, "password");
  return setupToken;
}

export async function validateFacebookEmailUniqueness(
  email: string,
  excludeUserId?: string
) {
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      ...(excludeUserId && { id: { not: excludeUserId } }),
    },
  });

  return !existingUser;
}

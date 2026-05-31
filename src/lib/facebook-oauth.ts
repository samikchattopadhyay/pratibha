import {
  getUserByFacebookId,
  getUserByEmail,
  updateUserFacebookId,
  createUser,
  findUserByEmailExcluding
} from "@/lib/db/queries";
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
  let user = await getUserByFacebookId(profile.id);

  if (user) {
    return { user, isNewUser: false };
  }

  // Check if user exists by email
  if (profile.email) {
    user = await getUserByEmail(profile.email);

    if (user) {
      // Link Facebook ID to existing user
      const updated = await updateUserFacebookId(user.id, profile.id);
      return { user: updated[0], isNewUser: false, isLinked: true };
    }
  }

  // Create new user
  if (!profile.email) {
    throw new Error("Facebook email not available");
  }

  const created = await createUser({
    email: profile.email,
    facebookId: profile.id,
    passwordHash: null,
    profileImageUrl: profile.picture?.data?.url || null,
    emailVerified: null,
    role: "PARENT",
  });

  return { user: created[0], isNewUser: true };
}

export async function getFacebookSetupToken(userId: string) {
  const setupToken = await generateProfileSetupToken(userId, "password");
  return setupToken;
}

export async function validateFacebookEmailUniqueness(
  email: string,
  excludeUserId?: string
) {
  const existingUser = await (excludeUserId
    ? findUserByEmailExcluding(email, excludeUserId)
    : getUserByEmail(email));

  return !existingUser;
}

import { db } from "@/lib/db/drizzle";
import { profileSetupTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SETUP_TOKEN_EXPIRY = parseInt(process.env.SETUP_TOKEN_EXPIRY || "3600"); // 1 hour default

export async function generateProfileSetupToken(
  userId: string,
  stage: "password" | "phone" | "email_verify",
  data?: Record<string, string | number | boolean | Date>
) {
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

  const result = await db
    .insert(profileSetupTokens)
    .values({
      userId,
      token,
      stage,
      data: data ? data : undefined,
      expiresAt: new Date(Date.now() + SETUP_TOKEN_EXPIRY * 1000),
    })
    .returning();

  return result[0];
}

export async function getProfileSetupToken(token: string) {
  const setupToken = await db.query.profileSetupTokens.findFirst({
    where: eq(profileSetupTokens.token, token),
    with: { user: true },
  });

  if (!setupToken) {
    return null;
  }

  // Check expiry
  if (setupToken.expiresAt < new Date()) {
    return null;
  }

  // Check if already used
  if (setupToken.usedAt) {
    return null;
  }

  return setupToken;
}

export async function updateProfileSetupToken(
  token: string,
  stage: "password" | "phone" | "email_verify",
  data?: Record<string, string | number | boolean | Date>
) {
  const result = await db
    .update(profileSetupTokens)
    .set({
      stage,
      data: data ? data : undefined,
      expiresAt: new Date(Date.now() + SETUP_TOKEN_EXPIRY * 1000),
    })
    .where(eq(profileSetupTokens.token, token))
    .returning();

  return result[0];
}

export async function markProfileSetupTokenAsUsed(token: string) {
  const result = await db
    .update(profileSetupTokens)
    .set({ usedAt: new Date() })
    .where(eq(profileSetupTokens.token, token))
    .returning();

  return result[0];
}

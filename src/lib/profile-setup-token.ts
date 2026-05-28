import crypto from "crypto";
import prisma from "@/lib/db";

const SETUP_TOKEN_EXPIRY = parseInt(process.env.SETUP_TOKEN_EXPIRY || "3600"); // 1 hour default

export async function generateProfileSetupToken(
  userId: string,
  stage: "password" | "phone" | "email_verify",
  data?: Record<string, string | number | boolean | Date>
) {
  const token = crypto.randomBytes(32).toString("hex");

  const profileSetupToken = await prisma.profileSetupToken.create({
    data: {
      userId,
      token,
      stage,
      data: data ? data : undefined,
      expiresAt: new Date(Date.now() + SETUP_TOKEN_EXPIRY * 1000),
    },
  });

  return profileSetupToken;
}

export async function getProfileSetupToken(token: string) {
  const setupToken = await prisma.profileSetupToken.findUnique({
    where: { token },
    include: { user: true },
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
  const updated = await prisma.profileSetupToken.update({
    where: { token },
    data: {
      stage,
      data: data ? data : undefined,
      expiresAt: new Date(Date.now() + SETUP_TOKEN_EXPIRY * 1000),
    },
  });

  return updated;
}

export async function markProfileSetupTokenAsUsed(token: string) {
  return prisma.profileSetupToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });
}

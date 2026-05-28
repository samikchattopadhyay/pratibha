import crypto from "crypto";
import prisma from "@/lib/db";

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a verification token for a user.
 * Token is cryptographically random, hashed in DB for security.
 * Returns unhashed token for inclusion in verification URL.
 */
export async function generateVerificationToken(userId: string): Promise<string> {
  // 1. Generate random token (64 hex = 32 bytes)
  const randomToken = crypto.randomBytes(32).toString("hex");

  // 2. Hash token for secure storage
  const hashedToken = crypto
    .createHash("sha256")
    .update(randomToken)
    .digest("hex");

  // 3. Store in database
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
    },
  });

  // 4. Return unhashed token for URL
  return randomToken;
}

/**
 * Verify an email token and mark user as verified.
 * Returns true if verification successful, false otherwise.
 */
export async function verifyEmailToken(
  token: string,
  userId: string
): Promise<boolean> {
  // 1. Hash the provided token for comparison
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 2. Find the token record
  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      token: hashedToken,
      userId,
      expiresAt: { gt: new Date() }, // Not expired
      verifiedAt: null, // Not already used
    },
  });

  if (!record) {
    return false;
  }

  // 3. Mark token as used and user as verified in transaction
  try {
    await prisma.$transaction(async (tx) => {
      // Mark token as verified
      await tx.emailVerificationToken.update({
        where: { id: record.id },
        data: { verifiedAt: new Date() },
      });

      // Mark user email as verified
      await tx.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
      });
    });

    return true;
  } catch (error) {
    console.error("Error verifying email token:", error);
    return false;
  }
}

/**
 * Check if a token has expired
 */
export async function isTokenExpired(token: string): Promise<boolean> {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token: hashedToken },
  });

  if (!record) return true;

  return record.expiresAt < new Date();
}

/**
 * Count recent verification requests to implement rate limiting
 */
export async function countRecentVerificationRequests(
  email: string,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): Promise<number> {
  return prisma.emailVerificationToken.count({
    where: {
      user: { email },
      createdAt: { gt: new Date(Date.now() - windowMs) },
    },
  });
}

/**
 * Clean up expired tokens (optional - run via cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.emailVerificationToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
      verifiedAt: null, // Only delete unverified tokens
    },
  });

  return result.count;
}

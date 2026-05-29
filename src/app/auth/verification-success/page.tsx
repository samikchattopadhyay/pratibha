"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerificationSuccessPage() {
  const searchParams = useSearchParams();
  const alreadyVerified = searchParams.get("already") === "true";

  return (
    <div className="min-h-screen bg-charcoal dark:bg-charcoal-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg p-8 text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-charcoal dark:text-white">
          {alreadyVerified ? "Already Verified" : "Email Verified!"}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {alreadyVerified
            ? "Your email was already verified. You can now log in."
            : "Your email has been verified successfully. You can now log in to your account."}
        </p>
        <Link
          href="/login"
          className="block w-full bg-gold text-charcoal py-3 px-4 rounded-lg font-semibold hover:bg-gold/90 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

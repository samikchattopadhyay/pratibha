"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SetupOnboarding from "@/components/auth/SetupOnboarding";
import Loading from "@/components/Loading";

export default function OnboardingPage() {
  const { status, data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Redirect non-PARENT users away from onboarding
    if (status === "authenticated" && session?.user) {
      const userRole = (session.user as { role?: string }).role;
      if (userRole !== "PARENT") {
        if (userRole === "SUPER_ADMIN" || userRole === "MODERATOR") {
          router.push("/admin/dashboard");
        } else if (userRole === "JUDGE") {
          router.push("/judge/dashboard");
        }
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <Loading variant="screen" text="Loading..." />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Check if user is PARENT
  const userRole = (session?.user as { role?: string })?.role;
  if (userRole !== "PARENT") {
    return null;
  }

  return <SetupOnboarding />;
}

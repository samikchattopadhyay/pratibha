"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import SetupOnboarding from "@/components/auth/SetupOnboarding";
import Loading from "@/components/Loading";

export default function OnboardingPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <Loading variant="screen" text="Loading..." />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <SetupOnboarding />;
}

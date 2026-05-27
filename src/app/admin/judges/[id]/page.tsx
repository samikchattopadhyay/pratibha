import { Suspense } from "react";
import { redirect } from "next/navigation";
import Loading from "@/components/Loading";
import JudgesDetailsLayout from "@/components/admin/JudgesDetailsLayout";
import type { JudgeMetadata } from "@/types/judges-details";

async function fetchJudgeMetadata(judgeId: string): Promise<JudgeMetadata | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const res = await fetch(
      `${baseUrl}/api/admin/judges/${judgeId}`,
      {
        cache: "no-store", // Fresh data on each request
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error(`[JudgeDetails] API error: ${res.status}`);
      return null;
    }

    const data: JudgeMetadata = await res.json();
    return data;
  } catch (err) {
    console.error("[JudgeDetails] Fetch failed:", err);
    return null;
  }
}

export default async function JudgeDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  // ✅ Pattern: Always await params first (Next.js 15+)
  const { id: judgeId } = await params;

  // Fetch metadata server-side (no client waterfall)
  const judge = await fetchJudgeMetadata(judgeId);

  // Handle 404: redirect to judges grid
  if (!judge) {
    redirect("/admin/dashboard?tab=judges");
  }

  // ✅ Pattern: All data serialized (strings, numbers, booleans, objects/arrays)
  // ✅ Safety: Suspense boundary with fallback
  return (
    <Suspense fallback={<Loading variant="screen" text="Loading judge details..." />}>
      <JudgesDetailsLayout
        judge={judge}
        judgeId={judgeId}
      />
    </Suspense>
  );
}

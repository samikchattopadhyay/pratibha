import { Suspense } from "react";
import { redirect } from "next/navigation";
import Loading from "@/components/Loading";
import CompetitionDetailsLayout from "@/components/admin/CompetitionDetailsLayout";
import { CompetitionMetadata } from "@/types/competition-details";

async function fetchCompetitionMetadata(
  competitionId: string
): Promise<CompetitionMetadata | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/admin/competitions/${competitionId}`,
      { cache: "no-store" }
    );

    console.log(`[DEBUG] Fetching /api/admin/competitions/${competitionId}`);
    console.log(`[DEBUG] Status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[DEBUG] API error response: ${errorText}`);
      return null;
    }

    const data = await res.json();
    console.log(`[DEBUG] Competition data:`, data);
    return data;
  } catch (err) {
    console.error("Failed to fetch competition metadata:", err);
    return null;
  }
}

export default async function CompetitionDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { id: competitionId } = await params;

  // Fetch competition metadata server-side
  const competition = await fetchCompetitionMetadata(competitionId);

  if (!competition) {
    // Redirect to competitions list if competition not found
    redirect("/admin/dashboard?tab=competitions");
  }

  return (
    <Suspense fallback={<Loading variant="screen" text="Loading competition..." />}>
      <CompetitionDetailsLayout
        competition={competition}
        competitionId={competitionId}
      />
    </Suspense>
  );
}

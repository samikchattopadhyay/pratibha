import { Suspense } from "react";
import { redirect } from "next/navigation";
import Loading from "@/components/Loading";
import ParentEntryDetailsLayout from "@/components/account/entry-details/ParentEntryDetailsLayout";
import type { ParentEntryDetails } from "@/types/account-entry-details";

async function fetchEntryDetails(entryId: string): Promise<ParentEntryDetails | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/account/entries/${entryId}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`[ParentEntryDetails] API error: ${res.status}`);
      return null;
    }

    const data: ParentEntryDetails = await res.json();
    return data;
  } catch (err) {
    console.error("[ParentEntryDetails] Fetch failed:", err);
    return null;
  }
}

export default async function ParentEntryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: entryId } = await params;

  const entry = await fetchEntryDetails(entryId);

  if (!entry) {
    redirect("/account/dashboard?tab=entries");
  }

  return (
    <Suspense fallback={<Loading variant="screen" text="Loading entry details..." />}>
      <ParentEntryDetailsLayout entry={entry} />
    </Suspense>
  );
}

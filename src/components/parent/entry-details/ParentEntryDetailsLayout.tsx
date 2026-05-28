"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ParentEntryDetails } from "@/types/parent-entry-details";
import EntryHeader from "./EntryHeader";
import CompetitionSection from "./CompetitionSection";
import EvaluationSection from "./EvaluationSection";
import CertificateSection from "./CertificateSection";
import PrizeSection from "./PrizeSection";

interface ParentEntryDetailsLayoutProps {
  readonly entry: ParentEntryDetails;
}

export default function ParentEntryDetailsLayout({
  entry,
}: ParentEntryDetailsLayoutProps) {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("student") || entry.studentId;
  const backUrl = `/parent/dashboard?tab=entries&student=${studentId}`;

  return (
    <div className="min-h-screen bg-cream-dark/10 dark:bg-charcoal text-charcoal dark:text-cream flex flex-col font-sans">
      <Header />

      <main className="flex-1 px-4 py-8 md:px-6 md:py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back Link */}
          <Link href={backUrl} className="text-terracotta dark:text-gold hover:underline font-semibold text-sm">
            ← Back to Entries
          </Link>

          {/* Entry Header */}
          <EntryHeader entry={entry} />

          {/* Competition Section */}
          <CompetitionSection entry={entry} />

          {/* Evaluation Section (conditional) */}
          {entry.scoringFinalized && <EvaluationSection entry={entry} />}

          {/* Certificate Section (conditional) */}
          {entry.certificate && <CertificateSection certificate={entry.certificate} />}

          {/* Prize Section (conditional) */}
          {entry.prizeAward && <PrizeSection prizeAward={entry.prizeAward} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { ExternalLink } from "lucide-react";
import type { ParentEntryDetails } from "@/types/parent-entry-details";

interface CompetitionSectionProps {
  readonly entry: ParentEntryDetails;
}

export default function CompetitionSection({ entry }: CompetitionSectionProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ageRange = entry.minAge && entry.maxAge ? `${entry.minAge}–${entry.maxAge} years` : "All ages";

  return (
    <div className="bg-cream dark:bg-charcoal-light rounded-2xl p-6 border border-terracotta/10 dark:border-terracotta/20">
      <h2 className="text-sm uppercase font-bold text-charcoal/50 dark:text-cream/50 tracking-wider mb-4">
        Competition Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase font-bold text-charcoal/40 dark:text-cream/40 mb-1">
              Scope
            </p>
            <p className="text-charcoal dark:text-cream font-medium">
              {entry.competitionScope === "NATIONAL" ? "National" : "State-Level"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase font-bold text-charcoal/40 dark:text-cream/40 mb-1">
              Age Eligibility
            </p>
            <p className="text-charcoal dark:text-cream font-medium">{ageRange}</p>
          </div>

          <div>
            <p className="text-xs uppercase font-bold text-charcoal/40 dark:text-cream/40 mb-1">
              Competition Period
            </p>
            <p className="text-charcoal dark:text-cream font-medium">
              {formatDate(entry.startDate)} – {formatDate(entry.endDate)}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase font-bold text-charcoal/40 dark:text-cream/40 mb-1">
              Submission Date
            </p>
            <p className="text-charcoal dark:text-cream font-medium">{formatDate(entry.createdAt)}</p>
          </div>

          <div>
            <p className="text-xs uppercase font-bold text-charcoal/40 dark:text-cream/40 mb-1">
              Result Date
            </p>
            <p className="text-charcoal dark:text-cream font-medium">
              {entry.resultDate ? formatDate(entry.resultDate) : "TBD"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase font-bold text-charcoal/40 dark:text-cream/40 mb-1">
              Video Submission
            </p>
            <a
              href={entry.fbPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-terracotta dark:text-gold font-medium text-sm hover:underline truncate"
            >
              <span className="truncate">{new URL(entry.fbPostUrl).hostname}</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

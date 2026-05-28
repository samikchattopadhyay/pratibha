import type { ParentEntryDetails } from "@/types/account-entry-details";

interface EntryHeaderProps {
  readonly entry: ParentEntryDetails;
}

export default function EntryHeader({ entry }: EntryHeaderProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_VERIFICATION: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
      VERIFIED: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300",
      REJECTED: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
      DISQUALIFIED: "border-red-600/30 bg-red-600/10 text-red-700 dark:text-red-400",
    };
    return colors[status] || colors.PENDING_VERIFICATION;
  };

  const getPaymentColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
      SUCCESS: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300",
      FAILED: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
    };
    return colors[status] || colors.PENDING;
  };

  return (
    <div className="bg-cream dark:bg-charcoal-light rounded-2xl p-6 border border-terracotta/10 dark:border-terracotta/20 space-y-4">
      <div>
        <p className="text-xs uppercase font-bold text-charcoal/50 dark:text-cream/50 tracking-wider mb-2">
          {entry.competitionScope === "NATIONAL" ? "🌍 National" : "🏛️ State"} Competition
        </p>
        <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-cream mb-1">
          {entry.competitionTitle}
        </h1>
        <p className="text-sm text-charcoal/60 dark:text-cream/60">
          Category: {entry.categoryName}
        </p>
      </div>

      <div className="pt-4 border-t border-terracotta/10 dark:border-terracotta/20 space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-xs uppercase font-bold text-charcoal/50 dark:text-cream/50 mb-1">
              Student
            </p>
            <p className="font-semibold text-charcoal dark:text-cream">
              {entry.studentName}
            </p>
            <p className="text-xs text-charcoal/60 dark:text-cream/60">
              Age: {entry.studentAge} years
            </p>
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-charcoal/50 dark:text-cream/50 mb-1">
              Registration ID
            </p>
            <p className="font-mono text-sm font-semibold text-terracotta dark:text-gold">
              {entry.registrationId}
            </p>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-terracotta/10 dark:border-terracotta/20">
        <span
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${getStatusColor(
            entry.status
          )}`}
        >
          {entry.status.replace(/_/g, " ")}
        </span>
        <span
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${getPaymentColor(
            entry.paymentStatus
          )}`}
        >
          {entry.paymentStatus === "SUCCESS" ? "✓ Paid" : `${entry.paymentStatus} Payment`}
        </span>
      </div>
    </div>
  );
}

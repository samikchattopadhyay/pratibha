import { Download, QrCode, Clock } from "lucide-react";
import type { ParentCertificate } from "@/types/parent-entry-details";

interface CertificateSectionProps {
  readonly certificate: ParentCertificate;
}

export default function CertificateSection({ certificate }: CertificateSectionProps) {
  const getCertificateTypeColor = (type: string) => {
    const colors: Record<string, { badge: string; bg: string }> = {
      MERIT_1: {
        badge: "px-3 py-1 rounded-lg text-xs font-bold uppercase bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30",
        bg: "from-yellow-50 to-transparent dark:from-yellow-950/10",
      },
      MERIT_2: {
        badge: "px-3 py-1 rounded-lg text-xs font-bold uppercase bg-gray-400/20 text-gray-700 dark:text-gray-300 border border-gray-400/30",
        bg: "from-gray-50 to-transparent dark:from-gray-950/10",
      },
      MERIT_3: {
        badge: "px-3 py-1 rounded-lg text-xs font-bold uppercase bg-orange-600/20 text-orange-700 dark:text-orange-300 border border-orange-600/30",
        bg: "from-orange-50 to-transparent dark:from-orange-950/10",
      },
      SPECIAL_MENTION: {
        badge: "px-3 py-1 rounded-lg text-xs font-bold uppercase bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30",
        bg: "from-purple-50 to-transparent dark:from-purple-950/10",
      },
      PARTICIPATION: {
        badge: "px-3 py-1 rounded-lg text-xs font-bold uppercase bg-terracotta/20 text-terracotta dark:text-terracotta-light border border-terracotta/30",
        bg: "from-terracotta/5 to-transparent dark:from-terracotta/10",
      },
    };
    return colors[type] || colors.PARTICIPATION;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const colors = getCertificateTypeColor(certificate.type);
  const isPending = certificate.status === "PENDING";

  return (
    <div
      className={`bg-gradient-to-r ${colors.bg} rounded-2xl p-6 border border-terracotta/10 dark:border-terracotta/20`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm uppercase font-bold text-charcoal/50 dark:text-cream/50 tracking-wider mb-3">
            Certificate
          </h2>
          <div className={colors.badge}>
            {certificate.type === "MERIT_1"
              ? "🥇 Merit Certificate"
              : certificate.type === "MERIT_2"
                ? "🥈 Merit Certificate"
                : certificate.type === "MERIT_3"
                  ? "🥉 Merit Certificate"
                  : certificate.type === "SPECIAL_MENTION"
                    ? "⭐ Special Mention"
                    : "🎖️ Participation"}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-charcoal/70 dark:text-cream/70 text-sm">Issued Date</span>
          <span className="font-medium text-charcoal dark:text-cream text-sm">
            {formatDate(certificate.issuedAt)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-charcoal/70 dark:text-cream/70 text-sm">Certificate ID</span>
          <span className="font-mono text-charcoal dark:text-cream text-sm">{certificate.certificateId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-charcoal/70 dark:text-cream/70 text-sm">Status</span>
          <span className="text-charcoal dark:text-cream text-sm font-medium">
            {certificate.status === "PENDING"
              ? "⏳ Generating"
              : certificate.status === "GENERATED"
                ? "✓ Ready"
                : certificate.status === "SHARED"
                  ? "✓ Shared"
                  : "✕ Revoked"}
          </span>
        </div>
      </div>

      {isPending ? (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
          <p className="text-sm text-yellow-900 dark:text-yellow-200 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Certificate generation in progress
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <a
            href={certificate.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta dark:bg-gold text-cream dark:text-charcoal rounded-lg font-semibold text-sm hover:shadow-lg transition-shadow"
          >
            <Download className="w-4 h-4" />
            Download Certificate
          </a>
          <a
            href={certificate.qrCodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal/10 dark:bg-cream/10 text-charcoal dark:text-cream rounded-lg font-semibold text-sm border border-charcoal/20 dark:border-cream/20 hover:bg-charcoal/15 dark:hover:bg-cream/15 transition"
          >
            <QrCode className="w-4 h-4" />
            Verify (QR Code)
          </a>
        </div>
      )}
    </div>
  );
}

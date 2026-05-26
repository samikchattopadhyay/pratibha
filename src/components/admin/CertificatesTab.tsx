"use client";

import Button from "@/components/Button";

export interface CertificateMetrics {
  generated: number;
  pending: number;
  qrSuccessRate: number;
  sharedOnSocials: number;
}

interface CertificatesTabProps {
  certificateMetrics: CertificateMetrics | null;
  handleBulkGenerateCertificates: () => Promise<void>;
  navigateToTab: (tab: string) => void;
  setFilter: (filter: string) => void;
}

export default function CertificatesTab({
  certificateMetrics,
  handleBulkGenerateCertificates,
  navigateToTab,
  setFilter,
}: CertificatesTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-base font-bold">Certificates Verification & Share Queue</h3>
          <Button
            onClick={handleBulkGenerateCertificates}
            variant="primary"
            size="md"
          >
            Bulk Generate PDF
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm font-semibold text-center">
          <div className="p-4 bg-charcoal rounded-xl border border-terracotta/5">
            <p className="text-xl font-serif text-gold font-bold">{certificateMetrics?.generated || 0}</p>
            <p className="text-sm text-cream/50 mt-1">Generated and Signed</p>
          </div>
          <div
            onClick={() => {
              navigateToTab("participants");
              setFilter("PENDING");
            }}
            className="p-4 bg-charcoal rounded-xl border border-terracotta/5 cursor-pointer hover:border-yellow-500/30 hover:bg-charcoal-light transition-all select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigateToTab("participants");
                setFilter("PENDING");
              }
            }}
          >
            <p className="text-xl font-serif text-yellow-400 font-bold">{certificateMetrics?.pending || 0}</p>
            <p className="text-sm text-cream/50 mt-1">Pending Generation</p>
          </div>
          <div className="p-4 bg-charcoal rounded-xl border border-terracotta/5">
            <p className="text-xl font-serif text-blue-400 font-bold">{certificateMetrics?.qrSuccessRate || 100}%</p>
            <p className="text-sm text-cream/50 mt-1">Verification QR Success</p>
          </div>
          <div className="p-4 bg-charcoal rounded-xl border border-terracotta/5">
            <p className="text-xl font-serif text-green-400 font-bold">{certificateMetrics?.sharedOnSocials || 0}</p>
            <p className="text-sm text-cream/50 mt-1">Shared on FB/WA</p>
          </div>
        </div>
      </div>
    </div>
  );
}

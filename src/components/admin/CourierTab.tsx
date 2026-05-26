"use client";

import Button from "@/components/Button";

interface CourierDashboardData {
  metrics?: {
    courierPending?: number;
    certificatesGenerated?: number;
  };
}

interface CourierTabProps {
  dashboardData: CourierDashboardData | null;
  triggerToast: (msg: string) => void;
}

export default function CourierTab({
  dashboardData,
  triggerToast,
}: CourierTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-base font-bold">eCommerce Dispatch Fulfillment Pipeline</h3>
          <Button
            onClick={() => triggerToast("Labels printed and pickup scheduled with Shiprocket.")}
            variant="primary"
            size="md"
          >
            Print Labels & Schedule Pickup
          </Button>
        </div>
        
        {/* Visual Shipment Timeline */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-terracotta/10">
          {[
            { label: "Ready for Dispatch", count: dashboardData?.metrics?.courierPending || 0, current: false },
            { label: "Labels Generated", count: "0", current: true },
            { label: "Pickup Scheduled", count: "0", current: false },
            { label: "In Transit", count: "0", current: false },
            { label: "Delivered", count: dashboardData?.metrics?.certificatesGenerated || 0, current: false }
          ].map((step, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center text-center relative w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step.current ? "bg-gold text-charcoal" : "bg-charcoal border border-terracotta/30 text-cream/70"
              }`}>
                {idx + 1}
              </div>
              <p className="text-sm font-bold mt-2">{step.label}</p>
              <p className="text-sm font-serif text-gold font-bold">{step.count} packages</p>
            </div>
          ))}
        </div>

        <div className="text-sm font-semibold text-red-400">
          ⚠️ No failed deliveries reported for active shipments.
        </div>
      </div>
    </div>
  );
}

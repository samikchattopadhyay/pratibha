import { Truck, Package } from "lucide-react";
import type { ParentPrizeAward } from "@/types/account-entry-details";

interface PrizeSectionProps {
  readonly prizeAward: ParentPrizeAward;
}

export default function PrizeSection({ prizeAward }: PrizeSectionProps) {
  const getRankLabel = (rank: string) => {
    const labels: Record<string, string> = {
      FIRST_PLACE: "🥇 First Place",
      SECOND_PLACE: "🥈 Second Place",
      THIRD_PLACE: "🥉 Third Place",
      MERIT_1: "Merit (1st)",
      MERIT_2: "Merit (2nd)",
      MERIT_3: "Merit (3rd)",
      SPECIAL_MENTION: "⭐ Special Mention",
      PEOPLES_CHOICE: "👥 People's Choice",
      PARTICIPATION: "Participation",
    };
    return labels[rank] || rank;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-cream dark:bg-charcoal-light rounded-2xl p-6 border border-terracotta/10 dark:border-terracotta/20">
      <h2 className="text-sm uppercase font-bold text-charcoal/50 dark:text-cream/50 tracking-wider mb-4">
        Prize & Award
      </h2>

      <div className="space-y-4">
        {/* Award Details */}
        <div className="p-4 bg-gradient-to-r from-gold/5 to-transparent dark:from-gold/10 rounded-lg border border-gold/20 dark:border-gold/30">
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-xs uppercase font-bold text-charcoal/50 dark:text-cream/50 mb-1">
                  Rank
                </p>
                <p className="text-lg font-bold text-charcoal dark:text-cream">
                  {getRankLabel(prizeAward.rank)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-charcoal/50 dark:text-cream/50 mb-1">
                Prize
              </p>
              <p className="font-semibold text-charcoal dark:text-cream">
                {prizeAward.prizeTitle}
              </p>
              <p className="text-xs text-charcoal/60 dark:text-cream/60">{prizeAward.prizeType}</p>
            </div>
          </div>
        </div>

        {/* Shipping Info (for physical items) */}
        {prizeAward.isPhysical && (
          <div className="p-4 rounded-lg bg-charcoal/2.5 dark:bg-charcoal/30 border border-terracotta/15 dark:border-terracotta/25">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-terracotta dark:text-gold" />
              <p className="font-semibold text-charcoal dark:text-cream">Dispatch Status</p>
            </div>

            {!prizeAward.isDispatched ? (
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-900/30">
                <p className="text-sm text-orange-900 dark:text-orange-200">
                  ⏳ Awaiting dispatch — Your prize will be shipped soon.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {prizeAward.shipping && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/70 dark:text-cream/70">Courier</span>
                      <span className="font-medium text-charcoal dark:text-cream">
                        {prizeAward.shipping.courierName || "—"}
                      </span>
                    </div>

                    {prizeAward.shipping.awbNumber && (
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal/70 dark:text-cream/70">Tracking Number</span>
                        <span className="font-mono font-medium text-charcoal dark:text-cream">
                          {prizeAward.shipping.awbNumber}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/70 dark:text-cream/70">Dispatched</span>
                      <span className="font-medium text-charcoal dark:text-cream">
                        {formatDate(prizeAward.dispatchedAt) || "—"}
                      </span>
                    </div>

                    {prizeAward.shipping.estimatedDelivery && (
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal/70 dark:text-cream/70">Estimated Delivery</span>
                        <span className="font-medium text-charcoal dark:text-cream">
                          {formatDate(prizeAward.shipping.estimatedDelivery)}
                        </span>
                      </div>
                    )}

                    {prizeAward.shipping.deliveredAt && (
                      <div className="flex justify-between text-sm pt-3 border-t border-charcoal/10 dark:border-cream/10">
                        <span className="text-charcoal/70 dark:text-cream/70 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-green-600 dark:text-green-400" />
                          Delivered
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatDate(prizeAward.shipping.deliveredAt)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

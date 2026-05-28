"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Button from "@/components/Button";
import { calculateProfileCompletion, getMissingProfileFields } from "@/lib/utils/profile";

interface ParentProfile {
  id: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  preferredState?: string | null;
}

interface ProfileCompletionCardProps {
  parent: ParentProfile;
  onOpenModal: () => void;
  onClose: () => void;
}

export default function ProfileCompletionCard({
  parent,
  onOpenModal,
  onClose,
}: ProfileCompletionCardProps) {
  const completion = calculateProfileCompletion(parent);
  const missingFields = getMissingProfileFields(parent);
  const [isSkipped, setIsSkipped] = useState(false);

  if (completion === 100 || isSkipped) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-terracotta/5 to-gold/5 dark:from-terracotta/10 dark:to-gold/10 border border-terracotta/20 dark:border-terracotta/30 rounded-2xl p-6 sm:p-8 shadow-md">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-terracotta dark:bg-gold text-cream dark:text-charcoal flex items-center justify-center flex-shrink-0 mt-1">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream">
              Complete Your Profile
            </h3>
            <p className="text-sm text-charcoal/60 dark:text-cream/60 mt-1">
              Your profile is {completion}% complete
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-charcoal/40 dark:text-cream/40 hover:text-charcoal dark:hover:text-cream transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase text-charcoal/60 dark:text-cream/60">
            Progress
          </span>
          <span className="text-sm font-bold text-terracotta dark:text-gold">{completion}%</span>
        </div>
        <div className="w-full h-2 bg-charcoal/10 dark:bg-charcoal/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-terracotta to-gold transition-all duration-300"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-xs font-bold uppercase text-charcoal/60 dark:text-cream/60">
            Missing Information:
          </p>
          <div className="space-y-1.5">
            {missingFields.map((field) => (
              <div key={field} className="flex items-center gap-2 text-sm text-charcoal/70 dark:text-cream/70">
                <div className="w-4 h-4 rounded border border-charcoal/30 dark:border-cream/30" />
                <span>{field}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onOpenModal}
          variant="primary"
          size="md"
          className="flex-1 sm:flex-none"
        >
          Complete Now
        </Button>
        <Button
          onClick={() => setIsSkipped(true)}
          variant="outline"
          size="md"
          className="flex-1 sm:flex-none"
        >
          Skip for Now
        </Button>
      </div>

      <p className="text-xs text-charcoal/50 dark:text-cream/50 mt-4">
        💡 Your address details are needed for certificates and competition communications.
      </p>
    </div>
  );
}

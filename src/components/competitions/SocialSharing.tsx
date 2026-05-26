"use client";

import { Share2, Copy, CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import Button from "../Button";

interface SocialSharingProps {
  competitionTitle: string;
  competitionUrl: string;
  winnerCount?: number;
  certificatesAvailable?: boolean;
}

export default function SocialSharing({
  competitionTitle,
  competitionUrl,
  winnerCount = 0,
  certificatesAvailable = false,
}: SocialSharingProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(competitionUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Pre-formatted social media messages
  const shareMessages = {
    facebook: `I participated in ${competitionTitle}! Check out the amazing performances and results on Pratibha Parishad.`,
    linkedin: `Excited to have participated in ${competitionTitle}! 🎭 Just reviewed my performance evaluation on Pratibha Parishad. Great experience competing with ${winnerCount > 0 ? `${winnerCount} other ` : ""}talented individuals from across the country.`,
    twitter: `Amazing experience participating in ${competitionTitle}! 🏆 Competing with talented peers @PratibhaParishad`,
    whatsapp: `Check out ${competitionTitle} results and winner showcase on Pratibha Parishad! 🎉`,
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(competitionUrl)}&quote=${encodeURIComponent(shareMessages.facebook)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(competitionUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(competitionUrl)}&text=${encodeURIComponent(shareMessages.twitter)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareMessages.whatsapp + " " + competitionUrl)}`,
  };

  return (
    <section className="py-16 bg-gradient-to-r from-terracotta/5 to-gold/5 dark:from-charcoal-light dark:to-charcoal border-y border-terracotta/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex p-3 bg-terracotta/10 dark:bg-gold/10 text-terracotta dark:text-gold rounded-full">
            <Share2 className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal dark:text-cream">
            Share Your Achievement
          </h2>
          <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
            Celebrate your performance and invite others to discover Pratibha Parishad
          </p>
        </div>

        {/* Social Sharing Buttons */}
        <div className="space-y-6">
          {/* Main Share Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Facebook */}
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold">f</div>
              <span className="font-sans font-bold text-sm text-charcoal dark:text-cream text-center">
                Facebook
              </span>
            </a>

            {/* LinkedIn */}
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:border-blue-700 dark:hover:border-blue-400 transition-all hover:shadow-md"
            >
              <div className="w-6 h-6 bg-blue-700 rounded-md flex items-center justify-center text-white text-xs font-bold">in</div>
              <span className="font-sans font-bold text-sm text-charcoal dark:text-cream text-center">
                LinkedIn
              </span>
            </a>

            {/* Twitter */}
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-300 transition-all hover:shadow-md"
            >
              <div className="w-6 h-6 bg-blue-400 rounded-md flex items-center justify-center text-white text-xs font-bold">X</div>
              <span className="font-sans font-bold text-sm text-charcoal dark:text-cream text-center">
                Twitter/X
              </span>
            </a>

            {/* WhatsApp */}
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:border-green-500 dark:hover:border-green-400 transition-all hover:shadow-md"
            >
              <Send className="w-6 h-6 text-green-500" />
              <span className="font-sans font-bold text-sm text-charcoal dark:text-cream text-center">
                WhatsApp
              </span>
            </a>
          </div>

          {/* Copy Link Section */}
          <div className="bg-white dark:bg-charcoal border border-terracotta/10 rounded-xl p-4 space-y-3">
            <p className="font-sans text-sm font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider">
              Or copy the link to share
            </p>
            <div className="flex gap-2 items-stretch">
              <input
                type="text"
                value={competitionUrl}
                readOnly
                className="flex-1 px-4 py-2.5 bg-cream-dark/20 dark:bg-charcoal-light border border-terracotta/10 rounded-lg font-sans text-base text-charcoal/80 dark:text-cream/80 truncate"
              />
              <Button
                onClick={handleCopyLink}
                variant={copiedLink ? "secondary" : "primary"}
                size="md"
                className={copiedLink ? "bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700" : ""}
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-charcoal/5 dark:bg-cream/5 border border-charcoal/10 dark:border-cream/10 rounded-xl p-6 space-y-4">
            <p className="font-sans font-bold text-sm text-charcoal dark:text-cream flex items-center gap-2">
              <span className="text-lg">💡</span>
              Pro Tips for Maximum Engagement
            </p>
            <ul className="space-y-2 text-sm font-sans text-charcoal/75 dark:text-cream/75">
              <li className="flex gap-2">
                <span className="text-terracotta dark:text-gold font-bold">•</span>
                <span>
                  <strong>LinkedIn is best for portfolios:</strong> Share your achievement with professional networks and showcase your talent for college applications.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-terracotta dark:text-gold font-bold">•</span>
                <span>
                  <strong>Facebook for family & friends:</strong> Let your community celebrate your success and encourage participation next year.
                </span>
              </li>
              {certificatesAvailable && (
                <li className="flex gap-2">
                  <span className="text-terracotta dark:text-gold font-bold">•</span>
                  <span>
                    <strong>Download your certificate first:</strong> Include your certificate image in profile headers or dedicated portfolio sections.
                  </span>
                </li>
              )}
              <li className="flex gap-2">
                <span className="text-terracotta dark:text-gold font-bold">•</span>
                <span>
                  <strong>Tag and encourage:</strong> Tag your school, teacher, or fellow participants to build a supportive community.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

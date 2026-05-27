"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer, MessageCircle, Share2, Award, CheckCircle } from "lucide-react";

interface CertificateHeaderProps {
  certificateId: string;
  isDemo: boolean;
}

export default function CertificateHeader({ certificateId, isDemo }: CertificateHeaderProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const getCertificateUrl = () => {
    return `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${encodeURIComponent(certificateId)}`;
  };

  const handleShareWhatsApp = () => {
    const url = getCertificateUrl();
    const message = encodeURIComponent(
      `🎓 Hey! I earned a certificate in a fine arts competition!\n\nVerify my achievement here: ${url}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
    setSuccessMessage("✓ Opening WhatsApp...");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleShareInstagram = () => {
    const url = getCertificateUrl();
    navigator.clipboard.writeText(`Check out my certificate: ${url}`).then(() => {
      setSuccessMessage("✓ Certificate link copied! Share on Instagram Stories or Feed.");
      setTimeout(() => setSuccessMessage(""), 4000);
    }).catch(() => {
      setError("Failed to copy link");
      setTimeout(() => setError(""), 3000);
    });
  };

  return (
    <>
      {/* Verification Header Status Panel */}
      <div className="bg-charcoal text-cream-dark py-4 px-6 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-gold hover:underline">
              <Award className="w-5 h-5" />
              <span className="font-serif font-bold text-sm tracking-wide">প্রতিভা परिषद</span>
            </Link>
            <span className="text-cream/30">|</span>
            <span className="flex items-center gap-1 text-green-400 text-sm font-bold">
              <CheckCircle className="w-4 h-4" /> Authenticity Verified Online
            </span>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            {isDemo && (
              <span className="text-sm bg-yellow-500/20 text-yellow-300 font-bold px-2 py-1 rounded">
                DEMO RECORD
              </span>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-gold/10 text-gold hover:bg-gold/20 rounded-lg transition-colors"
              title="Print or save as PDF"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            <button
              onClick={handleShareInstagram}
              className="flex items-center gap-1.5 px-3 py-2 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 rounded-lg transition-colors"
              title="Share on Instagram"
            >
              <Share2 className="w-4 h-4" /> Instagram
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mt-3 text-center text-sm text-green-400 font-semibold">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mt-3 text-center text-sm text-red-400 font-semibold">
            {error}
          </div>
        )}
      </div>
    </>
  );
}

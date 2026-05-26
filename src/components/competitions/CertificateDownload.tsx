"use client";

import { Download, Share2, CheckCircle2, Award, Sparkles } from "lucide-react";
import { useState } from "react";
import Button from "../Button";

interface CertificateInfo {
  studentName: string;
  certificateType: "PARTICIPATION" | "MERIT_1" | "MERIT_2" | "MERIT_3" | "SPECIAL_MENTION";
  finalRank?: number;
  categoryName: string;
  certificateUrl: string;
  qrCodeUrl: string;
  competitionTitle: string;
  issueDate: string;
}

interface CertificateDownloadProps {
  certificates: CertificateInfo[];
  competitionTitle: string;
  isParticipantLoggedIn?: boolean;
}

export default function CertificateDownload({
  certificates,
  competitionTitle,
  isParticipantLoggedIn = false,
}: CertificateDownloadProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopy = (certificateUrl: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${baseUrl}/certificates/${certificateUrl}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(certificateUrl);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getCertificateTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PARTICIPATION: "Participation Certificate",
      MERIT_1: "Merit Certificate - 1st Place",
      MERIT_2: "Merit Certificate - 2nd Place",
      MERIT_3: "Merit Certificate - 3rd Place",
      SPECIAL_MENTION: "Special Mention Certificate",
    };
    return labels[type] || "Certificate";
  };

  const getCertificateColor = (type: string) => {
    if (type.includes("MERIT_1")) return "border-gold/20 bg-gold/5";
    if (type.includes("MERIT_2")) return "border-gold/15 bg-gold/3";
    if (type.includes("MERIT_3")) return "border-gold/10 bg-gold/2";
    return "border-terracotta/10 bg-cream-dark/10 dark:bg-charcoal-light/10";
  };

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-16">
        <div className="inline-flex p-3 bg-gold/10 text-gold rounded-full">
          <Award className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">
          Your Certificates
        </h2>
        <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
          Download and share your achievement certificates from {competitionTitle}
        </p>
        <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert, idx) => (
            <div
              key={idx}
              className={`border rounded-2xl p-6 space-y-4 transition-all hover:shadow-md ${getCertificateColor(
                cert.certificateType
              )}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream">
                    {getCertificateTypeLabel(cert.certificateType)}
                  </h3>
                  <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 mt-1">
                    {cert.categoryName}
                  </p>
                </div>
                {cert.finalRank && (
                  <div className="px-3 py-1.5 bg-gold/15 rounded-full text-center">
                    <p className="font-serif font-bold text-gold text-sm">
                      Rank #{cert.finalRank}
                    </p>
                  </div>
                )}
              </div>

              {/* Certificate Preview */}
              <div className="relative bg-cream dark:bg-charcoal border border-terracotta/10 rounded-lg overflow-hidden aspect-video">
                <img
                  src={cert.certificateUrl}
                  alt="Certificate preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gold animate-pulse" />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 border-t border-terracotta/10 pt-3 text-sm">
                <div>
                  <p className="text-charcoal/50 dark:text-cream/50 font-bold uppercase">
                    Issued Date
                  </p>
                  <p className="text-charcoal dark:text-cream font-semibold mt-1">
                    {new Date(cert.issueDate).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-charcoal/50 dark:text-cream/50 font-bold uppercase">
                    Certificate ID
                  </p>
                  <p className="text-charcoal dark:text-cream font-mono text-xs mt-1 truncate">
                    {cert.certificateUrl.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = cert.certificateUrl;
                    link.setAttribute('download', '');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  variant="primary"
                  size="md"
                  className="flex-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  onClick={() => handleCopy(cert.certificateUrl)}
                  variant={copiedLink === cert.certificateUrl ? "secondary" : "outline"}
                  size="md"
                  className={`flex-1 ${copiedLink === cert.certificateUrl ? "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300" : ""}`}
                >
                  <Share2 className="w-4 h-4" />
                  {copiedLink === cert.certificateUrl ? "Copied!" : "Share"}
                </Button>
              </div>

              {/* LinkedIn Share Tip */}
              <div className="bg-charcoal/5 dark:bg-cream/5 rounded-lg p-3 border border-charcoal/10 dark:border-cream/10">
                <div className="flex gap-2">
                  <Sparkles className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <p className="font-sans text-sm text-charcoal/70 dark:text-cream/70 leading-relaxed">
                    Tip: Share your certificate on LinkedIn to showcase your talent and
                    achievement to your professional network.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isParticipantLoggedIn ? (
        <div className="text-center py-12 bg-cream-dark/10 dark:bg-charcoal-light/10 rounded-xl border border-terracotta/5">
          <Award className="w-12 h-12 text-terracotta/40 dark:text-gold/40 mx-auto mb-3" />
          <p className="font-sans text-charcoal/70 dark:text-cream/70">
            Certificates will be available once judging is complete and results are published.
          </p>
        </div>
      ) : (
        <div className="text-center py-12 bg-terracotta/5 dark:bg-gold/5 rounded-xl border border-terracotta/10 dark:border-gold/10">
          <Award className="w-12 h-12 text-terracotta dark:text-gold mx-auto mb-3" />
          <p className="font-sans text-charcoal dark:text-cream font-semibold mb-2">
            Login to View Your Certificates
          </p>
          <p className="font-sans text-sm text-charcoal/70 dark:text-cream/70 mb-4">
            Sign in with your parent account to access and download your child&apos;s achievement
            certificates.
          </p>
          <Button variant="primary">
            Sign In Now
          </Button>
        </div>
      )}
    </section>
  );
}

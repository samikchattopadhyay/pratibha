"use client";

import { useState, useEffect } from "react";
import type { StudentCertificate } from "@/types/student-details";
import Loading from "@/components/Loading";

interface AchievementsSubTabProps {
  readonly studentId: string;
}

const typeColorMap: Record<string, { bg: string; text: string; badge: string }> = {
  PARTICIPATION: { bg: "bg-blue-500/10", text: "text-blue-300", badge: "Participation" },
  MERIT_1: { bg: "bg-yellow-500/10", text: "text-yellow-300", badge: "Merit 1" },
  MERIT_2: { bg: "bg-yellow-500/10", text: "text-yellow-300", badge: "Merit 2" },
  MERIT_3: { bg: "bg-yellow-500/10", text: "text-yellow-300", badge: "Merit 3" },
  SPECIAL_MENTION: { bg: "bg-purple-500/10", text: "text-purple-300", badge: "Special Mention" },
};

export default function AchievementsSubTab({ studentId }: AchievementsSubTabProps) {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const res = await fetch(
          `${baseUrl}/api/admin/students/${studentId}/certificates`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const data: StudentCertificate[] = await res.json();
          setCertificates(data);
        }
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, [studentId]);

  if (isLoading) {
    return <Loading variant="overlay" text="Loading achievements..." />;
  }

  if (certificates.length === 0) {
    return (
      <div className="bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg p-8 text-center">
        <p className="text-cream/60 mb-2">No achievements yet</p>
        <p className="text-sm text-cream/40">Keep competing to earn certificates!</p>
      </div>
    );
  }

  // Count awards by type
  const awardCounts = certificates.reduce(
    (acc, cert) => {
      acc[cert.type] = (acc[cert.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Summary Badges */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(awardCounts).map(([type, count]) => {
          const colors = typeColorMap[type];
          return (
            <div
              key={type}
              className={`${colors.bg} border border-amber-500/20 rounded-lg p-3 text-center`}
            >
              <p className={`text-xl font-bold ${colors.text}`}>{count}</p>
              <p className="text-xs text-cream/60 mt-1">{colors.badge}</p>
            </div>
          );
        })}
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((cert) => {
          const colors = typeColorMap[cert.type];
          return (
            <div
              key={cert.id}
              className={`${colors.bg} border border-amber-500/20 rounded-lg p-5 flex flex-col`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className={`text-sm font-bold ${colors.text}`}>{colors.badge}</p>
                  <p className="text-sm text-cream font-semibold mt-1 line-clamp-2">
                    {cert.competitionTitle}
                  </p>
                </div>
              </div>

              <div className="text-xs text-cream/60 mb-3 space-y-1">
                <p>{cert.categoryName}</p>
                <p>{new Date(cert.issuedDate).toLocaleDateString()}</p>
                {cert.rank && <p>Rank: {cert.rank}</p>}
              </div>

              <div className="flex gap-2 mt-auto pt-3 border-t border-amber-500/10">
                {cert.certificateUrl && (
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-2 py-1.5 rounded bg-gold/20 text-gold text-xs font-bold text-center hover:bg-gold/30 transition-colors"
                  >
                    Download
                  </a>
                )}
                {cert.qrCodeUrl && (
                  <a
                    href={cert.qrCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-2 py-1.5 rounded bg-gold/20 text-gold text-xs font-bold text-center hover:bg-gold/30 transition-colors"
                  >
                    QR Code
                  </a>
                )}
              </div>

              <p className={`text-xs font-bold mt-3 text-center ${
                cert.status === "SHARED"
                  ? "text-green-400"
                  : cert.status === "GENERATED"
                    ? "text-blue-400"
                    : "text-yellow-400"
              }`}>
                {cert.status}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

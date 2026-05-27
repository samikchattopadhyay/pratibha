"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CompetitionMetadata } from "@/types/competition-details";
import { Calendar, Users, MapPin, CheckCircle, FileText, Truck } from "lucide-react";
import Loading from "@/components/Loading";

interface DetailsSubTabProps {
  competition: CompetitionMetadata;
  competitionId: string;
}

interface SummaryData {
  participants: { verified: number; pending: number; rejected: number; disqualified: number };
  voting: { submitted: number; pending: number };
  certificates: { generated: number; pending: number };
  shipping: { inTransit: number; delivered: number; pending: number };
}

export default function DetailsSubTab({ competition, competitionId }: DetailsSubTabProps) {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const [participantsRes, votingRes, certificatesRes, shippingRes] = await Promise.all([
          fetch(`/api/admin/competitions/${competitionId}/participants?limit=1000`),
          fetch(`/api/admin/competitions/${competitionId}/voting?limit=1000`),
          fetch(`/api/admin/competitions/${competitionId}/certificates?limit=1000`),
          fetch(`/api/admin/competitions/${competitionId}/shipping?limit=1000`),
        ]);

        const participantsData = await participantsRes.json();
        const votingData = await votingRes.json();
        const certificatesData = await certificatesRes.json();
        const shippingData = await shippingRes.json();

        const participants = participantsData.data || [];
        const voting = votingData.data || [];
        const certificates = certificatesData.data || [];
        const shipping = shippingData.data || [];

        setSummaryData({
          participants: {
            verified: participants.filter((p: any) => p.status === "VERIFIED").length,
            pending: participants.filter((p: any) => p.status === "PENDING_VERIFICATION").length,
            rejected: participants.filter((p: any) => p.status === "REJECTED").length,
            disqualified: participants.filter((p: any) => p.status === "DISQUALIFIED").length,
          },
          voting: {
            submitted: voting.filter((v: any) => v.submittedCount > 0).length,
            pending: voting.filter((v: any) => v.submittedCount === 0).length,
          },
          certificates: {
            generated: certificates.filter((c: any) => c.status !== "PENDING").length,
            pending: certificates.filter((c: any) => c.status === "PENDING").length,
          },
          shipping: {
            inTransit: shipping.filter((s: any) => s.status === "IN_TRANSIT").length,
            delivered: shipping.filter((s: any) => s.status === "DELIVERED").length,
            pending: shipping.filter((s: any) => ["PENDING", "LABEL_GENERATED", "PICKED_UP"].includes(s.status)).length,
          },
        });
      } catch (err) {
        console.error("Failed to fetch summary data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [competitionId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner with Title Overlay */}
      <div className="relative rounded-lg overflow-hidden h-80 bg-charcoal-light border border-terracotta/20">
        {competition.bannerUrl ? (
          <Image
            src={competition.bannerUrl}
            alt={competition.title}
            width={1200}
            height={400}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-charcoal to-charcoal-light" />
        )}

        {/* Title Overlay with Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent flex flex-col justify-end p-8">
          <h1 className="text-4xl md:text-5xl font-bold text-cream drop-shadow-lg" style={{
            textShadow: `
              0 0 10px rgba(218, 165, 32, 0.8),
              0 0 20px rgba(218, 165, 32, 0.6),
              0 0 30px rgba(218, 165, 32, 0.4),
              2px 2px 4px rgba(0, 0, 0, 0.8)`
          }}>
            {competition.title}
          </h1>

          {/* Badges below title */}
          <div className="flex gap-2 flex-wrap mt-4">
            <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase backdrop-blur-sm ${
              competition.isActive
                ? "bg-green-500/30 text-green-200 border border-green-400/50"
                : "bg-red-500/30 text-red-200 border border-red-400/50"
            }`}>
              {competition.isActive ? "● Active" : "● Closed"}
            </span>
            <span className="px-4 py-2 rounded-full text-xs font-bold uppercase backdrop-blur-sm bg-gold/20 text-gold border border-gold/40">
              {competition.scope === "NATIONAL" ? "🌍 National" : "🗺️ State"}
            </span>
            <span className="px-4 py-2 rounded-full text-xs font-bold uppercase backdrop-blur-sm bg-terracotta/20 text-terracotta border border-terracotta/40">
              📂 {competition.category}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {loading && <Loading variant="overlay" text="Loading summary data..." />}

      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Participants Summary */}
          <div className="bg-charcoal-light rounded-lg border border-terracotta/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-gold" />
              <h3 className="text-sm font-bold text-cream">Participants</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-cream/60">Verified</span>
                <span className="font-bold text-green-400">{summaryData.participants.verified}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">Pending</span>
                <span className="font-bold text-yellow-400">{summaryData.participants.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">Rejected</span>
                <span className="font-bold text-red-400">{summaryData.participants.rejected}</span>
              </div>
              {summaryData.participants.disqualified > 0 && (
                <div className="flex justify-between">
                  <span className="text-cream/60">Disqualified</span>
                  <span className="font-bold text-red-500">{summaryData.participants.disqualified}</span>
                </div>
              )}
            </div>
          </div>

          {/* Voting Summary */}
          <div className="bg-charcoal-light rounded-lg border border-terracotta/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-terracotta" />
              <h3 className="text-sm font-bold text-cream">Live Voting</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-cream/60">Submitted</span>
                <span className="font-bold text-green-400">{summaryData.voting.submitted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">Pending</span>
                <span className="font-bold text-yellow-400">{summaryData.voting.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">Total Judges</span>
                <span className="font-bold text-cream">{competition.totalJudges}</span>
              </div>
            </div>
          </div>

          {/* Certificates Summary */}
          <div className="bg-charcoal-light rounded-lg border border-terracotta/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gold" />
              <h3 className="text-sm font-bold text-cream">Certificates</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-cream/60">Generated</span>
                <span className="font-bold text-green-400">{summaryData.certificates.generated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">Pending</span>
                <span className="font-bold text-yellow-400">{summaryData.certificates.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">Total</span>
                <span className="font-bold text-cream">
                  {summaryData.certificates.generated + summaryData.certificates.pending}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Summary */}
          <div className="bg-charcoal-light rounded-lg border border-terracotta/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5 text-terracotta" />
              <h3 className="text-sm font-bold text-cream">Courier & Shipping</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-cream/60">Delivered</span>
                <span className="font-bold text-green-400">{summaryData.shipping.delivered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">In Transit</span>
                <span className="font-bold text-blue-400">{summaryData.shipping.inTransit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">Pending</span>
                <span className="font-bold text-yellow-400">{summaryData.shipping.pending}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Competition Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Competition Info */}
        <div className="bg-charcoal-light rounded-lg border border-terracotta/20 p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase text-gold tracking-wider">
            Competition Information
          </h3>

          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase font-bold text-cream/50 mb-1">Title</p>
              <p className="text-cream">{competition.title}</p>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-cream/50 mb-1">Category</p>
              <p className="text-cream">{competition.category}</p>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-cream/50 mb-1">Scope</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" />
                <span className="text-cream font-medium">
                  {competition.scope === "NATIONAL" ? "National" : "State"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-cream/50 mb-1">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                  competition.isActive
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {competition.isActive ? "Active" : "Closed"}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Info */}
        <div className="bg-charcoal-light rounded-lg border border-terracotta/20 p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase text-gold tracking-wider">
            Timeline
          </h3>

          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase font-bold text-cream/50 mb-1">
                Registration Deadline
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-terracotta" />
                <span className="text-cream font-medium">
                  {formatDate(competition.registrationDeadline)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-cream/50 mb-1">Start Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-terracotta" />
                <span className="text-cream font-medium">
                  {formatDate(competition.startDate)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-cream/50 mb-1">End Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-terracotta" />
                <span className="text-cream font-medium">
                  {formatDate(competition.endDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

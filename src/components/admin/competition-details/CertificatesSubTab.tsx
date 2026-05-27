"use client";

import { useEffect, useState, useCallback } from "react";
import { CertificateRecord, PaginatedResponse, CertificateStats, SubTabProps } from "@/types/competition-details";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Eye, XCircle } from "lucide-react";

type CertStatus = "ALL" | "PENDING" | "GENERATED" | "SHARED";

interface RevokeConfirmation {
  certId: string;
  studentName: string;
  certificateType: string;
}

export default function CertificatesSubTab({ competitionId }: SubTabProps) {
  const [data, setData] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeConfirm, setRevokeConfirm] = useState<RevokeConfirmation | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<CertStatus>("ALL");
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        status,
      });
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/certificates?${query.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch certificates");
      const { data, pagination } = await res.json() as PaginatedResponse<CertificateRecord>;
      setData(data);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [competitionId, currentPage, status]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/admin/competitions/${competitionId}/certificates/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const statsData = await res.json() as CertificateStats;
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [status]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleGenerateCertificates = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/certificates/generate`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Failed to generate certificates");
      const result = await res.json();
      setSuccessMessage(`✓ Generated ${result.generatedCount} certificates successfully!`);
      await fetchCertificates();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate certificates");
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmails = async () => {
    setNotifying(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/certificates/notify`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Failed to send emails");
      const result = await res.json();
      setSuccessMessage(`✓ Sent notifications to ${result.notifiedCount} parents!`);
      await fetchCertificates();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send emails");
    } finally {
      setNotifying(false);
    }
  };

  const handlePreview = (certificateId: string) => {
    window.open(`/verify/${encodeURIComponent(certificateId)}`, "_blank");
  };


  const handleRevokeClick = (cert: CertificateRecord) => {
    setRevokeConfirm({
      certId: cert.id,
      studentName: cert.studentName,
      certificateType: cert.type,
    });
  };

  const handleConfirmRevoke = async () => {
    if (!revokeConfirm) return;

    setRevoking(revokeConfirm.certId);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/certificates/${revokeConfirm.certId}/revoke`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Failed to revoke certificate");
      setSuccessMessage("✓ Certificate revoked successfully!");
      setRevokeConfirm(null);
      await fetchCertificates();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke certificate");
    } finally {
      setRevoking(null);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      GENERATED: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      SHARED: "bg-green-500/20 text-green-400 border border-green-500/30",
    };
    return colors[s] || "bg-gray-500/20 text-gray-400";
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PARTICIPATION: "bg-cream/5 text-cream/70",
      MERIT_1: "bg-gold/10 text-gold",
      MERIT_2: "bg-terracotta/10 text-terracotta",
      MERIT_3: "bg-blue-500/10 text-blue-400",
      SPECIAL_MENTION: "bg-purple-500/10 text-purple-400",
    };
    return colors[type] || "bg-gray-500/10 text-gray-400";
  };

  return (
    <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-serif text-base font-bold">Certificate Management</h3>
          <p className="text-sm text-cream/50 mt-1">
            Generate and track digital certificates for competition winners
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleSendEmails}
            disabled={notifying || loading}
            variant="secondary"
            size="md"
          >
            {notifying ? "Sending..." : "📧 Send Emails"}
          </Button>
          <Button
            onClick={handleGenerateCertificates}
            disabled={generating || loading}
            variant="primary"
            size="md"
          >
            {generating ? "Generating..." : "🎓 Generate Certificates"}
          </Button>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">
          {successMessage}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Stats Panel */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Pending", count: stats.byStatus.PENDING, color: "text-yellow-400" },
            { label: "Generated", count: stats.byStatus.GENERATED, color: "text-blue-400" },
            { label: "Shared", count: stats.byStatus.SHARED, color: "text-green-400" },
            { label: "Revoked", count: stats.byStatus.REVOKED, color: "text-red-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-cream/5 border border-terracotta/10 rounded-lg p-3 text-center"
            >
              <div className={`text-lg font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-xs text-cream/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "PENDING", "GENERATED", "SHARED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
              status === s
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal"
                : "bg-cream/5 text-cream/60 hover:bg-cream/10 hover:text-cream"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && <Loading variant="overlay" text="Loading certificates..." />}

      {/* Certificates Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-terracotta/10">
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Student</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Certificate Type</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Status</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="border-b border-terracotta/5 hover:bg-cream/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-cream font-medium">{row.studentName}</div>
                    <div className="text-cream/50 text-xs mt-0.5">ID: {row.registrationId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold inline-block ${getTypeColor(row.type)}`}>
                      {row.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase inline-block ${getStatusColor(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handlePreview(row.certificateId)}
                        className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 cursor-pointer transition-colors"
                        title="Preview certificate"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {row.status !== "REVOKED" && (
                        <button
                          onClick={() => handleRevokeClick(row)}
                          disabled={revoking === row.id}
                          className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Revoke certificate"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8 text-cream/40 italic">
                  No certificates found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount > 10 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-terracotta/10">
          <div className="text-sm text-cream/60 font-sans">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, totalCount)} of {totalCount} certificates
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="secondary"
              size="md"
            >
              Previous
            </Button>
            {getPageNumbers().map((page, idx) => (
              <Button
                key={idx}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={page === "..."}
                variant={page === currentPage ? "primary" : page === "..." ? "ghost" : "secondary"}
                size="md"
                className={page === "..." ? "cursor-default" : ""}
              >
                {page}
              </Button>
            ))}
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              variant="secondary"
              size="md"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!revokeConfirm}
        title="Revoke Certificate?"
        message={
          revokeConfirm ? (
            <div className="space-y-2">
              <p>
                You are about to revoke the certificate for <strong>{revokeConfirm.studentName}</strong>.
              </p>
              <p className="text-cream/70">
                Certificate Type: <strong>{revokeConfirm.certificateType.replace(/_/g, " ")}</strong>
              </p>
              <p className="text-red-400/80 text-xs mt-3">
                ⚠️ This action cannot be undone. The revoked certificate will no longer be valid for verification.
              </p>
            </div>
          ) : null
        }
        confirmText="Revoke Certificate"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={!!revoking}
        onConfirm={handleConfirmRevoke}
        onCancel={() => setRevokeConfirm(null)}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { ShippingRecord, PaginatedResponse, SubTabProps } from "@/types/competition-details";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { ExternalLink } from "lucide-react";

type ShipStatus = "ALL" | "PENDING" | "LABEL_GENERATED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";

export default function CourierShippingSubTab({ competitionId }: SubTabProps) {
  const [data, setData] = useState<ShippingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [shipStatus, setShipStatus] = useState<ShipStatus>("ALL");

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        status: shipStatus,
      });
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/shipping?${query.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch shipments");
      const { data, pagination } = await res.json() as PaginatedResponse<ShippingRecord>;
      setData(data);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [competitionId, currentPage, shipStatus]);

  useEffect(() => {
    // eslint-disable-next-line
    setCurrentPage(1);
  }, [shipStatus]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchShipments();
  }, [fetchShipments]);

  const handleCreateLabels = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/shipping/create-labels`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Failed to create labels");
      const result = await res.json();
      alert(`✓ Created ${result.createdCount} shipping labels successfully!`);
      await fetchShipments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create labels");
    } finally {
      setCreating(false);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      LABEL_GENERATED: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      PICKED_UP: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
      IN_TRANSIT: "bg-terracotta/20 text-terracotta border border-terracotta/30",
      DELIVERED: "bg-green-500/20 text-green-400 border border-green-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-serif text-base font-bold">Courier & Shipping</h3>
          <p className="text-sm text-cream/50 mt-1">
            Track physical award shipments and delivery status
          </p>
        </div>
        <Button
          onClick={handleCreateLabels}
          disabled={creating || loading}
          variant="primary"
          size="md"
        >
          {creating ? "Creating Labels..." : "📦 Create Shipping Labels"}
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "PENDING", "LABEL_GENERATED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setShipStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
              shipStatus === s
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal"
                : "bg-cream/5 text-cream/60 hover:bg-cream/10 hover:text-cream"
            }`}
          >
            {s === "LABEL_GENERATED" ? "Label Generated" : s === "IN_TRANSIT" ? "In Transit" : s}
          </button>
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && <Loading variant="overlay" text="Loading shipments..." />}

      {/* Shipments Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-terracotta/10">
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Registration ID</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Student Name</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Status</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Tracking ID</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Carrier</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">ETA</th>
              <th className="text-left px-4 py-3 text-cream/60 font-bold">Tracking</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="border-b border-terracotta/5 hover:bg-cream/5 transition-colors">
                  <td className="px-4 py-3 text-cream/80 font-mono text-xs">{row.registrationId}</td>
                  <td className="px-4 py-3 text-cream">{row.studentName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase inline-block ${getStatusColor(row.status)}`}>
                      {row.status === "LABEL_GENERATED" ? "Label Gen" : row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cream/70 text-xs font-mono">
                    {row.shipmentId ? row.shipmentId.substring(0, 12) + "..." : "—"}
                  </td>
                  <td className="px-4 py-3 text-cream/70 text-xs uppercase">{row.carrier || "—"}</td>
                  <td className="px-4 py-3 text-cream/70 text-xs">
                    {row.estimatedDelivery
                      ? new Date(row.estimatedDelivery).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.trackingUrl ? (
                      <a
                        href={row.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:text-terracotta flex items-center gap-1 text-xs font-bold"
                      >
                        Track <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-cream/40">No tracking</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-cream/40 italic">
                  No shipments found
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
            {Math.min(currentPage * 10, totalCount)} of {totalCount} shipments
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

      {/* Summary Metrics */}
      <div className="flex flex-wrap gap-4 text-xs text-cream/60 border-t border-terracotta/10 pt-4">
        <div>
          <span className="font-bold text-cream">Total Shipments:</span> {totalCount}
        </div>
        <div>
          <span className="font-bold text-cream">Pending:</span>{" "}
          {data.filter((d) => d.status === "PENDING").length}
        </div>
        <div>
          <span className="font-bold text-cream">In Transit:</span>{" "}
          {data.filter((d) => d.status === "IN_TRANSIT").length}
        </div>
        <div>
          <span className="font-bold text-cream">Delivered:</span>{" "}
          {data.filter((d) => d.status === "DELIVERED").length}
        </div>
      </div>
    </div>
  );
}

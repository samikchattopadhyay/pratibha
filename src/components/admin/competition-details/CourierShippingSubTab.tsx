"use client";

import { useEffect, useState, useCallback } from "react";
import { ShippingRecord, PaginatedResponse, SubTabProps } from "@/types/competition-details";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { ExternalLink, Truck, CheckCircle, Package, ArrowRight, Layers, HelpCircle, X } from "lucide-react";

type ShipStatus = "ALL" | "PENDING" | "LABEL_GENERATED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";
type CarrierType = "SHIPROCKET" | "DELHIVERY" | "INDIAPOST";

export default function CourierShippingSubTab({ competitionId }: SubTabProps) {
  const [data, setData] = useState<ShippingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [shipStatus, setShipStatus] = useState<ShipStatus>("ALL");

  // Carrier integration and selection states
  const [carrier, setCarrier] = useState<CarrierType>("SHIPROCKET");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  
  // Pipeline metrics state
  const [pipelineMetrics, setPipelineMetrics] = useState({
    PENDING: 0,
    LABEL_GENERATED: 0,
    PICKED_UP: 0,
    IN_TRANSIT: 0,
    DELIVERED: 0,
  });

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/competitions/${competitionId}/shipping?limit=1000`);
      if (res.ok) {
        const { data } = await res.json() as PaginatedResponse<ShippingRecord>;
        const counts = {
          PENDING: 0,
          LABEL_GENERATED: 0,
          PICKED_UP: 0,
          IN_TRANSIT: 0,
          DELIVERED: 0,
        };
        data.forEach((item) => {
          if (item.status === "PENDING") counts.PENDING++;
          else if (item.status === "LABEL_GENERATED") counts.LABEL_GENERATED++;
          else if (item.status === "PICKED_UP") counts.PICKED_UP++;
          else if (item.status === "IN_TRANSIT") counts.IN_TRANSIT++;
          else if (item.status === "DELIVERED") counts.DELIVERED++;
        });
        setPipelineMetrics(counts);
      }
    } catch (err) {
      console.error("Failed to load timeline metrics:", err);
    }
  }, [competitionId]);

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
    setCurrentPage(1);
    setSelectedIds([]);
  }, [shipStatus]);

  useEffect(() => {
    fetchShipments();
    fetchMetrics();
  }, [fetchShipments, fetchMetrics]);

  const handleCreateLabels = useCallback(async () => {
    setCreating(true);
    setError("");
    try {
      const payload = {
        carrier,
        shipmentIds: selectedIds.length > 0 ? selectedIds : undefined,
      };

      const res = await fetch(
        `/api/admin/competitions/${competitionId}/shipping/create-labels`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to create labels");
      const result = await res.json();
      alert(`✓ Created ${result.createdCount} shipping labels successfully via ${carrier}!`);
      setSelectedIds([]);
      await fetchShipments();
      await fetchMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create labels");
    } finally {
      setCreating(false);
    }
  }, [competitionId, carrier, selectedIds, fetchShipments, fetchMetrics]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select only pending items from current page
      const pendingIds = data
        .filter((row) => row.status === "PENDING")
        .map((row) => row.id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
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
      PICKUP_SCHEDULED: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
      IN_TRANSIT: "bg-terracotta/20 text-terracotta border border-terracotta/30",
      DELIVERED: "bg-green-500/20 text-green-400 border border-green-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const steps = [
    { label: "Ready to Dispatch", count: pipelineMetrics.PENDING, icon: Package, statusKey: "PENDING" },
    { label: "Labels Generated", count: pipelineMetrics.LABEL_GENERATED, icon: Layers, statusKey: "LABEL_GENERATED" },
    { label: "Pickup Scheduled", count: pipelineMetrics.PICKED_UP, icon: Truck, statusKey: "PICKED_UP" },
    { label: "In Transit", count: pipelineMetrics.IN_TRANSIT, icon: Truck, statusKey: "IN_TRANSIT" },
    { label: "Delivered", count: pipelineMetrics.DELIVERED, icon: CheckCircle, statusKey: "DELIVERED" },
  ];

  return (
    <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6">
      
      {/* Visual Shipment Timeline */}
      <div className="bg-charcoal/40 p-5 rounded-xl border border-terracotta/10">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cream/40 mb-4 flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-gold" /> Fulfillment Pipeline Timeline
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            const isActiveFilter = shipStatus === step.statusKey;
            return (
              <div 
                key={idx} 
                onClick={() => setShipStatus(step.statusKey as any)}
                className={`cursor-pointer group flex flex-col items-center text-center p-3 rounded-lg border transition-all duration-300 ${
                  isActiveFilter 
                    ? "bg-terracotta/10 border-terracotta text-cream" 
                    : "bg-charcoal/20 border-terracotta/10 text-cream/70 hover:border-terracotta/30 hover:bg-charcoal/30"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                  isActiveFilter ? "bg-gold text-charcoal scale-110" : "bg-charcoal-light border border-terracotta/30 text-cream/70"
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold font-sans tracking-wide">{step.label}</p>
                <p className="text-sm font-serif text-gold font-black mt-0.5">{step.count} items</p>
                
                {idx < 4 && (
                  <ArrowRight className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 text-cream/10 z-10 pointer-events-none group-hover:text-gold/20 transition-colors" style={{ left: `calc(${(idx + 1) * 20}% - 8px)` }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Header & Carrier Config */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-terracotta/10 pt-6">
        <div>
          <h3 className="font-serif text-base font-bold flex items-center gap-2">
            Courier & Shipping
            <button
              onClick={() => setShowHelp(true)}
              className="text-cream/40 hover:text-gold transition-colors focus:outline-none p-1 rounded hover:bg-cream/5"
              title="Show Shipping Guidelines"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </h3>
          <p className="text-sm text-cream/50 mt-1">
            Assign carriers, print dispatch labels, and verify award tracking links
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Carrier Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cream/60 uppercase tracking-wider">Carrier:</span>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value as CarrierType)}
              className="bg-charcoal border border-terracotta/30 text-cream text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-gold focus:outline-none"
            >
              <option value="SHIPROCKET">Shiprocket (Blue Dart / Delhivery)</option>
              <option value="DELHIVERY">Delhivery Direct</option>
              <option value="INDIAPOST">India Post (Speed Post)</option>
            </select>
          </div>

          <Button
            onClick={handleCreateLabels}
            disabled={creating || loading || (data.filter((d) => d.status === "PENDING").length === 0)}
            variant="primary"
            size="md"
            className="flex-1 md:flex-none shadow-md shadow-terracotta/10 hover:shadow-terracotta/20 font-bold"
          >
            {creating ? "Creating Labels..." : selectedIds.length > 0 ? `📦 Print Labels for Selected (${selectedIds.length})` : "📦 Print Bulk Labels"}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShipStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
              shipStatus === "ALL"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal"
                : "bg-cream/5 text-cream/60 hover:bg-cream/10 hover:text-cream"
            }`}
          >
            All Shipments
          </button>
          {steps.map((step) => (
            <button
              key={step.statusKey}
              onClick={() => setShipStatus(step.statusKey as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                shipStatus === step.statusKey
                  ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal"
                  : "bg-cream/5 text-cream/60 hover:bg-cream/10 hover:text-cream"
              }`}
            >
              {step.statusKey === "LABEL_GENERATED" ? "Label Gen" : step.statusKey === "PICKED_UP" ? "Picked Up" : step.statusKey === "IN_TRANSIT" ? "In Transit" : step.statusKey}
            </button>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <span className="text-xs text-gold font-bold">
            ✓ Selected {selectedIds.length} packages for dispatch labels
          </span>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && <Loading variant="overlay" text="Loading shipments..." />}

      {/* Shipments Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-terracotta/10">
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={data.length > 0 && data.filter(r => r.status === "PENDING").every(r => selectedIds.includes(r.id))}
                  disabled={data.filter(r => r.status === "PENDING").length === 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-terracotta/30 bg-charcoal text-gold focus:ring-0 cursor-pointer"
                />
              </th>
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
                  <td className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      disabled={row.status !== "PENDING"}
                      onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                      className="rounded border-terracotta/30 bg-charcoal text-gold focus:ring-0 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-4 py-3 text-cream/80 font-mono text-xs">{row.registrationId}</td>
                  <td className="px-4 py-3 text-cream">{row.studentName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase inline-block ${getStatusColor(row.status)}`}>
                      {row.status === "LABEL_GENERATED" ? "Label Gen" : row.status === "PICKED_UP" ? "Picked Up" : row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cream/70 text-xs font-mono">
                    {row.shipmentId || "—"}
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
                        className="text-gold hover:text-terracotta flex items-center gap-1 text-xs font-bold animate-pulse"
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
                <td colSpan={8} className="text-center py-8 text-cream/40 italic">
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
          <span className="font-bold text-cream">Total Active Orders:</span> {pipelineMetrics.PENDING + pipelineMetrics.LABEL_GENERATED + pipelineMetrics.PICKED_UP + pipelineMetrics.IN_TRANSIT + pipelineMetrics.DELIVERED}
        </div>
        <div>
          <span className="font-bold text-cream">Ready for Dispatch:</span>{" "}
          {pipelineMetrics.PENDING}
        </div>
        <div>
          <span className="font-bold text-cream">Labels Generated:</span>{" "}
          {pipelineMetrics.LABEL_GENERATED}
        </div>
        <div>
          <span className="font-bold text-cream">Pickup Scheduled:</span>{" "}
          {pipelineMetrics.PICKED_UP}
        </div>
        <div>
          <span className="font-bold text-cream">In Transit:</span>{" "}
          {pipelineMetrics.IN_TRANSIT}
        </div>
        <div>
          <span className="font-bold text-cream">Delivered:</span>{" "}
          {pipelineMetrics.DELIVERED}
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm p-4">
          <div className="bg-charcoal-light border border-terracotta/30 p-6 rounded-2xl max-w-3xl w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-cream/50 hover:text-cream transition-colors focus:outline-none p-1 rounded hover:bg-cream/5"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title Banner */}
            <div className="flex items-start gap-3 border-b border-terracotta/10 pb-4">
              <div className="bg-gold/10 p-2.5 rounded-xl border border-gold/20">
                <HelpCircle className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-cream">Fulfillment Operations Guide</h3>
                <p className="text-xs text-cream/40 mt-0.5">Step-by-step instructions for managing prize & certificate logistics</p>
              </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Infographic Graphic Left Panel */}
              <div className="md:col-span-2 space-y-3">
                <div className="w-full h-48 md:h-64 relative rounded-xl overflow-hidden border border-terracotta/20 bg-charcoal flex items-center justify-center">
                  <img
                    src="/images/shipping_workflow_infographic.png"
                    alt="Shipping Logistics Workflow"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-charcoal/50 p-3 rounded-lg border border-terracotta/5 text-[11px] text-cream/50 leading-relaxed font-mono">
                  <span className="text-gold font-bold">ℹ️ Note:</span> Tracking ranges, barcodes, and package metrics conform strictly to selected courier APIs.
                </div>
              </div>

              {/* Thorough Description Guidelines Right Panel */}
              <div className="md:col-span-3 space-y-4 max-h-[26rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-terracotta/20">
                
                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">1</span>
                    Selective vs. Bulk Dispatch
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    Check specific checkboxes next to student rows to package and generate AWB numbers for selected packages only. If no rows are checked, pressing the print button will trigger bulk generation for all currently <strong className="text-yellow-400">PENDING</strong> shipments in the queue.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">2</span>
                    Courier Carrier Formatting Rules
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    The platform dynamically selects tracking formats based on the active provider:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-cream/50">
                    <li><strong className="text-cream">Shiprocket:</strong> Generates <code className="text-blue-400">SR...</code> tracking codes linked to Blue Dart / Delhivery courier networks.</li>
                    <li><strong className="text-cream">Delhivery Direct:</strong> Fast local service generating AWB codes with custom routing.</li>
                    <li><strong className="text-cream">India Post (Speed Post):</strong> Generates official domestic tracking formats (e.g., <code className="text-green-400">PP*********IN</code>).</li>
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">3</span>
                    Status Lifecycle Tracking
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    The visual pipeline tracks package status real-time. Simply click any pipeline box (e.g., *In Transit*, *Ready to Dispatch*) to immediately filter the table registry view to that specific logistical state.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center text-[10px] text-gold font-mono">4</span>
                    Weight & Dimension Mapping
                  </h4>
                  <p className="text-xs text-cream/60 leading-relaxed">
                    Parcels calculate shipping weight dynamically by prize types: large trophies weigh 1200g (30x20x15cm) whereas flat certificate envelopes calculate at 80g (32x24x1cm).
                  </p>
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-3 border-t border-terracotta/10">
              <Button
                onClick={() => setShowHelp(false)}
                variant="primary"
                size="md"
                className="w-full md:w-36 font-bold shadow-md shadow-terracotta/10"
              >
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


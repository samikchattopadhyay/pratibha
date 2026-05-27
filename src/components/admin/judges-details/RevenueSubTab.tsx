"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Loading from "@/components/Loading";
import type { RevenueMetadata, PaymentRecord, PaginatedResponse } from "@/types/judges-details";

interface RevenueSubTabProps {
  readonly judgeId: string;
}

export default function RevenueSubTab({ judgeId }: RevenueSubTabProps) {
  const [revenue, setRevenue] = useState<RevenueMetadata | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setIsLoading(true);
      try {
        // Fetch revenue summary
        const revenueRes = await fetch(
          `/api/admin/judges/${judgeId}/revenue`,
          { cache: "no-store" }
        );

        if (!revenueRes.ok) throw new Error("Failed to fetch revenue");
        const revenueData: RevenueMetadata = await revenueRes.json();
        setRevenue(revenueData);

        // Fetch payment history
        const paymentsRes = await fetch(
          `/api/admin/judges/${judgeId}/payments?page=${page}&limit=${limit}`,
          { cache: "no-store" }
        );

        if (!paymentsRes.ok) throw new Error("Failed to fetch payments");
        const paymentsData: PaginatedResponse<PaymentRecord> = await paymentsRes.json();
        setPayments(Array.from(paymentsData.data));
        setTotalPayments(paymentsData.total);
      } catch (err) {
        console.error("[RevenueSubTab] Fetch error:", err);
        setRevenue(null);
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, [judgeId, page, limit]);

  const totalPages = Math.ceil(totalPayments / limit);

  if (isLoading) {
    return <Loading variant="overlay" text="Loading revenue data..." />;
  }

  if (!revenue) {
    return (
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 text-center text-cream/50">
        Unable to load revenue data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6">
          <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
            Total Earned
          </p>
          <p className="text-3xl font-bold text-cream">
            ₹{revenue.totalEarned.toLocaleString()}
          </p>
        </div>

        <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6">
          <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
            Pending Amount
          </p>
          <p className="text-3xl font-bold text-yellow-400">
            ₹{revenue.totalPending.toLocaleString()}
          </p>
        </div>

        <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6">
          <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
            Hourly Rate
          </p>
          <p className="text-3xl font-bold text-gold">
            ₹{revenue.hourlyRate.toLocaleString()}
          </p>
        </div>

        <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6">
          <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
            Per Evaluation Rate
          </p>
          <p className="text-3xl font-bold text-terracotta">
            ₹{revenue.perEvaluationRate.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Last Payment Info */}
      {revenue.lastPaymentDate && (
        <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6">
          <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-2">
            Last Payment
          </p>
          <p className="text-cream">
            {new Date(revenue.lastPaymentDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Payment History Table */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-4">
        <h3 className="font-serif text-xl font-bold text-cream">
          Payment History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream/10">
                <th className="text-left px-4 py-3 text-cream/60 font-semibold uppercase">Invoice</th>
                <th className="text-right px-4 py-3 text-cream/60 font-semibold uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-cream/60 font-semibold uppercase">Status</th>
                <th className="text-left px-4 py-3 text-cream/60 font-semibold uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-cream/5 hover:bg-cream/5">
                  <td className="px-4 py-3 text-cream font-mono text-xs">{payment.invoiceNumber}</td>
                  <td className="px-4 py-3 text-right text-cream font-semibold">
                    ₹{payment.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      payment.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : payment.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cream/70 text-xs">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payments.length === 0 && (
          <p className="text-center text-cream/50 py-8">No payment history yet</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t border-cream/10">
            <p className="text-sm text-cream/60">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, totalPayments)} of {totalPayments}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded hover:bg-cream/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-2 rounded hover:bg-cream/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

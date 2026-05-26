"use client";

import { Download } from "lucide-react";
import Button from "@/components/Button";

interface MedalUpgradesSummary {
  revenue: number;
  count: number;
}
interface WorkshopUpsellsSummary {
  revenue: number;
  count: number;
}
export interface FinanceSummary {
  medalUpgrades: MedalUpgradesSummary;
  workshopUpsells: WorkshopUpsellsSummary;
  averageTicketSize: number;
}
export interface FinanceTransaction {
  id: string;
  orderId: string;
  paymentId?: string;
  studentName: string;
  parentName: string;
  amount: number;
  status: string;
  createdAt: string;
}
export interface FinanceReport {
  summary: FinanceSummary;
  transactions: FinanceTransaction[];
}

interface FinanceTabProps {
  financeReport: FinanceReport | null;
  financePage: number;
  setFinancePage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  handleExportCSV: () => void;
  navigateToTab: (tab: string) => void;
  setSearch: (search: string) => void;
  totalCount: number;
  totalPages: number;
}

export default function FinanceTab({
  financeReport,
  financePage,
  setFinancePage,
  itemsPerPage,
  handleExportCSV,
  navigateToTab,
  setSearch,
  totalCount,
  totalPages,
}: FinanceTabProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, financePage - 1);
      const end = Math.min(totalPages - 1, financePage + 1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6 bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 font-sans">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-serif text-base font-bold">Revenue Analytical Summary</h3>
        <Button
          onClick={handleExportCSV}
          variant="secondary"
          size="md"
        >
          <Download className="w-3.5 h-3.5" /> Export Raw Transactions (CSV)
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div className="p-4 bg-charcoal rounded-xl border border-terracotta/5 space-y-1">
          <span className="text-cream/50 text-sm font-bold uppercase">Medal upgrades revenue</span>
          <p className="text-lg font-bold text-gold">₹{financeReport?.summary?.medalUpgrades?.revenue || 0}</p>
          <p className="text-[9px] text-cream/40">From {financeReport?.summary?.medalUpgrades?.count || 0} upgrades at ₹50</p>
        </div>
        <div className="p-4 bg-charcoal rounded-xl border border-terracotta/5 space-y-1">
          <span className="text-cream/50 text-sm font-bold uppercase">Workshop upsells</span>
          <p className="text-lg font-bold text-gold">₹{financeReport?.summary?.workshopUpsells?.revenue || 0}</p>
          <p className="text-[9px] text-cream/40">From {financeReport?.summary?.workshopUpsells?.count || 0} course enrollments</p>
        </div>
        <div className="p-4 bg-charcoal rounded-xl border border-terracotta/5 space-y-1">
          <span className="text-cream/50 text-sm font-bold uppercase">Avg Revenue Per Parent</span>
          <p className="text-lg font-bold text-gold">₹{financeReport?.summary?.averageTicketSize || 0}</p>
          <p className="text-[9px] text-cream/40">Includes initial entry + upgrade items</p>
        </div>
      </div>
      
      <div className="mt-6 space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider">Recent Transactions</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-terracotta/10 text-cream/50 font-bold uppercase">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Parent Name</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terracotta/5 text-cream/80">
              {financeReport?.transactions && financeReport.transactions.length > 0 ? (
                financeReport.transactions
                  .map((tx: FinanceTransaction) => (
                    <tr key={tx.id} className="hover:bg-charcoal/45 font-sans">
                      <td className="py-2.5 px-3 font-semibold text-cream">{tx.orderId}</td>
                      <td className="py-2.5 px-3">
                        <span
                          onClick={() => {
                            navigateToTab("participants");
                            setSearch(tx.studentName);
                          }}
                          className="text-gold cursor-pointer hover:underline font-semibold"
                        >
                          {tx.studentName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{tx.parentName}</td>
                      <td className="py-2.5 px-3 text-gold">₹{tx.amount}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-sm uppercase ${
                          tx.status === "SUCCESS" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        }`}>{tx.status}</span>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-cream/50">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-cream/40">No transactions recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalCount > itemsPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-terracotta/10">
            <div className="text-sm text-cream/60 font-sans">
              Showing {(financePage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(financePage * itemsPerPage, totalCount)} of{" "}
              {totalCount} transactions
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <Button
                onClick={() => setFinancePage(prev => Math.max(1, prev - 1))}
                disabled={financePage === 1}
                variant="secondary"
                size="md"
              >
                Previous
              </Button>
              {getPageNumbers().map((page, idx) => (
                <Button
                  key={idx}
                  onClick={() => typeof page === "number" && setFinancePage(page)}
                  disabled={page === "..."}
                  variant={page === financePage ? "primary" : (page === "..." ? "ghost" : "secondary")}
                  size="md"
                  className={page === "..." ? "cursor-default" : ""}
                >
                  {page}
                </Button>
              ))}
              <Button
                onClick={() => setFinancePage(prev => Math.min(totalPages, prev + 1))}
                disabled={financePage === totalPages}
                variant="secondary"
                size="md"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

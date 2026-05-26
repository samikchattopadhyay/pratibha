"use client";

import { BookOpen, CreditCard } from "lucide-react";
import Button from "@/components/Button";

interface Financials {
  totalEarnings: number;
  totalPaidPayouts: number;
  pendingPayoutBalance: number;
}

interface BankAccount {
  bankName: string;
  accountNum: string;
  ifscCode: string;
}

interface PayoutLog {
  id: string;
  amount: string;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED";
  assignedCount: number;
  paymentDate: string | null;
  transactionRef: string | null;
  adminNotes: string | null;
  createdAt: string;
}

interface EarningsTabProps {
  financials: Financials;
  bankAccount: BankAccount;
  setBankAccount: React.Dispatch<React.SetStateAction<BankAccount>>;
  payoutLogs: PayoutLog[];
  savingBank: boolean;
  handleSaveBank: (e: React.FormEvent) => Promise<void>;
}

export default function EarningsTab({
  financials,
  bankAccount,
  setBankAccount,
  payoutLogs,
  savingBank,
  handleSaveBank,
}: EarningsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Side: Financial Summary & Rate Card */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Financial overview boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-sm">
            <span className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase block">Lifetime Earnings</span>
            <span className="font-serif text-2xl font-bold text-charcoal dark:text-cream mt-1 block">
              ₹{financials.totalEarnings.toLocaleString()} INR
            </span>
          </div>
          <div className="bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-sm">
            <span className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase block">Disbursed Payouts</span>
            <span className="font-serif text-2xl font-bold text-green-600 dark:text-green-400 mt-1 block">
              ₹{financials.totalPaidPayouts.toLocaleString()} INR
            </span>
          </div>
          <div className="bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-sm bg-terracotta/5 dark:bg-gold/5 border-terracotta/20 dark:border-gold/20">
            <span className="font-sans text-sm text-terracotta/70 dark:text-gold/70 uppercase block">Pending Payout Balance</span>
            <span className="font-serif text-2xl font-bold text-terracotta dark:text-gold mt-1 block">
              ₹{financials.pendingPayoutBalance.toLocaleString()} INR
            </span>
          </div>
        </div>

        {/* Ledger / historical payout logs table */}
        <div className="bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream border-b border-terracotta/5 dark:border-terracotta/20 pb-3 mb-4">
            Disbursement Ledger History
          </h3>
          {payoutLogs.length === 0 ? (
            <p className="font-sans text-sm text-charcoal/40 dark:text-cream/40 italic py-6 text-center">No disbursements logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-sm border-collapse">
                <thead>
                  <tr className="border-b border-terracotta/10 dark:border-terracotta/20 text-charcoal/60 dark:text-cream/60">
                    <th className="py-2.5 font-semibold">Date</th>
                    <th className="py-2.5 font-semibold">Amount</th>
                    <th className="py-2.5 font-semibold">Entries Graded</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold">Transaction UTR</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutLogs.map((log) => (
                    <tr key={log.id} className="border-b border-terracotta/5 dark:border-terracotta/10 hover:bg-cream-dark/5 dark:hover:bg-charcoal-dark/5">
                      <td className="py-3 text-charcoal/80 dark:text-cream/80">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-semibold text-charcoal dark:text-cream">
                        ₹{Number(log.amount).toLocaleString()}
                      </td>
                      <td className="py-3 text-charcoal/60 dark:text-cream/60">{log.assignedCount}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          log.status === "PAID"
                            ? "bg-green-500/10 text-green-700"
                            : log.status === "PENDING" || log.status === "PROCESSING"
                            ? "bg-yellow-500/10 text-yellow-700"
                            : "bg-red-500/10 text-red-700"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-xs text-charcoal/50 dark:text-cream/50">
                        {log.transactionRef || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rates Table Information */}
        <div className="bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream border-b border-terracotta/5 dark:border-terracotta/20 pb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-terracotta dark:text-gold" />
            Double-Blind Pay-Per-Evaluation Rate Matrix
          </h3>
          <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">
            Payment is automatically computed per successfully finalized evaluation assignment. Rates correspond to competition scope:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-center">
              <span className="font-sans text-sm text-blue-500 font-bold block">STATE-LEVEL WORK</span>
              <span className="font-serif text-xl font-bold text-charcoal dark:text-cream mt-1 block">
                ₹50 - ₹150 <span className="text-sm font-sans font-medium text-charcoal/50 dark:text-cream/50">/ entry</span>
              </span>
            </div>
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
              <span className="font-sans text-sm text-red-500 font-bold block">NATIONAL-LEVEL WORK</span>
              <span className="font-serif text-xl font-bold text-charcoal dark:text-cream mt-1 block">
                ₹75 - ₹200 <span className="text-sm font-sans font-medium text-charcoal/50 dark:text-cream/50">/ entry</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Right Side: Bank Accounts detail form */}
      <div className="lg:col-span-4 bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md space-y-4">
        <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream border-b border-terracotta/5 dark:border-terracotta/20 pb-2 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-terracotta dark:text-gold" /> Bank Account Info
        </h3>
        <p className="font-sans text-sm text-charcoal/50 dark:text-cream/50">
          Please provide valid bank details to ensure automated payout disbursements can clear without hurdles.
        </p>

        <form onSubmit={handleSaveBank} className="space-y-4">
          <div className="space-y-1 font-sans text-sm">
            <label className="font-semibold text-charcoal/70 dark:text-cream/70">Bank Name</label>
            <input
              type="text"
              required
              placeholder="e.g. State Bank of India"
              value={bankAccount.bankName}
              onChange={(e) => setBankAccount(prev => ({ ...prev, bankName: e.target.value }))}
              className="w-full bg-cream dark:bg-charcoal/50 border border-terracotta/20 dark:border-terracotta/40 rounded-lg p-2.5 text-charcoal dark:text-cream"
            />
          </div>
          <div className="space-y-1 font-sans text-sm">
            <label className="font-semibold text-charcoal/70 dark:text-cream/70">Account Number</label>
            <input
              type="text"
              required
              placeholder="e.g. 1234567890"
              value={bankAccount.accountNum}
              onChange={(e) => setBankAccount(prev => ({ ...prev, accountNum: e.target.value }))}
              className="w-full bg-cream dark:bg-charcoal/50 border border-terracotta/20 dark:border-terracotta/40 rounded-lg p-2.5 text-charcoal dark:text-cream"
            />
          </div>
          <div className="space-y-1 font-sans text-sm">
            <label className="font-semibold text-charcoal/70 dark:text-cream/70">IFSC Code</label>
            <input
              type="text"
              maxLength={11}
              required
              placeholder="e.g. SBIN0001234"
              value={bankAccount.ifscCode}
              onChange={(e) => setBankAccount(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
              className="w-full bg-cream dark:bg-charcoal/50 border border-terracotta/20 dark:border-terracotta/40 rounded-lg p-2.5 text-charcoal dark:text-cream font-mono uppercase"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={savingBank}
            className="w-full"
          >
            {savingBank ? "Saving account details..." : "Save Bank Details"}
          </Button>
        </form>
      </div>

    </div>
  );
}

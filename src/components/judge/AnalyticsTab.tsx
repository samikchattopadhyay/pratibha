"use client";

import { PieChart } from "lucide-react";

interface AnalyticsMetrics {
  pendingCount: number;
  completedCount: number;
  lifetimeCount: number;
  totalEarnings: number;
  totalPaidPayouts: number;
  pendingPayoutBalance: number;
  judgeAverageScore: number | null;
  peerAverageScore: number | null;
}

interface CategoryDist {
  name: string;
  count: number;
}

interface AnalyticsTabProps {
  metrics: AnalyticsMetrics | null;
  categoryDist: CategoryDist[];
}

export default function AnalyticsTab({
  metrics,
  categoryDist,
}: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      
      {/* Analytics summary metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        
        <div className="bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-sm text-center">
          <span className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase block">Pending Tasks</span>
          <span className="font-serif text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1 block">
            {metrics ? metrics.pendingCount : 0}
          </span>
        </div>

        <div className="bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-sm text-center">
          <span className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase block">Graded (Current Pool)</span>
          <span className="font-serif text-3xl font-bold text-green-600 dark:text-green-400 mt-1 block">
            {metrics ? metrics.completedCount : 0}
          </span>
        </div>

        <div className="bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-sm text-center">
          <span className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase block">Lifetime Evaluations</span>
          <span className="font-serif text-3xl font-bold text-charcoal dark:text-cream mt-1 block">
            {metrics ? metrics.lifetimeCount : 0}
          </span>
        </div>

        <div className="bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-sm text-center">
          <span className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase block">Total Earned Value</span>
          <span className="font-serif text-3xl font-bold text-terracotta dark:text-gold mt-1 block">
            ₹{metrics ? metrics.totalEarnings.toLocaleString() : 0}
          </span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Scoring Deviation Index Comparative card */}
        <div className="lg:col-span-6 bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream border-b border-terracotta/5 dark:border-terracotta/20 pb-3 mb-4">
              Scoring Deviation Index (COI & Peer Bias Check)
            </h3>
            <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 leading-relaxed mb-6">
              This metric represents your average score given compared to the global average of other judges for categories you have evaluated. Maintaining close alignment guarantees grading consistency.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 items-center">
            <div className="text-center p-4 rounded-xl bg-cream-dark/20 dark:bg-charcoal-dark/20">
              <span className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase block">Your Average</span>
              <span className="font-serif text-2xl font-bold text-terracotta dark:text-gold mt-1 block">
                {metrics?.judgeAverageScore ? `${metrics.judgeAverageScore} / 100` : "No data"}
              </span>
            </div>
            <div className="text-center p-4 rounded-xl bg-cream-dark/20 dark:bg-charcoal-dark/20">
              <span className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase block">Peers Average</span>
              <span className="font-serif text-2xl font-bold text-charcoal/70 dark:text-cream/70 mt-1 block">
                {metrics?.peerAverageScore ? `${metrics.peerAverageScore} / 100` : "No data"}
              </span>
            </div>
          </div>

          {metrics?.judgeAverageScore && metrics?.peerAverageScore && (
            <div className="mt-6 p-4 rounded-xl border border-gold/20 bg-gold/5 font-sans text-sm text-charcoal/70 dark:text-cream/80">
              <strong>Score Variance: </strong> 
              {Math.abs(metrics.judgeAverageScore - metrics.peerAverageScore) <= 5 ? (
                <span className="text-green-600 font-semibold font-sans">Optimal Alignment (variance within &plusmn;5 points). Your grading matches evaluation bounds perfectly.</span>
              ) : (
                <span className="text-yellow-600 font-semibold font-sans">Moderate Variance. Please ensure your slider selections are fully aligned with the rubric guides.</span>
              )}
            </div>
          )}
        </div>

        {/* Workload specialization breakdown */}
        <div className="lg:col-span-6 bg-cream dark:bg-charcoal border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream border-b border-terracotta/5 dark:border-terracotta/20 pb-3 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-terracotta dark:text-gold" />
            Specialization Workload share
          </h3>
          
          {categoryDist.length === 0 ? (
            <p className="font-sans text-sm text-charcoal/40 dark:text-cream/40 italic py-12 text-center">No assignments loaded to display breakdown.</p>
          ) : (
            <div className="space-y-4">
              {categoryDist.map((cat, i) => {
                const total = categoryDist.reduce((sum, c) => sum + c.count, 0);
                const pct = Math.round((cat.count / total) * 100);
                return (
                  <div key={i} className="space-y-1.5 font-sans text-sm">
                    <div className="flex justify-between font-semibold">
                      <span className="text-charcoal/80 dark:text-cream/80">{cat.name}</span>
                      <span className="text-charcoal/60 dark:text-cream/60">{cat.count} assigned ({pct}%)</span>
                    </div>
                    <div className="w-full bg-cream-dark dark:bg-charcoal-dark h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-terracotta dark:bg-gold rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

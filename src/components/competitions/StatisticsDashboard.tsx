"use client";

import { Users, Zap, Globe, TrendingUp, Award, BarChart3 } from "lucide-react";

interface StatisticDashboardProps {
  totalParticipants: number;
  totalEntries: number;
  totalCategories: number;
  countriesRepresented: number;
  averageScore: number;
  highestScore: number;
  entriesByCategory: {
    name: string;
    count: number;
    percentage: number;
  }[];
  ageGroupDistribution: {
    label: string;
    count: number;
    percentage: number;
  }[];
}

export default function StatisticsDashboard({
  totalParticipants,
  totalEntries,
  totalCategories,
  countriesRepresented,
  averageScore,
  highestScore,
  entriesByCategory,
  ageGroupDistribution,
}: StatisticDashboardProps) {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-16">
        <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">
          Competition Statistics
        </h2>
        <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
          Key metrics and insights from this competition cycle
        </p>
        <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
      </div>

      {/* TOP METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        <div className="bg-cream-dark/20 dark:bg-charcoal-light/20 border border-terracotta/10 rounded-xl p-4 text-center space-y-2">
          <Users className="w-5 h-5 text-terracotta dark:text-gold mx-auto" />
          <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 uppercase font-bold tracking-wider">
            Total Participants
          </p>
          <p className="font-serif text-2xl font-bold text-charcoal dark:text-cream">
            {totalParticipants}
          </p>
        </div>

        <div className="bg-cream-dark/20 dark:bg-charcoal-light/20 border border-terracotta/10 rounded-xl p-4 text-center space-y-2">
          <Zap className="w-5 h-5 text-terracotta dark:text-gold mx-auto" />
          <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 uppercase font-bold tracking-wider">
            Entries Submitted
          </p>
          <p className="font-serif text-2xl font-bold text-charcoal dark:text-cream">
            {totalEntries}
          </p>
        </div>

        <div className="bg-cream-dark/20 dark:bg-charcoal-light/20 border border-terracotta/10 rounded-xl p-4 text-center space-y-2">
          <Award className="w-5 h-5 text-terracotta dark:text-gold mx-auto" />
          <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 uppercase font-bold tracking-wider">
            Categories
          </p>
          <p className="font-serif text-2xl font-bold text-charcoal dark:text-cream">
            {totalCategories}
          </p>
        </div>

        <div className="bg-cream-dark/20 dark:bg-charcoal-light/20 border border-terracotta/10 rounded-xl p-4 text-center space-y-2">
          <Globe className="w-5 h-5 text-terracotta dark:text-gold mx-auto" />
          <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 uppercase font-bold tracking-wider">
            Countries
          </p>
          <p className="font-serif text-2xl font-bold text-charcoal dark:text-cream">
            {countriesRepresented}
          </p>
        </div>

        <div className="bg-cream-dark/20 dark:bg-charcoal-light/20 border border-terracotta/10 rounded-xl p-4 text-center space-y-2">
          <TrendingUp className="w-5 h-5 text-terracotta dark:text-gold mx-auto" />
          <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 uppercase font-bold tracking-wider">
            Avg Score
          </p>
          <p className="font-serif text-2xl font-bold text-charcoal dark:text-cream">
            {averageScore.toFixed(1)}
          </p>
        </div>

        <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 text-center space-y-2">
          <BarChart3 className="w-5 h-5 text-gold mx-auto" />
          <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 uppercase font-bold tracking-wider">
            Highest Score
          </p>
          <p className="font-serif text-2xl font-bold text-gold">
            {highestScore.toFixed(2)}
          </p>
        </div>
      </div>

      {/* CATEGORY & AGE DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ENTRIES BY CATEGORY */}
        {entriesByCategory.length > 0 && (
          <div className="bg-cream-dark/10 dark:bg-charcoal-light/10 border border-terracotta/10 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream mb-1">
                Entries by Category
              </h3>
              <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">
                Distribution across competition categories
              </p>
            </div>

            <div className="space-y-4">
              {entriesByCategory.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm font-semibold text-charcoal/80 dark:text-cream/80">
                      {cat.name}
                    </span>
                    <span className="font-sans text-sm font-bold text-terracotta dark:text-gold">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-charcoal/10 dark:bg-cream/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-terracotta to-terracotta-light dark:from-gold dark:to-gold-light rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGE GROUP DISTRIBUTION */}
        {ageGroupDistribution.length > 0 && (
          <div className="bg-cream-dark/10 dark:bg-charcoal-light/10 border border-terracotta/10 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream mb-1">
                Age Group Distribution
              </h3>
              <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">
                Participant breakdown by age category
              </p>
            </div>

            <div className="space-y-4">
              {ageGroupDistribution.map((age, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm font-semibold text-charcoal/80 dark:text-cream/80">
                      {age.label}
                    </span>
                    <span className="font-sans text-sm font-bold text-terracotta dark:text-gold">
                      {age.count} ({age.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-charcoal/10 dark:bg-cream/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-terracotta to-terracotta-light dark:from-gold dark:to-gold-light rounded-full transition-all duration-500"
                      style={{ width: `${age.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

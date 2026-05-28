"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CompetitionResult } from "@/lib/student-profile-utils";

interface PerformanceMetricsProps {
  competitions: CompetitionResult[];
}

export default function PerformanceMetrics({
  competitions,
}: PerformanceMetricsProps) {
  // Prepare score trend data
  const scoreTrendData = useMemo(() => {
    return competitions
      .filter((c) => c.finalScore !== null)
      .sort(
        (a, b) =>
          new Date(a.competitionStartDate).getTime() -
          new Date(b.competitionStartDate).getTime()
      )
      .map((comp, idx) => ({
        name: `Comp ${idx + 1}`,
        score: Number(comp.finalScore),
        date: new Date(comp.competitionStartDate).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      }));
  }, [competitions]);

  // Prepare category distribution data
  const categoryDistribution = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    competitions.forEach((comp) => {
      categoryMap[comp.categoryName] =
        (categoryMap[comp.categoryName] || 0) + 1;
    });

    return Object.entries(categoryMap)
      .map(([name, count]) => ({
        name,
        registrations: count,
      }))
      .sort((a, b) => b.registrations - a.registrations);
  }, [competitions]);

  // Calculate win rate
  const winRate = useMemo(() => {
    const winCount = competitions.filter((c) => c.prizeRank).length;
    const percentage = (winCount / competitions.length) * 100;
    return { wins: winCount, total: competitions.length, percentage };
  }, [competitions]);

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-charcoal dark:text-gold mb-8">
        Performance Metrics
      </h2>

      {/* Win Rate Stats */}
      <div className="bg-cream-dark/10 dark:bg-charcoal-light p-6 rounded-lg mb-8 border border-terracotta/20 dark:border-terracotta/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-charcoal dark:text-cream text-sm font-medium">
              Win Rate
            </p>
            <p className="text-charcoal dark:text-white text-2xl font-bold">
              {winRate.wins} of {winRate.total}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gold font-bold text-3xl">
              {winRate.percentage.toFixed(1)}%
            </p>
            <p className="text-charcoal/70 dark:text-cream/70 text-xs">
              Prize wins
            </p>
          </div>
        </div>
      </div>

      {/* Charts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Trend Chart */}
        {scoreTrendData.length > 0 && (
          <div className="bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-charcoal dark:text-gold mb-4">
              Score Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoreTrendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#c9a96e40"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#8b7355"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#8b7355"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fcf9f2",
                    border: "1px solid #c4683a",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "#3d2817" }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#c9a96e"
                  strokeWidth={2}
                  dot={{ fill: "#c4683a", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Distribution Chart */}
        {categoryDistribution.length > 0 && (
          <div className="bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-charcoal dark:text-gold mb-4">
              Category Participation
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#c9a96e40"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#8b7355"
                  style={{ fontSize: "12px" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#8b7355"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fcf9f2",
                    border: "1px solid #c4683a",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "#3d2817" }}
                />
                <Bar
                  dataKey="registrations"
                  fill="#c9a96e"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}

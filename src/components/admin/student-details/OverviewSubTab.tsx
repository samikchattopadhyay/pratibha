"use client";

import { useEffect, useState } from "react";
import type { StudentMetadata, StudentStats } from "@/types/student-details";
import Loading from "@/components/Loading";

interface OverviewSubTabProps {
  readonly student: StudentMetadata;
  readonly studentId: string;
}

export default function OverviewSubTab({ student, studentId }: OverviewSubTabProps) {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/admin/students/${studentId}/stats`, {
          cache: "no-store",
        });

        if (res.ok) {
          const data: StudentStats = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch student stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [studentId]);

  if (isLoading) {
    return <Loading variant="overlay" text="Loading overview..." />;
  }

  const age = Math.floor(
    (new Date().getTime() - new Date(student.dateOfBirth).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="space-y-6">
      {/* Student Profile Card */}
      <div className="bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg p-6">
        <h2 className="text-lg font-bold text-cream mb-4">Student Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-cream/50 font-bold uppercase mb-1">Name</p>
            <p className="text-sm text-cream font-semibold">{student.name}</p>
          </div>
          <div>
            <p className="text-xs text-cream/50 font-bold uppercase mb-1">Date of Birth</p>
            <p className="text-sm text-cream font-semibold">
              {new Date(student.dateOfBirth).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-cream/50 font-bold uppercase mb-1">Age</p>
            <p className="text-sm text-cream font-semibold">{age} years</p>
          </div>
          <div>
            <p className="text-xs text-cream/50 font-bold uppercase mb-1">Gender</p>
            <p className="text-sm text-cream font-semibold">{student.gender}</p>
          </div>
        </div>
        {student.disciplineInterests.length > 0 && (
          <div className="mt-4 pt-4 border-t border-terracotta/10">
            <p className="text-xs text-cream/50 font-bold uppercase mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {student.disciplineInterests.map((interest) => (
                <span
                  key={interest}
                  className="px-2.5 py-1 rounded-full bg-terracotta/15 text-terracotta text-xs font-semibold"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Parent Contact Card */}
      <div className="bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg p-6">
        <h2 className="text-lg font-bold text-cream mb-4">Parent Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-cream/50 font-bold uppercase mb-1">Name</p>
            <p className="text-sm text-cream font-semibold">{student.parent.name}</p>
          </div>
          <div>
            <p className="text-xs text-cream/50 font-bold uppercase mb-1">Email</p>
            <p className="text-sm text-cream font-semibold">{student.parent.email}</p>
          </div>
          <div>
            <p className="text-xs text-cream/50 font-bold uppercase mb-1">Phone</p>
            <p className="text-sm text-cream font-semibold">{student.parent.phone}</p>
          </div>
          <div>
            <p className="text-xs text-cream/50 font-bold uppercase mb-1">Location</p>
            <p className="text-sm text-cream font-semibold">
              {student.parent.city}, {student.parent.state}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-charcoal-light border border-gold/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gold">{stats.totalCompetitions}</p>
            <p className="text-xs text-cream/60 mt-1">Competitions</p>
          </div>
          <div className="bg-charcoal-light border border-gold/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gold">{stats.totalAwards}</p>
            <p className="text-xs text-cream/60 mt-1">Awards</p>
          </div>
          <div className="bg-charcoal-light border border-gold/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gold">{stats.successRate.toFixed(1)}%</p>
            <p className="text-xs text-cream/60 mt-1">Success Rate</p>
          </div>
          <div className="bg-charcoal-light border border-gold/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gold">
              {stats.averageScore?.toFixed(1) || "—"}
            </p>
            <p className="text-xs text-cream/60 mt-1">Avg Score</p>
          </div>
        </div>
      )}

      {/* Categories */}
      {stats && stats.categories.length > 0 && (
        <div className="bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg p-6">
          <h2 className="text-lg font-bold text-cream mb-4">Categories Participated</h2>
          <div className="flex flex-wrap gap-2">
            {stats.categories.map((category) => (
              <span
                key={category}
                className="px-3 py-1.5 rounded-lg bg-terracotta/15 text-terracotta text-sm font-semibold"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Best Rank */}
      {stats && stats.bestRank && (
        <div className="bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg p-6">
          <h2 className="text-lg font-bold text-cream mb-2">Best Rank Achieved</h2>
          <p className="text-2xl font-bold text-gold">Rank #{stats.bestRank}</p>
        </div>
      )}
    </div>
  );
}

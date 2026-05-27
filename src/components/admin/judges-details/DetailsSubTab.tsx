"use client";

import { AlertTriangle } from "lucide-react";
import type { JudgeMetadata } from "@/types/judges-details";

interface DetailsSubTabProps {
  readonly judge: JudgeMetadata;
}

export default function DetailsSubTab({ judge }: DetailsSubTabProps) {
  return (
    <div className="space-y-6">
      {/* Details Card */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6 shadow-xl">

        {/* Header */}
        <div className="pb-4 border-b border-terracotta/10">
          <h3 className="font-serif text-xl font-bold text-cream">
            Judge Profile
          </h3>
        </div>

        {/* Judge Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-1">
              Name
            </p>
            <p className="text-cream font-semibold">{judge.name}</p>
          </div>

          {/* Email */}
          <div>
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-1">
              Email
            </p>
            <p className="text-cream font-semibold break-all">{judge.email}</p>
          </div>

          {/* Phone */}
          <div>
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-1">
              Phone
            </p>
            <p className="text-cream font-semibold">{judge.phone}</p>
          </div>

          {/* Tier */}
          <div>
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-1">
              Tier
            </p>
            <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-charcoal border border-gold/20 text-gold">
              {judge.tier}
            </span>
          </div>

          {/* Joined Date */}
          <div>
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-1">
              Joined
            </p>
            <p className="text-cream font-semibold">
              {new Date(judge.joinedDate).toLocaleDateString()}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-1">
              Status
            </p>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                judge.isActive
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {judge.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Specializations */}
        {judge.specializations.length > 0 && (
          <div className="pt-4 border-t border-cream/5">
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-3">
              Specializations
            </p>
            <div className="flex flex-wrap gap-2">
              {judge.specializations.map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1 bg-terracotta/20 text-terracotta border border-terracotta/30 rounded-lg text-xs font-semibold"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="pt-4 border-t border-cream/5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-charcoal rounded-lg p-3">
            <p className="text-xs uppercase text-cream/40 font-bold mb-1">
              Total Evaluations
            </p>
            <p className="text-2xl font-bold text-cream">{judge.totalEvaluations}</p>
          </div>

          <div className="bg-charcoal rounded-lg p-3">
            <p className="text-xs uppercase text-cream/40 font-bold mb-1">
              Average Score
            </p>
            <p className="text-2xl font-bold text-cream">
              {judge.averageScore.toFixed(2)}
            </p>
          </div>

          {judge.deviationPercentage !== null && judge.deviationPercentage !== undefined && (
            <div className={`rounded-lg p-3 ${
              judge.deviationPercentage > 15 ? "bg-yellow-500/10" : "bg-charcoal"
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                {judge.deviationPercentage > 15 && (
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                )}
                <p className="text-xs uppercase text-cream/40 font-bold">
                  Deviation
                </p>
              </div>
              <p className={`text-2xl font-bold ${
                judge.deviationPercentage > 15 ? "text-yellow-400" : "text-cream"
              }`}>
                {judge.deviationPercentage.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

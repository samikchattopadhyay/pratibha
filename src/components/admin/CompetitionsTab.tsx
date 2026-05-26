"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export interface Competition {
  id: string;
  title: string;
  entryFeeINR: number;
  registrationDeadline: string;
  categories: string;
  bannerUrl?: string;
  isActive?: boolean;
  scope?: "STATE" | "NATIONAL";
}

interface CompetitionsTabProps {
  competitionsList: Competition[];
  competitionsPage: number;
  setCompetitionsPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setShowCreateModal: (show: boolean) => void;
  totalCount: number;
  totalPages: number;
}

export default function CompetitionsTab({
  competitionsList,
  competitionsPage,
  setCompetitionsPage,
  itemsPerPage,
  setShowCreateModal,
  totalCount,
  totalPages,
}: CompetitionsTabProps) {
  const router = useRouter();

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, competitionsPage - 1);
      const end = Math.min(totalPages - 1, competitionsPage + 1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif text-base font-bold">Active Competitions</h3>
            <p className="text-sm text-cream/50">Manage deadlines, fees, and category mappings for standard boards.</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            size="md"
          >
            + Add New Competition
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {competitionsList && competitionsList.length > 0 ? (
            competitionsList
              .map((comp: Competition) => (
                <div
                  key={comp.id}
                  onClick={() => {
                    router.push(`/admin/dashboard/competitions/${comp.id}`);
                  }}
                  className="bg-charcoal border border-terracotta/10 rounded-xl p-5 space-y-3 cursor-pointer hover:border-terracotta/40 hover:bg-charcoal-light transition-all select-none overflow-hidden"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      router.push(`/admin/dashboard/competitions/${comp.id}`);
                    }
                  }}
                >
                  {/* Image Thumbnail */}
                  <div className="relative w-full h-24 rounded-lg overflow-hidden bg-charcoal-light border border-terracotta/5 shadow-sm shrink-0">
                    <img
                      src={comp.bannerUrl || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80"}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-2 flex gap-1 items-center">
                      <span className={`px-2 py-0.5 rounded text-sm font-bold uppercase ${
                        comp.isActive ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
                      }`}>{comp.isActive ? "Active" : "Closed"}</span>
                      <span className={`px-2 py-0.5 rounded text-sm font-bold uppercase bg-charcoal/90 text-gold-dark dark:text-gold border border-gold/20`}>
                        {comp.scope === "NATIONAL" ? "National" : "State"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <h4 className="font-serif text-sm font-bold text-cream line-clamp-1">{comp.title}</h4>
                    <span className="text-sm font-bold text-gold shrink-0">₹{comp.entryFeeINR}</span>
                  </div>
                  <div className="text-sm text-cream/50 space-y-1">
                    <p>Closing: {new Date(comp.registrationDeadline).toLocaleDateString()}</p>
                    <p className="line-clamp-1">Segments: {comp.categories}</p>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-sm text-cream/50 col-span-3">No active competitions available.</p>
          )}
        </div>

        {totalCount > itemsPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-terracotta/10">
            <div className="text-sm text-cream/60 font-sans">
              Showing {(competitionsPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(competitionsPage * itemsPerPage, totalCount)} of {totalCount} competitions
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <Button
                onClick={() => setCompetitionsPage(prev => Math.max(1, prev - 1))}
                disabled={competitionsPage === 1}
                variant="secondary"
                size="md"
              >
                Previous
              </Button>
              {getPageNumbers().map((page, idx) => (
                <Button
                  key={idx}
                  onClick={() => typeof page === "number" && setCompetitionsPage(page)}
                  disabled={page === "..."}
                  variant={page === competitionsPage ? "primary" : (page === "..." ? "ghost" : "secondary")}
                  size="md"
                  className={page === "..." ? "cursor-default" : ""}
                >
                  {page}
                </Button>
              ))}
              <Button
                onClick={() => setCompetitionsPage(prev => Math.min(totalPages, prev + 1))}
                disabled={competitionsPage === totalPages}
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

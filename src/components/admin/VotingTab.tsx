"use client";

import Button from "@/components/Button";

export interface VotingCard {
  studentName: string;
  category: string;
  likes: number;
  comments: number;
  shares: number;
  velocityIndex: number;
  status: string;
}

interface VotingTabProps {
  votingData: VotingCard[];
  votingPage: number;
  setVotingPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  navigateToTab: (tab: string) => void;
  setSearch: (search: string) => void;
  totalCount: number;
  totalPages: number;
}

export default function VotingTab({
  votingData,
  votingPage,
  setVotingPage,
  itemsPerPage,
  navigateToTab,
  setSearch,
  totalCount,
  totalPages,
}: VotingTabProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, votingPage - 1);
      const end = Math.min(totalPages - 1, votingPage + 1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6 bg-charcoal-light border border-terracotta/15 rounded-2xl p-6">
      <h3 className="font-serif text-base font-bold">People&apos;s Choice Live Velocity Dashboard</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-terracotta/10 text-cream/50 font-bold uppercase">
              <th className="py-3 px-4">Participant</th>
              <th className="py-3 px-4">Likes</th>
              <th className="py-3 px-4">Comments</th>
              <th className="py-3 px-4">Shares</th>
              <th className="py-3 px-4">Velocity Index</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-terracotta/5 font-semibold text-cream/80">
            {votingData && votingData.length > 0 ? (
              votingData
                .map((row: VotingCard, idx: number) => (
                  <tr key={idx} className="hover:bg-charcoal/45">
                    <td className="py-3 px-4">
                      <span
                        onClick={() => {
                          navigateToTab("participants");
                          setSearch(row.studentName);
                        }}
                        className="text-gold cursor-pointer hover:underline font-semibold"
                      >
                        {row.studentName}
                      </span>
                      <br/><span className="text-sm text-cream/40">{row.category}</span>
                    </td>
                    <td className="py-3 px-4">{row.likes}</td>
                    <td className="py-3 px-4">{row.comments}</td>
                    <td className="py-3 px-4">{row.shares}</td>
                    <td className="py-3 px-4 text-green-400 font-bold">{row.velocityIndex} / 100</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-sm uppercase ${
                        row.status === "HOT" ? "bg-gold/15 text-gold" : "bg-cream/5 text-cream/50"
                      }`}>
                        {row.status === "HOT" ? "🔥 Rising Talent" : "Standard"}
                      </span>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={6} className="py-4 text-center text-cream/40">No entries tracked.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalCount > itemsPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-terracotta/10">
          <div className="text-sm text-cream/60 font-sans">
            Showing {(votingPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(votingPage * itemsPerPage, totalCount)} of {totalCount} entries
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Button
              onClick={() => setVotingPage(prev => Math.max(1, prev - 1))}
              disabled={votingPage === 1}
              variant="secondary"
              size="md"
            >
              Previous
            </Button>
            {getPageNumbers().map((page, idx) => (
              <Button
                key={idx}
                onClick={() => typeof page === "number" && setVotingPage(page)}
                disabled={page === "..."}
                variant={page === votingPage ? "primary" : (page === "..." ? "ghost" : "secondary")}
                size="md"
                className={page === "..." ? "cursor-default" : ""}
              >
                {page}
              </Button>
            ))}
            <Button
              onClick={() => setVotingPage(prev => Math.min(totalPages, prev + 1))}
              disabled={votingPage === totalPages}
              variant="secondary"
              size="md"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

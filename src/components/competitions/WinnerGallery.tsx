"use client";

import { Play, Heart, MessageCircle, Share2, Trophy, Star } from "lucide-react";
import { useState } from "react";
import Button from "../Button";

interface WinnerGalleryEntry {
  registrationId: string;
  studentName: string;
  rank: number;
  categoryName: string;
  score: number;
  fbPostUrl?: string;
  school?: string;
  age: number;
  likesCount?: number;
  commentsCount?: number;
  thumbnail?: string;
}

interface WinnerGalleryProps {
  winners: WinnerGalleryEntry[];
  competitionTitle: string;
}

export default function WinnerGallery({ winners, competitionTitle }: WinnerGalleryProps) {
  const [selectedWinner, setSelectedWinner] = useState<WinnerGalleryEntry | null>(
    winners.length > 0 ? winners[0] : null
  );

  const topThree = winners.filter((w) => w.rank <= 3);
  const others = winners.filter((w) => w.rank > 3);

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gold/15 border-gold/30 text-gold";
    if (rank === 2) return "bg-silver/15 border-silver/30 text-silver";
    if (rank === 3) return "bg-bronze/15 border-bronze/30 text-bronze";
    return "bg-terracotta/10 border-terracotta/20 text-terracotta";
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "⭐";
  };

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-16">
        <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">
          Winner Showcase
        </h2>
        <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
          Celebrating the outstanding performances and achievements of our top participants in {competitionTitle}
        </p>
        <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
      </div>

      {winners.length === 0 ? (
        <div className="text-center py-12 bg-cream-dark/10 dark:bg-charcoal-light/10 rounded-xl border border-terracotta/5">
          <Trophy className="w-12 h-12 text-terracotta/40 dark:text-gold/40 mx-auto mb-3" />
          <p className="font-sans text-charcoal/70 dark:text-cream/70">
            Winner gallery will be updated once judging is complete.
          </p>
        </div>
      ) : (
        <>
          {/* FEATURED WINNER */}
          {selectedWinner && (
            <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Video/Media Section */}
              <div className="lg:col-span-2">
                <div className="relative w-full aspect-video bg-charcoal rounded-2xl overflow-hidden shadow-2xl border border-gold/20">
                  {selectedWinner.fbPostUrl ? (
                    <>
                      <div className="w-full h-full bg-gradient-to-br from-charcoal to-charcoal-light flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <Play className="w-16 h-16 text-gold/50 mx-auto" />
                          <p className="font-sans text-sm text-cream/60">
                            Video hosted on Facebook
                          </p>
                          <a
                            href={selectedWinner.fbPostUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-2.5 bg-gold hover:bg-gold-light text-charcoal rounded-lg font-sans font-bold text-sm transition-all"
                          >
                            Watch Performance
                          </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-charcoal/80 flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-gold/40 mx-auto mb-2" />
                        <p className="font-sans text-sm text-cream/60">No submission available</p>
                      </div>
                    </div>
                  )}

                  {/* Rank Badge Overlay */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`px-4 py-2 rounded-full border font-serif font-bold text-xl backdrop-blur-md ${getRankColor(
                        selectedWinner.rank
                      )}`}
                    >
                      {getRankBadge(selectedWinner.rank)} #{selectedWinner.rank}
                    </div>
                  </div>
                </div>
              </div>

              {/* Winner Info Section */}
              <div className="bg-cream-dark/20 dark:bg-charcoal-light/20 border border-terracotta/10 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Name & Category */}
                  <div className="space-y-2 border-b border-terracotta/10 pb-4">
                    <h3 className="font-serif text-2xl font-bold text-charcoal dark:text-cream">
                      {selectedWinner.studentName}
                    </h3>
                    <p className="font-sans text-sm text-charcoal/70 dark:text-cream/70">
                      {selectedWinner.categoryName}
                    </p>
                    {selectedWinner.school && (
                      <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">
                        {selectedWinner.school}
                      </p>
                    )}
                  </div>

                  {/* Score & Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase font-bold mb-1">
                        Final Score
                      </p>
                      <p className="font-serif text-3xl font-bold text-gold">
                        {selectedWinner.score.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase font-bold mb-1">
                        Age
                      </p>
                      <p className="font-serif text-3xl font-bold text-terracotta dark:text-gold">
                        {selectedWinner.age}
                      </p>
                    </div>
                  </div>

                  {/* Social Metrics */}
                  {(selectedWinner.likesCount ||
                    selectedWinner.commentsCount) && (
                    <div className="grid grid-cols-2 gap-3 bg-charcoal/5 dark:bg-cream/5 rounded-xl p-3 border border-charcoal/10 dark:border-cream/10">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-terracotta/60" />
                        <div>
                          <p className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase font-bold">
                            Likes
                          </p>
                          <p className="font-sans font-bold text-charcoal dark:text-cream">
                            {selectedWinner.likesCount || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-terracotta/60" />
                        <div>
                          <p className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase font-bold">
                            Comments
                          </p>
                          <p className="font-sans font-bold text-charcoal dark:text-cream">
                            {selectedWinner.commentsCount || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedWinner.fbPostUrl && (
                  <div className="flex gap-2 pt-4 border-t border-terracotta/10">
                    <a
                      href={selectedWinner.fbPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-terracotta hover:bg-terracotta-light text-cream rounded-lg font-sans font-bold text-sm transition-all dark:bg-gold dark:hover:bg-gold-light dark:text-charcoal"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Watch
                    </a>
                    <Button
                      onClick={() => navigator.share?.({
                        title: selectedWinner.studentName,
                        text: `Check out this amazing performance by ${selectedWinner.studentName} in ${selectedWinner.categoryName}!`,
                        url: selectedWinner.fbPostUrl,
                      })}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WINNERS GALLERY GRID */}
          <div className="space-y-12">
            {/* TOP 3 PODIUM */}
            {topThree.length > 0 && (
              <div>
                <h3 className="font-serif text-2xl font-bold text-charcoal dark:text-cream mb-6">
                  Top Achievers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topThree.map((winner) => (
                    <button
                      key={winner.registrationId}
                      onClick={() => setSelectedWinner(winner)}
                      className={`group w-full text-left rounded-2xl overflow-hidden border transition-all hover:shadow-lg hover:-translate-y-1 ${
                        selectedWinner?.registrationId === winner.registrationId
                          ? "border-gold/50 shadow-lg"
                          : "border-terracotta/10 hover:border-terracotta/30"
                      }`}
                    >
                      <div className="relative aspect-square bg-charcoal overflow-hidden">
                        {/* Placeholder for thumbnail or image */}
                        <div className="w-full h-full bg-gradient-to-br from-charcoal to-charcoal-light flex items-center justify-center">
                          <Star className="w-12 h-12 text-gold/40 group-hover:text-gold/60 transition-colors" />
                        </div>

                        {/* Rank Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="text-2xl">{getRankBadge(winner.rank)}</span>
                        </div>

                        {/* Overlay Info */}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <p className="font-serif font-bold text-gold text-lg">
                            {winner.studentName}
                          </p>
                          <p className="font-sans text-sm text-cream/80">
                            {winner.categoryName}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-cream-dark/10 dark:bg-charcoal-light/10 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-serif font-bold text-charcoal dark:text-cream">
                              {winner.studentName}
                            </p>
                            <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">
                              {winner.categoryName}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-sm font-bold whitespace-nowrap ${getRankColor(
                              winner.rank
                            )}`}
                          >
                            #{winner.rank}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-charcoal/70 dark:text-cream/70">Score:</span>
                          <span className="font-serif font-bold text-gold">
                            {winner.score.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* OTHER WINNERS */}
            {others.length > 0 && (
              <div>
                <h3 className="font-serif text-2xl font-bold text-charcoal dark:text-cream mb-6">
                  Merit Winners
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {others.map((winner) => (
                    <button
                      key={winner.registrationId}
                      onClick={() => setSelectedWinner(winner)}
                      className="group w-full text-left rounded-xl overflow-hidden border border-terracotta/10 hover:border-terracotta/30 transition-all hover:shadow-md"
                    >
                      <div className="relative aspect-square bg-charcoal">
                        <div className="w-full h-full bg-gradient-to-br from-charcoal/80 to-charcoal-light/80 flex items-center justify-center">
                          <Star className="w-8 h-8 text-terracotta/40 group-hover:text-terracotta/60 transition-colors" />
                        </div>
                        <div className="absolute top-2 right-2 text-lg">{getRankBadge(winner.rank)}</div>
                      </div>
                      <div className="p-3 bg-cream-dark/10 dark:bg-charcoal-light/10 space-y-1">
                        <p className="font-sans font-bold text-sm text-charcoal dark:text-cream truncate">
                          {winner.studentName}
                        </p>
                        <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 truncate">
                          {winner.categoryName}
                        </p>
                        <div className="flex justify-between items-center pt-1 border-t border-terracotta/5">
                          <span className="font-sans text-sm font-bold text-charcoal/50 dark:text-cream/50">
                            #{winner.rank}
                          </span>
                          <span className="font-serif font-bold text-sm text-terracotta dark:text-gold">
                            {winner.score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

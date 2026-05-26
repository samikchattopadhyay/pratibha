"use client";

import { Star, Quote, Heart } from "lucide-react";
import Button from "../Button";

interface Testimonial {
  id: string;
  authorName: string;
  authorRole: "parent" | "participant";
  studentName?: string;
  rating: number;
  text: string;
  timestamp: string;
}

interface ParticipantTestimonialsProps {
  testimonials: Testimonial[];
  competitionTitle: string;
}

export default function ParticipantTestimonials({
  testimonials,
  competitionTitle,
}: ParticipantTestimonialsProps) {
  const averageRating =
    testimonials.length > 0
      ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
      : 0;

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-16">
        <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">
          Participant Voices
        </h2>
        <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
          Real feedback from participants and parents who experienced {competitionTitle}
        </p>

        {/* Average Rating */}
        {testimonials.length > 0 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-4 h-4 ${
                    n <= Math.round(Number(averageRating))
                      ? "fill-gold stroke-gold"
                      : "fill-charcoal/10 stroke-charcoal/10"
                  }`}
                />
              ))}
            </div>
            <span className="font-serif font-bold text-charcoal dark:text-cream">
              {averageRating} ({testimonials.length} reviews)
            </span>
          </div>
        )}

        <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
      </div>

      {testimonials.length > 0 ? (
        <>
          {/* Featured Testimonial (Highest Rated) */}
          {testimonials.filter((t) => t.rating === 5).length > 0 && (
            <div className="mb-12 bg-gradient-to-r from-gold/10 to-gold/5 dark:from-gold/5 dark:to-gold/2 border-l-4 border-gold rounded-2xl p-8 space-y-6">
              {(() => {
                const featured = testimonials.find((t) => t.rating === 5) || testimonials[0];
                return (
                  <>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className="w-5 h-5 fill-gold stroke-gold"
                        />
                      ))}
                    </div>
                    <blockquote className="font-serif text-xl italic text-charcoal dark:text-cream leading-relaxed">
                      &ldquo;{featured.text}&rdquo;
                    </blockquote>
                    <div className="flex items-center justify-between pt-4 border-t border-gold/20">
                      <div>
                        <p className="font-bold text-charcoal dark:text-cream">
                          {featured.authorName}
                        </p>
                        <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 capitalize">
                          {featured.authorRole === "parent" ? "Parent of " : ""}{featured.studentName || featured.authorName}
                        </p>
                      </div>
                      <Heart className="w-5 h-5 fill-gold text-gold" />
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-cream-dark/10 dark:bg-charcoal-light/10 border border-terracotta/10 rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-4 h-4 ${
                        n <= testimonial.rating
                          ? "fill-gold stroke-gold"
                          : "fill-charcoal/10 stroke-charcoal/10"
                      }`}
                    />
                  ))}
                </div>

                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-terracotta/20 dark:text-gold/20" />

                {/* Testimonial Text */}
                <p className="font-sans text-sm text-charcoal/80 dark:text-cream/80 leading-relaxed flex-1">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* Author Info */}
                <div className="pt-3 border-t border-terracotta/10 space-y-1">
                  <p className="font-bold text-sm text-charcoal dark:text-cream">
                    {testimonial.authorName}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60 capitalize">
                      {testimonial.authorRole === "parent"
                        ? `Parent of ${testimonial.studentName || "Student"}`
                        : "Participant"}
                    </p>
                    <p className="font-sans text-sm text-charcoal/50 dark:text-cream/50">
                      {new Date(testimonial.timestamp).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center bg-terracotta/5 dark:bg-gold/5 border border-terracotta/10 dark:border-gold/10 rounded-2xl py-8 px-6 space-y-3">
            <p className="font-sans text-sm text-charcoal/80 dark:text-cream/80">
              Have feedback about your experience? We&apos;d love to hear from you!
            </p>
            <Button variant="primary" size="md">
              Share Your Experience
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-cream-dark/10 dark:bg-charcoal-light/10 rounded-xl border border-terracotta/5">
          <Quote className="w-12 h-12 text-terracotta/40 dark:text-gold/40 mx-auto mb-3" />
          <p className="font-sans text-charcoal/70 dark:text-cream/70 mb-4">
            Testimonials from participants will be featured here once the competition concludes.
          </p>
          <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">
            Be the first to share your experience!
          </p>
        </div>
      )}
    </section>
  );
}

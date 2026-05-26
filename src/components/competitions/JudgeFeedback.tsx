"use client";

import { MessageCircle, Star, Award } from "lucide-react";

interface JudgeFeedbackItem {
  registrationId: string;
  studentName: string;
  rank: number;
  categoryName: string;
  feedbackPoints: {
    technique: string;
    expression: string;
    presentation: string;
    overall: string;
  };
  judgeNames: string[];
  score: number;
}

interface JudgeFeedbackProps {
  feedbackItems: JudgeFeedbackItem[];
  competitionTitle: string;
}

export default function JudgeFeedback({
  feedbackItems,
  competitionTitle,
}: JudgeFeedbackProps) {
  const topRanked = feedbackItems.filter((f) => f.rank <= 10);

  return (
    <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center space-y-3 mb-16">
        <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">
          Judge&apos;s Feedback &amp; Insights
        </h2>
        <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
          Detailed assessment and constructive feedback from our panel of expert examiners for {competitionTitle}
        </p>
        <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
      </div>

      {topRanked.length > 0 ? (
        <div className="space-y-6">
          {topRanked.map((feedback) => (
            <div
              key={feedback.registrationId}
              className="bg-cream-dark/10 dark:bg-charcoal-light/10 border border-terracotta/10 rounded-2xl p-6 space-y-6 hover:shadow-md transition-shadow"
            >
              {/* Header with Rank and Student Info */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-terracotta/10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {feedback.rank === 1
                        ? "🥇"
                        : feedback.rank === 2
                          ? "🥈"
                          : feedback.rank === 3
                            ? "🥉"
                            : "⭐"}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream">
                      {feedback.studentName}
                    </h3>
                  </div>
                  <p className="font-sans text-sm text-charcoal/70 dark:text-cream/70">
                    {feedback.categoryName} • Rank #{feedback.rank}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-sans text-sm text-charcoal/50 dark:text-cream/50 uppercase font-bold">
                    Final Score
                  </p>
                  <p className="font-serif text-3xl font-bold text-gold">
                    {feedback.score.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Judges Info */}
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-terracotta dark:text-gold shrink-0" />
                <p className="font-sans text-sm text-charcoal/70 dark:text-cream/70">
                  <span className="font-bold">Evaluated by:</span> {feedback.judgeNames.join(", ")}
                </p>
              </div>

              {/* Feedback Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Technique */}
                <div className="bg-charcoal/5 dark:bg-cream/5 rounded-lg p-4 border border-charcoal/5 dark:border-cream/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-terracotta dark:text-gold" />
                    <p className="font-sans font-bold text-sm text-charcoal dark:text-cream uppercase tracking-wider">
                      Technical Skill & Execution
                    </p>
                  </div>
                  <p className="font-sans text-sm text-charcoal/80 dark:text-cream/80 leading-relaxed">
                    {feedback.feedbackPoints.technique}
                  </p>
                </div>

                {/* Expression */}
                <div className="bg-charcoal/5 dark:bg-cream/5 rounded-lg p-4 border border-charcoal/5 dark:border-cream/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-terracotta dark:text-gold" />
                    <p className="font-sans font-bold text-sm text-charcoal dark:text-cream uppercase tracking-wider">
                      Expression & Emotion
                    </p>
                  </div>
                  <p className="font-sans text-sm text-charcoal/80 dark:text-cream/80 leading-relaxed">
                    {feedback.feedbackPoints.expression}
                  </p>
                </div>

                {/* Presentation */}
                <div className="bg-charcoal/5 dark:bg-cream/5 rounded-lg p-4 border border-charcoal/5 dark:border-cream/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-terracotta dark:text-gold" />
                    <p className="font-sans font-bold text-sm text-charcoal dark:text-cream uppercase tracking-wider">
                      Presentation & Stage Presence
                    </p>
                  </div>
                  <p className="font-sans text-sm text-charcoal/80 dark:text-cream/80 leading-relaxed">
                    {feedback.feedbackPoints.presentation}
                  </p>
                </div>

                {/* Overall */}
                <div className="bg-gold/10 dark:bg-gold/5 rounded-lg p-4 border border-gold/20 dark:border-gold/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <p className="font-sans font-bold text-sm text-charcoal dark:text-cream uppercase tracking-wider">
                      Overall Assessment
                    </p>
                  </div>
                  <p className="font-sans text-sm text-charcoal/80 dark:text-cream/80 leading-relaxed font-semibold">
                    {feedback.feedbackPoints.overall}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-cream-dark/10 dark:bg-charcoal-light/10 rounded-xl border border-terracotta/5">
          <MessageCircle className="w-12 h-12 text-terracotta/40 dark:text-gold/40 mx-auto mb-3" />
          <p className="font-sans text-charcoal/70 dark:text-cream/70">
            Judge feedback will be available for top performers once results are finalized.
          </p>
        </div>
      )}
    </section>
  );
}

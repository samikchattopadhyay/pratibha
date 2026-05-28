import type { ParentEntryDetails } from "@/types/parent-entry-details";

interface EvaluationSectionProps {
  readonly entry: ParentEntryDetails;
}

export default function EvaluationSection({ entry }: EvaluationSectionProps) {
  if (!entry.scoringFinalized) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-900/30">
        <p className="text-sm text-yellow-900 dark:text-yellow-200">
          ⏳ Evaluation in Progress — Judge scores will appear here once all evaluations are complete.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cream dark:bg-charcoal-light rounded-2xl p-6 border border-terracotta/10 dark:border-terracotta/20">
      <h2 className="text-sm uppercase font-bold text-charcoal/50 dark:text-cream/50 tracking-wider mb-4">
        Evaluation & Ranking
      </h2>

      {/* Final Score & Rank */}
      <div className="mb-6 p-4 bg-gradient-to-r from-terracotta/5 to-transparent dark:from-gold/5 rounded-xl border border-terracotta/20 dark:border-gold/20">
        <div className="flex items-baseline gap-4">
          {entry.finalScore !== null && (
            <div>
              <p className="text-xs uppercase font-bold text-charcoal/50 dark:text-cream/50 mb-1">
                Final Score
              </p>
              <p className="text-3xl font-bold text-terracotta dark:text-gold">
                {entry.finalScore.toFixed(2)}
              </p>
            </div>
          )}
          {entry.finalRank !== null && entry.totalInCategory !== null && (
            <div className="ml-auto text-right">
              <p className="text-xs uppercase font-bold text-charcoal/50 dark:text-cream/50 mb-1">
                Rank
              </p>
              <p className="text-3xl font-bold text-charcoal dark:text-cream">
                #{entry.finalRank}
              </p>
              <p className="text-xs text-charcoal/60 dark:text-cream/60 mt-1">
                of {entry.totalInCategory} participants
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Judge Scores */}
      {entry.judgeScores && entry.judgeScores.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-charcoal dark:text-cream mb-3">Judge Feedback</h3>
          {entry.judgeScores.map((judge, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-charcoal/2.5 dark:bg-charcoal/30 border border-terracotta/15 dark:border-terracotta/25">
              <div className="mb-3">
                <div className="flex justify-between items-baseline gap-4">
                  <p className="font-semibold text-charcoal dark:text-cream">{judge.label}</p>
                  {judge.totalScore !== null && (
                    <p className="text-lg font-bold text-terracotta dark:text-gold">
                      {judge.totalScore} pts
                    </p>
                  )}
                </div>
                {!judge.isSubmitted && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    ⏳ Score pending submission
                  </p>
                )}
              </div>

              {judge.isSubmitted && (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between">
                      <span className="text-charcoal/70 dark:text-cream/70">Technique / Skill</span>
                      <span className="font-medium text-charcoal dark:text-cream">
                        {judge.criteria1 !== null ? `${judge.criteria1}/40` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70 dark:text-cream/70">Expression / Presentation</span>
                      <span className="font-medium text-charcoal dark:text-cream">
                        {judge.criteria2 !== null ? `${judge.criteria2}/30` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70 dark:text-cream/70">Rhythm / Composition</span>
                      <span className="font-medium text-charcoal dark:text-cream">
                        {judge.criteria3 !== null ? `${judge.criteria3}/30` : "—"}
                      </span>
                    </div>
                    {judge.criteria4 !== null && (
                      <div className="flex justify-between">
                        <span className="text-charcoal/70 dark:text-cream/70">Originality</span>
                        <span className="font-medium text-charcoal dark:text-cream">
                          {judge.criteria4}/10
                        </span>
                      </div>
                    )}
                  </div>

                  {judge.remarks && (
                    <div className="mt-3 p-2 bg-charcoal/5 dark:bg-cream/5 rounded border border-charcoal/10 dark:border-cream/10">
                      <p className="text-xs uppercase font-bold text-charcoal/50 dark:text-cream/50 mb-1">
                        Remarks
                      </p>
                      <p className="text-charcoal dark:text-cream text-sm">{judge.remarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Scoring engine for Pratibha Parishad
 * Computes weighted final scores combining double-blind jury feedback and social engagement loops.
 */

interface EngagementCounts {
  likes: number;
  comments: number;
  shares: number;
}

/**
 * Calculates the raw social engagement points.
 * Formula: Likes * 1 + Comments * 2 + Shares * 5
 */
export function calculateRawSocialPoints(counts: EngagementCounts): number {
  const { likes, comments, shares } = counts;
  return likes * 1 + comments * 2 + shares * 5;
}

/**
 * Standardizes social points into a score out of 100, capping it at a maximum threshold
 * to prevent automated viral spikes from completely overpowering examiner scores.
 * Maximum cap is typically 500 raw points (equivalent to 100 on the social scale).
 */
export function standardizeSocialScore(rawPoints: number, maxThreshold = 500): number {
  if (rawPoints <= 0) return 0;
  const score = (rawPoints / maxThreshold) * 100;
  return Math.min(score, 100);
}

/**
 * Calculates the final weighted score out of 100.
 * Weight: 70% Jury Score, 30% Social Score
 */
export function calculateFinalScore(juryScore: number, socialScore: number): number {
  const weightedJury = juryScore * 0.70;
  const weightedSocial = socialScore * 0.30;
  const finalScore = weightedJury + weightedSocial;
  
  // Return rounded to 2 decimal places
  return Math.round((finalScore + Number.EPSILON) * 100) / 100;
}

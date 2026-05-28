"use client";
import { useRef } from "react";
import Link from "next/link";
import { Copy, Share2 } from "lucide-react";
import Button from "@/components/Button";
import AwardsHighlight from "./AwardsHighlight";
import CompetitionResultCard from "./CompetitionResultCard";
import CategoryPerformanceSummary from "./CategoryPerformanceSummary";
import TierBadge from "./TierBadge";
import AchievementTimeline from "../achievement/AchievementTimeline";
import PerformanceMetrics from "./PerformanceMetrics";
import PdfExportButton from "./PdfExportButton";
import {
  CompetitionResult,
  calculateTier,
  calculatePrizeBreakdown,
  getTopAchievements,
  groupByCategory,
  calculateProfileStats,
} from "@/lib/student-profile-utils";

interface PublicStudentProfileProps {
  readonly student: {
    id: string;
    name: string;
    age: number;
    gender: string;
    city: string | null;
    state: string | null;
    bio: string | null;
    profileImageUrl: string | null;
    disciplineInterests: string[];
    languages: string[];
    specialSkills: string[];
    trainingInstitutes: string[];
    memberSince: string;
    competitionResults?: CompetitionResult[] | null;
    externalAchievements: {
      title: string;
      eventName: string;
      category: string | null;
      year: number;
      rank: string | null;
      description: string | null;
      proofUrl: string | null;
    }[];
  };
  readonly isOwner: boolean;
}

export default function StudentPublicProfile({
  student,
  isOwner,
}: PublicStudentProfileProps) {
  const profileRef = useRef<HTMLDivElement>(null);
  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/student/${student.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    alert("Profile link copied to clipboard!");
  };

  const handleShareWhatsApp = () => {
    const message = `Check out ${student.name}'s profile on Pratibha Parishad: ${profileUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Calculate stats and aggregations
  const competitionResults = (student.competitionResults && Array.isArray(student.competitionResults))
    ? student.competitionResults
    : [];
  const stats = competitionResults.length > 0 ? calculateProfileStats(competitionResults) : {
    totalCompetitions: 0,
    totalAwards: 0,
    totalCategories: 0,
    averageScore: null,
    goldMedals: 0,
    silverMedals: 0,
    bronzeMedals: 0,
  };
  const prizeBreakdown = competitionResults.length > 0 ? calculatePrizeBreakdown(competitionResults) : { gold: 0, silver: 0, bronze: 0 };
  const categorySummaries = Object.values(
    groupByCategory(competitionResults)
  );
  const topAchievements = getTopAchievements(competitionResults, 3);
  const highestScore =
    competitionResults.length > 0
      ? competitionResults.reduce(
          (prev, curr) =>
            (curr.finalScore && prev.finalScore
              ? Number(curr.finalScore) > Number(prev.finalScore)
              : curr.finalScore)
              ? curr
              : prev,
          competitionResults[0]
        )
      : null;
  const tierInfo = calculateTier(
    stats.goldMedals,
    stats.silverMedals,
    stats.bronzeMedals,
    stats.totalCompetitions,
    stats.averageScore
  );

  return (
    <div ref={profileRef} className="space-y-8">
      {/* Hero Section */}
      <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {student.profileImageUrl ? (
              <img
                src={student.profileImageUrl}
                alt={student.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-terracotta dark:border-gold"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-terracotta/20 dark:bg-gold/20 flex items-center justify-center border-2 border-terracotta dark:border-gold text-2xl font-bold text-terracotta dark:text-gold">
                {student.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">
                {student.name}
              </h1>
              {competitionResults.length > 0 && (
                <TierBadge
                  tier={tierInfo.tier}
                  label={tierInfo.label}
                  pointsToNext={tierInfo.pointsToNext}
                  showLabel={true}
                />
              )}
            </div>

            <p className="font-sans text-charcoal/70 dark:text-cream/70 mt-1">
              {student.age} years old · {student.gender}
              {student.city || student.state
                ? ` · ${student.city}${student.city && student.state ? ", " : ""}${student.state}`
                : ""}
            </p>

            {/* Disciplines */}
            {student.disciplineInterests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {student.disciplineInterests.map((discipline) => (
                  <span
                    key={discipline}
                    className="px-2.5 py-1 bg-terracotta/10 text-terracotta dark:bg-gold/15 dark:text-gold border border-terracotta/20 dark:border-gold/30 rounded-full text-xs font-semibold"
                  >
                    {discipline}
                  </span>
                ))}
              </div>
            )}

            {/* Bio */}
            {student.bio && (
              <p className="font-sans text-sm text-charcoal/80 dark:text-cream/80 mt-3 leading-relaxed">
                {student.bio}
              </p>
            )}

            {/* Stats */}
            {competitionResults.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-terracotta/10 dark:border-terracotta/20">
                <div>
                  <p className="font-sans font-bold text-terracotta dark:text-gold text-lg">
                    {stats.totalCompetitions}
                  </p>
                  <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60 uppercase tracking-wider">
                    Competitions
                  </p>
                </div>
                <div>
                  <p className="font-sans font-bold text-terracotta dark:text-gold text-lg">
                    {stats.totalAwards}
                  </p>
                  <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60 uppercase tracking-wider">
                    Awards
                  </p>
                </div>
                <div>
                  <p className="font-sans font-bold text-terracotta dark:text-gold text-lg">
                    {stats.totalCategories}
                  </p>
                  <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60 uppercase tracking-wider">
                    Categories
                  </p>
                </div>
                {stats.averageScore && (
                  <div>
                    <p className="font-sans font-bold text-terracotta dark:text-gold text-lg">
                      {stats.averageScore.toFixed(1)}
                    </p>
                    <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60 uppercase tracking-wider">
                      Avg Score
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {isOwner && (
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Link href={`/account/students/${student.id}`}>
                <Button variant="primary" size="sm" className="w-full font-bold">
                  Edit Profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Awards Highlight */}
      {competitionResults.length > 0 && (
        <AwardsHighlight
          medalCount={prizeBreakdown}
          highestScore={
            highestScore && highestScore.finalScore
              ? {
                  value: Number(highestScore.finalScore),
                  category: highestScore.categoryName,
                  competition: highestScore.competitionTitle,
                }
              : null
          }
          featuredAchievements={topAchievements}
        />
      )}

      {/* Verified Achievements */}
      {competitionResults.length > 0 && (
        <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-4 sm:p-6 shadow-md space-y-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-charcoal dark:text-cream mb-3">
              🏆 Verified Achievements
            </h2>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="px-2.5 py-1 bg-gold/15 dark:bg-gold/20 rounded-full border border-gold/30 text-gold font-semibold">
                🥇 {stats.goldMedals} Wins
              </div>
              <div className="px-2.5 py-1 bg-gray-400/15 dark:bg-gray-400/20 rounded-full border border-gray-400/30 text-gray-600 dark:text-gray-300 font-semibold">
                🥈 {stats.silverMedals} Wins
              </div>
              <div className="px-2.5 py-1 bg-orange-600/15 dark:bg-orange-600/20 rounded-full border border-orange-600/30 text-orange-700 dark:text-orange-400 font-semibold">
                🥉 {stats.bronzeMedals} Wins
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {competitionResults.map((competition) => (
              <CompetitionResultCard
                key={competition.registrationId}
                competition={competition}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category Performance Summary */}
      {categorySummaries.length > 0 && (
        <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md space-y-4">
          <h2 className="font-serif text-xl font-bold text-charcoal dark:text-cream border-b border-terracotta/5 pb-2">
            📊 Performance by Category
          </h2>
          <CategoryPerformanceSummary categories={categorySummaries} />
        </div>
      )}

      {/* Performance Metrics */}
      {competitionResults.length > 1 && (
        <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md">
          <PerformanceMetrics competitions={competitionResults} />
        </div>
      )}

      {/* Achievement Timeline */}
      {competitionResults.length > 0 && (
        <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md">
          <AchievementTimeline competitions={competitionResults} />
        </div>
      )}

      {/* External Achievements */}
      {student.externalAchievements.length > 0 && (
        <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md space-y-4">
          <div className="border-b border-terracotta/5 pb-2">
            <h2 className="font-serif text-xl font-bold text-charcoal dark:text-cream">
              ✍️ Other Achievements · Self-Reported
            </h2>
            <p className="font-sans text-xs text-charcoal/40 dark:text-cream/40 italic mt-1">
              Content added by parent/guardian. Not verified by Pratibha Parishad.
            </p>
          </div>
          <div className="space-y-3">
            {student.externalAchievements
              .sort((a, b) => b.year - a.year)
              .map((achievement, idx) => (
                <div
                  key={idx}
                  className="bg-cream-dark/5 dark:bg-charcoal rounded-lg border border-terracotta/10 dark:border-terracotta/20 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🎖️</span>
                    <div className="flex-1">
                      <h4 className="font-sans font-bold text-charcoal dark:text-cream">
                        {achievement.title}
                      </h4>
                      <p className="font-sans text-sm text-charcoal/70 dark:text-cream/70">
                        {achievement.eventName}
                        {achievement.category && ` • ${achievement.category}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-sans text-xs bg-cream/50 dark:bg-charcoal-light text-charcoal/60 dark:text-cream/60 border border-charcoal/10 dark:border-cream/10 px-2 py-0.5 rounded">
                          {achievement.year}
                        </span>
                        {achievement.rank && (
                          <span className="font-sans text-xs font-semibold text-terracotta dark:text-gold">
                            {achievement.rank}
                          </span>
                        )}
                      </div>
                      {achievement.description && (
                        <p className="font-sans text-xs text-charcoal/70 dark:text-cream/70 italic mt-2">
                          {achievement.description}
                        </p>
                      )}
                    </div>
                    {achievement.proofUrl && (
                      <a
                        href={achievement.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-terracotta dark:text-gold hover:underline font-bold text-xs whitespace-nowrap"
                      >
                        View →
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Training & Education */}
      {(student.trainingInstitutes.length > 0 ||
        student.languages.length > 0 ||
        student.specialSkills.length > 0) && (
        <div className="bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md space-y-4">
          <h2 className="font-serif text-xl font-bold text-charcoal dark:text-cream border-b border-terracotta/5 pb-2">
            📚 Training & Education
          </h2>

          {student.trainingInstitutes.length > 0 && (
            <div>
              <p className="font-sans text-xs font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider mb-2">
                Training Institutes
              </p>
              <ul className="font-sans text-sm text-charcoal/80 dark:text-cream/80 space-y-1">
                {student.trainingInstitutes.map((institute, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-terracotta dark:text-gold">•</span> {institute}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {student.languages.length > 0 && (
            <div>
              <p className="font-sans text-xs font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider mb-2">
                Languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {student.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-2.5 py-1 bg-charcoal/5 dark:bg-cream/5 text-charcoal/70 dark:text-cream/70 border border-charcoal/10 dark:border-cream/10 rounded-full text-xs font-semibold"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {student.specialSkills.length > 0 && (
            <div>
              <p className="font-sans text-xs font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider mb-2">
                Special Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {student.specialSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-gold/10 text-gold border border-gold/30 dark:border-gold/30 rounded-full text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-terracotta/10 to-gold/10 dark:from-terracotta/20 dark:to-gold/20 border border-terracotta/20 dark:border-terracotta/30 rounded-2xl p-8 text-center space-y-4">
        <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream">
          Want your child to participate?
        </h3>
        <p className="font-sans text-sm text-charcoal/70 dark:text-cream/70">
          Explore our upcoming competitions and showcase your talent on a national platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
          <Link href="/competitions">
            <Button variant="primary" size="md" className="font-bold">
              Explore Competitions
            </Button>
          </Link>
          {competitionResults.length > 0 && (
            <PdfExportButton studentName={student.name} profileRef={profileRef} />
          )}
          <Button
            onClick={handleCopyLink}
            variant="secondary"
            size="md"
            className="font-bold flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" /> Copy Link
          </Button>
          <Button
            onClick={handleShareWhatsApp}
            variant="secondary"
            size="md"
            className="font-bold flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}

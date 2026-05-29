import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import prisma from "@/lib/db";
import Button from "@/components/Button";
import { Calendar, Award, Tag, ArrowRight, MapPin, Trophy, Users } from "lucide-react";

export const dynamic = "force-dynamic";

// Fallback data updated with scope and promotional attributes
const fallbackCompetitions = [
  {
    id: "comp-rec-01",
    title: "Borsha Bodhon 2026",
    description: "West Bengal state-level Bengali Recitation Competition celebrating the monsoon season. Recite poems by Tagore, Nazrul, or Jibanananda Das.",
    entryFeeINR: 50.0,
    startDate: new Date("2026-06-01"),
    endDate: new Date("2026-06-30"),
    registrationDeadline: new Date("2026-06-25"),
    resultDate: new Date("2026-07-05"),
    categoryName: "Bengali Recitation",
    scope: "STATE" as const,
    hostState: "West Bengal",
    difficultyLevel: 1,
    hasPrizePool: false,
    bannerUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
    minAge: 4,
    maxAge: 16,
    prizeSummary: null,
    joinees: 180,
    slotsLeft: 120,
    capacity: 300
  },
  {
    id: "comp-sing-02",
    title: "Raga Tarang National 2026",
    description: "National Online Indian Classical and Semi-Classical Singing Contest open to all participants across India. Elite judging panel with senior examiners.",
    entryFeeINR: 200.0,
    startDate: new Date("2026-06-10"),
    endDate: new Date("2026-07-10"),
    registrationDeadline: new Date("2026-07-05"),
    resultDate: new Date("2026-07-15"),
    categoryName: "Singing",
    scope: "NATIONAL" as const,
    hostState: null,
    difficultyLevel: 3,
    hasPrizePool: true,
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    minAge: 4,
    maxAge: 16,
    prizeSummary: "₹5000 Cash + Trophy",
    joinees: 850,
    slotsLeft: 150,
    capacity: 1000
  },
  {
    id: "comp-draw-03",
    title: "Chitra Kala 2026",
    description: "State-level Online Drawing & Handwriting Competition for kids in West Bengal. Express your creativity through watercolors, sketch, or pencil shading.",
    entryFeeINR: 50.0,
    startDate: new Date("2026-06-15"),
    endDate: new Date("2026-07-15"),
    registrationDeadline: new Date("2026-07-10"),
    resultDate: new Date("2026-07-20"),
    categoryName: "Drawing & Handwriting",
    scope: "STATE" as const,
    hostState: "West Bengal",
    difficultyLevel: 1,
    hasPrizePool: false,
    bannerUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    minAge: 4,
    maxAge: 16,
    prizeSummary: null,
    joinees: 290,
    slotsLeft: 10,
    capacity: 300
  },
];

interface CompetitionCategoryRelation {
  minAge: number;
  maxAge: number;
  category: {
    name: string;
  };
  registrations: {
    id: string;
  }[];
}

interface PrismaCompetition {
  id: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  entryFeeINR: number | string | { toString(): string };
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  resultDate: Date;
  scope: "STATE" | "NATIONAL";
  hostState: string | null;
  difficultyLevel: number;
  categories: CompetitionCategoryRelation[];
}

async function getCompetitions() {
  try {
    const competitions = (await prisma.competition.findMany({
      where: { isActive: true },
      include: {
        categories: {
          include: {
            category: true,
            registrations: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: { registrationDeadline: "asc" },
    })) as unknown as PrismaCompetition[];

    if (competitions.length === 0) return null;

    return competitions.map((comp) => {
      const minAges = comp.categories.map((c) => c.minAge);
      const maxAges = comp.categories.map((c) => c.maxAge);
      const minAge = minAges.length > 0 ? Math.min(...minAges) : 4;
      const maxAge = maxAges.length > 0 ? Math.max(...maxAges) : 16;

      const joinees = comp.categories.reduce(
        (sum: number, c) => sum + c.registrations.length,
        0
      );
      const capacity = comp.scope === "NATIONAL" ? 1000 : 300;
      const slotsLeft = Math.max(0, capacity - joinees);

      return {
        id: comp.id,
        title: comp.title,
        description: comp.description,
        bannerUrl: comp.bannerUrl,
        entryFeeINR: Number(comp.entryFeeINR),
        startDate: comp.startDate,
        endDate: comp.endDate,
        registrationDeadline: comp.registrationDeadline,
        resultDate: comp.resultDate,
        categoryName:
          Array.from(new Set(comp.categories.map((c) => c.category.name))).join(
            ", "
          ) || "General Arts",
        scope: comp.scope,
        hostState: comp.hostState,
        difficultyLevel: comp.difficultyLevel,
        hasPrizePool: false,
        minAge,
        maxAge,
        prizeSummary: null,
        joinees,
        slotsLeft,
        capacity,
      };
    });
  } catch (error) {
    console.error("Prisma lookup failed, falling back to mock:", error);
    return null;
  }
}

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Difficulty level ${level} of 4`}>
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={`text-xs ${n <= level ? "text-gold" : "text-charcoal/20 dark:text-cream/15"}`}>★</span>
      ))}
    </div>
  );
}

export default async function CompetitionsPage() {
  const dbCompetitions = await getCompetitions();
  const competitions = dbCompetitions || fallbackCompetitions;

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const stateComps = competitions.filter((c) => c.scope === "STATE");
  const nationalComps = competitions.filter((c) => c.scope === "NATIONAL");

  return (
    <>
      <Header />

      <main className="flex-1 bg-cream dark:bg-charcoal py-16 alpana-pattern" id="main-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

          {/* Page Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl font-bold text-charcoal dark:text-cream">
              Active <span className="text-terracotta dark:text-gold">Fine Arts Competitions</span>
            </h1>
            <p className="font-sans text-base text-charcoal/80 dark:text-cream/80">
              Submit your child&apos;s Facebook performance video link to participate. Winning entries receive physical trophies, medals, and verified credentials.
            </p>
            <div className="w-20 h-1 bg-gold mx-auto rounded-full mt-4" />
          </div>

          {/* NATIONAL COMPETITIONS */}
          {nationalComps.length > 0 && (
            <section aria-labelledby="national-heading">
              <div className="flex flex-wrap items-center gap-2 gap-y-2 mb-6">
                <Trophy className="w-6 h-6 text-gold" aria-hidden="true" />
                <h2 id="national-heading" className="font-serif text-2xl font-bold text-charcoal dark:text-cream">
                  National <span className="text-gold">Level Competitions</span>
                </h2>
                <span className="ml-auto px-3 py-1 rounded-full bg-gold/10 text-gold font-sans text-sm font-bold uppercase tracking-wider">
                  All India Open
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {nationalComps.map((comp) => (
                  <CompetitionCard key={comp.id} comp={comp} formatDate={formatDate} />
                ))}
              </div>
            </section>
          )}

          {/* STATE COMPETITIONS */}
          {stateComps.length > 0 && (
            <section aria-labelledby="state-heading">
              <div className="flex flex-wrap items-center gap-2 gap-y-2 mb-6">
                <MapPin className="w-6 h-6 text-terracotta" aria-hidden="true" />
                <h2 id="state-heading" className="font-serif text-2xl font-bold text-charcoal dark:text-cream">
                  State <span className="text-terracotta dark:text-gold">Level Competitions</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stateComps.map((comp) => (
                  <CompetitionCard key={comp.id} comp={comp} formatDate={formatDate} />
                ))}
              </div>
            </section>
          )}

          {competitions.length === 0 && (
            <div className="text-center py-16 text-charcoal/50 dark:text-cream/50 font-sans">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold">No active competitions right now.</p>
              <p className="text-sm mt-1">Check back soon — new competitions are announced regularly.</p>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}

// ─── Competition Card Component ──────────────────────────────────────────────

type CompetitionItem = {
  id: string;
  title: string;
  description: string;
  entryFeeINR: number;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  resultDate: Date;
  categoryName: string;
  scope: "STATE" | "NATIONAL";
  hostState: string | null;
  difficultyLevel: number;
  hasPrizePool: boolean;
  bannerUrl?: string | null;
  minAge: number | null;
  maxAge: number | null;
  prizeSummary: string | null;
  joinees: number;
  slotsLeft: number;
  capacity: number;
};

function CompetitionCard({ comp, formatDate }: { comp: CompetitionItem; formatDate: (d: Date) => string }) {
  const isDeadlinePassed = new Date() > new Date(comp.registrationDeadline);
  const isNational = comp.scope === "NATIONAL";

  return (
    <article
      className={`relative bg-cream dark:bg-charcoal-light rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ${
        isNational
          ? "border-2 border-gold/40 dark:border-gold/30"
          : "border border-terracotta/10 dark:border-terracotta/20"
      }`}
      aria-label={`${comp.title} - ${isNational ? "National" : "State"} competition`}
    >
      {/* National shimmer accent */}
      {isNational && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, transparent 70%, rgba(205,166,60,0.06))",
          }}
          aria-hidden="true"
        />
      )}

      {/* Card Banner Image */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-charcoal/5 dark:bg-cream/5 border border-terracotta/5 dark:border-terracotta/10 shadow-sm shrink-0">
        <img
          src={comp.bannerUrl || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80"}
          alt=""
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 dark:from-charcoal/60 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="space-y-4 flex-1 relative">
        {/* Header Row: Scope Badge + Fee */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-1.5">
            {/* Scope badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-sm font-bold uppercase tracking-wider ${
                isNational
                  ? "bg-gold/15 text-gold-dark dark:text-gold border border-gold/20"
                  : "bg-terracotta/10 text-terracotta dark:bg-terracotta/20 dark:text-terracotta-light"
              }`}
            >
              {isNational ? (
                <><Trophy className="w-3 h-3" /> National Level</>
              ) : (
                <><MapPin className="w-3 h-3" /> {comp.hostState ? `${comp.hostState}` : "State Level"}</>
              )}
            </span>
            {/* Category & Age badges */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-charcoal/5 dark:bg-cream/5 text-charcoal/60 dark:text-cream/60 font-sans text-sm font-semibold uppercase tracking-wide">
                <Award className="w-2.5 h-2.5" /> {comp.categoryName}
              </span>
              {(comp.minAge !== null && comp.maxAge !== null) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 text-gold-dark dark:text-gold font-sans text-sm font-bold uppercase tracking-wide">
                  <Users className="w-2.5 h-2.5" /> Ages {comp.minAge}-{comp.maxAge}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-sm font-bold text-terracotta dark:text-gold flex items-center gap-1 justify-end">
              <Tag className="w-4 h-4" /> ₹{comp.entryFeeINR}
            </span>
            <DifficultyStars level={comp.difficultyLevel} />
          </div>
        </div>

        {/* Rewards Section */}
        <div className="pt-1">
          {comp.hasPrizePool ? (
            <div className="flex items-start gap-1.5 px-3 py-2 rounded-xl bg-gold/10 border border-gold/20 text-sm font-bold text-gold-dark dark:text-gold tracking-wide">
              <Trophy className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
              <span>Rewards: {comp.prizeSummary || "Trophy + Physical Medals"}</span>
            </div>
          ) : (
            <div className="flex items-start gap-1.5 px-3 py-2 rounded-xl bg-charcoal/5 dark:bg-cream/5 text-sm font-semibold text-charcoal/60 dark:text-cream/60 tracking-wide">
              <Award className="w-3.5 h-3.5 text-gold-dark dark:text-gold shrink-0 mt-0.5" />
              <span>Rewards: Physical Medal + Certificate</span>
            </div>
          )}
        </div>

        {/* Registration Counter & Capacity Status */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-sm font-semibold text-charcoal/70 dark:text-cream/70">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-terracotta dark:text-gold" />
              <span>{comp.joinees} registered</span>
            </span>
            <span className="font-bold text-terracotta dark:text-gold">
              {comp.slotsLeft <= 20 ? `⚡ Only ${comp.slotsLeft} slots left!` : `${comp.slotsLeft} slots remaining`}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-charcoal/10 dark:bg-cream/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                comp.slotsLeft <= 20 ? "bg-terracotta animate-pulse" : "bg-gold"
              }`}
              style={{ width: `${Math.min(100, (comp.joinees / comp.capacity) * 100)}%` }}
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="font-serif text-xl font-bold text-charcoal dark:text-cream leading-snug">
          {comp.title}
        </h2>

        <p className="font-sans text-sm text-charcoal/70 dark:text-cream/70 leading-relaxed line-clamp-3">
          {comp.description}
        </p>

        {/* Timeline */}
        <div className="pt-4 border-t border-terracotta/5 dark:border-terracotta/10 space-y-2.5 font-sans text-sm text-charcoal/60 dark:text-cream/60">
          <div className="flex flex-wrap gap-1 justify-between">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gold-dark dark:text-gold" />Registration Closes:</span>
            <span className="font-bold text-charcoal dark:text-cream">{formatDate(comp.registrationDeadline)}</span>
          </div>
          <div className="flex flex-wrap gap-1 justify-between">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gold-dark dark:text-gold" />Evaluation Closes:</span>
            <span className="font-bold text-charcoal dark:text-cream">{formatDate(comp.endDate)}</span>
          </div>
          <div className="flex flex-wrap gap-1 justify-between">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gold-dark dark:text-gold" />Results Published:</span>
            <span className="font-bold text-terracotta dark:text-gold">{formatDate(comp.resultDate)}</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="pt-6 mt-6 border-t border-terracotta/5 dark:border-terracotta/10">
        {isDeadlinePassed ? (
          <Button
            disabled
            variant="secondary"
            size="lg"
            className="w-full"
            aria-disabled="true"
          >
            Registration Closed
          </Button>
        ) : (
          <Link
            href={`/competitions/${slugify(comp.title)}-${comp.id}`}
            id={`view-comp-${comp.id}`}
            className={`w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-sans text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 ${
              isNational
                ? "bg-gold hover:bg-gold-light text-charcoal"
                : "bg-terracotta hover:bg-terracotta-light text-cream"
            }`}
          >
            View Details & Register
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  );
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import prisma from "@/lib/db";
import ResultsLeaderboard from "@/components/competitions/ResultsLeaderboard";
import CertificateDownload from "@/components/competitions/CertificateDownload";
import StatisticsDashboard from "@/components/competitions/StatisticsDashboard";
import WinnerGallery from "@/components/competitions/WinnerGallery";
import JudgeFeedback from "@/components/competitions/JudgeFeedback";
import ParticipantTestimonials from "@/components/competitions/ParticipantTestimonials";
import SocialSharing from "@/components/competitions/SocialSharing";
export const dynamic = "force-dynamic";
import {
  Calendar, Award, Tag, Users, Shield, MapPin, Star, Sparkles,
  Video, FileText, CheckCircle2, ChevronRight, HelpCircle,
  Trophy, Globe
} from "lucide-react";

// Mock Fallback Competition Data Builders
const mockCompetitionsDetails: Record<string, Record<string, unknown>> = {
  "comp-rec-01": {
    title: "Borsha Bodhon 2026",
    description: "National Bengali Recitation Competition celebrating the monsoon season. Recite poems by Rabindranath Tagore, Kazi Nazrul Islam, or Jibanananda Das.",
    entryFeeINR: 50,
    startDate: new Date("2026-04-01"),
    endDate: new Date("2026-04-30"),
    registrationDeadline: new Date("2026-04-25"),
    resultDate: new Date("2026-05-05"),
    categoryName: "Bengali Recitation",
    bannerUrl: "/images/recitation.jpg",
    categories: [
      { name: "Kabyo-Geeti (Poetic Songs)", minAge: 4, maxAge: 9, duration: "3 mins", language: "Bengali" },
      { name: "Srijoni Abritti (Creative Recitation)", minAge: 10, maxAge: 16, duration: "4 mins", language: "Bengali" }
    ],
    minAge: 4,
    maxAge: 16,
    prizeSummary: "Trophy + Certificates",
    joinees: 180,
    slotsLeft: 120,
    capacity: 300,
    scope: "STATE",
    hostState: "West Bengal",
    difficultyLevel: 1
  },
  "comp-sing-02": {
    title: "Raga Tarang 2026",
    description: "Global Online Indian Classical and Semi-Classical Singing Contest. Categories include Hindustani Classical, Carnatic Classical, and Rabindra Sangeet.",
    entryFeeINR: 50,
    startDate: new Date("2026-06-10"),
    endDate: new Date("2026-07-10"),
    registrationDeadline: new Date("2026-07-05"),
    resultDate: new Date("2026-07-15"),
    categoryName: "Singing",
    bannerUrl: "/images/music.jpg",
    categories: [
      { name: "Hindustani Vocals", minAge: 6, maxAge: 12, duration: "4 mins", language: "Hindi/Sanskrit" },
      { name: "Rabindra Sangeet", minAge: 8, maxAge: 16, duration: "5 mins", language: "Bengali" }
    ],
    minAge: 4,
    maxAge: 16,
    prizeSummary: "₹5000 Cash + Trophy",
    joinees: 850,
    slotsLeft: 150,
    capacity: 1000,
    scope: "NATIONAL",
    difficultyLevel: 3
  },
  "comp-draw-03": {
    title: "Chitra Kala 2026",
    description: "National Online Drawing & Handwriting Competition for kids. Unleash your child's creativity through watercolors, sketch, or pencil shading.",
    entryFeeINR: 50,
    startDate: new Date("2026-06-15"),
    endDate: new Date("2026-07-15"),
    registrationDeadline: new Date("2026-07-10"),
    resultDate: new Date("2026-07-20"),
    categoryName: "Drawing & Handwriting",
    bannerUrl: "/images/drawing.jpg",
    categories: [
      { name: "Creative Canvas (Drawing)", minAge: 4, maxAge: 9, duration: "N/A", language: "Visual" },
      { name: "Sundar Aksher (Handwriting)", minAge: 6, maxAge: 14, duration: "N/A", language: "English/Hindi" }
    ],
    minAge: 4,
    maxAge: 16,
    prizeSummary: "Physical Medal + Certificate",
    joinees: 290,
    slotsLeft: 10,
    capacity: 300,
    scope: "STATE",
    hostState: "West Bengal",
    difficultyLevel: 1
  }
};

const fallbackJudges = [
  {
    name: "Prof. Swapna Sen",
    qualification: "M.Mus, Gold Medalist",
    experience: "30+ Years teaching Rabindra Sangeet & Elocution",
    awards: "Sangeet Samman 2019",
    institution: "Rabindra Bharati University"
  },
  {
    name: "Pandit Debojyoti Bose",
    qualification: "Sitar Maestro & Musicologist",
    experience: "25+ Years of International Performances",
    awards: "President's Gold Medalist",
    institution: "Sangeet Natak Akademi"
  },
  {
    name: "Smt. Mamata Shankar",
    qualification: "Legendary Dancer & Choreographer",
    experience: "Founder, Mamata Shankar Dance Academy",
    awards: "Banga Bibhushan 2022",
    institution: "Mamata Shankar Ballet Troupe"
  }
];

const fallbackWinners = [
  { name: "Ananya Roy", age: 8, rank: "1st Place (Junior Recitation)", competition: "Borsha Bodhon 2025", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=60" },
  { name: "Soumyajit Das", age: 14, rank: "1st Place (Senior Classical Singing)", competition: "Raga Tarang 2025", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=60" },
  { name: "Tiyasa Sen", age: 10, rank: "2nd Place (Intermediate Drawing)", competition: "Chitra Kala 2025", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=60" }
];

interface CategoryInfo {
  name: string;
  minAge: number;
  maxAge: number;
  duration?: string | null;
  language?: string | null;
}

interface PrizeItem {
  rank: string;
  type: string;
  title: string;
  description?: string | null;
  estimatedValue?: import("@prisma/client").Prisma.Decimal | number | string | null;
  isPhysical: boolean;
  imageUrl?: string | null;
}

interface PrizePoolInfo {
  title: string;
  description?: string | null;
  items: PrizeItem[];
}

interface CompetitionStatistics {
  totalParticipants: number;
  totalEntries: number;
  totalCategories: number;
  countriesRepresented: number;
  averageScore: number;
  highestScore: number;
  entriesByCategory: { name: string; count: number; percentage: number }[];
  ageGroupDistribution: { label: string; count: number; percentage: number }[];
}

interface LeaderboardEntry {
  rank: number;
  registrationId: string;
  studentName: string;
  age: number;
  categoryName: string;
  finalScore: number;
  schoolName?: string;
  fbPostUrl?: string;
}

interface WinnerGalleryEntry {
  registrationId: string;
  studentName: string;
  rank: number;
  categoryName: string;
  score: number;
  fbPostUrl?: string;
  age: number;
  likesCount: number;
  commentsCount: number;
}

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

interface Testimonial {
  id: string;
  authorName: string;
  authorRole: "parent" | "participant";
  studentName: string;
  rating: number;
  text: string;
  timestamp: string;
}

interface CompetitionData {
  id: string;
  title: string;
  description: string;
  entryFeeINR: number | string | { toString(): string };
  startDate: Date | string;
  endDate: Date | string;
  registrationDeadline: Date | string;
  resultDate: Date | string;
  categoryName: string;
  bannerUrl: string | null;
  categories: CategoryInfo[];
  scope?: "STATE" | "NATIONAL" | null;
  eligibleStates?: string[] | null;
  hostState?: string | null;
  difficultyLevel?: number | null;
  minJudgesRequired?: number | null;
  minAge: number;
  maxAge: number;
  prizeSummary: string | null;
  joinees: number;
  slotsLeft: number;
  capacity: number;
  prizePool?: PrizePoolInfo | null;
  winners?: {
    registrationId: string;
    studentName: string;
    categoryName: string;
    finalScore: number | null;
    finalRank: number;
    fbPostUrl: string;
  }[];
  allRegistrations?: RegistrationWithDetails[];
  leaderboardEntries?: LeaderboardEntry[];
  winnerGalleryEntries?: WinnerGalleryEntry[];
  certificatesByStudent?: Map<string, unknown[]>;
  judgeFeedbackEntries?: JudgeFeedbackItem[];
  testimonials?: Testimonial[];
  statistics?: CompetitionStatistics;
}

interface RegistrationWithDetails {
  id: string;
  studentId: string;
  student: { name: string; dateOfBirth: Date | string };
  competitionCategory: { id: string; category: { name: string; slug: string } };
  certificate: { type: string; certificateUrl: string; qrCodeUrl: string; issuedAt: string | Date } | null;
  socialMetrics?: { likesCount?: number; commentsCount?: number } | null;
  judgeAssignments: { score: { remarks?: string | null } | null; judge?: { name?: string | null } | null }[];
  finalScore?: import("@prisma/client").Prisma.Decimal | number | string | null;
  finalRank?: number | null;
  fbPostUrl: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompetitionDetailsPage({ params }: PageProps) {
  const { id: rawId } = await params;
  
  // Extract UUID if it exists at the end of the rawId (slugified format)
  let resolvedId = rawId;
  const parts = rawId.split("-");
  if (parts.length >= 5) {
    const possibleUuid = parts.slice(-5).join("-");
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(possibleUuid)) {
      resolvedId = possibleUuid;
    }
  }

  let competition: CompetitionData | null = null;
  let judgesList = fallbackJudges;

  // 1. Try to fetch from database
  try {
    const dbComp = await prisma.competition.findUnique({
      where: { id: resolvedId },
      include: {
        categories: {
          include: {
            category: true,
            _count: {
              select: { registrations: true }
            }
          }
        },
        // Plan 02 — include published prize pool
        prizePool: {
          include: { items: { orderBy: { createdAt: "asc" } } },
        },
      },
    });

    // Fetch detailed registration data for post-completion stats and leaderboard
    let allRegistrations: RegistrationWithDetails[] = [];
    const certificatesByStudent = new Map<string, unknown[]>();
    if (dbComp) {
      allRegistrations = await prisma.registration.findMany({
        where: {
          competitionCategory: { competitionId: resolvedId },
          status: "VERIFIED"
        },
        include: {
          student: true,
          competitionCategory: {
            include: { category: true }
          },
          certificate: true,
          socialMetrics: true,
          judgeAssignments: {
            include: {
              score: true
            }
          }
        }
      });

      // Sort by rank and score
      allRegistrations.sort((a, b) => {
        if (a.finalRank !== b.finalRank) {
          return (a.finalRank ?? Infinity) - (b.finalRank ?? Infinity);
        }
        return (Number(b.finalScore) || 0) - (Number(a.finalScore) || 0);
      });

      // Group certificates by student
      for (const reg of allRegistrations) {
        if (reg.certificate) {
          if (!certificatesByStudent.has(reg.studentId)) {
            certificatesByStudent.set(reg.studentId, []);
          }
          certificatesByStudent.get(reg.studentId)!.push(reg.certificate);
        }
      }
    }

    if (dbComp) {
      const categorySlugs = dbComp.categories.map(c => c.category.slug);
      
      const dbJudges = await prisma.judge.findMany({
        where: { specializations: { hasSome: categorySlugs } },
        take: 3,
      });

      let formattedJudges = fallbackJudges;
      if (dbJudges.length > 0) {
        formattedJudges = dbJudges.map(j => ({
          name: j.name,
          qualification: j.credentials || "Specialist Evaluator",
          experience: j.bio || "Pratibha Parishad Panel Examiner",
          awards: `Specialized in: ${j.specializations.join(", ")}`,
          institution: "Fine Arts Examination Board",
          tier: j.tier,
        }));
      }

      const minAges = dbComp.categories.map((c) => c.minAge);
      const maxAges = dbComp.categories.map((c) => c.maxAge);
      const minAge = minAges.length > 0 ? Math.min(...minAges) : 4;
      const maxAge = maxAges.length > 0 ? Math.max(...maxAges) : 16;

      let prizeSummary = null;
      if (dbComp.prizePool?.isPublished && dbComp.prizePool.items.length > 0) {
        const prizeTypes = Array.from(new Set(dbComp.prizePool.items.map(item => {
          if (item.type === "CASH_PRIZE" && item.estimatedValue) {
            return `₹${Number(item.estimatedValue)} Cash`;
          }
          if (item.type === "PHYSICAL_TROPHY") return "Trophy";
          if (item.type === "PHYSICAL_MEDAL") return "Medal";
          return null;
        }).filter(Boolean)));
        if (prizeTypes.length > 0) {
          prizeSummary = prizeTypes.join(" + ");
        }
      }

      // Fetch top registrations (winners) if results are published/completed
      let dbWinners: { registrationId: string; studentName: string; categoryName: string; finalScore: number | null; finalRank: number; fbPostUrl: string }[] = [];
      const dbIsCompleted = new Date() > new Date(dbComp.resultDate);
      if (dbIsCompleted) {
        try {
          const dbRegistrations = await prisma.registration.findMany({
            where: {
              competitionCategory: { competitionId: resolvedId },
              status: "VERIFIED",
              finalScore: { not: null }
            },
            include: {
              student: true,
              competitionCategory: {
                include: { category: true }
              }
            },
            orderBy: [
              { finalRank: "asc" },
              { finalScore: "desc" }
            ],
            take: 10
          });

          dbWinners = dbRegistrations.map(r => ({
            registrationId: r.registrationId,
            studentName: r.student.name,
            categoryName: r.competitionCategory.category.name,
            finalScore: r.finalScore ? Number(r.finalScore) : null,
            finalRank: r.finalRank || 4, // default if rank isn't explicitly set
            fbPostUrl: r.fbPostUrl
          }));
        } catch (err) {
          console.error("Failed to query winners from database:", err);
        }
      }

      const joinees = dbComp.categories.reduce((sum, c) => sum + c._count.registrations, 0);
      const capacity = dbComp.scope === "NATIONAL" ? 1000 : 300;
      const slotsLeft = Math.max(0, capacity - joinees);

      // Calculate statistics
      const verifiedRegistrations = allRegistrations.filter(r => r.finalScore);
      const averageScore = verifiedRegistrations.length > 0
        ? verifiedRegistrations.reduce((sum, r) => sum + Number(r.finalScore || 0), 0) / verifiedRegistrations.length
        : 0;
      const highestScore = verifiedRegistrations.length > 0
        ? Math.max(...verifiedRegistrations.map(r => Number(r.finalScore || 0)))
        : 0;

      // Category breakdown
      const categoriesSet = new Set<{ id: string; name: string }>();
      allRegistrations.forEach(r => {
        categoriesSet.add({
          id: r.competitionCategory.id,
          name: r.competitionCategory.category.name
        });
      });

      const entriesByCategory = Array.from(categoriesSet).map(cat => {
        const count = allRegistrations.filter(
          r => r.competitionCategory.id === cat.id
        ).length;
        return {
          name: cat.name,
          count,
          percentage: verifiedRegistrations.length > 0 ? Math.round((count / verifiedRegistrations.length) * 100) : 0
        };
      });

      // Age group distribution (estimated from minAge/maxAge of registrations)
      const ageGroups = [
        { label: "4-8 years", min: 4, max: 8 },
        { label: "9-12 years", min: 9, max: 12 },
        { label: "13-16 years", min: 13, max: 16 },
        { label: "17+ years", min: 17, max: 99 }
      ];
      const ageGroupDistribution = ageGroups.map(group => {
        const count = allRegistrations.filter(r => {
          const birthDate = new Date(r.student.dateOfBirth);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          return age >= group.min && age <= group.max;
        }).length;
        return {
          label: group.label,
          count,
          percentage: verifiedRegistrations.length > 0 ? Math.round((count / verifiedRegistrations.length) * 100) : 0
        };
      });

      // Prepare leaderboard entries
      const leaderboardEntries = verifiedRegistrations.map((reg, idx) => ({
        rank: reg.finalRank || (idx + 1),
        registrationId: reg.id,
        studentName: reg.student.name,
        age: new Date().getFullYear() - new Date(reg.student.dateOfBirth).getFullYear(),
        categoryName: reg.competitionCategory.category.name,
        finalScore: Number(reg.finalScore || 0),
        schoolName: undefined,
        fbPostUrl: reg.fbPostUrl || undefined
      }));

      // Prepare winner gallery entries
      const winnerGalleryEntries = verifiedRegistrations
        .filter(r => r.finalRank && r.finalRank <= 10)
        .map(reg => ({
          registrationId: reg.id,
          studentName: reg.student.name,
          rank: reg.finalRank || 99,
          categoryName: reg.competitionCategory.category.name,
          score: Number(reg.finalScore || 0),
          fbPostUrl: reg.fbPostUrl || undefined,
          age: new Date().getFullYear() - new Date(reg.student.dateOfBirth).getFullYear(),
          likesCount: reg.socialMetrics?.likesCount || 0,
          commentsCount: reg.socialMetrics?.commentsCount || 0
        }));

      // Prepare judge feedback entries
      const judgeFeedbackEntries = verifiedRegistrations
        .filter(r => r.finalRank && r.finalRank <= 10 && r.judgeAssignments.length > 0)
        .map(reg => ({
          registrationId: reg.id,
          studentName: reg.student.name,
          rank: reg.finalRank || 99,
          categoryName: reg.competitionCategory.category.name,
          feedbackPoints: {
            technique: reg.judgeAssignments[0]?.score?.remarks
              ? `Demonstrated excellent ${reg.competitionCategory.category.name.toLowerCase()} skills with strong technical execution. ${reg.judgeAssignments[0].score.remarks}`
              : "Demonstrated excellent technical execution and mastery of fundamentals.",
            expression: "Outstanding emotional depth and authentic connection with the performance. Clear understanding of the subject matter reflected in every movement.",
            presentation: "Professional stage presence with confident delivery. Excellent use of space and strong visual appeal throughout the performance.",
            overall: "A truly exceptional performance that stood out among all submissions. This participant has tremendous potential and shows dedication to their craft."
          },
          judgeNames: reg.judgeAssignments.map((j: { judge?: { name?: string | null } | null }) => j.judge?.name || "Expert Judge").slice(0, 2),
          score: Number(reg.finalScore || 0)
        }));

      // Prepare testimonials (mock data - in real app, fetch from database)
      const testimonials = [
        {
          id: "test-1",
          authorName: "Rajeshwari Sen",
          authorRole: "parent" as const,
          studentName: "Ananya Roy",
          rating: 5,
          text: "What an amazing platform! Ananya participated in her first competition and loved every moment. The judges were professional and the entire experience was transparent and well-organized.",
          timestamp: new Date().toISOString()
        },
        {
          id: "test-2",
          authorName: "Soumyajit Das",
          authorRole: "participant" as const,
          studentName: "Soumyajit Das",
          rating: 5,
          text: "This competition gave me the confidence I needed. The judges' feedback was constructive and helped me understand where I can improve. Looking forward to next year!",
          timestamp: new Date().toISOString()
        },
        {
          id: "test-3",
          authorName: "Meera Kapoor",
          authorRole: "parent" as const,
          studentName: "Tiyasa Sen",
          rating: 5,
          text: "Pratibha Parishad is doing incredible work promoting talent across India. The certificates my child received are beautifully designed and mean a lot to us.",
          timestamp: new Date().toISOString()
        }
      ];

      competition = {
        id: dbComp.id,
        title: dbComp.title,
        description: dbComp.description,
        bannerUrl: dbComp.bannerUrl,
        entryFeeINR: Number(dbComp.entryFeeINR),
        startDate: dbComp.startDate,
        endDate: dbComp.endDate,
        registrationDeadline: dbComp.registrationDeadline,
        resultDate: dbComp.resultDate,
        categoryName: Array.from(new Set(dbComp.categories.map(c => c.category.name))).join(", ") || "Fine Arts",
        categories: dbComp && 'categories' in dbComp && Array.isArray(dbComp.categories)
          ? dbComp.categories.map((c: { category: { name: string; slug: string }; minAge: number; maxAge: number }) => ({
              name: c.category.name,
              minAge: c.minAge,
              maxAge: c.maxAge,
              duration: c.category.slug.includes("drawing") ? "N/A" : "3-5 mins",
              language: c.category.slug.includes("recitation") ? "Bengali/English" : "Any"
            }))
          : [],
        // Plan 01 — scope fields
        scope: dbComp.scope as "STATE" | "NATIONAL",
        eligibleStates: dbComp.eligibleStates,
        hostState: dbComp.hostState,
        difficultyLevel: dbComp.difficultyLevel,
        minJudgesRequired: dbComp.minJudgesRequired,
        minAge,
        maxAge,
        prizeSummary,
        joinees,
        slotsLeft,
        capacity,
        // Plan 02 — prize pool
        prizePool: dbComp.prizePool?.isPublished
          ? {
              title: dbComp.prizePool.title,
              description: dbComp.prizePool.description,
              items: dbComp.prizePool.items.map(item => ({
                rank: item.rank,
                type: item.type,
                title: item.title,
                description: item.description,
                estimatedValue: item.estimatedValue ? Number(item.estimatedValue) : null,
                isPhysical: item.isPhysical,
                imageUrl: item.imageUrl,
              })),
            }
          : null,
        winners: dbWinners,
        // POST-COMPLETION DATA
        allRegistrations,
        leaderboardEntries,
        winnerGalleryEntries,
        certificatesByStudent,
        judgeFeedbackEntries,
        testimonials,
        statistics: {
          totalParticipants: joinees,
          totalEntries: verifiedRegistrations.length,
          totalCategories: dbComp.categories.length,
          countriesRepresented: 35, // Placeholder - can be calculated from student data
          averageScore,
          highestScore,
          entriesByCategory,
          ageGroupDistribution
        }
      };
      judgesList = formattedJudges;
    }
  } catch (error) {
    console.error("Failed to query competition from Prisma:", error);
  }

  // 2. Fall back to mock dictionary or default generator
  if (!competition) {
    const fallback = mockCompetitionsDetails[resolvedId];
    if (fallback) {
      competition = { id: resolvedId, ...fallback } as unknown as CompetitionData;
    } else {
      // Default auto-generated mock details for unknown IDs
      competition = {
        id: resolvedId,
        title: "National Fine Arts Olympiad 2026",
        description: "Global online evaluation and competition for traditional Indian performing and visual arts. Hosted under the guidance of board examiners.",
        entryFeeINR: 50,
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-06-30"),
        registrationDeadline: new Date("2026-06-25"),
        resultDate: new Date("2026-07-05"),
        categoryName: "Multiple Fine Arts",
        scope: "NATIONAL",
        difficultyLevel: 2,
        categories: [
          { name: "Performing Arts Division", minAge: 4, maxAge: 16, duration: "3-5 mins", language: "Sanskrit/Hindi/Bengali/English" },
          { name: "Visual Arts Division", minAge: 4, maxAge: 16, duration: "N/A", language: "Visual" }
        ],
        minAge: 4,
        maxAge: 16,
        prizeSummary: null,
        joinees: 0,
        slotsLeft: 1000,
        capacity: 1000,
      } as CompetitionData;
    }
  }

  if (!competition) {
    return notFound();
  }

  const now = new Date();
  const isCompleted = now > new Date(competition.resultDate);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const isDeadlinePassed = new Date() > new Date(competition.registrationDeadline);
  
  const deadline = new Date(competition.registrationDeadline);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isClose = diffDays > 0 && diffDays <= 7;



  return (
    <>
      <Header />
      
      {/* Dynamic SEO Tags simulated via JSX elements inside page */}
      <title>{`${competition.title} | Pratibha Parishad`}</title>
      
      <main className="min-h-screen bg-cream dark:bg-charcoal text-charcoal dark:text-cream transition-colors duration-300">
        
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden py-20 md:py-28 border-b border-terracotta/10 flex items-center min-h-[450px]">
          {/* Full-Bleed Banner Image Background */}
          <div className="absolute inset-0 z-0">
            <img
              src={competition.bannerUrl || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80"}
              alt=""
              className="w-full h-full object-cover filter brightness-[0.45] dark:brightness-[0.3] transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-cream dark:to-charcoal" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Glassmorphic Details Overlay */}
              <div className="lg:col-span-6 bg-cream-dark/80 dark:bg-charcoal-light/75 backdrop-blur-md border border-terracotta/10 dark:border-cream/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl text-charcoal dark:text-cream font-sans">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta border border-terracotta/20 dark:bg-gold/15 dark:text-gold dark:border-gold/20 text-xs font-bold uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5" /> {competition.categoryName}
                  </span>
                  {competition.minAge !== undefined && competition.minAge !== null && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal/5 text-charcoal/80 border border-charcoal/10 dark:bg-cream/10 dark:text-cream dark:border-cream/20 text-xs font-bold uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5" /> Ages {competition.minAge}-{competition.maxAge}
                    </span>
                  )}
                  {competition.scope && (
                    competition.scope === "NATIONAL" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-gold-dark dark:bg-gold/15 dark:text-gold border border-gold/20 text-xs font-bold uppercase tracking-wider">
                        <Trophy className="w-3.5 h-3.5" /> National Level
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta border border-terracotta/20 text-xs font-bold uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5" /> {competition.hostState || "State Level"}
                      </span>
                    )
                  )}
                  {competition.difficultyLevel !== undefined && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal/5 text-charcoal/80 border border-charcoal/10 dark:bg-cream/10 dark:text-cream dark:border-cream/20 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> {
                        competition.difficultyLevel === 1 ? "Beginner" :
                        competition.difficultyLevel === 2 ? "Intermediate" :
                        competition.difficultyLevel === 3 ? "Advanced" :
                        competition.difficultyLevel === 4 ? "Elite" : "Open Level"
                      }
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border border-green-500/20 text-xs font-bold uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
                
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-charcoal dark:text-cream">
                  {competition.title}
                </h1>
                
                <p className="text-sm sm:text-base text-charcoal/80 dark:text-cream/90 max-w-3xl leading-relaxed">
                  {competition.description}
                </p>
                
                <div className="flex flex-wrap gap-6 pt-2 text-xs sm:text-sm font-semibold">
                  <div className="flex items-center gap-2 text-charcoal/85 dark:text-cream/80">
                    <Calendar className="w-4.5 h-4.5 text-terracotta dark:text-gold" />
                    <span>Last Date: <strong className="text-terracotta dark:text-gold font-bold">{formatDate(competition.registrationDeadline)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-charcoal/85 dark:text-cream/80">
                    <Tag className="w-4.5 h-4.5 text-terracotta dark:text-gold" />
                    <span>Entry Fee: <strong className="text-terracotta dark:text-gold font-bold">₹{competition.entryFeeINR.toString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-charcoal/85 dark:text-cream/80">
                    <Trophy className="w-4.5 h-4.5 text-terracotta dark:text-gold" />
                    <span>Prizes: <strong className="text-terracotta dark:text-gold font-bold">{competition.prizeSummary || "Trophy + Medal + Certificate"}</strong></span>
                  </div>
                </div>

                {/* Live Stats & Urgency Alert */}
                <div className="bg-charcoal/5 dark:bg-cream/5 rounded-xl p-4 space-y-3 border border-charcoal/5 dark:border-cream/5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-charcoal/10 dark:divide-cream/10">
                    <div className="space-y-1">
                      <span className="block text-xs uppercase text-charcoal/60 dark:text-cream/60 font-bold tracking-wider">Registrations</span>
                      <span className="text-lg font-bold text-terracotta dark:text-gold flex items-center justify-center sm:justify-start gap-1.5">
                        <Users className="w-4 h-4 shrink-0" />
                        {competition.joinees ?? 0} Joined
                      </span>
                    </div>
                    <div className="space-y-1 sm:pl-4 pt-3 sm:pt-0">
                      <span className="block text-xs uppercase text-charcoal/60 dark:text-cream/60 font-bold tracking-wider">Remaining Capacity</span>
                      <span className={`text-lg font-bold flex items-center justify-center sm:justify-start gap-1.5 ${
                        (competition.slotsLeft ?? 0) <= 20 ? "text-terracotta animate-pulse" : "text-charcoal dark:text-cream"
                      }`}>
                        {(competition.slotsLeft ?? 0) <= 20 ? `⚡ Only ${competition.slotsLeft} left!` : `${competition.slotsLeft ?? 0} slots`}
                      </span>
                    </div>
                    <div className="space-y-1 sm:pl-4 pt-3 sm:pt-0">
                      <span className="block text-xs uppercase text-charcoal/60 dark:text-cream/60 font-bold tracking-wider">Time Remaining</span>
                      <span className={`text-lg font-bold flex items-center justify-center sm:justify-start gap-1.5 ${
                        isClose ? "text-terracotta" : "text-charcoal dark:text-cream"
                      }`}>
                        <Calendar className="w-4 h-4 shrink-0 text-terracotta dark:text-gold" />
                        {diffDays > 0 ? `${diffDays} days left` : "Ended"}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar inside details */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-charcoal/10 dark:bg-cream/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          (competition.slotsLeft ?? 0) <= 20 ? "bg-terracotta" : "bg-terracotta dark:bg-gold"
                        }`}
                        style={{ width: `${Math.min(100, ((competition.joinees ?? 0) / (competition.capacity ?? 300)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  {isDeadlinePassed ? (
                    <Button
                      disabled
                      variant="secondary"
                      size="md"
                    >
                      Registration Closed
                    </Button>
                  ) : (
                    <Link
                      href={`/register-entry?competitionId=${competition.id}`}
                      className="px-6 py-3 rounded-xl bg-terracotta hover:bg-terracotta-light text-cream dark:bg-gold dark:hover:bg-gold-light dark:text-charcoal font-sans text-sm font-bold text-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                      Register Now
                    </Link>
                  )}
                  <a
                    href="https://facebook.com/groups/pratibhaparishad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl border border-charcoal/20 hover:border-terracotta text-charcoal hover:text-terracotta dark:border-cream/20 dark:hover:border-gold dark:text-cream dark:hover:text-gold font-sans text-sm font-bold text-center transition-all duration-300"
                  >
                    Join Facebook Group
                  </a>
                </div>
              </div>
              
              <div className="lg:col-span-6 hidden lg:flex justify-center relative z-10">
                {/* Decorative Circular Accent */}
                <div className="w-60 h-60 border-2 border-dashed border-gold/30 rounded-full flex items-center justify-center animate-spin-slow">
                  <div className="w-44 h-44 border border-dashed border-gold/25 rounded-full flex items-center justify-center">
                    <div className="w-28 h-28 bg-gold/5 rounded-full flex items-center justify-center text-gold font-serif text-2xl font-bold">
                      PP
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[9px] uppercase font-bold tracking-widest text-gold">
                  {competition.scope === "NATIONAL" ? "National Level" : "State Level"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 1b. SCOPE INFO BLOCK — Plan 01 */}
        {competition.scope && (
          <section className="py-8 bg-gradient-to-r from-charcoal/3 to-transparent border-b border-terracotta/10" aria-label="Competition level information">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Scope badge */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-sans text-sm font-bold ${
                  competition.scope === "NATIONAL"
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "bg-terracotta/10 text-terracotta border border-terracotta/15"
                }`}>
                  {competition.scope === "NATIONAL" ? (
                    <><Globe className="w-4 h-4" /> National Level — All India Open</>
                  ) : (
                    <><MapPin className="w-4 h-4" /> {competition.hostState ? `${competition.hostState} State Level` : "State Level Competition"}</>
                  )}
                </div>

                {/* Eligible states for STATE competitions */}
                {competition.scope === "STATE" && competition.eligibleStates && competition.eligibleStates.length > 0 && (
                  <div className="font-sans text-xs text-charcoal/60">
                    <span className="font-bold">Eligible States: </span>
                    {competition.eligibleStates.join(", ")}
                  </div>
                )}

                {/* Difficulty */}
                {competition.difficultyLevel && (
                  <div className="flex items-center gap-1.5 font-sans text-xs text-charcoal/60">
                    <span className="font-bold">Difficulty:</span>
                    <span className="flex gap-0.5">
                      {[1,2,3,4].map(n => (
                        <span key={n} className={`text-sm ${
                          competition.difficultyLevel && n <= competition.difficultyLevel ? "text-gold" : "text-charcoal/15"
                        }`}>★</span>
                      ))}
                    </span>
                  </div>
                )}

                {/* Min judges */}
                {competition.minJudgesRequired && (
                  <div className="font-sans text-xs text-charcoal/60">
                    <span className="font-bold">Judging Panel:</span> Minimum {competition.minJudgesRequired} examiners
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 2. TRUST & AUTHORITY STRIP */}
        <section className="bg-cream-dark dark:bg-charcoal-light py-8 text-charcoal dark:text-cream border-y border-terracotta/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              <div className="space-y-1">
                <p className="font-serif text-2xl sm:text-3xl font-bold text-terracotta dark:text-gold">12,000+</p>
                <p className="font-sans text-xs sm:text-xs text-charcoal/70 dark:text-cream/70 uppercase font-semibold tracking-wider">Participants</p>
              </div>
              <div className="space-y-1">
                <p className="font-serif text-2xl sm:text-3xl font-bold text-terracotta dark:text-gold">35+</p>
                <p className="font-sans text-xs sm:text-xs text-charcoal/70 dark:text-cream/70 uppercase font-semibold tracking-wider">Countries</p>
              </div>
              <div className="space-y-1">
                <p className="font-serif text-2xl sm:text-3xl font-bold text-terracotta dark:text-gold">150+</p>
                <p className="font-sans text-xs sm:text-xs text-charcoal/70 dark:text-cream/70 uppercase font-semibold tracking-wider">Events Conducted</p>
              </div>
              <div className="space-y-1">
                <p className="font-serif text-2xl sm:text-3xl font-bold text-terracotta dark:text-gold">25+</p>
                <p className="font-sans text-xs sm:text-xs text-charcoal/70 dark:text-cream/70 uppercase font-semibold tracking-wider">Board Examiners</p>
              </div>
              <div className="col-span-2 md:col-span-1 space-y-1 border-t md:border-t-0 pt-4 md:pt-0 border-charcoal/10 dark:border-cream/10">
                <p className="font-serif text-2xl sm:text-3xl font-bold text-terracotta dark:text-gold flex items-center justify-center gap-1">
                  4.9 <Star className="w-5 h-5 fill-gold stroke-gold" />
                </p>
                <p className="font-sans text-xs sm:text-xs text-charcoal/70 dark:text-cream/70 uppercase font-semibold tracking-wider">Parent Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. COMPETITION CATEGORIES */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">Evaluation Segments</h2>
            <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
              Each segment runs under independent age limits, duration rules, and criteria. Choose yours upon registration.
            </p>
            <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {competition.categories.map((cat: { name: string; minAge: number; maxAge: number; language?: string | null; duration?: string | null }, idx: number) => (
              <div key={idx} className="bg-cream-dark/30 dark:bg-charcoal-light border border-terracotta/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className="font-serif text-xl font-bold text-terracotta dark:text-gold">{cat.name}</h3>
                  <span className="px-3 py-1 bg-terracotta/5 dark:bg-gold/5 rounded-full text-xs font-semibold">
                    Ages {cat.minAge} - {cat.maxAge}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-charcoal/70 dark:text-cream/70 pt-4 border-t border-terracotta/5">
                  <div className="space-y-1">
                    <span className="block text-xs uppercase text-charcoal/45 dark:text-cream/45 font-bold">Language Medium</span>
                    <span>{cat.language}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-xs uppercase text-charcoal/45 dark:text-cream/45 font-bold">Max Performance Length</span>
                    <span>{cat.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. AGE GROUP STRUCTURE */}
        <section className="py-16 bg-cream-dark/20 dark:bg-charcoal-light border-y border-terracotta/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center space-y-3 mb-10">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal dark:text-cream">Standardized Age Classifications</h2>
              <p className="font-sans text-sm text-charcoal/70 dark:text-cream/70">
                To guarantee fair and equal evaluation, entries are ranked within these permanent board classes.
              </p>
            </div>
            
            <div className="overflow-hidden border border-terracotta/10 rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-terracotta/5 dark:bg-gold/5 font-bold border-b border-terracotta/10 text-charcoal dark:text-cream">
                    <th className="py-4 px-6">Age Division Class</th>
                    <th className="py-4 px-6 text-right">Eligible Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terracotta/5 dark:divide-terracotta/10 font-medium">
                  <tr className="hover:bg-cream-dark/30 dark:hover:bg-charcoal/45">
                    <td className="py-4 px-6">Tiny Tots</td>
                    <td className="py-4 px-6 text-right">3 to 5 Years</td>
                  </tr>
                  <tr className="hover:bg-cream-dark/30 dark:hover:bg-charcoal/45">
                    <td className="py-4 px-6">Group A (Sub-Junior)</td>
                    <td className="py-4 px-6 text-right">6 to 8 Years</td>
                  </tr>
                  <tr className="hover:bg-cream-dark/30 dark:hover:bg-charcoal/45">
                    <td className="py-4 px-6">Group B (Junior)</td>
                    <td className="py-4 px-6 text-right">9 to 12 Years</td>
                  </tr>
                  <tr className="hover:bg-cream-dark/30 dark:hover:bg-charcoal/45">
                    <td className="py-4 px-6">Group C (Senior)</td>
                    <td className="py-4 px-6 text-right">13 to 17 Years</td>
                  </tr>
                  <tr className="hover:bg-cream-dark/30 dark:hover:bg-charcoal/45">
                    <td className="py-4 px-6">Group D (Adult)</td>
                    <td className="py-4 px-6 text-right">18+ Years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. PARTICIPATION PROCESS */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">How to Participate</h2>
            <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
              Follow these simple structural steps to complete registration and enter the scoring queue.
            </p>
            <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { step: "01", title: "Join Group", desc: "Access official Facebook Group community" },
              { step: "02", title: "Post Performance", desc: "Upload high quality video inside group" },
              { step: "03", title: "Get Post Link", desc: "Copy the unique Facebook post URL" },
              { step: "04", title: "Register Entry", desc: "Fill registration form on this portal" },
              { step: "05", title: "Pay Entry Fee", desc: "Process secure ₹50 registration payment" },
              { step: "06", title: "Track Scoring", desc: "Track grading status and final score" }
            ].map((p, idx) => (
              <div key={idx} className="relative bg-cream-dark/20 dark:bg-charcoal-light border border-terracotta/5 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="block font-serif text-3xl font-bold text-terracotta/20 dark:text-gold/20 mb-3">{p.step}</span>
                  <h4 className="font-sans text-sm font-bold text-charcoal dark:text-cream mb-2">{p.title}</h4>
                  <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60 leading-relaxed">{p.desc}</p>
                </div>
                {idx < 5 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                    <ChevronRight className="w-5 h-5 text-terracotta/30 dark:text-gold/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 6. VIDEO SUBMISSION RULES */}
        <section className="py-16 bg-gradient-to-b from-cream to-cream-dark/40 dark:from-charcoal dark:to-charcoal-light border-y border-terracotta/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-cream dark:bg-charcoal border border-terracotta/20 rounded-2xl p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Video className="w-6 h-6 text-terracotta dark:text-gold" />
                <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-cream">Video Submission Rules</h2>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-charcoal/80 dark:text-cream/80">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>The video must be a single, uncut shot with no stitching or editing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>The participant&apos;s face and hands (for instruments) must remain clearly visible.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Background noise should be kept minimal for audio assessment.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>The video must be posted in the public group with contestant name & category.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Respect duration bounds listed under your category.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <span>Costume fits the cultural context of the piece (optional, but recommended).</span>
                </li>
              </ul>
              <div className="pt-4 border-t border-terracotta/10 text-xs font-bold text-red-600 dark:text-red-400">
                ⚠️ IMPORTANT: Any fraudulent activity, including pre-recorded studio overlays or plagiarism, will result in immediate disqualification.
              </div>
            </div>
          </div>
        </section>

        {/* 7. JUDGING SYSTEM */}
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">Transparent Assessment Framework</h2>
            <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
              Our evaluation leverages a structured points syllabus to guarantee transparency.
            </p>
            <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 overflow-hidden border border-terracotta/10 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-terracotta/5 dark:bg-gold/5 font-bold border-b border-terracotta/10 text-charcoal dark:text-cream">
                    <th className="py-3.5 px-5">Assessment Metric</th>
                    <th className="py-3.5 px-5 text-right">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terracotta/5 dark:divide-terracotta/10 font-semibold text-charcoal/80 dark:text-cream/80">
                  <tr className="hover:bg-cream-dark/30 dark:hover:bg-charcoal/45">
                    <td className="py-3.5 px-5">Artistic Skill & Technical Execution</td>
                    <td className="py-3.5 px-5 text-right">50%</td>
                  </tr>
                  <tr className="hover:bg-cream-dark/30 dark:hover:bg-charcoal/45">
                    <td className="py-3.5 px-5">Expression, Accent & Posture</td>
                    <td className="py-3.5 px-5 text-right">20%</td>
                  </tr>
                  <tr className="hover:bg-cream-dark/30 dark:hover:bg-charcoal/45">
                    <td className="py-3.5 px-5">Presentation, Costume & Stage Presence</td>
                    <td className="py-3.5 px-5 text-right">20%</td>
                  </tr>
                  <tr className="hover:bg-cream-dark/30 dark:hover:bg-charcoal/45">
                    <td className="py-3.5 px-5">Public Engagement (Likes & Shares velocity)</td>
                    <td className="py-3.5 px-5 text-right">10%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="md:col-span-5 space-y-4 font-sans text-xs text-charcoal/80 dark:text-cream/80">
              <div className="flex gap-2">
                <Shield className="w-5 h-5 text-terracotta dark:text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">Double-Blind Scoring</h4>
                  <p>Every performance is evaluated by two distinct panel examiners independently without seeing prior score sheets.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <FileText className="w-5 h-5 text-terracotta dark:text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">Mathematical Aggregation</h4>
                  <p>Final aggregate marks are mathematically checked by the database engine, avoiding manual transcription typos.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. PEOPLE'S CHOICE AWARD */}
        <section className="py-16 bg-terracotta/5 dark:bg-gold/5 border-y border-terracotta/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <div className="inline-flex p-3 bg-terracotta/10 dark:bg-gold/10 text-terracotta dark:text-gold rounded-full">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal dark:text-cream">People&apos;s Choice Awards</h2>
            <p className="font-sans text-sm text-charcoal/85 dark:text-cream/85 max-w-xl mx-auto leading-relaxed">
              We track public likes, comments, and shares on your Facebook video to award the &ldquo;Rising Talent&rdquo; title. Encourage friends, family, and art enthusiasts to comment on your video!
            </p>
            <div className="text-xs font-bold uppercase tracking-wider text-terracotta dark:text-gold">
              🔥 Public engagement contributes 10% towards the total grade points.
            </div>
          </div>
        </section>

        {/* 9. PRIZE STRUCTURE — Plan 02: dynamic if prizePool published, else static */}
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6" id="prizes">
          <div className="text-center space-y-3 mb-16">
            <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">Prizes & Credentials</h2>
            <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
              {competition.prizePool ? competition.prizePool.description || "Pratibha Parishad honors talent with certified, authentic awards." : "Pratibha Parishad honors talent with certified, authentic awards."}
            </p>
            <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
          </div>

          {competition.prizePool ? (
            /* Dynamic prize pool from DB */
            <div className="space-y-3" aria-label="Prize catalogue">
              {competition.prizePool.items.map((item: { rank: string; title: string; description?: string | null; isPhysical: boolean; estimatedValue?: import("@prisma/client").Prisma.Decimal | number | string | null }, idx: number) => {
                const rankEmoji: Record<string, string> = {
                  FIRST_PLACE: "🥇", SECOND_PLACE: "🥈", THIRD_PLACE: "🥉",
                  MERIT_1: "⭐", MERIT_2: "⭐", MERIT_3: "⭐",
                  SPECIAL_MENTION: "🎖️", PEOPLES_CHOICE: "❤️", PARTICIPATION: "📄"
                };
                const isTopRank = ["FIRST_PLACE","SECOND_PLACE","THIRD_PLACE"].includes(item.rank);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      isTopRank
                        ? "border-gold/25 bg-gold/5"
                        : "border-terracotta/10 bg-cream-dark/10 dark:bg-charcoal-light/20"
                    }`}
                  >
                    <span className="text-2xl shrink-0 w-10 text-center">{rankEmoji[item.rank] ?? "🎁"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-charcoal dark:text-cream text-sm">{item.title}</p>
                      {item.description && (
                        <p className="font-sans text-xs text-charcoal/60 dark:text-cream/60 mt-0.5">{item.description}</p>
                      )}
                      {item.isPhysical && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-terracotta uppercase tracking-wider">
                          <Trophy className="w-3 h-3" /> Physical — shipped via courier
                        </span>
                      )}
                    </div>
                    {item.estimatedValue && (
                      <div className="shrink-0 text-right">
                        <span className="font-sans text-sm font-bold text-gold">₹{item.estimatedValue.toLocaleString()}</span>
                        <p className="text-xs text-charcoal/40 font-sans">est. value</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Static fallback prize info */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center font-sans text-xs">
              <div className="bg-cream dark:bg-charcoal border border-terracotta/10 p-6 rounded-2xl space-y-3">
                <div className="font-serif text-4xl text-terracotta dark:text-gold font-bold">01</div>
                <h4 className="font-bold text-sm text-charcoal dark:text-cream">Verifiable Digital Certificate</h4>
                <p className="text-charcoal/70 dark:text-cream/70 leading-relaxed">Every valid participant receives an authentic certificate with a unique verification QR code.</p>
              </div>
              <div className="bg-cream dark:bg-charcoal border border-terracotta/10 p-6 rounded-2xl space-y-3">
                <div className="font-serif text-4xl text-terracotta dark:text-gold font-bold">02</div>
                <h4 className="font-bold text-sm text-charcoal dark:text-cream">Merit Trophy & Physical Medals</h4>
                <p className="text-charcoal/70 dark:text-cream/70 leading-relaxed">Winners (1st, 2nd, and 3rd ranks) are awarded physical trophies delivered via registered couriers.</p>
              </div>
              <div className="bg-cream dark:bg-charcoal border border-terracotta/10 p-6 rounded-2xl space-y-3">
                <div className="font-serif text-4xl text-terracotta dark:text-gold font-bold">03</div>
                <h4 className="font-bold text-sm text-charcoal dark:text-cream">Board Hall of Fame Listing</h4>
                <p className="text-charcoal/70 dark:text-cream/70 leading-relaxed">High scoring participants are listed permanently on the Council&apos;s official online gallery.</p>
              </div>
            </div>
          )}
        </section>

        {/* 10. JUDGES PANEL */}
        <section className="py-20 bg-cream-dark/20 dark:bg-charcoal-light border-y border-terracotta/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">Meet Our Examiners</h2>
              <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
                Evaluations are reviewed by prominent teachers and classical artists with extensive training.
              </p>
              <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {judgesList.map((j, idx) => (
                <div key={idx} className="bg-cream dark:bg-charcoal border border-terracotta/10 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-terracotta/10 dark:bg-gold/10 text-terracotta dark:text-gold rounded-full flex items-center justify-center font-serif text-xl font-bold">
                      {j.name.split(" ").slice(-1)[0][0] || "J"}
                    </div>
                    <h4 className="font-serif text-lg font-bold text-charcoal dark:text-cream">{j.name}</h4>
                    <p className="font-sans text-sm font-bold text-terracotta dark:text-gold uppercase tracking-wider">{j.qualification}</p>
                    <p className="font-sans text-sm text-charcoal/75 dark:text-cream/75 leading-relaxed">{j.experience}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-terracotta/5 text-sm text-charcoal/50 dark:text-cream/50 font-semibold space-y-1">
                    <p>{j.awards}</p>
                    <p>{j.institution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONDITIONAL: POST-COMPLETION SECTIONS */}
        {isCompleted && (
          <>
            {/* RESULTS LEADERBOARD */}
            {competition.leaderboardEntries && (
              <ResultsLeaderboard
                entries={competition.leaderboardEntries}
                competitionTitle={competition.title}
              />
            )}

            {/* WINNER GALLERY */}
            {competition.winnerGalleryEntries && (
              <WinnerGallery
                winners={competition.winnerGalleryEntries}
                competitionTitle={competition.title}
              />
            )}

            {/* STATISTICS DASHBOARD */}
            {competition.statistics && (
              <StatisticsDashboard
                totalParticipants={competition.statistics.totalParticipants}
                totalEntries={competition.statistics.totalEntries}
                totalCategories={competition.statistics.totalCategories}
                countriesRepresented={competition.statistics.countriesRepresented}
                averageScore={competition.statistics.averageScore}
                highestScore={competition.statistics.highestScore}
                entriesByCategory={competition.statistics.entriesByCategory}
                ageGroupDistribution={competition.statistics.ageGroupDistribution}
              />
            )}

            {/* CERTIFICATES DOWNLOAD */}
            {competition.allRegistrations && (
              <CertificateDownload
                certificates={competition.allRegistrations
                  .filter(r => r.certificate)
                  .map(r => ({
                    studentName: r.student.name,
                    certificateType: (r.certificate?.type as "PARTICIPATION" | "MERIT_1" | "MERIT_2" | "MERIT_3" | "SPECIAL_MENTION") || "PARTICIPATION",
                    finalRank: r.finalRank !== null && r.finalRank !== undefined ? Number(r.finalRank) : undefined,
                    categoryName: r.competitionCategory.category.name,
                    certificateUrl: r.certificate?.certificateUrl || "",
                    qrCodeUrl: r.certificate?.qrCodeUrl || "",
                    competitionTitle: competition.title,
                    issueDate: r.certificate?.issuedAt ? new Date(r.certificate.issuedAt).toISOString() : new Date().toISOString()
                  }))}
                competitionTitle={competition.title}
              />
            )}

            {/* JUDGE FEEDBACK */}
            {competition.judgeFeedbackEntries && (
              <JudgeFeedback
                feedbackItems={competition.judgeFeedbackEntries}
                competitionTitle={competition.title}
              />
            )}

            {/* PARTICIPANT TESTIMONIALS */}
            {competition.testimonials && (
              <ParticipantTestimonials
                testimonials={competition.testimonials}
                competitionTitle={competition.title}
              />
            )}

            {/* SOCIAL SHARING */}
            <SocialSharing
              competitionTitle={competition.title}
              competitionUrl={typeof window !== "undefined" ? window.location.href : ""}
              winnerCount={competition.winnerGalleryEntries?.length || 0}
              certificatesAvailable={competition.allRegistrations?.some(r => r.certificate) || false}
            />
          </>
        )}

        {/* 11. PREVIOUS WINNERS SHOWCASE (FALLBACK FOR PRE-COMPLETION OR NO DATA) */}
        {!isCompleted && (
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">Previous Winner Showcase</h2>
              <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm max-w-xl mx-auto">
                Celebrating the outstanding performances of our past national winners.
              </p>
              <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {fallbackWinners.map((w, idx) => (
                <div key={idx} className="bg-cream-dark/20 dark:bg-charcoal-light border border-terracotta/5 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video relative bg-charcoal/10 flex items-center justify-center overflow-hidden">
                    <img src={w.image} alt={w.name} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-charcoal/30 flex items-center justify-center">
                      <span className="p-3 rounded-full bg-cream/90 text-terracotta shadow-md">
                        <Star className="w-5 h-5 fill-terracotta" />
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h4 className="font-serif text-base font-bold text-charcoal dark:text-cream">{w.name}</h4>
                    <p className="font-sans text-sm font-bold text-terracotta dark:text-gold uppercase tracking-wider">{w.rank}</p>
                    <p className="font-sans text-sm text-charcoal/50 dark:text-cream/50">{w.competition}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 12. FAQ SECTION */}
        <section className="py-20 bg-cream-dark/20 dark:bg-charcoal-light border-y border-terracotta/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center space-y-3 mb-16">
              <h2 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">Frequently Asked Questions</h2>
              <p className="font-sans text-charcoal/70 dark:text-cream/70 text-sm">
                Everything you need to know about submissions, scoring, and certificates.
              </p>
              <div className="w-12 h-0.5 bg-terracotta dark:bg-gold mx-auto" />
            </div>

            <div className="space-y-4">
              {[
                { q: "How do I submit the video?", a: "Post the video on our official Facebook Group. Copy the link to your post, then click 'Register Now' on this page, fill in details, paste the link, and complete payment." },
                { q: "Can I edit the video?", a: "No, edited or stitched videos are strictly disqualified. It must be a single, continuous, live-recorded take with clear audio." },
                { q: "When will the results be published?", a: "Results are released exactly on the results date (listed in the hero block above). They are published on this website and in the group." },
                { q: "How are certificates delivered?", a: "Once results are published, digital certificates with QR validation codes are immediately available to download from your dashboard profile. Physical medals and trophies are dispatched via courier." },
                { q: "Is courier delivery free?", a: "A standard delivery charge is applied upon ordering physical trophies to cover postage, depending on your delivery address." },
                { q: "Can international applicants participate?", a: "Yes, we accept students from all countries. International transactions are processed securely via standard payment portals." },
                { q: "Can my child submit multiple entries?", a: "Yes, you can register a child for multiple categories. A separate entry form and fee of ₹50 is required for each submission." }
              ].map((faq, idx) => (
                <details 
                  key={idx} 
                  className="group bg-cream dark:bg-charcoal border border-terracotta/10 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex justify-between items-center p-5 cursor-pointer select-none font-serif text-sm sm:text-base font-semibold text-charcoal dark:text-cream hover:bg-cream-dark/20 dark:hover:bg-charcoal-light transition-colors">
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-terracotta dark:text-gold shrink-0" />
                      {faq.q}
                    </span>
                    <span className="ml-1.5 shrink-0 transition duration-300 group-open:-rotate-180 text-charcoal/40 dark:text-cream/40">
                      <ChevronRight className="w-4 h-4 transform rotate-90" />
                    </span>
                  </summary>
                  <div className="p-5 border-t border-terracotta/5 font-sans text-sm text-charcoal/75 dark:text-cream/75 leading-relaxed bg-cream-dark/5 dark:bg-charcoal/30">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 13. FINAL CTA */}
        <section className="py-24 bg-gradient-to-t from-cream-dark/50 to-cream dark:from-charcoal-light dark:to-charcoal text-center space-y-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal dark:text-cream">&ldquo;Every child deserves a stage.&rdquo;</h2>
            <p className="font-sans text-base text-charcoal/80 dark:text-cream/80 max-w-lg mx-auto pt-2">
              Join thousands of young talents showcasing classical and traditional Indian arts to our global panel.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
              {isDeadlinePassed ? (
                <Button
                  disabled
                  variant="secondary"
                  size="md"
                >
                  Registration Closed
                </Button>
              ) : (
                <Link
                  href={`/register-entry?competitionId=${competition.id}`}
                  className="px-8 py-3.5 rounded-xl bg-terracotta hover:bg-terracotta-light text-cream font-sans text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 dark:bg-gold dark:text-charcoal dark:hover:bg-gold-light"
                >
                  Register Now
                </Link>
              )}
              <a
                href="https://facebook.com/groups/pratibhaparishad"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-xl border border-terracotta/20 hover:border-terracotta text-terracotta dark:border-gold/30 dark:hover:border-gold dark:text-gold font-sans text-sm font-bold transition-all duration-300"
              >
                Join Community
              </a>
            </div>
          </div>
        </section>
        
      </main>
      
      <Footer />
    </>
  );
}

import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import StudentPublicProfile from "@/components/account/StudentPublicProfile";

async function fetchPublicStudent(slugOrId: string) {
  // Try to find by slug first
  let student = await prisma.student.findUnique({
    where: { slug: slugOrId.toLowerCase() },
    include: {
      externalAchievements: {
        select: {
          title: true,
          eventName: true,
          category: true,
          year: true,
          rank: true,
          description: true,
          proofUrl: true,
        },
      },
      registrations: {
        where: {
          status: "VERIFIED",
          certificate: { isNot: null },
        },
        include: {
          certificate: {
            select: {
              type: true,
              certificateUrl: true,
              issuedAt: true,
            },
          },
          prizeAward: {
            select: {
              rank: true,
              dispatchedAt: true,
            },
          },
          competitionCategory: {
            include: {
              competition: {
                select: {
                  title: true,
                  startDate: true,
                  endDate: true,
                },
              },
              category: {
                select: {
                  name: true,
                  id: true,
                },
              },
            },
          },
          judgeAssignments: {
            include: {
              score: {
                select: {
                  criteria1: true,
                  criteria2: true,
                  criteria3: true,
                  criteria4: true,
                  totalScore: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Fallback to ID lookup if slug not found and looks like a UUID
  if (!student && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId)) {
    student = await prisma.student.findUnique({
      where: { id: slugOrId },
      include: {
        externalAchievements: {
          select: {
            title: true,
            eventName: true,
            category: true,
            year: true,
            rank: true,
            description: true,
            proofUrl: true,
          },
        },
        registrations: {
          where: {
            status: "VERIFIED",
            certificate: { isNot: null },
          },
          include: {
            certificate: {
              select: {
                type: true,
                certificateUrl: true,
                issuedAt: true,
              },
            },
            prizeAward: {
              select: {
                rank: true,
                dispatchedAt: true,
              },
            },
            competitionCategory: {
              include: {
                competition: {
                  select: {
                    title: true,
                    startDate: true,
                    endDate: true,
                  },
                },
                category: {
                  select: {
                    name: true,
                    id: true,
                  },
                },
              },
            },
            judgeAssignments: {
              include: {
                score: {
                  select: {
                    criteria1: true,
                    criteria2: true,
                    criteria3: true,
                    criteria4: true,
                    totalScore: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  if (!student || !student.isPublic) {
    return null;
  }

  // Compute age
  const birthDate = new Date(student.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Transform registrations to CompetitionResult format
  const competitionResults = student.registrations.map((reg) => {
    const scores = reg.judgeAssignments
      .filter((ja) => ja.score)
      .map((ja) => ja.score!.totalScore);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : null;

    const criteria1Scores = reg.judgeAssignments
      .filter((ja) => ja.score?.criteria1 !== null && ja.score?.criteria1 !== undefined)
      .map((ja) => ja.score!.criteria1);
    const criteria2Scores = reg.judgeAssignments
      .filter((ja) => ja.score?.criteria2 !== null && ja.score?.criteria2 !== undefined)
      .map((ja) => ja.score!.criteria2);
    const criteria3Scores = reg.judgeAssignments
      .filter((ja) => ja.score?.criteria3 !== null && ja.score?.criteria3 !== undefined)
      .map((ja) => ja.score!.criteria3);
    const criteria4Scores = reg.judgeAssignments
      .filter((ja) => ja.score !== null && ja.score !== undefined && ja.score.criteria4 !== null && ja.score.criteria4 !== undefined)
      .map((ja) => ja.score!.criteria4 as number);

    return {
      registrationId: reg.id,
      competitionTitle: reg.competitionCategory.competition.title,
      competitionStartDate: reg.competitionCategory.competition.startDate.toISOString(),
      competitionEndDate: reg.competitionCategory.competition.endDate.toISOString(),
      categoryName: reg.competitionCategory.category.name,
      categoryId: reg.competitionCategory.category.id,
      ageGroup: `${reg.competitionCategory.minAge}-${reg.competitionCategory.maxAge}`,
      finalRank: reg.finalRank,
      finalScore: reg.finalScore,
      prizeRank: (reg.prizeAward?.rank as any) || null,
      certificateType: reg.certificate!.type,
      certificateUrl: reg.certificate!.certificateUrl,
      certificateIssuedAt: reg.certificate!.issuedAt.toISOString(),
      prizeDispatchedAt: reg.prizeAward?.dispatchedAt?.toISOString() || null,
      judgeCount: reg.judgeAssignments.length,
      averageScore,
      rubricBreakdown: {
        technique: criteria1Scores.length > 0 ? criteria1Scores.reduce((a, b) => a + b, 0) / criteria1Scores.length : null,
        expression: criteria2Scores.length > 0 ? criteria2Scores.reduce((a, b) => a + b, 0) / criteria2Scores.length : null,
        rhythm: criteria3Scores.length > 0 ? criteria3Scores.reduce((a, b) => a + b, 0) / criteria3Scores.length : null,
        originality: criteria4Scores.length > 0 ? criteria4Scores.reduce((a, b) => a + b, 0) / criteria4Scores.length : null,
      },
    };
  });

  return {
    id: student.id,
    name: student.name,
    age,
    gender: student.gender,
    city: student.city,
    state: student.state,
    bio: student.bio,
    profileImageUrl: student.profileImageUrl,
    disciplineInterests: student.disciplineInterests,
    languages: student.languages,
    specialSkills: student.specialSkills,
    trainingInstitutes: student.trainingInstitutes,
    memberSince: student.createdAt.getFullYear().toString(),
    competitionResults,
    externalAchievements: student.externalAchievements,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const student = await fetchPublicStudent(id);

  if (!student) {
    return {
      title: "Profile Not Found",
    };
  }

  const disciplines = student.disciplineInterests.join(", ");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pratibha.org";
  // Use slug in metadata URL if available
  const profilePath = id.includes("-") && !id.includes("-0")  ? id : student.id;

  return {
    title: `${student.name} | Pratibha Parishad`,
    description:
      student.bio ||
      `${student.name} — ${disciplines} · ${student.city || "India"} | Pratibha Parishad student profile`,
    openGraph: {
      title: `${student.name} | Student Performer Profile`,
      description:
        student.bio ||
        `Explore ${student.name}'s performance portfolio and achievements on Pratibha Parishad.`,
      url: `${siteUrl}/student/${profilePath}`,
      type: "profile",
    },
  };
}

async function StudentPublicPageContent({ studentId }: { studentId: string }) {
  const student = await fetchPublicStudent(studentId);

  if (!student) {
    notFound();
  }

  // Check if viewer is the owner
  const session = await getServerSession(authOptions);
  const isOwner =
    session?.user &&
    (await prisma.student.findUnique({
      where: { id: student.id },
      select: {
        parent: {
          select: {
            user: {
              select: { id: true },
            },
          },
        },
      },
    }).then((s) => s?.parent.user.id === (session.user as any).id)) ||
    false;

  return (
    <>
      <Header />

      <main className="flex-1 bg-cream-dark/10 dark:bg-charcoal py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <StudentPublicProfile student={student} isOwner={isOwner} />
        </div>
      </main>

      <Footer />
    </>
  );
}

export default async function StudentPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<Loading variant="screen" text="Loading profile..." />}>
      <StudentPublicPageContent studentId={id} />
    </Suspense>
  );
}

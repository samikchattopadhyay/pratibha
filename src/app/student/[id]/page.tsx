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
            },
          },
          competitionCategory: {
            include: {
              competition: {
                select: {
                  title: true,
                },
              },
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
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
              },
            },
            competitionCategory: {
              include: {
                competition: {
                  select: {
                    title: true,
                  },
                },
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
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

  // Compute verified achievements
  const verifiedAchievements = student.registrations
    .filter((reg) => reg.certificate)
    .map((reg) => ({
      type: reg.certificate!.type,
      competitionTitle: reg.competitionCategory.competition.title,
      categoryName: reg.competitionCategory.category.name,
      rank: reg.prizeAward?.rank || null,
      certificateUrl: reg.certificate!.certificateUrl,
      issuedAt: reg.certificate!.issuedAt.toISOString(),
    }));

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
    stats: {
      totalCompetitions: student.registrations.length,
      totalAwards: student.registrations.filter((r) => r.certificate).length,
    },
    verifiedAchievements,
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

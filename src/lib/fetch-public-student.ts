import prisma from "@/lib/db";

export interface FetchedCompetitionResult {
  registrationId: string;
  competitionTitle: string;
  competitionStartDate: string;
  competitionEndDate: string;
  categoryName: string;
  categoryId: string;
  ageGroup: string;
  finalRank: number | null;
  finalScore: any;
  prizeRank: string | null;
  certificateType: string;
  certificateUrl: string | null;
  certificateIssuedAt: string;
  prizeDispatchedAt: string | null;
  judgeCount: number;
  judgeInfo: { name: string; tier: string }[];
  averageScore: number | null;
  rubricBreakdown: {
    technique: number | null;
    expression: number | null;
    rhythm: number | null;
    originality: number | null;
  };
  prizeItem: {
    title: string;
    description: string | null;
    type: string;
    imageUrl: string | null;
  } | null;
  isFeatured: boolean;
  isHidden: boolean;
}

export interface FetchedPublicStudent {
  id: string;
  slug: string | null;
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
  competitionResults: FetchedCompetitionResult[] | null;
  externalAchievements: {
    title: string;
    eventName: string;
    category: string | null;
    year: number;
    rank: string | null;
    description: string | null;
    proofUrl: string | null;
  }[];
}


export async function fetchPublicStudent(
  slugOrId: string
): Promise<FetchedPublicStudent | null> {
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
              prizeItem: {
                select: {
                  title: true,
                  description: true,
                  type: true,
                  imageUrl: true,
                },
              },
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
              judge: {
                select: {
                  name: true,
                  tier: true,
                },
              },
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
  if (
    !student &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      slugOrId
    )
  ) {
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
                prizeItem: {
                  select: {
                    title: true,
                    description: true,
                    type: true,
                    imageUrl: true,
                  },
                },
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
                judge: {
                  select: {
                    name: true,
                    tier: true,
                  },
                },
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
    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : null;

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
      .filter(
        (ja) =>
          ja.score !== null &&
          ja.score !== undefined &&
          ja.score.criteria4 !== null &&
          ja.score.criteria4 !== undefined
      )
      .map((ja) => ja.score!.criteria4 as number);

    return {
      registrationId: reg.id,
      competitionTitle: reg.competitionCategory.competition.title,
      competitionStartDate:
        reg.competitionCategory.competition.startDate.toISOString(),
      competitionEndDate:
        reg.competitionCategory.competition.endDate.toISOString(),
      categoryName: reg.competitionCategory.category.name,
      categoryId: reg.competitionCategory.category.id,
      ageGroup: `${reg.competitionCategory.minAge}-${reg.competitionCategory.maxAge}`,
      finalRank: reg.finalRank,
      finalScore: reg.finalScore !== null ? Number(reg.finalScore) : null,
      prizeRank: (reg.prizeAward?.rank as any) || null,
      certificateType: reg.certificate!.type,
      certificateUrl: reg.certificate!.certificateUrl,
      certificateIssuedAt: reg.certificate!.issuedAt.toISOString(),
      prizeDispatchedAt: reg.prizeAward?.dispatchedAt?.toISOString() || null,
      judgeCount: reg.judgeAssignments.length,
      judgeInfo: reg.judgeAssignments.map((ja) => ({
        name: ja.judge.name,
        tier: ja.judge.tier,
      })),
      averageScore,
      rubricBreakdown: {
        technique:
          criteria1Scores.length > 0
            ? criteria1Scores.reduce((a, b) => a + b, 0) / criteria1Scores.length
            : null,
        expression:
          criteria2Scores.length > 0
            ? criteria2Scores.reduce((a, b) => a + b, 0) / criteria2Scores.length
            : null,
        rhythm:
          criteria3Scores.length > 0
            ? criteria3Scores.reduce((a, b) => a + b, 0) / criteria3Scores.length
            : null,
        originality:
          criteria4Scores.length > 0
            ? criteria4Scores.reduce((a, b) => a + b, 0) / criteria4Scores.length
            : null,
      },
      prizeItem: reg.prizeAward?.prizeItem || null,
      isFeatured: false,
      isHidden: false,
    };
  });

  return {
    id: student.id,
    slug: student.slug,
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
    competitionResults: competitionResults || [],
    externalAchievements: student.externalAchievements || [],
  };
}

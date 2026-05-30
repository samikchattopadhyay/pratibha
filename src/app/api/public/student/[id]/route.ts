/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getPublicStudentProfile } from "@/lib/db/queries";

// ─── SECTION 1: VALIDATION & TYPES ────────────────────────────────────────

interface PublicStudentProfile {
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
  stats: {
    totalCompetitions: number;
    totalAwards: number;
  };
  verifiedAchievements: {
    type: string;
    competitionTitle: string;
    categoryName: string;
    rank: string | null;
    certificateUrl: string | null;
    issuedAt: string;
  }[];
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

// ─── SECTION 2: REQUEST HANDLERS ──────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Get student ID
    const { id: studentId } = await params;

    // 2. Business logic — fetch student with public check
    const student = await getPublicStudentProfile(studentId);

    // 3. Privacy check
    if (!student || !student.isPublic) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // 4. Compute age
    const birthDate = new Date(student.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // 5. Compute stats
    const verifiedAchievements = student.registrations
      .filter((reg: any) => reg.certificate)
      .map((reg: any) => ({
        type: reg.certificate!.type,
        competitionTitle: reg.competitionCategory.competition.title,
        categoryName: reg.competitionCategory.category.name,
        rank: reg.prizeAward?.rank || null,
        certificateUrl: reg.certificate!.certificateUrl,
        issuedAt: reg.certificate!.issuedAt.toISOString(),
      }));

    const response: PublicStudentProfile = {
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
        totalAwards: student.registrations.filter((r: any) => r.certificate).length,
      },
      verifiedAchievements,
      externalAchievements: student.externalAchievements,
    };

    // 6. Response
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Public student fetch error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

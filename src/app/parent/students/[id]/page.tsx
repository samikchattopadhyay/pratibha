import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import StudentManageLayout from "@/components/parent/StudentManageLayout";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface StudentProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  schoolClass: string | null;
  schoolName: string | null;
  city: string | null;
  state: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  heightCm: number | null;
  hairColor: string | null;
  eyeColor: string | null;
  disciplineInterests: string[];
  languages: string[];
  categoryGrouping: string[];
  trainingInstitutes: string[];
  specialSkills: string[];
  isPublic: boolean;
  externalAchievements: {
    id: string;
    title: string;
    eventName: string;
    category: string | null;
    year: number;
    rank: string | null;
    description: string | null;
    proofUrl: string | null;
  }[];
}

async function fetchStudentAndCategories(studentId: string, parentId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const student = await (prisma.student as any).findUnique({
    where: { id: studentId },
    include: {
      externalAchievements: true,
    },
  });

  if (!student || student.parentId !== parentId) {
    return { student: null, categories: [] };
  }

  // Convert student to match StudentProfile type
  const studentData: StudentProfile = {
    id: student.id,
    name: student.name,
    dateOfBirth: student.dateOfBirth.toISOString(),
    gender: student.gender,
    schoolClass: student.schoolClass || null,
    schoolName: student.schoolName || null,
    city: student.city || null,
    state: student.state || null,
    profileImageUrl: student.profileImageUrl || null,
    bio: student.bio || null,
    heightCm: student.heightCm || null,
    hairColor: student.hairColor || null,
    eyeColor: student.eyeColor || null,
    disciplineInterests: student.disciplineInterests || [],
    languages: student.languages || [],
    categoryGrouping: student.categoryGrouping || [],
    trainingInstitutes: student.trainingInstitutes || [],
    specialSkills: student.specialSkills || [],
    isPublic: student.isPublic || false,
    externalAchievements: student.externalAchievements || [],
  };

  const rawCategories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, grouping: true },
  });

  const categories = rawCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug || null,
    grouping: cat.grouping || undefined,
  }));

  return { student: studentData, categories };
}

async function ManageStudentPageContent({ studentId }: { studentId: string }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const parent = await prisma.parent.findUnique({
    where: { userId },
  });

  if (!parent) {
    redirect("/login");
  }

  const { student, categories } = await fetchStudentAndCategories(studentId, parent.id);

  if (!student) {
    redirect("/parent/dashboard");
  }

  return (
    <>
      <Header />

      <main className="flex-1 bg-cream-dark/10 dark:bg-charcoal py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Back Link */}
          <Link
            href="/parent/dashboard?tab=students"
            className="inline-flex items-center gap-1 text-terracotta dark:text-gold hover:underline font-bold text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Page Title */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">
              Manage {student.name}'s Profile
            </h1>
            <p className="font-sans text-charcoal/60 dark:text-cream/60">
              Edit profile details, manage external achievements, and control public visibility.
            </p>
          </div>

          {/* Layout Component */}
          <StudentManageLayout
            student={student}
            categories={categories}
            onRefresh={() => {
              // Client-side refresh handled via modal callbacks
            }}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}

export default async function ManageStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<Loading variant="screen" text="Loading student profile..." />}>
      <ManageStudentPageContent studentId={id} />
    </Suspense>
  );
}

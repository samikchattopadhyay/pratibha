import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import StudentManageLayout from "@/components/account/StudentManageLayout";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface StudentProfile {
  id: string;
  name: string;
  slug?: string;
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

  const studentData: StudentProfile = {
    id: student.id,
    name: student.name,
    slug: student.slug || undefined,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawCategories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, grouping: true },
  });

  const categories = rawCategories.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug || null,
    grouping: cat.grouping || undefined,
  }));

  return { student: studentData, categories };
}

async function ManageStudentPageContent({ studentId }: { studentId: string }) {
  const session = await getEdgeSession();

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
    redirect("/account/dashboard");
  }

  return (
    <>
      <Header />

      <main className="flex-1 bg-cream-dark/10 dark:bg-charcoal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar */}
            <div className="lg:col-span-4 bg-cream dark:bg-charcoal-light border border-terracotta/10 dark:border-terracotta/20 rounded-2xl p-6 shadow-md sticky top-20 space-y-4">
              {/* Student Profile Card */}
              <div className="flex flex-col items-center gap-3 pb-4 border-b border-terracotta/5 dark:border-terracotta/10">
                {student.profileImageUrl ? (
                  <img
                    src={student.profileImageUrl}
                    alt={student.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-terracotta/20 dark:border-gold/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-terracotta to-gold text-cream flex items-center justify-center font-bold text-lg">
                    {student.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
                <div className="text-center">
                  <h2 className="font-serif text-xl font-bold text-charcoal dark:text-cream">
                    {student.name}
                  </h2>
                  <p className="font-sans text-sm text-charcoal/60 dark:text-cream/60">
                    {student.gender} • {student.schoolClass && `Class ${student.schoolClass}`}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                <Link
                  href="/account/dashboard?tab=students"
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-charcoal/80 dark:text-cream/80 hover:bg-terracotta/5 dark:hover:bg-gold/5 transition-colors font-sans text-base font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </nav>

              {/* Quick Info */}
              {student.city || student.state ? (
                <div className="bg-terracotta/5 dark:bg-gold/5 rounded-lg p-3 border border-terracotta/10 dark:border-gold/10">
                  <p className="font-sans text-xs font-semibold text-charcoal dark:text-cream uppercase tracking-wider mb-1">
                    Location
                  </p>
                  <p className="font-sans text-sm text-charcoal dark:text-cream">
                    {[student.city, student.state].filter(Boolean).join(", ")}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-8 space-y-6">
              {/* Page Header */}
              <div className="space-y-2">
                <h1 className="font-serif text-3xl font-bold text-charcoal dark:text-cream">
                  Manage {student.name}&apos;s Profile
                </h1>
                <p className="font-sans text-charcoal/60 dark:text-cream/60">
                  Edit profile details, manage external achievements, and control public visibility.
                </p>
              </div>

              {/* Layout Component */}
              <StudentManageLayout student={student} categories={categories} />
            </div>
          </div>
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

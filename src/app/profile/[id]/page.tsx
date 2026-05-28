import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import { fetchPublicStudent } from "@/lib/fetch-public-student";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import StudentPublicProfile from "@/components/account/StudentPublicProfile";

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
  const session = await getEdgeSession();
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

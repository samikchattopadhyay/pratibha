import { Suspense } from "react";
import { redirect } from "next/navigation";
import Loading from "@/components/Loading";
import StudentDetailsLayout from "@/components/admin/StudentDetailsLayout";
import type { StudentMetadata } from "@/types/student-details";

async function fetchStudentMetadata(studentId: string): Promise<StudentMetadata | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const res = await fetch(
      `${baseUrl}/api/admin/students/${studentId}`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error(`[StudentDetails] API error: ${res.status}`);
      return null;
    }

    const data: StudentMetadata = await res.json();
    return data;
  } catch (err) {
    console.error("[StudentDetails] Fetch failed:", err);
    return null;
  }
}

export default async function StudentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = await params;

  const student = await fetchStudentMetadata(studentId);

  if (!student) {
    redirect("/admin/dashboard?tab=participants");
  }

  return (
    <Suspense fallback={<Loading variant="screen" text="Loading student details..." />}>
      <StudentDetailsLayout
        student={student}
        studentId={studentId}
      />
    </Suspense>
  );
}

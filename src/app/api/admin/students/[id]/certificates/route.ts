import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { getStudentWithCertificatesAndAwards } from "@/lib/db/queries";
import type { StudentCertificate } from "@/types/student-details";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const { id } = await params;

    const student = await getStudentWithCertificatesAndAwards(id);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const certificates: StudentCertificate[] = [];

    for (const registration of student.registrations) {
      if (registration.certificate || registration.prizeAward) {
        const certificate = registration.certificate;
        const award = registration.prizeAward;

        certificates.push({
          id: certificate?.id || award?.id || "",
          type: certificate?.type || "PARTICIPATION",
          status: certificate?.status || "PENDING",
          competitionTitle: registration.competitionCategory.competition.title,
          categoryName: registration.competitionCategory.category.name,
          rank: award?.prizeItem?.rank || undefined,
          certificateUrl: certificate?.certificateUrl || undefined,
          qrCodeUrl: certificate?.qrCodeUrl || undefined,
          issuedDate: certificate?.issuedAt ? new Date(certificate.issuedAt).toISOString() : new Date().toISOString(),
          registrationId: registration.id,
        });
      }
    }

    // Sort by issued date, newest first
    certificates.sort(
      (a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
    );

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Student certificates fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

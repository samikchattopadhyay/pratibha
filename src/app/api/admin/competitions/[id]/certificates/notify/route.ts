import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { createAndDispatchNotification } from "@/lib/notificationService";
import {
  getGeneratedCertificatesByCompetition,
  updateCertificateStatus,
} from "@/lib/db/queries";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getEdgeSession(_);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customUser = session.user as { role?: string };
    if (customUser.role !== "SUPER_ADMIN" && customUser.role !== "MODERATOR") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id: competitionId } = await params;

    const certificates = await getGeneratedCertificatesByCompetition(competitionId);

    let notifiedCount = 0;

    for (const cert of certificates) {
      try {
        const userId = cert.registration.student.parent?.userId;
        if (userId) {
          await createAndDispatchNotification({
            userId,
            type: "CERTIFICATE_READY",
            registrationId: cert.registration.id,
            title: "Certificate Ready",
            body: `Your certificate for ${cert.registration.student.name} is ready!`,
          });

          await updateCertificateStatus(cert.id, "SHARED");

          notifiedCount++;
        }
      } catch (err) {
        console.error(
          `Failed to notify and mark certificate ${cert.id} as shared:`,
          err
        );
      }
    }

    return NextResponse.json({
      message: `Sent notifications and marked ${notifiedCount} certificates as shared`,
      notifiedCount,
      totalEligible: certificates.length,
    });
  } catch (err) {
    console.error("Failed to send notifications:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

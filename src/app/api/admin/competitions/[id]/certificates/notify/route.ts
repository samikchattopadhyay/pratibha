import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { createAndDispatchNotification } from "@/lib/notificationService";
import prisma from "@/lib/db";

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

    // Find GENERATED (non-SHARED) certificates for this competition
    const certificates = await prisma.certificate.findMany({
      where: {
        registration: {
          competitionCategory: { competitionId },
        },
        status: "GENERATED",
      },
      include: {
        registration: {
          include: {
            student: {
              include: {
                parent: true,
              },
            },
          },
        },
      },
    });

    let notifiedCount = 0;

    // Dispatch notifications and mark as SHARED
    for (const cert of certificates) {
      try {
        const userId = (cert.registration.student.parent as any).userId;
        if (userId) {
          await createAndDispatchNotification({
            userId,
            type: "CERTIFICATE_READY",
            registrationId: cert.registration.id,
            title: "Certificate Ready",
            body: `Your certificate for ${cert.registration.student.name} is ready!`,
          });

          await prisma.certificate.update({
            where: { id: cert.id },
            data: { status: "SHARED" },
          });

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

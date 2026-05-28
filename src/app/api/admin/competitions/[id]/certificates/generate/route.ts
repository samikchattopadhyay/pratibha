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

    // Find eligible registrations (VERIFIED status, missing certificates or with empty certificateUrl)
    const eligibleRegistrations = await prisma.registration.findMany({
      where: {
        competitionCategory: { competitionId },
        status: "VERIFIED",
      },
      include: {
        student: {
          include: {
            parent: true,
          },
        },
        certificate: true,
      },
    });

    let generatedCount = 0;
    let failedCount = 0;
    const certificateIds: string[] = [];

    // Generate certificates for eligible entries
    for (const registration of eligibleRegistrations) {
      try {
        // Only generate if certificate doesn't exist or has no URL
        if (!registration.certificate || !registration.certificate.certificateUrl) {
          const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
          const qrCodeUrl = `https://pratibha.local/verify/${certificateId}`;
          const certificateUrl = `https://cdn.example.com/certificates/${certificateId}.pdf`;

          // Determine certificate type based on final rank
          let certType = "PARTICIPATION";
          if (registration.finalRank === 1) {
            certType = "MERIT_1";
          } else if (registration.finalRank === 2) {
            certType = "MERIT_2";
          } else if (registration.finalRank === 3) {
            certType = "MERIT_3";
          } else if (registration.finalRank && registration.finalRank > 3) {
            certType = "SPECIAL_MENTION";
          }

          if (registration.certificate) {
            await prisma.certificate.update({
              where: { id: registration.certificate.id },
              data: {
                certificateUrl,
                qrCodeUrl,
                type: certType as any,
                status: "GENERATED",
              },
            });
          } else {
            await prisma.certificate.create({
              data: {
                registrationId: registration.id,
                certificateId,
                certificateUrl,
                qrCodeUrl,
                type: certType as any,
                status: "GENERATED",
              },
            });
          }

          certificateIds.push(registration.id);
          generatedCount++;
        }
      } catch (err) {
        console.error(`Failed to generate cert for registration ${registration.id}:`, err);
        failedCount++;
      }
    }

    // Fire notifications for generated certificates (fire-and-forget)
    for (const registrationId of certificateIds) {
      const reg = eligibleRegistrations.find((r) => r.id === registrationId);
      if (reg?.student?.parent?.userId) {
        createAndDispatchNotification({
          userId: reg.student.parent.userId,
          type: "CERTIFICATE_READY",
          registrationId,
          title: "Certificate Ready",
          body: `Your certificate for ${reg.student.name} is ready!`,
        }).catch((err) => console.error(`Failed to send notification for registration ${registrationId}:`, err));
      }
    }

    return NextResponse.json({
      message: `Generated ${generatedCount} certificates successfully`,
      generatedCount,
      totalEligible: eligibleRegistrations.length,
      failedCount,
    });
  } catch (err) {
    console.error("Failed to generate certificates:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

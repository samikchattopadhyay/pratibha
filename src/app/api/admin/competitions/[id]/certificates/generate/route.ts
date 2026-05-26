import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
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
      select: {
        id: true,
        registrationId: true,
        student: { select: { name: true } },
        certificate: true,
      },
    });

    let generatedCount = 0;
    let failedCount = 0;

    // Generate certificates for eligible entries
    for (const registration of eligibleRegistrations) {
      try {
        // Only generate if certificate doesn't exist or has no URL
        if (!registration.certificate || !registration.certificate.certificateUrl) {
          const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
          const qrCodeUrl = `https://pratibha.local/verify/${certificateId}`;
          const certificateUrl = `https://cdn.example.com/certificates/${certificateId}.pdf`;

          if (registration.certificate) {
            await prisma.certificate.update({
              where: { id: registration.certificate.id },
              data: {
                certificateUrl,
                qrCodeUrl,
              },
            });
          } else {
            await prisma.certificate.create({
              data: {
                registrationId: registration.id,
                certificateId,
                certificateUrl,
                qrCodeUrl,
                type: "PARTICIPATION",
              },
            });
          }

          generatedCount++;
        }
      } catch (err) {
        console.error(`Failed to generate cert for registration ${registration.id}:`, err);
        failedCount++;
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

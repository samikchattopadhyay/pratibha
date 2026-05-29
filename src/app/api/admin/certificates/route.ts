import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import { createAndDispatchNotification } from "@/lib/notificationService";

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const totalGenerated = await prisma.certificate.count();
    const pendingGeneration = await prisma.registration.count({
      where: {
        status: "VERIFIED",
        scoringFinalized: true,
        certificate: null,
      },
    });

    return NextResponse.json({
      generated: totalGenerated,
      pending: pendingGeneration,
      qrSuccessRate: 98, // mock metric matching design spec
      sharedOnSocials: Math.round(totalGenerated * 0.16), // mock calculation matching timeline/spec
    });
  } catch (error) {
    console.error("Admin certificates fetch error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getEdgeSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    // Find all finalized entries without certificates
    const eligibleRegistrations = await prisma.registration.findMany({
      where: {
        status: "VERIFIED",
        scoringFinalized: true,
        certificate: null,
      },
    });

    if (eligibleRegistrations.length === 0) {
      return NextResponse.json({ message: "No pending eligible certificates to generate.", count: 0 });
    }

    const certificatesCreated = [];

    // Process bulk generation
    for (const reg of eligibleRegistrations) {
      const serialPart1 = Math.floor(1000 + Math.random() * 9000);
      const serialPart2 = Math.floor(1000 + Math.random() * 9000);
      const certificateId = `CERT-PP-${serialPart1}-${serialPart2}`;

      const cert = await prisma.certificate.create({
        data: {
          registrationId: reg.id,
          certificateId,
          certificateUrl: `/certificates/${reg.registrationId}.pdf`,
          qrCodeUrl: `https://verify.pratibhaparishad.com/certificate/${certificateId}`,
          type: "PARTICIPATION", // Default type
        },
      });
      certificatesCreated.push(cert);

      // Send notification to parent (fire-and-forget)
      const registration = await prisma.registration.findUnique({
        where: { id: reg.id },
        include: {
          student: true,
          competitionCategory: {
            include: { category: true },
          },
        },
      });

      if (registration) {
        const student = registration.student;
        const parent = await prisma.parent.findFirst({
          where: { id: student.parentId },
        });

        if (parent) {
          const user = await prisma.user.findUnique({
            where: { id: parent.userId },
          });

          if (user?.email) {
            createAndDispatchNotification({
              userId: parent.userId,
              type: "CERTIFICATE_READY",
              title: "Certificate Ready",
              body: `${student.name}'s certificate for ${registration.competitionCategory.category.name} has been generated and is ready to download.`,
              actionUrl: "/account/dashboard",
              certificateId: cert.id,
              registrationId: registration.id,
              recipientEmail: user.email,
            }).catch((err) =>
              console.error("Failed to send certificate ready notification:", err)
            );
          }
        }
      }
    }

    return NextResponse.json({
      message: `Successfully generated ${certificatesCreated.length} certificates.`,
      count: certificatesCreated.length,
    });
  } catch (error) {
    console.error("Admin certificates generate error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

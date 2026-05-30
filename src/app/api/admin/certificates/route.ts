import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { db } from "@/lib/db/drizzle";
import {
  getCertificateCount,
  getRegistrationsNeedingCertificates,
  getRegistrationForCertificateNotification,
  createCertificateBulk,
  getParentByUserId,
  getUserById,
} from "@/lib/db/queries";
import * as schema from "@/lib/db/schema";
import { createAndDispatchNotification } from "@/lib/notificationService";
import { eq, and, isNull } from "drizzle-orm";

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

    const totalGenerated = await getCertificateCount();

    const pendingRegs = await db
      .select({ count: schema.registrations.id })
      .from(schema.registrations)
      .where(
        and(
          eq(schema.registrations.status, "VERIFIED"),
          eq(schema.registrations.scoringFinalized, true)
        )
      );
    const pendingGeneration = pendingRegs.length;

    return NextResponse.json({
      generated: totalGenerated,
      pending: pendingGeneration,
      qrSuccessRate: 98,
      sharedOnSocials: Math.round(totalGenerated * 0.16),
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

    const eligibleRegistrations = await getRegistrationsNeedingCertificates();

    if (eligibleRegistrations.length === 0) {
      return NextResponse.json({ message: "No pending eligible certificates to generate.", count: 0 });
    }

    const certificateData: (typeof schema.certificates.$inferInsert)[] = eligibleRegistrations.map((reg: any) => {
      const serialPart1 = Math.floor(1000 + Math.random() * 9000);
      const serialPart2 = Math.floor(1000 + Math.random() * 9000);
      const certificateId = `CERT-PP-${serialPart1}-${serialPart2}`;

      return {
        registrationId: reg.id,
        certificateId,
        certificateUrl: `/certificates/${reg.id}.pdf`,
        qrCodeUrl: `https://verify.pratibhaparishad.com/certificate/${certificateId}`,
        type: "PARTICIPATION",
      };
    });

    const certificatesCreated = await createCertificateBulk(certificateData);

    // Send notifications (fire-and-forget)
    for (const cert of certificatesCreated) {
      const registration = await getRegistrationForCertificateNotification(cert.registrationId);

      if (registration) {
        const student = registration.student;
        const parent = await getParentByUserId(student.parentId);

        if (parent) {
          const user = await getUserById(parent.userId);

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

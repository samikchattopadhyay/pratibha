import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAndDispatchNotification } from "@/lib/notificationService";
import prisma from "@/lib/db";
import { CertificateType, CertificateStatus, PrizeRank } from "@prisma/client";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"] as const;

function rankToCertType(rank: number | null): CertificateType {
  if (rank === 1) return CertificateType.MERIT_1;
  if (rank === 2) return CertificateType.MERIT_2;
  if (rank === 3) return CertificateType.MERIT_3;
  if (rank !== null && rank > 3) return CertificateType.SPECIAL_MENTION;
  return CertificateType.PARTICIPATION;
}

function rankToPrizeRank(rank: number): PrizeRank {
  if (rank === 1) return "FIRST_PLACE";
  if (rank === 2) return "SECOND_PLACE";
  if (rank === 3) return "THIRD_PLACE";
  if (rank === 4) return "MERIT_1";
  if (rank === 5) return "MERIT_2";
  if (rank <= 10) return "MERIT_3";
  return "PARTICIPATION";
}

function generateCertId(): string {
  const rand = Math.random().toString(36).substring(2, 11).toUpperCase();
  return `CERT-PP-${Date.now()}-${rand}`;
}

type TxResult =
  | { kind: "award"; registrationId: string; dbCertId: string }
  | { kind: "create"; registrationId: string; dbCertId: string }
  | { kind: "update"; registrationId: string; dbCertId: string };

type ParentInfo = { userId: string; email: string };

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role ?? "";
    if (!ADMIN_ROLES.includes(role as typeof ADMIN_ROLES[number])) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id: competitionId } = await params;

    // 2. Load competition with all necessary relations
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        prizePool: { include: { items: true } },
        categories: {
          include: {
            registrations: {
              where: {
                status: "VERIFIED",
                scoringFinalized: true,
              },
              include: {
                certificate: true,
                prizeAward: true,
                student: {
                  include: { parent: true },
                },
              },
            },
          },
        },
      },
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    // 3. Determine prize pool availability
    const hasPrizePool = !!(competition.prizePool?.isPublished);
    const prizeItems = competition.prizePool?.items ?? [];

    // 4. Flatten all eligible registrations
    const allRegistrations = competition.categories.flatMap((c) => c.registrations);

    const toProcess = allRegistrations.filter((reg) => {
      const cert = reg.certificate;
      if (!cert) return true;
      if (cert.status === "REVOKED") return false;
      if (!cert.certificateUrl) return true;
      return false;
    });

    if (toProcess.length === 0) {
      return NextResponse.json({
        prizesAwarded: 0,
        certificatesCreated: 0,
        certificatesUpdated: 0,
        notificationsSent: 0,
        skipped: allRegistrations.length,
        message: "All eligible registrations already have certificates.",
      });
    }

    // 5. Bulk-fetch parent user emails
    const uniqueParentIds = [
      ...new Set(toProcess.map((r) => r.student.parentId)),
    ];
    const parents = await prisma.parent.findMany({
      where: { id: { in: uniqueParentIds } },
      select: { id: true, userId: true },
    });
    const parentUserIds = parents.map((p) => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: parentUserIds } },
      select: { id: true, email: true },
    });

    const parentLookup = new Map<string, ParentInfo>();
    for (const p of parents) {
      const u = users.find((u) => u.id === p.userId);
      if (u?.email) {
        parentLookup.set(p.id, { userId: p.userId, email: u.email });
      }
    }

    // 6. Prepare per-registration cert data
    type CertPlan = {
      registration: (typeof toProcess)[number];
      certId: string;
      certType: CertificateType;
      certUrl: string;
      qrUrl: string;
      isUpdate: boolean;
      needsPrizeAward: boolean;
      prizeItemId: string | null;
      prizeRank: PrizeRank | null;
    };

    const plans: CertPlan[] = toProcess.map((reg) => {
      const certId = generateCertId();
      const certType = rankToCertType(reg.finalRank);
      const certUrl = `/certificates/${reg.registrationId}.pdf`;
      const qrUrl = `https://verify.pratibhaparishad.com/certificate/${certId}`;
      const isUpdate = !!(reg.certificate && !reg.certificate.certificateUrl);

      let prizeItemId: string | null = null;
      let prizeRank: PrizeRank | null = null;

      if (hasPrizePool && reg.finalRank !== null && !reg.prizeAward) {
        prizeRank = rankToPrizeRank(reg.finalRank);
        const item =
          prizeItems.find((i) => i.rank === prizeRank) ??
          prizeItems.find((i) => i.rank === "PARTICIPATION") ??
          null;
        if (item) prizeItemId = item.id;
      }

      const needsPrizeAward =
        hasPrizePool &&
        reg.finalRank !== null &&
        !reg.prizeAward &&
        prizeItemId !== null;

      return {
        registration: reg,
        certId,
        certType,
        certUrl,
        qrUrl,
        isUpdate,
        needsPrizeAward,
        prizeItemId,
        prizeRank,
      };
    });

    // 7. Execute all writes in an interactive transaction
    const results: TxResult[] = await prisma.$transaction(async (tx) => {
      const out: TxResult[] = [];

      for (const plan of plans) {
        if (
          plan.needsPrizeAward &&
          plan.prizeItemId &&
          plan.prizeRank
        ) {
          // Case A: award + cert created together
          const award = await tx.prizeAward.create({
            data: {
              registrationId: plan.registration.id,
              prizeItemId: plan.prizeItemId,
              rank: plan.prizeRank,
              certificate: {
                create: {
                  registrationId: plan.registration.id,
                  certificateId: plan.certId,
                  certificateUrl: plan.certUrl,
                  qrCodeUrl: plan.qrUrl,
                  type: plan.certType,
                  status: CertificateStatus.GENERATED,
                },
              },
            },
            include: { certificate: true },
          });
          out.push({
            kind: "award",
            registrationId: plan.registration.id,
            dbCertId: award.certificate?.id ?? "",
          });
        } else if (plan.isUpdate && plan.registration.certificate) {
          // Case B: repair existing stub
          const cert = await tx.certificate.update({
            where: { id: plan.registration.certificate.id },
            data: {
              certificateId: plan.certId,
              certificateUrl: plan.certUrl,
              qrCodeUrl: plan.qrUrl,
              type: plan.certType,
              status: CertificateStatus.GENERATED,
            },
            select: { id: true },
          });
          out.push({
            kind: "update",
            registrationId: plan.registration.id,
            dbCertId: cert.id,
          });
        } else {
          // Case C: plain create
          const cert = await tx.certificate.create({
            data: {
              registrationId: plan.registration.id,
              certificateId: plan.certId,
              certificateUrl: plan.certUrl,
              qrCodeUrl: plan.qrUrl,
              type: plan.certType,
              status: CertificateStatus.GENERATED,
            },
            select: { id: true },
          });
          out.push({
            kind: "create",
            registrationId: plan.registration.id,
            dbCertId: cert.id,
          });
        }
      }

      return out;
    });

    // 8. Count results
    const prizesAwarded = results.filter((r) => r.kind === "award").length;
    const certificatesCreated = results.filter(
      (r) => r.kind === "create" || r.kind === "award"
    ).length;
    const certificatesUpdated = results.filter((r) => r.kind === "update")
      .length;
    const skipped = allRegistrations.length - toProcess.length;

    // 9. Fire-and-forget notifications
    let notificationsSent = 0;

    for (const result of results) {
      const plan = plans.find((p) => p.registration.id === result.registrationId);
      if (!plan) continue;

      const parentInfo = parentLookup.get(plan.registration.student.parentId);
      if (!parentInfo) continue;

      notificationsSent++;

      createAndDispatchNotification({
        userId: parentInfo.userId,
        type: "CERTIFICATE_READY",
        title: "Certificate Ready",
        body: `${plan.registration.student.name}'s certificate is ready to download.`,
        actionUrl: "/parent/dashboard",
        registrationId: plan.registration.id,
        certificateId: result.dbCertId,
        recipientEmail: parentInfo.email,
      }).catch((err) =>
        console.error(
          `Notification failed for registration ${plan.registration.id}:`,
          err
        )
      );
    }

    // 10. Return unified report
    return NextResponse.json({
      prizesAwarded,
      certificatesCreated,
      certificatesUpdated,
      notificationsSent,
      skipped,
      message: `Finalized: ${certificatesCreated} created, ${certificatesUpdated} repaired, ${prizesAwarded} prizes awarded.`,
    });
  } catch (err) {
    console.error("finalize-and-generate error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { createAndDispatchNotification } from "@/lib/notificationService";
import {
  getCompetitionWithFinalizedRegistrations,
  getParentsByIds,
  getUsersByIds,
  createCertificate,
  updateCertificateUrl,
  createPrizeAwardWithNewCertificate,
} from "@/lib/db/queries";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"] as const;

function rankToCertType(rank: number | null): string {
  if (rank === 1) return "MERIT_1";
  if (rank === 2) return "MERIT_2";
  if (rank === 3) return "MERIT_3";
  if (rank !== null && rank > 3) return "SPECIAL_MENTION";
  return "PARTICIPATION";
}

function rankToPrizeRank(rank: number): string {
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

type CertPlan = {
  registration: any;
  certId: string;
  certType: string;
  certUrl: string;
  qrUrl: string;
  isUpdate: boolean;
  needsPrizeAward: boolean;
  prizeItemId: string | null;
  prizeRank: string | null;
};

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth
    const session = await getEdgeSession(_req);
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

    const competition = await getCompetitionWithFinalizedRegistrations(competitionId);

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

    const uniqueParentIds = [
      ...new Set(toProcess.map((r) => r.student.parentId)),
    ];
    const parents = await getParentsByIds(uniqueParentIds);
    const parentUserIds = parents.map((p) => p.userId);
    const users = await getUsersByIds(parentUserIds);

    const parentLookup = new Map<string, ParentInfo>();
    for (const p of parents) {
      const u = users.find((u) => u.id === p.userId);
      if (u?.email) {
        parentLookup.set(p.id, { userId: p.userId, email: u.email });
      }
    }

    const plans: CertPlan[] = toProcess.map((reg) => {
      const certId = generateCertId();
      const certType = rankToCertType(reg.finalRank);
      const certUrl = `/certificates/${reg.registrationId}.pdf`;
      const qrUrl = `https://verify.pratibhaparishad.com/certificate/${certId}`;
      const isUpdate = !!(reg.certificate && !reg.certificate.certificateUrl);

      let prizeItemId: string | null = null;
      let prizeRank: string | null = null;

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

    const results: TxResult[] = [];

    for (const plan of plans) {
      if (plan.needsPrizeAward && plan.prizeItemId && plan.prizeRank) {
        const result = await createPrizeAwardWithNewCertificate(
          plan.registration.id,
          plan.prizeItemId,
          plan.prizeRank,
          {
            certificateId: plan.certId,
            certificateUrl: plan.certUrl,
            qrCodeUrl: plan.qrUrl,
            type: plan.certType,
            status: "GENERATED",
          }
        );
        results.push({
          kind: "award",
          registrationId: plan.registration.id,
          dbCertId: result.certificate?.id ?? "",
        });
      } else if (plan.isUpdate && plan.registration.certificate) {
        const updated = await updateCertificateUrl(
          plan.registration.certificate.id,
          {
            certificateId: plan.certId,
            certificateUrl: plan.certUrl,
            qrCodeUrl: plan.qrUrl,
            type: plan.certType,
            status: "GENERATED",
          }
        );
        results.push({
          kind: "update",
          registrationId: plan.registration.id,
          dbCertId: updated?.id ?? "",
        });
      } else {
        const created = await createCertificate({
          registrationId: plan.registration.id,
          certificateId: plan.certId,
          certificateUrl: plan.certUrl,
          qrCodeUrl: plan.qrUrl,
          type: plan.certType as any,
          status: "GENERATED" as any,
        });
        results.push({
          kind: "create",
          registrationId: plan.registration.id,
          dbCertId: created?.[0]?.id ?? "",
        });
      }
    }

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
        actionUrl: "/account/dashboard",
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

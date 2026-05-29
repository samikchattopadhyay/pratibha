import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getCertificateWithCompetition,
  revokeCertificate,
} from "@/lib/db/queries";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; certId: string }> }
) {
  try {
    const session = await getEdgeSession(_);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customUser = session.user as { role?: string; email?: string };
    if (customUser.role !== "SUPER_ADMIN" && customUser.role !== "MODERATOR") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { certId, id: competitionId } = await params;

    const certificate = await getCertificateWithCompetition(certId);

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    if (certificate.registration.competitionCategory.competitionId !== competitionId) {
      return NextResponse.json(
        { error: "Certificate does not belong to this competition" },
        { status: 403 }
      );
    }

    const updated = await revokeCertificate(certId, customUser.email || "unknown");

    return NextResponse.json({
      message: "Certificate revoked successfully",
      certificate: updated,
    });
  } catch (err) {
    console.error("Failed to revoke certificate:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

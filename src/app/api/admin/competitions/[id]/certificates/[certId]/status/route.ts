import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getCertificateWithCompetition,
  updateCertificateStatusOnly,
} from "@/lib/db/queries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; certId: string }> }
) {
  try {
    const session = await getEdgeSession(request);
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

    const { certId, id: competitionId } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

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

    const updated = await updateCertificateStatusOnly(certId, status);

    return NextResponse.json({
      message: "Certificate status updated successfully",
      certificate: updated,
    });
  } catch (err) {
    console.error("Failed to update certificate status:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

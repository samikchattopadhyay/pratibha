import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

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

    // Verify certificate belongs to the competition
    const certificate = await prisma.certificate.findUnique({
      where: { id: certId },
      include: {
        registration: {
          include: {
            competitionCategory: true,
          },
        },
      },
    });

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

    // Update certificate status to REVOKED
    const updated = await prisma.certificate.update({
      where: { id: certId },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
        revokedBy: customUser.email || "unknown",
      },
    });

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

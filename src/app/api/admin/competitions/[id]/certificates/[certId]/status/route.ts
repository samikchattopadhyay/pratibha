import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; certId: string }> }
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

    const { certId, id: competitionId } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

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

    // Update certificate status
    const updated = await prisma.certificate.update({
      where: { id: certId },
      data: { status },
    });

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

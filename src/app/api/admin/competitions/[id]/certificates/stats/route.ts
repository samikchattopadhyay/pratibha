import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

export async function GET(
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

    const certificates = await prisma.certificate.findMany({
      where: {
        registration: {
          competitionCategory: { competitionId },
        },
      },
      select: {
        status: true,
        type: true,
      },
    });

    const byStatus = {
      PENDING: 0,
      GENERATED: 0,
      SHARED: 0,
      REVOKED: 0,
    };

    const byType = {
      PARTICIPATION: 0,
      MERIT_1: 0,
      MERIT_2: 0,
      MERIT_3: 0,
      SPECIAL_MENTION: 0,
    };

    certificates.forEach((cert: any) => {
      byStatus[cert.status as keyof typeof byStatus]++;
      byType[cert.type as keyof typeof byType]++;
    });

    return NextResponse.json({ byStatus, byType });
  } catch (err) {
    console.error("Failed to fetch certificate stats:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

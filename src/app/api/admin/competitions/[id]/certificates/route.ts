import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { getCertificatesByCompetition } from "@/lib/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: competitionId } = await params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const statusFilter = url.searchParams.get("status") || "ALL";

    const offset = (page - 1) * limit;

    const { certificates, totalCount } = await getCertificatesByCompetition(
      competitionId,
      statusFilter,
      limit,
      offset
    );

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: certificates.map((cert) => ({
        id: cert.id,
        registrationId: cert.registrationId,
        studentName: cert.studentName,
        type: cert.type,
        status: cert.status,
        certificateId: cert.certificateId,
        qrCodeUrl: cert.qrCodeUrl,
        generatedAt: new Date(cert.generatedAt).toISOString(),
      })),
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error("Failed to fetch certificates:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

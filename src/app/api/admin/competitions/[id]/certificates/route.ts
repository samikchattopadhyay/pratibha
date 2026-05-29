import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

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

    const skip = (page - 1) * limit;

    // Build filter conditions with DB-level status filtering
    const where: Prisma.CertificateWhereInput = {
      registration: {
        competitionCategory: { competitionId },
      },
      ...(statusFilter !== "ALL" ? { status: statusFilter as any } : {}),
    };

    // Fetch total count and paginated results at database level
    const [totalCount, paginatedCerts] = await prisma.$transaction([
      prisma.certificate.count({ where }),
      prisma.certificate.findMany({
        where,
        include: {
          registration: {
            select: {
              registrationId: true,
              student: { select: { name: true } },
            },
          },
        },
        orderBy: { issuedAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: paginatedCerts.map((cert: any) => ({
        id: cert.id,
        registrationId: cert.registration.registrationId,
        studentName: cert.registration.student.name,
        type: cert.type,
        status: cert.status || "PENDING",
        certificateId: cert.certificateId,
        qrCodeUrl: cert.qrCodeUrl,
        generatedAt: cert.issuedAt.toISOString(),
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

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: competitionId } = await params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: Prisma.CertificateWhereInput = {
      registration: {
        competitionCategory: { competitionId },
      },
    };

    // Fetch total count
    const totalCount = await prisma.certificate.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch certificates
    const certificates = await prisma.certificate.findMany({
      where,
      select: {
        id: true,
        registration: {
          select: {
            registrationId: true,
            student: { select: { name: true } },
          },
        },
        type: true,
        certificateId: true,
        certificateUrl: true,
        issuedAt: true,
      },
      skip,
      take: limit,
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json({
      data: certificates.map((cert) => ({
        id: cert.id,
        registrationId: cert.registration.registrationId,
        studentName: cert.registration.student.name,
        type: cert.type,
        status: cert.certificateUrl ? "GENERATED" : "PENDING",
        certificateId: cert.certificateId,
        certificateUrl: cert.certificateUrl,
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

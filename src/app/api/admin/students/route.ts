import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import type { PaginatedResponse, StudentSummary } from "@/types/student-details";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "ALL";

    // Build query filters
    const where: Prisma.StudentWhereInput = {};

    if (search.trim()) {
      const searchPattern = search.trim();
      where.OR = [
        {
          name: {
            contains: searchPattern,
            mode: "insensitive",
          },
        },
        {
          parent: {
            name: {
              contains: searchPattern,
              mode: "insensitive",
            },
          },
        },
        {
          parent: {
            phone: {
              contains: searchPattern,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    if (filter === "HAS_AWARDS") {
      where.registrations = {
        some: {
          prizeAward: {
            isNot: null,
          },
        },
      };
    } else if (filter === "PENDING_PAYMENT") {
      where.registrations = {
        some: {
          paymentStatus: "PENDING",
        },
      };
    }

    // Run query counting and paging in a transaction
    const [totalCount, students] = await prisma.$transaction([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        include: {
          parent: true,
          registrations: {
            include: {
              prizeAward: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formatted: StudentSummary[] = students.map((student) => ({
      id: student.id,
      name: student.name,
      parentName: student.parent.name,
      competitionCount: student.registrations.length,
      awardCount: student.registrations.filter((reg) => reg.prizeAward).length,
      lastRegistrationDate: student.registrations[0]?.createdAt.toISOString() || null,
    }));

    const response: PaginatedResponse<StudentSummary> = {
      data: formatted,
      total: totalCount,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Admin students fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import type { PaginatedResponse, StudentRegistrationEntry } from "@/types/student-details";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const filter = searchParams.get("filter") || "ALL";

    // Build query filters
    const where: Prisma.RegistrationWhereInput = {
      studentId: id,
    };

    if (filter === "VERIFIED") {
      where.status = "VERIFIED";
    } else if (filter === "PENDING") {
      where.status = "PENDING_VERIFICATION";
    } else if (filter === "PAID") {
      where.paymentStatus = "SUCCESS";
    } else if (filter === "AWARDED") {
      where.prizeAward = {
        isNot: null,
      };
    }

    // Run query counting and paging in a transaction
    const [totalCount, registrations] = await prisma.$transaction([
      prisma.registration.count({ where }),
      prisma.registration.findMany({
        where,
        include: {
          competitionCategory: {
            include: {
              competition: true,
              category: true,
            },
          },
          judgeAssignments: {
            include: {
              judge: true,
              score: true,
            },
          },
          prizeAward: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formatted: StudentRegistrationEntry[] = registrations.map((reg) => ({
      id: reg.id,
      registrationId: reg.registrationId,
      competitionTitle: reg.competitionCategory.competition.title,
      competitionId: reg.competitionCategory.competitionId,
      categoryName: reg.competitionCategory.category.name,
      categoryId: reg.competitionCategory.categoryId,
      status: reg.status as "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "DISQUALIFIED",
      paymentStatus: reg.paymentStatus as "PENDING" | "SUCCESS" | "FAILED",
      finalScore: reg.finalScore ? Number(reg.finalScore) : null,
      finalRank: reg.finalRank,
      fbPostUrl: reg.fbPostUrl,
      scoringFinalized: reg.scoringFinalized,
      createdAt: reg.createdAt.toISOString(),
      judgeAssignments: reg.judgeAssignments.map(({ judge, score }) => ({
        judgeName: judge.name,
        score: score ? Number(score.totalScore) : null,
      })),
      certificateId: reg.prizeAward?.id,
    }));

    const response: PaginatedResponse<StudentRegistrationEntry> = {
      data: formatted,
      total: totalCount,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Student competitions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

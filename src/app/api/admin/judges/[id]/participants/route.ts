import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import type { ParticipantAssignment, PaginatedResponse } from "@/types/judges-details";

// ✅ Pattern: Pagination params validation
const PaginationSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

// ✅ Pattern: Type guard for auth
async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  // TODO: Implement actual auth check
  return true;
}

// ✅ Pattern: Fetch with Prisma pagination (skip/take)
async function fetchParticipants(
  judgeId: string,
  pagination: z.infer<typeof PaginationSchema>
): Promise<PaginatedResponse<ParticipantAssignment>> {
  const where = {
    judgeId,
    ...(pagination.search && {
      registration: {
        student: {
          name: { contains: pagination.search, mode: "insensitive" as const },
        },
      },
    }),
  };

  const [assignments, total] = await Promise.all([
    prisma.judgeAssignment.findMany({
      where,
      skip: pagination.page * pagination.limit,
      take: pagination.limit,
      select: {
        id: true,
        registration: {
          select: {
            id: true,
            student: { select: { id: true, name: true } },
            competitionCategory: {
              select: { category: { select: { id: true, name: true } } },
            },
            finalScore: true,
          },
        },
        score: { select: { totalScore: true } },
        submittedAt: true,
      },
    }),
    prisma.judgeAssignment.count({ where }),
  ]);

  return {
    data: assignments.map((a) => ({
      id: a.id,
      participantId: a.registration.student.id,
      participantName: a.registration.student.name,
      categoryId: a.registration.competitionCategory.category.id,
      categoryName: a.registration.competitionCategory.category.name,
      submissionScore: a.score?.totalScore ?? (a.registration.finalScore?.toNumber() ?? null),
      evaluationStatus: (a.submittedAt ? "completed" : "pending") as "pending" | "in-progress" | "completed",
      submittedAt: a.submittedAt?.toISOString() ?? "",
    })),
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: judgeId } = await params;

    // Get query params
    const searchParams = new URLSearchParams(request.nextUrl.search);
    const params_obj = Object.fromEntries(searchParams);
    const validated = PaginationSchema.safeParse(params_obj);

    if (!validated.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    // Check authorization
    const isAuthorized = await checkAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Admin access required" },
        { status: 401 }
      );
    }

    const result = await fetchParticipants(judgeId, validated.data);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[GET /api/admin/judges/[id]/participants]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}

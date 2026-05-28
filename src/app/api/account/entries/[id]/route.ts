import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import { z } from "zod";
import type { ParentEntryDetails, ParentJudgeScore } from "@/types/account-entry-details";

const uuidSchema = z.string().uuid();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ─── 1. AUTHENTICATION ──────────────────────────────────────────────────────
    const session = await getEdgeSession(_req);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ─── 2. PARAMETERS & VALIDATION ─────────────────────────────────────────────
    const { id } = await params;
    const validation = uuidSchema.safeParse(id);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid registration ID format", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    const userId = (session.user as { id?: string }).id;

    // ─── 3. DATA FETCHING ──────────────────────────────────────────────────────
    const registration = await prisma.registration.findUnique({
      where: { id: validation.data },
      include: {
        student: true,
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
          orderBy: { assignedAt: "asc" },
        },
        certificate: true,
        prizeAward: {
          include: {
            prizeItem: true,
            physicalOrder: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // ─── 4. AUTHORIZATION (OWNERSHIP CHECK) ─────────────────────────────────────
    const parent = await prisma.parent.findUnique({
      where: { userId },
    });

    if (!parent || registration.student.parentId !== parent.id) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // ─── 5. COMPUTE DERIVED DATA ────────────────────────────────────────────────
    const competition = registration.competitionCategory.competition;
    const category = registration.competitionCategory.category;

    // Compute student age
    const birthDate = new Date(registration.student.dateOfBirth);
    const today = new Date();
    let studentAge = today.getFullYear() - birthDate.getFullYear();
    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      studentAge--;
    }

    // Count total entries in this category (for ranking context)
    const totalInCategory = await prisma.registration.count({
      where: {
        competitionCategoryId: registration.competitionCategoryId,
      },
    });

    // Anonymize judge labels based on assignedAt order
    const judgeScores: ParentJudgeScore[] | null = registration.scoringFinalized
      ? registration.judgeAssignments.map((assignment, index) => ({
          label: `Judge ${index + 1}`,
          isSubmitted: assignment.isSubmitted,
          criteria1: assignment.score?.criteria1 ?? null,
          criteria2: assignment.score?.criteria2 ?? null,
          criteria3: assignment.score?.criteria3 ?? null,
          criteria4: assignment.score?.criteria4 ?? null,
          totalScore: assignment.score?.totalScore ?? null,
          remarks: assignment.score?.remarks ?? null,
        }))
      : null;

    // Map certificate
    const certificate = registration.certificate
      ? {
          certificateId: registration.certificate.certificateId,
          certificateUrl: registration.certificate.certificateUrl,
          qrCodeUrl: registration.certificate.qrCodeUrl,
          type: registration.certificate.type as "PARTICIPATION" | "MERIT_1" | "MERIT_2" | "MERIT_3" | "SPECIAL_MENTION",
          status: registration.certificate.status as "PENDING" | "GENERATED" | "SHARED" | "REVOKED",
          issuedAt: registration.certificate.issuedAt.toISOString(),
        }
      : null;

    // Map prize award
    const prizeAward = registration.prizeAward
      ? {
          rank: registration.prizeAward.rank,
          prizeTitle: registration.prizeAward.prizeItem.title,
          prizeType: registration.prizeAward.prizeItem.type,
          isPhysical: registration.prizeAward.prizeItem.isPhysical,
          isDispatched: registration.prizeAward.isDispatched,
          dispatchedAt: registration.prizeAward.dispatchedAt?.toISOString() ?? null,
          shipping: registration.prizeAward.physicalOrder
            ? {
                courierName: registration.prizeAward.physicalOrder.courierName ?? null,
                awbNumber: registration.prizeAward.physicalOrder.awbNumber ?? null,
                estimatedDelivery: registration.prizeAward.physicalOrder.estimatedDelivery?.toISOString() ?? null,
                deliveredAt: registration.prizeAward.physicalOrder.deliveredAt?.toISOString() ?? null,
              }
            : null,
        }
      : null;

    // ─── 6. RESPONSE MAPPING ───────────────────────────────────────────────────
    const response: ParentEntryDetails = {
      id: registration.id,
      studentId: registration.student.id,
      registrationId: registration.registrationId,
      competitionTitle: competition.title,
      competitionScope: competition.scope,
      categoryName: category.name,
      minAge: registration.competitionCategory.minAge ?? null,
      maxAge: registration.competitionCategory.maxAge ?? null,
      startDate: competition.startDate.toISOString(),
      endDate: competition.endDate.toISOString(),
      resultDate: competition.resultDate?.toISOString() ?? null,
      fbPostUrl: registration.fbPostUrl,
      createdAt: registration.createdAt.toISOString(),
      paymentStatus: registration.paymentStatus,
      status: registration.status,
      scoringFinalized: registration.scoringFinalized,
      finalScore: registration.finalScore ? Number(registration.finalScore) : null,
      finalRank: registration.finalRank,
      totalInCategory,
      studentName: registration.student.name,
      studentAge,
      judgeScores,
      certificate,
      prizeAward,
    };

    // Validate response satisfies interface
    return NextResponse.json(response satisfies ParentEntryDetails);
  } catch (error) {
    console.error("Parent entry details GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/account/qualifications — parent's students' qualification slots
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as { id?: string }).id;
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: {
        students: {
          include: {
            qualificationSlots: {
              include: {
                qualificationRule: {
                  include: {
                    stateCompetition: { select: { title: true } },
                  },
                },
                nationalCompetition: {
                  select: { id: true, title: true, entryFeeINR: true, registrationDeadline: true },
                },
                registration: { select: { finalRank: true, finalScore: true, registrationId: true } },
              },
              orderBy: { offeredAt: "desc" },
            },
          },
        },
      },
    });

    if (!parent) return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });

    // Auto-expire any overdue OFFERED slots
    const now = new Date();
    await prisma.qualificationSlot.updateMany({
      where: {
        status: "OFFERED",
        expiresAt: { lt: now },
        student: { parentId: parent.id },
      },
      data: { status: "EXPIRED" },
    });

    const qualifications = parent.students.flatMap((student) =>
      student.qualificationSlots.map((slot) => {
        const rule = slot.qualificationRule;
        const originalFee = Number(slot.nationalCompetition.entryFeeINR);
        const discountedFee = originalFee * (1 - rule.discountPercent / 100);

        return {
          slotId: slot.id,
          studentName: student.name,
          studentId: student.id,
          earnedInCompetition: rule.stateCompetition.title,
          earnedRank: slot.registration.finalRank,
          earnedScore: slot.registration.finalScore ? Number(slot.registration.finalScore) : null,
          registrationId: slot.registration.registrationId,
          nationalCompetitionId: slot.nationalCompetition.id,
          nationalCompetitionTitle: slot.nationalCompetition.title,
          nationalRegistrationDeadline: slot.nationalCompetition.registrationDeadline,
          status: slot.status,
          isWildCard: slot.isWildCard,
          offeredAt: slot.offeredAt,
          expiresAt: slot.expiresAt,
          acceptedAt: slot.acceptedAt,
          discountPercent: rule.discountPercent,
          originalFee,
          discountedFee: Math.round(discountedFee),
        };
      })
    );

    return NextResponse.json({ qualifications });
  } catch (error) {
    console.error("Parent qualifications GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

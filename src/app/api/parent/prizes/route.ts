import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/parent/prizes — authenticated parent's prize status for all students
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
            registrations: {
              include: {
                competitionCategory: { include: { competition: { select: { title: true, scope: true } } } },
                prizeAward: {
                  include: {
                    prizeItem: { select: { title: true, type: true, isPhysical: true } },
                    certificate: { select: { certificateId: true, certificateUrl: true } },
                    physicalOrder: {
                      select: {
                        status: true,
                        awbNumber: true,
                        courierName: true,
                        estimatedDelivery: true,
                        dispatchedAt: true,
                        deliveredAt: true,
                      },
                    },
                  },
                },
              },
              where: { prizeAward: { isNot: null } },
            },
          },
        },
      },
    });

    if (!parent) return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });

    const prizes = parent.students.flatMap((student) =>
      student.registrations
        .filter((reg) => reg.prizeAward)
        .map((reg) => ({
          studentName: student.name,
          competitionTitle: reg.competitionCategory.competition.title,
          competitionScope: reg.competitionCategory.competition.scope,
          rank: reg.prizeAward!.rank,
          prizeTitle: reg.prizeAward!.prizeItem.title,
          prizeType: reg.prizeAward!.prizeItem.type,
          isPhysical: reg.prizeAward!.prizeItem.isPhysical,
          isDispatched: reg.prizeAward!.isDispatched,
          dispatchedAt: reg.prizeAward!.dispatchedAt,
          awardedAt: reg.prizeAward!.awardedAt,
          certificate: reg.prizeAward!.certificate
            ? {
                certificateId: reg.prizeAward!.certificate.certificateId,
                certificateUrl: reg.prizeAward!.certificate.certificateUrl,
              }
            : null,
          shipping: reg.prizeAward!.physicalOrder
            ? {
                status: reg.prizeAward!.physicalOrder.status,
                awbNumber: reg.prizeAward!.physicalOrder.awbNumber,
                courierName: reg.prizeAward!.physicalOrder.courierName,
                estimatedDelivery: reg.prizeAward!.physicalOrder.estimatedDelivery,
                dispatchedAt: reg.prizeAward!.physicalOrder.dispatchedAt,
                deliveredAt: reg.prizeAward!.physicalOrder.deliveredAt,
              }
            : null,
        }))
    );

    return NextResponse.json({ prizes });
  } catch (error) {
    console.error("Parent prizes GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

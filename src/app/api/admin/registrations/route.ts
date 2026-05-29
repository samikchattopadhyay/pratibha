import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import { createAndDispatchNotification } from "@/lib/notificationService";
import { Prisma, NotificationType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
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
    const where: Prisma.RegistrationWhereInput = {};

    if (filter === "PENDING") {
      where.status = "PENDING_VERIFICATION";
    } else if (filter === "PAID") {
      where.paymentStatus = "SUCCESS";
    } else if (filter === "UNASSIGNED") {
      where.judgeAssignments = {
        none: {},
      };
    }

    if (search.trim()) {
      const searchPattern = search.trim();
      where.OR = [
        {
          registrationId: {
            contains: searchPattern,
            mode: "insensitive",
          },
        },
        {
          student: {
            name: {
              contains: searchPattern,
              mode: "insensitive",
            },
          },
        },
        {
          student: {
            parent: {
              phone: {
                contains: searchPattern,
                mode: "insensitive",
              },
            },
          },
        },
        {
          competitionCategory: {
            category: {
              name: {
                contains: searchPattern,
                mode: "insensitive",
              },
            },
          },
        },
        {
          judgeAssignments: {
            some: {
              judge: {
                name: {
                  contains: searchPattern,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      ];
    }

    // Run query counting and paging in a transaction
    const [
      totalCount,
      registrations,
      totalCountAll,
      pendingCount,
      paidCount,
      unassignedCount
    ] = await prisma.$transaction([
      prisma.registration.count({ where }),
      prisma.registration.findMany({
        where,
        include: {
          student: {
            include: {
              parent: true,
            },
          },
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
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.registration.count(),
      prisma.registration.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.registration.count({ where: { paymentStatus: "SUCCESS" } }),
      prisma.registration.count({ where: { judgeAssignments: { none: {} } } }),
    ]);

    const formatted = registrations.map((reg) => ({
      id: reg.id,
      registrationId: reg.registrationId,
      studentId: reg.studentId,
      studentName: reg.student.name,
      competitionTitle: reg.competitionCategory.competition.title,
      categoryName: reg.competitionCategory.category.name,
      fbPostUrl: reg.fbPostUrl,
      paymentStatus: reg.paymentStatus,
      status: reg.status,
      scoringFinalized: reg.scoringFinalized,
      createdAt: reg.createdAt,
      assignments: reg.judgeAssignments.map((a) => ({
        id: a.id,
        judgeName: a.judge.name,
        isSubmitted: a.isSubmitted,
        score: a.score ? a.score.totalScore : null,
      })),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      registrations: formatted,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
      metrics: {
        total: totalCountAll,
        pending: pendingCount,
        paid: paidCount,
        unassigned: unassignedCount,
      },
    });
  } catch (error) {
    console.error("Admin registrations fetch error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, scoringFinalized } = body;

    if (!id) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
    }

    const updateData: Prisma.RegistrationUpdateInput = {};
    if (status !== undefined) {
      updateData.status = status;
    }
    if (scoringFinalized !== undefined) {
      updateData.scoringFinalized = scoringFinalized;
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: updateData,
    });

    // Send notifications based on status change (fire-and-forget)
    if (status === "VERIFIED" || status === "REJECTED") {
      const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
          student: true,
          competitionCategory: {
            include: { category: true },
          },
        },
      });

      if (registration) {
        const student = registration.student;
        const parent = await prisma.parent.findFirst({
          where: { id: student.parentId },
        });

        if (parent) {
          const user = await prisma.user.findUnique({
            where: { id: parent.userId },
          });

          if (user?.email) {
            const notificationType = status === "VERIFIED" ? "REGISTRATION_VERIFIED" : "REGISTRATION_REJECTED";
            const title = status === "VERIFIED" ? "Registration Verified" : "Registration Rejected";
            const body = status === "VERIFIED"
              ? `${student.name}'s registration for ${registration.competitionCategory.category.name} has been verified and approved.`
              : `${student.name}'s registration for ${registration.competitionCategory.category.name} has been rejected. Please contact support for more details.`;

            createAndDispatchNotification({
              userId: parent.userId,
              type: notificationType as NotificationType,
              title,
              body,
              actionUrl: "/account/dashboard",
              registrationId: registration.id,
              recipientEmail: user.email,
            }).catch((err) =>
              console.error(`Failed to send ${notificationType} notification:`, err)
            );
          }
        }
      }
    }

    return NextResponse.json({ message: "Registration updated successfully", registration: updated });
  } catch (error) {
    console.error("Admin registration update error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

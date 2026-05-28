import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { createAndDispatchNotification } from "@/lib/notificationService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    // Fetch all verified registrations with assignments
    const registrations = await prisma.registration.findMany({
      where: {
        status: "VERIFIED",
        judgeAssignments: {
          some: {},
        },
      },
      include: {
        student: true,
        competitionCategory: {
          include: {
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
    });

    const cards = registrations.map((reg) => {
      // Determine Kanban Column Status
      let columnStatus = "PENDING"; // PENDING, IN_REVIEW, COMPLETED, CONFLICT_FLAGGED

      const totalAssignments = reg.judgeAssignments.length;
      const submittedAssignments = reg.judgeAssignments.filter((a) => a.isSubmitted);
      const allSubmitted = totalAssignments > 0 && submittedAssignments.length === totalAssignments;
      
      const scores = submittedAssignments
        .map((a) => a.score?.totalScore)
        .filter((s): s is number => s !== undefined && s !== null);

      let avgScore: number | null = null;
      if (scores.length > 0) {
        avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }

      if (reg.scoringFinalized) {
        columnStatus = "COMPLETED";
      } else if (!allSubmitted) {
        columnStatus = "PENDING";
      } else {
        // All are submitted, check for conflict
        let hasConflict = false;
        if (scores.length > 1) {
          const maxScore = Math.max(...scores);
          const minScore = Math.min(...scores);
          if (maxScore - minScore > 15 && !reg.conflictResolved) {
            hasConflict = true;
          }
        }

        if (hasConflict) {
          columnStatus = "CONFLICT_FLAGGED";
        } else {
          columnStatus = "IN_REVIEW";
        }
      }

      const judgeNames = reg.judgeAssignments.map((a) => a.judge.name).join(", ");

      return {
        id: reg.id,
        name: reg.student.name,
        category: reg.competitionCategory.category.name,
        status: columnStatus,
        judge: judgeNames,
        score: avgScore,
        rawScores: scores,
        assignments: reg.judgeAssignments.map((a) => ({
          id: a.id,
          judgeId: a.judge.id,
          judgeName: a.judge.name,
          isSubmitted: a.isSubmitted,
          score: a.score ? a.score.totalScore : null,
        })),
      };
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Admin Kanban fetch error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const body = await request.json();
    const { registrationId, action } = body; // action: "re-queue" | "review" | "approve"

    if (!registrationId || !action) {
      return NextResponse.json({ error: "Parameters missing" }, { status: 400 });
    }

    if (action === "re-queue") {
      // Re-queue: set isSubmitted to false for all assignments of this registration, delete scores
      await prisma.$transaction(async (tx) => {
        const assignments = await tx.judgeAssignment.findMany({
          where: { registrationId },
        });

        for (const assignment of assignments) {
          if (assignment.isSubmitted) {
            // Delete associated score first due to CASCADE/onDelete constraints
            await tx.score.deleteMany({
              where: { judgeAssignmentId: assignment.id },
            });
            
            await tx.judgeAssignment.update({
              where: { id: assignment.id },
              data: {
                isSubmitted: false,
                submittedAt: null,
              },
            });
          }
        }

        await tx.registration.update({
          where: { id: registrationId },
          data: {
            scoringFinalized: false,
            conflictResolved: false,
          },
        });
      });

      return NextResponse.json({ message: "Registration re-queued successfully" });
    }

    if (action === "review") {
      // Review: moves card from Conflict to Jury Review by marking conflictResolved = true
      await prisma.registration.update({
        where: { id: registrationId },
        data: {
          conflictResolved: true,
          scoringFinalized: false,
        },
      });

      return NextResponse.json({ message: "Registration marked for jury review" });
    }

    if (action === "approve") {
      // Approve: freeze results by setting scoringFinalized = true and conflictResolved = true
      await prisma.registration.update({
        where: { id: registrationId },
        data: {
          scoringFinalized: true,
          conflictResolved: true,
        },
      });

      // Send notification to parent (fire-and-forget)
      const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
          student: true,
          competitionCategory: {
            include: { category: true },
          },
          judgeAssignments: {
            include: { score: true },
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

          const scores = registration.judgeAssignments
            .filter((a) => a.score?.totalScore)
            .map((a) => a.score?.totalScore)
            .filter((s): s is number => s !== undefined && s !== null);

          const avgScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

          if (user?.email) {
            createAndDispatchNotification({
              userId: parent.userId,
              type: "RESULTS_PUBLISHED",
              title: "Results Published",
              body: `Results for ${student.name}'s submission in ${registration.competitionCategory.category.name} have been finalized. Average score: ${avgScore}/100.`,
              actionUrl: "/account/dashboard",
              registrationId: registration.id,
              recipientEmail: user.email,
            }).catch((err) =>
              console.error("Failed to send results published notification:", err)
            );
          }
        }
      }

      return NextResponse.json({ message: "Scoring finalized successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin Kanban patch error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

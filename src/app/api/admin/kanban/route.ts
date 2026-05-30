import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { createAndDispatchNotification } from "@/lib/notificationService";
import {
  getVerifiedRegistrationsWithAssignments,
  getJudgeAssignmentsByRegistration,
  deleteScoresByAssignment,
  updateJudgeAssignmentSubmission,
  updateRegistrationStatus,
  getRegistrationWithAssignmentsAndScores,
  getParentById,
} from "@/lib/db/queries";

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const registrations = await getVerifiedRegistrationsWithAssignments();

    const cards = registrations.map((reg: any) => {
      // Determine Kanban Column Status
      let columnStatus = "PENDING"; // PENDING, IN_REVIEW, COMPLETED, CONFLICT_FLAGGED

      const totalAssignments = reg.judgeAssignments.length;
      const submittedAssignments = reg.judgeAssignments.filter((a: any) => a.isSubmitted);
      const allSubmitted = totalAssignments > 0 && submittedAssignments.length === totalAssignments;

      const scores = submittedAssignments
        .map((a: any) => a.score?.totalScore ? parseFloat(String(a.score.totalScore)) : null)
        .filter((s: any): s is number => s !== undefined && s !== null);

      let avgScore: number | null = null;
      if (scores.length > 0) {
        avgScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
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

      const judgeNames = reg.judgeAssignments.map((a: any) => a.judge.name).join(", ");

      return {
        id: reg.id,
        name: reg.student.name,
        category: reg.competitionCategory.category.name,
        status: columnStatus,
        judge: judgeNames,
        score: avgScore,
        rawScores: scores,
        assignments: reg.judgeAssignments.map((a: any) => ({
          id: a.id,
          judgeId: a.judge.id,
          judgeName: a.judge.name,
          isSubmitted: a.isSubmitted,
          score: a.score ? parseFloat(String(a.score.totalScore)) : null,
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
    const session = await getEdgeSession(request);
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
      const assignments = await getJudgeAssignmentsByRegistration(registrationId);

      for (const assignment of assignments) {
        if (assignment.isSubmitted) {
          await deleteScoresByAssignment(assignment.id);
          await updateJudgeAssignmentSubmission(assignment.id, {
            isSubmitted: false,
            submittedAt: null,
          });
        }
      }

      await updateRegistrationStatus(registrationId, {
        scoringFinalized: false,
        conflictResolved: false,
      });

      return NextResponse.json({ message: "Registration re-queued successfully" });
    }

    if (action === "review") {
      await updateRegistrationStatus(registrationId, {
        conflictResolved: true,
        scoringFinalized: false,
      });

      return NextResponse.json({ message: "Registration marked for jury review" });
    }

    if (action === "approve") {
      await updateRegistrationStatus(registrationId, {
        scoringFinalized: true,
        conflictResolved: true,
      });

      const registration = await getRegistrationWithAssignmentsAndScores(registrationId);

      if (registration) {
        const student = registration.student;
        const parent = await getParentById(student.parentId);

        if (parent) {
          const scores = registration.judgeAssignments
            .filter((a: any) => a.score?.totalScore)
            .map((a: any) => a.score?.totalScore ? parseFloat(String(a.score.totalScore)) : null)
            .filter((s: any): s is number => s !== undefined && s !== null);

          const avgScore = scores.length > 0
            ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
            : 0;

          createAndDispatchNotification({
            userId: parent.userId,
            type: "RESULTS_PUBLISHED",
            title: "Results Published",
            body: `Results for ${student.name}'s submission in ${registration.competitionCategory.category.name} have been finalized. Average score: ${avgScore}/100.`,
            actionUrl: "/account/dashboard",
            registrationId: registration.id,
            recipientEmail: parent.user?.email || "",
          }).catch((err) =>
            console.error("Failed to send results published notification:", err)
          );
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

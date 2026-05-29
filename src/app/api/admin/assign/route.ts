import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getJudgeAssignmentByRegistrationAndJudge,
  createJudgeAssignment,
  getUserById,
  getRegistrationForCertificateNotification,
} from "@/lib/db/queries";
import { createAndDispatchNotification } from "@/lib/notificationService";

export async function POST(req: Request) {
  try {
    const session = await getEdgeSession(req);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { registrationId, judgeId } = body;

    if (!registrationId || !judgeId) {
      return NextResponse.json({ error: "Required parameters missing" }, { status: 400 });
    }

    const existing = await getJudgeAssignmentByRegistrationAndJudge(registrationId, judgeId);

    if (existing) {
      return NextResponse.json({ error: "This judge is already assigned to evaluate this entry" }, { status: 400 });
    }

    const result = await createJudgeAssignment({
      registrationId,
      judgeId,
      isSubmitted: false,
    });

    const assignment = result[0];

    const judge = await getUserById(judgeId);

    if (judge?.email) {
      const registration = await getRegistrationForCertificateNotification(registrationId);

      if (registration) {
        createAndDispatchNotification({
          userId: judgeId,
          type: "JUDGE_ASSIGNED",
          title: "New Assignment",
          body: `You have been assigned to evaluate ${registration.student.name}'s submission in ${registration.competitionCategory.category.name}.`,
          actionUrl: "/judge/dashboard",
          assignmentId: assignment.id,
          registrationId: registrationId,
          recipientEmail: judge.email,
        }).catch((err) =>
          console.error("Failed to send judge assignment notification:", err)
        );
      }
    }

    return NextResponse.json(
      { message: "Judge assigned successfully", assignmentId: assignment.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Judge assignment failed:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

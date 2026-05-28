import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
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

    // Check if assignment already exists
    const existing = await prisma.judgeAssignment.findUnique({
      where: {
        registrationId_judgeId: { registrationId, judgeId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "This judge is already assigned to evaluate this entry" }, { status: 400 });
    }

    const assignment = await prisma.judgeAssignment.create({
      data: {
        registrationId,
        judgeId,
        isSubmitted: false,
      },
    });

    // Send notification to judge (fire-and-forget)
    const judge = await prisma.user.findUnique({
      where: { id: judgeId },
    });

    if (judge?.email) {
      const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
          student: true,
          competitionCategory: {
            include: { category: true },
          },
        },
      });

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

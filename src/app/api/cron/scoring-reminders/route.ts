import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createAndDispatchNotification } from "@/lib/notificationService";

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get("Authorization");
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find judge assignments that haven't been submitted for 3+ days
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const overdueAssignments = await prisma.judgeAssignment.findMany({
      where: {
        isSubmitted: false,
        assignedAt: {
          lte: threeDaysAgo,
        },
      },
      include: {
        judge: {
          include: { user: true },
        },
        registration: {
          include: {
            student: true,
            competitionCategory: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (overdueAssignments.length === 0) {
      return NextResponse.json({
        message: "No overdue assignments to remind",
        count: 0,
      });
    }

    let remindersSent = 0;

    for (const assignment of overdueAssignments) {
      const judge = assignment.judge;
      const registration = assignment.registration;
      const student = registration.student;
      const daysAgo = Math.floor((Date.now() - assignment.assignedAt.getTime()) / (24 * 60 * 60 * 1000));

      createAndDispatchNotification({
        userId: assignment.judgeId,
        type: "SCORING_REMINDER",
        title: "Scoring Reminder",
        body: `Please submit your scores for ${student.name}'s ${registration.competitionCategory.category.name} submission. This was assigned ${daysAgo} days ago.`,
        actionUrl: "/judge/dashboard",
        assignmentId: assignment.id,
        registrationId: registration.id,
        recipientEmail: judge.user.email,
        recipientPhone: judge.telegramChatId || undefined,
      }).catch((err) => console.error("Failed to send scoring reminder:", err));

      remindersSent++;
    }

    return NextResponse.json({
      message: `Sent ${remindersSent} scoring reminders`,
      count: remindersSent,
    });
  } catch (error) {
    console.error("Scoring reminders cron error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

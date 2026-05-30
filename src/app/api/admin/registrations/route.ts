import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import * as schema from "@/lib/db/schema";
import {
  getRegistrationsForAdminList,
  getRegistrationCountsForMetrics,
  getRegistrationWithDetailsForNotification,
  updateRegistration,
} from "@/lib/db/queries";
import { createAndDispatchNotification } from "@/lib/notificationService";

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
    const filter = (searchParams.get("filter") || "ALL") as "ALL" | "PENDING" | "PAID" | "UNASSIGNED";

    const { registrations, totalCount } = await getRegistrationsForAdminList({
      limit,
      offset: (page - 1) * limit,
      search,
      filter,
    });

    const metrics = await getRegistrationCountsForMetrics();

    const formatted = registrations.map((reg: any) => ({
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
      assignments: reg.judgeAssignments.map((a: any) => ({
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
        total: metrics.total,
        pending: metrics.pending,
        paid: metrics.paid,
        unassigned: metrics.unassigned,
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

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
    }
    if (scoringFinalized !== undefined) {
      updateData.scoringFinalized = scoringFinalized;
    }

    const updated = await updateRegistration(id, updateData);

    if (status === "VERIFIED" || status === "REJECTED") {
      const registration = await getRegistrationWithDetailsForNotification(id);

      if (registration) {
        const student = registration.student;
        const parent = await db.query.parents.findFirst({
          where: eq(schema.parents.id, student.parentId),
          with: {
            user: true,
          },
        });

        if (parent?.user?.email) {
          const notificationType = status === "VERIFIED" ? "REGISTRATION_VERIFIED" : "REGISTRATION_REJECTED";
          const title = status === "VERIFIED" ? "Registration Verified" : "Registration Rejected";
          const bodyText = status === "VERIFIED"
            ? `${student.name}'s registration for ${registration.competitionCategory.category.name} has been verified and approved.`
            : `${student.name}'s registration for ${registration.competitionCategory.category.name} has been rejected. Please contact support for more details.`;

          createAndDispatchNotification({
            userId: parent.userId,
            type: notificationType as any,
            title,
            body: bodyText,
            actionUrl: "/account/dashboard",
            registrationId: registration.id,
            recipientEmail: parent.user.email,
          }).catch((err) =>
            console.error(`Failed to send ${notificationType} notification:`, err)
          );
        }
      }
    }

    return NextResponse.json({ message: "Registration updated successfully", registration: updated[0] });
  } catch (error) {
    console.error("Admin registration update error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

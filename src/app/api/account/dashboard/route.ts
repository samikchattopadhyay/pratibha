/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getUserById,
  getParentWithStudentsAndRegistrations,
  getAllCategories,
} from "@/lib/db/queries";

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check if user has completed all onboarding steps
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // PARENT users must complete onboarding (password + phone + email verification + address)
    // JUDGE and ADMIN users skip this check
    if (user.role === "PARENT") {
      // Onboarding is complete only if:
      // 1. User's email is verified
      // 2. User has a parent profile with phone
      // 3. User has completed address (street, city, state, postalCode)
      const parentWithDetails = await getParentWithStudentsAndRegistrations(userId);

      const isOnboardingComplete =
        user.emailVerified &&
        parentWithDetails &&
        parentWithDetails.phone &&
        parentWithDetails.address &&
        parentWithDetails.city &&
        parentWithDetails.state &&
        parentWithDetails.postalCode;

      if (!isOnboardingComplete) {
        return NextResponse.json(
          { error: "Onboarding not complete", code: "SETUP_REQUIRED" },
          { status: 404 }
        );
      }
    }

    // Get parent profile with full details
    const parentWithDetails = await getParentWithStudentsAndRegistrations(userId);

    if (!parentWithDetails) {
      return NextResponse.json(
        { error: "Profile not found", code: "SETUP_REQUIRED" },
        { status: 404 }
      );
    }

    // Flatten registrations for easy rendering
    const registrations: any[] = [];
    parentWithDetails.students.forEach((student) => {
      student.registrations.forEach((reg) => {
        registrations.push({
          id: reg.id,
          studentName: student.name,
          studentId: student.id,
          competitionTitle: reg.competitionCategory.competition.title,
          categoryName: reg.competitionCategory.category.name,
          fbPostUrl: reg.fbPostUrl,
          paymentStatus: reg.paymentStatus,
          registrationId: reg.registrationId,
          status: reg.status,
          certificate: reg.certificate
            ? {
                id: reg.certificate.id,
                certificateId: reg.certificate.certificateId,
                certificateUrl: reg.certificate.certificateUrl,
              }
            : null,
          createdAt: reg.createdAt,
        });
      });
    });

    // Sort registrations by date desc
    registrations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Fetch all categories for discipline choices
    const categories = await getAllCategories();

    return NextResponse.json({
      parent: {
        id: parentWithDetails.id,
        name: parentWithDetails.name,
        phone: parentWithDetails.phone,
        address: parentWithDetails.address,
        city: parentWithDetails.city,
        state: parentWithDetails.state,
        preferredState: parentWithDetails.preferredState || parentWithDetails.state,
        postalCode: parentWithDetails.postalCode,
        country: parentWithDetails.country,
      },
      students: parentWithDetails.students.map((s) => ({
        id: s.id,
        name: s.name,
        dateOfBirth: s.dateOfBirth,
        gender: s.gender,
        disciplineInterests: s.disciplineInterests,
      })),
      registrations,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        grouping: c.grouping,
      })),
    });
  } catch (error: any) {
    console.error("Dashboard fetch error:", error?.message || error);
    console.error("Error details:", {
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack?.split('\n')[0],
    });
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

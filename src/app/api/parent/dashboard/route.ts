/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get parent profile
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: {
        students: {
          include: {
            registrations: {
              include: {
                competitionCategory: {
                  include: {
                    competition: true,
                    category: true,
                  },
                },
                certificate: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
    }

    // Flatten registrations for easy rendering
    const registrations: any[] = [];
    parent.students.forEach((student) => {
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
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      parent: {
        name: parent.name,
        phone: parent.phone,
        address: parent.address,
        city: parent.city,
        state: parent.state,
        preferredState: parent.preferredState || parent.state,
        postalCode: parent.postalCode,
        country: parent.country,
      },
      students: parent.students.map((s) => ({
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

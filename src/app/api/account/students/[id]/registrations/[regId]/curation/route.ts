import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; regId: string }> }
) {
  const session = await getEdgeSession(request);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: studentId, regId: registrationId } = await params;

  // Verify ownership: parent owns the student
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      parent: {
        select: {
          user: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!student || student.parent.user.id !== (session.user as any).id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { isFeatured, isHidden } = body;

  // If setting isFeatured to true, check max 3 limit
  if (isFeatured === true) {
    const featuredCount = await prisma.registration.count({
      where: {
        studentId,
        isFeatured: true,
      },
    });

    if (featuredCount >= 3) {
      return NextResponse.json(
        { error: "Maximum 3 featured selections allowed" },
        { status: 400 }
      );
    }
  }

  // Update registration
  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      ...(isFeatured !== undefined && { isFeatured }),
      ...(isHidden !== undefined && { isHidden }),
    },
    select: {
      id: true,
      isFeatured: true,
      isHidden: true,
    },
  });

  return NextResponse.json(updated);
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Prisma, ShipmentStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customUser = session.user as { role?: string };
    if (customUser.role !== "SUPER_ADMIN" && customUser.role !== "MODERATOR") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id: competitionId } = await params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const statusFilter = url.searchParams.get("status") || "ALL";

    const skip = (page - 1) * limit;

    // Map UI status to database status
    const statusMap: Record<string, ShipmentStatus | undefined> = {
      PENDING: "PENDING",
      LABEL_GENERATED: "LABEL_GENERATED",
      PICKED_UP: "PICKUP_SCHEDULED",
      IN_TRANSIT: "IN_TRANSIT",
      DELIVERED: "DELIVERED",
    };

    // Build filter conditions for PhysicalPrizeOrder
    const where: Prisma.PhysicalPrizeOrderWhereInput = {
      prizeAward: {
        registration: {
          competitionCategory: { competitionId },
        },
      },
    };

    if (statusFilter !== "ALL" && statusMap[statusFilter]) {
      where.status = statusMap[statusFilter]!;
    }

    // Fetch total count
    const totalCount = await prisma.physicalPrizeOrder.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch shipments
    const shipments = await prisma.physicalPrizeOrder.findMany({
      where,
      select: {
        id: true,
        prizeAward: {
          select: {
            registration: {
              select: {
                registrationId: true,
                student: { select: { name: true } },
              },
            },
          },
        },
        awbNumber: true,
        status: true,
        courierName: true,
        shiprocketLabelUrl: true,
        estimatedDelivery: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Map database status to UI status
    const reverseStatusMap: Record<ShipmentStatus, string> = {
      PENDING: "PENDING",
      LABEL_GENERATED: "LABEL_GENERATED",
      PICKUP_SCHEDULED: "PICKED_UP",
      IN_TRANSIT: "IN_TRANSIT",
      OUT_FOR_DELIVERY: "IN_TRANSIT",
      DELIVERED: "DELIVERED",
      DELIVERY_FAILED: "DELIVERED",
      RETURNED: "DELIVERED",
    };

    return NextResponse.json({
      data: shipments.map((ship) => ({
        id: ship.id,
        registrationId: ship.prizeAward.registration.registrationId,
        studentName: ship.prizeAward.registration.student.name,
        shipmentId: ship.awbNumber,
        status: reverseStatusMap[ship.status] || ship.status,
        carrier: ship.courierName,
        trackingUrl: ship.shiprocketLabelUrl,
        estimatedDelivery: ship.estimatedDelivery?.toISOString() || null,
      })),
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error("Failed to fetch shipments:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

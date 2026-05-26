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

    // Build filter conditions for PhysicalPrizeOrder
    const where: Prisma.PhysicalPrizeOrderWhereInput = {
      prizeAward: {
        registration: {
          competitionCategory: { competitionId },
        },
      },
    };

    if (statusFilter !== "ALL") {
      const validStatuses: ShipmentStatus[] = [
        "PENDING",
        "LABEL_GENERATED",
        "PICKUP_SCHEDULED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "DELIVERY_FAILED",
        "RETURNED",
      ];
      if (validStatuses.includes(statusFilter as ShipmentStatus)) {
        where.status = statusFilter as ShipmentStatus;
      }
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

    return NextResponse.json({
      data: shipments.map((ship) => ({
        id: ship.id,
        registrationId: ship.prizeAward.registration.registrationId,
        studentName: ship.prizeAward.registration.student.name,
        shipmentId: ship.awbNumber,
        status: ship.status,
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

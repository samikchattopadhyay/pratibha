import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
  _: NextRequest,
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

    // Find all PENDING shipments for this competition
    const pendingShipments = await prisma.physicalPrizeOrder.findMany({
      where: {
        prizeAward: {
          registration: {
            competitionCategory: { competitionId },
          },
        },
        status: "PENDING",
      },
      select: { id: true },
    });

    let createdCount = 0;

    // Create labels for each pending shipment
    for (const shipment of pendingShipments) {
      try {
        // Generate tracking number (in real implementation, call shipping API)
        const awbNumber = `AWB-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

        await prisma.physicalPrizeOrder.update({
          where: { id: shipment.id },
          data: {
            status: "LABEL_GENERATED",
            awbNumber,
            shiprocketLabelUrl: `https://tracking.fedex.com/tracking/${awbNumber}`,
            labelGeneratedAt: new Date(),
          },
        });

        createdCount++;
      } catch (err) {
        console.error(`Failed to create label for shipment ${shipment.id}:`, err);
      }
    }

    return NextResponse.json({
      message: `Created shipping labels for ${createdCount} shipments`,
      createdCount,
      totalPending: pendingShipments.length,
    });
  } catch (err) {
    console.error("Failed to create shipping labels:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getEdgeSession(request);
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

    // Parse body for selective fulfillment
    let carrier = "SHIPROCKET";
    let shipmentIds: string[] | undefined = undefined;

    try {
      const body = await request.json();
      if (body.carrier) carrier = body.carrier;
      if (Array.isArray(body.shipmentIds)) shipmentIds = body.shipmentIds;
    } catch {
      // Body might be empty, default to bulk all
    }

    // Build query conditions
    const whereCondition: any = {
      prizeAward: {
        registration: {
          competitionCategory: { competitionId },
        },
      },
      status: "PENDING",
    };

    if (shipmentIds) {
      whereCondition.id = { in: shipmentIds };
    }

    // Find pending shipments
    const pendingShipments = await prisma.physicalPrizeOrder.findMany({
      where: whereCondition,
      select: {
        id: true,
        packageSKU: true,
      },
    });

    let createdCount = 0;

    // Package dimensions mapping based on SKU
    const packageSpecs: Record<
      string,
      { weight: number; length: number; width: number; height: number }
    > = {
      TROPHY_LARGE: { weight: 1200, length: 30, width: 20, height: 15 },
      TROPHY_MEDIUM: { weight: 800, length: 25, width: 15, height: 12 },
      MEDAL_CERTIFICATE: { weight: 250, length: 32, width: 24, height: 3 },
      CERTIFICATE_ONLY: { weight: 80, length: 32, width: 24, height: 1 },
      MEDAL_ONLY: { weight: 150, length: 10, width: 10, height: 5 },
    };

    // Create labels for each pending shipment
    for (const shipment of pendingShipments) {
      try {
        const sku = shipment.packageSKU || "MEDAL_CERTIFICATE";
        const specs = packageSpecs[sku] || packageSpecs.MEDAL_CERTIFICATE;

        // Generate carrier-specific AWB and tracking details
        let awbNumber = "";
        let trackingUrl = "";
        let courierName = "";
        const etaDays = carrier === "INDIAPOST" ? 7 : carrier === "DELHIVERY" ? 3 : 4;
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + etaDays);

        const randDigits = () => Math.floor(100000000 + Math.random() * 900000000).toString();

        if (carrier === "INDIAPOST") {
          awbNumber = `PP${randDigits()}IN`;
          trackingUrl = `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?conNo=${awbNumber}`;
          courierName = "India Post (Speed Post)";
        } else if (carrier === "DELHIVERY") {
          awbNumber = `DEL${randDigits()}${Math.floor(Math.random() * 10)}`;
          trackingUrl = `https://www.delhivery.com/track/share?ids=${awbNumber}`;
          courierName = "Delhivery";
        } else {
          // Default to Shiprocket
          awbNumber = `SR${randDigits()}${Math.floor(Math.random() * 10)}`;
          trackingUrl = `https://tracking.shiprocket.co/tracking/${awbNumber}`;
          courierName = "Shiprocket (Blue Dart)";
        }

        // Update shipment details including physical metrics and carrier routing
        await prisma.physicalPrizeOrder.update({
          where: { id: shipment.id },
          data: {
            status: "LABEL_GENERATED",
            awbNumber,
            shiprocketLabelUrl: trackingUrl,
            courierName,
            estimatedDelivery,
            weightGrams: specs.weight,
            lengthCm: specs.length,
            widthCm: specs.width,
            heightCm: specs.height,
            labelGeneratedAt: new Date(),
          },
        });

        createdCount++;
      } catch (err) {
        console.error(`Failed to create label for shipment ${shipment.id}:`, err);
      }
    }

    return NextResponse.json({
      message: `Created shipping labels for ${createdCount} shipments via ${carrier}`,
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


import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getPhysicalPrizeOrderStatusCounts,
  getRecentShipmentBatches,
  getRecentPhysicalPrizeOrders,
  getPhysicalPrizeAwardsForCompetition,
  createPhysicalPrizeOrders,
} from "@/lib/db/queries";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

const PACKAGE_SPECS: Record<string, { sku: string; weightGrams: number; lengthCm: number; widthCm: number; heightCm: number }> = {
  FIRST_PLACE: { sku: "TROPHY_LARGE", weightGrams: 2000, lengthCm: 30, widthCm: 20, heightCm: 20 },
  SECOND_PLACE: { sku: "TROPHY_MEDIUM", weightGrams: 1000, lengthCm: 20, widthCm: 15, heightCm: 15 },
  THIRD_PLACE: { sku: "MEDAL_CERTIFICATE", weightGrams: 500, lengthCm: 25, widthCm: 20, heightCm: 5 },
  MERIT_1: { sku: "MEDAL_ONLY", weightGrams: 300, lengthCm: 15, widthCm: 10, heightCm: 3 },
  MERIT_2: { sku: "MEDAL_ONLY", weightGrams: 300, lengthCm: 15, widthCm: 10, heightCm: 3 },
  MERIT_3: { sku: "CERTIFICATE_ONLY", weightGrams: 200, lengthCm: 35, widthCm: 25, heightCm: 1 },
  SPECIAL_MENTION: { sku: "CERTIFICATE_ONLY", weightGrams: 200, lengthCm: 35, widthCm: 25, heightCm: 1 },
  PEOPLES_CHOICE: { sku: "MEDAL_CERTIFICATE", weightGrams: 500, lengthCm: 25, widthCm: 20, heightCm: 5 },
  PARTICIPATION: { sku: "CERTIFICATE_ONLY", weightGrams: 200, lengthCm: 35, widthCm: 25, heightCm: 1 },
};

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [statusCounts, batches, recentOrders] = await Promise.all([
      getPhysicalPrizeOrderStatusCounts(),
      getRecentShipmentBatches(10),
      getRecentPhysicalPrizeOrders(50),
    ]);

    const counts: Record<string, number> = {};
    statusCounts.forEach((s: any) => {
      counts[s.status] = s.count;
    });

    const orders = recentOrders.map((o: any) => ({
      id: o.id,
      studentName: o.prizeAward.registration.student.name,
      prizeTitle: o.prizeAward.prizeItem.title,
      rank: o.prizeAward.rank,
      recipientCity: o.recipientCity,
      recipientState: o.recipientState,
      status: o.status,
      awbNumber: o.awbNumber,
      courierName: o.courierName,
      estimatedDelivery: o.estimatedDelivery,
      dispatchedAt: o.dispatchedAt,
      deliveredAt: o.deliveredAt,
      packageSKU: o.packageSKU,
      batchId: o.batchId,
    }));

    return NextResponse.json({
      metrics: {
        pending: counts["PENDING"] ?? 0,
        labelGenerated: counts["LABEL_GENERATED"] ?? 0,
        pickupScheduled: counts["PICKUP_SCHEDULED"] ?? 0,
        inTransit: counts["IN_TRANSIT"] ?? 0,
        outForDelivery: counts["OUT_FOR_DELIVERY"] ?? 0,
        delivered: counts["DELIVERED"] ?? 0,
        failed: counts["DELIVERY_FAILED"] ?? 0,
        returned: counts["RETURNED"] ?? 0,
      },
      batches: batches.map((b: any) => ({
        id: b.id,
        batchNumber: b.batchNumber,
        description: b.description,
        totalOrders: b.totalOrders,
        processedAt: b.processedAt,
        manifestUrl: b.manifestUrl,
      })),
      orders,
    });
  } catch (error) {
    console.error("Courier GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { competitionId } = body;
    if (!competitionId) return NextResponse.json({ error: "competitionId is required" }, { status: 400 });

    const allAwards = await getPhysicalPrizeAwardsForCompetition(competitionId);

    if (allAwards.length === 0) {
      return NextResponse.json({ message: "No pending physical prize orders to generate for this competition" });
    }

    const ordersData = [];
    const incompleteAddresses = [];

    for (const award of allAwards) {
      const parent = award.registration.student.parent;

      if (!parent.address || !parent.city || !parent.state || !parent.postalCode) {
        incompleteAddresses.push({
          studentName: award.registration.student.name,
          parentName: parent.name,
          parentId: parent.id,
        });
        continue;
      }

      const spec = PACKAGE_SPECS[award.rank] ?? PACKAGE_SPECS.PARTICIPATION;
      ordersData.push({
        prizeAwardId: award.id,
        recipientName: parent.name,
        recipientPhone: parent.phone,
        recipientAddress: parent.address,
        recipientCity: parent.city,
        recipientState: parent.state,
        recipientPostalCode: parent.postalCode,
        recipientCountry: parent.country,
        packageSKU: spec.sku,
        weightGrams: spec.weightGrams,
        lengthCm: spec.lengthCm,
        widthCm: spec.widthCm,
        heightCm: spec.heightCm,
        status: "PENDING",
      });
    }

    if (ordersData.length > 0) {
      await createPhysicalPrizeOrders(ordersData);
    }

    return NextResponse.json({
      message: `${ordersData.length} physical prize orders created`,
      ordersCreated: ordersData.length,
      incompleteAddresses: incompleteAddresses.length > 0 ? incompleteAddresses : undefined,
      warning: incompleteAddresses.length > 0 ? `${incompleteAddresses.length} parents have incomplete addresses and cannot receive physical prizes yet` : undefined,
    });
  } catch (error) {
    console.error("Courier POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

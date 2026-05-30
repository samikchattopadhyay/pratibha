import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getPrizePoolWithItems,
  publishPrizePool,
} from "@/lib/db/queries";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { prizePoolId } = body;

    if (!prizePoolId) return NextResponse.json({ error: "prizePoolId is required" }, { status: 400 });

    const pool = await getPrizePoolWithItems(prizePoolId);

    if (!pool) return NextResponse.json({ error: "Prize pool not found" }, { status: 404 });
    if (pool.isPublished) return NextResponse.json({ error: "Prize pool is already published" }, { status: 409 });

    const ranks = pool.items.map((i: any) => i.rank);
    if (!ranks.includes("FIRST_PLACE")) {
      return NextResponse.json({ error: "Prize pool must include a FIRST_PLACE prize before publishing" }, { status: 400 });
    }
    if (!ranks.includes("PARTICIPATION")) {
      return NextResponse.json({ error: "Prize pool must include a PARTICIPATION prize before publishing" }, { status: 400 });
    }

    const updated = await publishPrizePool(prizePoolId);

    return NextResponse.json({ message: "Prize pool published successfully", prizePoolId: updated.id });
  } catch (error) {
    console.error("Prize pool publish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

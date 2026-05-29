import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import * as schema from "@/lib/db/schema";
import {
  getCompetitionJudges,
  createCompetitionJudge,
  deleteCompetitionJudge,
} from "@/lib/db/queries";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const competitionId = params.id;

    const competition = await db.query.competitions.findFirst({
      where: eq(schema.competitions.id, competitionId),
      columns: { id: true },
    });

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    const judges = await getCompetitionJudges(competitionId);

    return NextResponse.json({ judges });
  } catch (error) {
    console.error("Get competition judges error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const competitionId = params.id;
    const { judgeId } = await request.json();

    if (!judgeId) {
      return NextResponse.json({ error: "Judge ID is required" }, { status: 400 });
    }

    const competition = await db.query.competitions.findFirst({
      where: eq(schema.competitions.id, competitionId),
      columns: { id: true },
    });

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    const judge = await db.query.judges.findFirst({
      where: eq(schema.judges.id, judgeId),
      columns: { id: true },
    });

    if (!judge) {
      return NextResponse.json({ error: "Judge not found" }, { status: 404 });
    }

    const judgeData = await createCompetitionJudge(competitionId, judgeId);

    return NextResponse.json({
      message: "Judge assigned successfully",
      judge: judgeData,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already assigned")) {
      return NextResponse.json({ error: "Judge already assigned to this competition" }, { status: 409 });
    }
    console.error("Assign judge to competition error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const competitionId = params.id;
    const { judgeId } = await request.json();

    if (!judgeId) {
      return NextResponse.json({ error: "Judge ID is required" }, { status: 400 });
    }

    await deleteCompetitionJudge(competitionId, judgeId);

    return NextResponse.json({ message: "Judge removed successfully" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not assigned")) {
      return NextResponse.json({ error: "Judge not assigned to this competition" }, { status: 404 });
    }
    console.error("Remove judge from competition error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

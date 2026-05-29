import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

function requireAdmin(role: string) {
  return ADMIN_ROLES.includes(role);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!requireAdmin(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const competitionId = params.id;

    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { id: true },
    });

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    const assignedJudges = await prisma.competitionJudge.findMany({
      where: { competitionId },
      include: {
        judge: {
          select: {
            id: true,
            name: true,
            tier: true,
            specializations: true,
            profileImageUrl: true,
            isVerified: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    const formatted = assignedJudges.map((cj) => ({
      id: cj.judge.id,
      name: cj.judge.name,
      tier: cj.judge.tier,
      specializations: cj.judge.specializations,
      profileImageUrl: cj.judge.profileImageUrl,
      isVerified: cj.judge.isVerified,
      assignedAt: cj.assignedAt,
    }));

    return NextResponse.json({ judges: formatted });
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
    if (!requireAdmin(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const competitionId = params.id;
    const { judgeId } = await request.json();

    if (!judgeId) {
      return NextResponse.json({ error: "Judge ID is required" }, { status: 400 });
    }

    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { id: true },
    });

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
      select: { id: true },
    });

    if (!judge) {
      return NextResponse.json({ error: "Judge not found" }, { status: 404 });
    }

    const existing = await prisma.competitionJudge.findUnique({
      where: { competitionId_judgeId: { competitionId, judgeId } },
    });

    if (existing) {
      return NextResponse.json({ error: "Judge already assigned to this competition" }, { status: 409 });
    }

    const assignment = await prisma.competitionJudge.create({
      data: {
        competitionId,
        judgeId,
      },
      include: {
        judge: {
          select: {
            id: true,
            name: true,
            tier: true,
            specializations: true,
            profileImageUrl: true,
            isVerified: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Judge assigned successfully",
      judge: {
        id: assignment.judge.id,
        name: assignment.judge.name,
        tier: assignment.judge.tier,
        isVerified: assignment.judge.isVerified,
      },
    });
  } catch (error) {
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
    if (!requireAdmin(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const competitionId = params.id;
    const { judgeId } = await request.json();

    if (!judgeId) {
      return NextResponse.json({ error: "Judge ID is required" }, { status: 400 });
    }

    const assignment = await prisma.competitionJudge.findUnique({
      where: { competitionId_judgeId: { competitionId, judgeId } },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Judge not assigned to this competition" }, { status: 404 });
    }

    await prisma.competitionJudge.delete({
      where: { id: assignment.id },
    });

    return NextResponse.json({ message: "Judge removed successfully" });
  } catch (error) {
    console.error("Remove judge from competition error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

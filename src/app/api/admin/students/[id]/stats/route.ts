import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { getStudentWithRegistrationsForStats } from "@/lib/db/queries";
import type { StudentStats } from "@/types/student-details";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const { id } = await params;

    const student = await getStudentWithRegistrationsForStats(id);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const registrations = student.registrations;
    const totalCompetitions = registrations.length;
    const totalAwards = registrations.filter((reg: any) => reg.prizeAward).length;

    const verifiedCount = registrations.filter(
      (reg: any) => reg.status === "VERIFIED"
    ).length;
    const successRate = totalCompetitions > 0 ? (verifiedCount / totalCompetitions) * 100 : 0;

    const scoresArray = registrations
      .filter((reg: any) => {
        const firstScore = reg.judgeAssignments?.[0]?.score;
        return firstScore && reg.scoringFinalized;
      })
      .map((reg: any) => {
        const firstScore = reg.judgeAssignments?.[0]?.score;
        return firstScore ? parseFloat(String(firstScore.totalScore)) : 0;
      });

    const averageScore = scoresArray.length > 0
      ? scoresArray.reduce((a: number, b: number) => a + b, 0) / scoresArray.length
      : null;

    const categories = Array.from(
      new Set(
        registrations.map((reg: any) => reg.competitionCategory.category.name)
      )
    ) as string[];

    const ranks = registrations
      .filter((reg: any) => reg.finalRank !== null && reg.finalRank !== undefined)
      .map((reg: any) => reg.finalRank as number);

    const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;

    const stats: StudentStats = {
      totalCompetitions,
      totalAwards,
      successRate: Math.round(successRate * 100) / 100,
      averageScore: averageScore ? Math.round(averageScore * 100) / 100 : null,
      categories,
      bestRank,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Student stats fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getEdgeSession(req);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { assignmentId, criteria1, criteria2, criteria3, criteria4, remarks } = body;

    if (!assignmentId || criteria1 === undefined || criteria2 === undefined || criteria3 === undefined) {
      return NextResponse.json({ error: "Required scoring details are missing" }, { status: 400 });
    }

    const c1 = Number(criteria1);
    const c2 = Number(criteria2);
    const c3 = Number(criteria3);

    // Verify assignment exists and get the competition scope
    const assignment = await prisma.judgeAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        registration: {
          include: {
            competitionCategory: {
              include: {
                competition: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assigned queue entry not found" }, { status: 404 });
    }

    if (assignment.isSubmitted) {
      return NextResponse.json({ error: "This entry has already been graded and finalized" }, { status: 400 });
    }

    const scope = assignment.registration.competitionCategory.competition.scope; // STATE or NATIONAL

    // Validate boundaries based on scope
    if (scope === "NATIONAL") {
      if (criteria4 === undefined) {
        return NextResponse.json({ error: "Originality/Innovation score (criteria4) is required for national competitions" }, { status: 400 });
      }
      const c4 = Number(criteria4);
      if (c4 < 0 || c4 > 10) {
        return NextResponse.json({ error: "Originality/Innovation score must be between 0 and 10" }, { status: 400 });
      }
      if (c1 < 0 || c1 > 40) {
        return NextResponse.json({ error: "Technique/Skill score must be between 0 and 40" }, { status: 400 });
      }
      if (c2 < 0 || c2 > 25) {
        return NextResponse.json({ error: "Expression/Presentation score must be between 0 and 25 for national competitions" }, { status: 400 });
      }
      if (c3 < 0 || c3 > 25) {
        return NextResponse.json({ error: "Rhythm/Composition score must be between 0 and 25 for national competitions" }, { status: 400 });
      }
    } else {
      // STATE level
      if (c1 < 0 || c1 > 40) {
        return NextResponse.json({ error: "Technique/Skill score must be between 0 and 40" }, { status: 400 });
      }
      if (c2 < 0 || c2 > 30) {
        return NextResponse.json({ error: "Expression/Presentation score must be between 0 and 30" }, { status: 400 });
      }
      if (c3 < 0 || c3 > 30) {
        return NextResponse.json({ error: "Rhythm/Composition score must be between 0 and 30" }, { status: 400 });
      }
    }

    const c4 = scope === "NATIONAL" ? Number(criteria4) : 0;
    const totalScore = c1 + c2 + c3 + c4;

    // Database transaction to write score and flag assignment
    await prisma.$transaction(async (tx) => {
      await tx.score.create({
        data: {
          judgeAssignmentId: assignmentId,
          criteria1: c1,
          criteria2: c2,
          criteria3: c3,
          criteria4: scope === "NATIONAL" ? c4 : null,
          totalScore,
          remarks,
        },
      });

      await tx.judgeAssignment.update({
        where: { id: assignmentId },
        data: {
          isSubmitted: true,
          submittedAt: new Date(),
        },
      });

      // Recalculate average score given and total evaluations count for the judge
      const submittedAssignments = await tx.judgeAssignment.findMany({
        where: { judgeId: assignment.judgeId, isSubmitted: true },
        include: { score: true },
      });

      // Sum existing submitted scores
      const totalScoreSum = submittedAssignments.reduce((sum, asg) => sum + (asg.score?.totalScore || 0), 0);
      
      // Calculate new average including this current score
      const finalCount = submittedAssignments.length + 1;
      const finalSum = totalScoreSum + totalScore;
      const averageScoreGiven = Number((finalSum / finalCount).toFixed(2));

      await tx.judge.update({
        where: { id: assignment.judgeId },
        data: {
          totalEvaluations: finalCount,
          averageScoreGiven,
        },
      });
    });

    return NextResponse.json({ message: "Grading finalized successfully", totalScore });
  } catch (error) {
    console.error("Score submission error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

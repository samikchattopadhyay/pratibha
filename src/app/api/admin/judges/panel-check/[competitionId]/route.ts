import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { getCompetitionPanelData } from "@/lib/db/queries";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  try {
    const session = await getEdgeSession(_request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { competitionId } = await params;

    const competition = await getCompetitionPanelData(competitionId);

    if (!competition) return NextResponse.json({ error: "Competition not found" }, { status: 404 });

    const judgeMap = new Map<string, { id: string; name: string; tier: string; conflictFlagged: boolean }>();
    for (const cat of competition.categories) {
      for (const reg of cat.registrations) {
        for (const assignment of reg.judgeAssignments) {
          if (!judgeMap.has(assignment.judgeId)) {
            judgeMap.set(assignment.judgeId, {
              id: assignment.judgeId,
              name: assignment.judge.name,
              tier: assignment.judge.tier,
              conflictFlagged: assignment.conflictFlagged,
            });
          }
        }
      }
    }

    const assignedJudges = Array.from(judgeMap.values());

    const currentCount = assignedJudges.length;
    const minRequired = competition.minJudgesRequired;
    const minNational = 0;
    const nationalTierCount = assignedJudges.filter((j) => j.tier === "NATIONAL" || j.tier === "EXPERT").length;
    const conflictedCount = assignedJudges.filter((j) => j.conflictFlagged).length;

    const issues: string[] = [];
    if (currentCount < minRequired) issues.push(`Need ${minRequired - currentCount} more judge(s) — currently have ${currentCount}`);
    if (nationalTierCount < minNational) issues.push(`Need ${minNational - nationalTierCount} more NATIONAL/EXPERT tier judge(s)`);
    if (conflictedCount > 0) issues.push(`${conflictedCount} potential conflict(s) flagged — review before finalizing`);

    return NextResponse.json({
      competitionId,
      competitionTitle: competition.title,
      scope: competition.scope,
      currentJudges: currentCount,
      minRequired,
      nationalTierCount,
      minNationalRequired: minNational,
      conflictedCount,
      isPanelAdequate: issues.length === 0,
      issues,
      judges: assignedJudges,
    });
  } catch (error) {
    console.error("Panel check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

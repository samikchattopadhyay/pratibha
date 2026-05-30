import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { db } from "@/lib/db/drizzle";
import {
  getAllJudgesWithUserAndAssignments,
  getAllScores,
  getUserByEmail,
  getJudgeById,
  getJudgeWithUserAndAssignments,
} from "@/lib/db/queries";
import * as schema from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { sendEmailJudgeWelcome } from "@/lib/notifications";
import { generateSecurePassword } from "@/lib/passwordGenerator";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];
const JUDGE_TIERS = ["LOCAL", "REGIONAL", "NATIONAL", "EXPERT"];

export async function GET(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const emailToCheck = searchParams.get("email");

    if (emailToCheck) {
      const existingUser = await getUserByEmail(emailToCheck);
      return NextResponse.json({ exists: !!existingUser });
    }

    const tierFilter = searchParams.get("tier");
    const competitionId = searchParams.get("competitionId");
    const verifiedOnly = searchParams.get("verified") === "true";

    let eligibleTiers: string[] | undefined;
    let competitionScope: string | null = null;
    let competitionStateList: string[] = [];

    if (competitionId) {
      const comp = await db.query.competitions.findFirst({
        where: eq(schema.competitions.id, competitionId),
        columns: { scope: true, eligibleStates: true },
      });
      if (comp) {
        competitionScope = comp.scope;
        competitionStateList = comp.eligibleStates;
        if (comp.scope === "NATIONAL") {
          eligibleTiers = ["REGIONAL", "NATIONAL", "EXPERT"];
        }
      }
    }

    let judges = await getAllJudgesWithUserAndAssignments();

    judges = judges.filter((j: any) => {
      if (tierFilter && j.tier !== tierFilter) return false;
      if (eligibleTiers && !eligibleTiers.includes(j.tier)) return false;
      if (verifiedOnly && !j.isVerified) return false;
      if (!j.isAvailable) return false;
      return true;
    });

    const allScores = await getAllScores();
    const globalAvg =
      allScores.length > 0
        ? allScores.reduce((acc: number, curr: any) => acc + parseFloat(curr.totalScore.toString()), 0) / allScores.length
        : 75;

    const enriched = judges.map((j: any) => {
      const submitted = j.assignments.filter((a: any) => a.isSubmitted);
      const pending = j.assignments.length - submitted.length;
      const scoreValues = submitted
        .map((a: any) => a.score?.totalScore)
        .filter((s: any) => s != null)
        .map((s: any) => parseFloat(s!.toString()));
      const avgScoreVal = scoreValues.length > 0 ? scoreValues.reduce((a: number, b: number) => a + b, 0) / scoreValues.length : 0;
      const deviationPct = globalAvg > 0 ? ((avgScoreVal - globalAvg) / globalAvg) * 100 : 0;
      const isOutlier = Math.abs(deviationPct) > 15 && scoreValues.length >= 3;

      let hasConflict = false;
      let conflictReason = "";
      if (competitionScope === "STATE" && j.stateOfResidence && competitionStateList.includes(j.stateOfResidence)) {
        hasConflict = true;
        conflictReason = `Judge resides in ${j.stateOfResidence}, which is in this competition's eligible states`;
      }

      return {
        id: j.id,
        name: j.name,
        email: j.user.email,
        specializations: j.specializations,
        profileImageUrl: j.profileImageUrl,
        tier: j.tier,
        bio: j.bio,
        credentials: j.credentials,
        stateOfResidence: j.stateOfResidence,
        states: j.states || [],
        languages: j.languages || [],
        yearsOfExperience: j.yearsOfExperience,
        isVerified: j.isVerified,
        isAvailable: j.isAvailable,
        evaluationCount: submitted.length,
        pendingCount: pending,
        averageScore: avgScoreVal > 0 ? avgScoreVal.toFixed(1) : "N/A",
        isOutlier,
        deviationPercentage: deviationPct.toFixed(1),
        hasConflict,
        conflictReason,
      };
    });

    return NextResponse.json({ judges: enriched });
  } catch (error) {
    console.error("Admin judges fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const {
      name,
      email,
      tier = "LOCAL",
      specializations = [],
      bio = "",
      credentials = "",
      stateOfResidence = "",
      states = [],
      languages = [],
      yearsOfExperience = null,
      isVerified = false,
      isAvailable = true,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    if (!JUDGE_TIERS.includes(tier)) {
      return NextResponse.json({ error: "Invalid judge tier" }, { status: 400 });
    }

    const internalPassword = generateSecurePassword();
    const passwordHash = await bcrypt.hash(internalPassword, 10);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";

    const result = await db.transaction(async (tx: any) => {
      const userResult = await tx
        .insert(schema.users)
        .values({
          email,
          passwordHash,
          role: "JUDGE",
        })
        .returning();

      const user = userResult[0];

      const judgeResult = await tx
        .insert(schema.judges)
        .values({
          userId: user.id,
          name,
          tier,
          specializations,
          bio,
          credentials,
          stateOfResidence,
          states,
          languages,
          yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience.toString(), 10) : null,
          isVerified,
          isAvailable,
        })
        .returning();

      const judge = judgeResult[0];

      const setupToken = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      await tx.insert(schema.passwordSetupTokens).values({
        userId: user.id,
        token: setupToken,
        expiresAt,
      });

      const setupUrl = `${appUrl}/judge-setup/${setupToken}`;

      return { user, judge, setupUrl };
    });

    try {
      await sendEmailJudgeWelcome(email, name, result.setupUrl);
    } catch (mailError) {
      console.error("Resilient notification: Failed to send judge welcome email:", mailError);
    }

    return NextResponse.json({ message: "Judge created successfully and invitation email sent", judge: result.judge }, { status: 201 });
  } catch (error) {
    console.error("Admin judge create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const {
      id,
      name,
      email,
      password,
      tier,
      specializations,
      bio,
      credentials,
      stateOfResidence,
      states,
      languages,
      yearsOfExperience,
      isVerified,
      isAvailable,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Judge ID is required" }, { status: 400 });
    }

    const judge = await getJudgeWithUserAndAssignments(id);

    if (!judge) {
      return NextResponse.json({ error: "Judge not found" }, { status: 404 });
    }

    if (email && email !== judge.user.email) {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
      }
    }

    if (tier && !JUDGE_TIERS.includes(tier)) {
      return NextResponse.json({ error: "Invalid judge tier" }, { status: 400 });
    }

    const updated = await db.transaction(async (tx: any) => {
      const userUpdateData: any = {};
      if (email) userUpdateData.email = email;
      if (password) {
        userUpdateData.passwordHash = await bcrypt.hash(password, 10);
      }

      if (Object.keys(userUpdateData).length > 0) {
        await tx
          .update(schema.users)
          .set(userUpdateData)
          .where(eq(schema.users.id, judge.userId));
      }

      const judgeUpdateData: any = {};
      if (name !== undefined) judgeUpdateData.name = name;
      if (tier !== undefined) judgeUpdateData.tier = tier;
      if (specializations !== undefined) judgeUpdateData.specializations = specializations;
      if (bio !== undefined) judgeUpdateData.bio = bio;
      if (credentials !== undefined) judgeUpdateData.credentials = credentials;
      if (stateOfResidence !== undefined) judgeUpdateData.stateOfResidence = stateOfResidence;
      if (states !== undefined) judgeUpdateData.states = states;
      if (languages !== undefined) judgeUpdateData.languages = languages;
      if (yearsOfExperience !== undefined) {
        judgeUpdateData.yearsOfExperience = yearsOfExperience ? parseInt(yearsOfExperience.toString(), 10) : null;
      }
      if (isVerified !== undefined) judgeUpdateData.isVerified = isVerified;
      if (isAvailable !== undefined) judgeUpdateData.isAvailable = isAvailable;

      const updatedResult = await tx
        .update(schema.judges)
        .set(judgeUpdateData)
        .where(eq(schema.judges.id, id))
        .returning();

      return updatedResult[0];
    });

    return NextResponse.json({ message: "Judge updated successfully", judge: updated });
  } catch (error) {
    console.error("Admin judge update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


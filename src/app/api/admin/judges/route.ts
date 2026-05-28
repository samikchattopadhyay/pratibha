import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { JudgeTier } from "@prisma/client";
import { sendEmailJudgeWelcome } from "@/lib/notifications";
import { generateSecurePassword } from "@/lib/passwordGenerator";
import { randomBytes } from "crypto";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

export async function GET(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const emailToCheck = searchParams.get("email");

    // Check if email exists
    if (emailToCheck) {
      const existingUser = await prisma.user.findUnique({
        where: { email: emailToCheck },
      });
      return NextResponse.json({ exists: !!existingUser });
    }

    const tierFilter = searchParams.get("tier"); // LOCAL | REGIONAL | NATIONAL | EXPERT
    const competitionId = searchParams.get("competitionId"); // returns eligible judges only
    const verifiedOnly = searchParams.get("verified") === "true";

    // If competitionId given, find competition scope to determine eligible tiers
    let eligibleTiers: string[] | undefined;
    let competitionScope: string | null = null;
    let competitionStateList: string[] = [];

    if (competitionId) {
      const comp = await prisma.competition.findUnique({
        where: { id: competitionId },
        select: { scope: true, eligibleStates: true },
      });
      if (comp) {
        competitionScope = comp.scope;
        competitionStateList = comp.eligibleStates;
        // Plan 03: NATIONAL competitions require REGIONAL, NATIONAL, or EXPERT
        if (comp.scope === "NATIONAL") {
          eligibleTiers = ["REGIONAL", "NATIONAL", "EXPERT"];
        }
      }
    }

    const judges = await prisma.judge.findMany({
      where: {
        ...(tierFilter ? { tier: tierFilter as JudgeTier } : {}),
        ...(eligibleTiers ? { tier: { in: eligibleTiers as JudgeTier[] } } : {}),
        ...(verifiedOnly ? { isVerified: true } : {}),
        isAvailable: true,
      },
      include: {
        user: true,
        assignments: {
          include: { score: true },
        },
      },
      orderBy: [{ tier: "asc" }, { name: "asc" }],
    });

    const allSubmittedScores = await prisma.score.findMany({ select: { totalScore: true } });
    const globalAvg =
      allSubmittedScores.length > 0
        ? allSubmittedScores.reduce((acc, curr) => acc + curr.totalScore, 0) / allSubmittedScores.length
        : 75;

    const enriched = judges.map((j) => {
      const submitted = j.assignments.filter((a) => a.isSubmitted);
      const pending = j.assignments.length - submitted.length;
      const scores = submitted.map((a) => a.score?.totalScore).filter((s): s is number => s != null);
      const avgScoreVal = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const deviationPct = globalAvg > 0 ? ((avgScoreVal - globalAvg) / globalAvg) * 100 : 0;
      const isOutlier = Math.abs(deviationPct) > 15 && scores.length >= 3;

      // Plan 03 — conflict of interest detection for state competitions
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
        // Plan 03 — new fields
        tier: j.tier,
        bio: j.bio,
        credentials: j.credentials,
        stateOfResidence: j.stateOfResidence,
        states: j.states || [],
        languages: j.languages || [],
        yearsOfExperience: j.yearsOfExperience,
        isVerified: j.isVerified,
        isAvailable: j.isAvailable,
        // Stats
        evaluationCount: submitted.length,
        pendingCount: pending,
        averageScore: avgScoreVal > 0 ? avgScoreVal.toFixed(1) : "N/A",
        isOutlier,
        deviationPercentage: deviationPct.toFixed(1),
        // Conflict
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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    const internalPassword = generateSecurePassword();
    const passwordHash = await bcrypt.hash(internalPassword, 10);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "JUDGE",
        },
      });

      const judge = await tx.judge.create({
        data: {
          userId: user.id,
          name,
          tier: tier as JudgeTier,
          specializations,
          bio,
          credentials,
          stateOfResidence,
          states,
          languages,
          yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience.toString(), 10) : null,
          isVerified,
          isAvailable,
        },
      });

      const setupToken = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      await tx.passwordSetupToken.create({
        data: {
          userId: user.id,
          token: setupToken,
          expiresAt,
        },
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

    const judge = await prisma.judge.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!judge) {
      return NextResponse.json({ error: "Judge not found" }, { status: 404 });
    }

    // Check email uniqueness if modified
    if (email && email !== judge.user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update User details if email or password is provided
      const userUpdateData: { email?: string; passwordHash?: string } = {};
      if (email) userUpdateData.email = email;
      if (password) {
        userUpdateData.passwordHash = await bcrypt.hash(password, 10);
      }

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: judge.userId },
          data: userUpdateData,
        });
      }

      // Update Judge details
      const judgeUpdateData: {
        name?: string;
        tier?: JudgeTier;
        specializations?: string[];
        bio?: string;
        credentials?: string;
        stateOfResidence?: string;
        states?: string[];
        languages?: string[];
        yearsOfExperience?: number | null;
        isVerified?: boolean;
        isAvailable?: boolean;
      } = {};
      if (name !== undefined) judgeUpdateData.name = name;
      if (tier !== undefined) judgeUpdateData.tier = tier as JudgeTier;
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

      const updatedJudge = await tx.judge.update({
        where: { id },
        data: judgeUpdateData,
      });

      return updatedJudge;
    });

    return NextResponse.json({ message: "Judge updated successfully", judge: updated });
  } catch (error) {
    console.error("Admin judge update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


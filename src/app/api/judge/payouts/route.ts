import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getJudgeRate } from "@/lib/constants";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;

    // Get judge profile
    const judge = await prisma.judge.findUnique({
      where: { userId },
      include: {
        assignments: {
          where: { isSubmitted: true },
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
        },
        payouts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!judge) {
      return NextResponse.json({ error: "Judge profile not found" }, { status: 404 });
    }

    // Dynamic calculations
    let totalEarnings = 0;
    judge.assignments.forEach((asg) => {
      const scope = asg.registration.competitionCategory.competition.scope as "STATE" | "NATIONAL";
      const rate = getJudgeRate(judge.tier, scope);
      totalEarnings += rate;
    });

    const totalPaidPayouts = judge.payouts
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingPayoutBalance = Math.max(0, totalEarnings - totalPaidPayouts);

    return NextResponse.json({
      bankAccountDetails: judge.bankAccountDetails || null,
      payouts: judge.payouts,
      financials: {
        totalEarnings,
        totalPaidPayouts,
        pendingPayoutBalance,
      },
    });
  } catch (error) {
    console.error("Judge payouts GET failure:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const body = await req.json();
    const { bankName, accountNum, ifscCode } = body;

    if (!bankName || !accountNum || !ifscCode) {
      return NextResponse.json({ error: "All bank account details are required" }, { status: 400 });
    }

    // Validate IFSC code length
    if (ifscCode.length !== 11) {
      return NextResponse.json({ error: "IFSC code must be exactly 11 characters" }, { status: 400 });
    }

    const judge = await prisma.judge.findUnique({
      where: { userId },
    });

    if (!judge) {
      return NextResponse.json({ error: "Judge profile not found" }, { status: 404 });
    }

    // Save JSON details
    await prisma.judge.update({
      where: { id: judge.id },
      data: {
        bankAccountDetails: {
          bankName,
          accountNum,
          ifscCode,
        },
      },
    });

    return NextResponse.json({ message: "Bank account details saved successfully" });
  } catch (error) {
    console.error("Judge payouts POST failure:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

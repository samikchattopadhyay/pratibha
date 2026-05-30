import { NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getJudgeWithSubmittedAssignmentsAndPayouts,
  getJudgeByUserId,
  updateJudgeBankDetails,
} from "@/lib/db/queries";
import { getJudgeRate } from "@/lib/constants";

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;

    const judge = await getJudgeWithSubmittedAssignmentsAndPayouts(userId!);

    if (!judge) {
      return NextResponse.json({ error: "Judge profile not found" }, { status: 404 });
    }

    let totalEarnings = 0;
    judge.assignments.forEach((asg: any) => {
      const scope = asg.registration.competitionCategory.competition.scope as "STATE" | "NATIONAL";
      const rate = getJudgeRate(judge.tier, scope);
      totalEarnings += rate;
    });

    const totalPaidPayouts = judge.payouts
      .filter((p: any) => p.status === "PAID")
      .reduce((sum: number, p: any) => sum + parseFloat(String(p.amount)), 0);

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
    const session = await getEdgeSession(req);
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

    const judge = await getJudgeByUserId(userId!);

    if (!judge) {
      return NextResponse.json({ error: "Judge profile not found" }, { status: 404 });
    }

    await updateJudgeBankDetails(judge.id, {
      bankName,
      accountNum,
      ifscCode,
    });

    return NextResponse.json({ message: "Bank account details saved successfully" });
  } catch (error) {
    console.error("Judge payouts POST failure:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

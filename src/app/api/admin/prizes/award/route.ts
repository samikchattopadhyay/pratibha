import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getCompetitionWithPrizePoolAndRankedRegistrations,
  checkExistingPrizeAward,
  createPrizeAwardWithCertificate,
} from "@/lib/db/queries";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

function rankToPrizeRank(rank: number): string {
  if (rank === 1) return "FIRST_PLACE";
  if (rank === 2) return "SECOND_PLACE";
  if (rank === 3) return "THIRD_PLACE";
  if (rank === 4) return "MERIT_1";
  if (rank === 5) return "MERIT_2";
  if (rank <= 10) return "MERIT_3";
  return "PARTICIPATION";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { competitionId } = body;

    if (!competitionId) return NextResponse.json({ error: "competitionId is required" }, { status: 400 });

    const competition = await getCompetitionWithPrizePoolAndRankedRegistrations(competitionId);

    if (!competition) return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    if (!competition.prizePool) return NextResponse.json({ error: "No prize pool configured for this competition" }, { status: 400 });
    if (!competition.prizePool.isPublished) return NextResponse.json({ error: "Prize pool must be published before awarding" }, { status: 400 });

    const pool = competition.prizePool;
    const awards: { registrationId: string; prizeItemId: string; rank: string }[] = [];

    const findPrizeItem = (prizeRank: string) =>
      pool.items.find((item: any) => item.rank === prizeRank) ?? pool.items.find((item: any) => item.rank === "PARTICIPATION");

    const allRegistrations = competition.categories.flatMap((cc: any) => cc.registrations);

    for (const reg of allRegistrations) {
      if (!reg.finalRank) continue;

      const existingAward = await checkExistingPrizeAward(reg.id);
      if (existingAward) continue;

      const prizeRank = rankToPrizeRank(reg.finalRank);
      const prizeItem = findPrizeItem(prizeRank);
      if (!prizeItem) continue;

      awards.push({ registrationId: reg.id, prizeItemId: prizeItem.id, rank: prizeRank });
    }

    let created = 0;
    for (const a of awards) {
      const regInfo = allRegistrations.find((r: any) => r.id === a.registrationId);
      const fileId = regInfo?.registrationId || a.registrationId;
      const existingCert = regInfo?.certificate;

      let certType: string = "PARTICIPATION";
      if (a.rank === "FIRST_PLACE" || a.rank === "MERIT_1") certType = "MERIT_1";
      else if (a.rank === "SECOND_PLACE" || a.rank === "MERIT_2") certType = "MERIT_2";
      else if (a.rank === "THIRD_PLACE" || a.rank === "MERIT_3") certType = "MERIT_3";
      else if (a.rank === "SPECIAL_MENTION") certType = "SPECIAL_MENTION";

      if (!existingCert) {
        const serialPart1 = Math.floor(1000 + Math.random() * 9000);
        const serialPart2 = Math.floor(1000 + Math.random() * 9000);
        const certificateId = `CERT-PP-${serialPart1}-${serialPart2}`;

        await createPrizeAwardWithCertificate(a.registrationId, a.prizeItemId, a.rank, {
          certificateId,
          certificateUrl: `/certificates/${fileId}.pdf`,
          qrCodeUrl: `https://verify.pratibhaparishad.com/certificate/${certificateId}`,
          type: certType,
        });
      } else {
        await createPrizeAwardWithCertificate(a.registrationId, a.prizeItemId, a.rank);
      }
      created++;
    }

    return NextResponse.json({
      message: `${created} prize awards and certificates assigned successfully`,
      awarded: created,
    });
  } catch (error: any) {
    console.error("Prize award error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

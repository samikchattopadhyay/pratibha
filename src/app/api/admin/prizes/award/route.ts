/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import { PrizeRank } from "@prisma/client";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

// Map finalRank integer → PrizeRank enum
function rankToPrizeRank(rank: number): PrizeRank {
  if (rank === 1) return "FIRST_PLACE";
  if (rank === 2) return "SECOND_PLACE";
  if (rank === 3) return "THIRD_PLACE";
  if (rank === 4) return "MERIT_1";
  if (rank === 5) return "MERIT_2";
  if (rank <= 10) return "MERIT_3";
  return "PARTICIPATION";
}

// POST /api/admin/prizes/award — assign awards after results are finalized
export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { competitionId } = body;

    if (!competitionId) return NextResponse.json({ error: "competitionId is required" }, { status: 400 });

    // Load competition with prize pool
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        prizePool: { include: { items: true } },
        categories: {
          include: {
            registrations: {
              where: { scoringFinalized: true, finalRank: { not: null } },
              include: { certificate: true },
              orderBy: { finalRank: "asc" },
            },
          },
        },
      },
    });

    if (!competition) return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    if (!competition.prizePool) return NextResponse.json({ error: "No prize pool configured for this competition" }, { status: 400 });
    if (!competition.prizePool.isPublished) return NextResponse.json({ error: "Prize pool must be published before awarding" }, { status: 400 });

    const pool = competition.prizePool;
    const awards: { registrationId: string; prizeItemId: string; rank: PrizeRank }[] = [];

    // Find matching prize item by rank
    const findPrizeItem = (prizeRank: PrizeRank) =>
      pool.items.find((item) => item.rank === prizeRank) ?? pool.items.find((item) => item.rank === "PARTICIPATION");

    // Collect all ranked registrations across categories
    const allRegistrations = competition.categories.flatMap((cc) => cc.registrations);

    for (const reg of allRegistrations) {
      if (!reg.finalRank) continue;

      // Skip if already awarded
      const existingAward = await prisma.prizeAward.findUnique({ where: { registrationId: reg.id } });
      if (existingAward) continue;

      const prizeRank = rankToPrizeRank(reg.finalRank);
      const prizeItem = findPrizeItem(prizeRank);
      if (!prizeItem) continue;

      awards.push({ registrationId: reg.id, prizeItemId: prizeItem.id, rank: prizeRank });
    }

    // Bulk create awards with automatic certificate generation/connections
    const created = await prisma.$transaction(
      awards.map((a) => {
        const serialPart1 = Math.floor(1000 + Math.random() * 9000);
        const serialPart2 = Math.floor(1000 + Math.random() * 9000);
        const certificateId = `CERT-PP-${serialPart1}-${serialPart2}`;

        // Find registration identifier for PDF filename
        const regInfo = allRegistrations.find((r) => r.id === a.registrationId);
        const fileId = regInfo?.registrationId || a.registrationId;
        const existingCert = regInfo?.certificate;

        // Map PrizeRank to CertificateType
        let certType: any = "PARTICIPATION";
        if (a.rank === "FIRST_PLACE" || a.rank === "MERIT_1") certType = "MERIT_1";
        else if (a.rank === "SECOND_PLACE" || a.rank === "MERIT_2") certType = "MERIT_2";
        else if (a.rank === "THIRD_PLACE" || a.rank === "MERIT_3") certType = "MERIT_3";
        else if (a.rank === "SPECIAL_MENTION") certType = "SPECIAL_MENTION";

        if (existingCert) {
          return prisma.prizeAward.create({
            data: {
              registrationId: a.registrationId,
              prizeItemId: a.prizeItemId,
              rank: a.rank,
              certificate: {
                connect: { id: existingCert.id }
              }
            }
          });
        } else {
          return prisma.prizeAward.create({
            data: {
              registrationId: a.registrationId,
              prizeItemId: a.prizeItemId,
              rank: a.rank,
              certificate: {
                create: {
                  registrationId: a.registrationId,
                  certificateId,
                  certificateUrl: `/certificates/${fileId}.pdf`,
                  qrCodeUrl: `https://verify.pratibhaparishad.com/certificate/${certificateId}`,
                  type: certType,
                }
              }
            }
          });
        }
      })
    );

    return NextResponse.json({
      message: `${created.length} prize awards and certificates assigned successfully`,
      awarded: created.length,
    });
  } catch (error: any) {
    console.error("Prize award error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

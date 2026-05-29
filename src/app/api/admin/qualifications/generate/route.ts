import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
import { createAndDispatchNotification } from "@/lib/notificationService";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

// POST /api/admin/qualifications/generate — generate slots after state results finalized
export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { stateCompetitionId } = body;

    if (!stateCompetitionId) return NextResponse.json({ error: "stateCompetitionId is required" }, { status: 400 });

    // Find all rules for this state competition
    const rules = await prisma.qualificationRule.findMany({
      where: { stateCompetitionId, isActive: true },
      include: {
        nationalCompetition: { select: { id: true, title: true, registrationDeadline: true } },
      },
    });

    if (rules.length === 0) {
      return NextResponse.json({ error: "No active qualification rules found for this competition" }, { status: 404 });
    }

    // Load all finalized registrations grouped by category
    const categories = await prisma.competitionCategory.findMany({
      where: { competitionId: stateCompetitionId },
      include: {
        registrations: {
          where: { scoringFinalized: true, finalRank: { not: null } },
          orderBy: { finalRank: "asc" },
        },
      },
    });

    interface SlotItem {
      qualificationRuleId: string;
      registrationId: string;
      studentId: string;
      nationalCompetitionId: string;
      status: "OFFERED";
      expiresAt: Date;
      isWildCard: boolean;
    }

    const slotsCreated: SlotItem[] = [];

    for (const rule of rules) {
      const expiresAt = new Date(Date.now() + rule.slotExpiryDays * 86400000);

      // Check national registration deadline hasn't passed
      if (new Date() > rule.nationalCompetition.registrationDeadline) {
        continue; // Skip this rule — window closed
      }

      const alreadyOffered = new Set(
        (await prisma.qualificationSlot.findMany({
          where: { qualificationRuleId: rule.id },
          select: { registrationId: true },
        })).map((s) => s.registrationId)
      );

      const categoryQualifiers: string[] = []; // Track reg IDs added by category slots

      // Per-category top-N slots
      for (const cat of categories) {
        const topRegs = cat.registrations
          .filter((r) => !alreadyOffered.has(r.id))
          .filter((r) => !rule.minScoreThreshold || (r.finalScore && Number(r.finalScore) >= Number(rule.minScoreThreshold)))
          .slice(0, rule.slotsPerCategory);

        for (const reg of topRegs) {
          slotsCreated.push({
            qualificationRuleId: rule.id,
            registrationId: reg.id,
            studentId: reg.studentId,
            nationalCompetitionId: rule.nationalCompetitionId,
            status: "OFFERED" as const,
            expiresAt,
            isWildCard: false,
          });
          categoryQualifiers.push(reg.id);
          alreadyOffered.add(reg.id);
        }
      }

      // Wild card slots from overall top performers not already qualified
      const allRanked = categories
        .flatMap((c) => c.registrations)
        .filter((r) => r.finalRank !== null && !alreadyOffered.has(r.id))
        .sort((a, b) => (a.finalScore && b.finalScore ? Number(b.finalScore) - Number(a.finalScore) : 0))
        .slice(0, rule.wildCardSlots);

      for (const reg of allRanked) {
        slotsCreated.push({
          qualificationRuleId: rule.id,
          registrationId: reg.id,
          studentId: reg.studentId,
          nationalCompetitionId: rule.nationalCompetitionId,
          status: "OFFERED" as const,
          expiresAt,
          isWildCard: true,
        });
        alreadyOffered.add(reg.id);
      }
    }

    if (slotsCreated.length === 0) {
      return NextResponse.json({ message: "No new qualification slots to generate (all may already exist or no finalized results)" });
    }

    await prisma.qualificationSlot.createMany({ data: slotsCreated });

    // Create a map for quick rule lookup
    const ruleMap = new Map(rules.map((r: typeof rules[0]) => [r.id, r]));

    // Send notifications to parents for offered slots (fire-and-forget)
    for (const slot of slotsCreated) {
      const registration = await prisma.registration.findUnique({
        where: { id: slot.registrationId },
        include: {
          student: true,
          competitionCategory: {
            include: { category: true },
          },
        },
      });

      if (registration) {
        const student = registration.student;
        const parent = await prisma.parent.findFirst({
          where: { id: student.parentId },
        });

        if (parent) {
          const user = await prisma.user.findUnique({
            where: { id: parent.userId },
          });

          const rule = ruleMap.get(slot.qualificationRuleId);
          const nationalCompTitle = rule?.nationalCompetition.title || "National Competition";

          if (user?.email) {
            createAndDispatchNotification({
              userId: parent.userId,
              type: "QUALIFICATION_OFFERED",
              title: "Qualification Slot Offered",
              body: `${student.name} has qualified for ${nationalCompTitle}. A qualification slot is reserved until ${new Date(slot.expiresAt).toLocaleDateString()}.`,
              actionUrl: "/account/dashboard",
              registrationId: registration.id,
              recipientEmail: user.email,
            }).catch((err) =>
              console.error("Failed to send qualification offered notification:", err)
            );
          }
        }
      }
    }

    return NextResponse.json({
      message: `${slotsCreated.length} qualification slots generated`,
      slotsOffered: slotsCreated.length,
      wildCards: slotsCreated.filter((s) => s.isWildCard).length,
    });
  } catch (error) {
    console.error("Qualifications generate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

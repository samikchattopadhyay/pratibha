import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { createAndDispatchNotification } from "@/lib/notificationService";
import {
  getActiveQualificationRules,
  getCategoriesWithFinalizedRegistrations,
  getExistingQualificationSlots,
  createQualificationSlots,
  getRegistrationForNotification,
  getParentById,
} from "@/lib/db/queries";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!ADMIN_ROLES.includes((session.user as { role?: string }).role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { stateCompetitionId } = body;

    if (!stateCompetitionId) return NextResponse.json({ error: "stateCompetitionId is required" }, { status: 400 });

    const rules = await getActiveQualificationRules(stateCompetitionId);

    if (rules.length === 0) {
      return NextResponse.json({ error: "No active qualification rules found for this competition" }, { status: 404 });
    }

    const categories = await getCategoriesWithFinalizedRegistrations(stateCompetitionId);

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

      if (new Date() > rule.nationalCompetition.registrationDeadline) {
        continue;
      }

      const alreadyOffered = await getExistingQualificationSlots(rule.id);

      const categoryQualifiers: string[] = [];

      for (const cat of categories) {
        const topRegs = cat.registrations
          .filter((r) => !alreadyOffered.has(r.id))
          .filter((r) => !rule.minScoreThreshold || (r.finalScore && parseFloat(String(r.finalScore)) >= parseFloat(String(rule.minScoreThreshold))))
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

      const allRanked = categories
        .flatMap((c) => c.registrations)
        .filter((r) => r.finalRank !== null && !alreadyOffered.has(r.id))
        .sort((a, b) => (a.finalScore && b.finalScore ? parseFloat(String(b.finalScore)) - parseFloat(String(a.finalScore)) : 0))
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

    await createQualificationSlots(slotsCreated);

    const ruleMap = new Map(rules.map((r) => [r.id, r]));

    for (const slot of slotsCreated) {
      const registration = await getRegistrationForNotification(slot.registrationId);

      if (registration) {
        const student = registration.student;
        const parent = await getParentById(student.parentId);

        if (parent) {
          const rule = ruleMap.get(slot.qualificationRuleId);
          const nationalCompTitle = rule?.nationalCompetition.title || "National Competition";

          createAndDispatchNotification({
            userId: parent.userId,
            type: "QUALIFICATION_OFFERED",
            title: "Qualification Slot Offered",
            body: `${student.name} has qualified for ${nationalCompTitle}. A qualification slot is reserved until ${new Date(slot.expiresAt).toLocaleDateString()}.`,
            actionUrl: "/account/dashboard",
            registrationId: registration.id,
            recipientEmail: parent.user?.email || "",
          }).catch((err) =>
            console.error("Failed to send qualification offered notification:", err)
          );
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

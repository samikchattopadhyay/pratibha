// ─── Judge score visible to parent (anonymised) ────────────────────────────

/** Per-judge score breakdown for a single registration, visible to parent only when finalized */
export interface ParentJudgeScore {
  readonly label: string;           // "Judge 1", "Judge 2" — never a real name
  readonly isSubmitted: boolean;
  readonly criteria1: number | null; // Technique / Skill (max 40)
  readonly criteria2: number | null; // Expression / Presentation (max 30)
  readonly criteria3: number | null; // Rhythm / Composition (max 30)
  readonly criteria4: number | null; // Originality — National only (max 10)
  readonly totalScore: number | null;
  readonly remarks: string | null;
}

// ─── Certificate visible to parent ────────────────────────────────────────

export interface ParentCertificate {
  readonly certificateId: string;
  readonly certificateUrl: string;
  readonly qrCodeUrl: string;
  readonly type: "PARTICIPATION" | "MERIT_1" | "MERIT_2" | "MERIT_3" | "SPECIAL_MENTION";
  readonly status: "PENDING" | "GENERATED" | "SHARED" | "REVOKED";
  readonly issuedAt: string;   // ISO 8601
}

// ─── Prize / physical award visible to parent ──────────────────────────────

export interface ParentPrizeAward {
  readonly rank: string;          // e.g. "FIRST_PLACE"
  readonly prizeTitle: string;
  readonly prizeType: string;
  readonly isPhysical: boolean;
  readonly isDispatched: boolean;
  readonly dispatchedAt: string | null;
  readonly shipping: {
    readonly courierName: string | null;
    readonly awbNumber: string | null;
    readonly estimatedDelivery: string | null;
    readonly deliveredAt: string | null;
  } | null;
}

// ─── Full entry details returned by API ───────────────────────────────────

/** Complete entry details for parent portal, computed server-side, all dates as ISO strings */
export interface ParentEntryDetails {
  // Identity
  readonly id: string;
  readonly studentId: string;           // FK to Student — for back-link filtering
  readonly registrationId: string;      // e.g. "PP-2026-REC-0021"

  // Competition
  readonly competitionTitle: string;
  readonly competitionScope: "STATE" | "NATIONAL";
  readonly categoryName: string;
  readonly minAge: number | null;
  readonly maxAge: number | null;
  readonly startDate: string;           // ISO 8601
  readonly endDate: string;
  readonly resultDate: string | null;

  // Submission
  readonly fbPostUrl: string;
  readonly createdAt: string;           // ISO 8601 — submitted date

  // Status
  readonly paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  readonly status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "DISQUALIFIED";

  // Scoring & Ranking
  readonly scoringFinalized: boolean;
  readonly finalScore: number | null;      // Computed aggregate score
  readonly finalRank: number | null;       // Rank in category (e.g. 3)
  readonly totalInCategory: number | null; // Total entries in same category

  // Student (denormalised for display)
  readonly studentName: string;
  readonly studentAge: number;   // Computed server-side

  // Conditionals
  readonly judgeScores: readonly ParentJudgeScore[] | null; // null if not scoringFinalized
  readonly certificate: ParentCertificate | null;
  readonly prizeAward: ParentPrizeAward | null;
}

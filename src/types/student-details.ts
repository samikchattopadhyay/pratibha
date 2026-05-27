// Response DTO for student metadata
export interface StudentMetadata {
  readonly id: string;
  readonly name: string;
  readonly dateOfBirth: string; // ISO 8601
  readonly gender: string;
  readonly disciplineInterests: readonly string[];
  readonly createdAt: string; // ISO 8601
  readonly parent: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly phone: string;
    readonly city: string;
    readonly state: string;
  };
}

// Sub-tab state type
export type SubTab = "overview" | "competitions" | "achievements";

// Student summary DTO (for list view)
export interface StudentSummary {
  readonly id: string;
  readonly name: string;
  readonly parentName: string;
  readonly competitionCount: number;
  readonly awardCount: number;
  readonly lastRegistrationDate?: string | null;
}

// Student stats DTO
export interface StudentStats {
  readonly totalCompetitions: number;
  readonly totalAwards: number;
  readonly successRate: number; // percentage
  readonly averageScore: number | null;
  readonly categories: readonly string[];
  readonly bestRank: number | null;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

// Competition entry DTO
export interface StudentRegistrationEntry {
  readonly id: string;
  readonly registrationId: string;
  readonly competitionTitle: string;
  readonly competitionId: string;
  readonly categoryName: string;
  readonly categoryId: string;
  readonly status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "DISQUALIFIED";
  readonly paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  readonly finalScore: number | null;
  readonly finalRank: number | null;
  readonly fbPostUrl: string | null;
  readonly scoringFinalized: boolean;
  readonly createdAt: string; // ISO 8601
  readonly judgeAssignments: readonly {
    readonly judgeName: string;
    readonly score: number | null;
  }[];
  readonly certificateId?: string | null;
}

// Certificate DTO
export interface StudentCertificate {
  readonly id: string;
  readonly type: "PARTICIPATION" | "MERIT_1" | "MERIT_2" | "MERIT_3" | "SPECIAL_MENTION";
  readonly status: "PENDING" | "GENERATED" | "SHARED" | "REVOKED";
  readonly competitionTitle: string;
  readonly categoryName: string;
  readonly rank?: string | null;
  readonly certificateUrl?: string | null;
  readonly qrCodeUrl?: string | null;
  readonly issuedDate: string; // ISO 8601
  readonly registrationId: string;
}

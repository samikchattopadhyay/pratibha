// Response DTO for judge metadata
export interface JudgeMetadata {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly specializations: readonly string[];
  readonly tier: "LOCAL" | "REGIONAL" | "NATIONAL" | "EXPERT";
  readonly isActive: boolean;
  readonly joinedDate: string; // ISO 8601
  readonly totalEvaluations: number;
  readonly averageScore: number;
  readonly deviationPercentage?: number | null;
}

// Sub-tab state type
export type SubTab = "details" | "participants" | "revenue" | "settings";

// Participant assignment DTO
export interface ParticipantAssignment {
  readonly id: string;
  readonly participantId: string;
  readonly participantName: string;
  readonly categoryId: string;
  readonly categoryName: string;
  readonly submissionScore?: number | null;
  readonly evaluationStatus: "pending" | "in-progress" | "completed";
  readonly submittedAt: string; // ISO 8601
}

// Paginated response wrapper (matches api-rules pattern)
export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

// Revenue summary DTO
export interface RevenueMetadata {
  readonly totalEarned: number;
  readonly totalPending: number;
  readonly hourlyRate: number;
  readonly perEvaluationRate: number;
  readonly lastPaymentDate?: string | null;
}

// Payment history DTO
export interface PaymentRecord {
  readonly id: string;
  readonly amount: number;
  readonly status: "pending" | "completed" | "failed";
  readonly invoiceNumber: string;
  readonly createdAt: string; // ISO 8601
  readonly completedAt?: string | null;
}

// Settings DTO
export interface JudgeSettings {
  readonly maxEvaluationsPerDay: number;
  readonly restPeriodHours: number;
  readonly preferredCategories: readonly string[];
  readonly emailNotifications: boolean;
  readonly smsNotifications: boolean;
}

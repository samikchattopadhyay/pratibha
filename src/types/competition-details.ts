// Competition Details Page Type Definitions
// Used across competition detail routes and sub-tab components

export type SubTab = "details" | "participants" | "voting" | "certificates" | "shipping";

// ─── Metadata (Competition Header) ────────────────────────────────────────

export interface CompetitionMetadata {
  id: string;
  title: string;
  scope: "STATE" | "NATIONAL";
  category: string;
  bannerUrl?: string;
  isActive: boolean;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  totalParticipants: number;
  totalJudges: number;
}

// ─── Participants SubTab Types ────────────────────────────────────────────

export interface ParticipantRecord {
  id: string;
  registrationId: string;
  studentName: string;
  categoryName: string;
  status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "DISQUALIFIED";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  assignedJudges: Array<{
    id: string;
    name: string;
    score?: number | null;
  }>;
  createdAt: string;
}

// ─── Voting SubTab Types ─────────────────────────────────────────────────

export interface VotingRecord {
  judgeId: string;
  judgeName: string;
  tier: "LOCAL" | "REGIONAL" | "NATIONAL" | "EXPERT";
  assignmentCount: number;
  submittedCount: number;
  averageScore?: number | null;
  isOutlier?: boolean;
  completionPercentage: number;
}

// ─── Certificates SubTab Types ───────────────────────────────────────────

export interface CertificateRecord {
  id: string;
  registrationId: string;
  studentName: string;
  type: "PARTICIPATION" | "MERIT_1" | "MERIT_2" | "MERIT_3" | "SPECIAL_MENTION";
  status: "PENDING" | "GENERATED" | "SHARED";
  certificateId: string;
  qrCodeUrl: string;
  generatedAt: string;
}

// ─── Shipping SubTab Types ──────────────────────────────────────────────

export interface ShippingRecord {
  id: string;
  registrationId: string;
  studentName: string;
  shipmentId?: string;
  status: "PENDING" | "LABEL_GENERATED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";
  carrier?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

// ─── Pagination Wrapper ─────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// ─── Sub-Tab Component Props ────────────────────────────────────────────

export interface SubTabProps {
  competitionId: string;
}

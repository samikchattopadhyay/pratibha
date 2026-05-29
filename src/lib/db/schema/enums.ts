import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("Role", ["SUPER_ADMIN", "MODERATOR", "JUDGE", "PARENT"]);
export const paymentStatusEnum = pgEnum("PaymentStatus", ["PENDING", "SUCCESS", "FAILED"]);
export const entryStatusEnum = pgEnum("EntryStatus", ["PENDING_VERIFICATION", "VERIFIED", "REJECTED", "DISQUALIFIED"]);
export const certificateTypeEnum = pgEnum("CertificateType", ["PARTICIPATION", "MERIT_1", "MERIT_2", "MERIT_3", "SPECIAL_MENTION"]);
export const certificateStatusEnum = pgEnum("CertificateStatus", ["PENDING", "GENERATED", "SHARED", "REVOKED"]);
export const competitionScopeEnum = pgEnum("CompetitionScope", ["STATE", "NATIONAL"]);
export const prizeTypeEnum = pgEnum("PrizeType", ["DIGITAL_CERTIFICATE", "DIGITAL_MEDAL", "PHYSICAL_MEDAL", "PHYSICAL_TROPHY", "CASH_PRIZE", "SCHOLARSHIP", "RECOGNITION"]);
export const prizeRankEnum = pgEnum("PrizeRank", ["FIRST_PLACE", "SECOND_PLACE", "THIRD_PLACE", "MERIT_1", "MERIT_2", "MERIT_3", "SPECIAL_MENTION", "PEOPLES_CHOICE", "PARTICIPATION"]);
export const judgeTierEnum = pgEnum("JudgeTier", ["LOCAL", "REGIONAL", "NATIONAL", "EXPERT"]);
export const qualificationStatusEnum = pgEnum("QualificationStatus", ["OFFERED", "ACCEPTED", "DECLINED", "EXPIRED", "REVOKED"]);
export const shipmentStatusEnum = pgEnum("ShipmentStatus", ["PENDING", "LABEL_GENERATED", "PICKUP_SCHEDULED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "DELIVERY_FAILED", "RETURNED"]);
export const packageSKUEnum = pgEnum("PackageSKU", ["TROPHY_LARGE", "TROPHY_MEDIUM", "MEDAL_CERTIFICATE", "CERTIFICATE_ONLY", "MEDAL_ONLY"]);
export const categoryGroupEnum = pgEnum("CategoryGroup", ["MUSIC_VOCAL", "MUSIC_INSTRUMENTAL", "PERFORMING_ARTS", "VISUAL_ARTS", "LITERARY_ARTS", "SPOKEN_WORD"]);
export const payoutStatusEnum = pgEnum("PayoutStatus", ["PENDING", "PROCESSING", "PAID", "FAILED"]);
export const notificationTypeEnum = pgEnum("NotificationType", [
  "REGISTRATION_CREATED",
  "PAYMENT_RECEIVED",
  "REGISTRATION_VERIFIED",
  "REGISTRATION_REJECTED",
  "RESULTS_PUBLISHED",
  "CERTIFICATE_READY",
  "QUALIFICATION_OFFERED",
  "QUALIFICATION_EXPIRING",
  "JUDGE_ASSIGNED",
  "SCORING_REMINDER",
  "SCORING_DEADLINE",
  "ADMIN_NEW_REGISTRATION",
  "ADMIN_PAYMENT_CONFIRMED",
  "ADMIN_JUDGE_CONFLICT",
  "ADMIN_UNASSIGNED_REGISTRATIONS",
]);
export const notificationChannelEnum = pgEnum("NotificationChannel", ["IN_APP", "EMAIL", "TELEGRAM"]);
export const deliveryStatusEnum = pgEnum("DeliveryStatus", ["QUEUED", "SENDING", "SENT", "TEMPORARILY_FAILED", "PERMANENTLY_FAILED"]);
export const deliveryErrorTypeEnum = pgEnum("DeliveryErrorType", ["RATE_LIMITED", "USER_BLOCKED", "INVALID_CHAT", "BAD_REQUEST", "NETWORK_ERROR", "UNKNOWN"]);

CREATE TYPE "public"."CategoryGroup" AS ENUM('MUSIC_VOCAL', 'MUSIC_INSTRUMENTAL', 'PERFORMING_ARTS', 'VISUAL_ARTS', 'LITERARY_ARTS', 'SPOKEN_WORD');--> statement-breakpoint
CREATE TYPE "public"."CertificateStatus" AS ENUM('PENDING', 'GENERATED', 'SHARED', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."CertificateType" AS ENUM('PARTICIPATION', 'MERIT_1', 'MERIT_2', 'MERIT_3', 'SPECIAL_MENTION');--> statement-breakpoint
CREATE TYPE "public"."CompetitionScope" AS ENUM('STATE', 'NATIONAL');--> statement-breakpoint
CREATE TYPE "public"."DeliveryErrorType" AS ENUM('RATE_LIMITED', 'USER_BLOCKED', 'INVALID_CHAT', 'BAD_REQUEST', 'NETWORK_ERROR', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."DeliveryStatus" AS ENUM('QUEUED', 'SENDING', 'SENT', 'TEMPORARILY_FAILED', 'PERMANENTLY_FAILED');--> statement-breakpoint
CREATE TYPE "public"."EntryStatus" AS ENUM('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'DISQUALIFIED');--> statement-breakpoint
CREATE TYPE "public"."JudgeTier" AS ENUM('LOCAL', 'REGIONAL', 'NATIONAL', 'EXPERT');--> statement-breakpoint
CREATE TYPE "public"."NotificationChannel" AS ENUM('IN_APP', 'EMAIL', 'TELEGRAM');--> statement-breakpoint
CREATE TYPE "public"."NotificationType" AS ENUM('REGISTRATION_CREATED', 'PAYMENT_RECEIVED', 'REGISTRATION_VERIFIED', 'REGISTRATION_REJECTED', 'RESULTS_PUBLISHED', 'CERTIFICATE_READY', 'QUALIFICATION_OFFERED', 'QUALIFICATION_EXPIRING', 'JUDGE_ASSIGNED', 'SCORING_REMINDER', 'SCORING_DEADLINE', 'ADMIN_NEW_REGISTRATION', 'ADMIN_PAYMENT_CONFIRMED', 'ADMIN_JUDGE_CONFLICT', 'ADMIN_UNASSIGNED_REGISTRATIONS');--> statement-breakpoint
CREATE TYPE "public"."PackageSKU" AS ENUM('TROPHY_LARGE', 'TROPHY_MEDIUM', 'MEDAL_CERTIFICATE', 'CERTIFICATE_ONLY', 'MEDAL_ONLY');--> statement-breakpoint
CREATE TYPE "public"."PaymentStatus" AS ENUM('PENDING', 'SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."PayoutStatus" AS ENUM('PENDING', 'PROCESSING', 'PAID', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."PrizeRank" AS ENUM('FIRST_PLACE', 'SECOND_PLACE', 'THIRD_PLACE', 'MERIT_1', 'MERIT_2', 'MERIT_3', 'SPECIAL_MENTION', 'PEOPLES_CHOICE', 'PARTICIPATION');--> statement-breakpoint
CREATE TYPE "public"."PrizeType" AS ENUM('DIGITAL_CERTIFICATE', 'DIGITAL_MEDAL', 'PHYSICAL_MEDAL', 'PHYSICAL_TROPHY', 'CASH_PRIZE', 'SCHOLARSHIP', 'RECOGNITION');--> statement-breakpoint
CREATE TYPE "public"."QualificationStatus" AS ENUM('OFFERED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('SUPER_ADMIN', 'MODERATOR', 'JUDGE', 'PARENT');--> statement-breakpoint
CREATE TYPE "public"."ShipmentStatus" AS ENUM('PENDING', 'LABEL_GENERATED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNED');--> statement-breakpoint
CREATE TABLE "EmailVerificationToken" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"verifiedAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "EmailVerificationToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "PasswordResetToken" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"usedAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "PasswordResetToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "PasswordSetupToken" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"usedAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "PasswordSetupToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "ProfileSetupToken" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"stage" text NOT NULL,
	"data" jsonb,
	"usedAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "ProfileSetupToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"passwordHash" text,
	"facebookId" text,
	"role" "Role" DEFAULT 'PARENT' NOT NULL,
	"profileImageUrl" text,
	"emailVerified" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email"),
	CONSTRAINT "User_facebookId_unique" UNIQUE("facebookId")
);
--> statement-breakpoint
CREATE TABLE "ExternalAchievement" (
	"id" text PRIMARY KEY NOT NULL,
	"studentId" text NOT NULL,
	"title" text NOT NULL,
	"eventName" text NOT NULL,
	"category" text,
	"year" integer NOT NULL,
	"rank" text,
	"description" text,
	"proofUrl" text,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Parent" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"postalCode" text,
	"country" text DEFAULT 'India' NOT NULL,
	"profileImageUrl" text,
	"preferredState" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "Parent_userId_unique" UNIQUE("userId"),
	CONSTRAINT "Parent_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "Student" (
	"id" text PRIMARY KEY NOT NULL,
	"parentId" text NOT NULL,
	"name" text NOT NULL,
	"dateOfBirth" timestamp (3) NOT NULL,
	"gender" text NOT NULL,
	"disciplineInterests" text[] DEFAULT '{}'::text[] NOT NULL,
	"slug" text,
	"profileImageUrl" text,
	"bio" text,
	"city" text,
	"state" text,
	"heightCm" integer,
	"hairColor" text,
	"eyeColor" text,
	"trainingInstitutes" text[] DEFAULT '{}'::text[] NOT NULL,
	"languages" text[] DEFAULT '{}'::text[] NOT NULL,
	"specialSkills" text[] DEFAULT '{}'::text[] NOT NULL,
	"isPublic" boolean DEFAULT false NOT NULL,
	"schoolClass" text,
	"schoolName" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "Student_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "BannerTemplate" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"imageUrl" text NOT NULL,
	"description" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "BannerTemplate_name_unique" UNIQUE("name"),
	CONSTRAINT "BannerTemplate_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "Category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"grouping" text,
	CONSTRAINT "Category_name_unique" UNIQUE("name"),
	CONSTRAINT "Category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "CompetitionCategory" (
	"id" text PRIMARY KEY NOT NULL,
	"competitionId" text NOT NULL,
	"categoryId" text NOT NULL,
	"minAge" integer NOT NULL,
	"maxAge" integer NOT NULL,
	"language" text,
	CONSTRAINT "CompetitionCategory_competitionId_categoryId_minAge_maxAge_key" UNIQUE("competitionId","categoryId","minAge","maxAge")
);
--> statement-breakpoint
CREATE TABLE "Competition" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"bannerUrl" text,
	"entryFeeINR" numeric(10, 2) NOT NULL,
	"startDate" timestamp (3) NOT NULL,
	"endDate" timestamp (3) NOT NULL,
	"registrationDeadline" timestamp (3) NOT NULL,
	"resultDate" timestamp (3) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"scope" "CompetitionScope" DEFAULT 'STATE' NOT NULL,
	"eligibleStates" text[] DEFAULT '{}'::text[] NOT NULL,
	"hostState" text,
	"difficultyLevel" integer DEFAULT 1 NOT NULL,
	"minJudgesRequired" integer DEFAULT 2 NOT NULL,
	"rules" text,
	"facebookGroupUrl" text,
	"capacity" integer,
	"criteriaConfig" jsonb,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Registration" (
	"id" text PRIMARY KEY NOT NULL,
	"studentId" text NOT NULL,
	"competitionCategoryId" text NOT NULL,
	"fbPostUrl" text NOT NULL,
	"paymentStatus" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
	"registrationId" text NOT NULL,
	"status" "EntryStatus" DEFAULT 'PENDING_VERIFICATION' NOT NULL,
	"scoringFinalized" boolean DEFAULT false NOT NULL,
	"conflictResolved" boolean DEFAULT false NOT NULL,
	"finalRank" integer,
	"finalScore" numeric(8, 4),
	"discountApplied" numeric(5, 2),
	"isFeatured" boolean DEFAULT false NOT NULL,
	"isHidden" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "Registration_fbPostUrl_unique" UNIQUE("fbPostUrl"),
	CONSTRAINT "Registration_registrationId_unique" UNIQUE("registrationId")
);
--> statement-breakpoint
CREATE TABLE "Transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"registrationId" text NOT NULL,
	"razorpayOrderId" text NOT NULL,
	"razorpayPaymentId" text,
	"razorpaySignature" text,
	"amount" numeric(10, 2) NOT NULL,
	"status" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "Transaction_razorpayOrderId_unique" UNIQUE("razorpayOrderId"),
	CONSTRAINT "Transaction_razorpayPaymentId_unique" UNIQUE("razorpayPaymentId")
);
--> statement-breakpoint
CREATE TABLE "CompetitionJudge" (
	"id" text PRIMARY KEY NOT NULL,
	"competitionId" text NOT NULL,
	"judgeId" text NOT NULL,
	"assignedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "CompetitionJudge_competitionId_judgeId_key" UNIQUE("competitionId","judgeId")
);
--> statement-breakpoint
CREATE TABLE "JudgeAssignment" (
	"id" text PRIMARY KEY NOT NULL,
	"registrationId" text NOT NULL,
	"judgeId" text NOT NULL,
	"isSubmitted" boolean DEFAULT false NOT NULL,
	"assignedAt" timestamp (3) DEFAULT now() NOT NULL,
	"submittedAt" timestamp (3),
	"conflictChecked" boolean DEFAULT false NOT NULL,
	"conflictFlagged" boolean DEFAULT false NOT NULL,
	"conflictReason" text,
	CONSTRAINT "JudgeAssignment_registrationId_judgeId_key" UNIQUE("registrationId","judgeId")
);
--> statement-breakpoint
CREATE TABLE "JudgePanelRequirement" (
	"id" text PRIMARY KEY NOT NULL,
	"competitionId" text NOT NULL,
	"minJudges" integer DEFAULT 2 NOT NULL,
	"minNationalTierJudges" integer DEFAULT 0 NOT NULL,
	"requireCrossCategory" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "JudgePanelRequirement_competitionId_unique" UNIQUE("competitionId")
);
--> statement-breakpoint
CREATE TABLE "JudgePayout" (
	"id" text PRIMARY KEY NOT NULL,
	"judgeId" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "PayoutStatus" DEFAULT 'PENDING' NOT NULL,
	"assignedCount" integer NOT NULL,
	"paymentDate" timestamp (3),
	"transactionRef" text,
	"adminNotes" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Judge" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"specializations" text[] DEFAULT '{}'::text[] NOT NULL,
	"profileImageUrl" text,
	"tier" "JudgeTier" DEFAULT 'LOCAL' NOT NULL,
	"bio" text,
	"credentials" text,
	"stateOfResidence" text,
	"states" text[] DEFAULT '{}'::text[] NOT NULL,
	"languages" text[] DEFAULT '{}'::text[] NOT NULL,
	"yearsOfExperience" integer,
	"isVerified" boolean DEFAULT false NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL,
	"totalEvaluations" integer DEFAULT 0 NOT NULL,
	"averageScoreGiven" numeric(5, 2),
	"bankAccountDetails" jsonb,
	"paymentPerEvaluation" numeric(8, 2),
	"revenueShareLOCAL" numeric(5, 2),
	"revenueShareREGIONAL" numeric(5, 2),
	"revenueShareNATIONAL" numeric(5, 2),
	"revenueShareEXPERT" numeric(5, 2),
	"telegramChatId" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "Judge_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "Score" (
	"id" text PRIMARY KEY NOT NULL,
	"judgeAssignmentId" text NOT NULL,
	"criteria1" integer NOT NULL,
	"criteria2" integer NOT NULL,
	"criteria3" integer NOT NULL,
	"criteria4" integer,
	"totalScore" integer NOT NULL,
	"remarks" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "Score_judgeAssignmentId_unique" UNIQUE("judgeAssignmentId")
);
--> statement-breakpoint
CREATE TABLE "SocialMetric" (
	"id" text PRIMARY KEY NOT NULL,
	"registrationId" text NOT NULL,
	"likesCount" integer DEFAULT 0 NOT NULL,
	"commentsCount" integer DEFAULT 0 NOT NULL,
	"sharesCount" integer DEFAULT 0 NOT NULL,
	"calculatedEngagement" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"lastSyncedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "SocialMetric_registrationId_unique" UNIQUE("registrationId")
);
--> statement-breakpoint
CREATE TABLE "Certificate" (
	"id" text PRIMARY KEY NOT NULL,
	"registrationId" text NOT NULL,
	"certificateId" text NOT NULL,
	"certificateUrl" text NOT NULL,
	"qrCodeUrl" text NOT NULL,
	"type" "CertificateType" DEFAULT 'PARTICIPATION' NOT NULL,
	"status" "CertificateStatus" DEFAULT 'PENDING' NOT NULL,
	"prizeAwardId" text,
	"issuedAt" timestamp (3) DEFAULT now() NOT NULL,
	"revokedAt" timestamp (3),
	"revokedBy" text,
	CONSTRAINT "Certificate_registrationId_unique" UNIQUE("registrationId"),
	CONSTRAINT "Certificate_certificateId_unique" UNIQUE("certificateId"),
	CONSTRAINT "Certificate_prizeAwardId_unique" UNIQUE("prizeAwardId")
);
--> statement-breakpoint
CREATE TABLE "PrizeAward" (
	"id" text PRIMARY KEY NOT NULL,
	"prizeItemId" text NOT NULL,
	"registrationId" text NOT NULL,
	"rank" "PrizeRank" NOT NULL,
	"awardedAt" timestamp (3) DEFAULT now() NOT NULL,
	"isDispatched" boolean DEFAULT false NOT NULL,
	"dispatchedAt" timestamp (3),
	"courierTrackingId" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "PrizeAward_registrationId_unique" UNIQUE("registrationId")
);
--> statement-breakpoint
CREATE TABLE "PrizeItem" (
	"id" text PRIMARY KEY NOT NULL,
	"prizePoolId" text NOT NULL,
	"rank" "PrizeRank" NOT NULL,
	"type" "PrizeType" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"estimatedValue" numeric(10, 2),
	"isPhysical" boolean DEFAULT false NOT NULL,
	"imageUrl" text,
	"perCategory" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PrizePool" (
	"id" text PRIMARY KEY NOT NULL,
	"competitionId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"isPublished" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "PrizePool_competitionId_unique" UNIQUE("competitionId")
);
--> statement-breakpoint
CREATE TABLE "QualificationRule" (
	"id" text PRIMARY KEY NOT NULL,
	"stateCompetitionId" text NOT NULL,
	"nationalCompetitionId" text NOT NULL,
	"slotsPerCategory" integer DEFAULT 3 NOT NULL,
	"wildCardSlots" integer DEFAULT 1 NOT NULL,
	"minScoreThreshold" numeric(8, 4),
	"discountPercent" integer DEFAULT 50 NOT NULL,
	"slotExpiryDays" integer DEFAULT 14 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "QualificationSlot" (
	"id" text PRIMARY KEY NOT NULL,
	"qualificationRuleId" text NOT NULL,
	"registrationId" text NOT NULL,
	"studentId" text NOT NULL,
	"nationalCompetitionId" text NOT NULL,
	"status" "QualificationStatus" DEFAULT 'OFFERED' NOT NULL,
	"offeredAt" timestamp (3) DEFAULT now() NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"acceptedAt" timestamp (3),
	"nationalRegistrationId" text,
	"isWildCard" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "QualificationSlot_registrationId_unique" UNIQUE("registrationId"),
	CONSTRAINT "QualificationSlot_nationalRegistrationId_unique" UNIQUE("nationalRegistrationId")
);
--> statement-breakpoint
CREATE TABLE "PhysicalPrizeOrder" (
	"id" text PRIMARY KEY NOT NULL,
	"prizeAwardId" text NOT NULL,
	"recipientName" text NOT NULL,
	"recipientPhone" text NOT NULL,
	"recipientAddress" text NOT NULL,
	"recipientCity" text NOT NULL,
	"recipientState" text NOT NULL,
	"recipientPostalCode" text NOT NULL,
	"recipientCountry" text DEFAULT 'India' NOT NULL,
	"packageSKU" "PackageSKU" NOT NULL,
	"weightGrams" integer NOT NULL,
	"lengthCm" integer NOT NULL,
	"widthCm" integer NOT NULL,
	"heightCm" integer NOT NULL,
	"shiprocketOrderId" text,
	"shiprocketShipmentId" text,
	"shiprocketLabelUrl" text,
	"awbNumber" text,
	"courierName" text,
	"estimatedDelivery" timestamp (3),
	"status" "ShipmentStatus" DEFAULT 'PENDING' NOT NULL,
	"batchId" text,
	"labelGeneratedAt" timestamp (3),
	"pickupScheduledAt" timestamp (3),
	"dispatchedAt" timestamp (3),
	"deliveredAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "PhysicalPrizeOrder_prizeAwardId_unique" UNIQUE("prizeAwardId"),
	CONSTRAINT "PhysicalPrizeOrder_shiprocketOrderId_unique" UNIQUE("shiprocketOrderId"),
	CONSTRAINT "PhysicalPrizeOrder_shiprocketShipmentId_unique" UNIQUE("shiprocketShipmentId")
);
--> statement-breakpoint
CREATE TABLE "ShipmentBatch" (
	"id" text PRIMARY KEY NOT NULL,
	"batchNumber" text NOT NULL,
	"description" text,
	"totalOrders" integer DEFAULT 0 NOT NULL,
	"processedAt" timestamp (3),
	"manifestUrl" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "ShipmentBatch_batchNumber_unique" UNIQUE("batchNumber")
);
--> statement-breakpoint
CREATE TABLE "NotificationPreference" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" "NotificationType" NOT NULL,
	"channel" "NotificationChannel" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "NotificationPreference_userId_type_channel_key" UNIQUE("userId","type","channel")
);
--> statement-breakpoint
CREATE TABLE "Notification" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" "NotificationType" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"readAt" timestamp (3),
	"actionUrl" text,
	"registrationId" text,
	"assignmentId" text,
	"certificateId" text,
	"qualificationId" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TelegramMessageDelivery" (
	"id" text PRIMARY KEY NOT NULL,
	"notificationId" text NOT NULL,
	"chatId" text NOT NULL,
	"messageId" text,
	"status" "DeliveryStatus" DEFAULT 'QUEUED' NOT NULL,
	"errorType" "DeliveryErrorType",
	"errorCode" text,
	"errorMessage" text,
	"sentAt" timestamp (3),
	"failureCount" integer DEFAULT 0 NOT NULL,
	"lastAttemptAt" timestamp (3),
	"nextRetryAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "TelegramMessageDelivery_notificationId_unique" UNIQUE("notificationId")
);
--> statement-breakpoint
CREATE TABLE "SystemSetting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "CompetitionJudge_competitionId_idx" ON "CompetitionJudge" USING btree ("competitionId");--> statement-breakpoint
CREATE INDEX "CompetitionJudge_judgeId_idx" ON "CompetitionJudge" USING btree ("judgeId");--> statement-breakpoint
CREATE INDEX "PhysicalPrizeOrder_batchId_idx" ON "PhysicalPrizeOrder" USING btree ("batchId");--> statement-breakpoint
CREATE INDEX "PhysicalPrizeOrder_status_idx" ON "PhysicalPrizeOrder" USING btree ("status");--> statement-breakpoint
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Notification_userId_read_idx" ON "Notification" USING btree ("userId","read");--> statement-breakpoint
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "TelegramMessageDelivery_status_idx" ON "TelegramMessageDelivery" USING btree ("status");--> statement-breakpoint
CREATE INDEX "TelegramMessageDelivery_status_nextRetryAt_idx" ON "TelegramMessageDelivery" USING btree ("status","nextRetryAt");--> statement-breakpoint
CREATE INDEX "TelegramMessageDelivery_chatId_idx" ON "TelegramMessageDelivery" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "TelegramMessageDelivery_createdAt_idx" ON "TelegramMessageDelivery" USING btree ("createdAt");
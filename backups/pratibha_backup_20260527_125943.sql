--
-- PostgreSQL database dump
--

\restrict 1jFBcmUK3nxyIJE7UWQjfvy5S55Ex7RxaeMqRCPnGeunoZiEt1OjsJmyh6lZgQv

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pratibha
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO pratibha;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pratibha
--

COMMENT ON SCHEMA public IS '';


--
-- Name: CategoryGroup; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."CategoryGroup" AS ENUM (
    'MUSIC_VOCAL',
    'MUSIC_INSTRUMENTAL',
    'PERFORMING_ARTS',
    'VISUAL_ARTS',
    'LITERARY_ARTS',
    'SPOKEN_WORD'
);


ALTER TYPE public."CategoryGroup" OWNER TO pratibha;

--
-- Name: CertificateStatus; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."CertificateStatus" AS ENUM (
    'PENDING',
    'GENERATED',
    'SHARED',
    'REVOKED'
);


ALTER TYPE public."CertificateStatus" OWNER TO pratibha;

--
-- Name: CertificateType; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."CertificateType" AS ENUM (
    'PARTICIPATION',
    'MERIT_1',
    'MERIT_2',
    'MERIT_3',
    'SPECIAL_MENTION'
);


ALTER TYPE public."CertificateType" OWNER TO pratibha;

--
-- Name: CompetitionScope; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."CompetitionScope" AS ENUM (
    'STATE',
    'NATIONAL'
);


ALTER TYPE public."CompetitionScope" OWNER TO pratibha;

--
-- Name: DeliveryErrorType; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."DeliveryErrorType" AS ENUM (
    'RATE_LIMITED',
    'USER_BLOCKED',
    'INVALID_CHAT',
    'BAD_REQUEST',
    'NETWORK_ERROR',
    'UNKNOWN'
);


ALTER TYPE public."DeliveryErrorType" OWNER TO pratibha;

--
-- Name: DeliveryStatus; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."DeliveryStatus" AS ENUM (
    'QUEUED',
    'SENDING',
    'SENT',
    'TEMPORARILY_FAILED',
    'PERMANENTLY_FAILED'
);


ALTER TYPE public."DeliveryStatus" OWNER TO pratibha;

--
-- Name: EntryStatus; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."EntryStatus" AS ENUM (
    'PENDING_VERIFICATION',
    'VERIFIED',
    'REJECTED',
    'DISQUALIFIED'
);


ALTER TYPE public."EntryStatus" OWNER TO pratibha;

--
-- Name: JudgeTier; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."JudgeTier" AS ENUM (
    'LOCAL',
    'REGIONAL',
    'NATIONAL',
    'EXPERT'
);


ALTER TYPE public."JudgeTier" OWNER TO pratibha;

--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'IN_APP',
    'EMAIL',
    'TELEGRAM'
);


ALTER TYPE public."NotificationChannel" OWNER TO pratibha;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."NotificationType" AS ENUM (
    'REGISTRATION_CREATED',
    'PAYMENT_RECEIVED',
    'REGISTRATION_VERIFIED',
    'REGISTRATION_REJECTED',
    'RESULTS_PUBLISHED',
    'CERTIFICATE_READY',
    'QUALIFICATION_OFFERED',
    'QUALIFICATION_EXPIRING',
    'JUDGE_ASSIGNED',
    'SCORING_REMINDER',
    'SCORING_DEADLINE',
    'ADMIN_NEW_REGISTRATION',
    'ADMIN_PAYMENT_CONFIRMED',
    'ADMIN_JUDGE_CONFLICT',
    'ADMIN_UNASSIGNED_REGISTRATIONS'
);


ALTER TYPE public."NotificationType" OWNER TO pratibha;

--
-- Name: PackageSKU; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."PackageSKU" AS ENUM (
    'TROPHY_LARGE',
    'TROPHY_MEDIUM',
    'MEDAL_CERTIFICATE',
    'CERTIFICATE_ONLY',
    'MEDAL_ONLY'
);


ALTER TYPE public."PackageSKU" OWNER TO pratibha;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED'
);


ALTER TYPE public."PaymentStatus" OWNER TO pratibha;

--
-- Name: PayoutStatus; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."PayoutStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'PAID',
    'FAILED'
);


ALTER TYPE public."PayoutStatus" OWNER TO pratibha;

--
-- Name: PrizeRank; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."PrizeRank" AS ENUM (
    'FIRST_PLACE',
    'SECOND_PLACE',
    'THIRD_PLACE',
    'MERIT_1',
    'MERIT_2',
    'MERIT_3',
    'SPECIAL_MENTION',
    'PEOPLES_CHOICE',
    'PARTICIPATION'
);


ALTER TYPE public."PrizeRank" OWNER TO pratibha;

--
-- Name: PrizeType; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."PrizeType" AS ENUM (
    'DIGITAL_CERTIFICATE',
    'DIGITAL_MEDAL',
    'PHYSICAL_MEDAL',
    'PHYSICAL_TROPHY',
    'CASH_PRIZE',
    'SCHOLARSHIP',
    'RECOGNITION'
);


ALTER TYPE public."PrizeType" OWNER TO pratibha;

--
-- Name: QualificationStatus; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."QualificationStatus" AS ENUM (
    'OFFERED',
    'ACCEPTED',
    'DECLINED',
    'EXPIRED',
    'REVOKED'
);


ALTER TYPE public."QualificationStatus" OWNER TO pratibha;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."Role" AS ENUM (
    'SUPER_ADMIN',
    'MODERATOR',
    'JUDGE',
    'PARENT'
);


ALTER TYPE public."Role" OWNER TO pratibha;

--
-- Name: ShipmentStatus; Type: TYPE; Schema: public; Owner: pratibha
--

CREATE TYPE public."ShipmentStatus" AS ENUM (
    'PENDING',
    'LABEL_GENERATED',
    'PICKUP_SCHEDULED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'DELIVERY_FAILED',
    'RETURNED'
);


ALTER TYPE public."ShipmentStatus" OWNER TO pratibha;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: BannerTemplate; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."BannerTemplate" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "imageUrl" text NOT NULL,
    description text,
    tags text[] DEFAULT ARRAY[]::text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BannerTemplate" OWNER TO pratibha;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text,
    "grouping" text
);


ALTER TABLE public."Category" OWNER TO pratibha;

--
-- Name: Certificate; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."Certificate" (
    id text NOT NULL,
    "registrationId" text NOT NULL,
    "certificateId" text NOT NULL,
    "certificateUrl" text NOT NULL,
    "qrCodeUrl" text NOT NULL,
    type public."CertificateType" DEFAULT 'PARTICIPATION'::public."CertificateType" NOT NULL,
    status public."CertificateStatus" DEFAULT 'PENDING'::public."CertificateStatus" NOT NULL,
    "prizeAwardId" text,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "revokedBy" text
);


ALTER TABLE public."Certificate" OWNER TO pratibha;

--
-- Name: Competition; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."Competition" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "bannerUrl" text,
    "entryFeeINR" numeric(10,2) NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "registrationDeadline" timestamp(3) without time zone NOT NULL,
    "resultDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    scope public."CompetitionScope" DEFAULT 'STATE'::public."CompetitionScope" NOT NULL,
    "eligibleStates" text[] DEFAULT ARRAY[]::text[],
    "hostState" text,
    "difficultyLevel" integer DEFAULT 1 NOT NULL,
    "minJudgesRequired" integer DEFAULT 2 NOT NULL,
    rules text,
    "facebookGroupUrl" text,
    capacity integer,
    "criteriaConfig" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Competition" OWNER TO pratibha;

--
-- Name: CompetitionCategory; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."CompetitionCategory" (
    id text NOT NULL,
    "competitionId" text NOT NULL,
    "categoryId" text NOT NULL,
    "minAge" integer NOT NULL,
    "maxAge" integer NOT NULL,
    language text
);


ALTER TABLE public."CompetitionCategory" OWNER TO pratibha;

--
-- Name: CompetitionJudge; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."CompetitionJudge" (
    id text NOT NULL,
    "competitionId" text NOT NULL,
    "judgeId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CompetitionJudge" OWNER TO pratibha;

--
-- Name: Judge; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."Judge" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    specializations text[],
    "profileImageUrl" text,
    tier public."JudgeTier" DEFAULT 'LOCAL'::public."JudgeTier" NOT NULL,
    bio text,
    credentials text,
    "stateOfResidence" text,
    states text[] DEFAULT ARRAY[]::text[],
    languages text[] DEFAULT ARRAY[]::text[],
    "yearsOfExperience" integer,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "totalEvaluations" integer DEFAULT 0 NOT NULL,
    "averageScoreGiven" numeric(5,2),
    "bankAccountDetails" jsonb,
    "telegramChatId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Judge" OWNER TO pratibha;

--
-- Name: JudgeAssignment; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."JudgeAssignment" (
    id text NOT NULL,
    "registrationId" text NOT NULL,
    "judgeId" text NOT NULL,
    "isSubmitted" boolean DEFAULT false NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    "conflictChecked" boolean DEFAULT false NOT NULL,
    "conflictFlagged" boolean DEFAULT false NOT NULL,
    "conflictReason" text
);


ALTER TABLE public."JudgeAssignment" OWNER TO pratibha;

--
-- Name: JudgePanelRequirement; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."JudgePanelRequirement" (
    id text NOT NULL,
    "competitionId" text NOT NULL,
    "minJudges" integer DEFAULT 2 NOT NULL,
    "minNationalTierJudges" integer DEFAULT 0 NOT NULL,
    "requireCrossCategory" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."JudgePanelRequirement" OWNER TO pratibha;

--
-- Name: JudgePayout; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."JudgePayout" (
    id text NOT NULL,
    "judgeId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public."PayoutStatus" DEFAULT 'PENDING'::public."PayoutStatus" NOT NULL,
    "assignedCount" integer NOT NULL,
    "paymentDate" timestamp(3) without time zone,
    "transactionRef" text,
    "adminNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."JudgePayout" OWNER TO pratibha;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "actionUrl" text,
    "registrationId" text,
    "assignmentId" text,
    "certificateId" text,
    "qualificationId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO pratibha;

--
-- Name: NotificationPreference; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."NotificationPreference" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    channel public."NotificationChannel" NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."NotificationPreference" OWNER TO pratibha;

--
-- Name: Parent; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."Parent" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "postalCode" text NOT NULL,
    country text DEFAULT 'India'::text NOT NULL,
    "profileImageUrl" text,
    "preferredState" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Parent" OWNER TO pratibha;

--
-- Name: PhysicalPrizeOrder; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."PhysicalPrizeOrder" (
    id text NOT NULL,
    "prizeAwardId" text NOT NULL,
    "recipientName" text NOT NULL,
    "recipientPhone" text NOT NULL,
    "recipientAddress" text NOT NULL,
    "recipientCity" text NOT NULL,
    "recipientState" text NOT NULL,
    "recipientPostalCode" text NOT NULL,
    "recipientCountry" text DEFAULT 'India'::text NOT NULL,
    "packageSKU" public."PackageSKU" NOT NULL,
    "weightGrams" integer NOT NULL,
    "lengthCm" integer NOT NULL,
    "widthCm" integer NOT NULL,
    "heightCm" integer NOT NULL,
    "shiprocketOrderId" text,
    "shiprocketShipmentId" text,
    "shiprocketLabelUrl" text,
    "awbNumber" text,
    "courierName" text,
    "estimatedDelivery" timestamp(3) without time zone,
    status public."ShipmentStatus" DEFAULT 'PENDING'::public."ShipmentStatus" NOT NULL,
    "batchId" text,
    "labelGeneratedAt" timestamp(3) without time zone,
    "pickupScheduledAt" timestamp(3) without time zone,
    "dispatchedAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PhysicalPrizeOrder" OWNER TO pratibha;

--
-- Name: PrizeAward; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."PrizeAward" (
    id text NOT NULL,
    "prizeItemId" text NOT NULL,
    "registrationId" text NOT NULL,
    rank public."PrizeRank" NOT NULL,
    "awardedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isDispatched" boolean DEFAULT false NOT NULL,
    "dispatchedAt" timestamp(3) without time zone,
    "courierTrackingId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PrizeAward" OWNER TO pratibha;

--
-- Name: PrizeItem; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."PrizeItem" (
    id text NOT NULL,
    "prizePoolId" text NOT NULL,
    rank public."PrizeRank" NOT NULL,
    type public."PrizeType" NOT NULL,
    title text NOT NULL,
    description text,
    "estimatedValue" numeric(10,2),
    "isPhysical" boolean DEFAULT false NOT NULL,
    "imageUrl" text,
    "perCategory" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PrizeItem" OWNER TO pratibha;

--
-- Name: PrizePool; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."PrizePool" (
    id text NOT NULL,
    "competitionId" text NOT NULL,
    title text NOT NULL,
    description text,
    "isPublished" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PrizePool" OWNER TO pratibha;

--
-- Name: QualificationRule; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."QualificationRule" (
    id text NOT NULL,
    "stateCompetitionId" text NOT NULL,
    "nationalCompetitionId" text NOT NULL,
    "slotsPerCategory" integer DEFAULT 3 NOT NULL,
    "wildCardSlots" integer DEFAULT 1 NOT NULL,
    "minScoreThreshold" numeric(8,4),
    "discountPercent" integer DEFAULT 50 NOT NULL,
    "slotExpiryDays" integer DEFAULT 14 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."QualificationRule" OWNER TO pratibha;

--
-- Name: QualificationSlot; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."QualificationSlot" (
    id text NOT NULL,
    "qualificationRuleId" text NOT NULL,
    "registrationId" text NOT NULL,
    "studentId" text NOT NULL,
    "nationalCompetitionId" text NOT NULL,
    status public."QualificationStatus" DEFAULT 'OFFERED'::public."QualificationStatus" NOT NULL,
    "offeredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "acceptedAt" timestamp(3) without time zone,
    "nationalRegistrationId" text,
    "isWildCard" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."QualificationSlot" OWNER TO pratibha;

--
-- Name: Registration; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."Registration" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "competitionCategoryId" text NOT NULL,
    "fbPostUrl" text NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "registrationId" text NOT NULL,
    status public."EntryStatus" DEFAULT 'PENDING_VERIFICATION'::public."EntryStatus" NOT NULL,
    "scoringFinalized" boolean DEFAULT false NOT NULL,
    "conflictResolved" boolean DEFAULT false NOT NULL,
    "finalRank" integer,
    "finalScore" numeric(8,4),
    "discountApplied" numeric(5,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Registration" OWNER TO pratibha;

--
-- Name: Score; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."Score" (
    id text NOT NULL,
    "judgeAssignmentId" text NOT NULL,
    criteria1 integer NOT NULL,
    criteria2 integer NOT NULL,
    criteria3 integer NOT NULL,
    criteria4 integer,
    "totalScore" integer NOT NULL,
    remarks text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Score" OWNER TO pratibha;

--
-- Name: ShipmentBatch; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."ShipmentBatch" (
    id text NOT NULL,
    "batchNumber" text NOT NULL,
    description text,
    "totalOrders" integer DEFAULT 0 NOT NULL,
    "processedAt" timestamp(3) without time zone,
    "manifestUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ShipmentBatch" OWNER TO pratibha;

--
-- Name: SocialMetric; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."SocialMetric" (
    id text NOT NULL,
    "registrationId" text NOT NULL,
    "likesCount" integer DEFAULT 0 NOT NULL,
    "commentsCount" integer DEFAULT 0 NOT NULL,
    "sharesCount" integer DEFAULT 0 NOT NULL,
    "calculatedEngagement" numeric(5,2) DEFAULT 0.00 NOT NULL,
    "lastSyncedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SocialMetric" OWNER TO pratibha;

--
-- Name: Student; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."Student" (
    id text NOT NULL,
    "parentId" text NOT NULL,
    name text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone NOT NULL,
    gender text NOT NULL,
    "disciplineInterests" text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Student" OWNER TO pratibha;

--
-- Name: TelegramMessageDelivery; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."TelegramMessageDelivery" (
    id text NOT NULL,
    "notificationId" text NOT NULL,
    "chatId" text NOT NULL,
    "messageId" text,
    status public."DeliveryStatus" DEFAULT 'QUEUED'::public."DeliveryStatus" NOT NULL,
    "errorType" public."DeliveryErrorType",
    "errorCode" text,
    "errorMessage" text,
    "sentAt" timestamp(3) without time zone,
    "failureCount" integer DEFAULT 0 NOT NULL,
    "lastAttemptAt" timestamp(3) without time zone,
    "nextRetryAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TelegramMessageDelivery" OWNER TO pratibha;

--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    "registrationId" text NOT NULL,
    "razorpayOrderId" text NOT NULL,
    "razorpayPaymentId" text,
    "razorpaySignature" text,
    amount numeric(10,2) NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO pratibha;

--
-- Name: User; Type: TABLE; Schema: public; Owner: pratibha
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'PARENT'::public."Role" NOT NULL,
    "profileImageUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO pratibha;

--
-- Data for Name: BannerTemplate; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."BannerTemplate" (id, name, slug, "imageUrl", description, tags, "isActive", "createdAt", "updatedAt") FROM stdin;
d3dca4b9-0b5d-4ddb-9936-e824cbf8b48d	General Traditional Festival	general	https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80	Classic festival celebration theme	{festival,general}	t	2026-05-27 07:22:30.476	2026-05-27 07:22:30.476
27ff0756-6cfb-4601-aef8-8105318ce604	Classical Singing / Music	singing	https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80	Theme for vocal and instrumental music competitions	{music,singing,classical}	t	2026-05-27 07:22:30.486	2026-05-27 07:22:30.486
154ed91c-e7c9-459a-b08e-936cd3f8e6ad	Drawing & Visual Arts	drawing	https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80	Theme for visual arts and painting competitions	{art,drawing,visual}	t	2026-05-27 07:22:30.491	2026-05-27 07:22:30.491
2abf3468-98bc-4ebc-9b87-21c64113476f	Literature / Recitation	recitation	https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80	Theme for literary and recitation competitions	{literature,recitation,speaking}	t	2026-05-27 07:22:30.496	2026-05-27 07:22:30.496
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."Category" (id, name, slug, icon, "grouping") FROM stdin;
4e66a549-4fe1-4cb2-b701-ea173c8a8982	Bengali Recitation	bengali-recitation	\N	SPOKEN_WORD
816b0104-7d1e-4d2a-8b49-360947957133	English Recitation	english-recitation	\N	SPOKEN_WORD
df340264-3eb4-41b8-a5b8-c0619168af2d	Rabindra Sangeet	rabindra-sangeet	\N	MUSIC_VOCAL
6ec5e528-1871-4e20-af57-d9539bc44008	Nazrul Geeti	nazrul-geeti	\N	MUSIC_VOCAL
2ccfce67-c6d0-4864-9e90-b1be53be1d49	Classical Dance	classical-dance	\N	PERFORMING_ARTS
fc03c9ae-147f-4b5a-bc87-f416bd3bcaf1	Drawing & Painting	drawing-painting	\N	VISUAL_ARTS
21ac0a78-6da5-4b07-8a9d-c2fbbf9e47b7	Creative Writing	creative-writing	\N	LITERARY_ARTS
3ac28d09-8642-4e86-9cb2-1980de25bb7a	Story Telling	story-telling	\N	LITERARY_ARTS
84f666d2-7558-44e7-b9e5-e0260ac5f4aa	Folk Singing	folk-singing	\N	MUSIC_VOCAL
3600a04d-9865-4c11-963c-3862e730f850	Instrumental Flute	instrumental-flute	\N	MUSIC_INSTRUMENTAL
cfa691d3-0a7f-4814-b86f-80d493d3e8d3	Instrumental Sitar	instrumental-sitar	\N	MUSIC_INSTRUMENTAL
d22bb08c-15f7-4863-bc1f-cb05f902028d	Western Vocals	western-vocals	\N	MUSIC_VOCAL
7f8d18ce-c68d-46ee-9a08-84d9438fe85c	Clay Modeling	clay-modeling	\N	VISUAL_ARTS
e227b62f-a501-4b0c-b7e5-c0b2762fdad6	Photography	photography	\N	VISUAL_ARTS
df316597-717d-4347-b4a5-4d58c8c9df6b	Drama & Mime	drama-mime	\N	PERFORMING_ARTS
f55ee857-4c23-466f-94d5-e3c865ddd459	Handwriting Improvement	handwriting-improvement	\N	LITERARY_ARTS
e09c672b-16c6-4c34-b0a1-1aed5aa1f967	Hindustani Classical Vocals	hindustani-classical-vocals	\N	MUSIC_VOCAL
065436b9-4e41-4c94-a136-0c89fafe1b65	Modern Bengali Songs	modern-bengali-songs	\N	MUSIC_VOCAL
d3050f6b-4ce6-4beb-a5f5-43701df9a6f5	Digital Illustration	digital-illustration	\N	VISUAL_ARTS
53728efe-79b7-424d-a8d3-92960a9faf6a	Elocution & Speech	elocution-speech	\N	SPOKEN_WORD
3c077416-6ba7-4857-9768-a7d44024c952	Classical Vocal	classical-vocal	\N	MUSIC_VOCAL
8936d2f5-2e12-4a78-aea8-1de8fc4f95c8	Classical Instrumental	classical-instrumental	\N	MUSIC_INSTRUMENTAL
f3eb4a69-a74d-4d0d-a998-5cc021b88bc6	Poetry Recitation	poetry-recitation	\N	LITERARY_ARTS
\.


--
-- Data for Name: Certificate; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."Certificate" (id, "registrationId", "certificateId", "certificateUrl", "qrCodeUrl", type, status, "prizeAwardId", "issuedAt", "revokedAt", "revokedBy") FROM stdin;
4a0cee3a-991b-478e-a394-c53f58a06cab	1b58274a-b849-4b20-9b50-edad13418fe8	CERT-1B58274A	https://certificates.example.com/1b58274a-b849-4b20-9b50-edad13418fe8	https://qrcodes.example.com/1b58274a-b849-4b20-9b50-edad13418fe8	MERIT_1	GENERATED	\N	2026-05-27 07:24:20.87	\N	\N
819336bd-d37e-4a43-8f7a-75f645e58d42	3b9a2028-0650-449f-8845-f20f60e70721	CERT-3B9A2028	https://certificates.example.com/3b9a2028-0650-449f-8845-f20f60e70721	https://qrcodes.example.com/3b9a2028-0650-449f-8845-f20f60e70721	MERIT_3	GENERATED	\N	2026-05-27 07:24:20.877	\N	\N
5883b401-3256-4b66-a021-a60ad9ebe1a5	4885972d-5fdc-4386-ab93-a9c10afb64c5	CERT-4885972D	https://certificates.example.com/4885972d-5fdc-4386-ab93-a9c10afb64c5	https://qrcodes.example.com/4885972d-5fdc-4386-ab93-a9c10afb64c5	MERIT_1	GENERATED	\N	2026-05-27 07:24:20.881	\N	\N
cae58d9c-71e0-43cf-baea-8f877c3d2275	d0766cd3-b7e7-4e05-ba5c-51fa13063537	CERT-D0766CD3	https://certificates.example.com/d0766cd3-b7e7-4e05-ba5c-51fa13063537	https://qrcodes.example.com/d0766cd3-b7e7-4e05-ba5c-51fa13063537	MERIT_2	GENERATED	\N	2026-05-27 07:24:20.885	\N	\N
e547c713-f689-491e-9736-4d600dba7893	154b941e-6eb3-44c2-a7e1-c2640be92e9e	CERT-154B941E	https://certificates.example.com/154b941e-6eb3-44c2-a7e1-c2640be92e9e	https://qrcodes.example.com/154b941e-6eb3-44c2-a7e1-c2640be92e9e	MERIT_2	GENERATED	\N	2026-05-27 07:24:20.889	\N	\N
35d1dadb-edb8-403f-8aef-44ae30066af9	b38ba0eb-df20-42a8-a2f8-961942f067a7	CERT-B38BA0EB	https://certificates.example.com/b38ba0eb-df20-42a8-a2f8-961942f067a7	https://qrcodes.example.com/b38ba0eb-df20-42a8-a2f8-961942f067a7	MERIT_2	GENERATED	\N	2026-05-27 07:24:20.893	\N	\N
6bca18cf-7a0d-42b4-ab32-a54413cb7aeb	97a7121b-dfa0-49a3-9fef-16a22a7b8c33	CERT-97A7121B	https://certificates.example.com/97a7121b-dfa0-49a3-9fef-16a22a7b8c33	https://qrcodes.example.com/97a7121b-dfa0-49a3-9fef-16a22a7b8c33	MERIT_2	GENERATED	\N	2026-05-27 07:24:20.897	\N	\N
42d660dd-7d47-44f8-9adb-7488e156d349	4436af24-930a-453e-bbae-20a406ef1d8f	CERT-4436AF24	https://certificates.example.com/4436af24-930a-453e-bbae-20a406ef1d8f	https://qrcodes.example.com/4436af24-930a-453e-bbae-20a406ef1d8f	MERIT_2	GENERATED	\N	2026-05-27 07:24:20.9	\N	\N
a010799f-1350-447c-a527-34a4d1ca948e	bb75bf2c-90ed-4cc7-9a75-0c041dda49ee	CERT-BB75BF2C	https://certificates.example.com/bb75bf2c-90ed-4cc7-9a75-0c041dda49ee	https://qrcodes.example.com/bb75bf2c-90ed-4cc7-9a75-0c041dda49ee	MERIT_2	GENERATED	\N	2026-05-27 07:24:20.904	\N	\N
543264fc-eab7-4c90-ae1e-610b44afc773	72b0c408-eb57-4366-9c65-a308c0fb5c32	CERT-72B0C408	https://certificates.example.com/72b0c408-eb57-4366-9c65-a308c0fb5c32	https://qrcodes.example.com/72b0c408-eb57-4366-9c65-a308c0fb5c32	MERIT_1	GENERATED	\N	2026-05-27 07:24:20.907	\N	\N
82ec7508-6fdf-4e65-8367-02364c6d6c9b	d7ac1a10-3cc8-4ae1-8148-d72de0446576	CERT-D7AC1A10	https://certificates.example.com/d7ac1a10-3cc8-4ae1-8148-d72de0446576	https://qrcodes.example.com/d7ac1a10-3cc8-4ae1-8148-d72de0446576	MERIT_3	GENERATED	\N	2026-05-27 07:24:20.911	\N	\N
523bb049-3466-4601-b45f-d3574854f4fe	518c0eb7-cdb3-402a-863c-0c185eb2883f	CERT-518C0EB7	https://certificates.example.com/518c0eb7-cdb3-402a-863c-0c185eb2883f	https://qrcodes.example.com/518c0eb7-cdb3-402a-863c-0c185eb2883f	MERIT_1	GENERATED	\N	2026-05-27 07:24:20.915	\N	\N
ae34cfc6-485d-49df-aaf1-0e936edb430e	1d4302ad-4657-42af-a938-f40085184127	CERT-1D4302AD	https://certificates.example.com/1d4302ad-4657-42af-a938-f40085184127	https://qrcodes.example.com/1d4302ad-4657-42af-a938-f40085184127	MERIT_3	GENERATED	\N	2026-05-27 07:24:20.918	\N	\N
37b09ac7-7300-4d70-be65-ab5af974d723	9bb9027a-1499-4127-95fe-975c415cc502	CERT-9BB9027A	https://certificates.example.com/9bb9027a-1499-4127-95fe-975c415cc502	https://qrcodes.example.com/9bb9027a-1499-4127-95fe-975c415cc502	MERIT_3	GENERATED	\N	2026-05-27 07:24:20.922	\N	\N
91fd7183-f74c-436a-8fad-a0bee9604428	24b0f229-79b4-431d-a3b3-f93d45d59c11	CERT-24B0F229	https://certificates.example.com/24b0f229-79b4-431d-a3b3-f93d45d59c11	https://qrcodes.example.com/24b0f229-79b4-431d-a3b3-f93d45d59c11	MERIT_1	GENERATED	\N	2026-05-27 07:24:20.925	\N	\N
f7432e73-e47b-44d9-a49f-52b0cf1fd910	36a898d3-db15-4f12-9a2e-408f09167ca3	CERT-36A898D3	https://certificates.example.com/36a898d3-db15-4f12-9a2e-408f09167ca3	https://qrcodes.example.com/36a898d3-db15-4f12-9a2e-408f09167ca3	MERIT_3	GENERATED	\N	2026-05-27 07:24:20.928	\N	\N
148a52c7-c0fb-4ae4-b0b9-d9f521c5fb31	c3484e46-3a70-4df7-bb49-0ecba329c179	CERT-C3484E46	https://certificates.example.com/c3484e46-3a70-4df7-bb49-0ecba329c179	https://qrcodes.example.com/c3484e46-3a70-4df7-bb49-0ecba329c179	MERIT_1	GENERATED	\N	2026-05-27 07:24:20.932	\N	\N
835929e3-5be0-4956-ab8a-1c26cd79f7b5	8457aad6-0eb3-4520-a416-24e1c13ce7ab	CERT-8457AAD6	https://certificates.example.com/8457aad6-0eb3-4520-a416-24e1c13ce7ab	https://qrcodes.example.com/8457aad6-0eb3-4520-a416-24e1c13ce7ab	MERIT_1	GENERATED	\N	2026-05-27 07:24:20.936	\N	\N
93381871-b707-4c23-8c12-583c2f997491	dc403a70-39d3-4238-99b4-fa3c24cc1879	CERT-DC403A70	https://certificates.example.com/dc403a70-39d3-4238-99b4-fa3c24cc1879	https://qrcodes.example.com/dc403a70-39d3-4238-99b4-fa3c24cc1879	MERIT_2	GENERATED	\N	2026-05-27 07:24:20.939	\N	\N
fe3b0b90-96b7-446f-8a76-65c60798a5bb	d8ffd18a-cac6-41b5-aa18-b2149aff596a	CERT-D8FFD18A	https://certificates.example.com/d8ffd18a-cac6-41b5-aa18-b2149aff596a	https://qrcodes.example.com/d8ffd18a-cac6-41b5-aa18-b2149aff596a	MERIT_1	GENERATED	\N	2026-05-27 07:24:20.943	\N	\N
bddbfe9a-b20f-4a5f-adec-9f0e48220bd1	ee1d4847-2acf-4232-a8a3-15af28a75179	CERT-EE1D4847	https://certificates.example.com/ee1d4847-2acf-4232-a8a3-15af28a75179	https://qrcodes.example.com/ee1d4847-2acf-4232-a8a3-15af28a75179	MERIT_2	GENERATED	\N	2026-05-27 07:24:20.947	\N	\N
3b4fe760-721a-4bfd-bd01-82f90eebf3bf	c2715b10-1cc2-4267-b971-26acda8629a3	CERT-C2715B10	https://certificates.example.com/c2715b10-1cc2-4267-b971-26acda8629a3	https://qrcodes.example.com/c2715b10-1cc2-4267-b971-26acda8629a3	MERIT_2	GENERATED	\N	2026-05-27 07:24:20.95	\N	\N
179c3149-fcd6-41c7-af80-024de414c9fc	bc69167c-019f-4eba-8125-5b08571b1522	CERT-BC69167C	https://certificates.example.com/bc69167c-019f-4eba-8125-5b08571b1522	https://qrcodes.example.com/bc69167c-019f-4eba-8125-5b08571b1522	MERIT_1	GENERATED	\N	2026-05-27 07:24:20.955	\N	\N
db55ef92-ad4b-41ca-8765-08f2a48d5e9a	03ddb7da-8cb3-4691-96a1-1b1226df4243	CERT-03DDB7DA	https://certificates.example.com/03ddb7da-8cb3-4691-96a1-1b1226df4243	https://qrcodes.example.com/03ddb7da-8cb3-4691-96a1-1b1226df4243	MERIT_3	GENERATED	\N	2026-05-27 07:24:20.959	\N	\N
f98ce3b9-a61d-4c70-adda-a34021365b26	5e84dc93-ad8b-443a-92ac-d162ee7ad6ae	CERT-5E84DC93	https://certificates.example.com/5e84dc93-ad8b-443a-92ac-d162ee7ad6ae	https://qrcodes.example.com/5e84dc93-ad8b-443a-92ac-d162ee7ad6ae	MERIT_2	GENERATED	\N	2026-05-27 07:24:20.962	\N	\N
d2cf95bd-4d58-4fde-98a2-1fba0063e987	34fb9135-e8ee-4a44-a70d-fe61c84449c6	CERT-34FB9135	https://certificates.example.com/34fb9135-e8ee-4a44-a70d-fe61c84449c6	https://qrcodes.example.com/34fb9135-e8ee-4a44-a70d-fe61c84449c6	MERIT_1	GENERATED	\N	2026-05-27 07:24:20.966	\N	\N
ec0f4891-3278-4410-9dad-0bbd815ab33e	adde770f-68f9-46fc-8ea4-e1763d30f30e	CERT-ADDE770F	https://certificates.example.com/adde770f-68f9-46fc-8ea4-e1763d30f30e	https://qrcodes.example.com/adde770f-68f9-46fc-8ea4-e1763d30f30e	MERIT_3	GENERATED	\N	2026-05-27 07:24:20.97	\N	\N
54934924-8d5a-4343-86be-4862826fc7e0	4fc7c5b9-409d-460e-9a38-9070a782e0fb	CERT-4FC7C5B9	https://certificates.example.com/4fc7c5b9-409d-460e-9a38-9070a782e0fb	https://qrcodes.example.com/4fc7c5b9-409d-460e-9a38-9070a782e0fb	MERIT_3	GENERATED	\N	2026-05-27 07:24:20.973	\N	\N
\.


--
-- Data for Name: Competition; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."Competition" (id, title, description, "bannerUrl", "entryFeeINR", "startDate", "endDate", "registrationDeadline", "resultDate", "isActive", scope, "eligibleStates", "hostState", "difficultyLevel", "minJudgesRequired", rules, "facebookGroupUrl", capacity, "criteriaConfig", "createdAt", "updatedAt") FROM stdin;
ab40399e-dd92-4e6f-97bb-ec90ce434a56	National Talent Hunt 2026	Premier national competition for young talent	\N	500.00	2026-04-30 18:30:00	2026-05-30 18:30:00	2026-06-26 07:22:30.86	2026-07-26 07:22:30.86	t	NATIONAL	{}	Karnataka	2	3	\N	\N	\N	\N	2026-05-27 07:22:30.861	2026-05-27 07:22:30.861
6819db14-442d-43db-b8ad-02ef6a09449e	Regional Arts Excellence 2026	Regional competition for artistic talent across disciplines	\N	300.00	2026-05-04 18:30:00	2026-06-04 18:30:00	2026-06-16 07:22:30.86	2026-07-16 07:22:30.86	t	STATE	{}	West Bengal	1	2	\N	\N	\N	\N	2026-05-27 07:22:30.869	2026-05-27 07:22:30.869
\.


--
-- Data for Name: CompetitionCategory; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."CompetitionCategory" (id, "competitionId", "categoryId", "minAge", "maxAge", language) FROM stdin;
dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	ab40399e-dd92-4e6f-97bb-ec90ce434a56	3c077416-6ba7-4857-9768-a7d44024c952	8	12	Any
3d4f2682-837b-4df6-8461-7e5bb413158f	ab40399e-dd92-4e6f-97bb-ec90ce434a56	fc03c9ae-147f-4b5a-bc87-f416bd3bcaf1	8	12	\N
efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	6819db14-442d-43db-b8ad-02ef6a09449e	3c077416-6ba7-4857-9768-a7d44024c952	10	15	Any
6fa41a03-f42d-4385-859f-fd6b89dbeb4d	6819db14-442d-43db-b8ad-02ef6a09449e	2ccfce67-c6d0-4864-9e90-b1be53be1d49	10	15	\N
90128b72-3db7-4ea4-8fe5-278a5e01bbfc	6819db14-442d-43db-b8ad-02ef6a09449e	fc03c9ae-147f-4b5a-bc87-f416bd3bcaf1	10	15	\N
\.


--
-- Data for Name: CompetitionJudge; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."CompetitionJudge" (id, "competitionId", "judgeId", "assignedAt") FROM stdin;
2ddadc79-35e8-46e1-ad6a-060301e2cf57	ab40399e-dd92-4e6f-97bb-ec90ce434a56	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	2026-05-27 07:22:31.474
9ff7ffbc-e5f6-4dd3-8161-f59e4329a10c	ab40399e-dd92-4e6f-97bb-ec90ce434a56	0a7d2763-fa93-4a49-a430-1e8148da1a37	2026-05-27 07:22:31.481
eff87048-36a3-44ed-b9e0-3e3cd04c3ba3	6819db14-442d-43db-b8ad-02ef6a09449e	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	2026-05-27 07:22:31.485
30fc380d-c902-43ca-8192-25745b97bb2b	6819db14-442d-43db-b8ad-02ef6a09449e	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	2026-05-27 07:22:31.49
9f536966-69f8-4327-8495-200928f0fd54	6819db14-442d-43db-b8ad-02ef6a09449e	0a7d2763-fa93-4a49-a430-1e8148da1a37	2026-05-27 07:22:31.494
\.


--
-- Data for Name: Judge; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."Judge" (id, "userId", name, specializations, "profileImageUrl", tier, bio, credentials, "stateOfResidence", states, languages, "yearsOfExperience", "isVerified", "isAvailable", "totalEvaluations", "averageScoreGiven", "bankAccountDetails", "telegramChatId", "createdAt", "updatedAt") FROM stdin;
517a420a-ad1d-4bc9-bbaf-7b65c82916b5	d82a34f7-440a-4cbd-b01a-6cabb027704e	Dr. Ravi Shankar	{classical-vocal,hindustani-classical-vocals,rabindra-sangeet}	\N	NATIONAL	\N	\N	\N	{}	{}	15	t	t	0	\N	\N	\N	2026-05-27 07:22:31.439	2026-05-27 07:22:31.439
29808afa-6617-47b3-873a-4a462c5fb063	2f780c37-65b8-4d6c-9526-9345bdf719bd	Prof. Ustad Ali Khan	{classical-instrumental,instrumental-sitar,instrumental-flute}	\N	NATIONAL	\N	\N	\N	{}	{}	15	t	t	0	\N	\N	\N	2026-05-27 07:22:31.448	2026-05-27 07:22:31.448
078d81ff-5ce4-44f7-af2a-28e169e5babc	130188a8-fd3b-4ff5-8752-78c0959f3803	Smt. Madhuri Dutta	{poetry-recitation,creative-writing,story-telling}	\N	NATIONAL	\N	\N	\N	{}	{}	15	t	t	0	\N	\N	\N	2026-05-27 07:22:31.455	2026-05-27 07:22:31.455
a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	2d13e1c2-ba7f-4177-a2c2-6d379fa3be80	Smt. Anita Verma	{classical-dance,performing-arts}	\N	NATIONAL	\N	\N	\N	{}	{}	15	t	t	0	\N	\N	\N	2026-05-27 07:22:31.463	2026-05-27 07:22:31.463
0a7d2763-fa93-4a49-a430-1e8148da1a37	5c647320-ee37-4abe-9963-e686c37722ff	Mr. Rajesh Patel	{drawing-painting,visual-arts,digital-illustration}	\N	NATIONAL	\N	\N	\N	{}	{}	15	t	t	0	\N	\N	\N	2026-05-27 07:22:31.471	2026-05-27 07:22:31.471
\.


--
-- Data for Name: JudgeAssignment; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."JudgeAssignment" (id, "registrationId", "judgeId", "isSubmitted", "assignedAt", "submittedAt", "conflictChecked", "conflictFlagged", "conflictReason") FROM stdin;
25850a29-2441-4e3b-b163-32000ea61a08	4f5b8961-9b0d-4fa3-b607-d03817e7a383	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	f	2026-05-27 07:22:31.505	\N	f	f	\N
f2da228a-9e92-4e2b-9ff1-e9f528b00eb7	1b58274a-b849-4b20-9b50-edad13418fe8	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	t	2026-05-27 07:22:31.512	2026-05-27 07:22:31.523	f	f	\N
5602392e-75a3-429b-a415-a909c31a040e	862a87a2-4c60-4a62-a260-e3fc958bd640	0a7d2763-fa93-4a49-a430-1e8148da1a37	t	2026-05-27 07:22:31.528	2026-05-27 07:22:31.536	f	f	\N
76bcb132-80e4-4a80-9b0d-6e13f55701cd	3b9a2028-0650-449f-8845-f20f60e70721	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	t	2026-05-27 07:22:31.54	2026-05-27 07:22:31.549	f	f	\N
8796dacf-2d4b-4fa8-983b-6fd948acd57e	4885972d-5fdc-4386-ab93-a9c10afb64c5	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	t	2026-05-27 07:22:31.553	2026-05-27 07:22:31.562	f	f	\N
ec8ba928-504d-4684-88e0-b470f4e6f645	d0766cd3-b7e7-4e05-ba5c-51fa13063537	0a7d2763-fa93-4a49-a430-1e8148da1a37	f	2026-05-27 07:22:31.566	\N	f	f	\N
3335a670-e9b6-4bc6-85a5-331377ed98c4	154b941e-6eb3-44c2-a7e1-c2640be92e9e	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	f	2026-05-27 07:22:31.57	\N	f	f	\N
ffc304fe-7ddb-4cd4-8d4e-ab2312d92ff6	b38ba0eb-df20-42a8-a2f8-961942f067a7	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	t	2026-05-27 07:22:31.575	2026-05-27 07:22:31.583	f	f	\N
c1309a49-ad8b-4bbf-9ded-59832e7fc5de	abae547f-6f6b-4799-883f-c1b74508aeb0	0a7d2763-fa93-4a49-a430-1e8148da1a37	t	2026-05-27 07:22:31.587	2026-05-27 07:22:31.596	f	f	\N
893f8f9d-adba-407b-b10b-13a152fbfb46	e7b0bf68-65fa-4dcd-88df-ba6fe169e5a7	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	t	2026-05-27 07:22:31.6	2026-05-27 07:22:31.608	f	f	\N
20290c26-417f-4f77-83e6-23033b7f5731	97a7121b-dfa0-49a3-9fef-16a22a7b8c33	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	f	2026-05-27 07:22:31.612	\N	f	f	\N
bf76e2de-da01-498a-990d-c6ddc746289d	11dac50f-3517-4f22-b342-6232a5d60b31	0a7d2763-fa93-4a49-a430-1e8148da1a37	f	2026-05-27 07:22:31.617	\N	f	f	\N
e4a2ba5a-e298-4ec0-9227-1284e679a66f	6eb0ca87-8558-45ad-b578-8b4f77bb1ba0	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	t	2026-05-27 07:22:31.621	2026-05-27 07:22:31.629	f	f	\N
beaa1b3a-8ad0-485d-b2f0-55c00b89572c	4436af24-930a-453e-bbae-20a406ef1d8f	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	f	2026-05-27 07:22:31.634	\N	f	f	\N
0ca942d5-d097-47e6-ba2c-f0f83c01592e	bb75bf2c-90ed-4cc7-9a75-0c041dda49ee	0a7d2763-fa93-4a49-a430-1e8148da1a37	t	2026-05-27 07:22:31.638	2026-05-27 07:22:31.647	f	f	\N
049bed42-b5a6-4fca-95b0-a2d6e4b993b9	3019ff06-11e9-4ffc-81eb-0aae899acb57	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	f	2026-05-27 07:22:31.651	\N	f	f	\N
4d963cf7-d114-4ce8-8c5c-599352f65416	72b0c408-eb57-4366-9c65-a308c0fb5c32	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	f	2026-05-27 07:22:31.656	\N	f	f	\N
785d23a9-bb9a-451c-94a3-35c0a6a80f35	846a5b34-53ba-48a5-95ca-d92216ee018b	0a7d2763-fa93-4a49-a430-1e8148da1a37	f	2026-05-27 07:22:31.661	\N	f	f	\N
4ac20cf6-1cea-4a3c-ab4c-d1a31ba12a1a	d7ac1a10-3cc8-4ae1-8148-d72de0446576	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	f	2026-05-27 07:22:31.665	\N	f	f	\N
a06f02b4-c943-448a-8a86-95d228ba8eae	7c392d74-ff22-4256-b4e6-8d53b779852f	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	t	2026-05-27 07:22:31.672	2026-05-27 07:22:31.68	f	f	\N
2a2ea64b-4013-41e3-aada-5245f42f9de0	518c0eb7-cdb3-402a-863c-0c185eb2883f	0a7d2763-fa93-4a49-a430-1e8148da1a37	t	2026-05-27 07:22:31.684	2026-05-27 07:22:31.692	f	f	\N
e5284379-0e5e-4589-8500-7f42780c80de	1d4302ad-4657-42af-a938-f40085184127	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	t	2026-05-27 07:22:31.696	2026-05-27 07:22:31.705	f	f	\N
2d16beef-2ac2-4551-a54c-b7468cd32b7b	9bb9027a-1499-4127-95fe-975c415cc502	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	t	2026-05-27 07:22:31.709	2026-05-27 07:22:31.717	f	f	\N
dae9aacc-5cbc-425e-b861-d5ee61db0174	24b0f229-79b4-431d-a3b3-f93d45d59c11	0a7d2763-fa93-4a49-a430-1e8148da1a37	f	2026-05-27 07:22:31.721	\N	f	f	\N
ed8cecae-e38b-494a-a2a5-26f8ec25cb53	36a898d3-db15-4f12-9a2e-408f09167ca3	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	t	2026-05-27 07:22:31.726	2026-05-27 07:22:31.734	f	f	\N
84d2d189-27f8-4a7f-a0c9-50ab6d98cd9d	c3484e46-3a70-4df7-bb49-0ecba329c179	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	f	2026-05-27 07:22:31.738	\N	f	f	\N
3cf00ee1-0496-4306-9aa3-0783f1f57da4	8457aad6-0eb3-4520-a416-24e1c13ce7ab	0a7d2763-fa93-4a49-a430-1e8148da1a37	t	2026-05-27 07:22:31.743	2026-05-27 07:22:31.751	f	f	\N
3cda5cf9-91cf-4fab-8d52-302ae864d5c4	dc403a70-39d3-4238-99b4-fa3c24cc1879	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	t	2026-05-27 07:22:31.755	2026-05-27 07:22:31.763	f	f	\N
c97d2c0c-9062-463d-82eb-c2997041dc86	d8ffd18a-cac6-41b5-aa18-b2149aff596a	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	t	2026-05-27 07:22:31.767	2026-05-27 07:22:31.775	f	f	\N
8d4e2c8f-1893-4a16-9206-8f30859020ee	ff3eddbb-a2b0-4ff7-aa5d-d21deaf193eb	0a7d2763-fa93-4a49-a430-1e8148da1a37	f	2026-05-27 07:22:31.779	\N	f	f	\N
01c87d80-0014-47e5-bbec-0042a1c63c76	6c3c3eb7-e62a-419a-bac9-ed60feab3f2e	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	f	2026-05-27 07:22:31.783	\N	f	f	\N
51214aa4-ef35-44e8-a21e-95579df96aeb	4399fa2e-9242-4440-a65b-83eabc745516	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	f	2026-05-27 07:22:31.788	\N	f	f	\N
5e23cf9f-780d-4cb9-9102-fc4aab01df69	8cb2cda3-c7ef-4a17-a032-d60bccd91e9d	0a7d2763-fa93-4a49-a430-1e8148da1a37	f	2026-05-27 07:22:31.792	\N	f	f	\N
b58d0f74-4469-4ff9-bb0e-189eb52c7b28	ed896ef2-f6c6-4740-9e5a-0483ae95dc12	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	f	2026-05-27 07:22:31.797	\N	f	f	\N
7f296f8f-7c8d-464a-83b9-907dfa67e2a1	f387b550-7953-41e6-a459-e6d9867cb370	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	t	2026-05-27 07:22:31.802	2026-05-27 07:22:31.81	f	f	\N
65395967-cc04-4dc5-bf7b-2df3fde5c393	ee1d4847-2acf-4232-a8a3-15af28a75179	0a7d2763-fa93-4a49-a430-1e8148da1a37	f	2026-05-27 07:22:31.814	\N	f	f	\N
e0f00479-e80d-4d0e-b05d-305d1bedb8b2	c2715b10-1cc2-4267-b971-26acda8629a3	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	t	2026-05-27 07:22:31.818	2026-05-27 07:22:31.826	f	f	\N
fd201546-d951-43dd-b0ff-9a772365e1f0	a6e6d9ad-4494-4586-b200-d67ec9f76bd5	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	f	2026-05-27 07:22:31.83	\N	f	f	\N
06894689-59ae-42a7-b19f-d9d14f4bd8c0	ce7b3fbc-ae81-4d76-a5fb-86d06b890df5	0a7d2763-fa93-4a49-a430-1e8148da1a37	t	2026-05-27 07:22:31.834	2026-05-27 07:22:31.842	f	f	\N
3c28cf30-185c-40bb-9633-38f05669d284	758244a4-564b-48aa-8da5-b9f7ce214be7	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	t	2026-05-27 07:22:31.846	2026-05-27 07:22:31.855	f	f	\N
33432930-49f4-4ebd-8e8b-b2d5e5d345a6	dff77dfa-9440-4120-a715-9e750773518b	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	f	2026-05-27 07:22:31.859	\N	f	f	\N
8bd5f384-5466-43f0-aa18-fc0742ebfd16	bc69167c-019f-4eba-8125-5b08571b1522	0a7d2763-fa93-4a49-a430-1e8148da1a37	t	2026-05-27 07:22:31.863	2026-05-27 07:22:31.872	f	f	\N
e2bffc6a-3288-4f86-baa1-eafea0689d62	03ddb7da-8cb3-4691-96a1-1b1226df4243	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	f	2026-05-27 07:22:31.876	\N	f	f	\N
d3c9158d-35f2-46d5-b56f-70da3b996714	5e84dc93-ad8b-443a-92ac-d162ee7ad6ae	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	f	2026-05-27 07:22:31.88	\N	f	f	\N
758739ba-17c0-4ecc-974e-01025c345b9a	d93ac77b-885a-46c5-a903-32f53e2842b5	0a7d2763-fa93-4a49-a430-1e8148da1a37	t	2026-05-27 07:22:31.885	2026-05-27 07:22:31.893	f	f	\N
f7c0ca5f-83e4-4800-9101-0d438b047894	34fb9135-e8ee-4a44-a70d-fe61c84449c6	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	f	2026-05-27 07:22:31.897	\N	f	f	\N
ce58e165-de7d-46d5-9510-7ff47401106b	adde770f-68f9-46fc-8ea4-e1763d30f30e	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	f	2026-05-27 07:22:31.901	\N	f	f	\N
a9ee55f1-97a5-4cd9-b337-c315fe6c9a2a	df9d9892-05cc-477f-8080-c5e243c994a1	0a7d2763-fa93-4a49-a430-1e8148da1a37	f	2026-05-27 07:22:31.906	\N	f	f	\N
3a21fe22-071e-412d-9994-d51d2b0a8636	4fc7c5b9-409d-460e-9a38-9070a782e0fb	517a420a-ad1d-4bc9-bbaf-7b65c82916b5	t	2026-05-27 07:22:31.911	2026-05-27 07:22:31.919	f	f	\N
1af4b544-83fd-4c0b-a3ba-cbf12af341a1	e17f9713-a632-425c-a64d-2d6c0367d53f	a04f0fa3-1f4f-4bad-9fa2-681efaa1b496	t	2026-05-27 07:22:31.923	2026-05-27 07:22:31.931	f	f	\N
\.


--
-- Data for Name: JudgePanelRequirement; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."JudgePanelRequirement" (id, "competitionId", "minJudges", "minNationalTierJudges", "requireCrossCategory", "createdAt") FROM stdin;
\.


--
-- Data for Name: JudgePayout; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."JudgePayout" (id, "judgeId", amount, status, "assignedCount", "paymentDate", "transactionRef", "adminNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."Notification" (id, "userId", type, title, body, read, "readAt", "actionUrl", "registrationId", "assignmentId", "certificateId", "qualificationId", "createdAt") FROM stdin;
\.


--
-- Data for Name: NotificationPreference; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."NotificationPreference" (id, "userId", type, channel, enabled, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Parent; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."Parent" (id, "userId", name, phone, address, city, state, "postalCode", country, "profileImageUrl", "preferredState", "createdAt", "updatedAt") FROM stdin;
eb56c52d-c159-41cc-b93c-d3cd255a52db	ea1ce600-110f-4224-859f-77aaa4ba0c58	Test Parent	9876543210	123 Test Street	Bangalore	Karnataka	560001	India	\N	\N	2026-05-27 07:22:30.707	2026-05-27 07:22:30.707
\.


--
-- Data for Name: PhysicalPrizeOrder; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."PhysicalPrizeOrder" (id, "prizeAwardId", "recipientName", "recipientPhone", "recipientAddress", "recipientCity", "recipientState", "recipientPostalCode", "recipientCountry", "packageSKU", "weightGrams", "lengthCm", "widthCm", "heightCm", "shiprocketOrderId", "shiprocketShipmentId", "shiprocketLabelUrl", "awbNumber", "courierName", "estimatedDelivery", status, "batchId", "labelGeneratedAt", "pickupScheduledAt", "dispatchedAt", "deliveredAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PrizeAward; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."PrizeAward" (id, "prizeItemId", "registrationId", rank, "awardedAt", "isDispatched", "dispatchedAt", "courierTrackingId", "createdAt") FROM stdin;
\.


--
-- Data for Name: PrizeItem; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."PrizeItem" (id, "prizePoolId", rank, type, title, description, "estimatedValue", "isPhysical", "imageUrl", "perCategory", "createdAt") FROM stdin;
\.


--
-- Data for Name: PrizePool; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."PrizePool" (id, "competitionId", title, description, "isPublished", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: QualificationRule; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."QualificationRule" (id, "stateCompetitionId", "nationalCompetitionId", "slotsPerCategory", "wildCardSlots", "minScoreThreshold", "discountPercent", "slotExpiryDays", "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: QualificationSlot; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."QualificationSlot" (id, "qualificationRuleId", "registrationId", "studentId", "nationalCompetitionId", status, "offeredAt", "expiresAt", "acceptedAt", "nationalRegistrationId", "isWildCard", "createdAt") FROM stdin;
\.


--
-- Data for Name: Registration; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."Registration" (id, "studentId", "competitionCategoryId", "fbPostUrl", "paymentStatus", "registrationId", status, "scoringFinalized", "conflictResolved", "finalRank", "finalScore", "discountApplied", "createdAt", "updatedAt") FROM stdin;
d946de6e-6cfc-4de9-aae0-03c518e2fbf1	73a0b323-e62f-4c52-bf06-973e840ffa54	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-73a0b323-e62f-4c52-bf06-973e840ffa54-0	SUCCESS	REG-AB40399E-001	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:30.903	2026-05-27 07:22:30.903
cec98f57-4d28-4866-b7c7-7674938709e0	a3606a81-faef-4bd1-b535-b2b87e68c020	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-a3606a81-faef-4bd1-b535-b2b87e68c020-1	SUCCESS	REG-AB40399E-002	VERIFIED	f	f	1	\N	\N	2026-05-27 07:22:30.91	2026-05-27 07:22:30.91
6f7258b0-9bdd-41e3-8bd6-d11bc331ddfe	f43135df-917c-42ba-9152-06416a45b372	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-f43135df-917c-42ba-9152-06416a45b372-2	PENDING	REG-AB40399E-003	VERIFIED	f	f	\N	97.0255	\N	2026-05-27 07:22:30.915	2026-05-27 07:22:30.915
9f7ea1cb-342a-417a-aaa9-7d3c62b41824	1cd55a4b-ce74-4591-a784-4e1c6c0ba5b9	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-1cd55a4b-ce74-4591-a784-4e1c6c0ba5b9-3	PENDING	REG-AB40399E-004	VERIFIED	f	f	1	99.1823	\N	2026-05-27 07:22:30.92	2026-05-27 07:22:30.92
5a69a43f-8970-4286-b388-843719861a15	80031172-65cd-4241-bcd0-96b69d587a3d	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-80031172-65cd-4241-bcd0-96b69d587a3d-4	SUCCESS	REG-AB40399E-005	VERIFIED	f	f	3	\N	\N	2026-05-27 07:22:30.924	2026-05-27 07:22:30.924
7183629b-8eb3-4569-bb7d-899fa946975a	e8dfc7ed-4421-44e2-9a44-df98f4b278a6	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-e8dfc7ed-4421-44e2-9a44-df98f4b278a6-5	SUCCESS	REG-AB40399E-006	VERIFIED	f	f	\N	99.2001	\N	2026-05-27 07:22:30.929	2026-05-27 07:22:30.929
54c36990-18bb-49ca-b366-5e4e18e1ab6f	855b5a8c-7453-4f4f-bae5-4fd521bd70d8	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-855b5a8c-7453-4f4f-bae5-4fd521bd70d8-6	SUCCESS	REG-AB40399E-007	PENDING_VERIFICATION	f	f	1	93.6581	\N	2026-05-27 07:22:30.934	2026-05-27 07:22:30.934
9abd8fae-9754-41bb-8e7d-e64f5a26371c	d1cf47a8-af33-4696-bf52-c3dd79644f00	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-d1cf47a8-af33-4696-bf52-c3dd79644f00-7	SUCCESS	REG-AB40399E-008	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:30.939	2026-05-27 07:22:30.939
074d2048-f0e6-48bd-a453-987ec4aeeb12	a1812ece-8bd4-4f43-9040-4316c38ba811	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-a1812ece-8bd4-4f43-9040-4316c38ba811-8	SUCCESS	REG-AB40399E-009	VERIFIED	f	f	1	88.3674	\N	2026-05-27 07:22:30.943	2026-05-27 07:22:30.943
3635eab6-34f8-4870-9b29-3d461987e589	576f1daa-030a-448b-8b80-0bd279b8f6fa	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-576f1daa-030a-448b-8b80-0bd279b8f6fa-9	SUCCESS	REG-AB40399E-010	VERIFIED	f	f	3	85.2976	\N	2026-05-27 07:22:30.948	2026-05-27 07:22:30.948
7ab53fad-b649-4e65-a041-e50d8d7db181	9b9d9bd3-fd1d-40cc-b36e-d7035beb9fdf	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-9b9d9bd3-fd1d-40cc-b36e-d7035beb9fdf-10	SUCCESS	REG-AB40399E-011	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:30.952	2026-05-27 07:22:30.952
9f3a0610-18f4-4064-b315-d703d660d1b4	18acb99c-97a3-4ce3-b0b9-29c32ac47a3c	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-18acb99c-97a3-4ce3-b0b9-29c32ac47a3c-11	SUCCESS	REG-AB40399E-012	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:30.957	2026-05-27 07:22:30.957
4fd02343-c431-4915-a232-b7666459f9e2	47bdf064-0159-4573-92fe-eedd501d63ab	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-47bdf064-0159-4573-92fe-eedd501d63ab-12	SUCCESS	REG-AB40399E-013	PENDING_VERIFICATION	f	f	3	88.3848	\N	2026-05-27 07:22:30.961	2026-05-27 07:22:30.961
3c6c1f4b-e103-4d44-89f9-362dd2549a4d	4130fa28-388f-481f-af35-8fd0189eae47	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-4130fa28-388f-481f-af35-8fd0189eae47-13	PENDING	REG-AB40399E-014	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:30.966	2026-05-27 07:22:30.966
43d9b010-2763-4ef1-9817-5a9cd9ab3ace	daf566b7-517d-419b-b7a7-6e8ad234e1a7	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-daf566b7-517d-419b-b7a7-6e8ad234e1a7-14	PENDING	REG-AB40399E-015	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:30.971	2026-05-27 07:22:30.971
83e0095e-2860-4ff1-807b-affb0de385af	d6491936-22f1-4abc-8e48-ea8ab7628bbc	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-d6491936-22f1-4abc-8e48-ea8ab7628bbc-15	SUCCESS	REG-AB40399E-016	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:30.975	2026-05-27 07:22:30.975
875f1da9-58b6-480a-8a09-0400c0a65d8e	4f9a5f4b-f668-4584-a884-1ef5de3f210c	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-4f9a5f4b-f668-4584-a884-1ef5de3f210c-16	SUCCESS	REG-AB40399E-017	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:30.98	2026-05-27 07:22:30.98
d5d18daf-3266-4f1c-92ec-5c206c3f8f72	2f8e41db-f2dc-4e82-911a-75592761cf43	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-2f8e41db-f2dc-4e82-911a-75592761cf43-17	SUCCESS	REG-AB40399E-018	VERIFIED	f	f	\N	94.1265	\N	2026-05-27 07:22:30.984	2026-05-27 07:22:30.984
26531f00-687e-4fc1-86cb-8eb6fd6af74f	1b3b98c2-e462-4872-b1a2-2a5bc2220675	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-1b3b98c2-e462-4872-b1a2-2a5bc2220675-18	SUCCESS	REG-AB40399E-019	VERIFIED	f	f	\N	96.0840	\N	2026-05-27 07:22:30.989	2026-05-27 07:22:30.989
78334c93-eea9-4c6a-ab27-12ae06aaa9d1	170e68cc-cb94-4fc2-a033-81bd19367eb8	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-170e68cc-cb94-4fc2-a033-81bd19367eb8-19	SUCCESS	REG-AB40399E-020	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:30.993	2026-05-27 07:22:30.993
af951c54-29c4-4bf1-9d56-57c9640408e3	6a7353d7-5157-4053-9a9b-f0cfdd0fc53d	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-6a7353d7-5157-4053-9a9b-f0cfdd0fc53d-20	SUCCESS	REG-AB40399E-021	VERIFIED	f	f	\N	87.8353	\N	2026-05-27 07:22:30.998	2026-05-27 07:22:30.998
babc0ab3-e1df-4f29-9a8e-0e08a76ecd5b	f416cea5-2562-407c-8285-fab2e91668f8	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-f416cea5-2562-407c-8285-fab2e91668f8-21	SUCCESS	REG-AB40399E-022	VERIFIED	f	f	3	\N	\N	2026-05-27 07:22:31.003	2026-05-27 07:22:31.003
aadcaa93-5de1-4263-b687-1f80ce4974e9	7d6e0983-5318-4500-850c-3ec4cd158a84	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-7d6e0983-5318-4500-850c-3ec4cd158a84-22	SUCCESS	REG-AB40399E-023	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.007	2026-05-27 07:22:31.007
9443b2ff-3cd7-4fd2-b212-8e5b8eff6100	a0a3bebb-2a9c-4d41-a8e4-78810b770fd3	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-a0a3bebb-2a9c-4d41-a8e4-78810b770fd3-23	SUCCESS	REG-AB40399E-024	PENDING_VERIFICATION	f	f	3	\N	\N	2026-05-27 07:22:31.012	2026-05-27 07:22:31.012
f3f71f61-3af7-4d55-858a-e65c449571a3	3d8a3f74-aad2-4d09-926a-1e976cb74a3e	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-3d8a3f74-aad2-4d09-926a-1e976cb74a3e-24	SUCCESS	REG-AB40399E-025	VERIFIED	f	f	\N	89.3678	\N	2026-05-27 07:22:31.017	2026-05-27 07:22:31.017
98b06b23-2958-4ce3-87bf-51c0665a2c7e	ba0f55e0-42b2-4eed-9a8e-ed2d07279e9f	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-ba0f55e0-42b2-4eed-9a8e-ed2d07279e9f-25	SUCCESS	REG-AB40399E-026	PENDING_VERIFICATION	f	f	\N	\N	\N	2026-05-27 07:22:31.022	2026-05-27 07:22:31.022
550456fe-fddb-481b-9070-7af27d9c467e	5e2451c7-8cc9-464b-b1b2-068d03fe246b	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-5e2451c7-8cc9-464b-b1b2-068d03fe246b-26	SUCCESS	REG-AB40399E-027	VERIFIED	f	f	\N	88.8678	\N	2026-05-27 07:22:31.026	2026-05-27 07:22:31.026
08271f0a-ff95-4b49-886f-6a3bf0c3877f	4ed1f4a3-d7c5-4604-bb3b-41940a7b2a27	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-4ed1f4a3-d7c5-4604-bb3b-41940a7b2a27-27	SUCCESS	REG-AB40399E-028	VERIFIED	f	f	\N	94.8075	\N	2026-05-27 07:22:31.031	2026-05-27 07:22:31.031
b58999cc-5683-4d48-86fc-201e7c815a4a	f48fd01a-89c5-4aeb-bd7e-c5aa52ebad9a	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-f48fd01a-89c5-4aeb-bd7e-c5aa52ebad9a-28	PENDING	REG-AB40399E-029	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.035	2026-05-27 07:22:31.035
a56f85e2-5a66-4d6d-abe4-c818417f2c46	987cf51d-c943-43f7-9bd1-cf20e7115c47	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-987cf51d-c943-43f7-9bd1-cf20e7115c47-29	SUCCESS	REG-AB40399E-030	VERIFIED	f	f	\N	95.1558	\N	2026-05-27 07:22:31.04	2026-05-27 07:22:31.04
7eadbffb-b7da-4f48-b160-fe0f6eba03d6	96e21f76-f7d8-4830-b12d-d9b7e49c21d1	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-96e21f76-f7d8-4830-b12d-d9b7e49c21d1-30	PENDING	REG-AB40399E-031	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.045	2026-05-27 07:22:31.045
d5247578-fd43-49aa-bba9-e62a54da7766	9a38f234-c6b4-446c-8d83-89ac346977f8	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-9a38f234-c6b4-446c-8d83-89ac346977f8-31	SUCCESS	REG-AB40399E-032	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.05	2026-05-27 07:22:31.05
02be8c02-1a2b-4645-afed-5ed78996df91	bf00a336-4daa-499c-8e94-70af4abe9f38	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-bf00a336-4daa-499c-8e94-70af4abe9f38-32	SUCCESS	REG-AB40399E-033	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.054	2026-05-27 07:22:31.054
62d58b0e-55b2-4ef8-a00c-d2902ea7e98e	48d693b2-c153-4c7a-a6f7-8f0b2bc54b96	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-48d693b2-c153-4c7a-a6f7-8f0b2bc54b96-33	PENDING	REG-AB40399E-034	VERIFIED	f	f	\N	98.6855	\N	2026-05-27 07:22:31.059	2026-05-27 07:22:31.059
3c2f90dd-5e1e-4aab-816f-1d08629b943e	c91545e3-f126-463c-bf86-4a83b8e8940a	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-c91545e3-f126-463c-bf86-4a83b8e8940a-34	SUCCESS	REG-AB40399E-035	VERIFIED	f	f	1	\N	\N	2026-05-27 07:22:31.064	2026-05-27 07:22:31.064
61a7df6c-f278-4547-bd3c-fc2de97f1c0a	9c0de5c5-f9cb-4d55-8f2f-d52822a2ad04	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-9c0de5c5-f9cb-4d55-8f2f-d52822a2ad04-35	SUCCESS	REG-AB40399E-036	VERIFIED	f	f	3	\N	\N	2026-05-27 07:22:31.068	2026-05-27 07:22:31.068
a25a9af0-bb2e-4d0b-b845-3a3082cd8a64	d16dc45e-694a-4c8d-a461-2bf466526417	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-d16dc45e-694a-4c8d-a461-2bf466526417-36	SUCCESS	REG-AB40399E-037	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.073	2026-05-27 07:22:31.073
05e8861e-f830-4872-b863-00d6e3cdd605	b91bbd5d-6a19-4eba-9dbb-063be02eb746	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-b91bbd5d-6a19-4eba-9dbb-063be02eb746-37	SUCCESS	REG-AB40399E-038	VERIFIED	f	f	3	93.1119	\N	2026-05-27 07:22:31.078	2026-05-27 07:22:31.078
8b02e8b3-3d8b-40ef-b259-7180bc96dcb1	6cd32227-6841-4d1e-a7ee-227037d3923f	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-6cd32227-6841-4d1e-a7ee-227037d3923f-38	SUCCESS	REG-AB40399E-039	VERIFIED	f	f	1	\N	\N	2026-05-27 07:22:31.082	2026-05-27 07:22:31.082
21ff98be-fd96-47f3-828a-783f7ce89c0a	ac6ba727-476d-4a6e-93ba-bfa1590f2af4	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-ac6ba727-476d-4a6e-93ba-bfa1590f2af4-39	PENDING	REG-AB40399E-040	VERIFIED	f	f	2	\N	\N	2026-05-27 07:22:31.087	2026-05-27 07:22:31.087
a13952fb-e6d4-43aa-a47f-34b4c12003a6	2ba5f982-28b4-41fa-8204-4388a0acbca4	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-2ba5f982-28b4-41fa-8204-4388a0acbca4-40	PENDING	REG-AB40399E-041	VERIFIED	f	f	1	\N	\N	2026-05-27 07:22:31.091	2026-05-27 07:22:31.091
9a6aca32-2f6e-4157-ab0d-41950c126374	787d8808-814a-4415-971f-882aa9bc5980	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-787d8808-814a-4415-971f-882aa9bc5980-41	SUCCESS	REG-AB40399E-042	VERIFIED	f	f	1	\N	\N	2026-05-27 07:22:31.097	2026-05-27 07:22:31.097
6a391489-f6fa-4584-8a1d-0e5aa1928e50	e84adebf-99e9-4dc7-bf35-579e34e42bdc	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-e84adebf-99e9-4dc7-bf35-579e34e42bdc-42	PENDING	REG-AB40399E-043	VERIFIED	f	f	\N	90.3651	\N	2026-05-27 07:22:31.102	2026-05-27 07:22:31.102
76a81f73-52a7-4fe6-a342-95073e8f863e	5f663612-952e-42bd-be64-a05af7f22d85	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-5f663612-952e-42bd-be64-a05af7f22d85-43	SUCCESS	REG-AB40399E-044	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.106	2026-05-27 07:22:31.106
81bddb65-b18e-4c5e-a382-2ed499d75c1a	76f9e195-8f5f-4d6c-a4f4-5f9fcdac675d	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-76f9e195-8f5f-4d6c-a4f4-5f9fcdac675d-44	PENDING	REG-AB40399E-045	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.112	2026-05-27 07:22:31.112
30c6afba-065d-4554-98c2-39b8d087a386	43b75f9d-cd5f-421f-ae1d-cc6ea1e4b072	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-43b75f9d-cd5f-421f-ae1d-cc6ea1e4b072-45	SUCCESS	REG-AB40399E-046	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.116	2026-05-27 07:22:31.116
07791184-0553-445a-ae76-6d953cb090f0	032c2e4d-4fc7-4ce8-b171-8184a1e6a3ed	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-032c2e4d-4fc7-4ce8-b171-8184a1e6a3ed-46	SUCCESS	REG-AB40399E-047	PENDING_VERIFICATION	f	f	3	\N	\N	2026-05-27 07:22:31.121	2026-05-27 07:22:31.121
aa266f31-90d7-4858-913c-008659acb420	4355eb00-6ef1-460d-9e37-d6271209c2c7	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-4355eb00-6ef1-460d-9e37-d6271209c2c7-47	PENDING	REG-AB40399E-048	VERIFIED	f	f	2	\N	\N	2026-05-27 07:22:31.126	2026-05-27 07:22:31.126
5c2864d2-ad03-4174-858e-a66ac3b81c49	efe7d511-676f-496e-8549-19545b2bc349	dec837da-5d1c-417e-ad2c-fe3f54bc2fa5	https://facebook.com/post-efe7d511-676f-496e-8549-19545b2bc349-48	SUCCESS	REG-AB40399E-049	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.13	2026-05-27 07:22:31.13
27098952-afc2-45ae-8648-0ca1a7cfbf21	adc20034-f899-4af1-b0f3-592cc22c82f6	3d4f2682-837b-4df6-8461-7e5bb413158f	https://facebook.com/post-adc20034-f899-4af1-b0f3-592cc22c82f6-49	PENDING	REG-AB40399E-050	VERIFIED	f	f	1	87.0610	\N	2026-05-27 07:22:31.135	2026-05-27 07:22:31.135
4f5b8961-9b0d-4fa3-b607-d03817e7a383	73a0b323-e62f-4c52-bf06-973e840ffa54	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-73a0b323-e62f-4c52-bf06-973e840ffa54-comp2-0	SUCCESS	REG-6819DB14-001	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.14	2026-05-27 07:22:31.14
1b58274a-b849-4b20-9b50-edad13418fe8	a3606a81-faef-4bd1-b535-b2b87e68c020	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-a3606a81-faef-4bd1-b535-b2b87e68c020-comp2-1	PENDING	REG-6819DB14-002	VERIFIED	f	f	1	\N	\N	2026-05-27 07:22:31.144	2026-05-27 07:22:31.144
862a87a2-4c60-4a62-a260-e3fc958bd640	f43135df-917c-42ba-9152-06416a45b372	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-f43135df-917c-42ba-9152-06416a45b372-comp2-2	SUCCESS	REG-6819DB14-003	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.149	2026-05-27 07:22:31.149
3b9a2028-0650-449f-8845-f20f60e70721	1cd55a4b-ce74-4591-a784-4e1c6c0ba5b9	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-1cd55a4b-ce74-4591-a784-4e1c6c0ba5b9-comp2-3	SUCCESS	REG-6819DB14-004	VERIFIED	f	f	3	\N	\N	2026-05-27 07:22:31.154	2026-05-27 07:22:31.154
4885972d-5fdc-4386-ab93-a9c10afb64c5	80031172-65cd-4241-bcd0-96b69d587a3d	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-80031172-65cd-4241-bcd0-96b69d587a3d-comp2-4	PENDING	REG-6819DB14-005	VERIFIED	f	f	1	89.4196	\N	2026-05-27 07:22:31.158	2026-05-27 07:22:31.158
d0766cd3-b7e7-4e05-ba5c-51fa13063537	e8dfc7ed-4421-44e2-9a44-df98f4b278a6	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-e8dfc7ed-4421-44e2-9a44-df98f4b278a6-comp2-5	PENDING	REG-6819DB14-006	VERIFIED	f	f	2	99.7047	\N	2026-05-27 07:22:31.163	2026-05-27 07:22:31.163
154b941e-6eb3-44c2-a7e1-c2640be92e9e	855b5a8c-7453-4f4f-bae5-4fd521bd70d8	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-855b5a8c-7453-4f4f-bae5-4fd521bd70d8-comp2-6	PENDING	REG-6819DB14-007	VERIFIED	f	f	2	90.7357	\N	2026-05-27 07:22:31.168	2026-05-27 07:22:31.168
b38ba0eb-df20-42a8-a2f8-961942f067a7	d1cf47a8-af33-4696-bf52-c3dd79644f00	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-d1cf47a8-af33-4696-bf52-c3dd79644f00-comp2-7	SUCCESS	REG-6819DB14-008	VERIFIED	f	f	2	85.8463	\N	2026-05-27 07:22:31.172	2026-05-27 07:22:31.172
abae547f-6f6b-4799-883f-c1b74508aeb0	a1812ece-8bd4-4f43-9040-4316c38ba811	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-a1812ece-8bd4-4f43-9040-4316c38ba811-comp2-8	SUCCESS	REG-6819DB14-009	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.177	2026-05-27 07:22:31.177
e7b0bf68-65fa-4dcd-88df-ba6fe169e5a7	576f1daa-030a-448b-8b80-0bd279b8f6fa	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-576f1daa-030a-448b-8b80-0bd279b8f6fa-comp2-9	SUCCESS	REG-6819DB14-010	VERIFIED	f	f	\N	99.0362	\N	2026-05-27 07:22:31.181	2026-05-27 07:22:31.181
97a7121b-dfa0-49a3-9fef-16a22a7b8c33	9b9d9bd3-fd1d-40cc-b36e-d7035beb9fdf	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-9b9d9bd3-fd1d-40cc-b36e-d7035beb9fdf-comp2-10	PENDING	REG-6819DB14-011	VERIFIED	f	f	2	\N	\N	2026-05-27 07:22:31.186	2026-05-27 07:22:31.186
11dac50f-3517-4f22-b342-6232a5d60b31	18acb99c-97a3-4ce3-b0b9-29c32ac47a3c	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-18acb99c-97a3-4ce3-b0b9-29c32ac47a3c-comp2-11	SUCCESS	REG-6819DB14-012	VERIFIED	f	f	\N	86.2843	\N	2026-05-27 07:22:31.19	2026-05-27 07:22:31.19
6eb0ca87-8558-45ad-b578-8b4f77bb1ba0	47bdf064-0159-4573-92fe-eedd501d63ab	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-47bdf064-0159-4573-92fe-eedd501d63ab-comp2-12	SUCCESS	REG-6819DB14-013	VERIFIED	f	f	\N	89.1858	\N	2026-05-27 07:22:31.195	2026-05-27 07:22:31.195
4436af24-930a-453e-bbae-20a406ef1d8f	4130fa28-388f-481f-af35-8fd0189eae47	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-4130fa28-388f-481f-af35-8fd0189eae47-comp2-13	SUCCESS	REG-6819DB14-014	PENDING_VERIFICATION	f	f	2	\N	\N	2026-05-27 07:22:31.2	2026-05-27 07:22:31.2
bb75bf2c-90ed-4cc7-9a75-0c041dda49ee	daf566b7-517d-419b-b7a7-6e8ad234e1a7	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-daf566b7-517d-419b-b7a7-6e8ad234e1a7-comp2-14	SUCCESS	REG-6819DB14-015	VERIFIED	f	f	2	85.9970	\N	2026-05-27 07:22:31.204	2026-05-27 07:22:31.204
3019ff06-11e9-4ffc-81eb-0aae899acb57	d6491936-22f1-4abc-8e48-ea8ab7628bbc	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-d6491936-22f1-4abc-8e48-ea8ab7628bbc-comp2-15	SUCCESS	REG-6819DB14-016	PENDING_VERIFICATION	f	f	\N	\N	\N	2026-05-27 07:22:31.209	2026-05-27 07:22:31.209
72b0c408-eb57-4366-9c65-a308c0fb5c32	4f9a5f4b-f668-4584-a884-1ef5de3f210c	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-4f9a5f4b-f668-4584-a884-1ef5de3f210c-comp2-16	SUCCESS	REG-6819DB14-017	VERIFIED	f	f	1	98.3501	\N	2026-05-27 07:22:31.214	2026-05-27 07:22:31.214
846a5b34-53ba-48a5-95ca-d92216ee018b	2f8e41db-f2dc-4e82-911a-75592761cf43	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-2f8e41db-f2dc-4e82-911a-75592761cf43-comp2-17	SUCCESS	REG-6819DB14-018	VERIFIED	f	f	\N	86.3168	\N	2026-05-27 07:22:31.219	2026-05-27 07:22:31.219
d7ac1a10-3cc8-4ae1-8148-d72de0446576	1b3b98c2-e462-4872-b1a2-2a5bc2220675	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-1b3b98c2-e462-4872-b1a2-2a5bc2220675-comp2-18	SUCCESS	REG-6819DB14-019	PENDING_VERIFICATION	f	f	3	81.1707	\N	2026-05-27 07:22:31.223	2026-05-27 07:22:31.223
7c392d74-ff22-4256-b4e6-8d53b779852f	170e68cc-cb94-4fc2-a033-81bd19367eb8	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-170e68cc-cb94-4fc2-a033-81bd19367eb8-comp2-19	PENDING	REG-6819DB14-020	VERIFIED	f	f	\N	98.6512	\N	2026-05-27 07:22:31.228	2026-05-27 07:22:31.228
518c0eb7-cdb3-402a-863c-0c185eb2883f	6a7353d7-5157-4053-9a9b-f0cfdd0fc53d	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-6a7353d7-5157-4053-9a9b-f0cfdd0fc53d-comp2-20	SUCCESS	REG-6819DB14-021	VERIFIED	f	f	1	\N	\N	2026-05-27 07:22:31.233	2026-05-27 07:22:31.233
1d4302ad-4657-42af-a938-f40085184127	f416cea5-2562-407c-8285-fab2e91668f8	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-f416cea5-2562-407c-8285-fab2e91668f8-comp2-21	PENDING	REG-6819DB14-022	VERIFIED	f	f	3	83.5242	\N	2026-05-27 07:22:31.238	2026-05-27 07:22:31.238
9bb9027a-1499-4127-95fe-975c415cc502	7d6e0983-5318-4500-850c-3ec4cd158a84	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-7d6e0983-5318-4500-850c-3ec4cd158a84-comp2-22	SUCCESS	REG-6819DB14-023	VERIFIED	f	f	3	95.0946	\N	2026-05-27 07:22:31.243	2026-05-27 07:22:31.243
24b0f229-79b4-431d-a3b3-f93d45d59c11	a0a3bebb-2a9c-4d41-a8e4-78810b770fd3	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-a0a3bebb-2a9c-4d41-a8e4-78810b770fd3-comp2-23	SUCCESS	REG-6819DB14-024	VERIFIED	f	f	1	\N	\N	2026-05-27 07:22:31.248	2026-05-27 07:22:31.248
36a898d3-db15-4f12-9a2e-408f09167ca3	3d8a3f74-aad2-4d09-926a-1e976cb74a3e	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-3d8a3f74-aad2-4d09-926a-1e976cb74a3e-comp2-24	SUCCESS	REG-6819DB14-025	VERIFIED	f	f	3	90.9393	\N	2026-05-27 07:22:31.252	2026-05-27 07:22:31.252
c3484e46-3a70-4df7-bb49-0ecba329c179	ba0f55e0-42b2-4eed-9a8e-ed2d07279e9f	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-ba0f55e0-42b2-4eed-9a8e-ed2d07279e9f-comp2-25	PENDING	REG-6819DB14-026	VERIFIED	f	f	1	\N	\N	2026-05-27 07:22:31.257	2026-05-27 07:22:31.257
8457aad6-0eb3-4520-a416-24e1c13ce7ab	5e2451c7-8cc9-464b-b1b2-068d03fe246b	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-5e2451c7-8cc9-464b-b1b2-068d03fe246b-comp2-26	SUCCESS	REG-6819DB14-027	VERIFIED	f	f	1	\N	\N	2026-05-27 07:22:31.262	2026-05-27 07:22:31.262
dc403a70-39d3-4238-99b4-fa3c24cc1879	4ed1f4a3-d7c5-4604-bb3b-41940a7b2a27	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-4ed1f4a3-d7c5-4604-bb3b-41940a7b2a27-comp2-27	SUCCESS	REG-6819DB14-028	VERIFIED	f	f	2	\N	\N	2026-05-27 07:22:31.267	2026-05-27 07:22:31.267
d8ffd18a-cac6-41b5-aa18-b2149aff596a	f48fd01a-89c5-4aeb-bd7e-c5aa52ebad9a	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-f48fd01a-89c5-4aeb-bd7e-c5aa52ebad9a-comp2-28	SUCCESS	REG-6819DB14-029	VERIFIED	f	f	1	97.5819	\N	2026-05-27 07:22:31.272	2026-05-27 07:22:31.272
ff3eddbb-a2b0-4ff7-aa5d-d21deaf193eb	987cf51d-c943-43f7-9bd1-cf20e7115c47	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-987cf51d-c943-43f7-9bd1-cf20e7115c47-comp2-29	SUCCESS	REG-6819DB14-030	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.276	2026-05-27 07:22:31.276
6c3c3eb7-e62a-419a-bac9-ed60feab3f2e	96e21f76-f7d8-4830-b12d-d9b7e49c21d1	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-96e21f76-f7d8-4830-b12d-d9b7e49c21d1-comp2-30	SUCCESS	REG-6819DB14-031	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.282	2026-05-27 07:22:31.282
4399fa2e-9242-4440-a65b-83eabc745516	9a38f234-c6b4-446c-8d83-89ac346977f8	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-9a38f234-c6b4-446c-8d83-89ac346977f8-comp2-31	PENDING	REG-6819DB14-032	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.287	2026-05-27 07:22:31.287
8cb2cda3-c7ef-4a17-a032-d60bccd91e9d	bf00a336-4daa-499c-8e94-70af4abe9f38	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-bf00a336-4daa-499c-8e94-70af4abe9f38-comp2-32	SUCCESS	REG-6819DB14-033	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.292	2026-05-27 07:22:31.292
ed896ef2-f6c6-4740-9e5a-0483ae95dc12	48d693b2-c153-4c7a-a6f7-8f0b2bc54b96	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-48d693b2-c153-4c7a-a6f7-8f0b2bc54b96-comp2-33	PENDING	REG-6819DB14-034	VERIFIED	f	f	\N	92.2882	\N	2026-05-27 07:22:31.297	2026-05-27 07:22:31.297
f387b550-7953-41e6-a459-e6d9867cb370	c91545e3-f126-463c-bf86-4a83b8e8940a	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-c91545e3-f126-463c-bf86-4a83b8e8940a-comp2-34	SUCCESS	REG-6819DB14-035	VERIFIED	f	f	\N	98.5429	\N	2026-05-27 07:22:31.301	2026-05-27 07:22:31.301
ee1d4847-2acf-4232-a8a3-15af28a75179	9c0de5c5-f9cb-4d55-8f2f-d52822a2ad04	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-9c0de5c5-f9cb-4d55-8f2f-d52822a2ad04-comp2-35	PENDING	REG-6819DB14-036	VERIFIED	f	f	2	\N	\N	2026-05-27 07:22:31.306	2026-05-27 07:22:31.306
c2715b10-1cc2-4267-b971-26acda8629a3	d16dc45e-694a-4c8d-a461-2bf466526417	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-d16dc45e-694a-4c8d-a461-2bf466526417-comp2-36	SUCCESS	REG-6819DB14-037	VERIFIED	f	f	2	82.9233	\N	2026-05-27 07:22:31.311	2026-05-27 07:22:31.311
a6e6d9ad-4494-4586-b200-d67ec9f76bd5	b91bbd5d-6a19-4eba-9dbb-063be02eb746	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-b91bbd5d-6a19-4eba-9dbb-063be02eb746-comp2-37	SUCCESS	REG-6819DB14-038	PENDING_VERIFICATION	f	f	\N	\N	\N	2026-05-27 07:22:31.315	2026-05-27 07:22:31.315
ce7b3fbc-ae81-4d76-a5fb-86d06b890df5	6cd32227-6841-4d1e-a7ee-227037d3923f	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-6cd32227-6841-4d1e-a7ee-227037d3923f-comp2-38	SUCCESS	REG-6819DB14-039	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.32	2026-05-27 07:22:31.32
758244a4-564b-48aa-8da5-b9f7ce214be7	ac6ba727-476d-4a6e-93ba-bfa1590f2af4	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-ac6ba727-476d-4a6e-93ba-bfa1590f2af4-comp2-39	SUCCESS	REG-6819DB14-040	VERIFIED	f	f	\N	96.2616	\N	2026-05-27 07:22:31.325	2026-05-27 07:22:31.325
dff77dfa-9440-4120-a715-9e750773518b	2ba5f982-28b4-41fa-8204-4388a0acbca4	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-2ba5f982-28b4-41fa-8204-4388a0acbca4-comp2-40	SUCCESS	REG-6819DB14-041	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.33	2026-05-27 07:22:31.33
bc69167c-019f-4eba-8125-5b08571b1522	787d8808-814a-4415-971f-882aa9bc5980	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-787d8808-814a-4415-971f-882aa9bc5980-comp2-41	PENDING	REG-6819DB14-042	VERIFIED	f	f	1	\N	\N	2026-05-27 07:22:31.334	2026-05-27 07:22:31.334
03ddb7da-8cb3-4691-96a1-1b1226df4243	e84adebf-99e9-4dc7-bf35-579e34e42bdc	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-e84adebf-99e9-4dc7-bf35-579e34e42bdc-comp2-42	PENDING	REG-6819DB14-043	VERIFIED	f	f	3	\N	\N	2026-05-27 07:22:31.339	2026-05-27 07:22:31.339
5e84dc93-ad8b-443a-92ac-d162ee7ad6ae	5f663612-952e-42bd-be64-a05af7f22d85	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-5f663612-952e-42bd-be64-a05af7f22d85-comp2-43	SUCCESS	REG-6819DB14-044	VERIFIED	f	f	2	\N	\N	2026-05-27 07:22:31.344	2026-05-27 07:22:31.344
d93ac77b-885a-46c5-a903-32f53e2842b5	76f9e195-8f5f-4d6c-a4f4-5f9fcdac675d	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-76f9e195-8f5f-4d6c-a4f4-5f9fcdac675d-comp2-44	PENDING	REG-6819DB14-045	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.348	2026-05-27 07:22:31.348
34fb9135-e8ee-4a44-a70d-fe61c84449c6	43b75f9d-cd5f-421f-ae1d-cc6ea1e4b072	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-43b75f9d-cd5f-421f-ae1d-cc6ea1e4b072-comp2-45	PENDING	REG-6819DB14-046	VERIFIED	f	f	1	94.4835	\N	2026-05-27 07:22:31.353	2026-05-27 07:22:31.353
adde770f-68f9-46fc-8ea4-e1763d30f30e	032c2e4d-4fc7-4ce8-b171-8184a1e6a3ed	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-032c2e4d-4fc7-4ce8-b171-8184a1e6a3ed-comp2-46	SUCCESS	REG-6819DB14-047	VERIFIED	f	f	3	\N	\N	2026-05-27 07:22:31.358	2026-05-27 07:22:31.358
df9d9892-05cc-477f-8080-c5e243c994a1	4355eb00-6ef1-460d-9e37-d6271209c2c7	90128b72-3db7-4ea4-8fe5-278a5e01bbfc	https://facebook.com/post-4355eb00-6ef1-460d-9e37-d6271209c2c7-comp2-47	SUCCESS	REG-6819DB14-048	PENDING_VERIFICATION	f	f	\N	\N	\N	2026-05-27 07:22:31.363	2026-05-27 07:22:31.363
4fc7c5b9-409d-460e-9a38-9070a782e0fb	efe7d511-676f-496e-8549-19545b2bc349	efad1ffa-2ae7-4349-a2ca-9cc3e62382dc	https://facebook.com/post-efe7d511-676f-496e-8549-19545b2bc349-comp2-48	SUCCESS	REG-6819DB14-049	VERIFIED	f	f	3	\N	\N	2026-05-27 07:22:31.368	2026-05-27 07:22:31.368
e17f9713-a632-425c-a64d-2d6c0367d53f	adc20034-f899-4af1-b0f3-592cc22c82f6	6fa41a03-f42d-4385-859f-fd6b89dbeb4d	https://facebook.com/post-adc20034-f899-4af1-b0f3-592cc22c82f6-comp2-49	PENDING	REG-6819DB14-050	VERIFIED	f	f	\N	\N	\N	2026-05-27 07:22:31.372	2026-05-27 07:22:31.372
\.


--
-- Data for Name: Score; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."Score" (id, "judgeAssignmentId", criteria1, criteria2, criteria3, criteria4, "totalScore", remarks, "createdAt") FROM stdin;
c3113264-ba40-4e4f-b472-c0aff7a992dd	f2da228a-9e92-4e2b-9ff1-e9f528b00eb7	24	2	14	0	40	Good performance	2026-05-27 07:22:31.518
5f56f0d7-6b0a-469c-8698-cf35eea3a63c	5602392e-75a3-429b-a415-a909c31a040e	36	10	23	0	69	Good performance	2026-05-27 07:22:31.533
51431526-ed50-4862-b9b8-2604a15414b8	76bcb132-80e4-4a80-9b0d-6e13f55701cd	18	29	25	0	72	Good performance	2026-05-27 07:22:31.545
c658f823-e0a5-40a3-8fff-b99d4c466651	8796dacf-2d4b-4fa8-983b-6fd948acd57e	22	14	23	0	59	Good performance	2026-05-27 07:22:31.558
33a45fb0-cd1c-468c-9486-4bf4169b9f0e	ffc304fe-7ddb-4cd4-8d4e-ab2312d92ff6	35	20	29	0	84	Good performance	2026-05-27 07:22:31.58
0de425f8-635c-4511-be59-7552f65aa61d	c1309a49-ad8b-4bbf-9ded-59832e7fc5de	28	12	29	0	69	Good performance	2026-05-27 07:22:31.592
5772b989-1dfe-41da-936a-d2c811080250	893f8f9d-adba-407b-b10b-13a152fbfb46	34	11	11	0	56	Good performance	2026-05-27 07:22:31.604
cbcb7500-b190-4a3f-a163-1402251f2c38	e4a2ba5a-e298-4ec0-9227-1284e679a66f	30	23	11	0	64	Good performance	2026-05-27 07:22:31.626
34020b94-6fa4-4188-ab37-8c8ddd4d3aab	0ca942d5-d097-47e6-ba2c-f0f83c01592e	31	10	7	0	48	Good performance	2026-05-27 07:22:31.644
7ffabe56-efe3-459b-a852-f0e4b8ee3d06	a06f02b4-c943-448a-8a86-95d228ba8eae	33	0	19	0	52	Good performance	2026-05-27 07:22:31.676
6d1fec35-e37a-421c-99d6-aab3d8a0f586	2a2ea64b-4013-41e3-aada-5245f42f9de0	34	10	10	0	54	Good performance	2026-05-27 07:22:31.689
4917c237-d507-4ec4-a38a-786485e47598	e5284379-0e5e-4589-8500-7f42780c80de	28	2	24	0	54	Good performance	2026-05-27 07:22:31.701
f1ef004d-568a-4c93-bf94-b8503afd30d0	2d16beef-2ac2-4551-a54c-b7468cd32b7b	14	1	4	0	19	Good performance	2026-05-27 07:22:31.714
7e4451a4-5b7d-49f1-9fa5-a7eba83132fc	ed8cecae-e38b-494a-a2a5-26f8ec25cb53	34	19	5	0	58	Good performance	2026-05-27 07:22:31.73
5d779f0b-1d7b-4e55-a8a8-ef3d7f705d76	3cf00ee1-0496-4306-9aa3-0783f1f57da4	16	0	22	0	38	Good performance	2026-05-27 07:22:31.747
58441e6d-bcc0-4550-bec6-b9fa2209273f	3cda5cf9-91cf-4fab-8d52-302ae864d5c4	16	19	23	0	58	Good performance	2026-05-27 07:22:31.759
c86edfae-8ac4-43d7-9ad7-4d888bddaecf	c97d2c0c-9062-463d-82eb-c2997041dc86	18	20	10	0	48	Good performance	2026-05-27 07:22:31.771
a031aab1-9744-473d-8be7-09e537d70db0	7f296f8f-7c8d-464a-83b9-907dfa67e2a1	22	12	18	0	52	Good performance	2026-05-27 07:22:31.806
871e9418-f5b2-4e9e-9e8f-b062077550c0	e0f00479-e80d-4d0e-b05d-305d1bedb8b2	1	25	18	0	44	Good performance	2026-05-27 07:22:31.823
29ccbe02-9a2d-4a73-a108-fb753b54e1a2	06894689-59ae-42a7-b19f-d9d14f4bd8c0	36	3	25	0	64	Good performance	2026-05-27 07:22:31.839
b43be99a-0249-49c9-b72b-b5e12dea924d	3c28cf30-185c-40bb-9633-38f05669d284	3	24	22	0	49	Good performance	2026-05-27 07:22:31.851
32c32f1f-0693-42cb-959e-2cc84873594d	8bd5f384-5466-43f0-aa18-fc0742ebfd16	5	7	2	0	14	Good performance	2026-05-27 07:22:31.868
bbf79368-19b9-43a8-b5a6-09eacfdcea49	758739ba-17c0-4ecc-974e-01025c345b9a	2	27	18	0	47	Good performance	2026-05-27 07:22:31.889
15a3ee85-2b0e-4f0c-ab2d-3480eb73e9ee	3a21fe22-071e-412d-9994-d51d2b0a8636	21	16	3	0	40	Good performance	2026-05-27 07:22:31.916
d863c86b-099b-41b5-bb43-8b977a4ace82	1af4b544-83fd-4c0b-a3ba-cbf12af341a1	28	13	13	0	54	Good performance	2026-05-27 07:22:31.928
\.


--
-- Data for Name: ShipmentBatch; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."ShipmentBatch" (id, "batchNumber", description, "totalOrders", "processedAt", "manifestUrl", "createdAt") FROM stdin;
\.


--
-- Data for Name: SocialMetric; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."SocialMetric" (id, "registrationId", "likesCount", "commentsCount", "sharesCount", "calculatedEngagement", "lastSyncedAt") FROM stdin;
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."Student" (id, "parentId", name, "dateOfBirth", gender, "disciplineInterests", "createdAt", "updatedAt") FROM stdin;
73a0b323-e62f-4c52-bf06-973e840ffa54	eb56c52d-c159-41cc-b93c-d3cd255a52db	Arjun Kumar 1	2009-01-01 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.714	2026-05-27 07:22:30.714
a3606a81-faef-4bd1-b535-b2b87e68c020	eb56c52d-c159-41cc-b93c-d3cd255a52db	Priya Kumar 2	2010-02-02 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.718	2026-05-27 07:22:30.718
f43135df-917c-42ba-9152-06416a45b372	eb56c52d-c159-41cc-b93c-d3cd255a52db	Aditya Kumar 3	2011-03-03 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.721	2026-05-27 07:22:30.721
1cd55a4b-ce74-4591-a784-4e1c6c0ba5b9	eb56c52d-c159-41cc-b93c-d3cd255a52db	Sneha Kumar 4	2012-04-04 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.724	2026-05-27 07:22:30.724
80031172-65cd-4241-bcd0-96b69d587a3d	eb56c52d-c159-41cc-b93c-d3cd255a52db	Rahul Kumar 5	2009-05-05 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.726	2026-05-27 07:22:30.726
e8dfc7ed-4421-44e2-9a44-df98f4b278a6	eb56c52d-c159-41cc-b93c-d3cd255a52db	Vikram Kumar 6	2010-06-06 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.729	2026-05-27 07:22:30.729
855b5a8c-7453-4f4f-bae5-4fd521bd70d8	eb56c52d-c159-41cc-b93c-d3cd255a52db	Ananya Kumar 7	2011-07-07 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.732	2026-05-27 07:22:30.732
d1cf47a8-af33-4696-bf52-c3dd79644f00	eb56c52d-c159-41cc-b93c-d3cd255a52db	Rohan Kumar 8	2012-08-08 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.735	2026-05-27 07:22:30.735
a1812ece-8bd4-4f43-9040-4316c38ba811	eb56c52d-c159-41cc-b93c-d3cd255a52db	Diya Kumar 9	2009-09-09 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.738	2026-05-27 07:22:30.738
576f1daa-030a-448b-8b80-0bd279b8f6fa	eb56c52d-c159-41cc-b93c-d3cd255a52db	Karan Kumar 10	2010-10-10 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.741	2026-05-27 07:22:30.741
9b9d9bd3-fd1d-40cc-b36e-d7035beb9fdf	eb56c52d-c159-41cc-b93c-d3cd255a52db	Arjun Sharma 11	2011-11-11 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.744	2026-05-27 07:22:30.744
18acb99c-97a3-4ce3-b0b9-29c32ac47a3c	eb56c52d-c159-41cc-b93c-d3cd255a52db	Priya Sharma 12	2012-12-12 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.746	2026-05-27 07:22:30.746
47bdf064-0159-4573-92fe-eedd501d63ab	eb56c52d-c159-41cc-b93c-d3cd255a52db	Aditya Sharma 13	2009-01-13 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.749	2026-05-27 07:22:30.749
4130fa28-388f-481f-af35-8fd0189eae47	eb56c52d-c159-41cc-b93c-d3cd255a52db	Sneha Sharma 14	2010-02-14 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.752	2026-05-27 07:22:30.752
daf566b7-517d-419b-b7a7-6e8ad234e1a7	eb56c52d-c159-41cc-b93c-d3cd255a52db	Rahul Sharma 15	2011-03-15 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.755	2026-05-27 07:22:30.755
d6491936-22f1-4abc-8e48-ea8ab7628bbc	eb56c52d-c159-41cc-b93c-d3cd255a52db	Vikram Sharma 16	2012-04-16 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.758	2026-05-27 07:22:30.758
4f9a5f4b-f668-4584-a884-1ef5de3f210c	eb56c52d-c159-41cc-b93c-d3cd255a52db	Ananya Sharma 17	2009-05-17 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.761	2026-05-27 07:22:30.761
2f8e41db-f2dc-4e82-911a-75592761cf43	eb56c52d-c159-41cc-b93c-d3cd255a52db	Rohan Sharma 18	2010-06-18 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.763	2026-05-27 07:22:30.763
1b3b98c2-e462-4872-b1a2-2a5bc2220675	eb56c52d-c159-41cc-b93c-d3cd255a52db	Diya Sharma 19	2011-07-19 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.766	2026-05-27 07:22:30.766
170e68cc-cb94-4fc2-a033-81bd19367eb8	eb56c52d-c159-41cc-b93c-d3cd255a52db	Karan Sharma 20	2012-08-20 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.769	2026-05-27 07:22:30.769
6a7353d7-5157-4053-9a9b-f0cfdd0fc53d	eb56c52d-c159-41cc-b93c-d3cd255a52db	Arjun Patel 21	2009-09-21 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.772	2026-05-27 07:22:30.772
f416cea5-2562-407c-8285-fab2e91668f8	eb56c52d-c159-41cc-b93c-d3cd255a52db	Priya Patel 22	2010-10-22 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.775	2026-05-27 07:22:30.775
7d6e0983-5318-4500-850c-3ec4cd158a84	eb56c52d-c159-41cc-b93c-d3cd255a52db	Aditya Patel 23	2011-11-23 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.778	2026-05-27 07:22:30.778
a0a3bebb-2a9c-4d41-a8e4-78810b770fd3	eb56c52d-c159-41cc-b93c-d3cd255a52db	Sneha Patel 24	2012-12-24 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.781	2026-05-27 07:22:30.781
3d8a3f74-aad2-4d09-926a-1e976cb74a3e	eb56c52d-c159-41cc-b93c-d3cd255a52db	Rahul Patel 25	2009-01-25 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.784	2026-05-27 07:22:30.784
ba0f55e0-42b2-4eed-9a8e-ed2d07279e9f	eb56c52d-c159-41cc-b93c-d3cd255a52db	Vikram Patel 26	2010-02-26 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.786	2026-05-27 07:22:30.786
5e2451c7-8cc9-464b-b1b2-068d03fe246b	eb56c52d-c159-41cc-b93c-d3cd255a52db	Ananya Patel 27	2011-03-27 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.79	2026-05-27 07:22:30.79
4ed1f4a3-d7c5-4604-bb3b-41940a7b2a27	eb56c52d-c159-41cc-b93c-d3cd255a52db	Rohan Patel 28	2012-04-28 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.793	2026-05-27 07:22:30.793
f48fd01a-89c5-4aeb-bd7e-c5aa52ebad9a	eb56c52d-c159-41cc-b93c-d3cd255a52db	Diya Patel 29	2009-05-01 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.796	2026-05-27 07:22:30.796
987cf51d-c943-43f7-9bd1-cf20e7115c47	eb56c52d-c159-41cc-b93c-d3cd255a52db	Karan Patel 30	2010-06-02 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.799	2026-05-27 07:22:30.799
96e21f76-f7d8-4830-b12d-d9b7e49c21d1	eb56c52d-c159-41cc-b93c-d3cd255a52db	Arjun Gupta 31	2011-07-03 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.801	2026-05-27 07:22:30.801
9a38f234-c6b4-446c-8d83-89ac346977f8	eb56c52d-c159-41cc-b93c-d3cd255a52db	Priya Gupta 32	2012-08-04 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.804	2026-05-27 07:22:30.804
bf00a336-4daa-499c-8e94-70af4abe9f38	eb56c52d-c159-41cc-b93c-d3cd255a52db	Aditya Gupta 33	2009-09-05 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.807	2026-05-27 07:22:30.807
48d693b2-c153-4c7a-a6f7-8f0b2bc54b96	eb56c52d-c159-41cc-b93c-d3cd255a52db	Sneha Gupta 34	2010-10-06 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.81	2026-05-27 07:22:30.81
c91545e3-f126-463c-bf86-4a83b8e8940a	eb56c52d-c159-41cc-b93c-d3cd255a52db	Rahul Gupta 35	2011-11-07 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.813	2026-05-27 07:22:30.813
9c0de5c5-f9cb-4d55-8f2f-d52822a2ad04	eb56c52d-c159-41cc-b93c-d3cd255a52db	Vikram Gupta 36	2012-12-08 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.816	2026-05-27 07:22:30.816
d16dc45e-694a-4c8d-a461-2bf466526417	eb56c52d-c159-41cc-b93c-d3cd255a52db	Ananya Gupta 37	2009-01-09 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.819	2026-05-27 07:22:30.819
b91bbd5d-6a19-4eba-9dbb-063be02eb746	eb56c52d-c159-41cc-b93c-d3cd255a52db	Rohan Gupta 38	2010-02-10 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.822	2026-05-27 07:22:30.822
6cd32227-6841-4d1e-a7ee-227037d3923f	eb56c52d-c159-41cc-b93c-d3cd255a52db	Diya Gupta 39	2011-03-11 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.825	2026-05-27 07:22:30.825
ac6ba727-476d-4a6e-93ba-bfa1590f2af4	eb56c52d-c159-41cc-b93c-d3cd255a52db	Karan Gupta 40	2012-04-12 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.828	2026-05-27 07:22:30.828
2ba5f982-28b4-41fa-8204-4388a0acbca4	eb56c52d-c159-41cc-b93c-d3cd255a52db	Arjun Singh 41	2009-05-13 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.831	2026-05-27 07:22:30.831
787d8808-814a-4415-971f-882aa9bc5980	eb56c52d-c159-41cc-b93c-d3cd255a52db	Priya Singh 42	2010-06-14 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.834	2026-05-27 07:22:30.834
e84adebf-99e9-4dc7-bf35-579e34e42bdc	eb56c52d-c159-41cc-b93c-d3cd255a52db	Aditya Singh 43	2011-07-15 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.837	2026-05-27 07:22:30.837
5f663612-952e-42bd-be64-a05af7f22d85	eb56c52d-c159-41cc-b93c-d3cd255a52db	Sneha Singh 44	2012-08-16 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.84	2026-05-27 07:22:30.84
76f9e195-8f5f-4d6c-a4f4-5f9fcdac675d	eb56c52d-c159-41cc-b93c-d3cd255a52db	Rahul Singh 45	2009-09-17 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.843	2026-05-27 07:22:30.843
43b75f9d-cd5f-421f-ae1d-cc6ea1e4b072	eb56c52d-c159-41cc-b93c-d3cd255a52db	Vikram Singh 46	2010-10-18 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.846	2026-05-27 07:22:30.846
032c2e4d-4fc7-4ce8-b171-8184a1e6a3ed	eb56c52d-c159-41cc-b93c-d3cd255a52db	Ananya Singh 47	2011-11-19 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.849	2026-05-27 07:22:30.849
4355eb00-6ef1-460d-9e37-d6271209c2c7	eb56c52d-c159-41cc-b93c-d3cd255a52db	Rohan Singh 48	2012-12-20 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.852	2026-05-27 07:22:30.852
efe7d511-676f-496e-8549-19545b2bc349	eb56c52d-c159-41cc-b93c-d3cd255a52db	Diya Singh 49	2009-01-21 00:00:00	Female	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.855	2026-05-27 07:22:30.855
adc20034-f899-4af1-b0f3-592cc22c82f6	eb56c52d-c159-41cc-b93c-d3cd255a52db	Karan Singh 50	2010-02-22 00:00:00	Male	{classical-vocal,drawing-painting}	2026-05-27 07:22:30.858	2026-05-27 07:22:30.858
\.


--
-- Data for Name: TelegramMessageDelivery; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."TelegramMessageDelivery" (id, "notificationId", "chatId", "messageId", status, "errorType", "errorCode", "errorMessage", "sentAt", "failureCount", "lastAttemptAt", "nextRetryAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."Transaction" (id, "registrationId", "razorpayOrderId", "razorpayPaymentId", "razorpaySignature", amount, status, "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: pratibha
--

COPY public."User" (id, email, "passwordHash", role, "profileImageUrl", "createdAt", "updatedAt") FROM stdin;
eadaf0dd-f506-4134-8a8d-200b36d75f64	admin@test.com	$2b$10$6kWtkJHxmQ.zglc3z7G/Iuq02bfm7fEkivoO4ueaRJVJTqum67FE.	SUPER_ADMIN	\N	2026-05-27 07:22:30.637	2026-05-27 07:22:30.637
ea1ce600-110f-4224-859f-77aaa4ba0c58	parent@test.com	$2b$10$M25sXwIj6z1juWOPg112CuuVUESt3NuhRnKUqwX0hkrQzxUp8fkpG	PARENT	\N	2026-05-27 07:22:30.701	2026-05-27 07:22:30.701
d82a34f7-440a-4cbd-b01a-6cabb027704e	judge-classical-vocal@test.com	$2b$10$NRZzUXvNYOtOmiG72LZjl.BFS2SWuo473Z0lQW3BjpY9.MIJMstpe	JUDGE	\N	2026-05-27 07:22:31.433	2026-05-27 07:22:31.433
2f780c37-65b8-4d6c-9526-9345bdf719bd	judge-classical-inst@test.com	$2b$10$NRZzUXvNYOtOmiG72LZjl.BFS2SWuo473Z0lQW3BjpY9.MIJMstpe	JUDGE	\N	2026-05-27 07:22:31.443	2026-05-27 07:22:31.443
130188a8-fd3b-4ff5-8752-78c0959f3803	judge-poetry@test.com	$2b$10$NRZzUXvNYOtOmiG72LZjl.BFS2SWuo473Z0lQW3BjpY9.MIJMstpe	JUDGE	\N	2026-05-27 07:22:31.451	2026-05-27 07:22:31.451
2d13e1c2-ba7f-4177-a2c2-6d379fa3be80	judge-classical-dance@test.com	$2b$10$NRZzUXvNYOtOmiG72LZjl.BFS2SWuo473Z0lQW3BjpY9.MIJMstpe	JUDGE	\N	2026-05-27 07:22:31.459	2026-05-27 07:22:31.459
5c647320-ee37-4abe-9963-e686c37722ff	judge-visual-arts@test.com	$2b$10$NRZzUXvNYOtOmiG72LZjl.BFS2SWuo473Z0lQW3BjpY9.MIJMstpe	JUDGE	\N	2026-05-27 07:22:31.466	2026-05-27 07:22:31.466
\.


--
-- Name: BannerTemplate BannerTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."BannerTemplate"
    ADD CONSTRAINT "BannerTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Certificate Certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_pkey" PRIMARY KEY (id);


--
-- Name: CompetitionCategory CompetitionCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."CompetitionCategory"
    ADD CONSTRAINT "CompetitionCategory_pkey" PRIMARY KEY (id);


--
-- Name: CompetitionJudge CompetitionJudge_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."CompetitionJudge"
    ADD CONSTRAINT "CompetitionJudge_pkey" PRIMARY KEY (id);


--
-- Name: Competition Competition_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Competition"
    ADD CONSTRAINT "Competition_pkey" PRIMARY KEY (id);


--
-- Name: JudgeAssignment JudgeAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."JudgeAssignment"
    ADD CONSTRAINT "JudgeAssignment_pkey" PRIMARY KEY (id);


--
-- Name: JudgePanelRequirement JudgePanelRequirement_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."JudgePanelRequirement"
    ADD CONSTRAINT "JudgePanelRequirement_pkey" PRIMARY KEY (id);


--
-- Name: JudgePayout JudgePayout_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."JudgePayout"
    ADD CONSTRAINT "JudgePayout_pkey" PRIMARY KEY (id);


--
-- Name: Judge Judge_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Judge"
    ADD CONSTRAINT "Judge_pkey" PRIMARY KEY (id);


--
-- Name: NotificationPreference NotificationPreference_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."NotificationPreference"
    ADD CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Parent Parent_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Parent"
    ADD CONSTRAINT "Parent_pkey" PRIMARY KEY (id);


--
-- Name: PhysicalPrizeOrder PhysicalPrizeOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."PhysicalPrizeOrder"
    ADD CONSTRAINT "PhysicalPrizeOrder_pkey" PRIMARY KEY (id);


--
-- Name: PrizeAward PrizeAward_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."PrizeAward"
    ADD CONSTRAINT "PrizeAward_pkey" PRIMARY KEY (id);


--
-- Name: PrizeItem PrizeItem_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."PrizeItem"
    ADD CONSTRAINT "PrizeItem_pkey" PRIMARY KEY (id);


--
-- Name: PrizePool PrizePool_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."PrizePool"
    ADD CONSTRAINT "PrizePool_pkey" PRIMARY KEY (id);


--
-- Name: QualificationRule QualificationRule_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."QualificationRule"
    ADD CONSTRAINT "QualificationRule_pkey" PRIMARY KEY (id);


--
-- Name: QualificationSlot QualificationSlot_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."QualificationSlot"
    ADD CONSTRAINT "QualificationSlot_pkey" PRIMARY KEY (id);


--
-- Name: Registration Registration_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Registration"
    ADD CONSTRAINT "Registration_pkey" PRIMARY KEY (id);


--
-- Name: Score Score_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Score"
    ADD CONSTRAINT "Score_pkey" PRIMARY KEY (id);


--
-- Name: ShipmentBatch ShipmentBatch_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."ShipmentBatch"
    ADD CONSTRAINT "ShipmentBatch_pkey" PRIMARY KEY (id);


--
-- Name: SocialMetric SocialMetric_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."SocialMetric"
    ADD CONSTRAINT "SocialMetric_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: TelegramMessageDelivery TelegramMessageDelivery_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."TelegramMessageDelivery"
    ADD CONSTRAINT "TelegramMessageDelivery_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: BannerTemplate_name_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "BannerTemplate_name_key" ON public."BannerTemplate" USING btree (name);


--
-- Name: BannerTemplate_slug_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "BannerTemplate_slug_key" ON public."BannerTemplate" USING btree (slug);


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Certificate_certificateId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Certificate_certificateId_key" ON public."Certificate" USING btree ("certificateId");


--
-- Name: Certificate_prizeAwardId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Certificate_prizeAwardId_key" ON public."Certificate" USING btree ("prizeAwardId");


--
-- Name: Certificate_registrationId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Certificate_registrationId_key" ON public."Certificate" USING btree ("registrationId");


--
-- Name: CompetitionCategory_competitionId_categoryId_minAge_maxAge_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "CompetitionCategory_competitionId_categoryId_minAge_maxAge_key" ON public."CompetitionCategory" USING btree ("competitionId", "categoryId", "minAge", "maxAge");


--
-- Name: CompetitionJudge_competitionId_idx; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE INDEX "CompetitionJudge_competitionId_idx" ON public."CompetitionJudge" USING btree ("competitionId");


--
-- Name: CompetitionJudge_competitionId_judgeId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "CompetitionJudge_competitionId_judgeId_key" ON public."CompetitionJudge" USING btree ("competitionId", "judgeId");


--
-- Name: CompetitionJudge_judgeId_idx; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE INDEX "CompetitionJudge_judgeId_idx" ON public."CompetitionJudge" USING btree ("judgeId");


--
-- Name: JudgeAssignment_registrationId_judgeId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "JudgeAssignment_registrationId_judgeId_key" ON public."JudgeAssignment" USING btree ("registrationId", "judgeId");


--
-- Name: JudgePanelRequirement_competitionId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "JudgePanelRequirement_competitionId_key" ON public."JudgePanelRequirement" USING btree ("competitionId");


--
-- Name: Judge_userId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Judge_userId_key" ON public."Judge" USING btree ("userId");


--
-- Name: NotificationPreference_userId_idx; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE INDEX "NotificationPreference_userId_idx" ON public."NotificationPreference" USING btree ("userId");


--
-- Name: NotificationPreference_userId_type_channel_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "NotificationPreference_userId_type_channel_key" ON public."NotificationPreference" USING btree ("userId", type, channel);


--
-- Name: Notification_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE INDEX "Notification_userId_createdAt_idx" ON public."Notification" USING btree ("userId", "createdAt");


--
-- Name: Notification_userId_read_idx; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE INDEX "Notification_userId_read_idx" ON public."Notification" USING btree ("userId", read);


--
-- Name: Parent_phone_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Parent_phone_key" ON public."Parent" USING btree (phone);


--
-- Name: Parent_userId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Parent_userId_key" ON public."Parent" USING btree ("userId");


--
-- Name: PhysicalPrizeOrder_prizeAwardId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "PhysicalPrizeOrder_prizeAwardId_key" ON public."PhysicalPrizeOrder" USING btree ("prizeAwardId");


--
-- Name: PhysicalPrizeOrder_shiprocketOrderId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "PhysicalPrizeOrder_shiprocketOrderId_key" ON public."PhysicalPrizeOrder" USING btree ("shiprocketOrderId");


--
-- Name: PhysicalPrizeOrder_shiprocketShipmentId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "PhysicalPrizeOrder_shiprocketShipmentId_key" ON public."PhysicalPrizeOrder" USING btree ("shiprocketShipmentId");


--
-- Name: PrizeAward_registrationId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "PrizeAward_registrationId_key" ON public."PrizeAward" USING btree ("registrationId");


--
-- Name: PrizePool_competitionId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "PrizePool_competitionId_key" ON public."PrizePool" USING btree ("competitionId");


--
-- Name: QualificationSlot_nationalRegistrationId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "QualificationSlot_nationalRegistrationId_key" ON public."QualificationSlot" USING btree ("nationalRegistrationId");


--
-- Name: QualificationSlot_registrationId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "QualificationSlot_registrationId_key" ON public."QualificationSlot" USING btree ("registrationId");


--
-- Name: Registration_fbPostUrl_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Registration_fbPostUrl_key" ON public."Registration" USING btree ("fbPostUrl");


--
-- Name: Registration_registrationId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Registration_registrationId_key" ON public."Registration" USING btree ("registrationId");


--
-- Name: Score_judgeAssignmentId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Score_judgeAssignmentId_key" ON public."Score" USING btree ("judgeAssignmentId");


--
-- Name: ShipmentBatch_batchNumber_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "ShipmentBatch_batchNumber_key" ON public."ShipmentBatch" USING btree ("batchNumber");


--
-- Name: SocialMetric_registrationId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "SocialMetric_registrationId_key" ON public."SocialMetric" USING btree ("registrationId");


--
-- Name: TelegramMessageDelivery_chatId_idx; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE INDEX "TelegramMessageDelivery_chatId_idx" ON public."TelegramMessageDelivery" USING btree ("chatId");


--
-- Name: TelegramMessageDelivery_createdAt_idx; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE INDEX "TelegramMessageDelivery_createdAt_idx" ON public."TelegramMessageDelivery" USING btree ("createdAt");


--
-- Name: TelegramMessageDelivery_notificationId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "TelegramMessageDelivery_notificationId_key" ON public."TelegramMessageDelivery" USING btree ("notificationId");


--
-- Name: TelegramMessageDelivery_status_idx; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE INDEX "TelegramMessageDelivery_status_idx" ON public."TelegramMessageDelivery" USING btree (status);


--
-- Name: TelegramMessageDelivery_status_nextRetryAt_idx; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE INDEX "TelegramMessageDelivery_status_nextRetryAt_idx" ON public."TelegramMessageDelivery" USING btree (status, "nextRetryAt");


--
-- Name: Transaction_razorpayOrderId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Transaction_razorpayOrderId_key" ON public."Transaction" USING btree ("razorpayOrderId");


--
-- Name: Transaction_razorpayPaymentId_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "Transaction_razorpayPaymentId_key" ON public."Transaction" USING btree ("razorpayPaymentId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: pratibha
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Certificate Certificate_prizeAwardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_prizeAwardId_fkey" FOREIGN KEY ("prizeAwardId") REFERENCES public."PrizeAward"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Certificate Certificate_registrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registration"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompetitionCategory CompetitionCategory_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."CompetitionCategory"
    ADD CONSTRAINT "CompetitionCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompetitionCategory CompetitionCategory_competitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."CompetitionCategory"
    ADD CONSTRAINT "CompetitionCategory_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES public."Competition"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompetitionJudge CompetitionJudge_competitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."CompetitionJudge"
    ADD CONSTRAINT "CompetitionJudge_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES public."Competition"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompetitionJudge CompetitionJudge_judgeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."CompetitionJudge"
    ADD CONSTRAINT "CompetitionJudge_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES public."Judge"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JudgeAssignment JudgeAssignment_judgeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."JudgeAssignment"
    ADD CONSTRAINT "JudgeAssignment_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES public."Judge"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JudgeAssignment JudgeAssignment_registrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."JudgeAssignment"
    ADD CONSTRAINT "JudgeAssignment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registration"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JudgePanelRequirement JudgePanelRequirement_competitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."JudgePanelRequirement"
    ADD CONSTRAINT "JudgePanelRequirement_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES public."Competition"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JudgePayout JudgePayout_judgeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."JudgePayout"
    ADD CONSTRAINT "JudgePayout_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES public."Judge"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Judge Judge_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Judge"
    ADD CONSTRAINT "Judge_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NotificationPreference NotificationPreference_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."NotificationPreference"
    ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Parent Parent_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Parent"
    ADD CONSTRAINT "Parent_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PhysicalPrizeOrder PhysicalPrizeOrder_prizeAwardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."PhysicalPrizeOrder"
    ADD CONSTRAINT "PhysicalPrizeOrder_prizeAwardId_fkey" FOREIGN KEY ("prizeAwardId") REFERENCES public."PrizeAward"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PrizeAward PrizeAward_prizeItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."PrizeAward"
    ADD CONSTRAINT "PrizeAward_prizeItemId_fkey" FOREIGN KEY ("prizeItemId") REFERENCES public."PrizeItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PrizeAward PrizeAward_registrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."PrizeAward"
    ADD CONSTRAINT "PrizeAward_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registration"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PrizeItem PrizeItem_prizePoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."PrizeItem"
    ADD CONSTRAINT "PrizeItem_prizePoolId_fkey" FOREIGN KEY ("prizePoolId") REFERENCES public."PrizePool"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PrizePool PrizePool_competitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."PrizePool"
    ADD CONSTRAINT "PrizePool_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES public."Competition"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QualificationRule QualificationRule_nationalCompetitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."QualificationRule"
    ADD CONSTRAINT "QualificationRule_nationalCompetitionId_fkey" FOREIGN KEY ("nationalCompetitionId") REFERENCES public."Competition"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: QualificationRule QualificationRule_stateCompetitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."QualificationRule"
    ADD CONSTRAINT "QualificationRule_stateCompetitionId_fkey" FOREIGN KEY ("stateCompetitionId") REFERENCES public."Competition"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: QualificationSlot QualificationSlot_nationalCompetitionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."QualificationSlot"
    ADD CONSTRAINT "QualificationSlot_nationalCompetitionId_fkey" FOREIGN KEY ("nationalCompetitionId") REFERENCES public."Competition"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: QualificationSlot QualificationSlot_nationalRegistrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."QualificationSlot"
    ADD CONSTRAINT "QualificationSlot_nationalRegistrationId_fkey" FOREIGN KEY ("nationalRegistrationId") REFERENCES public."Registration"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: QualificationSlot QualificationSlot_qualificationRuleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."QualificationSlot"
    ADD CONSTRAINT "QualificationSlot_qualificationRuleId_fkey" FOREIGN KEY ("qualificationRuleId") REFERENCES public."QualificationRule"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: QualificationSlot QualificationSlot_registrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."QualificationSlot"
    ADD CONSTRAINT "QualificationSlot_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registration"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: QualificationSlot QualificationSlot_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."QualificationSlot"
    ADD CONSTRAINT "QualificationSlot_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Registration Registration_competitionCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Registration"
    ADD CONSTRAINT "Registration_competitionCategoryId_fkey" FOREIGN KEY ("competitionCategoryId") REFERENCES public."CompetitionCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Registration Registration_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Registration"
    ADD CONSTRAINT "Registration_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Score Score_judgeAssignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Score"
    ADD CONSTRAINT "Score_judgeAssignmentId_fkey" FOREIGN KEY ("judgeAssignmentId") REFERENCES public."JudgeAssignment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SocialMetric SocialMetric_registrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."SocialMetric"
    ADD CONSTRAINT "SocialMetric_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registration"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Student Student_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Parent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TelegramMessageDelivery TelegramMessageDelivery_notificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."TelegramMessageDelivery"
    ADD CONSTRAINT "TelegramMessageDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES public."Notification"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transaction Transaction_registrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pratibha
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES public."Registration"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pratibha
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 1jFBcmUK3nxyIJE7UWQjfvy5S55Ex7RxaeMqRCPnGeunoZiEt1OjsJmyh6lZgQv


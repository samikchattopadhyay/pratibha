# Technical Specification: Pratibha Parishad MVP Platform

This document describes the technical architecture, data modeling, API design, and system workflows of the Pratibha Parishad Fine Arts digital certification board.

---

## 1. System Architecture

The platform is built as a monolithic Next.js application using the React Server Components paradigm and a relational database backing.

```
┌────────────────────────────────────────────────────────┐
│                   Next.js App Router                   │
├───────────────────┬───────────────────┬────────────────┤
│   Public Pages    │   Client Portals  │   API Routes   │
│   (Home, About,   │  (Parent, Judge,  │ (Auth, Admin,  │
│    FAQ, Verify)   │      Admin)       │   Payments)    │
└─────────┬─────────┴─────────┬─────────┴────────┬───────┘
          │                   │                  │
          │                   ▼                  │
          │             NextAuth Session         │
          │                   │                  │
          ▼                    ▼                  ▼
┌────────────────────────────────────────────────────────┐
│                   Prisma ORM Client                    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                  │
└────────────────────────────────────────────────────────┘
```

- **Frontend Core**: Next.js 16 (Turbopack) using the App Router.
- **Styling**: Tailwind CSS v4 using global theme tokens for colors (Terracotta Crimson, Digital Gold, Cream) and typography (Outfit, Playfair Display).
- **Backend API Handlers**: Next.js route handlers (`route.ts`) executing server-side logic and database operations.
- **ORM & Database**: Prisma ORM with PostgreSQL client (PostgreSQL 15 running in a local Docker Compose setup).
- **Authentication**: NextAuth.js credentials flow managing sessions, permissions, and role states (`SUPER_ADMIN`, `MODERATOR`, `JUDGE`, `PARENT`).
- **Object Storage**: Cloudflare R2 client integration utilizing the AWS S3 SDK for PDF certificate storage.

---

## 2. Database Schema (Prisma Models)

The data model maintains strict relations to support parent-child student listings, geographic scopes, double-blind grading, prize awards, qualification slots, logistics batching, and secure notifications:

### User & Profile Models
- **`User`**: Core account representation.
  - `id` (String, primary key, UUID)
  - `email` (String, unique)
  - `passwordHash` (String)
  - `role` (Enum: `SUPER_ADMIN`, `MODERATOR`, `JUDGE`, `PARENT`)
  - `profileImageUrl` (String, optional)
  - `createdAt` & `updatedAt` (DateTime)
- **`Parent`**: Detailed parent profile mapping to a `User` account.
  - `id` (String, primary key, UUID)
  - `userId` (String, unique FK -> `User`)
  - `name` (String)
  - `phone` (String, unique)
  - `address`, `city`, `state`, `postalCode` (String)
  - `country` (String, default "India")
  - `profileImageUrl` (String, optional)
  - `preferredState` (String, optional) - State used for filtering state-wise competitions.
- **`Student`**: Child profiles mapped to a parent.
  - `id` (String, primary key, UUID)
  - `parentId` (String, FK -> `Parent`)
  - `name` (String)
  - `dateOfBirth` (DateTime)
  - `gender` (String)
  - `disciplineInterests` (String[]) - Interests in category slugs.

### Competitions & Categories
- **`Competition`**: Contests hosted by the board.
  - `id` (String, primary key, UUID)
  - `title`, `description` (String)
  - `bannerUrl` (String, optional)
  - `entryFeeINR` (Decimal)
  - `startDate`, `endDate`, `registrationDeadline`, `resultDate` (DateTime)
  - `isActive` (Boolean, default true)
  - `scope` (Enum: `STATE`, `NATIONAL`)
  - `eligibleStates` (String[])
  - `hostState` (String, optional)
  - `difficultyLevel` (Int, default 1)
  - `minJudgesRequired` (Int, default 2)
- **`Category`**: Fine arts disciplines.
  - `id` (String, primary key, UUID)
  - `name` (String, unique), `slug` (String, unique)
  - `icon` (String, optional)
  - `grouping` (Enum: `MUSIC_VOCAL`, `MUSIC_INSTRUMENTAL`, `PERFORMING_ARTS`, `VISUAL_ARTS`, `LITERARY_ARTS`, `SPOKEN_WORD`, optional)
- **`CompetitionCategory`**: Join table setting age limits and criteria for entries.
  - `id` (String, primary key, UUID)
  - `competitionId` (String, FK -> `Competition`)
  - `categoryId` (String, FK -> `Category`)
  - `minAge` & `maxAge` (Int)
  - `language` (String, optional)

### Submissions, Transactions & Metrics
- **`Registration`**: Represents a student entry enrollment.
  - `id` (String, primary key, UUID)
  - `studentId` (String, FK -> `Student`)
  - `competitionCategoryId` (String, FK -> `CompetitionCategory`)
  - `fbPostUrl` (String, unique)
  - `paymentStatus` (Enum: `PENDING`, `SUCCESS`, `FAILED`)
  - `registrationId` (String, unique Roll ID)
  - `status` (Enum: `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`, `DISQUALIFIED`)
  - `scoringFinalized` (Boolean, default false)
  - `conflictResolved` (Boolean, default false)
  - `finalRank` (Int, optional)
  - `finalScore` (Decimal, optional)
  - `discountApplied` (Decimal, optional)
- **`Transaction`**: Records Razorpay order details.
  - `id` (String, primary key, UUID)
  - `registrationId` (String, FK -> `Registration`)
  - `razorpayOrderId` (String, unique)
  - `razorpayPaymentId` (String, unique, optional)
  - `razorpaySignature` (String, optional)
  - `amount` (Decimal)
  - `status` (Enum: `PENDING`, `SUCCESS`, `FAILED`)
  - `createdAt` (DateTime)
- **`SocialMetric`**: Standardized Facebook metrics.
  - `id` (String, primary key, UUID)
  - `registrationId` (String, unique FK -> `Registration`)
  - `likesCount`, `commentsCount`, `sharesCount` (Int, default 0)
  - `calculatedEngagement` (Decimal, default 0.00)
  - `lastSyncedAt` (DateTime)

### Judges & Evaluation
- **`Judge`**: Examiner profile mapping to a `User` account.
  - `id` (String, primary key, UUID)
  - `userId` (String, unique FK -> `User`)
  - `name` (String)
  - `specializations` (String[])
  - `profileImageUrl` (String, optional)
  - `tier` (Enum: `LOCAL`, `REGIONAL`, `NATIONAL`, `EXPERT`)
  - `bio` & `credentials` (String, optional)
  - `stateOfResidence` (String, optional)
  - `yearsOfExperience` (Int, optional)
  - `isVerified` (Boolean, default false)
  - `isAvailable` (Boolean, default true)
  - `totalEvaluations` (Int, default 0)
  - `averageScoreGiven` (Decimal, optional)
  - `bankAccountDetails` (Json, optional)
  - `telegramChatId` (String, optional)
- **`JudgePayout`**: Financial tracking of payouts to judges.
  - `id` (String, primary key, UUID)
  - `judgeId` (String, FK -> `Judge`)
  - `amount` (Decimal)
  - `status` (Enum: `PENDING`, `PROCESSING`, `PAID`, `FAILED`)
  - `assignedCount` (Int)
  - `paymentDate` (DateTime, optional)
  - `transactionRef` (String, optional)
  - `adminNotes` (String, optional)
- **`JudgeAssignment`**: Double-blind join model between Registrations and Judges.
  - `id` (String, primary key, UUID)
  - `registrationId` (String, FK -> `Registration`)
  - `judgeId` (String, FK -> `Judge`)
  - `isSubmitted` (Boolean, default false)
  - `assignedAt` & `submittedAt` (DateTime, optional)
  - `conflictChecked`, `conflictFlagged` (Boolean, default false)
  - `conflictReason` (String, optional)
- **`JudgePanelRequirement`**: Minimum judging configurations per competition.
  - `id` (String, primary key, UUID)
  - `competitionId` (String, unique FK -> `Competition`)
  - `minJudges` (Int, default 2)
  - `minNationalTierJudges` (Int, default 0)
  - `requireCrossCategory` (Boolean, default false)
- **`Score`**: Grading sheet submitted by examiners.
  - `id` (String, primary key, UUID)
  - `judgeAssignmentId` (String, unique FK -> `JudgeAssignment`)
  - `criteria1` (Int, Technique/Skill)
  - `criteria2` (Int, Expression/Presentation)
  - `criteria3` (Int, Rhythm/Composition)
  - `criteria4` (Int, Originality/Innovation, optional - National only)
  - `totalScore` (Int)
  - `remarks` (String, optional)

### Certificates & Prizes
- **`Certificate`**: Earned credential details.
  - `id` (String, primary key, UUID)
  - `registrationId` (String, unique FK -> `Registration`)
  - `certificateId` (String, unique)
  - `certificateUrl` & `qrCodeUrl` (String)
  - `type` (Enum: `PARTICIPATION`, `MERIT_1`, `MERIT_2`, `MERIT_3`, `SPECIAL_MENTION`)
  - `prizeAwardId` (String, unique, optional FK -> `PrizeAward`)
- **`PrizePool`**: Competition prize listings.
  - `id` (String, primary key, UUID)
  - `competitionId` (String, unique FK -> `Competition`)
  - `title` (String)
  - `description` (String, optional)
  - `isPublished` (Boolean, default false)
- **`PrizeItem`**: Individual prize definition within a pool.
  - `id` (String, primary key, UUID)
  - `prizePoolId` (String, FK -> `PrizePool`)
  - `rank` (Enum: `FIRST_PLACE`, `SECOND_PLACE`, `THIRD_PLACE`, `MERIT_1`, `MERIT_2`, `MERIT_3`, `SPECIAL_MENTION`, `PEOPLES_CHOICE`, `PARTICIPATION`)
  - `type` (Enum: `DIGITAL_CERTIFICATE`, `DIGITAL_MEDAL`, `PHYSICAL_MEDAL`, `PHYSICAL_TROPHY`, `CASH_PRIZE`, `SCHOLARSHIP`, `RECOGNITION`)
  - `title` (String)
  - `description` (String, optional)
  - `estimatedValue` (Decimal, optional)
  - `isPhysical` (Boolean, default false)
  - `imageUrl` (String, optional)
  - `perCategory` (Boolean, default false)
- **`PrizeAward`**: Association of a prize item to a registration.
  - `id` (String, primary key, UUID)
  - `prizeItemId` (String, FK -> `PrizeItem`)
  - `registrationId` (String, unique FK -> `Registration`)
  - `rank` (Enum: `PrizeRank`)
  - `awardedAt` (DateTime)
  - `isDispatched` (Boolean, default false)
  - `dispatchedAt` (DateTime, optional)
  - `courierTrackingId` (String, optional)

### Qualifications
- **`QualificationRule`**: Rules setting how state competition performance qualifies for national competitions.
  - `id` (String, primary key, UUID)
  - `stateCompetitionId` (String, FK -> `Competition` as State)
  - `nationalCompetitionId` (String, FK -> `Competition` as National)
  - `slotsPerCategory` (Int, default 3)
  - `wildCardSlots` (Int, default 1)
  - `minScoreThreshold` (Decimal, optional)
  - `discountPercent` (Int, default 50)
  - `slotExpiryDays` (Int, default 14)
  - `isActive` (Boolean, default true)
- **`QualificationSlot`**: Earned qualification slots for national competitions.
  - `id` (String, primary key, UUID)
  - `qualificationRuleId` (String, FK -> `QualificationRule`)
  - `registrationId` (String, unique FK -> `Registration` as Earned)
  - `studentId` (String, FK -> `Student`)
  - `nationalCompetitionId` (String, FK -> `Competition` as National)
  - `status` (Enum: `OFFERED`, `ACCEPTED`, `DECLINED`, `EXPIRED`, `REVOKED`)
  - `offeredAt` & `expiresAt` (DateTime)
  - `acceptedAt` (DateTime, optional)
  - `nationalRegistrationId` (String, unique, optional FK -> `Registration` as Used)

### Logistics & Shipping
- **`PhysicalPrizeOrder`**: Shipping order records for physical trophies/medals.
  - `id` (String, primary key, UUID)
  - `prizeAwardId` (String, unique FK -> `PrizeAward`)
  - `recipientName`, `recipientPhone`, `recipientAddress`, `recipientCity`, `recipientState`, `recipientPostalCode` (String)
  - `recipientCountry` (String, default "India")
  - `packageSKU` (Enum: `TROPHY_LARGE`, `TROPHY_MEDIUM`, `MEDAL_CERTIFICATE`, `CERTIFICATE_ONLY`, `MEDAL_ONLY`)
  - `weightGrams`, `lengthCm`, `widthCm`, `heightCm` (Int)
  - `shiprocketOrderId` (String, unique, optional)
  - `shiprocketShipmentId` (String, unique, optional)
  - `shiprocketLabelUrl`, `awbNumber`, `courierName` (String, optional)
  - `estimatedDelivery` (DateTime, optional)
  - `status` (Enum: `PENDING`, `LABEL_GENERATED`, `PICKUP_SCHEDULED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `DELIVERY_FAILED`, `RETURNED`)
  - `batchId` (String, optional)
  - `labelGeneratedAt`, `pickupScheduledAt`, `dispatchedAt`, `deliveredAt` (DateTime, optional)
- **`ShipmentBatch`**: Courier batches processed together.
  - `id` (String, primary key, UUID)
  - `batchNumber` (String, unique)
  - `description` (String, optional)
  - `totalOrders` (Int, default 0)
  - `processedAt` (DateTime, optional)
  - `manifestUrl` (String, optional)

### Notifications & Telegram Reliability
- **`Notification`**: System notification representation.
  - `id` (String, primary key, UUID)
  - `userId` (String, FK -> `User`)
  - `type` (Enum: `REGISTRATION_CREATED`, `PAYMENT_RECEIVED`, `REGISTRATION_VERIFIED`, `REGISTRATION_REJECTED`, `RESULTS_PUBLISHED`, `CERTIFICATE_READY`, `QUALIFICATION_OFFERED`, `QUALIFICATION_EXPIRING`, `JUDGE_ASSIGNED`, `SCORING_REMINDER`, `SCORING_DEADLINE`, `ADMIN_NEW_REGISTRATION`, `ADMIN_PAYMENT_CONFIRMED`, `ADMIN_JUDGE_CONFLICT`, `ADMIN_UNASSIGNED_REGISTRATIONS`)
  - `title`, `body` (String)
  - `read` (Boolean, default false)
  - `readAt` (DateTime, optional)
  - `actionUrl`, `registrationId`, `assignmentId`, `certificateId`, `qualificationId` (String, optional)
- **`NotificationPreference`**: User configurations for channels.
  - `id` (String, primary key, UUID)
  - `userId` (String, FK -> `User`)
  - `type` (Enum: `NotificationType`)
  - `channel` (Enum: `IN_APP`, `EMAIL`, `TELEGRAM`)
  - `enabled` (Boolean, default true)
- **`TelegramMessageDelivery`**: Delivery reliability tracking for Telegram.
  - `id` (String, primary key, CUID)
  - `notificationId` (String, unique FK -> `Notification`)
  - `chatId` (String)
  - `messageId` (String, optional)
  - `status` (Enum: `QUEUED`, `SENDING`, `SENT`, `TEMPORARILY_FAILED`, `PERMANENTLY_FAILED`)
  - `errorType` (Enum: `RATE_LIMITED`, `USER_BLOCKED`, `INVALID_CHAT`, `BAD_REQUEST`, `NETWORK_ERROR`, `UNKNOWN`, optional)
  - `errorCode`, `errorMessage` (String, optional)
  - `sentAt` (DateTime, optional)
  - `failureCount` (Int, default 0)
  - `lastAttemptAt` & `nextRetryAt` (DateTime, optional)


---

## 3. Core API Endpoints

### Authentication
- `POST /api/auth/register`: Parent registration and profile initialization.
- `POST /api/auth/[...nextauth]`: Credential-based login execution.

### Parent Portal Dashboard
- `GET /api/parent/dashboard`: Retrieves registered child profiles, active entries, payment status, and verification states.
- `POST /api/parent/students`: Inserts a new student profile linked to the parent.

### Competition Registrations
- `POST /api/registrations/create`: Creates pending registrations, generates unique Roll IDs, and initiates a Razorpay Order.
- `POST /api/registrations/verify`: Authenticates Razorpay payments using HMAC SHA256 signatures, marking registrations as `SUCCESS`.

### Admin Moderation
- `GET /api/admin/registrations`: Retrieves global submissions list (Admins only).
- `GET /api/admin/judges`: Fetches cultural examiner list.
- `POST /api/admin/assign`: Creates a double-blind `JudgeAssignment` record.

### Examiner Grading
- `GET /api/judge/assignments`: Lists assigned entries (blinded: hides names and shows Roll IDs only).
- `POST /api/judge/score`: Processes marking parameters (Technique max 40, Expression max 30, Rhythm max 30) and locks the entry.

---

## 4. Key Workflows

### A. Razorpay Signature Verification
To prevent order spoofing, payment confirmation requires verification of the payload:
```typescript
const generatedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest("hex");

const isValid = generatedSignature === razorpaySignature;
```

### B. Weighted Results Scoring Formula
The final score of a participant is composed of:
1. **Jury Score (70% weight)**: The examiner slider total out of 100.
2. **Social Engagement (30% weight)**: Calculated based on Facebook interactions:
   - `Raw Social Points = (Likes * 1) + (Comments * 2) + (Shares * 5)`
   - Standardized to a scale of 100, capped at a maximum of 500 raw points.
   - `Social Score = Min((Raw Points / 500) * 100, 100)`
3. **Final Composite Score**: `(Jury Score * 0.7) + (Social Score * 0.3)`

### C. Digital Certificate Verification
Certificates are verify-coded to prevent forgery. Each record includes a verification serial (e.g. `CERT-PP-9901-2940`). The page `/verify/[certificateId]` displays details along with a dynamic QR code containing the verification URL. Printable layouts automatically format parameters when users press print:
```css
@media print {
  .print\:hidden {
    display: none !important;
  }
  body {
    background-color: white;
  }
}
```

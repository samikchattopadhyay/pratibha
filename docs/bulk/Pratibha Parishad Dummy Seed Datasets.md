# Pratibha Parishad – Dummy Seed Datasets

Prepared based on the technical specification and seeding requirements. These datasets are designed for:

* Local Prisma/PostgreSQL seeding
* API testing
* Dashboard testing
* Judge assignment testing
* Payment workflow simulation
* Certificate verification testing
* Leaderboard and scoring testing

Reference Sources:

* seeding_requirements.md
* technical_specification.md

---

# 1. Categories Dataset

```json
[
  {
    "name": "Bengali Recitation",
    "slug": "bengali-recitation"
  },
  {
    "name": "English Recitation",
    "slug": "english-recitation"
  },
  {
    "name": "Rabindra Sangeet",
    "slug": "rabindra-sangeet"
  },
  {
    "name": "Nazrul Geeti",
    "slug": "nazrul-geeti"
  },
  {
    "name": "Classical Dance",
    "slug": "classical-dance"
  },
  {
    "name": "Drawing & Painting",
    "slug": "drawing-painting"
  },
  {
    "name": "Creative Writing",
    "slug": "creative-writing"
  },
  {
    "name": "Story Telling",
    "slug": "story-telling"
  }
]
```

---

# 2. Competitions Dataset

```json
[
  {
    "title": "Borsha Bodhon 2026",
    "description": "Online cultural competition celebrating monsoon themed performances.",
    "entryFeeINR": 50.00,
    "startDate": "2026-06-01T00:00:00.000Z",
    "endDate": "2026-06-20T23:59:59.000Z",
    "registrationDeadline": "2026-06-15T23:59:59.000Z",
    "resultDate": "2026-06-30T18:00:00.000Z",
    "isActive": true
  },
  {
    "title": "Rabindra Smaran 2026",
    "description": "Digital fine arts festival dedicated to Rabindranath Tagore.",
    "entryFeeINR": 80.00,
    "startDate": "2026-07-01T00:00:00.000Z",
    "endDate": "2026-07-25T23:59:59.000Z",
    "registrationDeadline": "2026-07-20T23:59:59.000Z",
    "resultDate": "2026-08-05T18:00:00.000Z",
    "isActive": true
  },
  {
    "title": "Sharod Utsav Talent Hunt 2026",
    "description": "Festival themed online competition for children and youth.",
    "entryFeeINR": 100.00,
    "startDate": "2026-09-01T00:00:00.000Z",
    "endDate": "2026-09-25T23:59:59.000Z",
    "registrationDeadline": "2026-09-20T23:59:59.000Z",
    "resultDate": "2026-10-05T18:00:00.000Z",
    "isActive": false
  }
]
```

---

# 3. CompetitionCategory Dataset

```json
[
  {
    "competitionTitle": "Borsha Bodhon 2026",
    "categorySlug": "bengali-recitation",
    "minAge": 4,
    "maxAge": 8
  },
  {
    "competitionTitle": "Borsha Bodhon 2026",
    "categorySlug": "rabindra-sangeet",
    "minAge": 6,
    "maxAge": 14
  },
  {
    "competitionTitle": "Rabindra Smaran 2026",
    "categorySlug": "drawing-painting",
    "minAge": 5,
    "maxAge": 16
  },
  {
    "competitionTitle": "Sharod Utsav Talent Hunt 2026",
    "categorySlug": "classical-dance",
    "minAge": 8,
    "maxAge": 18
  }
]
```

---

# 4. User Accounts Dataset

## Super Admin

```json
{
  "email": "admin@pratibhaparishad.org",
  "password": "adminpassword",
  "role": "SUPER_ADMIN"
}
```

## Moderators

```json
[
  {
    "email": "moderator1@pratibhaparishad.org",
    "password": "moderatorpassword",
    "role": "MODERATOR"
  },
  {
    "email": "moderator2@pratibhaparishad.org",
    "password": "moderatorpassword",
    "role": "MODERATOR"
  }
]
```

## Judges

```json
[
  {
    "email": "judge1@pratibhaparishad.org",
    "password": "judgepassword",
    "role": "JUDGE",
    "name": "Prof. Swapna Sen",
    "specializations": ["bengali-recitation", "story-telling"]
  },
  {
    "email": "judge2@pratibhaparishad.org",
    "password": "judgepassword",
    "role": "JUDGE",
    "name": "Guru Arindam Roy",
    "specializations": ["rabindra-sangeet", "nazrul-geeti"]
  },
  {
    "email": "judge3@pratibhaparishad.org",
    "password": "judgepassword",
    "role": "JUDGE",
    "name": "Smt. Nandita Dhar",
    "specializations": ["drawing-painting", "creative-writing"]
  }
]
```

## Parents

```json
[
  {
    "email": "parent1@example.com",
    "password": "parentpassword",
    "role": "PARENT",
    "name": "Avik Chattopadhyay",
    "phone": "9830098300",
    "address": "12/A Gariahat Road",
    "city": "Kolkata",
    "state": "West Bengal",
    "postalCode": "700019",
    "country": "India"
  },
  {
    "email": "parent2@example.com",
    "password": "parentpassword",
    "role": "PARENT",
    "name": "Deboshree Chakraborty",
    "phone": "9007007001",
    "address": "Lake Town",
    "city": "Kolkata",
    "state": "West Bengal",
    "postalCode": "700048",
    "country": "India"
  },
  {
    "email": "parent3@example.com",
    "password": "parentpassword",
    "role": "PARENT",
    "name": "Sunetra Chattopadhyay",
    "phone": "8910891089",
    "address": "Suri Main Road",
    "city": "Suri",
    "state": "West Bengal",
    "postalCode": "731101",
    "country": "India"
  }
]
```

---

# 5. Students Dataset

```json
[
  {
    "parentEmail": "parent1@example.com",
    "name": "Bhaskar Chattopadhyay",
    "dateOfBirth": "2020-02-10T00:00:00.000Z",
    "gender": "MALE"
  },
  {
    "parentEmail": "parent1@example.com",
    "name": "Anwesha Chattopadhyay",
    "dateOfBirth": "2016-11-15T00:00:00.000Z",
    "gender": "FEMALE"
  },
  {
    "parentEmail": "parent2@example.com",
    "name": "Ritoban Chakraborty",
    "dateOfBirth": "2013-08-22T00:00:00.000Z",
    "gender": "MALE"
  },
  {
    "parentEmail": "parent3@example.com",
    "name": "Madhurima Das",
    "dateOfBirth": "2015-01-05T00:00:00.000Z",
    "gender": "FEMALE"
  }
]
```

---

# 6. Registrations Dataset

```json
[
  {
    "registrationId": "PP2026REC001",
    "studentName": "Bhaskar Chattopadhyay",
    "competition": "Borsha Bodhon 2026",
    "category": "Bengali Recitation",
    "fbPostUrl": "https://facebook.com/groups/pratibhaparishad/posts/100001",
    "paymentStatus": "SUCCESS",
    "status": "VERIFIED"
  },
  {
    "registrationId": "PP2026SONG001",
    "studentName": "Anwesha Chattopadhyay",
    "competition": "Borsha Bodhon 2026",
    "category": "Rabindra Sangeet",
    "fbPostUrl": "https://facebook.com/groups/pratibhaparishad/posts/100002",
    "paymentStatus": "SUCCESS",
    "status": "VERIFIED"
  },
  {
    "registrationId": "PP2026DRAW001",
    "studentName": "Ritoban Chakraborty",
    "competition": "Rabindra Smaran 2026",
    "category": "Drawing & Painting",
    "fbPostUrl": "https://facebook.com/groups/pratibhaparishad/posts/100003",
    "paymentStatus": "PENDING",
    "status": "PENDING_VERIFICATION"
  },
  {
    "registrationId": "PP2026DANCE001",
    "studentName": "Madhurima Das",
    "competition": "Sharod Utsav Talent Hunt 2026",
    "category": "Classical Dance",
    "fbPostUrl": "https://facebook.com/groups/pratibhaparishad/posts/100004",
    "paymentStatus": "FAILED",
    "status": "REJECTED"
  }
]
```

---

# 7. Transactions Dataset

```json
[
  {
    "registrationId": "PP2026REC001",
    "razorpayOrderId": "order_PP_1001",
    "razorpayPaymentId": "pay_PP_1001",
    "amount": 50.00,
    "status": "SUCCESS"
  },
  {
    "registrationId": "PP2026SONG001",
    "razorpayOrderId": "order_PP_1002",
    "razorpayPaymentId": "pay_PP_1002",
    "amount": 50.00,
    "status": "SUCCESS"
  },
  {
    "registrationId": "PP2026DRAW001",
    "razorpayOrderId": "order_PP_1003",
    "razorpayPaymentId": null,
    "amount": 80.00,
    "status": "PENDING"
  }
]
```

---

# 8. Judge Assignments Dataset

```json
[
  {
    "registrationId": "PP2026REC001",
    "judge": "Prof. Swapna Sen",
    "isSubmitted": true
  },
  {
    "registrationId": "PP2026REC001",
    "judge": "Guru Arindam Roy",
    "isSubmitted": true
  },
  {
    "registrationId": "PP2026SONG001",
    "judge": "Guru Arindam Roy",
    "isSubmitted": true
  },
  {
    "registrationId": "PP2026SONG001",
    "judge": "Prof. Swapna Sen",
    "isSubmitted": false
  }
]
```

---

# 9. Scores Dataset

```json
[
  {
    "registrationId": "PP2026REC001",
    "judge": "Prof. Swapna Sen",
    "criteria1": 35,
    "criteria2": 28,
    "criteria3": 25,
    "totalScore": 88,
    "remarks": "Excellent expression and confidence."
  },
  {
    "registrationId": "PP2026REC001",
    "judge": "Guru Arindam Roy",
    "criteria1": 34,
    "criteria2": 26,
    "criteria3": 24,
    "totalScore": 84,
    "remarks": "Strong performance with clear diction."
  },
  {
    "registrationId": "PP2026SONG001",
    "judge": "Guru Arindam Roy",
    "criteria1": 36,
    "criteria2": 27,
    "criteria3": 28,
    "totalScore": 91,
    "remarks": "Very melodious and technically sound."
  }
]
```

---

# 10. Social Engagement Dataset

This dataset should be stored separately or dynamically fetched through Meta Graph APIs.

```json
[
  {
    "registrationId": "PP2026REC001",
    "likes": 240,
    "comments": 40,
    "shares": 22,
    "rawPoints": 430,
    "socialScore": 86
  },
  {
    "registrationId": "PP2026SONG001",
    "likes": 310,
    "comments": 60,
    "shares": 30,
    "rawPoints": 520,
    "socialScore": 100
  }
]
```

---

# 11. Final Composite Scores Dataset

Formula:

* Jury Weight = 70%
* Social Weight = 30%

```json
[
  {
    "registrationId": "PP2026REC001",
    "juryAverage": 86,
    "socialScore": 86,
    "finalCompositeScore": 86
  },
  {
    "registrationId": "PP2026SONG001",
    "juryAverage": 91,
    "socialScore": 100,
    "finalCompositeScore": 93.7
  }
]
```

---

# 12. Certificates Dataset

```json
[
  {
    "registrationId": "PP2026REC001",
    "certificateId": "CERT-PP-2026-0001",
    "certificateUrl": "https://cdn.pratibhaparishad.org/certificates/CERT-PP-2026-0001.pdf",
    "qrCodeUrl": "https://cdn.pratibhaparishad.org/qrcodes/CERT-PP-2026-0001.png",
    "type": "MERIT_2"
  },
  {
    "registrationId": "PP2026SONG001",
    "certificateId": "CERT-PP-2026-0002",
    "certificateUrl": "https://cdn.pratibhaparishad.org/certificates/CERT-PP-2026-0002.pdf",
    "qrCodeUrl": "https://cdn.pratibhaparishad.org/qrcodes/CERT-PP-2026-0002.png",
    "type": "MERIT_1"
  }
]
```

---

# 13. Recommended Seed Volumes For Testing

| Model         | Minimum | Recommended |
| ------------- | ------- | ----------- |
| Categories    | 8       | 20          |
| Competitions  | 3       | 12          |
| Parents       | 10      | 500         |
| Students      | 20      | 1000        |
| Registrations | 50      | 5000        |
| Judges        | 3       | 25          |
| Scores        | 100     | 10000       |
| Certificates  | 50      | 5000        |

---

# 14. Important Seeder Logic

## Password Hashing

Use bcrypt with salt rounds = 10.

```ts
const hashedPassword = await bcrypt.hash(password, 10)
```

---

## Registration ID Format

Suggested format:

```txt
PP + YEAR + CATEGORYCODE + SERIAL
```

Example:

```txt
PP2026REC001
```

---

## Certificate ID Format

Suggested format:

```txt
CERT-PP-2026-0001
```

---

## Judge Assignment Rules

* Minimum 2 judges per registration
* Same specialization preferred
* Blind judging required
* Prevent duplicate score submissions

---

# 15. Advanced Seed Suggestions

For better UI testing, generate:

* Random Facebook engagement counts
* Mixed payment states
* Mixed verification states
* Randomized judge remarks
* Multiple age groups
* International students
* Tied leaderboard scores
* Rejected/disqualified entries
* Expired competitions
* Upcoming competitions
* High engagement viral entries

---

# 16. Suggested Seeder Execution Order

```txt
1. Categories
2. Competitions
3. Competition Categories
4. Users
5. Parents
6. Judges
7. Students
8. Registrations
9. Transactions
10. Judge Assignments
11. Scores
12. Certificates
```

---

# 17. Recommended Additional Tables For Future Scaling

## SocialMetrics

```txt
registrationId
likes
comments
shares
views
lastSyncedAt
```

## Leaderboard

```txt
competitionId
registrationId
rank
juryScore
socialScore
finalScore
```

## NotificationLog

```txt
userId
channel
message
status
sentAt
```

## Shipment

```txt
registrationId
courierPartner
trackingId
shippingStatus
shippedAt
deliveredAt
```

---

# 18. Final Recommendation

For local development:

* Use deterministic seed data for admin/judges/demo accounts
* Use Faker.js for bulk parent/student generation
* Keep 20–30 manually curated “high quality” demo records for screenshots and presentations
* Generate at least 500 registrations to properly test leaderboard performance and pagination
* Include edge cases intentionally

Recommended libraries:

```bash
npm install @faker-js/faker bcrypt
```

Recommended seeding approach:

* Static JSON for system-critical records
* Faker-based dynamic generation for scale testing
* Separate seed files by domain
* Add optional "reset database" command before seeding


I created a complete dummy dataset structure for the Pratibha Parishad seeding system after reviewing both the technical specification and the seeding requirements. It includes:

Categories
Competitions
Competition categories
Users (Admin, Moderator, Judges, Parents)
Students
Registrations
Transactions
Judge assignments
Scores
Social engagement metrics
Final composite scores
Certificates
Seeder logic
Recommended seed volumes
Advanced scaling datasets
Future-proof tables

The datasets are structured specifically for your Prisma + PostgreSQL + Next.js architecture and support:

Dashboard testing
Role-based auth testing
Judge workflow testing
Payment testing
Certificate verification
Leaderboard calculations
Social score simulations
Pagination/load testing

The document also includes recommendations for Faker.js-based large-scale generation and deterministic seed architecture.

It is complete for an MVP-to-production-ready seeding foundation. It already covers all core relational flows defined in your specification:  and follows the hierarchy defined in the seeding requirements. 

However, before calling it “production-grade complete”, I would still add these critical datasets and seed utilities:

1. Facebook Metrics History
   You currently have only current engagement values.
   Add:

* hourly/daily snapshots
* engagement growth simulation
* viral spike cases

This will help leaderboard analytics and cron testing.

2. Notification Seed Data
   You will definitely need:

* WhatsApp logs
* email logs
* failed delivery logs
* reminder queues

Otherwise communication workflows remain untested.

3. Audit & Activity Logs
   Add:

* admin actions
* judge login activities
* score modifications
* registration verification logs

Very important for moderation systems later.

4. Media & Asset Seeds
   Add:

* certificate templates
* trophy images
* category banners
* competition posters
* judge profile photos

Frontend testing becomes much better.

5. Large Scale Performance Seeds
   Current recommendation says 5000 registrations.
   I would strongly suggest:

* 25k registrations
* 100k social metric records
* 500 judges
* leaderboard cache simulation

Because your model is volume-driven.

6. Seeder Modes
   You should split seeders into:

* `minimalSeed`
* `demoSeed`
* `stressTestSeed`
* `productionMockSeed`

This becomes extremely useful later.

7. Internationalization Seeds
   Since your vision is global:

* Indian students
* Bengali diaspora
* multiple currencies
* multiple timezones
* UTF-8 Bengali names

8. Fraud / Abuse Test Cases
   Very important for your business model:

* duplicate FB links
* fake engagement spikes
* same parent multiple accounts
* suspicious scoring patterns

9. Certificate Verification Edge Cases
   Add:

* revoked certificates
* expired links
* invalid QR cases
* tampered IDs

10. Seeder Architecture
    Your final structure should ideally become:

```txt
/prisma/seeds
  categories.seed.ts
  competitions.seed.ts
  users.seed.ts
  students.seed.ts
  registrations.seed.ts
  scores.seed.ts
  certificates.seed.ts
  social.seed.ts
  leaderboard.seed.ts
  stress.seed.ts
```

So:

* For MVP → yes, complete.
* For serious scale simulation → around 85–90% complete.
* For enterprise-grade institutional architecture → still needs the advanced datasets above.

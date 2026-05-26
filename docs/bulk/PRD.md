# Product Requirements Document (PRD)

## &#x20;Pratibha Parishad – Global Digital Fine Arts Certification & Competition Platform

---

# 1. Product Overview

## Product Name

**Pratibha Parishad**
Tagline: *The Global Council for Indian Fine Arts*

## Product Vision

To build a technology-driven online fine arts institution that starts as a social competition ecosystem and evolves into a globally recognized digital certification authority for Indian cultural arts.

The platform will initially focus on:

* Online cultural competitions
* Facebook-group-based video participation
* Automated judging and ranking
* Digital certificates and optional physical rewards

Over time, it will expand into:

* Structured syllabus-based examinations
* Global certification programs
* Teacher affiliation
* Digital student portfolios
* Online workshops and masterclasses
* AI-assisted practice tools
* International cultural recognition system

Reference concepts discussed in the BRD include:

* Graded syllabus model
* Digital certificate verification 
* Automated judging and scoring 
* Teacher affiliation system 

---

# 2. Business Goals

## Phase 1 Goals

* Build Facebook-based competition ecosystem
* Reach 20,000–30,000 active parent subscribers
* Generate recurring revenue from competitions
* Build parent/student database
* Automate operations to reduce manpower

## Phase 2 Goals

* Introduce structured grade examinations
* Launch teacher and academy affiliation
* Create institutional authority

## Phase 3 Goals

* Become a globally accessible digital cultural certification board

---

# 3. Target Audience

## Primary Users

* Parents of children aged 4–18
* Students interested in fine arts
* Bengali cultural families
* Indian diaspora families abroad

## Secondary Users

* Judges / Examiners
* Music and cultural teachers
* Affiliated academies
* Sponsors

---

# 4. Core Product Modules

---

## MODULE 1 — Competition Engine

### Features

* Competition creation
* Category management
* Age group segmentation
* Submission deadlines
* Entry fee management
* Result automation

### Competition Types

* Recitation
* Singing
* Dance
* Drawing
* Handwriting
* Instrumental music
* Storytelling

### Competition Workflow

1. Competition announced
2. User uploads performance in Facebook Group
3. User submits Facebook post URL
4. System validates URL
5. Payment completed
6. Entry approved
7. Judges evaluate
8. Public engagement tracked
9. Results generated
10. Certificates distributed

Reference:

---

## MODULE 2 — Facebook Integration System

### Features

* Facebook Group URL validation
* Facebook post embedding
* Engagement scraping
* Group membership verification

### Validation Methods

* Regex validation
* Meta Graph API validation
* Comment-based verification fallback

Reference:

---

## MODULE 3 — Judging System

### Features

* Multiple judges per participant
* Blind judging
* Score breakdown
* Judge dashboard
* Conflict detection
* Voice/video feedback

### Scoring Formula

* Judges’ Score: 70%
* Public Engagement Score: 30%

Public score derived from:

* Likes
* Comments
* Shares

Reference:

---

## MODULE 4 — Public Engagement Engine

### Features

* Live leaderboard
* People’s choice award
* Share tracking
* Viral engagement system

### Growth Mechanism

Participants share videos to increase rankings, driving organic Facebook group growth.

Reference:

---

## MODULE 5 — Certificate Generation System

### Features

* Automatic PDF/JPG certificate generation
* QR-code-based certificate verification
* Certificate serial number generation
* Digital seals and signatures
* Multilingual certificates

### Verification Portal

Users can verify authenticity using:

* Certificate ID
* QR code

Reference:

---

## MODULE 6 — Prize & Courier Automation

### Features

* Automated courier booking
* Shipping label generation
* Bulk manifest generation
* Tracking updates
* Pickup scheduling

### Integrations

* Shiprocket
* Delhivery
* iThink Logistics

### Logistics Model

* Kolkata-based dispatch center
* Standardized packaging
* Thermal label printing

Reference:

---

## MODULE 7 — Student Dashboard

### Features

* Competition history
* Certificates
* Rankings
* Digital progress card
* Skill badges
* Portfolio page

### Future Additions

* Grade progression tracking
* AI-assisted practice tools
* Scholarship eligibility

Reference:

---

## MODULE 8 — Teacher & Academy Portal

### Features

* Teacher registration
* Academy affiliation
* Student enrollment
* Batch management
* Exam registration
* White-label academy integration

Reference:

---

## MODULE 9 — Certification Board System

### Features

* Grade-based examinations
* Syllabus management
* Examiner assignment
* Practical submission
* Theory exams
* Diploma generation

### Grade Structure

* Beginner
* Junior
* Intermediate
* Senior
* Diploma

Reference:

---

## MODULE 10 — Revenue Expansion Engine

### Revenue Streams

1. Competition entry fees
2. Physical medal upgrades
3. Workshops/masterclasses
4. Teacher affiliation fees
5. Certification fees
6. Student subscriptions
7. Sponsored competitions
8. Affiliate marketing
9. Premium portfolios
10. Convocation kits

Reference:

---

# 5. User Roles

| Role           | Permissions                       |
| -------------- | --------------------------------- |
| Super Admin    | Full platform control             |
| Moderator      | Competition moderation            |
| Judge/Examiner | Evaluate submissions              |
| Parent         | Manage child participation        |
| Student        | Participate and track progress    |
| Teacher        | Manage students                   |
| Academy        | Affiliated institution management |

---

# 6. Technical Requirements

## Recommended Stack

### Frontend

* Next.js
* React
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### Hosting

* VPS / AWS / DigitalOcean

### Authentication

* JWT + OTP login

### Media Handling

* Facebook embedded posts
* No direct video hosting initially

Reference:

---

# 7. Automation Requirements

## Mandatory Automations

* Entry confirmation
* WhatsApp notifications
* Payment confirmation
* Certificate generation
* Result generation
* Courier label generation
* Leaderboard updates
* Facebook metric syncing

Reference:

---

# 8. Notifications System

## Channels

* WhatsApp
* Email
* SMS (optional)
* Facebook Messenger

## Trigger Events

* Registration successful
* Payment confirmation
* Result published
* Certificate ready
* Workshop recommendation
* Prize shipped

---

# 9. Non-Functional Requirements

## Performance

* Support 10,000+ submissions/month
* Fast leaderboard updates
* Low server load

## Security

* Secure payment processing
* Anti-fraud validation
* Role-based access control

## Scalability

* Modular architecture
* Multi-country support
* Multi-language support

---

# 10. Monetization Strategy

## Initial Model

₹50 competition entry + optional physical medal upgrade

Reference: 

## Premium Upsells

* Personalized feedback
* Printed certificates
* Convocation kits
* Advanced workshops

## Long-Term Model

Recurring certification ecosystem similar to:

* Bangiya Sahitya Parishad
* Prayag Sangeet Samiti
* Prachin Kala Kendra

---

# 11. Roadmap

## Year 1 — Growth

* Facebook competitions
* Parent database growth
* Automation system

## Year 2 — Authority

* Grade examinations
* Teacher affiliation
* Certification system

## Year 3 — Scale

* International students
* AI learning tools
* Virtual convocation
* Global talent network

Reference:

---

# 12. Key Success Metrics

| KPI                       | Target          |
| ------------------------- | --------------- |
| Monthly participants      | 5,000+          |
| Facebook group members    | 50,000+         |
| Repeat participation rate | 60%+            |
| Automation rate           | 90%+            |
| Certificate verifications | Growing monthly |
| Affiliated teachers       | 500+            |

---

# 13. Strategic Differentiators

## What Makes Pratibha Parishad Different

* Traditional branding with modern technology
* Fully online accessibility
* Automated competition infrastructure
* Digital authenticity verification
* Facebook-driven viral acquisition
* International participation support
* Long-term student progression ecosystem

Reference:

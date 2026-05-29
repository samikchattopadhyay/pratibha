# Business Requirements Document (BRD)

## Project: Pratibha Parishad

### Version 1.0

### Prepared For: Avik Chattopadhyay

### Prepared On: 24 May 2026

---

# 1. Executive Summary

Pratibha Parishad is envisioned as a technology-driven online cultural competition and certification platform focused on Indian fine arts such as recitation, singing, dance, drawing, handwriting, storytelling, and related disciplines.

The project starts as a highly automated Facebook-based online competition ecosystem and gradually evolves into a globally accessible digital certification authority inspired by institutions such as Bangiya Sahitya Parishad, Prayag Sangeet Samiti, and Prachin Kala Kendra. 

The core strategy is:

* Low entry barrier
* High-volume participation
* Strong automation
* Community-driven viral growth
* Long-term student retention through graded certification

---

# 2. Vision Statement

To become a globally recognized digital Indian fine arts certification authority enabling students from India and abroad to participate, learn, compete, and earn verified credentials online.

---

# 3. Business Objectives

## Phase 1 — Community & Competition Engine

* Build large Facebook-based cultural communities
* Run recurring online competitions
* Automate registration, judging, certificates, and logistics
* Build a database of parents and students

## Phase 2 — Monetization & Ecosystem

* Launch workshops and masterclasses
* Offer physical medals and premium certificates
* Introduce memberships and subscriptions
* Generate revenue from sponsorships and affiliate partnerships

## Phase 3 — Certification Authority

* Launch syllabus-based graded examinations
* Build examiner and teacher network
* Introduce globally verifiable certificates
* Establish institutional credibility

---

# 4. Business Model

## Primary Revenue Streams

* Competition entry fees
* Medal/trophy upgrades
* Courier charges
* Annual memberships
* Workshops and masterclasses
* Sponsored competitions
* Affiliate commissions
* Premium student portfolio pages
* Certification examination fees



---

# 5. Target Audience

## Primary

* Parents of children aged 4–18
* Students interested in extracurricular activities
* Bengali and Indian cultural communities
* Indian diaspora families abroad

## Secondary

* Art teachers
* Music schools
* Dance academies
* Cultural organizations

---

# 6. Core Platform Concept

The platform will NOT host videos directly initially.

Participants will:

1. Upload videos in the official Facebook Group
2. Copy the Facebook post link
3. Submit the link on the platform
4. Complete payment
5. Enter competition workflow

This reduces:

* Hosting cost
* Server bandwidth
* Content moderation burden

It also increases:

* Facebook group growth
* Viral engagement
* Organic reach



---

# 7. Major Modules

# 7.1 Public Website

## Features

* Home page
* About us
* Competition listings
* Result pages
* Hall of fame
* Examiner profiles
* Workshops
* Student verification
* Blog/news
* Contact page

---

# 7.2 Competition Management Module

## Features

* Competition creation
* Category management
* Age group management
* Deadline setup
* Entry fee setup
* Prize configuration
* Participation certificate automation

---

# 7.3 Registration Module

## Features

* Parent/student registration
* Facebook video URL submission
* Payment gateway integration
* Address collection
* WhatsApp/email notifications

---

# 7.4 Facebook Validation System

## Features

* Validate submitted Facebook post URLs
* Ensure posts belong to official group
* Prevent duplicate submissions
* Extract post ID automatically

Suggested methods:

* Regex validation
* Meta Graph API verification



---

# 7.5 Judge & Examiner Dashboard

## Features

* Secure examiner login
* Blind judging
* Video embedding
* Score submission
* Category-wise scoring
* Conflict detection
* Voice/video feedback support



---

# 7.6 Public Voting & Engagement Engine

## Features

* Like/comment/share tracking
* People's choice ranking
* Live leaderboard
* Engagement-based scoring

Suggested weighted formula:

* Judges Score = 70%
* Public Engagement Score = 30%



---

# 7.7 Certificate Generation System

## Features

* Automatic PDF generation
* QR-based verification
* Unique certificate ID
* Digital seal/wax stamp branding
* Bilingual certificate support



---

# 7.8 Courier Automation System

## Features

* Shiprocket API integration
* Label generation
* Pickup scheduling
* Tracking updates
* Delivery notifications



---

# 7.9 Membership Module

## Features

* Annual subscription plans
* Unlimited competitions
* Discounted workshops
* Special recognition badges

---

# 7.10 Student Digital Portfolio

## Features

* Dedicated student profile URL
* Achievement timeline
* Competition history
* Downloadable certificates
* Shareable digital trophy room



---

# 7.11 Certification Authority Module (Future)

## Features

* Grade-based syllabus
* Online examinations
* Examiner allocation
* Result publication
* Digital progress book
* Convocation system



---

# 8. User Roles

| Role            | Responsibilities          |
| --------------- | ------------------------- |
| Super Admin     | Complete platform control |
| Moderator       | Competition moderation    |
| Examiner/Judge  | Evaluation                |
| Student         | Participation             |
| Parent          | Registration/payment      |
| Teacher         | Academy management        |
| Courier Manager | Dispatch operations       |

---

# 9. Technical Architecture

## Recommended Stack

| Layer           | Technology        |
| --------------- | ----------------- |
| Frontend        | Next.js           |
| Backend         | Node.js           |
| Database        | PostgreSQL        |
| ORM             | Prisma            |
| Hosting         | VPS / AWS         |
| Authentication  | JWT/Auth.js       |
| File Storage    | Minimal initially |
| Payment Gateway | Razorpay          |
| Messaging       | WhatsApp API      |
| Courier API     | Shiprocket        |
| Cache           | Redis             |



---

# 10. Automation Goals

The platform should achieve:

* 90% process automation
* Minimal manual intervention
* High scalability

Automated areas:

* Registration
* Validation
* Ranking
* Certificates
* Notifications
* Courier labels
* Leaderboards

---

# 11. Marketing Strategy

## Primary Channel

Facebook Groups

## Supporting Channels

* WhatsApp communities
* Facebook Ads
* ManyChat automation
* Referral system
* Parent ambassador program



---

# 12. Branding Strategy

Brand identity should appear:

* Traditional
* Cultural
* Institutional
* Prestigious
* Heritage-inspired

Suggested branding elements:

* Terracotta patterns
* Alpana motifs
* Traditional typography
* Gold seals
* Bengali cultural identity



---

# 13. Monetization Expansion Strategy

## Future Revenue Opportunities

* Online workshops
* Teacher onboarding
* Academy affiliations
* International student pricing
* Sponsored contests
* Merchandise
* Premium evaluations
* Convocation kits



---

# 14. Growth Roadmap

## Year 1

* Build Facebook audience
* Launch competitions
* Automate operations

## Year 2

* Introduce graded exams
* Build examiner network
* Launch memberships

## Year 3

* Launch global certification
* Academy partnerships
* Student dashboard ecosystem



---

# 15. Risk Analysis

| Risk               | Mitigation               |
| ------------------ | ------------------------ |
| Fake likes         | Weighted scoring         |
| Judge bias         | Blind judging            |
| Logistics overload | Courier automation       |
| Spam entries       | Validation system        |
| Reputation issues  | Transparent verification |
| Support overload   | FAQ + chatbot            |

---

# 16. Competitive Advantage

## Traditional Institutions Lack

* Automation
* Mobile-first UX
* Global reach
* Real-time engagement
* Digital verification
* AI-enabled tools

## Pratibha Parishad Advantages

* Tech-driven
* Viral social loop
* Scalable infrastructure
* Global participation capability
* Community retention engine

---

# 17. Suggested Initial Categories

* Bengali Recitation
* Rabindra Sangeet
* Nazrul Geeti
* Classical Dance
* Drawing
* Handwriting
* Storytelling
* Instrumental Music

---

# 18. Initial Operational Strategy

Recommended launch model:

| Item             | Strategy                   |
| ---------------- | -------------------------- |
| Entry Fee        | ₹50                        |
| Top 5            | Physical trophies          |
| Others           | Digital certificates       |
| Optional Upgrade | Physical medal/certificate |
| Main Focus       | Volume + database growth   |



---

# 19. Long-Term Vision

The ultimate objective is to transform:

* From Facebook competition organizer
* To global digital cultural education ecosystem

Potential future identity:
“Global Indian Fine Arts Examination & Certification Board”

---

# 20. Conclusion

Pratibha Parishad has the potential to become:

* A scalable digital cultural brand
* A recurring revenue educational ecosystem
* A data-driven parent community
* A globally recognized online fine arts certification authority

The strongest advantage lies in combining:

* Cultural trust
* Automation
* Community virality
* Long-term student lifecycle retention

Primary reference discussions and concepts were derived from the uploaded project discussion document. 

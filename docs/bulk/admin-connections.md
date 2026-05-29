Below is the clarified **end-to-end operational interconnection** of the major admin pages/workspaces for the Pratibha Parishad platform, based strictly on the uploaded workflow documents and prior project discussions.
Sources:   

---

# 1. MASTER SYSTEM FLOW

The platform is not a collection of isolated pages.
It is a **single operational pipeline**:

```text
Competition Created
        ↓
Participant Registration
        ↓
Payment Verification
        ↓
Facebook Submission Verification
        ↓
Judge Assignment
        ↓
Multi-Judge Evaluation
        ↓
Conflict Resolution
        ↓
Public Voting Aggregation
        ↓
Final Score Generation
        ↓
Results Freeze
        ↓
Certificate Generation
        ↓
Courier Dispatch
        ↓
Revenue Analytics
        ↓
Retention / Upsell / Future Exams
```

---

# 2. GLOBAL PAGE INTERCONNECTION MAP

```text
Dashboard
 ├── Competitions
 │     └── Participants
 │             └── Judges
 │                     └── Score Conflicts
 │                             └── Finalized Results
 │                                     ├── Voting
 │                                     ├── Certificates
 │                                     ├── Courier
 │                                     └── Finance
 │
 ├── FB Scraper
 │     └── Participants
 │
 └── Settings
       └── affects all modules globally
```

---

# 3. PAGE-BY-PAGE INTERCONNECTION

---

# A. DASHBOARD PAGE

(Source operational root)


## Purpose

Acts as:

* Command center
* Operational monitoring system
* Notification aggregation layer
* Workflow launcher

---

## Incoming Data Connections

Receives live data from:

* Competitions module
* Participants module
* Judges module
* Voting engine
* Courier engine
* Finance engine

---

## Outgoing Navigation Connections

Sidebar links connect to:

* Dashboard
* Competitions
* Participants
* Judges
* Live Voting
* Certificates
* Courier
* Finance
* FB Scraper
* Settings

---

## Buttons & Actions

### "Competitions"

Navigates to competition management workspace.

### "Participants"

Opens intake queue filtered by registration statuses.

### "Judges"

Opens evaluation management board.

### "Live Voting"

Shows social engagement analytics.

### "Certificates"

Opens certificate generation queue.

### "Courier"

Opens logistics fulfillment dashboard.

### "Finance"

Shows revenue analytics.

### "FB Scraper"

Triggers social metric collection module.

### "Settings"

Global configuration management.

### Logout

Destroys admin session and invalidates auth token.

---

# B. COMPETITIONS PAGE

(Not fully described in uploaded docs but implied throughout workflow.)

## Purpose

Competition lifecycle management.

This page is the parent object from which:

* participants
* judges
* votes
* certificates
* dispatches
  originate.

---

## Core Interconnections

Competition entity links to:

* Participants
* Judges
* Voting
* Certificates
* Finance

---

## Likely Workflow

```text
Create Competition
    ↓
Define Category
    ↓
Define Rules
    ↓
Open Registration
    ↓
Receive Participants
```

---

## Buttons & Actions

### Create Competition

Creates new competition record.

Triggers:

* registration page creation
* public submission route
* social campaign assets

---

### Edit Competition

Updates:

* title
* deadline
* fee
* categories
* judging criteria

---

### Publish Competition

Makes competition visible publicly.

Triggers:

* homepage listing
* registration availability
* FB group announcement workflows

---

### Close Registration

Locks participant intake.

Triggers:

* disables submission API
* moves entries to verification queue

---

# C. PARTICIPANTS WORKSPACE

(Core operational engine)


---

# PRIMARY PURPOSE

Handles:

* registrations
* payment verification
* Facebook link validation
* examiner assignment

---

# INCOMING CONNECTIONS

Receives data from:

* Registration Form
* Razorpay/payment gateway
* Facebook submission links
* FB scraper

---

# OUTGOING CONNECTIONS

Sends validated participants to:

* Judges module
* Voting module
* Certificates module

---

# FILTER PILLS INTERCONNECTION

## ALL

Shows every participant.

No workflow action.

---

## PENDING

Shows:

* unpaid
  OR
* unverified
  OR
* unapproved entries

Admin action required.

---

## PAID

Shows payment-confirmed entries.

Still may require:

* FB verification
* judge assignment

---

## UNASSIGNED

Participants without examiner mapping.

Critical operational queue.

---

# TABLE ACTIONS

---

## VIDEO EYE/LINK BUTTON



### Action

Opens Facebook post.

### System Checks

* URL validity
* group ownership
* accessibility
* public visibility

### Future Recommended Best Practice

Open in modal instead of new tab.

---

## APPROVE BUTTON

### Preconditions

* payment successful
* FB link verified
* category validated

### Action

Changes status:

```text
PENDING → APPROVED
```

### Side Effects

Triggers:

* examiner assignment availability
* judging queue eligibility

---

## ASSIGN EXAMINER DROPDOWN

### Action

Maps participant to one or more judges.

### Side Effects

Creates:

* evaluation tasks
* judge notifications
* scoring records

### Database Impact

Creates records in:

```text
JudgeAssignment
```

---

## SEARCH BAR

### Searches by:

* Roll ID
* Name
* Category
* Phone
* Judge

---

## PAGINATION BUTTONS

### Prev / Next

Loads paginated server data.

Must use server-side pagination for scale.

Industry Best Practice:
Never load all records client-side.

---

# D. JUDGES WORKSPACE



---

# PURPOSE

Controls:

* evaluation lifecycle
* scoring quality
* moderation
* conflict management

---

# INCOMING CONNECTIONS

Receives:

* approved participants
* assigned entries

---

# OUTGOING CONNECTIONS

Sends finalized scores to:

* Results engine
* Certificates
* Ranking system
* Voting aggregation engine

---

# TOP SECTION: JUDGE AUDIT CARDS

## Clicking Judge Card

### Opens

Judge performance modal.

### Contains

* score history
* average deviation
* evaluation speed
* pending assignments
* anomalies

---

## Outlier Alert Card

### Trigger Logic

System detects:

```text
Judge score deviation > threshold
```

### Example

Judge consistently gives:

* extremely high
  OR
* extremely low scores

### Side Effects

* marks evaluations for review
* may freeze judge temporarily

---

# KANBAN BOARD INTERCONNECTION

---

## PENDING EVALUATION COLUMN

### Meaning

Assigned but not scored.

### Button: Review

Opens evaluation screen.

---

## IN JURY REVIEW COLUMN

### Meaning

Judge submitted scores.
Awaiting moderation/consensus.

### Button: Re-queue

Returns entry to pending state.

Used for:

* suspicious judging
* incomplete evaluation

---

## SCORE CONFLICTS COLUMN

### Trigger Conditions

Multiple judges differ heavily.

Example:

```text
Judge A = 95
Judge B = 42
```

### Button: Review

Moves card:

```text
Conflict → Jury Review
```

---

## SCORING FINALIZED COLUMN

### Meaning

Results frozen.

### Side Effects

Triggers:

* ranking engine
* certificate eligibility
* winner generation
* public result preparation

---

# E. LIVE VOTING PAGE



---

# PURPOSE

Tracks:

* likes
* comments
* shares
* engagement velocity

from Facebook competition posts.

---

# INCOMING CONNECTIONS

Receives:

* FB scraper metrics
* participant mappings

---

# OUTGOING CONNECTIONS

Feeds into:

* People's Choice rankings
* weighted final score engine

---

# VELOCITY INDEX

Calculated from:

```text
Likes
Comments
Shares
Growth speed
```

---

# STATUS BADGE

### 🔥 Rising Talent

Triggered when:

* engagement spike detected

Useful for:

* viral promotion
* homepage featuring

---

# INDUSTRY BEST PRACTICE

People's Choice should NEVER dominate expert scoring.

Recommended weighting:

```text
Judges: 70–85%
Public Voting: 15–30%
```

Otherwise vote manipulation becomes dangerous.

---

# F. CERTIFICATES PAGE



---

# PURPOSE

Bulk certificate generation and validation.

---

# INCOMING CONNECTIONS

Receives:

* finalized results
* participant data
* rankings

---

# OUTGOING CONNECTIONS

Sends:

* downloadable certificates
* QR verification data
* social share assets

---

# BULK GENERATE PDF BUTTON

### Action

Starts certificate rendering job.

### Pipeline

```text
Template
→ Student Name
→ Rank
→ QR
→ Signature
→ PDF Render
```

---

# QR VALIDATION FLOW

QR opens:

```text
verify.pratibhaparishad.com/certificate/{id}
```

Must show:

* authenticity
* participant
* grade/rank
* event
* examiner signatures

---

# G. COURIER PAGE



---

# PURPOSE

Prize dispatch logistics.

---

# INCOMING CONNECTIONS

Receives:

* winner data
* shipping addresses
* prize type

---

# OUTGOING CONNECTIONS

Connects to:

* Shiprocket API
* Delhivery
* tracking systems

---

# PRINT LABELS & SCHEDULE PICKUP BUTTON

### Action Flow

```text
Generate labels
→ Create shipment
→ Assign courier
→ Schedule pickup
```

---

# DELIVERY ALERTS

### Triggered when:

* invalid PIN
* incomplete address
* courier rejection

### Side Effects

Creates:

* support ticket
* manual correction queue

---

# H. FINANCE PAGE



---

# PURPOSE

Revenue intelligence dashboard.

---

# INCOMING CONNECTIONS

Receives:

* payment gateway data
* upsells
* courier fees
* medal purchases

---

# OUTGOING CONNECTIONS

Feeds:

* accounting exports
* profitability analytics

---

# INDUSTRY BEST PRACTICE

Should support:

* GST reporting
* payout reconciliation
* refund tracking
* failed payment recovery

---

# I. SETTINGS PAGE



---

# PURPOSE

Global infrastructure configuration.

---

# AFFECTS ALL MODULES

Changes here affect:

* WhatsApp
* payments
* FB scraping
* certificates
* couriering

---

# SAVE CONFIGURATION BUTTON

### Action

Encrypts and stores secrets securely.

---

# REQUIRED SECURITY PRACTICES

Never expose:

* Razorpay secrets
* Meta tokens
* Shiprocket API keys

Must use:

* environment variables
* encrypted storage
* role-based access

---

# J. FB SCRAPER MODULE

(Discussed extensively in project planning chats)


---

# PURPOSE

Automates:

* engagement collection
* link verification
* social analytics

---

# INCOMING CONNECTIONS

Receives:

* FB post URLs

---

# OUTGOING CONNECTIONS

Feeds:

* voting engine
* participant verification
* leaderboard

---

# INDUSTRY BEST PRACTICE ARCHITECTURE

```text
Cron Job
   ↓
Meta Graph API
   ↓
Metrics Fetch
   ↓
Database Update
   ↓
Leaderboard Refresh
```

---

# FINAL RECOMMENDED SYSTEM FLOW

The ideal operational chain should become:

```text
FB Group Post
    ↓
Registration
    ↓
Payment
    ↓
Automatic Verification
    ↓
Judge Assignment
    ↓
Blind Multi-Judge Evaluation
    ↓
Conflict Detection
    ↓
Public Voting Merge
    ↓
Result Freeze
    ↓
Certificate Generation
    ↓
Courier Automation
    ↓
Revenue Analytics
    ↓
Upsell to Courses / Exams / Certification Grades
```

This architecture is operationally aligned with:

* scalable edtech systems
* online certification boards
* event management SaaS platforms
* modern workflow-driven admin dashboards

and is structurally strong enough to evolve from competitions into a full digital certification authority model.

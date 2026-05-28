# Student Public Profile Page Redesign

**Date:** 2026-05-28  
**Status:** PLANNING  
**Priority:** HIGH (Data exists but not displayed)  
**Industry Alignment:** Best practices from Behance, LinkedIn, music portfolio platforms, and talent competition design

---

## Industry Best Practices Research

Based on analysis of leading platforms (LinkedIn, Behance, Dribbble, music portfolios, and talent competitions), the following principles guide this redesign:

### 1. **Visual Hierarchy & Trust Design**
- **Primary Signal**: Profile photo + name + key stats above the fold (inspired by [LinkedIn Profile Optimization](https://resumevera.com/blogs/linkedin-profile-optimization-guide-2026))
- **Trust Badges**: Verified achievements should display verification checkmarks (inspired by [LinkedIn Digital Badges](https://certifier.io/blog/free-linkedin-badges-examples-2025))
- **Credibility Placement**: Award badges and achievements appear early, without clutter (max 3 badges per section to avoid "trust desperation")
- **Reference**: [UX Trust Design best practices](https://gapsystudio.com/blog/ux-trust-design/)

### 2. **Achievement Presentation Patterns**
- **Quality Over Quantity**: Showcase best 5-10 standout achievements (inspired by [Behance Portfolio best practices](https://cuberto.com/blog/how-prepare-your-design-portfolio-behance/))
- **Narrative-Driven**: Each achievement includes context: competition name, category, score, and outcome (case study approach from Behance)
- **Verified Badges**: Organization-issued credentials (Pratibha Parishad) appear with verification checkmarks (reference: [Certified Digital Badges](https://sertifier.com/blog/design-of-badges-clear-credible/))
- **Timeline Chronology**: Achievements grouped by year/season showing growth trajectory (inspired by [Sports Achievement Timeline patterns](https://flourish.studio/resources/sports/))

### 3. **Data Visualization for Rankings & Awards**
- **Prize Breakdown**: Medal count (🥇/🥈/🥉) with animated bar charts showing rank distribution (inspired by [Bar Chart Race patterns](https://chartexpo.com/blog/how-to-visualize-ranking-data))
- **Performance Metrics**: Category-wise summaries with avg scores, win rates, and participation counts
- **Visual Collectors**: Attractive trophy/medal icons for achievements ([Collectible Achievements pattern](https://ui-patterns.com/patterns/CollectibleAchievements))
- **Statistics with Impact**: Use shadcn stats components for attention-grabbing achievement metrics (reference: [Shadcn Statistics Components](https://shadcnstore.com/blocks/marketing/statistics))

### 4. **Portfolio Structure (Validated Pattern)**
Student portfolio best practices emphasize:
- **Narrative + Reflection**: Each achievement should include reflection on growth/learning (reference: [Student Portfolio Best Practices](https://www.educationworld.com/a_curr/best-practices-student-portfolios-assessment.shtml))
- **Showcase vs. Growth**: Prioritize showcase (best results) over developmental evidence (reference: [Edutopia Portfolio Assessment](https://www.edutopia.org/article/standards-based-portfolio-assessment/))
- **Authentic Testimonials**: Include judge feedback/recommendations if available (validates portfolio through third-party credibility)
- **Selection Curation**: Student autonomy in featured achievements (what to highlight on profile)

### 5. **Verified Credentials & Social Proof**
- **Organization Verification**: Badges clearly show "Verified by Pratibha Parishad" (reference: [Trust Signals & Social Proof](https://lineardesign.com/blog/trust-signals/))
- **Certificate Proof**: Downloadable, shareable certificates build credibility ([Musician Portfolio elements](https://www.format.com/magazine/resources/photography/how-to-make-music-portfolio))
- **Judge Attribution**: Display judge names/tiers (when public) as credibility signal
- **Profile Ranking Tier**: Optional "Tier" badge (Bronze/Silver/Gold) based on achievement count, win rate, avg score (inspired by [LinkedIn Rank Tiers](https://linkedinrank.com/))

---

## Problem Statement

**Current Issue:** Student profiles show **0 Competitions** and **0 Awards** despite database containing verified prize-winning registrations.

**Example:** Shubham Das (slug: `shubham-das`) has **13 prize-winning registrations** across 8 competitions:
- 🥇 7 First Place wins
- 🥈 4 Second Place wins  
- 🥉 2 Third Place wins
- ⭐ Highest score: 98.0 (Rabindra Sangeet)

Yet profile displays: "0 Competitions | 0 Awards"

---

## Root Cause Analysis

### 1. Data Structure Issues

**Current Fetch Query** (`src/app/profile/[id]/page.tsx` lines 14-108):
- ✅ Fetches `student.registrations` with full relational data
- ✅ Includes `certificate`, `prizeAward`, `competitionCategory`, `competition`, `category`
- ✅ Should return all verified achievements

**Likely Causes of Zero Results:**
1. **Student `isPublic` flag is `false`** (line 111-113) → Returns `null` → Profile not found
2. **Registrations not linked correctly** in database despite being in seed data
3. **Filter condition in query** may be excluding some registrations
4. **Certificate/PrizeAward relationships** may be incomplete

### 2. What the Current Profile Displays

**Working Sections:**
- Hero section with name, age, gender, location, disciplines ✅
- Bio, profile image, member since year ✅
- Training institutes, languages, special skills (if populated) ✅
- External achievements (self-reported) ✅

**Missing Sections:**
- ❌ Verified Pratibha Parishad competition results
- ❌ Prize rankings and ranks
- ❌ Competition category details
- ❌ Score/rating breakdown
- ❌ Certificate downloads
- ❌ Achievement timeline
- ❌ Category-wise performance summary

---

## Database Data Availability

### Student Achievement Data Sources

#### 1. **Registrations** (Verified Achievements)
```prisma
Registration {
  id: String
  studentId: String
  competitionCategoryId: String
  
  // Current data
  finalRank: Int?              // Prize rank (1st, 2nd, 3rd)
  finalScore: Decimal?          // Judge score (0-100)
  status: EntryStatus           // VERIFIED, REJECTED, etc.
  
  // Relations that unlock data
  competitionCategory → {
    competition: { title, startDate, endDate, scope }
    category: { name, slug }
    minAge, maxAge
  }
  certificate → {
    type: CertificateType       // PARTICIPATION, MERIT_1, MERIT_2, MERIT_3
    certificateUrl: String
    issuedAt: DateTime
  }
  prizeAward → {
    rank: PrizeRank             // FIRST_PLACE, SECOND_PLACE, THIRD_PLACE, etc.
    awardedAt: DateTime
    isDispatched: Boolean
  }
}
```

**Available Data Points per Registration:**
- ✅ Competition title & dates
- ✅ Category name
- ✅ Final score (if finalized)
- ✅ Prize rank (if awarded)
- ✅ Certificate type & URL
- ✅ Age eligibility (minAge, maxAge)
- ✅ Verification status
- ✅ Award dispatch status

#### 2. **ExternalAchievements** (Self-Reported)
```prisma
ExternalAchievement {
  title: String         // e.g. "1st Place – School Annual Day"
  eventName: String     // e.g. "St. Xavier's Annual Cultural Fest"
  category: String?     // e.g. "Singing", "Drawing"
  year: Int
  rank: String?         // e.g. "1st Place", "Runner Up"
  description: String?  // Optional detail
  proofUrl: String?     // Link to photo, certificate, news article
  displayOrder: Int
}
```

#### 3. **Student Profile Fields**
```prisma
Student {
  disciplineInterests: String[]  // Searchable interests
  trainingInstitutes: String[]   // Education background
  languages: String[]
  specialSkills: String[]
  bio: String?
  schoolName: String?
  schoolClass: String?
}
```

#### 4. **Judge Assignment Data** (Available but NOT displayed)
```prisma
JudgeAssignment {
  registration → {...}
  judge: { name, tier, isVerified, bio, credentials }
  score: {
    criteria1: Int  // Technique (max 40)
    criteria2: Int  // Expression (max 30)
    criteria3: Int  // Rhythm (max 30)
    criteria4: Int? // Originality (max 10, NATIONAL only)
    totalScore: Int
    remarks: String?
  }
}
```

---

## Current Implementation Gaps

### 1. **Query Fetch Chain**
Current: `Registration` → `Certificate` (if exists) → Count  
Missing: Filter by `status: VERIFIED` AND `paymentStatus: SUCCESS`

### 2. **Score Aggregation**
- Individual judge scores available but not aggregated/displayed
- Average score calculation: `(score1 + score2) / 2` not implemented
- Rubric breakdown (Technique, Expression, Rhythm) not shown

### 3. **Prize Display**
- `prizeAward.rank` available but mapped only as string
- No visual medal/trophy indicators
- No dispatch/shipping status

### 4. **Timeline/Chronology**
- Competitions shown in arbitrary order (no sort)
- No timeline view of wins over time
- No season/year grouping

### 5. **Category Performance**
- Student may have multiple wins in same discipline (e.g., 3× Drawing wins)
- No aggregated view: "Drawing: 3 wins (1st, 1st, 2nd)"
- No category-wise statistics

---

## Proposed Redesign

### New Profile Layout Structure (Industry-Aligned)

```
1. HERO SECTION (Enhanced with trust signals)
   - Profile avatar, name, age, location, disciplines
   - 🏆 Tier Badge: "GOLD PERFORMER" (Bronze/Silver/Gold based on metrics)
   - Verification checkmark: "✓ Verified by Pratibha Parishad"
   - Bio, member since
   - STATS (with visual emphasis): Total Competitions | Awards Won | Categories | Avg Score
   [Inspired by: LinkedIn profile hierarchy, Behance showcasing]

2. AWARDS HIGHLIGHT SECTION (NEW - Attention-Grabbing)
   - Medal Counts with animated bar visualization: 🥇 7 | 🥈 4 | 🥉 2
   - "Highest Achievement" callout card: "98.0 points in Rabindra Sangeet"
   - Top 3 Featured Wins (featured by student choice):
     Card with: Competition name, score, medal, small badge
   [Inspired by: Statistics component design, Bar Chart Race patterns, Collectible Achievements]

3. CATEGORY PERFORMANCE DASHBOARD (NEW)
   - Grid of category cards (one per discipline):
     Card shows:
     • Category icon & name
     • "3 wins from 5 registrations" 
     • Win breakdown: 1st place: 1, 2nd place: 2
     • Avg score in category: 93.7/100
     • Sortable by: Wins, Score, Recency
   [Inspired by: Data visualization for sports achievement, portfolio curation]

4. VERIFIED ACHIEVEMENTS - COMPETITION RESULTS (Refactored)
   - Grouped by: Category, Year, or Score (user selectable)
   - Sortable: Latest, Best Score, Best Rank
   - Each card includes:
     ✓ Competition title + date (with Pratibha Parishad verification badge)
     ✓ Category + age group eligibility
     ✓ Prize rank with medal icon (🥇/🥈/🥉 or "Participation")
     ✓ Final score (large, prominent) + rubric breakdown
     ✓ Judge information: "Judged by [Judge Name, Tier]" (if public)
     ✓ Brief judge feedback/remarks (if available)
     ✓ Certificate badge with download link
     ✓ Award dispatch status ("Dispatched on [date]" or "In preparation")
     ✓ Optional: Award item photo/description
   [Inspired by: Behance case study approach, musician portfolio elements, LinkedIn credential display]

5. PERFORMANCE METRICS SECTION (NEW - Optional)
   - Average Score Trend: Line chart showing score progression over time
   - Win Rate: "3 wins from 13 registrations (23%)"
   - Category Breakdown: Pie chart showing participation % per discipline
   - Timeline View: Achievements grouped by year, showing growth trajectory
   [Inspired by: Sports timeline patterns, ranking data visualization]

6. ACHIEVEMENT TIMELINE (NEW - Optional)
   - Chronological list grouped by year:
     "2024"
     • Competition 1 (🥇 First Place)
     • Competition 2 (🥈 Second Place)
     "2023"
     • Competition 3 (Participation)
   - Optional: Animated timeline showing achievement journey
   [Inspired by: Sports achievement timelines, portfolio chronology]

7. TRAINING & EDUCATION (Existing)
   - Institutes, languages, special skills
   - Format as structured list with icons

8. EXTERNAL ACHIEVEMENTS (Existing, visual distinction)
   - Self-reported, non-verified achievements
   - Clearly labeled: "Self-Reported (not verified by Pratibha Parishad)"
   - Secondary visual hierarchy (smaller, muted styling)
   [Inspired by: Verified vs. unverified badge patterns]

9. CALL-TO-ACTION & SHARING (Enhanced)
   - Share profile button with social media integration
   - Download achievements as PDF/image
   - Export top 3 achievements for resume/portfolio
   - "Explore more competitions" link
   [Inspired by: Music portfolio sharing, portfolio platform features]

10. FOOTER
   - Links to Pratibha Parishad, competitions, student dashboard
```

### Design Principles Summary
- **Trust First**: Verification badges and credibility signals appear early and often
- **Visual Hierarchy**: Stats, awards, achievements in order of impact (medals > scores > categories)
- **Data Storytelling**: Each section tells a story (growth, expertise, range)
- **Curation Over Completeness**: Highlight best 5-10 achievements, not all 13+
- **Responsive & Mobile**: Cards stack, charts responsive, stats stay prominent
- **Dark Mode Contrast**: Medals/badges stand out against Charcoal background

---

## Achievement Tier System (NEW - LinkedIn-Inspired)

A ranking tier badge based on verified achievements increases profile credibility and gives students aspirational goals. Inspired by [LinkedIn Ranking Tiers](https://linkedinrank.com/), implement a 4-tier system:

### Tier Calculation Algorithm
```
Score = (goldMedals × 3) + (silverMedals × 2) + (bronzeMedals × 1) + (participations × 0.2)
Weighted = Score + (avgScore / 100) + (totalCompetitions / 10)

BRONZE:      0 - 5 points      → "Rising Talent"
SILVER:     5 - 15 points      → "Skilled Performer"  
GOLD:      15 - 40 points      → "Award Winner"
PLATINUM:   40+ points         → "Master Competitor"
```

### Tier Badge Display
- Placed in hero section, right of name
- Icon: Trophy with metal color (🏆 = bronze, 🥈 = silver, 🥇 = gold, 👑 = platinum)
- Hover tooltip: "Tier calculated from verified achievements"
- Dynamic: Updates when new registrations are verified
- Motivational: Shows "Path to next tier: 5 more points needed"

### Benefits
- **Credibility Signal**: Shows visitor the student is legitimately accomplished
- **Aspirational Goal**: Motivates students to compete and win more
- **Differentiation**: Helps recruiters/scouts identify top talent quickly
- **Social Proof**: "Gold Performer" appears more trustworthy than generic profile

---

## New Sections Detailed

### A. Awards Highlight Card
**Purpose:** Immediate visual impact showing top achievements  
**Position:** Right after hero section  

```tsx
// Data needed
{
  prizeBreakdown: {
    FIRST_PLACE: 7,
    SECOND_PLACE: 4,
    THIRD_PLACE: 2,
  },
  highestScore: {
    value: 98.0,
    category: "Rabindra Sangeet",
    competition: "Bishwo Kobi Shradhyanjali 2025"
  },
  topCompetitions: [
    { competitionTitle, rank, score, category },
    // ... top 3
  ]
}
```

**Component:** `<AwardsHighlight />`

### B. Verified Achievements - Refactored
**Purpose:** Replace current zero-display with rich competition detail  
**Grouping Options:**
1. **By Category** (if student has 3+ categories)
2. **By Date** (Latest first)
3. **By Rank** (Best results first)

```tsx
interface CompetitionResult {
  competitionId: string;
  competitionTitle: string;
  competitionStartDate: string;
  competitionEndDate: string;
  categoryName: string;
  categoryId: string;
  ageGroup: string; // "12-14 years"
  
  // Results
  finalRank: Int?;         // 1, 2, 3
  finalScore: Decimal?;    // 0-100
  prizeName: string?;      // "First Prize"
  
  // Scoring breakdown
  judgeScores: [
    { judgeName, judgeId, judgeTier, score }
  ];
  averageScore: Decimal;
  scoringRubric: {
    technique: Int,        // Technique/Skill (0-40)
    expression: Int,       // Expression/Presentation (0-30)
    rhythm: Int,           // Rhythm/Composition (0-30)
    originality: Int?      // Originality (0-10, NATIONAL only)
  };
  
  // Certificate & Prize
  certificateType: CertificateType;
  certificateUrl: string;
  certificateIssuedAt: DateTime;
  prizeDispatchStatus: string?;
  prizeDispatchedAt: DateTime?;
  
  registrationStatus: EntryStatus;
}
```

**Component:** `<CompetitionResultCard />` with sorting/filtering options

### C. Category Performance Summary
**Purpose:** Show expertise across disciplines  

```tsx
interface CategorySummary {
  categoryName: string;
  categoryIcon: string;
  totalRegistrations: number;
  winCount: number;
  winRate: number;  // e.g., 40% (4 wins from 10 registrations)
  prizeBreakdown: {
    firstPlace: number,
    secondPlace: number,
    thirdPlace: number,
  };
  averageScore: Decimal;
  mostRecentCompetition: {
    competitionTitle: string;
    date: DateTime;
    score: Decimal;
    rank: Int?;
  };
  competitions: CompetitionResult[];
}
```

**Component:** `<CategoryPerformanceSummary />`
**Layout:** Grid of 3-4 cards per row (responsive to 1 col on mobile)
**Sorting Options:** Wins, Score, Recency, or alphabetical

**Card Interaction:**
- Click to expand: Show all registrations in this category
- Hover: Show "View all competitions in [Category]" CTA
- Visual: Category icon (🎵 Music, 🎨 Visual Art, etc.)

### D. Achievement Timeline (Optional Enhancement)
**Purpose:** Chronological view of journey showing growth trajectory  
**Grouping:** By year, then by competition date (most recent first)

**Visual Design:**
- Vertical timeline with year headers as anchors
- Medal icons (🥇/🥈/🥉) instead of text badges
- Score shown inline: "(98.0)"
- Participation entries show just title and score (no medal)
- Optional: Animated timeline on scroll-into-view

**Data Transformation:**
```typescript
groupByYear(registrations).sort((a, b) => b.year - a.year)
  .map(yearGroup => ({
    year: 2024,
    entries: [
      { title, date, medal, score },
      { title, date, medal, score },
    ]
  }))
```

---

## Data Transformation Pipeline

### Step 1: Fetch Complete Student Record
```typescript
const student = await prisma.student.findUnique({
  where: { slug: slugOrId.toLowerCase() },
  include: {
    registrations: {
      where: {
        status: "VERIFIED",
        certificate: { isNot: null },  // Only verified achievements
        prizeAward: { isNot: null }    // Only prize winners
      },
      include: {
        certificate: true,
        prizeAward: { include: { prizeItem: true } },
        competitionCategory: {
          include: {
            competition: true,
            category: true,
          }
        },
        judgeAssignments: {
          include: {
            judge: {
              select: { name, tier, isVerified, bio }
            },
            score: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }
  }
})
```

### Step 2: Aggregate Scores
```typescript
function aggregateScores(judgeAssignments) {
  const scores = judgeAssignments
    .filter(ja => ja.score && ja.isSubmitted)
    .map(ja => ja.score.totalScore);
  
  return {
    averageScore: scores.length > 0 ? scores.reduce((a,b) => a+b) / scores.length : null,
    allScores: scores,
    judgeCount: scores.length,
    rubricAverage: {
      technique: avg(scores.map(s => s.criteria1)),
      expression: avg(scores.map(s => s.criteria2)),
      rhythm: avg(scores.map(s => s.criteria3)),
      originality: avg(scores.map(s => s.criteria4)),
    }
  }
}
```

### Step 3: Group by Category
```typescript
function groupByCategory(registrations) {
  return registrations.reduce((acc, reg) => {
    const catName = reg.competitionCategory.category.name;
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(reg);
    return acc;
  }, {})
}
```

### Step 4: Calculate Prize Breakdown
```typescript
function calculatePrizeBreakdown(registrations) {
  return registrations.reduce((acc, reg) => {
    const rank = reg.prizeAward?.rank; // FIRST_PLACE, SECOND_PLACE, etc.
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {})
}
```

---

## Visual Design Patterns (Industry Standards)

### Color & Contrast Strategy
Inspired by [UX Trust Design principles](https://gapsystudio.com/blog/ux-trust-design/), use color to establish hierarchy:

**Achievement Cards:**
- **Gold Medal** (🥇): Charcoal bg + Gold/Terracotta text (highest contrast, draws eye)
- **Silver Medal** (🥈): Charcoal bg + Silver/Gray text (secondary contrast)
- **Bronze Medal** (🥉): Charcoal bg + Bronze/Muted text (tertiary contrast)
- **Participation**: Charcoal bg + subtle border, muted text (lowest hierarchy)

**Trust Badges:**
- Green checkmark (✓) with white bg = verified Pratibha Parishad
- Badge size: consistent (24-32px) to avoid "badge spam" (max 2-3 per section)
- Tooltip: "Verified by Pratibha Parishad" on hover

**Score Display:**
- Large, bold typography: "98.0 / 100"
- Color gradient or thermometer effect for 0-100 scale
- Green (80+), Yellow (60-79), Orange (40-59), Red (<40)

### Typography & Readability
- **Stat Numbers**: Large (32-48px), bold weight, memorable
- **Achievement Titles**: 18-20px, semi-bold, high contrast
- **Secondary Text**: 14px, lighter weight, gray tone
- **Captions**: 12px, gray, secondary information
- **Dark Mode**: Use Charcoal (#1a1410) background with cream/white text for readability

### Interactive Elements
- **Sort/Filter Buttons**: Toggle between "Latest", "Best Score", "Best Rank"
- **Expand Details**: Click competition card to reveal judge names, rubric breakdown
- **Hover Effects**: Subtle shadow/border change on cards, not color flash
- **Mobile**: Touch-friendly tap targets (48px min), no hover-only content

### Animation & Micro-interactions
- **Entrance**: Stagger cards as page loads (Framer Motion with 50ms delay per card)
- **Medal Count**: Animate bars when element enters viewport (inspired by Bar Chart Race)
- **Score**: Count-up animation from 0 to final score (numbers feel earned, not static)
- **Expand/Collapse**: Smooth height transition for additional details
- **Share Button**: Pulse/highlight on first visit to encourage sharing

### Responsive Behavior
- **Desktop (1024px+)**: 
  - Hero section: 2-column (photo + stats)
  - Awards highlight: Full width with 3 featured cards side-by-side
  - Competition cards: 2 per row
  - Charts: Full width with interactive legend

- **Tablet (768px-1023px)**:
  - Hero section: Stacked (photo top, stats below)
  - Awards highlight: 1 card per row with full width
  - Competition cards: 1 per row
  - Charts: Stacked, simplified legend

- **Mobile (< 768px)**:
  - Hero section: Compact (smaller photo, horizontal stats)
  - Medal count: Vertical stack (no bar chart)
  - Cards: Full width, single column
  - Charts: Hidden or simplified (show numbers, not visualization)

---

## References & Resources

### Industry Platforms Analyzed
- **Behance** ([How to Prepare Your Behance Portfolio](https://cuberto.com/blog/how-prepare-your-design-portfolio-behance/)): Project showcase, case studies, achievement badges
- **Dribbble** ([Dribbble vs. Behance](https://www.elegantthemes.com/blog/design/why-its-important-to-showcase-your-web-design-projects-on-dribbble-and-behance)): High-fidelity visuals, community recognition
- **LinkedIn** ([Profile Optimization 2026](https://resumevera.com/blogs/linkedin-profile-optimization-guide-2026)): Ranking tiers, verified badges, credibility signals
- **Music Portfolio Platforms** ([Format Music Portfolio Guide](https://www.format.com/magazine/resources/photography/how-to-make-music-portfolio)): Achievement showcasing, verified credentials, testimonials

### Trust & Credibility
- [Certified Digital Badges Design](https://sertifier.com/blog/design-of-badges-clear-credible/)
- [Trust Signals for Conversions](https://lineardesign.com/blog/trust-signals/)
- [UX Trust Design Principles](https://gapsystudio.com/blog/ux-trust-design/)
- [Profile Page Design Best Practices](https://www.eleken.co/blog-posts/profile-page-design)

### Data Visualization
- [Shadcn UI Statistics Components](https://shadcnstore.com/blocks/marketing/statistics)
- [Ranking Data Visualization](https://chartexpo.com/blog/how-to-visualize-ranking-data)
- [Sports Achievement Timeline Patterns](https://flourish.studio/resources/sports/)
- [Collectible Achievements Pattern](https://ui-patterns.com/patterns/CollectibleAchievements)

### Portfolio Design
- [Student Portfolio Best Practices](https://www.educationworld.com/a_curr/best-practices-student-portfolios-assessment.shtml)
- [Edutopia Portfolio Assessment](https://www.edutopia.org/article/standards-based-portfolio-assessment/)
- [Webflow Student Portfolio Examples](https://webflow.com/blog/student-portfolio-examples)

---

## Implementation Priority

### Phase 1: Fix Zero-Display Bug (IMMEDIATE)
1. **Verify `student.isPublic = true`** in database for Shubham Das
2. **Test registration fetch query** with Shubham Das ID
3. **Check if certificates/prizeAwards exist** for those registrations
4. **Update stats calculation** if data exists

**Files to modify:**
- `src/app/profile/[id]/page.tsx` (debug fetchPublicStudent)
- Database check: `SELECT * FROM "Student" WHERE slug = 'shubham-das'`

### Phase 2: Display Enhancements (1-2 days)
1. Create `<AwardsHighlight />` component
2. Enhance `<CompetitionResultCard />` with:
   - Prize rank indicators (🥇/🥈/🥉)
   - Score display & rubric breakdown
   - Judge names/tiers (if public)
3. Add sorting/filtering to verified achievements section
4. Add category-wise performance summary

**Components to create:**
- `src/components/account/AwardsHighlight.tsx`
- `src/components/account/CompetitionResultCard.tsx`
- `src/components/account/CategoryPerformanceSummary.tsx`
- `src/components/account/ScoreRubricBreakdown.tsx`

**Update:**
- `src/components/account/StudentPublicProfile.tsx` (refactor)
- `src/app/profile/[id]/page.tsx` (enhance fetchPublicStudent)

### Phase 3: Timeline & Polish (Optional)
1. Achievement timeline view
2. Export achievements PDF/image
3. Shareable achievement cards
4. Social media optimizations (OG images with award count)

---

## Database Schema Validation

### Check Shubham Das Record
```sql
-- Verify student exists and is public
SELECT id, name, slug, isPublic, createdAt 
FROM "Student" 
WHERE slug = 'shubham-das' OR name = 'Shubham Das';

-- Count registrations
SELECT COUNT(*) as total_registrations,
       COUNT(CASE WHEN certificate_id IS NOT NULL THEN 1 END) as certified,
       COUNT(CASE WHEN prize_award_id IS NOT NULL THEN 1 END) as with_prize
FROM "Registration"
WHERE student_id = '<shubham-das-id>';

-- List all registrations with details
SELECT 
  r.id,
  r.final_rank,
  r.final_score,
  r.status,
  c.type as certificate_type,
  p.rank as prize_rank,
  cat.name as category_name,
  comp.title as competition_title
FROM "Registration" r
LEFT JOIN "Certificate" c ON r.id = c.registration_id
LEFT JOIN "PrizeAward" p ON r.id = p.registration_id
LEFT JOIN "CompetitionCategory" cc ON r.competition_category_id = cc.id
LEFT JOIN "Category" cat ON cc.category_id = cat.id
LEFT JOIN "Competition" comp ON cc.competition_id = comp.id
WHERE r.student_id = '<shubham-das-id>'
ORDER BY r.created_at DESC;
```

---

## Testing Checklist

### Functionality Tests
- [ ] Shubham Das profile page shows non-zero stats
- [ ] All 13 registrations display in verified achievements section
- [ ] Prize ranks (🥇🥈🥉) render correctly with medal icons
- [ ] Tier badge displays correctly (Gold Performer, etc.)
- [ ] Verification badge shows "✓ Verified by Pratibha Parishad"
- [ ] Score breakdown visible (Technique, Expression, Rhythm, Originality)
- [ ] Certificate download links work
- [ ] Award dispatch status shows correctly ("Dispatched on X" or "In preparation")
- [ ] Category grouping works (4 disciplines × multiple wins each)
- [ ] Sort/filter buttons work (Latest, Best Score, Best Rank)
- [ ] Award highlight shows top 3 featured competitions
- [ ] Performance metrics section (if included) renders charts correctly

### Design & UX Tests
- [ ] **Trust Signals**: Verification badges appear above the fold
- [ ] **Visual Hierarchy**: Medal counts are prominent, standout colors (Gold/Terracotta)
- [ ] **Contrast**: Gold medals vs Charcoal background have sufficient contrast (WCAG AA)
- [ ] **Curation**: Only showing best 5-10 achievements, not overwhelming
- [ ] **Stat Display**: Numbers are large (32px+), easy to scan quickly
- [ ] **Card Hierarchy**: Gold medals > Silver > Bronze visually distinguishable
- [ ] **Badge Clutter**: Max 2-3 badges per section (not "trust desperation")
- [ ] **Judge Names**: If displayed, judges marked as public or hidden correctly
- [ ] **Testimonial/Feedback**: Judge remarks/feedback displays nicely (if available)

### Responsive Tests
- [ ] Desktop (1024px+): 2-column hero, 3-card awards highlight
- [ ] Tablet (768px): Cards 1 per row, hero stacked
- [ ] Mobile (<768px): Single column, horizontal stat layout, hidden charts
- [ ] Touch targets: All interactive elements are 48px+ (WCAG AAA)
- [ ] Text sizing: Readable at mobile scale without pinch-zoom
- [ ] Medal icons: Scale appropriately, maintain clarity

### Performance Tests
- [ ] Page loads <2s (LCP) with image optimization
- [ ] Images: Student photos optimized, certificate thumbnails lazy-loaded
- [ ] Animations: Smooth on mobile (60fps, no jank on medal count animation)
- [ ] Database: Query optimization (batch judge assignments, not N+1)
- [ ] Bundle size: Profile component <50KB gzipped

### Dark Mode & Accessibility Tests
- [ ] Dark mode contrast: Charcoal bg, cream/white text readable
- [ ] Badge colors: Visible on dark background (not black medal on black bg)
- [ ] Emoji medals: Render correctly on Windows (fallback to text if needed)
- [ ] ARIA labels: All icons have aria-label or title attribute
- [ ] Keyboard navigation: Tab through profile sections, clickable elements
- [ ] Screen reader: Achievements read logically (not just medal emoji)
- [ ] Color contrast: All text passes WCAG AA (4.5:1 ratio for body text)

### Open Graph & Sharing Tests
- [ ] OG title: "[Student Name] - [Tier Badge] Performer"
- [ ] OG description: Includes award count ("7 Gold Medals, 4 Silver...")
- [ ] OG image: Social share preview shows student photo + tier badge
- [ ] Share button: Works for Twitter, LinkedIn, WhatsApp, copy link
- [ ] Shareable achievement cards: Individual competition achievements have copy link

### Browser/Platform Tests
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (iOS)
- [ ] Windows 11 (dark theme, light theme)
- [ ] Android (responsive design)

### Industry Best Practice Validation
- [ ] **Trust Design**: Verification signals in hero section (not footer)
- [ ] **Portfolio Curation**: Shows growth narrative (not just list)
- [ ] **Achievement Context**: Each achievement has competition name, judge info, certificate
- [ ] **Reflection**: (Optional) Brief note on what student learned (portfolio best practice)
- [ ] **Tier System**: Clear path to next tier visible in hero
- [ ] **Data Storytelling**: Narrative flows (medals > categories > timeline)
- [ ] **Social Proof**: Judge attribution, certificate proof, external validation

---

## Component Implementation Guide

### A. AwardsHighlight Component (NEW)
**Purpose:** Eye-catching hero section showing medal count and top achievements

**Props Interface:**
```tsx
interface AwardsHighlightProps {
  medalCount: { gold: number; silver: number; bronze: number };
  highestScore: { value: number; category: string; competition: string };
  featuredAchievements: CompetitionResult[];  // Top 3
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}
```

**Visual Elements:**
- Medal count with bar chart animation (Framer Motion on mount)
- "Highest Achievement" callout card with score highlight
- 3 featured achievement cards with auto-select (or student choice)
- Mobile: Vertical stack, hide bar chart, show medal emoji + numbers

**Color Strategy:**
- Gold medals: bg-terracotta/10 border-terracotta text-gold
- Silver medals: bg-white/10 border-white/30 text-gray-300
- Bronze medals: bg-gray/10 border-gray/20 text-gray-400

---

### B. CompetitionResultCard Component (Enhanced)
**Purpose:** Rich card displaying single competition achievement with full context

**Props Interface:**
```tsx
interface CompetitionResultCardProps {
  competition: CompetitionResult;
  showRubric?: boolean;  // Default: false, expand on click
  showJudges?: boolean;  // Default: true if judges marked public
  isExpanded?: boolean;  // Controlled via parent
  onToggleExpand?: () => void;
}
```

**Card Sections:**
1. **Header** (always visible):
   - Medal icon (🥇/🥈/🥉) + large score (98.0)
   - Competition title + date
   - Category + age group

2. **Body** (always visible):
   - Final score + "Verified by Pratibha Parishad" badge
   - Judge count: "Judged by 2 judges"
   - Certificate type: "Merit Certificate"
   - Award dispatch status: "Dispatched on May 15, 2025"

3. **Expandable Details** (on click):
   - Rubric breakdown: Technique (35/40), Expression (28/30), Rhythm (29/30)
   - Individual judge info: "[Judge Name] (Gold Tier) — 94 points"
   - Judge feedback/remarks (if available)
   - Certificate preview + download link
   - Award item description (if applicable)

**Mobile Behavior:**
- Cards full-width, single column
- Score moved below title (no side-by-side)
- Expand button always visible for details
- Rubric shown as vertical bar chart instead of horizontal

---

### C. CategoryPerformanceSummary Component (NEW)
**Purpose:** Grid showing expertise across disciplines

**Props Interface:**
```tsx
interface CategoryPerformanceSummaryProps {
  categories: CategorySummary[];
  sortBy?: 'wins' | 'score' | 'recency';
}
```

**Card Layout:**
- Category icon (with tooltip on hover)
- Category name + win rate: "Drawing: 4 wins (80%)"
- Win breakdown: 2x🥇 + 1x🥈 + 1x🥉
- Avg score: "92.3/100"
- CTA: "View all [X] registrations"
- Click to expand: Show all competitions in category

**Sorting UX:**
- Tab buttons at top: "By Wins | By Score | By Recency"
- Selected tab highlighted in Gold/Terracotta
- Instant sort without reload

---

### D. TierBadge Component (NEW)
**Purpose:** Small, compact tier indicator for hero section

**Props Interface:**
```tsx
interface TierBadgeProps {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  showLabel?: boolean;  // Default: true on desktop, false on mobile
  pointsToNext?: number;  // Optional: "5 points to Gold"
}
```

**Visual Design:**
- Icon: 🏆 with metal color background
- Label: "Gold Performer" (on desktop), hidden on mobile
- Tooltip: Shows tier calculation + path to next tier
- Size: 48px icon on desktop, 32px on mobile

**Colors:**
- Bronze: bg-amber-900 icon-gold
- Silver: bg-gray-600 icon-white
- Gold: bg-yellow-600 icon-gold
- Platinum: bg-purple-600 icon-gold

---

### E. VerificationBadge Component (Enhancement)
**Purpose:** Trust signal showing Pratibha Parishad verified status

**Variants:**
1. **Inline** (next to achievement title): "✓ Verified by Pratibha Parishad"
2. **Badge** (compact): Green checkmark on badge, hover for tooltip
3. **Ribbon** (prominent): Ribbon on top-right of card

**Implementation:**
- Green checkmark color: #10b981 (Emerald)
- White background for contrast
- Size: 20-24px icon
- Tooltip: "Verified by Pratibha Parishad on [date]"

---

## Files to Modify/Create

### Modify
- `src/app/profile/[id]/page.tsx` — Enhanced fetchPublicStudent, add aggregation logic, tier calculation
- `src/components/account/StudentPublicProfile.tsx` — Refactor layout, add new sections in order

### Create
- `src/components/account/AwardsHighlight.tsx` — Prize breakdown, top achievements, animated bars
- `src/components/account/CompetitionResultCard.tsx` — Enhanced competition display with expand
- `src/components/account/CategoryPerformanceSummary.tsx` — Category-wise stats with sorting
- `src/components/account/ScoreRubricBreakdown.tsx` — Judge score visualization (part of expand)
- `src/components/account/TierBadge.tsx` — Tier indicator with path to next tier
- `src/components/account/VerificationBadge.tsx` — Checkmark badge for verified achievements
- `src/components/achievement/AchievementTimeline.tsx` — Year-grouped chronological view
- `src/lib/student-profile-utils.ts` — Aggregation & transformation functions
  - `calculateTier(medals, scores, competitions)`
  - `aggregateScores(judgeAssignments)`
  - `groupByCategory(registrations)`
  - `calculatePrizeBreakdown(registrations)`
  - `groupByYear(registrations)`
  - `getTopAchievements(registrations, limit = 3)`

---

## Portfolio Curation Strategy (Student-Controlled)

Based on [student portfolio best practices](https://www.educationworld.com/a_curr/best-practices-student-portfolios-assessment.shtml), students should have autonomy in what they showcase. Implement in Phase 3+:

### Student Choice Features
- **Featured Achievements**: Student selects top 3 achievements to pin to awards section
- **Hidden Competitions**: Option to hide specific registrations from profile (e.g., participations without prizes)
- **Achievement Notes**: Student can add 1-2 sentence reflection on each achievement ("What I learned", "Growth from this")
- **Category Visibility**: Toggle category sections on/off (e.g., show only "Singing", hide "Drawing")

### Dashboard for Student Control
Location: `/student/profile/edit` — Simple settings panel:
```
Featured Achievements (choose 3):
  ☑ Bischo Kobi 2025 (Singing) — 98 points
  ☑ Youth Fest 2024 (Singing) — 95 points
  ☑ State Competition 2024 (Drawing) — 88 points

Achievement Visibility:
  Category: Singing [Show] [Hide] [Notes]
  Category: Drawing [Show] [Hide]

Hidden Competitions:
  • State Fest 2023 (Participation) — [Restore]
```

### Psychology & Engagement
- **Narrative Control**: Student curates their own "achievement story"
- **Reflection Practice**: Asking students to reflect deepens learning (portfolio pedagogy)
- **Aspirational Framing**: Highlighting best work motivates continued improvement
- **Trust**: Visible curation signals thoughtful self-presentation (better than overwhelming list)

---

## Notes

1. **Why Current Profile Shows Zero:**
   - Most likely: `student.isPublic = false` in DB
   - Or: Registrations exist but don't have `certificate` or `prizeAward` records
   - Or: `status != VERIFIED` or `paymentStatus != SUCCESS`

2. **Shubham Das Data Integrity:**
   - 13 registrations created ✅
   - Verify: All have `status = "VERIFIED"` ✅
   - Verify: All have `paymentStatus = "SUCCESS"` ✅
   - Verify: All have `Certificate` records ✅
   - Verify: All have `PrizeAward` records ✅

3. **Score Calculation:**
   - `finalScore` on Registration is the averaged judge score
   - If NULL: Use average of `JudgeAssignment.score.totalScore`
   - Rubric breakdown available from individual judge assignments

4. **Performance Considerations:**
   - Fetching 13+ registrations with nested judge assignments = 26+ queries
   - Consider: Prisma `include` optimization or batch query
   - Solution: Aggregate in application layer (current approach is fine)

5. **Industry Alignment Summary:**
   - ✅ Trust signals: Verification badges placed prominently (LinkedIn pattern)
   - ✅ Tier/ranking system: Bronze/Silver/Gold badges motivate achievement (LinkedIn pattern)
   - ✅ Curation over completeness: Show best 5-10 achievements (Behance pattern)
   - ✅ Data storytelling: Narrative flows from medals → categories → timeline (portfolio best practice)
   - ✅ Credibility signals: Judge attribution, certificates, award proof (music portfolio pattern)
   - ✅ Student autonomy: Featured achievement selection, reflection prompts (portfolio pedagogy)

---

## References

- Current Profile: `src/app/profile/[id]/page.tsx`
- Current Component: `src/components/account/StudentPublicProfile.tsx`
- Prisma Schema: `prisma/schema.prisma` (lines 221-270 for Student, 349-380 for Registration)
- Related: `/student/` profile pages may need updates too


# Homepage Registration Flow Improvement Plan

**Status:** Planning  
**Created:** 2026-05-28  
**Priority:** High (Launch Blocker)  
**Owner:** Product Team

---

## Executive Summary

The current homepage makes it **difficult for new parents to discover and initiate registration**. Industry best practices (analyzed from 2025 SaaS and education app standards) indicate that registration CTAs must be primary, clearly labeled, and visually distinct. This plan outlines changes to align Pratibha Parishad with proven conversion patterns.

---

## Current State Analysis

### Homepage Structure
1. **Hero Section**
   - Main CTA: "Explore Competitions" → `/competitions`
   - Secondary CTA: "Access Student Portal" → `/login` ❌
   
2. **"How Participation Works" Section**
   - Step 1: Upload to Facebook (assumes account exists)
   - Step 2: Register & Pay (no link to registration)
   - Step 3: Review & Certify
   - **Issue:** Registration is missing from the flow

3. **Strategic Features Grid**
   - Focuses on platform capabilities, not onboarding

### Problems Identified
| Problem | Impact | Severity |
|---------|--------|----------|
| No "Register" button on hero | New parents must search for signup | High |
| "Access Student Portal" is misleading | Users click login but need to register first | High |
| Registration step missing from flow | Parents don't understand the starting point | High |
| No trust signals near CTAs | Reduces conversion confidence | Medium |
| No mobile-optimized CTA placement | 79% of traffic is mobile | High |

---

## Industry Best Practices Reference

### 1. CTA Placement & Hierarchy
**Source:** [10 SaaS Website Best Practices 2025](https://www.webstacks.com/blog/saas-website-best-practices), [Login & Signup UX Guide 2025](https://www.authgear.com/post/login-signup-ux-guide/)

- ✅ Signup button should be PRIMARY on homepage for new users
- ✅ Both Sign Up and Log In buttons visible in sticky header (top-right)
- ✅ Use contrasting colors and sizes for visual differentiation
- ✅ Button labels must be distinct: pair "Sign Up" with "Log In" (not "Access Portal")

### 2. CTA Copy & Language
**Source:** [SaaS CTA Conversion Rates Guide](https://www.kalungi.com/blog/conversion-rates-for-saas-companies), [21 SaaS Call-to-Action Examples](https://www.rockethub.com/call-to-action-examples-for-saas)

- ✅ Use **benefit-focused, action-driven language**
  - ❌ Avoid: "Access Student Portal"
  - ✅ Better: "Create Parent Account", "Register Now - It's Free"
  
- ✅ Remove objections in CTA + supporting text
  - Example: "Create Account - No Credit Card Needed"

### 3. Parent Portal Onboarding
**Source:** [Parental Engagement Software Best Practices](https://www.theaccessgroup.com/en-gb/education/software/parent-engagement/), [School Management Software 2026](https://www.getapp.com/education-childcare-software/school-management/f/parent-portal/)

- ✅ Structured registration with **clear 3-4 step flow**
- ✅ Onboarding guidance explaining what happens AFTER signup
- ✅ Mobile-first design (79% of education app users on mobile)
- ✅ In-app help center for post-registration questions

### 4. Trust Signals & Conversion
**Source:** [SaaS CTA Strategies & Testing](https://mouseflow.com/blog/ctas-for-saas/)

- ✅ Personalized CTAs convert **202% better** than generic ones
- ✅ Add testimonials, parent counts, or security badges near CTAs
- ✅ Show social proof: "Join 5000+ parents", "₹XXX in prizes awarded"

---

## Proposed Changes

### Phase 1: Hero Section Redesign (Priority 1 - Critical)

**Current State:**
```
┌─────────────────────────────────────┐
│ Where Indian Heritage Meets Digital  │
│        Digital Recognition          │
│                                     │
│ [Explore Competitions] [Access...]  │
└─────────────────────────────────────┘
```

**Proposed State:**
```
┌─────────────────────────────────────┐
│ Where Indian Heritage Meets Digital  │
│        Digital Recognition          │
│                                     │
│ [Create Parent Account →] (Primary) │
│ [Explore Competitions] (Secondary)  │
│                                     │
│ Already have an account? [Log In]   │
└─────────────────────────────────────┘
```

**Changes:**
1. ✅ Replace "Access Student Portal" with "Create Parent Account"
2. ✅ Make "Create Parent Account" the primary CTA (terracotta background)
3. ✅ Keep "Explore Competitions" as secondary (bordered style)
4. ✅ Add "Already have an account? Log In" as tertiary text link
5. ✅ Rebalance grid to center the hero (remove MVP card which was removed)

**Implementation Details:**
- Button text: "Create Parent Account →"
- Target: `/register`
- Color: `bg-terracotta hover:bg-terracotta-light` (primary brand color)
- Aria label: "Create a parent account and register your child for competitions"

---

### Phase 2: "How Participation Works" Redesign (Priority 1 - Critical)

**Current State (3 steps, registration missing):**
1. Upload to Facebook
2. Register & Pay (no link)
3. Review & Certify

**Proposed State (4 steps, clear flow):**
1. **Create Parent Account** (2 minutes)
   - Description: "Sign up with email, add your address for medal shipping"
   - CTA: "Start Registration →" links to `/register`
   
2. **Add Your Child & Category** (5 minutes)
   - Description: "Enter your child's name, age, and select the competition category (Singing, Dance, etc.)"
   - Shown inside dashboard (no link needed)
   
3. **Submit Video & Pay** (3 minutes)
   - Description: "Upload your child's performance video from Facebook and complete ₹50 entry fee"
   - Shown inside dashboard
   
4. **Get QR Certificate** (Instant after results)
   - Description: "Receive verified digital certificate with unique QR code on WhatsApp"
   - Icon/visual showing certificate

**Design Changes:**
- Add icons/step numbers (1, 2, 3, 4) instead of just text
- Step 1 should be clickable → `/register`
- Add time estimates per step (builds confidence)
- Highlight Step 1 as "New parents start here"

---

### Phase 3: Trust Signals & Social Proof (Priority 2 - High)

**Add near primary CTA or below hero:**

```
✅ Join 5,000+ Parents
✅ ₹500K+ in Prizes Awarded
✅ 100% Secure with Razorpay
✅ Instant QR-Verified Certificates

"5-star parent feedback: 'Best way to get my child's talent recognized!' 
- Anika P., West Bengal"
```

**Implementation:**
- Add stats counter component above the fold
- Add 1-2 parent testimonials in a carousel
- Add security badge for Razorpay
- Show recent winners/achievements

---

### Phase 4: Sticky Navigation Bar (Priority 2 - High)

**Add persistent header with:**
```
[Pratibha Parishad Logo] | [Competitions] [About] [Contact]
                                          [Log In] [Register] (sticky, top-right)
```

**Design:**
- Register button: Primary color, always visible
- Log In: Text link or secondary button
- Visible on mobile (below nav or in hamburger menu)
- Sticky behavior: stays at top when scrolling

---

### Phase 5: Mobile Optimization (Priority 2 - High)

**Mobile-specific changes:**

1. **Hero buttons** — stack vertically on mobile, prioritize "Create Account"
2. **CTA positioning** — keep in thumb-reach zone (bottom 1/3 of screen for mobile)
3. **Font sizes** — increase button text to minimum 16px (prevents zoom on iOS)
4. **Touch targets** — ensure buttons are at least 48x48px
5. **Steps section** — use card layout instead of 3-column grid on mobile

---

## Implementation Roadmap

| Phase | Changes | Timeline | Files |
|-------|---------|----------|-------|
| **1** | Hero section buttons | Day 1 | `src/app/page.tsx` |
| **2** | How Participation Works (4 steps) | Day 1 | `src/app/page.tsx` |
| **3** | Trust signals & testimonials | Day 2 | `src/app/page.tsx`, new component |
| **4** | Sticky nav with Register CTA | Day 2 | `src/components/Header.tsx` |
| **5** | Mobile optimization | Day 2 | CSS/responsive classes |
| **6** | Testing & refinement | Day 3 | Manual QA on mobile/desktop |

---

## Success Metrics

### Primary KPIs
- **Registration click-through rate** — track clicks on "Create Parent Account" button
- **Registration page landing rate** — % of homepage visitors reaching `/register`
- **Registration completion rate** — % of visitors who complete account creation
- **Time to register** — average time from homepage → account created

### Secondary KPIs
- **Mobile conversion rate** — track mobile vs desktop registration starts
- **Bounce rate** — reduce homepage bounces with clearer CTAs
- **Hero CTA click rate** — measure which button gets more clicks
- **Trust signal impact** — A/B test with/without social proof

### Target Goals
- 📈 Increase registration page visits by **40%** (from clearer CTA)
- 📈 Improve registration completion by **15%** (from clearer flow)
- 📈 Reduce mobile friction (ensure 50%+ of registrations from mobile)

---

## Visual Examples (Reference)

### Similar Patterns in Industry

**Udemy (Education Platform):**
- Primary CTA: "Sign Up" (in hero)
- Secondary CTA: "Explore" (courses)
- Flow shows registration as first step

**Masterclass (Learning Platform):**
- Hero: "Try It Free" (primary) + "Explore Classes" (secondary)
- "How It Works" section clearly shows signup first
- Trust signals: "2M+ Members Worldwide"

**Byjus (EdTech - Asia):**
- Primary: "Start Free Trial"
- Secondary: "Explore Courses"
- Multi-step flow with estimated time per step

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Existing users click "Create Account" instead of "Log In" | Friction for returning users | Add "Already have an account? Log In" link clearly |
| Mobile layout breaks with new CTA buttons | Poor mobile UX | Test thoroughly on iOS 12+, Android 8+; use responsive grid |
| Registration page load time increases | Higher bounce | Monitor load time; lazy-load testimonials |
| A/B test confuses message clarity | Testing takes longer | Implement feature flag to control which variant is shown |

---

## Approval & Next Steps

**Stakeholders:**
- [ ] Product Manager — approve priority & timeline
- [ ] Design Lead — review visual changes
- [ ] Engineering Lead — estimate implementation effort
- [ ] QA Lead — create test plan for registration flow

**Next Actions:**
1. Review and approve this plan (Day 1)
2. Create Figma mockups of hero section changes
3. Update `src/app/page.tsx` with new CTAs and 4-step flow
4. Add trust signals component
5. Update sticky Header with Register button
6. Mobile testing on 3+ devices
7. Deploy and monitor KPIs

---

## Appendix: Research Sources

### Best Practices Sources
1. [10 SaaS Website Best Practices to Follow in 2025](https://www.webstacks.com/blog/saas-website-best-practices)
2. [Login & Signup UX: The 2025 Guide to Best Practices](https://www.authgear.com/post/login-signup-ux-guide/)
3. [Call-to-action: How to drive B2B SaaS conversion rates](https://www.kalungi.com/blog/conversion-rates-for-saas-companies)
4. [SaaS CTA Strategies: Tips, Examples, and Testing](https://mouseflow.com/blog/ctas-for-saas/)
5. [Parental Engagement Software Best Practices](https://www.theaccessgroup.com/en-gb/education/software/parent-engagement/)
6. [Best School Management Software with Parent Portal 2026](https://www.getapp.com/education-childcare-software/school-management/f/parent-portal/)

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-28  
**Review Cycle:** Every 2 weeks after launch

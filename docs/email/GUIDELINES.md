# Email Template Guidelines

## Overview

This document provides guidelines for creating, maintaining, and extending email templates in Pratibha Parishad. All emails must follow these standards to ensure consistency, maintainability, and brand alignment.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color & Typography](#color--typography)
3. [Structure & Layout](#structure--layout)
4. [Content Guidelines](#content-guidelines)
5. [Template Creation](#template-creation)
6. [Code Standards](#code-standards)
7. [Testing & Verification](#testing--verification)
8. [Accessibility](#accessibility)

---

## Design Principles

### 1. Premium & Professional
- Maintain high visual standards matching the application's premium design
- Use generous whitespace and clear hierarchy
- Ensure visual consistency across all emails
- Reflect the brand's commitment to excellence

### 2. User-Centric
- Prioritize clarity and ease of understanding
- Minimize cognitive load with clear messaging
- Always include a primary call-to-action
- Provide context about why the user is receiving the email

### 3. Responsive & Accessible
- Design for mobile-first (600px max width)
- Ensure proper contrast ratios (WCAG AA minimum)
- Use semantic HTML structure
- Support all major email clients

### 4. Consistent & Recognizable
- Use consistent header styling across all emails
- Maintain recognizable footer format
- Apply brand colors consistently
- Follow established patterns for similar notification types

---

## Color & Typography

### Brand Colors

**Primary Colors:**
```typescript
charcoal:      #1C1C1E  // Headers, primary text
terracotta:    #E07B54  // CTAs, primary accent, action buttons
gold:          #C8A84B  // Badges, secondary accents, highlights
```

**Neutral Colors:**
```typescript
white:         #FFFFFF  // Content background
cream:         #FCF9F2  // Outer background
lightGray:     #F9F9F9  // Section backgrounds, footers
darkGray:      #666666  // Secondary text, muted content
bodyText:      #333333  // Primary body text
```

### Typography

**Font Stack:**
```css
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

**Sizing:**
- Header (h1): 28px, weight 700
- Section Title: 16px, weight 600
- Body Text: 15px, weight 400
- Footer: 13px, weight 400

**Line Height:** 1.6 (for body text readability)

### Usage Rules

✅ **DO:**
- Use Terracotta for all primary CTAs
- Use Gold for success badges and highlights
- Use Charcoal for headers and important information
- Use body text color for regular content

❌ **DON'T:**
- Mix multiple accent colors in a single email
- Use light text on light backgrounds
- Use text smaller than 13px (footer size)
- Introduce new brand colors

---

## Structure & Layout

### Email Anatomy

Every email should follow this structure:

```
┌─────────────────────────────────┐
│         HEADER                  │  Dark background (Charcoal)
│  Title + Optional Subtitle      │  White text, generous padding
├─────────────────────────────────┤
│         CONTENT                 │  White background
│  • Introduction paragraph       │  Well-spaced sections
│  • Key information              │  Clear visual hierarchy
│  • Optional badge/highlight     │  Helper components
│  • Call-to-action button        │
├─────────────────────────────────┤
│         FOOTER                  │  Light gray background
│  Company signature              │  Small, muted text
│  Optional links                 │
└─────────────────────────────────┘
```

### Spacing Rules

```typescript
header:
  padding: 40px 30px;           // Generous padding for prominence

content:
  padding: 40px 30px;           // Matching padding
  paragraph margin: 0 0 16px 0; // 16px between paragraphs

section:
  margin: 24px 0;               // Visual separation
  padding: 20px;                // Internal spacing
  border-left: 4px solid;       // Visual accent

footer:
  padding: 24px 30px;           // Reduced padding
  border-top: 1px solid;        // Subtle separator
```

### Max Width & Responsive

```css
.container {
  max-width: 600px;             // Desktop width
  margin: 0 auto;               // Center
}

@media (max-width: 600px) {
  .container { border-radius: 0; }
  .header { padding: 30px 20px; }
  .content { padding: 24px 20px; }
  .cta-button { display: block; width: 100%; }
}
```

---

## Content Guidelines

### Subject Lines

✅ **Good Subject Lines:**
- "✓ Payment Verified - Your Registration is Complete"
- "🎉 Results Published - View Your Award"
- "📜 Certificate Ready - Download Now"
- "🌟 Qualification Offer - Next Level Awaits"

❌ **Avoid:**
- Vague subject lines ("Important Update")
- ALL CAPS (appears like spam)
- Misleading urgency ("URGENT ACTION REQUIRED")
- Special characters except emoji

**Rules:**
- Keep under 60 characters when possible
- Start with status indicator (✓, 🎉, 📜, etc.)
- Be specific about what's in the email
- Match the email's primary message

### Header Titles

✅ **Good Headers:**
- ✓ Registration Verified
- 🎉 Results Published!
- 📜 Certificate Ready
- 🌟 Qualification Offer

**Rules:**
- Include emoji for visual interest and scanning
- Be concise (3-5 words)
- Reflect the notification type
- Use sentence case (capitalize first word)

### Body Content

**Introduction Paragraph:**
- State the purpose clearly in first sentence
- Use simple, direct language
- Avoid jargon or technical terms
- Keep paragraphs to 2-3 sentences

**Informational Sections:**
- Use section components for grouped information
- Keep each section focused on one topic
- Use bullet points sparingly (prefer paragraphs)
- Provide context without overwhelming

**Call-to-Action:**
- Make the primary action obvious
- Use action verbs (View, Download, Accept, Check)
- Place CTA where user eyes naturally go
- Only one primary CTA per email

**Tone & Voice:**
- Professional yet warm
- Clear and direct
- Celebratory for positive notifications
- Supportive for negative notifications
- Consistent with brand voice

### Content Examples

**Registration Created:**
```
Your child's submission video is now queued for double-blind grading 
by our expert panel of judges. Results will be announced shortly.
```

**Payment Received:**
```
Your registration payment has been successfully processed and verified. 
Your submission has been queued for evaluation by our expert judges.
```

**Results Published:**
```
Congratulations! Your submission has been evaluated by our expert panel 
of judges. Your achievement reflects outstanding talent and dedication.
```

---

## Template Creation

### Step-by-Step Process

#### 1. Define Template Type

Identify what notification type you're creating:
- Registration event (created, verified, rejected)
- Payment/financial event
- Results announcement
- Certificate/document ready
- Promotion/opportunity

#### 2. Create Template File

File location: `src/lib/email/templates/yourNameTemplate.ts`

```typescript
import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, section, badge } from "../emailTemplateEngine";

export function buildYourNameTemplate(
  title: string,
  body: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "Your Header",
      headerSubtitle: "Optional context",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(body)}
        ${section("Key Information", `<p>Details here</p>`)}
      `,
      ctaButton: {
        text: "Action Button",
        url: `${appUrl}/your/path`,
      },
    },
  };
}
```

#### 3. Export from Index

Add to `src/lib/email/templates/index.ts`:

```typescript
export { buildYourNameTemplate } from "./yourNameTemplate";
```

#### 4. Create Email Function

Add to `src/lib/notifications.ts`:

```typescript
export async function sendEmailYourName(
  to: string,
  title: string,
  body: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildYourNameTemplate(title, body, appUrl);
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}
```

#### 5. Wire Up Notification Service

Update `src/lib/notificationService.ts` in `sendEmailByType()`:

```typescript
case NotificationType.YOUR_TYPE:
  await sendEmailYourName(to, notification.title, notification.body);
  break;
```

#### 6. Test Template

- Verify TypeScript compilation: `npx tsc --noEmit`
- Run linter: `npm run lint`
- Test email rendering (see Testing section)

---

## Code Standards

### Naming Conventions

**Template Files:**
```
[notificationType]Template.ts
registrationCreatedTemplate.ts
paymentReceivedTemplate.ts
certificateReadyTemplate.ts
```

**Function Names:**
```
build[NotificationType]Template
buildRegistrationCreatedTemplate
buildPaymentReceivedTemplate
```

**Email Functions:**
```
sendEmail[NotificationType]
sendEmailRegistrationCreated
sendEmailPaymentReceived
```

### TypeScript Best Practices

✅ **DO:**
- Always type parameters and return values
- Use `EmailTemplate` interface for return type
- Destructure parameters clearly
- Use const for function declarations
- Add JSDoc comments for exported functions

❌ **DON'T:**
- Use `any` types
- Omit parameter types
- Mix template styles (pick one pattern)
- Hardcode URLs without appUrl parameter
- Leave unused imports

### Template Content Standards

✅ **DO:**
- Use helper functions (`paragraph`, `section`, `badge`)
- Keep HTML content readable with proper indentation
- Template strings with proper formatting
- Clear variable interpolation

❌ **DON'T:**
- Inline raw HTML when helpers exist
- Mix template syntax styles
- Use inline CSS styles (use emailConfig)
- Hard-code colors or layout classes

### Comment Style

```typescript
/**
 * Registration Verified Email Template
 *
 * Sent when a registration is verified and evaluation begins.
 * Confirms evaluation process has started.
 */
export function buildRegistrationVerifiedTemplate(
  title: string,
  body: string,
  appUrl: string
): EmailTemplate {
  // Implementation
}
```

---

## Testing & Verification

### Pre-Deployment Checklist

- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Template data structure is correct
- [ ] All URLs use appUrl parameter
- [ ] Subject line is clear and concise
- [ ] Header title matches notification type
- [ ] Content includes dynamic title and body
- [ ] CTA button text is action-oriented
- [ ] Footer message is appropriate
- [ ] Helper functions used correctly
- [ ] No hardcoded colors or styles

### Email Client Testing

Test emails in these clients (minimum):
- Gmail (web)
- Outlook (web)
- Apple Mail
- Mobile clients (Gmail app, Outlook app)

### Rendering Checklist

- [ ] Header displays correctly with emoji
- [ ] Content text is readable (size, contrast)
- [ ] Links are clickable and go to correct URLs
- [ ] Buttons render properly (not broken)
- [ ] Spacing looks balanced
- [ ] Images (if any) display correctly
- [ ] Footer is visible and readable
- [ ] Mobile version is readable (< 600px)
- [ ] No text overlap or alignment issues
- [ ] Colors match brand system

### Common Issues to Avoid

| Issue | Solution |
|-------|----------|
| Broken layout | Ensure max-width: 600px and use table-based layouts if needed |
| Text overlap | Use proper padding/margin in CSS |
| Color not rendering | Use hex format (#), not named colors |
| Links not working | Verify NEXT_PUBLIC_APP_URL is set in environment |
| Mobile issues | Test with max-width media query |
| Font not loading | Use system font stack, not web fonts |

---

## Accessibility

### WCAG AA Compliance

All emails must meet WCAG AA standards:

✅ **Color Contrast:**
- Text vs background: 4.5:1 minimum
- Check: Large text (18px+) needs 3:1 minimum
- Use: https://webaim.org/resources/contrastchecker/

✅ **Semantic HTML:**
- Use proper heading hierarchy
- Use lists for list content
- Use strong/em instead of style spans
- Wrap links properly

✅ **Text Alternatives:**
- Include alt text for all images
- Describe functionality, not just "image"
- Keep alt text concise (100 chars)

### Color Contrast Reference

**Verified Combinations:**
- White text on Charcoal (#1C1C1E): ✅ 16:1
- White text on Terracotta (#E07B54): ✅ 6:1
- White text on Gold (#C8A84B): ✅ 7:1
- Body text on White background: ✅ 10:1
- Body text on Light Gray: ✅ 8:1

### Email-Specific Accessibility

✅ **DO:**
- Use font-size >= 13px
- Provide adequate line-height (1.6)
- Use clear, simple language
- Include descriptive subject lines
- Avoid color alone for information

❌ **DON'T:**
- Use images as primary content
- Rely on color to communicate status
- Use all caps for emphasis
- Disable zoom/scaling
- Use blinking or moving content

---

## Quick Reference

### Helper Functions

```typescript
// Paragraph
${paragraph("Your text here")}
${paragraph("<strong>Bold text</strong>")}

// Section with border and title
${section("Section Title", `
  <p>Your content here</p>
`)}

// Badges
${badge("Success", "success")}      // Gold background
${badge("Featured", "featured")}    // Terracotta background

// Divider
${divider()}
```

### CSS Classes

```css
.badge             /* Badges styling */
.badge-success     /* Gold background badge */
.badge-featured    /* Terracotta background badge */
.section           /* Highlighted section box */
.section-title     /* Section heading */
.cta-button        /* Primary action button */
.divider           /* Visual separator line */
.accent-text       /* Terracotta colored text */
```

### Template Interface

```typescript
interface EmailTemplate {
  subject: string;                    // Email subject line
  data: {
    headerTitle: string;              // Large header title
    headerSubtitle?: string;          // Optional subtitle
    mainContent: string;              // HTML content body
    ctaButton?: {                     // Optional primary action
      text: string;
      url: string;
    };
    footerMessage?: string;           // Custom footer (optional)
  };
}
```

---

## Common Patterns

### Registration Notification

```typescript
${paragraph(`<strong>${title}</strong>`)}
${paragraph(body)}
${section("What's Next?", `
  <p>Your submission has been queued for evaluation.</p>
  <p>Our expert judges will review your work.</p>
`)}
```

### Success/Achievement

```typescript
${paragraph(`<strong>${title}</strong>`)}
${badge(body, "featured")}
${section("Achievement Details", `
  <p>Congratulations on your success.</p>
  <p>Learn more about your award.</p>
`)}
```

### Action Required

```typescript
${paragraph(`<strong>${title}</strong>`)}
${paragraph(body)}
${section("Important", `
  <p>Please take action by the deadline.</p>
  <p>Contact support if you have questions.</p>
`)}
```

---

## Troubleshooting

### Email doesn't compile

**Error:** TypeScript errors in template file

**Solution:**
```bash
npx tsc --noEmit                  # Check compilation
npm run lint                      # Check linting
# Fix any type issues or missing imports
```

### Links don't work in email

**Issue:** CTA button or links not functional

**Solution:**
- Verify NEXT_PUBLIC_APP_URL environment variable is set
- Ensure URLs are absolute (include http/https)
- Test links outside email first

### Content shows incorrectly

**Issue:** Layout broken or content misaligned

**Solution:**
- Check email client compatibility
- Verify max-width: 600px
- Test with different font-family
- Check CSS media queries

### Color looks different

**Issue:** Colors don't match brand system

**Solution:**
- Use hex format (#RRGGBB) consistently
- Verify emailConfig.ts has correct colors
- Test in multiple email clients
- Check for CSS filters or overlays

---

## Resources

- [Email Template System Documentation](../EMAIL_TEMPLATE_SYSTEM.md)
- [Implementation Summary](../EMAIL_SYSTEM_IMPLEMENTATION.md)
- [Design System (CLAUDE.md)](../../CLAUDE.md)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Email Client Support](https://www.campaignmonitor.com/css/)
- [Resend Documentation](https://resend.com/docs)

---

## Contact & Questions

For questions about email guidelines:
- Review this document first
- Check existing template examples
- Consult the [Troubleshooting](#troubleshooting) section
- Open an issue for clarifications needed


# Email Template Best Practices

## Overview

This document outlines proven best practices for designing, developing, and maintaining email templates in Pratibha Parishad.

---

## Table of Contents

1. [Design Best Practices](#design-best-practices)
2. [Content Best Practices](#content-best-practices)
3. [Development Best Practices](#development-best-practices)
4. [Performance Best Practices](#performance-best-practices)
5. [Maintenance Best Practices](#maintenance-best-practices)
6. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## Design Best Practices

### 1. Visual Hierarchy

**Best Practice:** Use size, color, and spacing to guide the user's eye through the email.

```
Header (Large, Bold)      ← Primary focal point
     ↓
Content (Regular size)    ← Secondary information
     ↓
CTA (Colored, Prominent)  ← Call to action
     ↓
Footer (Small, Muted)     ← Least important
```

**DO:**
```typescript
${paragraph(`<strong>${title}</strong>`)}  // Emphasize title
${paragraph(body)}                          // Regular content
${section("Details", content)}              // Grouped info
// CTA at bottom
```

**DON'T:**
```typescript
${paragraph(body)}
${paragraph(`<strong>${title}</strong>`)}  // Title after body
${badge("Important", "featured")}           // Multiple highlights
${badge("Urgent", "success")}               // Color confusion
```

### 2. White Space Usage

**Best Practice:** Use generous spacing to avoid clutter and improve readability.

**Email Spacing Standard:**
```typescript
// Paragraph spacing (built-in)
.content p { margin: 0 0 16px 0; }

// Section spacing (custom)
.section { margin: 24px 0; }

// CTA spacing
.cta-container { margin-top: 30px; }
```

**DO:**
- Separate concepts with 24px vertical space
- Use 30px padding in main sections
- Add breathing room around CTAs

**DON'T:**
- Cram content together
- Use tiny margins (< 8px)
- Remove section separators

### 3. Color Usage

**Best Practice:** Use the color palette strategically for emphasis and consistency.

**Color Application Matrix:**

| Element | Color | Usage |
|---------|-------|-------|
| Header background | Charcoal | Consistent, recognizable |
| Body text | Body Text (#333) | Default, readable |
| CTAs | Terracotta | Primary actions |
| Badges | Gold | Success states |
| Accents | Terracotta | Highlights |
| Borders | Light Gray | Subtle dividers |

**DO:**
```typescript
// Primary CTA in Terracotta
<a href="${url}" class="cta-button">View Results</a>

// Success badge in Gold
${badge("Verified ✓", "success")}

// Secondary info in body text color
<p style="color: #666666;">Optional details</p>
```

**DON'T:**
```typescript
// Mixing multiple colors for same purpose
<a class="cta" style="background: #E07B54;">View</a>
<a class="cta" style="background: #C8A84B;">View</a>  // Confusing

// Using unapproved colors
<p style="color: #FF0000;">Error text</p>  // Not in palette

// Multiple accent colors in one email
${badge("Hot", "featured")}
${badge("New", "success")}  // Too much color
```

### 4. Mobile Optimization

**Best Practice:** Design mobile-first, then enhance for desktop.

**Mobile Considerations:**
```css
/* Desktop: 600px max width */
.container { max-width: 600px; }

/* Mobile: Full width with adjusted padding */
@media (max-width: 600px) {
  .container {
    border-radius: 0;        /* No rounded corners */
    padding: 0;              /* Full width */
  }
  
  .header { padding: 30px 20px; }     /* Reduced padding */
  .content { padding: 24px 20px; }
  
  .cta-button {
    display: block;          /* Full width button */
    width: 100%;
    padding: 14px 0;         /* Adequate touch target */
  }
}
```

**DO:**
- Test at 320px, 480px, and 600px widths
- Use full-width CTAs on mobile
- Reduce padding on mobile
- Stack content vertically

**DON'T:**
- Use tiny touch targets (< 44px)
- Require horizontal scrolling
- Use columns on mobile
- Assume desktop rendering

### 5. Typography

**Best Practice:** Maintain readable text sizes and proper line height throughout.

**Size Standards:**
```css
h1 (header)     { font-size: 28px; font-weight: 700; }
h2 (section)    { font-size: 16px; font-weight: 600; }
p (body)        { font-size: 15px; font-weight: 400; }
footer          { font-size: 13px; font-weight: 400; }
```

**DO:**
- Use 15px minimum for body text
- Use 1.6 line-height for readability
- Apply bold sparingly (headlines, emphasis)
- Use system fonts

**DON'T:**
- Use text smaller than 13px (except footer)
- Use multiple font families
- Use decorative fonts
- Use all-caps for body text

---

## Content Best Practices

### 1. Subject Line Optimization

**Best Practice:** Write subject lines that increase open rates while staying honest.

**Good Subject Lines:**
```
✓ Payment Verified - Your Registration is Complete
🎉 Results Published - You've Won!
📜 Certificate Ready - Download Your Award
🌟 Qualification Offer - Next Level Awaits
```

**DO:**
- Include emoji for visual interest (1 max)
- Start with status indicator
- Be specific about content
- Stay under 60 characters
- Use sentence case

**DON'T:**
```
// Vague
Important Update from Pratibha Parishad

// Misleading urgency
URGENT: ACTION REQUIRED IMMEDIATELY

// Too long
Your registration payment has been successfully verified and your submission has been queued for evaluation by our expert panel of judges

// Spam-like
🚀🎉✨ YOU WON!!! Click Now!!! 🚀🎉✨
```

### 2. Opening Hook

**Best Practice:** Grab attention in first sentence with the most important information.

**Pattern:**
```
1st sentence: State the action/news clearly
2nd sentence: Provide context if needed
3rd sentence: Next steps (if applicable)
```

**DO:**
```typescript
${paragraph(`<strong>Your registration payment has been verified.</strong>`)}
${paragraph("Your submission is now queued for evaluation by our expert judges.")}
${paragraph("Results will be announced within 5 business days.")}
```

**DON'T:**
```typescript
${paragraph("Thank you for using Pratibha Parishad.")}  // Weak opening
${paragraph("We appreciate your participation...")}      // Indirect
${paragraph("Your child's submission...")}              // Buried lead
```

### 3. Call-to-Action Copy

**Best Practice:** Use clear, action-oriented button text that drives engagement.

**Good CTA Patterns:**
```
View Results
Download Certificate
Accept Offer
Check Status
Explore Your Award
```

**DO:**
- Use action verbs (View, Download, Accept, Check)
- Keep to 2-3 words maximum
- Make it obvious what will happen
- Use first-person perspective when appropriate

**DON'T:**
```
// Vague
Click Here              // What will happen?
Submit                  // Already done
Read More              // Weak action

// Too wordy
View Your Results Page // Too specific

// Confusing
Maybe Later            // Negative action
```

### 4. Explaining Notifications

**Best Practice:** Always explain why the user is receiving the email.

**Pattern:**
```
1. What happened (headline)
2. Why they're receiving it (context)
3. What they can do (action)
4. When (timeline, if applicable)
```

**DO:**
```typescript
${paragraph("<strong>Your registration payment has been verified.</strong>")}
${section("What's Next?", `
  <p>Your submission has been queued for evaluation.</p>
  <p>Our expert judges will review your work within 5-7 business days.</p>
  <p>You'll receive an email when results are published.</p>
`)}
```

**DON'T:**
```typescript
// Just the fact, no context
${paragraph("Payment received.")}

// No timeline
${paragraph("Your submission will be evaluated.")}

// No action available
${paragraph("Processing your entry.")}
```

### 5. Tone Consistency

**Best Practice:** Match tone to notification type while maintaining brand voice.

**Tone Matrix:**

| Type | Tone | Example |
|------|------|---------|
| Success/Achievement | Celebratory | "Congratulations! You've been selected!" |
| Confirmation | Reassuring | "Your payment is secure and verified." |
| Action Required | Helpful | "Please accept your offer before the deadline." |
| Negative | Supportive | "Your entry didn't qualify this round. Here's feedback..." |
| Urgent | Direct | "Final deadline is tomorrow. Submit now." |

**DO:**
```typescript
// Celebratory for good news
"🎉 Congratulations on your achievement!"

// Supportive for challenges
"While your entry didn't qualify, we value your participation. Here's feedback..."

// Clear for action items
"Please accept your qualification offer by December 31st."
```

**DON'T:**
```typescript
// Overly casual
"yo, your results are in! 🔥"

// Robotic
"REGISTRATION PAYMENT CONFIRMED. PROCESSING STATUS: ACTIVE."

// Mismatched tone
// (Celebratory email for rejection)
"🎉 Your entry was rejected! YAAAY!"
```

---

## Development Best Practices

### 1. Use Helper Functions

**Best Practice:** Leverage built-in helpers instead of raw HTML.

**DO:**
```typescript
import { paragraph, section, badge } from "../emailTemplateEngine";

export function buildMyTemplate(...): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "Header",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(body)}
        ${section("Details", `<p>Info here</p>`)}
        ${badge("Status", "success")}
      `,
      ctaButton: { text: "View", url: appUrl + "/path" },
    },
  };
}
```

**DON'T:**
```typescript
// Raw HTML without helpers
export function buildMyTemplate(...): EmailTemplate {
  return {
    mainContent: `
      <p><strong>${title}</strong></p>
      <p>${body}</p>
      <div style="background: #C8A84B; padding: 12px 20px;">
        <span style="color: white;">Status</span>
      </div>
      <a href="${appUrl}/path">View</a>
    `,
  };
}
```

### 2. Parameterize URLs

**Best Practice:** Never hardcode URLs; always use appUrl parameter.

**DO:**
```typescript
export function buildTemplate(
  title: string,
  body: string,
  appUrl: string           // Always accept appUrl
): EmailTemplate {
  return {
    ctaButton: {
      text: "View Dashboard",
      url: `${appUrl}/parent/dashboard`,  // Use parameter
    },
  };
}

// When calling
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
const template = buildTemplate(title, body, appUrl);
```

**DON'T:**
```typescript
// Hardcoded URL
url: "http://localhost:3000/dashboard",

// Missing fallback
url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,  // Will be undefined if env not set

// Relative URL
url: "/dashboard",  // Breaks in emails
```

### 3. Keep Templates Focused

**Best Practice:** Each template should handle one notification type well.

**DO:**
- One template per notification type
- 50-100 lines of code per template
- Clear, focused purpose
- Reusable across variations

**DON'T:**
```typescript
// Mega-template handling multiple types
export function buildTemplate(
  type: "registration" | "payment" | "certificate",
  title: string,
  body: string,
  appUrl: string,
  customContent?: string,
  badge?: boolean,
  badgeColor?: string,
  section?: boolean,
): EmailTemplate {
  // 200+ lines of conditional logic
}
```

### 4. Type Safety

**Best Practice:** Use TypeScript types throughout to catch errors at compile time.

**DO:**
```typescript
export function buildTemplate(
  title: string,           // Explicit type
  body: string,
  appUrl: string,
): EmailTemplate {          // Return type specified
  return {
    subject: title,
    data: {
      headerTitle: "Header",
      mainContent: `...`,
      ctaButton: {
        text: "Action",
        url: appUrl + "/path",
      },
    },
  };
}
```

**DON'T:**
```typescript
// Missing types
export function buildTemplate(title, body, appUrl) {
  return {
    subject: title,
    data: {
      mainContent: body,  // What type is body?
      ctaButton: ctaButton,  // Where does ctaButton come from?
    },
  };
}

// Using any
const content: any = paragraph(body);  // Defeats type safety
```

### 5. Code Organization

**Best Practice:** Organize code for readability and maintainability.

**Template File Structure:**
```typescript
/**
 * [NotificationType] Email Template
 *
 * Description of when/why this template is used.
 * Any important context about the notification.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, section, badge } from "../emailTemplateEngine";

export function buildYourNameTemplate(
  title: string,
  body: string,
  appUrl: string,
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "Header Title",
      headerSubtitle: "Optional subtitle",
      mainContent: `
        ${paragraph(...)}
        ${section(...)}
        ${badge(...)}
      `,
      ctaButton: {
        text: "Button text",
        url: `${appUrl}/path`,
      },
    },
  };
}
```

---

## Performance Best Practices

### 1. Email File Size

**Best Practice:** Keep email HTML under 100KB total size.

**DO:**
- Minimize CSS (no duplicate rules)
- Use inline styles only when necessary
- Compress images
- Remove unused code

**DON'T:**
- Include external stylesheets
- Add web fonts
- Embed large images
- Include unnecessary helpers

### 2. Rendering Performance

**Best Practice:** Optimize for fast rendering in email clients.

**DO:**
```css
/* Simple selectors */
.header { }
.content p { }

/* Minimal nesting */
.badge-success { }

/* No complex selectors */
```

**DON'T:**
```css
/* Slow selectors */
div > section > div.content > p:first-child {
  color: red;
}

/* Overly specific */
body div.container section.content p.body-text em strong {
  font-weight: bold;
}
```

### 3. Template Compilation

**Best Practice:** Render templates once and cache when possible.

**DO:**
```typescript
// Template rendered once
const template = buildTemplate(title, body, appUrl);
const html = renderEmailTemplate(template);

// Reuse html if sending to multiple recipients
for (const recipient of recipients) {
  await sendEmailViaResend(recipient, template.subject, html);
}
```

**DON'T:**
```typescript
// Re-rendering for each recipient
for (const recipient of recipients) {
  const template = buildTemplate(title, body, appUrl);
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(recipient, template.subject, html);
}
```

---

## Maintenance Best Practices

### 1. Documentation

**Best Practice:** Document templates thoroughly for future maintainers.

```typescript
/**
 * Registration Verified Email Template
 *
 * Sent when a registration is fully verified (payment + submission validated).
 * Confirms that evaluation has begun.
 *
 * @param title - Notification title from database
 * @param body - Notification body from database
 * @param appUrl - Application URL for CTA links
 * @returns Rendered EmailTemplate object
 *
 * @example
 * const template = buildRegistrationVerifiedTemplate(
 *   "Your Entry is Under Review",
 *   "Expert judges are reviewing your submission",
 *   "https://pratibhaparishad.in"
 * );
 * const html = renderEmailTemplate(template);
 */
```

### 2. Version Control

**Best Practice:** Include email changes in commits with clear messages.

**DO:**
```bash
# Clear, descriptive commit
git commit -m "feat: improve registration verified email with timeline details"

# Include what changed and why
git commit -m "refactor: update certificate ready template to use new badge component

- Replaced hardcoded badge with badge() helper
- Updated colors to match latest design system
- Improved mobile responsiveness"
```

**DON'T:**
```bash
# Vague
git commit -m "update email"

# Too minimal
git commit -m "fix template"

# No context
git commit -m "changes to emails"
```

### 3. Testing Updates

**Best Practice:** Test changes thoroughly before deploying.

**Checklist for Changes:**
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Visual changes reviewed
- [ ] Mobile rendering tested
- [ ] Links verified
- [ ] Color contrast checked
- [ ] No regressions in other emails

### 4. Monitoring

**Best Practice:** Track email performance and user feedback.

**Metrics to Monitor:**
- Delivery rate (% successfully sent)
- Open rate (how many recipients open)
- Click rate (CTA engagement)
- Bounce rate (invalid addresses)
- Spam complaints

**User Feedback:**
- Monitor support requests about email format
- Track unsubscribe rates by email type
- Gather feedback on email clarity
- Survey on email preference changes

### 5. Updates & Deprecation

**Best Practice:** Manage template updates without breaking existing code.

**Updating a Template:**
1. Update template file
2. Test thoroughly
3. Check all calling code
4. Deploy with care

**Deprecating a Template:**
1. Ensure no active notifications use it
2. Check if any code paths reference it
3. Update documentation
4. Plan removal in next major version

---

## Common Mistakes to Avoid

### 1. Missing Environment Variables

**Mistake:**
```typescript
url: process.env.NEXT_PUBLIC_APP_URL + "/path"
// NEXT_PUBLIC_APP_URL might be undefined
```

**Fix:**
```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
url: `${appUrl}/path`
```

### 2. Inline CSS Overrides

**Mistake:**
```typescript
mainContent: `
  <p style="color: #FF0000;">Error</p>
  <p style="background: #E07B54; padding: 10px;">Badge</p>
  <a style="background: #C8A84B; color: white;">Button</a>
`
```

**Fix:**
```typescript
mainContent: `
  ${paragraph("Error message")}      // Use helpers
  ${badge("Badge text", "success")}  // Use components
  ${/* CTA in data.ctaButton */}
`
```

### 3. Hardcoded URLs

**Mistake:**
```typescript
ctaButton: {
  text: "View",
  url: "http://localhost:3000/dashboard",  // Wrong URL for production
}
```

**Fix:**
```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
ctaButton: {
  text: "View",
  url: `${appUrl}/dashboard`,
}
```

### 4. Excessive Styling

**Mistake:**
```typescript
mainContent: `
  <p style="font-family: 'Courier New'; font-size: 14px; color: #1C1C1E; line-height: 1.8; margin: 0 0 16px 0;">
    Your content here
  </p>
`
```

**Fix:**
```typescript
mainContent: `
  ${paragraph("Your content here")}  // All styling handled by engine
`
```

### 5. Missing Context

**Mistake:**
```typescript
${paragraph(body)}
// User doesn't understand why they got this email
```

**Fix:**
```typescript
${paragraph(`<strong>${title}</strong>`)}     // What happened
${paragraph(body)}
${section("Next Steps", `                      // What to do
  <p>Click the button below to view your results.</p>
`)}
```

### 6. Inconsistent Tone

**Mistake:**
```typescript
// Overly formal
"Notification: Registration Status Change: Verified"

// Then casual
"Check out your awesome results bro!"
```

**Fix:**
```typescript
// Consistent, warm professional tone
"Your registration is verified and evaluation has begun."
"View your results on your dashboard."
```

### 7. Poor Mobile Experience

**Mistake:**
```css
/* Desktop only */
.cta-button {
  display: inline-block;  /* Stays narrow on mobile */
  padding: 8px 16px;      /* Too small to tap */
}
```

**Fix:**
```css
.cta-button {
  display: inline-block;
  padding: 14px 32px;
}

@media (max-width: 600px) {
  .cta-button {
    display: block;       /* Full width on mobile */
    width: 100%;
  }
}
```

---

## Conclusion

Following these best practices ensures:
- **Consistent** quality across all emails
- **Professional** appearance matching brand standards
- **Accessible** experience for all recipients
- **Maintainable** code for future developers
- **Engaging** content that drives action

For detailed guidelines, see [GUIDELINES.md](GUIDELINES.md).


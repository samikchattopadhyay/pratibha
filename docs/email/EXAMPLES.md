# Email Template Examples

## Overview

This document provides practical, copy-paste ready examples for creating different types of email templates in Pratibha Parishad.

---

## Table of Contents

1. [Basic Success Email](#basic-success-email)
2. [Email with Multiple Sections](#email-with-multiple-sections)
3. [Email with Badge/Highlight](#email-with-bagehighlight)
4. [Action Required Email](#action-required-email)
5. [Informational Email](#informational-email)
6. [Template Variants](#template-variants)

---

## Basic Success Email

### Use Case
Simple confirmation email when an action completes successfully.

### Example: Payment Confirmation

**File:** `src/lib/email/templates/paymentConfirmedTemplate.ts`

```typescript
/**
 * Payment Confirmed Email Template
 *
 * Sent when payment is successfully processed and verified.
 * Confirms transaction completion and next steps.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, section } from "../emailTemplateEngine";

export function buildPaymentConfirmedTemplate(
  title: string,
  body: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "✓ Payment Confirmed",
      headerSubtitle: "Your registration is now active",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(body)}
        ${section(
          "What Happens Next",
          `
          <p>Your registration is now complete and your submission has been queued for evaluation.</p>
          <p>You can track the status of your submission from your dashboard at any time.</p>
          `
        )}
      `,
      ctaButton: {
        text: "View Dashboard",
        url: `${appUrl}/parent/dashboard`,
      },
    },
  };
}
```

### Output

```
┌─────────────────────────────────────┐
│  ✓ Payment Confirmed                │
│  Your registration is now active    │
├─────────────────────────────────────┤
│                                     │
│ Payment Confirmed                   │
│                                     │
│ Your registration payment has been  │
│ successfully verified.              │
│                                     │
│ What Happens Next                   │
│ ─────────────────────────────────   │
│ Your registration is now complete   │
│ and your submission has been        │
│ queued for evaluation.              │
│                                     │
│ [View Dashboard]                    │
│                                     │
├─────────────────────────────────────┤
│ Thank you,                          │
│ Pratibha Parishad Team              │
└─────────────────────────────────────┘
```

---

## Email with Multiple Sections

### Use Case
Email with detailed information broken into multiple logical sections.

### Example: Registration Verification

**File:** `src/lib/email/templates/registrationVerificationTemplate.ts`

```typescript
/**
 * Registration Verification Email Template
 *
 * Sent when a registration is fully verified.
 * Provides detailed information about evaluation process and timeline.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, section } from "../emailTemplateEngine";

export function buildRegistrationVerificationTemplate(
  title: string,
  body: string,
  competitionName: string,
  category: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "✓ Registration Verified",
      headerSubtitle: "Evaluation has begun",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(body)}
        ${section(
          "Your Submission Details",
          `
          <p><strong>Competition:</strong> ${competitionName}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p>Your submission is now in the evaluation queue.</p>
          `
        )}
        ${section(
          "Evaluation Process",
          `
          <p>Our expert judges will review your submission using our standardized rubric.</p>
          <p>The evaluation process typically takes 5-7 business days.</p>
          <p>You'll receive an email notification as soon as results are published.</p>
          `
        )}
        ${section(
          "What You Can Do Now",
          `
          <p>Visit your dashboard to track the status of your submission.</p>
          <p>You can view detailed feedback once the evaluation is complete.</p>
          `
        )}
      `,
      ctaButton: {
        text: "Check Status",
        url: `${appUrl}/parent/dashboard`,
      },
    },
  };
}
```

### Output

```
┌─────────────────────────────────────────┐
│  ✓ Registration Verified                │
│  Evaluation has begun                   │
├─────────────────────────────────────────┤
│                                         │
│ Your Registration is Verified           │
│                                         │
│ Your child's submission is now under    │
│ evaluation by our expert judges.        │
│                                         │
│ Your Submission Details                 │
│ ──────────────────────────────────────  │
│ Competition: Talent Excellence 2026     │
│ Category: Classical Dance               │
│ Your submission is now in the           │
│ evaluation queue.                       │
│                                         │
│ Evaluation Process                      │
│ ──────────────────────────────────────  │
│ Our expert judges will review your      │
│ submission using our standardized       │
│ rubric. The evaluation process          │
│ typically takes 5-7 business days.      │
│ You'll receive an email notification    │
│ as soon as results are published.       │
│                                         │
│ What You Can Do Now                     │
│ ──────────────────────────────────────  │
│ Visit your dashboard to track the       │
│ status of your submission. You can      │
│ view detailed feedback once the         │
│ evaluation is complete.                 │
│                                         │
│ [Check Status]                          │
│                                         │
├─────────────────────────────────────────┤
│ Thank you,                              │
│ Pratibha Parishad Team                  │
└─────────────────────────────────────────┘
```

---

## Email with Badge/Highlight

### Use Case
Email announcing a significant achievement or status with prominent highlight.

### Example: Award Announcement

**File:** `src/lib/email/templates/awardAnnouncementTemplate.ts`

```typescript
/**
 * Award Announcement Email Template
 *
 * Sent when evaluation results are published with an award.
 * Celebrates achievement with prominent badge.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, badge, section } from "../emailTemplateEngine";

export function buildAwardAnnouncementTemplate(
  title: string,
  awardName: string,
  awardDescription: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "🎉 Results Published!",
      headerSubtitle: "Congratulations on your achievement",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${badge(`${awardName}`, "featured")}
        ${paragraph(awardDescription)}
        ${section(
          "Your Achievement",
          `
          <p>Your submission demonstrated exceptional talent and creativity.</p>
          <p>You've been selected among the top participants in this category.</p>
          <p>This recognition reflects your dedication and hard work.</p>
          `
        )}
        ${section(
          "Next Steps",
          `
          <p>Your verified digital certificate is available on your dashboard.</p>
          <p>You can download and share your certificate with pride.</p>
          <p>Congratulations once again!</p>
          `
        )}
      `,
      ctaButton: {
        text: "View Results & Certificate",
        url: `${appUrl}/parent/dashboard`,
      },
    },
  };
}
```

### Output

```
┌─────────────────────────────────────┐
│  🎉 Results Published!              │
│  Congratulations on your achievement│
├─────────────────────────────────────┤
│                                     │
│ Your Entry Won an Award!            │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ Gold Medal - Excellence       │   │
│ └───────────────────────────────┘   │
│                                     │
│ Your submission demonstrated        │
│ exceptional talent and creativity.  │
│                                     │
│ Your Achievement                    │
│ ──────────────────────────────────  │
│ Your submission demonstrated        │
│ exceptional talent and creativity.  │
│ You've been selected among the      │
│ top participants in this category.  │
│ This recognition reflects your      │
│ dedication and hard work.           │
│                                     │
│ Next Steps                          │
│ ──────────────────────────────────  │
│ Your verified digital certificate   │
│ is available on your dashboard.     │
│ You can download and share your     │
│ certificate with pride.             │
│ Congratulations once again!         │
│                                     │
│ [View Results & Certificate]        │
│                                     │
├─────────────────────────────────────┤
│ Thank you,                          │
│ Pratibha Parishad Team              │
└─────────────────────────────────────┘
```

---

## Action Required Email

### Use Case
Email prompting user to take action with clear deadline.

### Example: Qualification Acceptance

**File:** `src/lib/email/templates/qualificationAcceptanceTemplate.ts`

```typescript
/**
 * Qualification Acceptance Email Template
 *
 * Sent when a participant is offered advancement to next round.
 * Requires action with specific deadline.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, badge, section } from "../emailTemplateEngine";

export function buildQualificationAcceptanceTemplate(
  title: string,
  nextRound: string,
  deadline: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "🌟 Qualification Offer",
      headerSubtitle: "Advancement opportunity",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${badge("Qualified for Next Round", "featured")}
        ${paragraph(
          `Your child has been selected to participate in <strong>${nextRound}</strong>!`
        )}
        ${section(
          "Important: Action Required",
          `
          <p><strong>Deadline: ${deadline}</strong></p>
          <p>Please accept or decline this qualification offer by the deadline above.</p>
          <p>If you do not respond by the deadline, the offer will automatically expire.</p>
          `
        )}
        ${section(
          "Next Round Details",
          `
          <p>Selected participants will compete in the advanced category.</p>
          <p>Additional competition details and timeline will be sent after you accept.</p>
          <p>This is a recognition of your child's exceptional performance.</p>
          `
        )}
      `,
      ctaButton: {
        text: "Accept Qualification",
        url: `${appUrl}/parent/dashboard`,
      },
    },
  };
}
```

### Output

```
┌─────────────────────────────────────┐
│  🌟 Qualification Offer             │
│  Advancement opportunity            │
├─────────────────────────────────────┤
│                                     │
│ Your Child Has Been Selected!       │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ Qualified for Next Round      │   │
│ └───────────────────────────────┘   │
│                                     │
│ Your child has been selected to     │
│ participate in National Finals!     │
│                                     │
│ Important: Action Required          │
│ ──────────────────────────────────  │
│ Deadline: December 31, 2026         │
│ Please accept or decline this       │
│ qualification offer by the          │
│ deadline above. If you do not       │
│ respond by the deadline, the        │
│ offer will automatically expire.    │
│                                     │
│ Next Round Details                  │
│ ──────────────────────────────────  │
│ Selected participants will compete  │
│ in the advanced category.           │
│ Additional competition details and  │
│ timeline will be sent after you     │
│ accept. This is a recognition of    │
│ your child's exceptional            │
│ performance.                        │
│                                     │
│ [Accept Qualification]              │
│                                     │
├─────────────────────────────────────┤
│ Thank you,                          │
│ Pratibha Parishad Team              │
└─────────────────────────────────────┘
```

---

## Informational Email

### Use Case
Email providing information or updates without requiring action.

### Example: Evaluation Status Update

**File:** `src/lib/email/templates/evaluationStatusTemplate.ts`

```typescript
/**
 * Evaluation Status Email Template
 *
 * Sent to provide updates on submission evaluation progress.
 * Informational only, no action required.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, section } from "../emailTemplateEngine";

export function buildEvaluationStatusTemplate(
  title: string,
  status: string,
  progress: string,
  estimatedCompletion: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "📊 Evaluation Update",
      headerSubtitle: "Status: " + status,
      mainContent: `
        ${paragraph(
          `Your submission evaluation is progressing well. Here's the current status.`
        )}
        ${section(
          "Evaluation Progress",
          `
          <p><strong>Current Phase:</strong> ${progress}</p>
          <p><strong>Estimated Completion:</strong> ${estimatedCompletion}</p>
          <p>Multiple judges are reviewing your submission using our standardized rubric.</p>
          `
        )}
        ${section(
          "What to Expect",
          `
          <p>Results will be published once all judges have completed their reviews.</p>
          <p>You'll receive an email notification immediately when results are available.</p>
          <p>You can view detailed feedback from all judges on your dashboard.</p>
          `
        )}
        ${paragraph(
          `Thank you for your patience. We're committed to thorough, fair evaluation.`
        )}
      `,
      ctaButton: {
        text: "View Detailed Status",
        url: `${appUrl}/parent/dashboard`,
      },
    },
  };
}
```

### Output

```
┌──────────────────────────────────────┐
│  📊 Evaluation Update                │
│  Status: In Progress                 │
├──────────────────────────────────────┤
│                                      │
│ Your submission evaluation is        │
│ progressing well. Here's the         │
│ current status.                      │
│                                      │
│ Evaluation Progress                  │
│ ───────────────────────────────────  │
│ Current Phase: Judge Review          │
│ Estimated Completion: Jan 10, 2026   │
│ Multiple judges are reviewing your   │
│ submission using our standardized    │
│ rubric.                              │
│                                      │
│ What to Expect                       │
│ ───────────────────────────────────  │
│ Results will be published once all   │
│ judges have completed their reviews. │
│ You'll receive an email notification │
│ immediately when results are         │
│ available. You can view detailed     │
│ feedback from all judges on your     │
│ dashboard.                           │
│                                      │
│ Thank you for your patience. We're   │
│ committed to thorough, fair          │
│ evaluation.                          │
│                                      │
│ [View Detailed Status]               │
│                                      │
├──────────────────────────────────────┤
│ Thank you,                           │
│ Pratibha Parishad Team               │
└──────────────────────────────────────┘
```

---

## Template Variants

### Variant 1: Minimal Design

**Use Case:** Time-sensitive notifications that need quick reading

```typescript
export function buildMinimalTemplate(
  title: string,
  message: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "Update",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(message)}
      `,
      ctaButton: {
        text: "View Details",
        url: `${appUrl}/parent/dashboard`,
      },
    },
  };
}
```

### Variant 2: Detailed Design

**Use Case:** Important communications with multiple pieces of information

```typescript
export function buildDetailedTemplate(
  title: string,
  body: string,
  details: { label: string; value: string }[],
  appUrl: string
): EmailTemplate {
  const detailsHtml = details
    .map(({ label, value }) => `<p><strong>${label}:</strong> ${value}</p>`)
    .join("");

  return {
    subject: title,
    data: {
      headerTitle: "Important Update",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(body)}
        ${section("Details", detailsHtml)}
      `,
      ctaButton: {
        text: "Review Details",
        url: `${appUrl}/parent/dashboard`,
      },
    },
  };
}
```

### Variant 3: Warning/Alert Design

**Use Case:** Alerts or notifications requiring attention

```typescript
export function buildAlertTemplate(
  title: string,
  message: string,
  urgency: "high" | "medium" | "low",
  actionUrl: string,
  appUrl: string
): EmailTemplate {
  const badgeColor =
    urgency === "high" ? "featured" : urgency === "medium" ? "success" : "success";

  return {
    subject: title,
    data: {
      headerTitle: "⚠ Alert",
      mainContent: `
        ${badge(urgency.toUpperCase() + " PRIORITY", badgeColor)}
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(message)}
        ${section(
          "Recommended Action",
          `<p><a href="${actionUrl}">Click here to take action</a></p>`
        )}
      `,
      ctaButton: {
        text: "Take Action Now",
        url: actionUrl,
      },
    },
  };
}
```

---

## Using Template Helpers

### Common Patterns

**Congratulatory Message:**
```typescript
${badge("Achievement Unlocked!", "featured")}
${paragraph("Congratulations on your success!")}
```

**Timeline Display:**
```typescript
${section("Timeline", `
  <p><strong>Jan 1-15:</strong> Registration Period</p>
  <p><strong>Jan 16-20:</strong> Submission Review</p>
  <p><strong>Jan 21-25:</strong> Evaluation</p>
  <p><strong>Jan 26:</strong> Results Announced</p>
`)}
```

**Call-to-Action with Context:**
```typescript
${section("Next Steps", `
  <p>Click the button below to complete your registration.</p>
  <p>You must submit before January 31st.</p>
`)}
```

**Multi-Currency Display:**
```typescript
${section("Payment Details", `
  <p><strong>Amount:</strong> ₹5,000 (INR)</p>
  <p><strong>Payment Method:</strong> Online Transfer</p>
  <p><strong>Transaction ID:</strong> TXN12345678</p>
`)}
```

---

## Testing Your Template

### Quick Verification

```bash
# 1. Create your template file
# src/lib/email/templates/yourNameTemplate.ts

# 2. Add export to index
# src/lib/email/templates/index.ts

# 3. Check TypeScript
npx tsc --noEmit

# 4. Check linting
npm run lint

# 5. Build project
npm run build

# 6. Send test email and verify rendering
```

### Template Rendering Preview

```typescript
// In your test code
const appUrl = "https://pratibhaparishad.in";
const template = buildYourTemplate(
  "Test Title",
  "Test body content",
  appUrl
);
const html = renderEmailTemplate(template);

// Save to file for browser preview
fs.writeFileSync("preview.html", html);

// Open preview.html in browser to see rendering
```

---

## Common Customizations

### Adding Personalization

```typescript
${paragraph(
  `Hello <strong>${recipientName}</strong>,`
)}
// vs
${paragraph(`<strong>${title}</strong>`)}
```

### Adding Deadline

```typescript
${section("Important Deadline", `
  <p><strong>Must respond by:</strong> December 31, 2026</p>
  <p>24 hours remaining</p>
`)}
```

### Adding Multiple CTAs

Use the main CTA in data, then add secondary links in content:

```typescript
mainContent: `
  ${paragraph(`<strong>${title}</strong>`)}
  ${section("Options", `
    <p><a href="${appUrl}/path1">Option 1: Accept</a></p>
    <p><a href="${appUrl}/path2">Option 2: Defer</a></p>
  `)}
`,
ctaButton: {
  text: "Choose Now",
  url: `${appUrl}/primary-action`,
},
```

---

## Conclusion

These examples provide a foundation for creating consistent, professional emails in Pratibha Parishad. Customize them as needed, but maintain the structure and design system to ensure consistency.

For detailed guidelines, see:
- [GUIDELINES.md](GUIDELINES.md)
- [BEST_PRACTICES.md](BEST_PRACTICES.md)
- [EMAIL_TEMPLATE_SYSTEM.md](../EMAIL_TEMPLATE_SYSTEM.md)


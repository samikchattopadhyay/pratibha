# Email Documentation

Complete documentation for the template-based email system in Pratibha Parishad.

---

## Quick Start

### For New Developers

1. **Start here:** [GUIDELINES.md](GUIDELINES.md)
   - Design principles and standards
   - Color and typography rules
   - Template structure requirements

2. **Then read:** [EXAMPLES.md](EXAMPLES.md)
   - Copy-paste ready template examples
   - Real-world use cases
   - Common patterns and customizations

3. **Reference:** [BEST_PRACTICES.md](BEST_PRACTICES.md)
   - Development best practices
   - Common mistakes to avoid
   - Performance and maintenance tips

### For Template Creation

**Step-by-step process:**

1. Read the use case in [GUIDELINES.md § Template Creation](GUIDELINES.md#template-creation)
2. Find similar example in [EXAMPLES.md](EXAMPLES.md)
3. Copy example and customize for your notification type
4. Follow checklist in [GUIDELINES.md § Testing & Verification](GUIDELINES.md#testing--verification)
5. Reference [BEST_PRACTICES.md](BEST_PRACTICES.md) for any questions

---

## Documentation Structure

```
docs/email/
├── README.md (this file)
├── GUIDELINES.md (required reading)
├── BEST_PRACTICES.md (reference)
└── EXAMPLES.md (copy-paste ready)
```

### File Purposes

| File | Purpose | Audience |
|------|---------|----------|
| GUIDELINES.md | Design rules, standards, and creation process | Everyone |
| BEST_PRACTICES.md | Do's and don'ts, common mistakes | Developers |
| EXAMPLES.md | Copy-paste templates for common scenarios | Developers |

---

## Key Resources

### System Architecture
- [Email Template System Overview](../EMAIL_TEMPLATE_SYSTEM.md)
- [Implementation Summary](../EMAIL_SYSTEM_IMPLEMENTATION.md)

### Source Code
- Email configuration: `src/lib/email/emailConfig.ts`
- Template engine: `src/lib/email/emailTemplateEngine.ts`
- Template files: `src/lib/email/templates/*.ts`
- Email functions: `src/lib/notifications.ts`

---

## Common Tasks

### I want to create a new email template

1. Identify your notification type (success, alert, action required, etc.)
2. Find similar example in [EXAMPLES.md](EXAMPLES.md)
3. Copy the example template structure
4. Customize title, content, and CTA
5. Update `src/lib/email/templates/index.ts` to export
6. Create email function in `src/lib/notifications.ts`
7. Wire up in notification service
8. Test with checklist from [GUIDELINES.md](GUIDELINES.md)

### I need to update an existing template

1. Open template file in `src/lib/email/templates/`
2. Make changes following [GUIDELINES.md](GUIDELINES.md)
3. Verify TypeScript: `npx tsc --noEmit`
4. Verify linting: `npm run lint`
5. Test email rendering
6. Commit with descriptive message

### I want to understand the design system

1. Read [GUIDELINES.md § Color & Typography](GUIDELINES.md#color--typography)
2. Check `src/lib/email/emailConfig.ts` for hex values
3. Reference [BEST_PRACTICES.md § Design Best Practices](BEST_PRACTICES.md#design-best-practices)
4. Review examples in [EXAMPLES.md](EXAMPLES.md)

### I need to debug an email rendering issue

1. Check [GUIDELINES.md § Testing & Verification](GUIDELINES.md#testing--verification)
2. Review [BEST_PRACTICES.md § Common Mistakes](BEST_PRACTICES.md#common-mistakes-to-avoid)
3. Use browser preview to visualize HTML
4. Test in email client if needed
5. Check mobile responsiveness at 600px

---

## Design System Colors

All emails use these brand colors:

```
Charcoal (#1C1C1E)  ← Headers, primary text
Terracotta (#E07B54) ← CTAs, primary accent
Gold (#C8A84B)      ← Badges, secondary accent
White (#FFFFFF)     ← Content background
Cream (#FCF9F2)     ← Outer background
```

**Reference:** [GUIDELINES.md § Color & Typography](GUIDELINES.md#color--typography)

---

## Email Types Covered

| Type | Template | Example |
|------|----------|---------|
| Success | `buildPaymentConfirmedTemplate` | Payment received |
| Multi-section | `buildRegistrationVerificationTemplate` | Detailed confirmation |
| Achievement | `buildAwardAnnouncementTemplate` | Award announcement |
| Action Required | `buildQualificationAcceptanceTemplate` | Deadline-based offer |
| Informational | `buildEvaluationStatusTemplate` | Status update |

**Full examples:** [EXAMPLES.md](EXAMPLES.md)

---

## Template Helpers

All templates use these helper functions:

```typescript
paragraph(text)           // Styled paragraph
section(title, content)   // Highlighted section with left border
badge(text, variant)      // Success or featured badge
divider()                 // Visual separator line
```

**Reference:** [EXAMPLES.md § Using Template Helpers](EXAMPLES.md#using-template-helpers)

---

## Testing Checklist

Before deploying any email template:

- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Template structure correct (subject, data, mainContent)
- [ ] All URLs use appUrl parameter
- [ ] Subject line is clear and concise
- [ ] Header title matches notification type
- [ ] Content uses helper functions
- [ ] CTA button text is action-oriented
- [ ] Color contrast meets WCAG AA
- [ ] Mobile rendering tested (600px)
- [ ] No hardcoded colors or styles

**Full checklist:** [GUIDELINES.md § Testing & Verification](GUIDELINES.md#testing--verification)

---

## Common Questions

### How do I add a custom message to an email?

Use the `body` parameter passed to your template:

```typescript
export function buildTemplate(
  title: string,
  body: string,      // Dynamic content from database
  appUrl: string
): EmailTemplate {
  return {
    mainContent: `
      ${paragraph(`<strong>${title}</strong>`)}
      ${paragraph(body)}  // Your custom message here
    `,
  };
}
```

### How do I change the colors?

All colors are in `src/lib/email/emailConfig.ts`:

```typescript
export const emailColors = {
  charcoal: "#1C1C1E",
  terracotta: "#E07B54",
  gold: "#C8A84B",
  // ... etc
};
```

Update the hex values, and all templates automatically use new colors.

**Reference:** [GUIDELINES.md § Color & Typography](GUIDELINES.md#color--typography)

### How do I add a second CTA button?

Primary CTA goes in `data.ctaButton`. Add secondary CTAs in content:

```typescript
mainContent: `
  ${paragraph("Choose your action:")}
  ${section("Options", `
    <p><a href="${appUrl}/accept">Accept Offer</a></p>
    <p><a href="${appUrl}/defer">Defer to Later</a></p>
  `)}
`,
ctaButton: {
  text: "Primary Action",
  url: `${appUrl}/primary`,
},
```

**Reference:** [EXAMPLES.md § Common Customizations](EXAMPLES.md#adding-multiple-ctas)

### Can I use custom fonts or colors?

No. All fonts and colors must come from the centralized design system in `emailConfig.ts`. This ensures consistency and brand alignment.

**Why:** Email clients have limited CSS support, and centralizing reduces maintenance overhead.

### How do I test email rendering?

1. Use TypeScript + Linter: `npx tsc --noEmit && npm run lint`
2. Preview HTML in browser
3. Test in email clients (Gmail, Outlook, Apple Mail)
4. Test mobile at 600px width
5. Verify links and colors

**Full instructions:** [GUIDELINES.md § Testing & Verification](GUIDELINES.md#testing--verification)

---

## Related Documentation

- **System Overview:** [EMAIL_TEMPLATE_SYSTEM.md](../EMAIL_TEMPLATE_SYSTEM.md)
- **Implementation:** [EMAIL_SYSTEM_IMPLEMENTATION.md](../EMAIL_SYSTEM_IMPLEMENTATION.md)
- **Project Standards:** [CLAUDE.md](../../CLAUDE.md)
- **API Documentation:** See individual source files

---

## Support

**For questions:**
1. Check [GUIDELINES.md](GUIDELINES.md) first
2. Review [EXAMPLES.md](EXAMPLES.md) for similar patterns
3. See [BEST_PRACTICES.md](BEST_PRACTICES.md) for common issues
4. Reference source code comments in `src/lib/email/`

**For bugs or improvements:**
- Open an issue with details
- Include template code and error message
- Reference relevant documentation section

---

## Quick Links

- [Email System Overview](../EMAIL_TEMPLATE_SYSTEM.md)
- [Design Guidelines](GUIDELINES.md)
- [Template Examples](EXAMPLES.md)
- [Best Practices](BEST_PRACTICES.md)
- [Email Configuration](../../src/lib/email/emailConfig.ts)
- [Template Engine](../../src/lib/email/emailTemplateEngine.ts)

---

**Last Updated:** May 27, 2026


# Email Template System

## Overview

Pratibha Parishad uses a **template-based email system** that ensures all emails follow the application's design rules and maintain consistent branding across all communications.

### Key Features

- **Design System Integration**: All emails use HSL-based colors aligned with the app (Charcoal, Terracotta, Gold)
- **Modular Templates**: Each notification type has its own template file
- **Template Engine**: Centralized rendering engine ensures consistent styling
- **Maintainability**: Separation of concerns between template logic, styling, and email delivery
- **Responsive Design**: Mobile-optimized emails with media queries
- **Type-Safe**: Full TypeScript support throughout the system

---

## Architecture

### Directory Structure

```
src/lib/email/
├── emailConfig.ts              # Design system colors and global styles
├── emailTemplateEngine.ts       # Template rendering engine
├── templates/
│   ├── index.ts               # Central export point
│   ├── registrationCreatedTemplate.ts
│   ├── paymentReceivedTemplate.ts
│   ├── registrationVerifiedTemplate.ts
│   ├── registrationRejectedTemplate.ts
│   ├── resultsPublishedTemplate.ts
│   ├── certificateReadyTemplate.ts
│   └── qualificationOfferedTemplate.ts
```

### Components

#### 1. Email Configuration (`emailConfig.ts`)

Centralizes the design system for all emails:

- **Colors**:
  - `charcoal` (#1C1C1E): Primary dark backgrounds
  - `terracotta` (#E07B54): Primary accent and CTAs
  - `gold` (#C8A84B): Secondary accent for badges
  - `white`, `cream`, etc.

- **Fonts**: System fonts with fallbacks
- **Global Styles**: Base CSS for all template elements
- **CSS Classes**: Pre-built utility classes (`.badge`, `.section`, `.cta-button`, etc.)

#### 2. Template Engine (`emailTemplateEngine.ts`)

Renders email templates with consistent structure:

```typescript
export interface EmailTemplateData {
  headerTitle: string;           // Large header title
  headerSubtitle?: string;       // Optional subtitle
  mainContent: string;           // HTML content body
  ctaButton?: {                  // Optional call-to-action
    text: string;
    url: string;
  };
  footerMessage?: string;        // Custom footer text
}

export interface EmailTemplate {
  subject: string;
  data: EmailTemplateData;
}

export function renderEmailTemplate(template: EmailTemplate): string
```

**Helper Functions**:

- `paragraph(text)` - Wrap text in styled `<p>` tags
- `section(title, content)` - Create highlighted section with left border
- `badge(text, variant)` - Create success or featured badges
- `divider()` - Insert visual divider line

#### 3. Individual Templates

Each notification type has a dedicated template builder:

```typescript
export function buildRegistrationCreatedTemplate(
  title: string,
  body: string,
  appUrl: string
): EmailTemplate
```

Templates follow a consistent pattern:
1. **Header**: Emoji + clear status
2. **Subtitle**: Context about the notification
3. **Content**: Dynamic title, body, and contextual sections
4. **CTA Button**: Action link to dashboard
5. **Footer**: Standard signature

---

## Usage

### Creating an Email

In `src/lib/notifications.ts`:

```typescript
export async function sendEmailRegistrationCreated(
  to: string,
  title: string,
  body: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildRegistrationCreatedTemplate(
    title,
    body,
    appUrl
  );
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}
```

### Design Rules

All emails automatically follow these rules:

1. **Color Scheme**
   - Charcoal headers (#1C1C1E)
   - Terracotta CTAs (#E07B54)
   - Gold badges (#C8A84B)
   - White content area with subtle borders

2. **Typography**
   - System fonts with graceful degradation
   - Clear hierarchy: header > content > footer
   - Proper line height (1.6) for readability

3. **Spacing**
   - 40px header padding
   - 30px content padding
   - 24px footer padding
   - Responsive margins on mobile

4. **Responsiveness**
   - Max-width: 600px for desktop
   - Adjusted padding on mobile (< 600px)
   - Single-column CTA buttons on mobile
   - Proper text scaling

5. **Accessibility**
   - High contrast ratios
   - Semantic HTML structure
   - Alt text support for templates
   - Clear call-to-action buttons

---

## Adding a New Email Template

### Step 1: Create Template File

Create `src/lib/email/templates/yourNotificationTemplate.ts`:

```typescript
import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, section, badge } from "../emailTemplateEngine";

export function buildYourNotificationTemplate(
  title: string,
  body: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "Your Header",
      headerSubtitle: "Optional subtitle",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(body)}
        ${section("Section Title", `<p>Your content here</p>`)}
        ${badge("Your Badge", "success")}
      `,
      ctaButton: {
        text: "Action Text",
        url: `${appUrl}/your/path`,
      },
    },
  };
}
```

### Step 2: Export from Index

Add to `src/lib/email/templates/index.ts`:

```typescript
export { buildYourNotificationTemplate } from "./yourNotificationTemplate";
```

### Step 3: Create Email Function

Add to `src/lib/notifications.ts`:

```typescript
export async function sendEmailYourNotification(
  to: string,
  title: string,
  body: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildYourNotificationTemplate(title, body, appUrl);
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}
```

### Step 4: Wire Up Notification Service

Update `src/lib/notificationService.ts` to call your new email function in `sendEmailByType()`.

---

## Template Customization

### Using Helper Components

#### Paragraphs
```typescript
${paragraph("Simple paragraph text")}
${paragraph("<strong>Bold text</strong> with HTML")}
```

#### Sections (with left border accent)
```typescript
${section("Section Title", `
  <p>First point</p>
  <p>Second point</p>
`)}
```

#### Badges
```typescript
${badge("Success Status", "success")}     // Gold background
${badge("Featured Status", "featured")}   // Terracotta background
```

#### Dividers
```typescript
${divider()}
```

### Inline HTML

For more control, you can use HTML directly:

```typescript
mainContent: `
  <p>Standard paragraph</p>
  <div style="color: var(--terracotta);">Custom styling</div>
`
```

### Custom Styling

Leverage CSS classes from `emailConfig.ts`:

- `.badge` - Base badge styling
- `.badge-success` - Gold background
- `.badge-featured` - Terracotta background
- `.section` - Highlighted section with left border
- `.section-title` - Section heading
- `.cta-button` - Call-to-action button
- `.divider` - Visual divider line
- `.accent-text` - Terracotta colored text

---

## Color Reference

All colors align with the application's HSL-based design system:

| Color | Hex | Usage |
|-------|-----|-------|
| Charcoal | #1C1C1E | Headers, text |
| Charcoal Light | #2C2C2E | Hover states |
| Terracotta | #E07B54 | CTAs, primary accent |
| Gold | #C8A84B | Badges, secondary accent |
| White | #FFFFFF | Content background |
| Cream | #FCF9F2 | Outer background |
| Light Gray | #F9F9F9 | Section backgrounds |
| Dark Gray | #666666 | Secondary text |
| Body Text | #333333 | Primary text |

---

## Testing Emails

### Local Testing

1. Check email HTML in browser dev tools
2. Test responsive design at 600px breakpoint
3. Verify all links point to correct URLs
4. Test with email clients (Gmail, Outlook, Apple Mail)

### Pre-Send Checklist

- [ ] Template has `headerTitle` and `mainContent`
- [ ] CTAs point to correct URLs with `${appUrl}`
- [ ] Content uses helper functions (`paragraph`, `section`, `badge`)
- [ ] Color scheme matches design system
- [ ] Subject line is clear and concise
- [ ] All variables are properly interpolated
- [ ] Mobile responsiveness verified

---

## Migration from Old System

All email functions in `src/lib/notifications.ts` have been migrated to use the new template system. The old hardcoded HTML has been removed.

**Key changes**:
- Email functions now call template builders
- Templates return structured data (`EmailTemplate` interface)
- Template engine handles HTML rendering
- Styles are centralized in `emailConfig.ts`
- Maintainability improved through modular templates

---

## Future Enhancements

Possible improvements to consider:

1. **Email Preview Component**: React component that renders email HTML for preview
2. **Template Variants**: Support for different template layouts (minimal, detailed, etc.)
3. **Dynamic Styling**: CSS variables for easier color overrides
4. **A/B Testing**: Support for template variants
5. **Localization**: Multi-language template support
6. **Unsubscribe Links**: Standardized footer with preferences link

---

## Resources

- [Resend Email API](https://resend.com/docs) - Email delivery service
- [MJML](https://mjml.io/) - Email template framework (alternative)
- [Email on Acid](https://www.emailonacid.com/) - Email testing
- Design System: See [CLAUDE.md](../CLAUDE.md#design-system)

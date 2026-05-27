/**
 * Registration Created Email Template
 *
 * Sent when a new registration is created and payment is pending.
 * Includes confirmation of submission queue and grading process overview.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, section } from "../emailTemplateEngine";

export function buildRegistrationCreatedTemplate(
  title: string,
  body: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "✨ Registration Created",
      headerSubtitle: "Your submission has been successfully registered",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(body)}
        ${section(
          "What's Next?",
          `
          <p>Your child's submission video is now queued for double-blind grading by our expert panel of judges.</p>
          <p>We'll notify you as soon as the evaluation is complete and results are published.</p>
          `
        )}
      `,
      ctaButton: {
        text: "View Registration",
        url: `${appUrl}/parent/dashboard`,
      },
    },
  };
}

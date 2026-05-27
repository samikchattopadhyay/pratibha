/**
 * Registration Verified Email Template
 *
 * Sent when a registration is verified (payment + submission validated).
 * Confirms evaluation has begun.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, section } from "../emailTemplateEngine";

export function buildRegistrationVerifiedTemplate(
  title: string,
  body: string,
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
          "Evaluation in Progress",
          `
          <p>Your child's submission is now under formal evaluation by our expert judges panel.</p>
          <p>The evaluation process involves careful review and scoring by multiple judges using our standardized rubric.</p>
          <p>Results will be announced shortly. We'll notify you as soon as evaluation is complete.</p>
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

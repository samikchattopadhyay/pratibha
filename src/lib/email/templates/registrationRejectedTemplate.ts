/**
 * Registration Rejected Email Template
 *
 * Sent when a registration is rejected.
 * Provides status update and directs to dashboard for details.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, section } from "../emailTemplateEngine";

export function buildRegistrationRejectedTemplate(
  title: string,
  body: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "Registration Update",
      headerSubtitle: "We've updated your registration status",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(body)}
        ${section(
          "Next Steps",
          `
          <p>Please visit your dashboard to view full details about this decision.</p>
          <p>If you have any questions or would like clarification, our support team is here to help.</p>
          `
        )}
      `,
      ctaButton: {
        text: "View Details",
        url: `${appUrl}/account/dashboard`,
      },
    },
  };
}

/**
 * Qualification Offered Email Template
 *
 * Sent when a participant is offered advancement to next competition round.
 * Emphasizes opportunity and includes acceptance call-to-action.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, badge, section } from "../emailTemplateEngine";

export function buildQualificationOfferedTemplate(
  title: string,
  body: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "🌟 Qualification Offer",
      headerSubtitle: "Advancement opportunity",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(body)}
        ${badge("Qualified for Next Round", "featured")}
        ${section(
          "Next Level Competition",
          `
          <p>Your child has been selected to participate in the next level of competition!</p>
          <p>This is a recognition of their exceptional performance and talent.</p>
          <p>Please review and accept this qualification offer before the expiry date to confirm participation.</p>
          `
        )}
      `,
      ctaButton: {
        text: "Accept Offer",
        url: `${appUrl}/parent/dashboard`,
      },
    },
  };
}

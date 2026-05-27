/**
 * Results Published Email Template
 *
 * Sent when evaluation results are published.
 * Highlights award/outcome and directs to certificate view.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, badge, section } from "../emailTemplateEngine";

export function buildResultsPublishedTemplate(
  title: string,
  body: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "🎉 Results Published!",
      headerSubtitle: "Evaluation complete",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${badge(body, "featured")}
        ${section(
          "Award Details",
          `
          <p>Congratulations! Your submission has been evaluated by our expert panel of judges.</p>
          <p>Your achievement reflects outstanding talent and dedication.</p>
          <p>View your complete results, award details, and verified digital certificate on your dashboard.</p>
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

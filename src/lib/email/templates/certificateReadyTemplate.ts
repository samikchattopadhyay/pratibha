/**
 * Certificate Ready Email Template
 *
 * Sent when a digital certificate is ready for download.
 * Emphasizes certificate availability and verification.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, section } from "../emailTemplateEngine";

export function buildCertificateReadyTemplate(
  title: string,
  body: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "📜 Certificate Ready",
      headerSubtitle: "Your digital certificate is ready",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(body)}
        ${section(
          "Certificate Details",
          `
          <p>Your verified digital certificate is now ready to download and share.</p>
          <p>This certificate includes verification details and can be shared professionally.</p>
          <p>You can access it anytime from your dashboard and download it in multiple formats.</p>
          `
        )}
      `,
      ctaButton: {
        text: "Download Certificate",
        url: `${appUrl}/account/dashboard`,
      },
    },
  };
}

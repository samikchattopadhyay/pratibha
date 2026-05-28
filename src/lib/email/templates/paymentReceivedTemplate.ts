/**
 * Payment Received Email Template
 *
 * Sent when payment for a registration is verified and confirmed.
 * Emphasizes successful payment and queuing for evaluation.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, badge, section } from "../emailTemplateEngine";

export function buildPaymentReceivedTemplate(
  title: string,
  body: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: title,
    data: {
      headerTitle: "✓ Payment Verified",
      headerSubtitle: "Your registration is now complete",
      mainContent: `
        ${paragraph(`<strong>${title}</strong>`)}
        ${paragraph(body)}
        ${badge("Payment Confirmed ✓", "success")}
        ${section(
          "Registration Complete",
          `
          <p>Your registration payment has been successfully processed and verified.</p>
          <p>Your submission has been queued for evaluation by our expert judges.</p>
          <p>You can track the status of your submission from your dashboard at any time.</p>
          `
        )}
      `,
      ctaButton: {
        text: "View Dashboard",
        url: `${appUrl}/account/dashboard`,
      },
    },
  };
}

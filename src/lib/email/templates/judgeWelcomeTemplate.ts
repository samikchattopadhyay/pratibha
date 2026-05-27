/**
 * Judge Welcome Email Template
 *
 * Sent when a new judge account is created by the administrator.
 * Contains a secure password setup link for account activation.
 */

import { EmailTemplate } from "../emailTemplateEngine";
import { paragraph, section } from "../emailTemplateEngine";

export function buildJudgeWelcomeTemplate(
  judgeName: string,
  email: string,
  setupUrl: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: "Welcome to Pratibha Parishad - Your Judge Account is Ready",
    data: {
      headerTitle: "⚖️ Welcome to Jury Panel",
      headerSubtitle: "Your judge account has been successfully created",
      mainContent: `
        ${paragraph(`Dear ${judgeName},`)}
        ${paragraph(
          "We are pleased to welcome you to the expert jury panel of Pratibha Parishad talent competitions. Your account has been created and is waiting for you to set your password."
        )}

        ${section(
          "Complete Your Account Setup",
          `
          <p style="color: #666; margin-bottom: 16px; font-size: 14px;">Click the button below to create your secure password. This link will expire in 48 hours.</p>
          <p style="background-color: #FFF8E7; border-left: 4px solid #C8A84B; padding: 12px; border-radius: 4px; font-size: 13px; color: #8B6914; margin: 16px 0;">
            <strong>🔒 Secure:</strong> We never store or display plain-text passwords. You'll create a unique password that only you know.
          </p>
          `
        )}

        ${section(
          "Your First Steps",
          `
          <ol style="margin: 0; padding-left: 20px; color: #333; font-size: 14px; line-height: 1.8;">
            <li style="margin-bottom: 8px;">Click the <strong>Set Your Password</strong> button below</li>
            <li style="margin-bottom: 8px;">Create a strong password (minimum 12 characters recommended)</li>
            <li style="margin-bottom: 8px;">Log in with your email and new password</li>
            <li style="margin-bottom: 0;">Start reviewing submissions and scoring entries</li>
          </ol>
          `
        )}

        ${section(
          "Password Recommendations",
          `
          <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 14px; line-height: 1.8;">
            <li style="margin-bottom: 8px;"><strong>Use a unique password</strong> — Create something different from other accounts</li>
            <li style="margin-bottom: 8px;"><strong>Mix character types</strong> — Uppercase, lowercase, numbers, and symbols</li>
            <li style="margin-bottom: 8px;"><strong>Use a passphrase</strong> — Easier to remember than random characters</li>
            <li style="margin-bottom: 0;"><strong>Save securely</strong> — Use a password manager like 1Password, Bitwarden, or LastPass</li>
          </ul>
          `
        )}

        ${section(
          "As a Jury Panelist, You Can",
          `
          <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 14px; line-height: 1.8;">
            <li style="margin-bottom: 8px;">Access your personalized evaluation queue</li>
            <li style="margin-bottom: 8px;">Review contest entries and participant information</li>
            <li style="margin-bottom: 8px;">Score submissions using standardized rubrics</li>
            <li style="margin-bottom: 8px;">Track your earnings and payment history</li>
            <li style="margin-bottom: 0;">Manage your profile and availability status</li>
          </ul>
          `
        )}
      `,
      ctaButton: {
        text: "Set Your Password",
        url: setupUrl,
      },
      footerMessage: `<p style="margin: 0 0 8px 0;">Have questions? Contact us at support@pratibha.org</p>
        <p style="margin: 0; font-size: 12px; color: #999;">Pratibha Parishad Team</p>`,
    },
  };
}

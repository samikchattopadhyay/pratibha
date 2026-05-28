import { EmailTemplate, paragraph, section } from "../emailTemplateEngine";

export function buildPasswordResetTemplate(
  resetUrl: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: "Reset Your Pratibha Parishad Password",
    data: {
      headerTitle: "🔐 Password Reset",
      headerSubtitle: "Someone requested a password reset for your account",
      mainContent: `
        ${paragraph("We received a request to reset your password. Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.")}
        ${section(
          "Security Notice",
          `
          <p>If you did not request this reset, please ignore this email — your account remains secure.</p>
          <p>Do not share this link with anyone.</p>
          `
        )}
      `,
      ctaButton: {
        text: "Reset My Password",
        url: resetUrl,
      },
      footerMessage: "This link expires in 1 hour.<br/>Pratibha Parishad Team",
    },
  };
}

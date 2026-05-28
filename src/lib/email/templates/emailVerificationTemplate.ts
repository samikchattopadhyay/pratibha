import { EmailTemplate, paragraph, section } from "../emailTemplateEngine";

export function buildEmailVerificationTemplate(
  name: string,
  verificationUrl: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: "Verify Your Email - Pratibha Parishad",
    data: {
      headerTitle: "✉️ Email Verification",
      headerSubtitle: "Complete your registration",
      mainContent: `
        ${paragraph(`Hi ${name},`)}
        ${paragraph("Thank you for registering with Pratibha Parishad! To complete your registration and access your account, please verify your email address.")}
        ${section(
          "How to verify",
          `
          <p>Click the button below to verify your email. This link is valid for <strong>24 hours</strong>.</p>
          `
        )}
      `,
      ctaButton: {
        text: "Verify Email Address",
        url: verificationUrl,
      },
      footerMessage: "This link expires in 24 hours.<br/>If you didn't create this account, you can ignore this email.",
    },
  };
}

export function buildEmailVerificationSuccessTemplate(
  name: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: "Email Verified - Welcome to Pratibha Parishad!",
    data: {
      headerTitle: "🎉 Email Verified!",
      headerSubtitle: "Your account is now active",
      mainContent: `
        ${paragraph(`Hi ${name},`)}
        ${paragraph("Great news! Your email address has been verified successfully.")}
        ${paragraph("You can now log in to your account and start registering your students for competitions.")}
      `,
      ctaButton: {
        text: "Go to Login",
        url: `${appUrl}/login`,
      },
      footerMessage: "Welcome to Pratibha Parishad!",
    },
  };
}

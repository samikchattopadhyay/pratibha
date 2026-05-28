import { EmailTemplate, paragraph, section } from "../emailTemplateEngine";

export function buildAccountWelcomeTemplate(
  parentName: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: "Welcome to Pratibha Parishad! 🎉 Your Account is Ready",
    data: {
      headerTitle: "👋 Welcome to Pratibha Parishad",
      headerSubtitle: "Your journey to showcase your child's talent starts here",
      mainContent: `
        ${paragraph(`Hello <strong>${parentName}</strong>,`)}
        ${paragraph(
          "Your parent account has been successfully created. You're now ready to register your child for competitions and unlock their potential in Indian fine arts."
        )}
        ${section(
          "Next Steps: Get Started in 3 Easy Steps",
          `
          <p><strong>1. Add Your Child's Profile</strong> (2 minutes)<br/>
          Enter your child's name, age, and category of interest (Singing, Dance, Drawing, etc.)</p>

          <p><strong>2. Choose & Submit Performance</strong> (5 minutes)<br/>
          Upload your child's video from Facebook and select the competition category</p>

          <p><strong>3. Complete Registration & Pay</strong> (2 minutes)<br/>
          Pay the ₹50 entry fee securely using Razorpay and you're done!</p>
          `
        )}
        ${section(
          "Why Participate?",
          `
          <ul style="margin-left: 16px; padding: 0;">
            <li style="margin: 8px 0;">✓ <strong>Verified Digital Certificates</strong> with unique QR codes</li>
            <li style="margin: 8px 0;">✓ <strong>Global Recognition</strong> for authentic talent</li>
            <li style="margin: 8px 0;">✓ <strong>Expert Jury Evaluation</strong> by accomplished artists</li>
            <li style="margin: 8px 0;">✓ <strong>Instant Results</strong> with transparent scoring</li>
          </ul>
          `
        )}
        ${paragraph(
          "Any questions? Our support team is here to help. Reply to this email or visit our <strong>FAQ section</strong> in your dashboard."
        )}
      `,
      ctaButton: {
        text: "Start Registering Your Child",
        url: `${appUrl}/account/dashboard`,
      },
      footerMessage: `Questions about competitions? Check our <a href="${appUrl}/faq">FAQ</a> or <a href="${appUrl}/contact">contact us</a>.<br/>Pratibha Parishad Team`,
    },
  };
}

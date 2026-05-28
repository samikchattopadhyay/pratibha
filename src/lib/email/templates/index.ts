/**
 * Email Templates Index
 *
 * Central export point for all email templates.
 * Each template is a function that returns an EmailTemplate object
 * with subject and pre-rendered HTML content.
 */

export { buildRegistrationCreatedTemplate } from "./registrationCreatedTemplate";
export { buildPaymentReceivedTemplate } from "./paymentReceivedTemplate";
export { buildRegistrationVerifiedTemplate } from "./registrationVerifiedTemplate";
export { buildRegistrationRejectedTemplate } from "./registrationRejectedTemplate";
export { buildResultsPublishedTemplate } from "./resultsPublishedTemplate";
export { buildCertificateReadyTemplate } from "./certificateReadyTemplate";
export { buildQualificationOfferedTemplate } from "./qualificationOfferedTemplate";
export { buildJudgeWelcomeTemplate } from "./judgeWelcomeTemplate";
export { buildPasswordResetTemplate } from "./passwordResetTemplate";
export { buildAccountWelcomeTemplate } from "./accountWelcomeTemplate";
export {
  buildEmailVerificationTemplate,
  buildEmailVerificationSuccessTemplate,
} from "./emailVerificationTemplate";

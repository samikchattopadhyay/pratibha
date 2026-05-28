import { Resend } from "resend";
import { DeliveryErrorType, DeliveryStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { renderEmailTemplate } from "@/lib/email/emailTemplateEngine";
import * as emailTemplates from "@/lib/email/templates";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@pratibhaparishad.in";
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramApiUrl = "https://api.telegram.org/bot";

// ─── RETRY & ERROR HANDLING CONSTANTS ──────────────────────────────────────

const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
};

interface TelegramError {
  error_code?: number;
  description?: string;
  parameters?: { retry_after?: number };
}

// ─── ERROR CLASSIFICATION ─────────────────────────────────────────────────────

interface TelegramAPIErrorResponse {
  response?: {
    status?: number;
    data?: TelegramError;
  };
}

function classifyTelegramError(error: TelegramAPIErrorResponse): {
  type: DeliveryErrorType;
  isRetryable: boolean;
  retryAfterSeconds?: number;
} {
  const status = error.response?.status;
  const data: TelegramError = error.response?.data || {};

  // Rate limiting (429 or 400 with retry_after)
  if (status === 429 || (status === 400 && data.parameters?.retry_after)) {
    const retryAfter = data.parameters?.retry_after || 30;
    return {
      type: DeliveryErrorType.RATE_LIMITED,
      isRetryable: true,
      retryAfterSeconds: retryAfter,
    };
  }

  // User blocked or chat not found
  if (status === 403) {
    return {
      type: DeliveryErrorType.USER_BLOCKED,
      isRetryable: false,
    };
  }

  // Invalid chat ID
  if (status === 404 || data.error_code === 400) {
    return {
      type: DeliveryErrorType.INVALID_CHAT,
      isRetryable: false,
    };
  }

  // Bad request (validation error)
  if (status === 400) {
    return {
      type: DeliveryErrorType.BAD_REQUEST,
      isRetryable: false,
    };
  }

  // Server errors or network issues
  if (status === 502 || status === 503 || !status) {
    return {
      type: DeliveryErrorType.NETWORK_ERROR,
      isRetryable: true,
    };
  }

  return {
    type: DeliveryErrorType.UNKNOWN,
    isRetryable: true,
  };
}

// ─── EXPONENTIAL BACKOFF ──────────────────────────────────────────────────────

function calculateBackoffDelay(
  attemptNumber: number,
  retryAfterSeconds?: number
): number {
  if (retryAfterSeconds) {
    return retryAfterSeconds * 1000 + Math.random() * 1000;
  }

  const exponentialDelay = Math.pow(2, attemptNumber - 1) * RETRY_CONFIG.baseDelayMs;
  const cappedDelay = Math.min(exponentialDelay, RETRY_CONFIG.maxDelayMs);
  const jitterDelay = cappedDelay + Math.random() * 1000;

  return jitterDelay;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Core email delivery via Resend.
 */
export async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

/**
 * Email for REGISTRATION_CREATED notification.
 */
export async function sendEmailRegistrationCreated(
  to: string,
  title: string,
  body: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildRegistrationCreatedTemplate(title, body, appUrl);
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

/**
 * Email for PAYMENT_RECEIVED notification.
 */
export async function sendEmailPaymentReceived(
  to: string,
  title: string,
  body: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildPaymentReceivedTemplate(title, body, appUrl);
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

/**
 * Email for REGISTRATION_VERIFIED notification.
 */
export async function sendEmailRegistrationVerified(
  to: string,
  title: string,
  body: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildRegistrationVerifiedTemplate(title, body, appUrl);
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

/**
 * Email for REGISTRATION_REJECTED notification.
 */
export async function sendEmailRegistrationRejected(
  to: string,
  title: string,
  body: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildRegistrationRejectedTemplate(title, body, appUrl);
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

/**
 * Email for RESULTS_PUBLISHED notification.
 */
export async function sendEmailResultsPublished(
  to: string,
  title: string,
  body: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildResultsPublishedTemplate(title, body, appUrl);
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

/**
 * Email for CERTIFICATE_READY notification.
 */
export async function sendEmailCertificateReady(
  to: string,
  title: string,
  body: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildCertificateReadyTemplate(title, body, appUrl);
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

/**
 * Email for QUALIFICATION_OFFERED notification.
 */
export async function sendEmailQualificationOffered(
  to: string,
  title: string,
  body: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildQualificationOfferedTemplate(title, body, appUrl);
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

/**
 * Core Telegram message delivery with retry logic.
 */
export async function sendTelegramViaBotAPI(
  chatId: string,
  message: string
): Promise<{ messageId?: string }> {
  if (!telegramBotToken) {
    console.warn("Telegram bot token not configured, skipping Telegram delivery");
    return {};
  }

  let lastError: unknown;
  let retryAfterSeconds: number | undefined;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      const url = `${telegramApiUrl}${telegramBotToken}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        lastError = {
          response: {
            status: response.status,
            data: data,
          },
        };

        const { type, isRetryable, retryAfterSeconds: retryAfter } =
          classifyTelegramError(lastError as TelegramAPIErrorResponse);

        if (!isRetryable) {
          console.error(
            `Permanent failure for Telegram message to ${chatId} [${type}]:`,
            data
          );
          throw new Error(`Telegram API error [${type}]: ${JSON.stringify(data)}`);
        }

        retryAfterSeconds = retryAfter;

        if (attempt < RETRY_CONFIG.maxAttempts) {
          const delayMs = calculateBackoffDelay(attempt, retryAfterSeconds);
          console.warn(
            `Telegram send attempt ${attempt} failed for ${chatId} [${type}], retrying in ${delayMs}ms`
          );
          await sleep(delayMs);
          continue;
        }

        throw new Error(`Telegram API error [${type}]: ${JSON.stringify(data)}`);
      }

      const messageId = data.result?.message_id;
      return { messageId: messageId?.toString() };
    } catch (error) {
      lastError = error;

      if (attempt < RETRY_CONFIG.maxAttempts) {
        const delayMs = calculateBackoffDelay(attempt, retryAfterSeconds);
        console.warn(
          `Telegram send attempt ${attempt} network error for ${chatId}, retrying in ${delayMs}ms:`,
          error
        );
        await sleep(delayMs);
        continue;
      }
    }
  }

  console.error(`Failed to send Telegram message to ${chatId} after ${RETRY_CONFIG.maxAttempts} attempts:`, lastError);
  throw lastError;
}

/**
 * Send Telegram message and track delivery status in database.
 * Creates TelegramMessageDelivery record and updates on success/failure.
 */
export async function sendTelegramWithTracking(
  notificationId: string,
  chatId: string,
  message: string
): Promise<void> {
  // Create initial delivery record
  let delivery = await prisma.telegramMessageDelivery.create({
    data: {
      notificationId,
      chatId,
      status: DeliveryStatus.QUEUED,
    },
  });

  try {
    // Mark as sending
    delivery = await prisma.telegramMessageDelivery.update({
      where: { id: delivery.id },
      data: {
        status: DeliveryStatus.SENDING,
        lastAttemptAt: new Date(),
      },
    });

    // Attempt to send
    const result = await sendTelegramViaBotAPI(chatId, message);

    // Mark as sent
    await prisma.telegramMessageDelivery.update({
      where: { id: delivery.id },
      data: {
        status: DeliveryStatus.SENT,
        messageId: result.messageId,
        sentAt: new Date(),
      },
    });

    console.log(`Telegram message sent successfully to ${chatId} (messageId: ${result.messageId})`);
  } catch (error: unknown) {
    const err = error as { 
      message?: string; 
      response?: { 
        status?: number; 
        data?: { description?: string }; 
      } 
    };
    const errorObj = {
      response: {
        status: err.response?.status,
        data: err.response?.data,
      },
    };

    const { type, isRetryable, retryAfterSeconds } =
      classifyTelegramError(errorObj as TelegramAPIErrorResponse);

    const failureCount = (delivery.failureCount || 0) + 1;
    const nextRetryAt = isRetryable
      ? new Date(Date.now() + calculateBackoffDelay(failureCount, retryAfterSeconds))
      : null;

    const status = isRetryable
      ? DeliveryStatus.TEMPORARILY_FAILED
      : DeliveryStatus.PERMANENTLY_FAILED;

    await prisma.telegramMessageDelivery.update({
      where: { id: delivery.id },
      data: {
        status,
        errorType: type,
        errorCode: err.response?.status?.toString(),
        errorMessage: err.response?.data?.description || err.message,
        failureCount,
        lastAttemptAt: new Date(),
        nextRetryAt,
      },
    });

    console.error(
      `Telegram delivery failed for ${chatId} [${type}] (attempt ${failureCount}):`,
      err.message
    );

    // Don't throw for temporarily failed, let it retry later
    if (!isRetryable) {
      throw error;
    }
  }
}

/**
 * Typed Telegram notifications per notification type.
 */
export async function sendTelegramRegistrationCreated(
  chatId: string,
  title: string,
  body: string
): Promise<void> {
  const message = `<b>${title}</b>\n\n${body}\n\n📝 Your submission is queued for evaluation.`;
  await sendTelegramViaBotAPI(chatId, message);
}

export async function sendTelegramPaymentReceived(
  chatId: string,
  title: string,
  body: string
): Promise<void> {
  const message = `<b>✓ ${title}</b>\n\n${body}\n\n✅ Payment confirmed, evaluation in progress.`;
  await sendTelegramViaBotAPI(chatId, message);
}

export async function sendTelegramRegistrationVerified(
  chatId: string,
  title: string,
  body: string
): Promise<void> {
  const message = `<b>✓ ${title}</b>\n\n${body}\n\n📊 Results will be announced soon.`;
  await sendTelegramViaBotAPI(chatId, message);
}

export async function sendTelegramRegistrationRejected(
  chatId: string,
  title: string,
  body: string
): Promise<void> {
  const message = `<b>${title}</b>\n\n${body}\n\n📞 Contact support for details.`;
  await sendTelegramViaBotAPI(chatId, message);
}

export async function sendTelegramResultsPublished(
  chatId: string,
  title: string,
  body: string
): Promise<void> {
  const message = `<b>🎉 ${title}</b>\n\n${body}\n\n🏆 View your results in the dashboard.`;
  await sendTelegramViaBotAPI(chatId, message);
}

export async function sendTelegramCertificateReady(
  chatId: string,
  title: string,
  body: string
): Promise<void> {
  const message = `<b>📜 ${title}</b>\n\n${body}\n\n⬇️ Download your certificate now.`;
  await sendTelegramViaBotAPI(chatId, message);
}

export async function sendTelegramQualificationOffered(
  chatId: string,
  title: string,
  body: string
): Promise<void> {
  const message = `<b>🌟 ${title}</b>\n\n${body}\n\n⏰ Accept this offer before it expires.`;
  await sendTelegramViaBotAPI(chatId, message);
}

/**
 * Email for JUDGE_WELCOME notification with password setup link.
 */
export async function sendEmailJudgeWelcome(
  to: string,
  judgeName: string,
  setupUrl: string
): Promise<void> {
  const template = emailTemplates.buildJudgeWelcomeTemplate(judgeName, to, setupUrl, "");
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

/**
 * Email for password reset request.
 */
export async function sendEmailPasswordReset(to: string, resetUrl: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildPasswordResetTemplate(resetUrl, appUrl);
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

/**
 * Email for parent account welcome.
 */
export async function sendParentWelcomeEmail(to: string, parentName: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildParentWelcomeTemplate(parentName, appUrl);
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

/**
 * Email for email verification after registration.
 */
export async function sendEmailVerificationLink(
  to: string,
  parentName: string,
  verificationUrl: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildEmailVerificationTemplate(
    parentName,
    verificationUrl,
    appUrl
  );
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

/**
 * Confirmation email after successful verification.
 */
export async function sendEmailVerificationSuccess(
  to: string,
  parentName: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildEmailVerificationSuccessTemplate(
    parentName,
    appUrl
  );
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

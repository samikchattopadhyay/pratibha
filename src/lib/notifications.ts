import { db } from "@/lib/db/drizzle";
import { telegramMessageDeliveries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { renderEmailTemplate } from "@/lib/email/emailTemplateEngine";
import * as emailTemplates from "@/lib/email/templates";

const brevoApiKey = process.env.BREVO_API_KEY;
const brevoApiUrl = "https://api.brevo.com/v3/smtp/email";

const fromEmail = process.env.FROM_EMAIL || "noreply@pratibhaparishad.in";
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramApiUrl = "https://api.telegram.org/bot";

type DeliveryErrorType = "RATE_LIMITED" | "USER_BLOCKED" | "INVALID_CHAT" | "BAD_REQUEST" | "NETWORK_ERROR" | "UNKNOWN";
type DeliveryStatus = "QUEUED" | "SENDING" | "SENT" | "TEMPORARILY_FAILED" | "PERMANENTLY_FAILED";

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
      type: "RATE_LIMITED" as DeliveryErrorType,
      isRetryable: true,
      retryAfterSeconds: retryAfter,
    };
  }

  // User blocked or chat not found
  if (status === 403) {
    return {
      type: "USER_BLOCKED" as DeliveryErrorType,
      isRetryable: false,
    };
  }

  // Invalid chat ID
  if (status === 404 || data.error_code === 400) {
    return {
      type: "INVALID_CHAT" as DeliveryErrorType,
      isRetryable: false,
    };
  }

  // Bad request (validation error)
  if (status === 400) {
    return {
      type: "BAD_REQUEST" as DeliveryErrorType,
      isRetryable: false,
    };
  }

  // Server errors or network issues
  if (status === 502 || status === 503 || !status) {
    return {
      type: "NETWORK_ERROR" as DeliveryErrorType,
      isRetryable: true,
    };
  }

  return {
    type: "UNKNOWN" as DeliveryErrorType,
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
 * Core email delivery via Brevo.
 */
export async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  if (!brevoApiKey) {
    throw new Error("BREVO_API_KEY environment variable is not set");
  }

  try {
    const response = await fetch(brevoApiUrl, {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
    }
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
  const created = await db.insert(telegramMessageDeliveries).values({
    notificationId,
    chatId,
    status: "QUEUED",
  }).returning();

  let delivery = created[0];

  try {
    // Mark as sending
    const updated = await db
      .update(telegramMessageDeliveries)
      .set({
        status: "SENDING",
        lastAttemptAt: new Date(),
      })
      .where(eq(telegramMessageDeliveries.id, delivery.id))
      .returning();

    delivery = updated[0];

    // Attempt to send
    const result = await sendTelegramViaBotAPI(chatId, message);

    // Mark as sent
    await db
      .update(telegramMessageDeliveries)
      .set({
        status: "SENT",
        messageId: result.messageId,
        sentAt: new Date(),
      })
      .where(eq(telegramMessageDeliveries.id, delivery.id))
      .returning();

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

    const status: DeliveryStatus = isRetryable
      ? "TEMPORARILY_FAILED"
      : "PERMANENTLY_FAILED";

    await db
      .update(telegramMessageDeliveries)
      .set({
        status,
        errorType: type,
        errorCode: err.response?.status?.toString(),
        errorMessage: err.response?.data?.description || err.message,
        failureCount,
        lastAttemptAt: new Date(),
        nextRetryAt,
      })
      .where(eq(telegramMessageDeliveries.id, delivery.id))
      .returning();

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
 * Email for account welcome.
 */
export async function sendAccountWelcomeEmail(to: string, parentName: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildAccountWelcomeTemplate(parentName, appUrl);
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

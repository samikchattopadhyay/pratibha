import prisma from "@/lib/db";
import { NotificationType, NotificationChannel } from "@prisma/client";
import {
  sendEmailRegistrationCreated,
  sendEmailPaymentReceived,
  sendEmailRegistrationVerified,
  sendEmailRegistrationRejected,
  sendEmailResultsPublished,
  sendEmailCertificateReady,
  sendEmailQualificationOffered,
  sendTelegramWithTracking,
} from "@/lib/notifications";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  registrationId?: string;
  assignmentId?: string;
  certificateId?: string;
  qualificationId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
}

/**
 * Creates a notification record in the database and dispatches it to configured channels.
 * External delivery (email, WhatsApp) is fire-and-forget — never blocks the HTTP response.
 */
export async function createAndDispatchNotification(
  input: CreateNotificationInput
): Promise<void> {
  const {
    userId,
    type,
    title,
    body,
    actionUrl,
    registrationId,
    assignmentId,
    certificateId,
    qualificationId,
  } = input;

  // Deduplication: prevent duplicate notifications within 60 seconds
  if (registrationId) {
    const recent = await prisma.notification.findFirst({
      where: {
        userId,
        type,
        registrationId,
        createdAt: {
          gte: new Date(Date.now() - 60_000),
        },
      },
    });
    if (recent) return; // Skip if same notification was created in the last 60 seconds
  }

  // Step 1: Create the in-app notification record (always)
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      actionUrl,
      registrationId,
      assignmentId,
      certificateId,
      qualificationId,
    },
  });

  // Step 2: Dispatch to external channels based on user preferences
  // Fire-and-forget: never await or let external failures block the HTTP response
  dispatchToExternalChannels(userId, type, input, notification.id).catch(
    (error) => {
      console.error(
        `Error dispatching notification ${notification.id} to external channels:`,
        error
      );
    }
  );
}

/**
 * Non-blocking helper to dispatch notifications to external channels.
 * Always called via .catch() pattern so errors don't propagate.
 */
async function dispatchToExternalChannels(
  userId: string,
  type: NotificationType,
  input: CreateNotificationInput,
  notificationId: string
): Promise<void> {
  // Fetch user preferences for email and Telegram channels
  const [emailPref, telegramPref] = await Promise.all([
    prisma.notificationPreference.findUnique({
      where: {
        userId_type_channel: {
          userId,
          type,
          channel: NotificationChannel.EMAIL,
        },
      },
    }),
    prisma.notificationPreference.findUnique({
      where: {
        userId_type_channel: {
          userId,
          type,
          channel: NotificationChannel.TELEGRAM,
        },
      },
    }),
  ]);

  // Default to enabled if no preference exists (opt-out model)
  const emailEnabled = emailPref ? emailPref.enabled : true;
  const telegramEnabled = telegramPref ? telegramPref.enabled : true;

  const { recipientEmail, recipientPhone, title, body } = input;

  // Send email if enabled and email provided
  if (emailEnabled && recipientEmail) {
    sendEmailByType(type, recipientEmail, title, body)
      .catch((err) =>
        console.error(`Email send failed for notification ${notificationId}:`, err)
      );
  }

  // Send Telegram if enabled and chat ID provided with delivery tracking
  if (telegramEnabled && recipientPhone) {
    sendTelegramByType(type, recipientPhone, title, body, notificationId)
      .catch((err) =>
        console.error(`Telegram send failed for notification ${notificationId}:`, err)
      );
  }
}

/**
 * Dispatches email based on notification type.
 * Each type calls the appropriate email function with its typed payload.
 */
async function sendEmailByType(
  type: NotificationType,
  recipientEmail: string,
  title: string,
  body: string
): Promise<void> {
  switch (type) {
    case NotificationType.REGISTRATION_CREATED:
      await sendEmailRegistrationCreated(recipientEmail, title, body);
      break;
    case NotificationType.PAYMENT_RECEIVED:
      await sendEmailPaymentReceived(recipientEmail, title, body);
      break;
    case NotificationType.REGISTRATION_VERIFIED:
      await sendEmailRegistrationVerified(recipientEmail, title, body);
      break;
    case NotificationType.REGISTRATION_REJECTED:
      await sendEmailRegistrationRejected(recipientEmail, title, body);
      break;
    case NotificationType.RESULTS_PUBLISHED:
      await sendEmailResultsPublished(recipientEmail, title, body);
      break;
    case NotificationType.CERTIFICATE_READY:
      await sendEmailCertificateReady(recipientEmail, title, body);
      break;
    case NotificationType.QUALIFICATION_OFFERED:
      await sendEmailQualificationOffered(recipientEmail, title, body);
      break;
    default:
      // For other types, just log (implement as needed)
      console.log(
        `Email dispatch for ${type} to ${recipientEmail} is not yet implemented`
      );
  }
}

/**
 * Constructs formatted Telegram message based on notification type.
 */
function formatTelegramMessage(
  type: NotificationType,
  title: string,
  body: string
): string {
  switch (type) {
    case NotificationType.REGISTRATION_CREATED:
      return `<b>${title}</b>\n\n${body}\n\n📝 Your submission is queued for evaluation.`;
    case NotificationType.PAYMENT_RECEIVED:
      return `<b>✓ ${title}</b>\n\n${body}\n\n✅ Payment confirmed, evaluation in progress.`;
    case NotificationType.REGISTRATION_VERIFIED:
      return `<b>✓ ${title}</b>\n\n${body}\n\n📊 Results will be announced soon.`;
    case NotificationType.REGISTRATION_REJECTED:
      return `<b>${title}</b>\n\n${body}\n\n📞 Contact support for details.`;
    case NotificationType.RESULTS_PUBLISHED:
      return `<b>🎉 ${title}</b>\n\n${body}\n\n🏆 View your results in the dashboard.`;
    case NotificationType.CERTIFICATE_READY:
      return `<b>🎓 ${title}</b>\n\n${body}\n\n🏅 Your certificate is ready for download.`;
    case NotificationType.QUALIFICATION_OFFERED:
      return `<b>🌟 ${title}</b>\n\n${body}\n\n✨ A new opportunity awaits you!`;
    case NotificationType.SCORING_REMINDER:
      return `<b>⏰ ${title}</b>\n\n${body}\n\n📋 Please complete your evaluations.`;
    default:
      return `<b>${title}</b>\n\n${body}`;
  }
}

/**
 * Dispatches Telegram notification with delivery tracking.
 */
async function sendTelegramByType(
  type: NotificationType,
  chatId: string,
  title: string,
  body: string,
  notificationId: string
): Promise<void> {
  const message = formatTelegramMessage(type, title, body);
  await sendTelegramWithTracking(notificationId, chatId, message);
}

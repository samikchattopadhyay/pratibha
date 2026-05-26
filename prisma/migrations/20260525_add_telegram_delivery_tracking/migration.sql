-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('QUEUED', 'SENDING', 'SENT', 'TEMPORARILY_FAILED', 'PERMANENTLY_FAILED');

-- CreateEnum
CREATE TYPE "DeliveryErrorType" AS ENUM ('RATE_LIMITED', 'USER_BLOCKED', 'INVALID_CHAT', 'BAD_REQUEST', 'NETWORK_ERROR', 'UNKNOWN');

-- CreateTable
CREATE TABLE "TelegramMessageDelivery" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" TEXT,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "errorType" "DeliveryErrorType",
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramMessageDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramMessageDelivery_notificationId_key" ON "TelegramMessageDelivery"("notificationId");

-- CreateIndex
CREATE INDEX "TelegramMessageDelivery_status_idx" ON "TelegramMessageDelivery"("status");

-- CreateIndex
CREATE INDEX "TelegramMessageDelivery_status_nextRetryAt_idx" ON "TelegramMessageDelivery"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "TelegramMessageDelivery_chatId_idx" ON "TelegramMessageDelivery"("chatId");

-- CreateIndex
CREATE INDEX "TelegramMessageDelivery_createdAt_idx" ON "TelegramMessageDelivery"("createdAt");

-- AddForeignKey
ALTER TABLE "TelegramMessageDelivery" ADD CONSTRAINT "TelegramMessageDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

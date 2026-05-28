import crypto from "crypto";

const OTP_CODE_LENGTH = parseInt(process.env.OTP_CODE_LENGTH || "6");

export function generateOTP(): string {
  return crypto
    .randomInt(0, Math.pow(10, OTP_CODE_LENGTH))
    .toString()
    .padStart(OTP_CODE_LENGTH, "0");
}

export function generateOTPToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function validatePhoneFormat(phone: string): boolean {
  // Indian phone format validation: +91-XXXXXXXXXX or 91XXXXXXXXXX or XXXXXXXXXX
  const normalizedPhone = normalizePhone(phone);
  const phoneRegex = /^91\d{10}$/;
  return phoneRegex.test(normalizedPhone);
}

export function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // If it has 10 digits, prepend 91
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // If it has 12 digits and starts with 91, return as is
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  return digits;
}

export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.length === 12) {
    return `+${normalized.slice(0, 2)}-${normalized.slice(2)}`;
  }
  return phone;
}

// Mock SMS sending function - in production, use Twilio or AWS SNS
export async function sendOTPSMS(phone: string, otp: string): Promise<boolean> {
  // TODO: Implement actual SMS sending via Twilio/SNS
  console.log(
    `[Mock SMS] Sending OTP ${otp} to ${formatPhoneForDisplay(phone)}`
  );

  // In production:
  // if (process.env.TWILIO_ACCOUNT_SID) {
  //   return await twilio.messages.create({...});
  // }
  // if (process.env.AWS_REGION) {
  //   return await sns.publish({...});
  // }

  return true; // Mock success
}

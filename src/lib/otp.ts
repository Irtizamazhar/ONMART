import { prisma } from "@/lib/db";
import { normalizePhoneToE164 } from "@/lib/phone";

const OTP_EXPIRY_MINUTES = 10;
const RATE_LIMIT_PHONE_MINUTES = 10;
const RATE_LIMIT_IP_MINUTES = 10;
const RATE_LIMIT_PHONE_MAX = 3;
const RATE_LIMIT_IP_MAX = 10;

function generateCode(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}

export async function createAndStoreOtp(phone: string): Promise<{ code: string; expiresAt: Date }> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  const normalizedPhone = normalizePhoneToE164(phone) || phone.trim();
  if (normalizedPhone.length < 12) throw new Error("Invalid phone for OTP storage");
  await prisma.otpVerification.create({
    data: { phone: normalizedPhone, code, expiresAt },
  });
  return { code, expiresAt };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const key = normalizePhoneToE164(phone);
  if (!key || key.length < 12) return false;
  const row = await prisma.otpVerification.findFirst({
    where: { phone: key, code: code.trim() },
    orderBy: { createdAt: "desc" },
  });
  if (!row || row.expiresAt < new Date()) return false;
  return true;
}

function getWindowStart(minutesAgo: number): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d;
}

export async function isWithinRateLimitPhone(phone: string): Promise<boolean> {
  const since = getWindowStart(RATE_LIMIT_PHONE_MINUTES);
  const count = await prisma.otpVerification.count({
    where: { phone, createdAt: { gte: since } },
  });
  return count < RATE_LIMIT_PHONE_MAX;
}

export async function isWithinRateLimitIp(ip: string): Promise<boolean> {
  const since = getWindowStart(RATE_LIMIT_IP_MINUTES);
  const count = await prisma.otpVerification.count({
    where: { createdAt: { gte: since } },
  });
  if (count >= RATE_LIMIT_IP_MAX) return false;
  return true;
}

export function getDevOtpMode(): boolean {
  if (process.env.DEV_OTP_MODE === "true") return true;
  if (process.env.TWILIO_ACCOUNT_SID?.trim()) return false;
  if (process.env.SMS_GATEWAY_URL?.trim()) return false;
  return true;
}

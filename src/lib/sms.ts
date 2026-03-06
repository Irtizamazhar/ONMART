import { createAndStoreOtp, verifyOtp, getDevOtpMode } from "@/lib/otp";

const DEV_OTP_LOG_PREFIX = "[DEV OTP]";

function sendViaCustomSmsGateway(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  const urlTemplate = process.env.SMS_GATEWAY_URL?.trim();
  if (!urlTemplate) return Promise.resolve({ success: false, error: "SMS_GATEWAY_URL not set" });

  const method = (process.env.SMS_GATEWAY_METHOD?.trim() || "GET").toUpperCase();
  const bodyTemplate = process.env.SMS_GATEWAY_BODY?.trim();
  const phoneEnc = encodeURIComponent(phone);
  const codeEnc = encodeURIComponent(code);
  const url = urlTemplate.replace(/\{\{phone\}\}/gi, phoneEnc).replace(/\{\{code\}\}/gi, codeEnc);

  const headers: Record<string, string> = {};
  try {
    if (process.env.SMS_GATEWAY_HEADERS?.trim()) {
      Object.assign(headers, JSON.parse(process.env.SMS_GATEWAY_HEADERS));
    }
  } catch {
    // ignore
  }
  if (bodyTemplate && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  if (method === "POST" && bodyTemplate) {
    const body = bodyTemplate
      .replace(/\{\{phone\}\}/gi, phone)
      .replace(/\{\{code\}\}/gi, code);
    return fetch(url, { method: "POST", headers, body })
      .then((res) => ({ success: res.ok, error: res.ok ? undefined : `Gateway returned ${res.status}` }))
      .catch((e) => ({ success: false, error: e instanceof Error ? e.message : "Gateway request failed" }));
  }

  return fetch(url, { method: method === "POST" ? "POST" : "GET", headers })
    .then((res) => ({ success: res.ok, error: res.ok ? undefined : `Gateway returned ${res.status}` }))
    .catch((e) => ({ success: false, error: e instanceof Error ? e.message : "Gateway request failed" }));
}

export async function sendOtpToPhone(phone: string): Promise<{ success: boolean; error?: string; sentViaSms?: boolean }> {
  const devMode = getDevOtpMode();
  try {
    if (devMode) {
      const { code, expiresAt } = await createAndStoreOtp(phone);
      if (process.env.NODE_ENV !== "production") {
        console.log(`${DEV_OTP_LOG_PREFIX} Phone: ${phone} | OTP: ${code} | Expires: ${expiresAt.toISOString()}`);
      }
      return { success: true, sentViaSms: false };
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
    if (accountSid && authToken && serviceSid) {
      try {
        const twilio = await import("twilio");
        const client = twilio.default(accountSid, authToken);
        const channel = (process.env.TWILIO_VERIFY_CHANNEL?.trim() || "sms").toLowerCase();
        await client.verify.v2.services(serviceSid).verifications.create({
          to: phone,
          channel: channel === "whatsapp" ? "whatsapp" : "sms",
        });
        return { success: true, sentViaSms: true };
      } catch (twilioErr) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`${DEV_OTP_LOG_PREFIX} Twilio failed, falling back to terminal OTP:`, twilioErr instanceof Error ? twilioErr.message : twilioErr);
        }
        const { code, expiresAt } = await createAndStoreOtp(phone);
        if (process.env.NODE_ENV !== "production") {
          console.log(`${DEV_OTP_LOG_PREFIX} Phone: ${phone} | OTP: ${code} | Expires: ${expiresAt.toISOString()}`);
        }
        return { success: true, sentViaSms: false };
      }
    }

    const customUrl = process.env.SMS_GATEWAY_URL?.trim();
    if (customUrl) {
      const { code } = await createAndStoreOtp(phone);
      const result = await sendViaCustomSmsGateway(phone, code);
      if (!result.success) {
        return { success: false, error: result.error || "SMS gateway failed" };
      }
      return { success: true, sentViaSms: true };
    }

    const { code, expiresAt } = await createAndStoreOtp(phone);
    if (process.env.NODE_ENV !== "production") {
      console.log(`${DEV_OTP_LOG_PREFIX} Phone: ${phone} | OTP: ${code} | Expires: ${expiresAt.toISOString()}`);
    }
    return { success: true, sentViaSms: false };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Send failed";
    if (process.env.NODE_ENV === "development") {
      console.error("[OTP send error]", e);
    }
    return { success: false, error: msg };
  }
}

export async function checkOtpRateLimit(phone: string, ip: string): Promise<{ ok: boolean; error?: string }> {
  const { isWithinRateLimitPhone, isWithinRateLimitIp } = await import("@/lib/otp");
  if (!(await isWithinRateLimitPhone(phone))) {
    return { ok: false, error: "Too many OTP requests. Try again in 10 minutes." };
  }
  if (!(await isWithinRateLimitIp(ip))) {
    return { ok: false, error: "Too many requests from your network. Try again later." };
  }
  return { ok: true };
}

export { verifyOtp } from "@/lib/otp";

export async function verifyOtpWithTwilio(phone: string, code: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
  if (!accountSid || !authToken || !serviceSid) return false;
  try {
    const twilio = await import("twilio");
    const client = twilio.default(accountSid, authToken);
    const check = await client.verify.v2.services(serviceSid).verificationChecks.create({
      to: phone,
      code: code.trim(),
    });
    return check.status === "approved";
  } catch {
    return false;
  }
}

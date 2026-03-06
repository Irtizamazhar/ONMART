/**
 * Send vendor approval notification via SMS and email.
 * SMS: Twilio (requires TWILIO_PHONE_NUMBER + TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN).
 * Email: Resend (optional, requires RESEND_API_KEY). Or set VENDOR_APPROVAL_EMAIL_WEBHOOK_URL to POST JSON { to, subject, body }.
 */

const APPROVAL_SMS_EN =
  "Your seller account has been approved. Please login to your account and work with us as a seller. - Onmart";

const APPROVAL_EMAIL_SUBJECT = "Your seller account has been approved - Onmart";

function getLoginUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.VERCEL_URL?.trim();
  const origin = base ? (base.startsWith("http") ? base : `https://${base}`) : "http://localhost:3000";
  return `${origin}/login?returnUrl=${encodeURIComponent("/sell/dashboard")}`;
}

const APPROVAL_EMAIL_BODY_PREFIX = `Your seller account has been approved.

Use the password you set during your application to log in.

Login link: `;
const APPROVAL_EMAIL_BODY_SUFFIX = `

After login, go to "Seller Dashboard" to upload your products.

- Onmart`;

const REJECT_SMS_EN =
  "Your seller application was rejected. Documents are not correct. Please submit correct documents and apply again. - Onmart";

const REJECT_EMAIL_SUBJECT = "Your seller application was rejected - Onmart";
const REJECT_EMAIL_BODY = `Your seller application was rejected.

Documents are not correct. Please submit correct documents and apply again.

- Onmart`;

export async function sendVendorApprovalSms(phone: string): Promise<{ sent: boolean; error?: string }> {
  const from = process.env.TWILIO_PHONE_NUMBER?.trim();
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (from && accountSid && authToken) {
    try {
      const twilio = await import("twilio");
      const client = twilio.default(accountSid, authToken);
      await client.messages.create({
        to: phone,
        from,
        body: APPROVAL_SMS_EN,
      });
      return { sent: true };
    } catch (e) {
      const err = e instanceof Error ? e.message : "SMS failed";
      console.error("[Notify] Vendor approval SMS error:", err);
      return { sent: false, error: err };
    }
  }
  const notifyGatewayUrl = process.env.NOTIFY_SMS_GATEWAY_URL?.trim();
  if (notifyGatewayUrl) {
    try {
      const url = notifyGatewayUrl
        .replace(/\{\{phone\}\}/gi, encodeURIComponent(phone))
        .replace(/\{\{message\}\}/gi, encodeURIComponent(APPROVAL_SMS_EN));
      const res = await fetch(url, { method: "GET" });
      return { sent: res.ok };
    } catch (e) {
      console.error("[Notify] Notify SMS gateway error:", e);
      return { sent: false };
    }
  }
  if (process.env.NODE_ENV === "development") {
    console.log("[Notify] Vendor approval SMS skipped (set TWILIO_PHONE_NUMBER or NOTIFY_SMS_GATEWAY_URL). Phone:", phone);
  }
  return { sent: false };
}

export async function sendVendorApprovalEmail(
  email: string,
  fullName: string
): Promise<{ sent: boolean; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const webhookUrl = process.env.VENDOR_APPROVAL_EMAIL_WEBHOOK_URL?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || "onmart@onmart.com";

  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: APPROVAL_EMAIL_SUBJECT,
          text: `Hello ${fullName || "Seller"},\n\n${APPROVAL_EMAIL_BODY_PREFIX}${getLoginUrl()}${APPROVAL_EMAIL_BODY_SUFFIX}`,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("[Notify] Resend error:", err);
        return { sent: false, error: err };
      }
      return { sent: true };
    } catch (e) {
      const err = e instanceof Error ? e.message : "Email failed";
      console.error("[Notify] Vendor approval email error:", err);
      return { sent: false, error: err };
    }
  }

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: APPROVAL_EMAIL_SUBJECT,
          body: `Hello ${fullName || "Seller"},\n\n${APPROVAL_EMAIL_BODY_PREFIX}${getLoginUrl()}${APPROVAL_EMAIL_BODY_SUFFIX}`,
        }),
      });
      return { sent: res.ok };
    } catch (e) {
      console.error("[Notify] Email webhook error:", e);
      return { sent: false };
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[Notify] Vendor approval email skipped (set RESEND_API_KEY or VENDOR_APPROVAL_EMAIL_WEBHOOK_URL). Email:", email);
  }
  return { sent: false };
}

export async function sendVendorApprovalNotifications(phone: string, email: string, fullName: string): Promise<void> {
  await Promise.all([
    sendVendorApprovalSms(phone),
    sendVendorApprovalEmail(email, fullName),
  ]);
}

export async function sendVendorRejectionSms(phone: string): Promise<{ sent: boolean; error?: string }> {
  const from = process.env.TWILIO_PHONE_NUMBER?.trim();
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (from && accountSid && authToken) {
    try {
      const twilio = await import("twilio");
      const client = twilio.default(accountSid, authToken);
      await client.messages.create({
        to: phone,
        from,
        body: REJECT_SMS_EN,
      });
      return { sent: true };
    } catch (e) {
      const err = e instanceof Error ? e.message : "SMS failed";
      console.error("[Notify] Vendor rejection SMS error:", err);
      return { sent: false, error: err };
    }
  }
  const notifyGatewayUrl = process.env.NOTIFY_SMS_GATEWAY_URL?.trim();
  if (notifyGatewayUrl) {
    try {
      const url = notifyGatewayUrl
        .replace(/\{\{phone\}\}/gi, encodeURIComponent(phone))
        .replace(/\{\{message\}\}/gi, encodeURIComponent(REJECT_SMS_EN));
      const res = await fetch(url, { method: "GET" });
      return { sent: res.ok };
    } catch (e) {
      console.error("[Notify] Notify SMS gateway error:", e);
      return { sent: false };
    }
  }
  if (process.env.NODE_ENV === "development") {
    console.log("[Notify] Vendor rejection SMS skipped. Phone:", phone);
  }
  return { sent: false };
}

export async function sendVendorRejectionEmail(
  email: string,
  fullName: string
): Promise<{ sent: boolean; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const webhookUrl = process.env.VENDOR_APPROVAL_EMAIL_WEBHOOK_URL?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || "onmart@onmart.com";

  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: REJECT_EMAIL_SUBJECT,
          text: `Hello ${fullName || "Applicant"},\n\n${REJECT_EMAIL_BODY}`,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("[Notify] Resend reject error:", err);
        return { sent: false, error: err };
      }
      return { sent: true };
    } catch (e) {
      const err = e instanceof Error ? e.message : "Email failed";
      console.error("[Notify] Vendor rejection email error:", err);
      return { sent: false, error: err };
    }
  }

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: REJECT_EMAIL_SUBJECT,
          body: `Hello ${fullName || "Applicant"},\n\n${REJECT_EMAIL_BODY}`,
        }),
      });
      return { sent: res.ok };
    } catch (e) {
      console.error("[Notify] Email webhook reject error:", e);
      return { sent: false };
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[Notify] Vendor rejection email skipped. Email:", email);
  }
  return { sent: false };
}

export async function sendVendorRejectionNotifications(phone: string, email: string, fullName: string): Promise<void> {
  await Promise.all([
    sendVendorRejectionSms(phone),
    sendVendorRejectionEmail(email, fullName),
  ]);
}

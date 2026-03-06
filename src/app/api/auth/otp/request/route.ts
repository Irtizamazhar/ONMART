import { NextRequest, NextResponse } from "next/server";
import { sendOtpToPhone, checkOtpRateLimit } from "@/lib/sms";
import { prisma } from "@/lib/db";
import { normalizePhoneToE164 } from "@/lib/phone";

export async function POST(request: NextRequest) {
  let body: { phone?: unknown; intent?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body. Send JSON with 'phone' field." }, { status: 400 });
  }

  const normalized = normalizePhoneToE164(body?.phone);
  if (!normalized) {
    return NextResponse.json(
      { error: "Valid phone number required (e.g. +923001234567 or 3001234567)" },
      { status: 400 }
    );
  }

  const intent = body?.intent === "signup" ? "signup" : body?.intent === "seller_apply" ? "seller_apply" : null;
  if (intent === "signup") {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: normalized }, { phone: normalized }] },
    });
    if (existing) {
      return NextResponse.json({ error: "Already exist" }, { status: 400 });
    }
  }
  // seller_apply: no user check; any phone can request OTP

  try {
    await prisma.otpVerification.count();
  } catch (dbErr) {
    const msg = process.env.NODE_ENV === "development" && dbErr instanceof Error ? dbErr.message : "Database not available.";
    if (process.env.NODE_ENV === "development") {
      console.error("[OTP request] Database error:", dbErr);
    }
    return NextResponse.json(
      { error: "Server is not ready. Run: npx prisma db push" },
      { status: 503 }
    );
  }

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
    const rate = await checkOtpRateLimit(normalized, ip);
    if (!rate.ok) {
      return NextResponse.json({ error: rate.error }, { status: 429 });
    }

    const result = await sendOtpToPhone(normalized);
    if (!result.success) {
      const errMsg = process.env.NODE_ENV === "development" ? result.error : "Failed to send OTP.";
      return NextResponse.json({ error: errMsg || "Failed to send OTP" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: result.sentViaSms ? "OTP sent to your number via SMS" : "OTP generated (DEV mode)",
      sentViaSms: result.sentViaSms === true,
    });
  } catch (e) {
    const errMsg = process.env.NODE_ENV === "development" && e instanceof Error ? e.message : "Server error. Please try again.";
    if (process.env.NODE_ENV === "development") {
      console.error("[OTP request error]", e);
    }
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

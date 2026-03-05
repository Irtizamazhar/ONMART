import { NextRequest, NextResponse } from "next/server";
import { verifyOtpWithTwilio, verifyOtp } from "@/lib/sms";
import { prisma } from "@/lib/db";
import { hashPassword, userToJson } from "@/lib/auth";
import { normalizePhoneToE164 } from "@/lib/phone";

export async function POST(request: NextRequest) {
  let body: { phone?: unknown; code?: unknown; name?: unknown; password?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const phone = normalizePhoneToE164(body?.phone);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const passwordRaw = typeof body?.password === "string" ? body.password.trim() : null;
  if (!phone || code.length < 4) {
    return NextResponse.json({ error: "Phone and code required." }, { status: 400 });
  }

  try {
    let valid = false;
    if (process.env.TWILIO_VERIFY_SERVICE_SID?.trim()) {
      try {
        valid = await verifyOtpWithTwilio(phone, code);
      } catch (_) {
        // Twilio API error or network – fall back to DB verification
      }
    }
    if (!valid) {
      valid = await verifyOtp(phone, code);
    }
    if (!valid) {
      const msg =
        process.env.NODE_ENV === "development"
          ? "Invalid or expired code. (DEV: use the code shown in the server terminal.)"
          : "Invalid or expired code.";
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    const name = typeof body?.name === "string" ? body.name.trim() : null;
    const usePassword = passwordRaw && passwordRaw.length >= 4 ? passwordRaw : null;
    let user = await prisma.user.findFirst({
      where: { OR: [{ email: phone }, { phone }] },
    });
    if (!user) {
      try {
        const passwordHash = usePassword
          ? await hashPassword(usePassword)
          : await hashPassword("phone-otp-" + Date.now());
        user = await prisma.user.create({
          data: {
            email: phone,
            passwordHash,
            name: name || null,
            phone,
            isAdmin: false,
          },
        });
      } catch (createErr: unknown) {
        const isPrismaConflict = typeof createErr === "object" && createErr !== null && "code" in createErr && (createErr as { code: string }).code === "P2002";
        if (isPrismaConflict) {
          user = await prisma.user.findFirst({
            where: { OR: [{ email: phone }, { phone }] },
          });
          if (user && usePassword) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { passwordHash: await hashPassword(usePassword), ...(name ? { name } : {}) },
            });
          }
        }
        if (!user) throw createErr;
      }
    } else {
      if (usePassword) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: await hashPassword(usePassword), ...(name ? { name } : {}) },
        });
      } else if (name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name },
        });
      }
    }
    return NextResponse.json({ user: userToJson(user) });
  } catch (e) {
    console.error("OTP verify error:", e);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}

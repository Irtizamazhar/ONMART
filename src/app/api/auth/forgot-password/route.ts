import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

const TOKEN_EXPIRY_MINUTES = 60;
const DEV_BASE_URL = "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emailRaw = body?.email != null ? String(body.email).trim() : "";
    const email = emailRaw.toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { email: emailRaw },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { ok: true, message: "If an account exists with this email, you will receive a reset link." },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || DEV_BASE_URL}/reset-password?token=${token}`;
    if (process.env.NODE_ENV === "development") {
      console.log("[Forgot password] Reset link for", user.email, ":", resetLink);
    }

    const res: { ok: boolean; message: string; resetLink?: string } = {
      ok: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    };
    if (process.env.NODE_ENV === "development") {
      res.resetLink = resetLink;
    }

    return NextResponse.json(res);
  } catch (e) {
    console.error("Forgot password error:", e);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

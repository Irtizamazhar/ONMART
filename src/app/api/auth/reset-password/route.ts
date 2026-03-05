import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body?.token != null ? String(body.token).trim() : "";
    const newPassword = body?.newPassword != null ? String(body.newPassword) : "";

    if (!token) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters." }, { status: 400 });
    }

    const row = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!row || row.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset link. Request a new one." }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.updateMany({
      where: { email: row.email },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.delete({ where: { id: row.id } });

    return NextResponse.json({ ok: true, message: "Password updated. You can log in now." });
  } catch (e) {
    console.error("Reset password error:", e);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, userToJson } from "@/lib/auth";
import { normalizePhoneToE164 } from "@/lib/phone";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Email/phone and password required" }, { status: 400 });
    }
    const raw = email.trim();
    let user = null;
    if (raw.includes("@")) {
      user = await prisma.user.findUnique({ where: { email: raw.toLowerCase() } });
    } else {
      const phoneE164 = normalizePhoneToE164(raw);
      if (phoneE164) {
        user = await prisma.user.findFirst({
          where: { OR: [{ email: phoneE164 }, { phone: phoneE164 }] },
        });
      }
    }
    if (!user) {
      return NextResponse.json({ error: "Invalid email/phone or password" }, { status: 401 });
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email/phone or password" }, { status: 401 });
    }
    return NextResponse.json({ user: userToJson(user) });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

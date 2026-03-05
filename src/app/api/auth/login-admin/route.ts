import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, adminToJson } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const trimmedEmail = email.trim().toLowerCase();

    const admin = await prisma.admin.findUnique({ where: { email: trimmedEmail } });
    if (!admin) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }
    const ok = await verifyPassword(password, admin.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }
    return NextResponse.json({ user: adminToJson(admin) });
  } catch (e) {
    console.error("Admin login error:", e);
    const rawMsg = e instanceof Error ? e.message : "Login failed";
    // Don't expose internal Prisma details; show helpful message for DB auth errors
    const isDbAuthError = /database|credentials|authentication failed/i.test(rawMsg);
    const msg = isDbAuthError
      ? "Database connection failed. Check .env DATABASE_URL (correct MySQL user & password) and that MySQL is running."
      : process.env.NODE_ENV === "development"
        ? rawMsg
        : "Login failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

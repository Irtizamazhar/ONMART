import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, userToJson } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        passwordHash,
        name: typeof name === "string" && name.trim() ? name.trim() : null,
        isAdmin: false,
      },
    });
    return NextResponse.json({ user: userToJson(user) });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

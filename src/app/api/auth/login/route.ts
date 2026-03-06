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
    const emailLower = raw.includes("@") ? raw.toLowerCase() : null;
    let user = null;

    if (raw.includes("@") && emailLower) {
      // 1) Vendor credentials are stored separately in VendorApplication — check approved vendor first
      const approvedVendor = await prisma.vendorApplication.findFirst({
        where: { email: emailLower, status: "approved" },
      });
      if (approvedVendor?.passwordHash?.trim()) {
        const match = await verifyPassword(password, approvedVendor.passwordHash.trim());
        if (match) {
          const fullName = approvedVendor.fullName?.trim() || "Seller";
          const phoneVal = approvedVendor.phone?.trim() || null;
          try {
            await prisma.user.upsert({
              where: { email: emailLower },
              create: {
                email: emailLower,
                passwordHash: approvedVendor.passwordHash.trim(),
                name: fullName,
                ...(phoneVal ? { phone: phoneVal } : {}),
                isSeller: true,
                isAdmin: false,
              },
              update: {
                passwordHash: approvedVendor.passwordHash.trim(),
                name: fullName,
                ...(phoneVal !== null ? { phone: phoneVal } : {}),
                isSeller: true,
              },
            });
            user = await prisma.user.findUnique({ where: { email: emailLower } });
          } catch (e) {
            console.error("[Login] Sync seller User from VendorApplication:", e);
          }
        } else {
          return NextResponse.json(
            { error: "Wrong password. Use the same password you set during seller application." },
            { status: 401 }
          );
        }
      }

      // 2) If not an approved vendor (or no match above), use normal User table (customer / already-synced seller)
      if (!user) {
        const pendingVendor = await prisma.vendorApplication.findFirst({
          where: { email: emailLower, status: "pending" },
        });
        if (pendingVendor) {
          return NextResponse.json(
            { error: "Your seller application is still pending approval. You can login after admin approves." },
            { status: 401 }
          );
        }
        if (approvedVendor && !approvedVendor.passwordHash?.trim()) {
          return NextResponse.json(
            { error: "Your account was approved but password is missing. Please contact support." },
            { status: 401 }
          );
        }

        user = await prisma.user.findUnique({ where: { email: emailLower } });
      }
    } else {
      const phoneE164 = normalizePhoneToE164(raw);
      if (phoneE164) {
        user = await prisma.user.findFirst({
          where: { OR: [{ email: phoneE164 }, { phone: phoneE164 }] },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. For seller login use the same email and password you set during application (after approval)." },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Wrong password. Use the exact password you set during signup or seller application." },
        { status: 401 }
      );
    }
    return NextResponse.json({ user: userToJson(user) });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

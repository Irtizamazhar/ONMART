import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, userToJson } from "@/lib/auth";
import { normalizePhoneToE164 } from "@/lib/phone";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email != null ? String(body.email).trim() : "";
    const name = body?.name != null ? String(body.name).trim() : null;
    const currentPassword = body?.currentPassword != null ? String(body.currentPassword) : "";
    const newPhoneRaw = body?.phone != null ? String(body.phone).trim() : null;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    let user = null;
    if (email.includes("@")) {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    } else {
      const phoneE164 = normalizePhoneToE164(email);
      if (phoneE164) {
        user = await prisma.user.findFirst({
          where: { OR: [{ email: phoneE164 }, { phone: phoneE164 }] },
        });
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.email.startsWith("+")) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password required to update profile" }, { status: 400 });
      }
      const ok = await verifyPassword(currentPassword, user.passwordHash);
      if (!ok) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      }
    }

    const isPhoneUser = user.email.startsWith("+") || (user.phone != null && user.phone === user.email);
    let phoneTrim: string | null = null;
    if (newPhoneRaw && isPhoneUser) {
      phoneTrim = normalizePhoneToE164(newPhoneRaw);
      if (!phoneTrim) {
        return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
      }
      if (phoneTrim !== user.email) {
        const existing = await prisma.user.findFirst({
          where: {
            OR: [{ email: phoneTrim }, { phone: phoneTrim }],
            id: { not: user.id },
          },
        });
        if (existing) {
          return NextResponse.json({ error: "Already exist" }, { status: 400 });
        }
      }
    }

    const updateData: { name?: string | null; email?: string; phone?: string } = {};
    if (name !== undefined) updateData.name = name || null;
    if (phoneTrim !== undefined && phoneTrim !== null) {
      updateData.email = phoneTrim;
      updateData.phone = phoneTrim;
    }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({ user: userToJson(updated) });
  } catch (e) {
    console.error("Profile update error:", e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

/** GET ?email=... — check if email is already used (vendor application or user). */
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");
    const emailTrim = typeof email === "string" ? email.trim() : "";
    if (!emailTrim) return NextResponse.json({ used: false });
    const emailLower = emailTrim.toLowerCase();
    const [apps, existingUser] = await Promise.all([
      prisma.vendorApplication.findMany({
        where: { status: { in: ["pending", "approved"] } },
        select: { email: true },
      }),
      prisma.user.findUnique({
        where: { email: emailLower },
        select: { id: true },
      }),
    ]);
    if (apps.some((a) => a.email.toLowerCase() === emailLower)) return NextResponse.json({ used: true });
    if (existingUser) return NextResponse.json({ used: true });
    return NextResponse.json({ used: false });
  } catch {
    return NextResponse.json({ used: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: "Full name, email and phone are required." },
        { status: 400 }
      );
    }

    const shopName = typeof body?.shopName === "string" ? body.shopName.trim() || null : null;
    const city = typeof body?.city === "string" ? body.city.trim() || null : null;
    const address = typeof body?.address === "string" ? body.address.trim() || null : null;
    const categories = typeof body?.categories === "string" ? body.categories.trim() || null : null;
    const message = typeof body?.message === "string" ? body.message.trim() || null : null;
    const cnicFront = typeof body?.cnicFront === "string" ? body.cnicFront.trim() || null : null;
    const cnicBack = typeof body?.cnicBack === "string" ? body.cnicBack.trim() || null : null;
    const cnicNumber = typeof body?.cnicNumber === "string" ? body.cnicNumber.trim().replace(/\D/g, "") || null : null;
    const storeImage = typeof body?.storeImage === "string" ? body.storeImage.trim() || null : null;
    const vendorType = body?.vendorType === "cooperative" ? "cooperative" : body?.vendorType === "individual" ? "individual" : null;
    const warehouseImage = typeof body?.warehouseImage === "string" ? body.warehouseImage.trim() || null : null;
    const passwordRaw = typeof body?.password === "string" ? body.password.trim() : "";
    if (!passwordRaw || passwordRaw.length < 6) {
      return NextResponse.json(
        { error: "Password is required and must be at least 6 characters." },
        { status: 400 }
      );
    }
    const passwordHash = await hashPassword(passwordRaw);

    const vendorApp = prisma.vendorApplication;
    if (!vendorApp) {
      const msg =
        process.env.NODE_ENV === "development"
          ? "Database client not ready. Stop the dev server, run: npx prisma generate, then restart."
          : "Server setup incomplete. Please try again later.";
      console.error("[Seller Apply] Prisma client missing vendorApplication. Run: npx prisma generate (with dev server stopped), then restart.");
      return NextResponse.json({ error: msg }, { status: 503 });
    }

    if (cnicNumber && cnicNumber.length >= 10) {
      const existing = await vendorApp.findFirst({
        where: { cnicNumber: cnicNumber.slice(0, 20) },
      });
      if (existing) {
        return NextResponse.json(
          { error: "This CNIC is already registered with another application." },
          { status: 400 }
        );
      }
    }

    const emailLower = email.toLowerCase();
    const existingByEmail = await vendorApp.findFirst({
      where: {
        email: emailLower,
        status: { in: ["pending", "approved"] },
      },
    });
    if (existingByEmail) {
      return NextResponse.json(
        { error: "Already used email." },
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    }).catch(() => null);
    if (existingUser) {
      return NextResponse.json(
        { error: "Already used email." },
        { status: 400 }
      );
    }

    await vendorApp.create({
      data: {
        fullName,
        email: emailLower,
        phone,
        shopName,
        city,
        address,
        categories,
        message,
        cnicFront,
        cnicBack,
        cnicNumber: cnicNumber ? cnicNumber.slice(0, 20) : null,
        storeImage,
        vendorType,
        warehouseImage,
        passwordHash,
        status: "pending",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[Seller Apply]", err);
    const message =
      process.env.NODE_ENV === "development"
        ? err.message
        : "Failed to submit application.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

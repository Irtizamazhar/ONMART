import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendVendorApprovalNotifications, sendVendorRejectionNotifications } from "@/lib/notify";

export async function GET() {
  try {
    const list = await prisma.vendorApplication.findMany({
      where: { email: { not: "" } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      list.map((v) => ({
        id: v.id,
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        shopName: v.shopName ?? undefined,
        city: v.city ?? undefined,
        address: v.address ?? undefined,
        categories: v.categories ?? undefined,
        message: v.message ?? undefined,
        cnicFront: v.cnicFront ?? undefined,
        cnicBack: v.cnicBack ?? undefined,
        cnicNumber: v.cnicNumber ?? undefined,
        storeImage: v.storeImage ?? undefined,
        vendorType: v.vendorType ?? undefined,
        warehouseImage: v.warehouseImage ?? undefined,
        status: v.status,
        createdAt: v.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("[Vendor applications]", e);
    return NextResponse.json({ error: "Failed to load applications." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "JSON body with id and status required" }, { status: 400 });
    }
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const status = typeof body.status === "string" ? body.status.trim().toLowerCase() : "";
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    if (status !== "approved" && status !== "rejected" && status !== "pending") {
      return NextResponse.json({ error: "status must be approved, rejected, or pending" }, { status: 400 });
    }

    const existing = await prisma.vendorApplication.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (status === "rejected") {
      const phone = existing.phone;
      const email = existing.email;
      const fullName = existing.fullName;
      try {
        await sendVendorRejectionNotifications(phone, email, fullName ?? "");
      } catch (e) {
        console.error("[Vendor applications] Notify on reject:", e);
      }
      await prisma.vendorApplication.update({
        where: { id },
        data: {
          status: "rejected",
          fullName: "",
          email: "",
          phone: "",
          shopName: null,
          city: null,
          address: null,
          categories: null,
          message: null,
          cnicFront: null,
          cnicBack: null,
          cnicNumber: null,
          storeImage: null,
          warehouseImage: null,
          passwordHash: null,
        },
      });
      return NextResponse.json({ id, status: "rejected" });
    }

    const updated = await prisma.vendorApplication.update({
      where: { id },
      data: { status },
    });
    if (status === "approved") {
      const email = updated.email.trim().toLowerCase();
      const passwordHash = updated.passwordHash?.trim();
      const fullName = updated.fullName?.trim() || "Seller";
      const phoneVal = updated.phone?.trim() || null;
      if (email && passwordHash) {
        try {
          await prisma.user.upsert({
            where: { email },
            create: {
              email,
              passwordHash,
              name: fullName,
              ...(phoneVal ? { phone: phoneVal } : {}),
              isSeller: true,
              isAdmin: false,
            },
            update: {
              passwordHash,
              name: fullName,
              ...(phoneVal !== null ? { phone: phoneVal } : {}),
              isSeller: true,
            },
          });
        } catch (e) {
          console.error("[Vendor applications] Create/update User for seller:", e);
        }
      }
      try {
        await sendVendorApprovalNotifications(updated.phone, updated.email, fullName);
      } catch (e) {
        console.error("[Vendor applications] Notify on approve:", e);
      }
    }
    return NextResponse.json({
      id: updated.id,
      status: updated.status,
    });
  } catch (e) {
    console.error("[Vendor applications PATCH]", e);
    return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  }
}

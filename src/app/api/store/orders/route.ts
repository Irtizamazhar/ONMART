import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const VALID_STATUSES = ["pending", "packing", "dispatched", "delivered", "cancelled"];
const CANCEL_ALLOWED = ["pending"];

function orderToJson(o: {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  area: string | null;
  total: { toNumber(): number };
  status: string;
  createdAt: Date;
  items: { id: string; productId: string; title: string; price: { toNumber(): number }; quantity: number; image: string }[];
}) {
  return {
    id: o.id,
    email: o.email,
    name: o.name ?? undefined,
    phone: o.phone ?? undefined,
    address: o.address ?? undefined,
    city: o.city ?? undefined,
    province: o.province ?? undefined,
    area: o.area ?? undefined,
    total: o.total.toNumber(),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      title: i.title,
      price: i.price.toNumber(),
      quantity: i.quantity,
      image: i.image,
    })),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const includeCancelled = searchParams.get("includeCancelled") === "1";
  const where: { email?: string; status?: { not: string } } = {};
  if (email && email.trim()) {
    where.email = email.trim().toLowerCase();
  } else if (!includeCancelled) {
    where.status = { not: "cancelled" };
  }
  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders.map(orderToJson));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, items, total, phone, address, city, province, area } = body;
    if (!email || typeof email !== "string" || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "email and items required" }, { status: 400 });
    }
    const numTotal = Number(total);
    if (Number.isNaN(numTotal) || numTotal < 0) {
      return NextResponse.json({ error: "Invalid total" }, { status: 400 });
    }
    const order = await prisma.order.create({
      data: {
        email: email.trim().toLowerCase(),
        name: typeof name === "string" && name.trim() ? name.trim() : null,
        phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
        address: typeof address === "string" && address.trim() ? address.trim() : null,
        city: typeof city === "string" && city.trim() ? city.trim() : null,
        province: typeof province === "string" && province.trim() ? province.trim() : null,
        area: typeof area === "string" && area.trim() ? area.trim() : null,
        total: numTotal,
        status: "pending",
        items: {
          create: items.map((i: { id: number | string; title: string; price: number; quantity: number; image: string }) => ({
            productId: String(i.id),
            title: i.title,
            price: Number(i.price),
            quantity: Number(i.quantity) || 1,
            image: typeof i.image === "string" ? i.image : "",
          })),
        },
      },
      include: { items: true },
    });
    return NextResponse.json(orderToJson(order));
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Request body must be JSON with id and status" }, { status: 400 });
    }
    const id = body.id != null ? String(body.id).trim() : "";
    const statusVal = body.status != null ? String(body.status).trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Order id is required" }, { status: 400 });
    }
    if (!statusVal) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }
    const newStatus = statusVal.toLowerCase();
    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json({ error: `Invalid status. Use one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const current = (order.status || "pending").toLowerCase();
    if (newStatus === "cancelled" && !CANCEL_ALLOWED.includes(current)) {
      return NextResponse.json({ error: "Order cannot be cancelled (already shipped/dispatched)" }, { status: 400 });
    }

    // Best Selling: update product soldCount only when order status changes to/from "delivered"
    if (newStatus === "delivered" && current !== "delivered") {
      for (const item of order.items) {
        try {
          await prisma.product.updateMany({
            where: { id: item.productId },
            data: { soldCount: { increment: item.quantity } },
          });
        } catch (soldErr) {
          console.error("soldCount increment failed (run: npx prisma generate)", soldErr);
        }
      }
    } else if (newStatus === "cancelled" && current === "delivered") {
      for (const item of order.items) {
        try {
          await prisma.product.updateMany({
            where: { id: item.productId },
            data: { soldCount: { decrement: item.quantity } },
          });
        } catch (soldErr) {
          console.error("soldCount decrement failed (run: npx prisma generate)", soldErr);
        }
      }
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: newStatus },
      include: { items: true },
    });
    return NextResponse.json(orderToJson(updated));
  } catch (e) {
    console.error("PATCH /api/store/orders error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid request" },
      { status: 400 }
    );
  }
}

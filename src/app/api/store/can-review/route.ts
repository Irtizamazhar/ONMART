import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/store/can-review?productId=xxx&email=xxx
 * Returns { canReview: true } if the user (email) has at least one delivered order
 * that contains this product. Email comparison is case-insensitive.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId")?.trim();
  const email = searchParams.get("email")?.trim()?.toLowerCase();
  if (!productId || !email) {
    return NextResponse.json({ canReview: false });
  }
  const orders = await prisma.order.findMany({
    where: {
      status: "delivered",
      items: { some: { productId } },
    },
    select: { id: true, email: true },
  });
  const canReview = orders.some((o) => (o.email || "").toLowerCase() === email);
  return NextResponse.json({ canReview });
}

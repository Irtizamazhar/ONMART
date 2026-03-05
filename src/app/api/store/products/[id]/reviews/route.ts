import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/store/products/[id]/reviews?email=xxx
 * Returns the current user's review for this product (if any). Used to show "Change your review" and pre-fill form.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim()?.toLowerCase();
  const { id: productId } = await params;
  if (!productId?.trim() || !email) {
    return NextResponse.json({ review: null });
  }
  try {
    const review = await prisma.productReview.findFirst({
      where: { productId: productId.trim(), reviewerEmail: email },
      select: { id: true, author: true, text: true, rating: true, createdAt: true },
    });
    if (!review) return NextResponse.json({ review: null });
    return NextResponse.json({
      review: {
        id: review.id,
        author: review.author,
        text: review.text,
        rating: review.rating,
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ review: null });
  }
}

async function updateProductRating(productId: string) {
  const reviews = await prisma.productReview.findMany({
    where: { productId },
    select: { rating: true },
  });
  const count = reviews.length;
  const sum = reviews.reduce((a, r) => a + r.rating, 0);
  const avg = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
  await prisma.product.update({
    where: { id: productId },
    data: { rating: avg, ratingCount: count },
  });
  return { rating: avg, ratingCount: count };
}
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    if (!productId?.trim()) {
      return NextResponse.json({ error: "Product id required" }, { status: 400 });
    }
    const product = await prisma.product.findUnique({ where: { id: productId.trim() } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body. Send JSON with email, author, rating, and optional text." }, { status: 400 });
    }
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) {
      return NextResponse.json({ error: "Email required to submit review" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: {
        status: "delivered",
        items: { some: { productId: product.id } },
      },
      select: { id: true, email: true },
    });
    const hasDelivered = orders.some((o) => (o.email || "").toLowerCase() === email);
    if (!hasDelivered) {
      return NextResponse.json(
        { error: "You can only review this product after it has been delivered to you." },
        { status: 403 }
      );
    }

    const existingReview = await prisma.productReview.findFirst({
      where: { productId: product.id, reviewerEmail: email },
      select: { id: true, text: true, rating: true },
    }).catch(() => null);
    if (existingReview) {
      return NextResponse.json(
        {
          error: "You have already reviewed this product. Only one review per product is allowed.",
          alreadyReviewed: true,
          review: { text: existingReview.text || "", rating: existingReview.rating },
        },
        { status: 403 }
      );
    }

    const author = typeof body?.author === "string" ? body.author.trim() : "";
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    let rating = typeof body?.rating === "number" ? body.rating : Number(body?.rating);
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    rating = Math.round(rating);
    if (!author) {
      return NextResponse.json({ error: "Author name required" }, { status: 400 });
    }

    try {
      await prisma.productReview.create({
        data: {
          productId: product.id,
          author: author.slice(0, 200),
          reviewerEmail: email,
          text: text || "No comment",
          rating,
        },
      });
    } catch (createErr: unknown) {
      const createMsg = createErr instanceof Error ? createErr.message : "";
      if (/Unknown argument|reviewer_email|reviewerEmail/i.test(createMsg)) {
        await prisma.productReview.create({
          data: {
            productId: product.id,
            author: author.slice(0, 200),
            text: text || "No comment",
            rating,
          },
        });
      } else {
        throw createErr;
      }
    }

    const { rating: avg, ratingCount: count } = await updateProductRating(product.id);
    return NextResponse.json({ ok: true, rating: avg, ratingCount: count });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isSchemaError = /reviewer_email|Unknown column|doesn't exist|column.*not found/i.test(msg);
    console.error("POST product review error:", e);
    if (isSchemaError) {
      return NextResponse.json(
        { error: "Database schema is out of date. Please run: npx prisma db push" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: msg || "Failed to add review" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/store/products/[id]/reviews
 * Body: { email: string, text?: string, rating?: number (1-5) }
 * Updates the current user's existing review for this product. One review per product per user.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    if (!productId?.trim()) {
      return NextResponse.json({ error: "Product id required" }, { status: 400 });
    }
    const product = await prisma.product.findUnique({ where: { id: productId.trim() } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const existing = await prisma.productReview.findFirst({
      where: { productId: product.id, reviewerEmail: email },
    }).catch(() => null);
    if (!existing) {
      return NextResponse.json(
        { error: "You have not reviewed this product yet. Submit a new review instead." },
        { status: 404 }
      );
    }

    const text = body?.text !== undefined ? (typeof body.text === "string" ? body.text.trim() : "") : undefined;
    let rating: number | undefined;
    if (body?.rating !== undefined) {
      const r = typeof body.rating === "number" ? body.rating : Number(body.rating);
      if (Number.isNaN(r) || r < 1 || r > 5) {
        return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
      }
      rating = Math.round(r);
    }

    await prisma.productReview.update({
      where: { id: existing.id },
      data: {
        ...(text !== undefined && { text: text || "No comment" }),
        ...(rating !== undefined && { rating }),
      },
    });

    const { rating: avg, ratingCount: count } = await updateProductRating(product.id);
    return NextResponse.json({ ok: true, rating: avg, ratingCount: count });
  } catch (e) {
    console.error("PATCH product review error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update review" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/store/products/[id]/reviews
 * Body: { email: string, reviewId: string }
 * Deletes the review if it belongs to this user (email). Recalculates product rating.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    if (!productId?.trim()) {
      return NextResponse.json({ error: "Product id required" }, { status: 400 });
    }
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Email and reviewId required" }, { status: 400 });
    }
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const reviewId = typeof body?.reviewId === "string" ? body.reviewId.trim() : "";
    if (!email || !reviewId) {
      return NextResponse.json({ error: "Email and reviewId required" }, { status: 400 });
    }

    const review = await prisma.productReview.findFirst({
      where: { id: reviewId, productId: productId.trim(), reviewerEmail: email },
    }).catch(() => null);
    if (!review) {
      return NextResponse.json({ error: "Review not found or you cannot delete it" }, { status: 404 });
    }

    await prisma.productReview.delete({ where: { id: review.id } });
    await updateProductRating(productId.trim());
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE product review error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete review" },
      { status: 500 }
    );
  }
}

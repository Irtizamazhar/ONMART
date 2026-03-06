import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { translateToAll } from "@/lib/translate";
import { seedFromFakeApi } from "@/lib/seedFromFakeApi";
import { isValidSectionSlug } from "@/data/sections";

async function getHiddenProductIds(): Promise<Set<string>> {
  try {
    const rows = await prisma.$queryRaw<{ id: string }[]>`SELECT id FROM Product WHERE \`hidden\` = 1`;
    return new Set(rows.map((r) => r.id));
  } catch {
    return new Set();
  }
}

/** Merge discount_percent and section_slug from DB into products so admin-set values always show in API response. */
async function mergeDiscountAndSection<T extends { id: string }>(products: T[]): Promise<T[]> {
  if (products.length === 0) return products;
  try {
    const ids = products.map((p) => p.id);
    const placeholders = ids.map(() => "?").join(",");
    const rows = await prisma.$queryRawUnsafe<
      { id: string; discount_percent: number | null; section_slug: string | null }[]
    >(
      `SELECT id, discount_percent, section_slug FROM Product WHERE id IN (${placeholders})`,
      ...ids
    );
    const byId = new Map(rows.map((r) => [r.id, r]));
    return products.map((p) => {
      const raw = byId.get(p.id);
      const out = { ...p } as T & { discountPercent?: number | null; sectionSlug?: string | null };
      if (raw) {
        out.discountPercent = raw.discount_percent;
        out.sectionSlug = raw.section_slug;
      }
      return out;
    });
  } catch {
    return products;
  }
}

function mapProduct(
  p: {
    id: string;
    title: string;
    titleUr?: string | null;
    titleZh?: string | null;
    titleTranslations?: unknown;
    price: { toNumber(): number };
    image: string;
    images: string | null;
    categorySlug: string;
    description: string | null;
    sectionSlug?: string | null;
    rating: { toNumber(): number } | null;
    ratingCount: number;
    soldCount?: number;
    inStock?: boolean;
    reviews?: { id: string; author: string; text: string; rating: number; createdAt: Date; reviewerEmail?: string | null }[];
  },
  viewerEmail?: string | null
) {
  const raw = p.reviews ?? [];
  const byEmail = new Map<string, { id: string; author: string; text: string; rating: number; createdAt: Date; reviewerEmail?: string | null }>();
  for (const r of raw) {
    const key = (r.reviewerEmail ?? "").toLowerCase() || r.id;
    const existing = byEmail.get(key);
    if (!existing || new Date(r.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
      byEmail.set(key, r);
    }
  }
  const reviews = Array.from(byEmail.values()).map((r) => ({
    id: r.id,
    author: r.author,
    text: r.text,
    rating: r.rating,
    createdAt: r.createdAt.toISOString(),
    isMine: !!viewerEmail && (r.reviewerEmail ?? "").toLowerCase() === viewerEmail.toLowerCase(),
  }));
  return {
    id: p.id,
    title: p.title,
    titleUr: p.titleUr ?? undefined,
    titleZh: p.titleZh ?? undefined,
    titleTranslations: (p.titleTranslations as Record<string, string> | null) ?? undefined,
    price: p.price.toNumber(),
    image: p.image,
    images: p.images ? (JSON.parse(p.images) as string[]) : undefined,
    categorySlug: p.categorySlug,
    description: p.description ?? undefined,
    sectionSlug: (p as { sectionSlug?: string | null }).sectionSlug ?? undefined,
    rating: p.rating ? { rate: p.rating.toNumber(), count: p.ratingCount } : undefined,
    soldCount: (p as { soldCount?: number }).soldCount ?? 0,
    inStock: (p as { inStock?: boolean }).inStock ?? true,
    hidden: (p as { hidden?: boolean }).hidden ?? false,
    originalPrice: (p as { originalPrice?: { toNumber(): number } | null }).originalPrice?.toNumber?.() ?? undefined,
    discountPercent: (p as { discountPercent?: number | null }).discountPercent ?? (p as { discount_percent?: number | null }).discount_percent ?? undefined,
    reviews,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const category = searchParams.get("category");
  const section = searchParams.get("section")?.trim() || null;
  const bestSelling = searchParams.get("bestSelling") === "1" || searchParams.get("bestSelling") === "true";
  const includeHidden = searchParams.get("includeHidden") === "1";
  const limitParam = searchParams.get("limit");
  const limit = bestSelling ? Math.min(200, Math.max(1, parseInt(limitParam || "8", 10) || 8)) : undefined;

  if (idParam && idParam.trim()) {
    const viewerEmail = searchParams.get("email")?.trim()?.toLowerCase() || null;
    const single = await prisma.product.findUnique({
      where: { id: idParam.trim() },
      include: { reviews: true },
    });
    if (!single) return NextResponse.json(null, { status: 404 });
    if ((single as { hidden?: boolean }).hidden === true) return NextResponse.json(null, { status: 404 });
    if (!includeHidden) {
      try {
        const [row] = await prisma.$queryRaw<{ hidden: number }[]>`SELECT \`hidden\` FROM Product WHERE id = ${idParam.trim()} LIMIT 1`;
        if (row?.hidden === 1) return NextResponse.json(null, { status: 404 });
      } catch {
        // ignore raw errors
      }
    }
    const [merged] = await mergeDiscountAndSection([single]);
    return NextResponse.json(mapProduct(merged, viewerEmail));
  }

  // If DB has no products, seed from FakeStore API once so user sees the same products as before
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    try {
      await seedFromFakeApi();
    } catch (e) {
      console.error("Auto-seed from fake API failed:", e);
    }
  }

  if (bestSelling) {
    const whereBest: Record<string, unknown> = includeHidden
      ? { soldCount: { gt: 0 } }
      : { hidden: false, soldCount: { gt: 0 } };
    const sellerEmailForBest = searchParams.get("sellerEmail")?.trim()?.toLowerCase();
    if (sellerEmailForBest) {
      const sellerUser = await prisma.user.findUnique({
        where: { email: sellerEmailForBest, isSeller: true },
        select: { id: true },
      }).catch(() => null);
      if (sellerUser) whereBest.vendorId = sellerUser.id;
      else return NextResponse.json([], { status: 200 });
    }
    try {
      const products = await prisma.product.findMany({
        where: whereBest as import("@prisma/client").Prisma.ProductWhereInput,
        include: { reviews: true },
        orderBy: [
          { soldCount: "desc" },
          { createdAt: "desc" },
        ] as import("@prisma/client").Prisma.ProductOrderByWithRelationInput[],
        take: limit,
      });
      const merged = await mergeDiscountAndSection(products);
      return NextResponse.json(merged.map((p) => mapProduct(p)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/Unknown argument|Unknown field.*hidden/i.test(msg) && !includeHidden) {
        const [products, hiddenIds] = await Promise.all([
          prisma.product.findMany({
            where: {},
            include: { reviews: true },
            orderBy: [
              { soldCount: "desc" },
              { createdAt: "desc" },
            ] as import("@prisma/client").Prisma.ProductOrderByWithRelationInput[],
            take: (limit ?? 8) + 50,
          }),
          getHiddenProductIds(),
        ]);
        const filtered = products
          .filter((p) => !hiddenIds.has(p.id))
          .filter((p) => ((p as { soldCount?: number }).soldCount ?? 0) > 0)
          .slice(0, limit ?? 8);
        const merged = await mergeDiscountAndSection(filtered);
        return NextResponse.json(merged.map((p) => mapProduct(p)));
      }
      throw err;
    }
  }

  const where: Record<string, unknown> =
    category && category.trim() ? { categorySlug: category.trim() } : {};
  if (section && isValidSectionSlug(section)) {
    (where as { sectionSlug?: string | null }).sectionSlug = section;
  }
  if (!includeHidden) {
    where.hidden = false;
  }
  const sellerEmail = searchParams.get("sellerEmail")?.trim()?.toLowerCase();
  if (sellerEmail) {
    const sellerUser = await prisma.user.findUnique({
      where: { email: sellerEmail, isSeller: true },
      select: { id: true },
    }).catch(() => null);
    if (sellerUser) (where as { vendorId: string }).vendorId = sellerUser.id;
    else return NextResponse.json([], { status: 200 });
  }
  try {
    const products = await prisma.product.findMany({
      where: where as import("@prisma/client").Prisma.ProductWhereInput,
      include: { reviews: true },
      orderBy: { createdAt: "desc" },
    });
    const merged = await mergeDiscountAndSection(products);
    return NextResponse.json(merged.map((p) => mapProduct(p)));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/Unknown argument|Unknown field.*hidden/i.test(msg) && !includeHidden) {
      const { hidden: _h, ...whereWithoutHidden } = where as { hidden?: boolean };
      const [products, hiddenIds] = await Promise.all([
        prisma.product.findMany({
          where: whereWithoutHidden as import("@prisma/client").Prisma.ProductWhereInput,
          include: { reviews: true },
          orderBy: { createdAt: "desc" },
        }),
        getHiddenProductIds(),
      ]);
      const filtered = products.filter((p) => !hiddenIds.has(p.id));
      const merged = await mergeDiscountAndSection(filtered);
      return NextResponse.json(merged.map((p) => mapProduct(p)));
    }
    throw err;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = body?.title != null ? String(body.title).trim() : "";
    const titleUr = body?.titleUr != null ? String(body.titleUr).trim() : null;
    const titleZh = body?.titleZh != null ? String(body.titleZh).trim() : null;
    const categorySlug = body?.categorySlug != null ? String(body.categorySlug).trim() : "";
    const price = body?.price;
    const image = body?.image;
    const images = body?.images;
    const description = body?.description;
    const sectionSlugBody = body?.sectionSlug != null ? String(body.sectionSlug).trim() || null : null;
    const inStock = body?.inStock !== undefined ? !!body.inStock : true;
    const originalPriceBody = body?.originalPrice;
    const discountPercentBody = body?.discountPercent;
    const sellerEmail = body?.sellerEmail != null ? String(body.sellerEmail).trim().toLowerCase() : null;

    if (!title) {
      return NextResponse.json({ error: "title and categorySlug required" }, { status: 400 });
    }
    if (!categorySlug) {
      return NextResponse.json({ error: "title and categorySlug required" }, { status: 400 });
    }
    const numPrice = typeof price === "number" ? price : Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json({ error: "Valid price required" }, { status: 400 });
    }
    if (numPrice > 9999999999.99) {
      return NextResponse.json({ error: "Price is too large (max 9,999,999,999.99)" }, { status: 400 });
    }
    let titleUrVal = titleUr && titleUr.length > 0 ? titleUr : null;
    let titleZhVal = titleZh && titleZh.length > 0 ? titleZh : null;
    const titleTranslationsObj = await translateToAll(title);
    if (!titleUrVal) titleUrVal = titleTranslationsObj.ur ?? null;
    if (!titleZhVal) titleZhVal = titleTranslationsObj.zh ?? null;
    const imgList = Array.isArray(images) && images.length > 0
      ? images.filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      : (typeof image === "string" && image.trim() ? [image.trim()] : []);
    const mainImage = imgList[0] || (typeof image === "string" && image.trim() ? image.trim() : "");

    const createData: Record<string, unknown> = {
      title: title.trim(),
      titleUr: titleUrVal,
      titleZh: titleZhVal,
      price: numPrice,
      image: mainImage,
      images: imgList.length > 0 ? JSON.stringify(imgList) : null,
      categorySlug: categorySlug.trim(),
      description: typeof description === "string" && description.trim() ? description.trim() : null,
      sectionSlug: sectionSlugBody && isValidSectionSlug(sectionSlugBody) ? sectionSlugBody : null,
      rating: null,
      inStock,
      ...(Object.keys(titleTranslationsObj).length > 0 && {
        titleTranslations: titleTranslationsObj as Prisma.InputJsonValue,
      }),
    };
    if (sellerEmail) {
      const sellerUser = await prisma.user.findUnique({
        where: { email: sellerEmail, isSeller: true },
        select: { id: true },
      }).catch(() => null);
      if (sellerUser) (createData as Record<string, unknown>).vendorId = sellerUser.id;
    }
    if (originalPriceBody !== undefined && originalPriceBody !== null && originalPriceBody !== "") {
      const numOrig = typeof originalPriceBody === "number" ? originalPriceBody : Number(originalPriceBody);
      if (!Number.isNaN(numOrig) && numOrig >= 0 && numOrig <= 9999999999.99) {
        (createData as Record<string, unknown>).originalPrice = numOrig;
      }
    }
    if (discountPercentBody !== undefined && discountPercentBody !== null && discountPercentBody !== "") {
      const numPct = typeof discountPercentBody === "number" ? discountPercentBody : Number(discountPercentBody);
      if (!Number.isNaN(numPct) && numPct >= 0 && numPct <= 100) {
        (createData as Record<string, unknown>).discountPercent = Math.round(numPct);
      }
    }

    let product: Awaited<ReturnType<typeof prisma.product.create>>;
    try {
      product = await prisma.product.create({
        data: createData as Prisma.ProductCreateInput,
        include: { reviews: true },
      });
    } catch (createErr) {
      const errMsg = createErr instanceof Error ? createErr.message : String(createErr);
      if (/Unknown argument|soldCount|ratingCount|sectionSlug|reviewCount|inStock|originalPrice|discountPercent/i.test(errMsg)) {
        const minimalData: Prisma.ProductCreateInput = {
          title: title.trim(),
          price: numPrice,
          image: mainImage,
          categorySlug: categorySlug.trim(),
          description: typeof description === "string" && description.trim() ? description.trim() : null,
        };
        product = await prisma.product.create({
          data: minimalData,
          include: { reviews: true },
        });
        const createdId = product.id;
        try {
          const updates: string[] = [];
          const params: (string | number | boolean)[] = [];
          if (createData.sectionSlug != null) {
            updates.push("section_slug = ?");
            params.push(String(createData.sectionSlug));
          }
          if (createData.inStock !== undefined) {
            updates.push("`in_stock` = ?");
            params.push(Boolean(createData.inStock));
          }
          if (createData.originalPrice != null) {
            updates.push("original_price = ?");
            params.push(Number(createData.originalPrice));
          }
          if (createData.discountPercent != null) {
            updates.push("discount_percent = ?");
            params.push(Number(createData.discountPercent));
          }
          if (updates.length > 0) {
            params.push(createdId);
            await prisma.$executeRawUnsafe(
              `UPDATE Product SET ${updates.join(", ")} WHERE id = ?`,
              ...params
            );
            const refreshed = await prisma.product.findUnique({
              where: { id: createdId },
              include: { reviews: true },
            });
            if (refreshed) product = refreshed;
          }
        } catch (_) {
          // ignore raw update errors
        }
        const mapped = mapProduct(product);
        if (createData.discountPercent != null) (mapped as Record<string, unknown>).discountPercent = createData.discountPercent;
        if (createData.sectionSlug != null) (mapped as Record<string, unknown>).sectionSlug = createData.sectionSlug;
        return NextResponse.json(mapped);
      } else {
        throw createErr;
      }
    }

    return NextResponse.json(mapProduct(product));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid request";
    console.error("POST /api/store/products error:", e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id || !id.trim()) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  try {
    await prisma.product.delete({ where: { id: id.trim() } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id || !id.trim()) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const title = body?.title != null ? String(body.title).trim() : undefined;
    const titleUr = body?.titleUr != null ? String(body.titleUr).trim() : undefined;
    const titleZh = body?.titleZh != null ? String(body.titleZh).trim() : undefined;
    const categorySlug = body?.categorySlug != null ? String(body.categorySlug).trim() : undefined;
    const price = body?.price;
    const image = body?.image;
    const images = body?.images;
    const description = body?.description;
    const sectionSlugBody = body?.sectionSlug !== undefined ? (body?.sectionSlug != null ? String(body.sectionSlug).trim() || null : null) : undefined;

    const existing = await prisma.product.findUnique({ where: { id: id.trim() } });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const data: {
      title?: string;
      titleUr?: string | null;
      titleZh?: string | null;
      titleTranslations?: Record<string, string>;
      price?: number;
      image?: string;
      images?: string | null;
      categorySlug?: string;
      description?: string | null;
      sectionSlug?: string | null;
      inStock?: boolean;
      hidden?: boolean;
      originalPrice?: number | null;
      discountPercent?: number | null;
    } = {};

    if (title !== undefined) data.title = title;
    if (titleUr !== undefined) data.titleUr = titleUr && titleUr.length > 0 ? titleUr : null;
    if (titleZh !== undefined) data.titleZh = titleZh && titleZh.length > 0 ? titleZh : null;
    if (title !== undefined && title.trim()) {
      const titleTranslationsObj = await translateToAll(title);
      if (Object.keys(titleTranslationsObj).length > 0) data.titleTranslations = titleTranslationsObj;
      if (data.titleUr === undefined) data.titleUr = titleTranslationsObj.ur ?? null;
      if (data.titleZh === undefined) data.titleZh = titleTranslationsObj.zh ?? null;
    }
    if (categorySlug !== undefined) data.categorySlug = categorySlug;
    if (sectionSlugBody !== undefined) {
      data.sectionSlug = sectionSlugBody && isValidSectionSlug(sectionSlugBody) ? sectionSlugBody : null;
    }
    if (body?.inStock !== undefined) {
      data.inStock = !!body.inStock;
    }
    if (body?.hidden !== undefined) {
      data.hidden = !!body.hidden;
    }
    if (body?.originalPrice !== undefined) {
      const v = body.originalPrice;
      if (v === null || v === "") data.originalPrice = null;
      else {
        const n = typeof v === "number" ? v : Number(v);
        if (!Number.isNaN(n) && n >= 0 && n <= 9999999999.99) data.originalPrice = n;
      }
    }
    if (body?.discountPercent !== undefined) {
      const v = body.discountPercent;
      if (v === null || v === "") data.discountPercent = null;
      else {
        const n = typeof v === "number" ? v : Number(v);
        if (!Number.isNaN(n) && n >= 0 && n <= 100) data.discountPercent = Math.round(n);
      }
    }
    if (description !== undefined) {
      data.description = typeof description === "string" && description.trim() ? description.trim() : null;
    }
    if (typeof price === "number" && !Number.isNaN(price) && price >= 0) {
      data.price = price;
    } else if (price !== undefined) {
      const numPrice = Number(price);
      if (!Number.isNaN(numPrice) && numPrice >= 0) data.price = numPrice;
    }
    if (data.price !== undefined && data.price > 9999999999.99) {
      return NextResponse.json({ error: "Price is too large (max 9,999,999,999.99)" }, { status: 400 });
    }
    if (image !== undefined || images !== undefined) {
      const imgList = Array.isArray(images) && images.length > 0
        ? images.filter((u): u is string => typeof u === "string" && u.trim().length > 0)
        : (typeof image === "string" && image.trim() ? [image.trim()] : []);
      data.image = imgList[0] || (typeof image === "string" && image.trim() ? image.trim() : existing.image);
      data.images = imgList.length > 0 ? JSON.stringify(imgList) : null;
    }

    let updated: Awaited<ReturnType<typeof prisma.product.update>>;
    try {
      updated = await prisma.product.update({
        where: { id: id.trim() },
        data,
        include: { reviews: true },
      });
    } catch (updateErr) {
      const errMsg = updateErr instanceof Error ? updateErr.message : String(updateErr);
      if (/Unknown argument.*(inStock|hidden|originalPrice|discountPercent|sectionSlug)|(inStock|hidden|originalPrice|discountPercent|sectionSlug).*Unknown argument/i.test(errMsg)) {
        const { inStock: _i, hidden: _h, originalPrice: _o, discountPercent: _d, sectionSlug: _s, ...dataWithout } = data;
        updated = await prisma.product.update({
          where: { id: id.trim() },
          data: dataWithout,
          include: { reviews: true },
        });
        try {
          if (body?.hidden !== undefined) {
            await prisma.$executeRaw`UPDATE Product SET \`hidden\` = ${body.hidden ? 1 : 0} WHERE id = ${id.trim()}`;
          }
          if ("discountPercent" in data) {
            const pct = data.discountPercent == null ? null : Math.round(Number(data.discountPercent));
            await prisma.$executeRawUnsafe(
              "UPDATE Product SET discount_percent = ? WHERE id = ?",
              pct,
              id.trim()
            );
          }
          if (data.sectionSlug !== undefined) {
            await prisma.$executeRawUnsafe(
              "UPDATE Product SET section_slug = ? WHERE id = ?",
              data.sectionSlug,
              id.trim()
            );
          }
          if (data.originalPrice !== undefined) {
            await prisma.$executeRawUnsafe(
              "UPDATE Product SET original_price = ? WHERE id = ?",
              data.originalPrice,
              id.trim()
            );
          }
          if (data.inStock !== undefined) {
            await prisma.$executeRawUnsafe(
              "UPDATE Product SET `in_stock` = ? WHERE id = ?",
              data.inStock ? 1 : 0,
              id.trim()
            );
          }
          updated = await prisma.product.findUnique({
            where: { id: id.trim() },
            include: { reviews: true },
          }) ?? updated;
        } catch (_) {
          // ignore raw update errors
        }
        const mapped = mapProduct(updated);
        if (data.discountPercent !== undefined) (mapped as Record<string, unknown>).discountPercent = data.discountPercent;
        if (data.sectionSlug !== undefined) (mapped as Record<string, unknown>).sectionSlug = data.sectionSlug;
        return NextResponse.json(body?.hidden !== undefined ? { ...mapped, hidden: !!body.hidden } : mapped);
      } else {
        throw updateErr;
      }
    }
    return NextResponse.json(mapProduct(updated));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid request";
    console.error("PATCH /api/store/products error:", e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

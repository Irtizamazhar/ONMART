import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 1) {
    return NextResponse.json({ categories: [], products: [] });
  }
  // Case-insensitive: q is already lowercased; MySQL ci collation matches any case
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { slug: { contains: q } },
      ],
    },
    select: { slug: true, name: true, nameUr: true, nameZh: true, nameTranslations: true },
    take: 8,
    orderBy: { name: "asc" },
  });
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { titleUr: { not: null, contains: q } },
        { titleZh: { not: null, contains: q } },
      ],
    },
    select: { id: true, title: true, titleUr: true, titleZh: true, titleTranslations: true },
    take: 10,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    categories: categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      nameUr: c.nameUr ?? undefined,
      nameZh: c.nameZh ?? undefined,
      nameTranslations: (c.nameTranslations as Record<string, string> | null) ?? undefined,
    })),
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      titleUr: p.titleUr ?? undefined,
      titleZh: p.titleZh ?? undefined,
      titleTranslations: (p.titleTranslations as Record<string, string> | null) ?? undefined,
    })),
  });
}

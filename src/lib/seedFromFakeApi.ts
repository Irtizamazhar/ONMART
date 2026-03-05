import { prisma } from "@/lib/db";
import { CATEGORIES } from "@/data/categories";

const FAKE_API = "https://fakestoreapi.com";
const SEED_CATEGORIES = ["electronics", "jewelery", "men's clothing", "women's clothing"] as const;

type FakeProduct = {
  id: number;
  title: string;
  price: number;
  description: string | null;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
};

/**
 * Fetches all products from FakeStore API and stores them in DB.
 * Ensures categories exist, then inserts products (skips if same title+categorySlug exists).
 * Returns { created, skipped, totalFromApi }.
 */
export async function seedFromFakeApi(): Promise<{ created: number; skipped: number; totalFromApi: number }> {
  const toUpsert = CATEGORIES.filter((c) =>
    SEED_CATEGORIES.includes(c.slug as (typeof SEED_CATEGORIES)[number])
  );
  for (const def of toUpsert) {
    try {
      await prisma.category.upsert({
        where: { slug: def.slug },
        create: { name: def.name, slug: def.slug, image: def.image || "" },
        update: {},
      });
    } catch {
      // ignore
    }
  }

  const seen = new Set<string>();
  const allFake: FakeProduct[] = [];

  for (const cat of SEED_CATEGORIES) {
    const res = await fetch(`${FAKE_API}/products/category/${encodeURIComponent(cat)}`);
    if (!res.ok) continue;
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    for (const p of list) {
      const key = `${p.title}-${p.category}`;
      if (seen.has(key)) continue;
      seen.add(key);
      allFake.push(p as FakeProduct);
    }
  }

  let created = 0;
  let skipped = 0;

  for (const p of allFake) {
    const title = (p.title || "").trim();
    const categorySlug = (p.category || "electronics").trim().toLowerCase();
    if (!title) continue;

    const existing = await prisma.product.findFirst({
      where: { title, categorySlug },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const price = typeof p.price === "number" ? p.price : Number(p.price) || 0;
    const image = typeof p.image === "string" && p.image.trim() ? p.image.trim() : "";
    const description =
      typeof p.description === "string" && p.description.trim() ? p.description.trim() : null;
    const rate = p.rating?.rate ?? 4;
    const count = p.rating?.count ?? 0;

    await prisma.product.create({
      data: {
        title,
        price: Number.isNaN(price) || price < 0 ? 0 : price,
        image: image || "",
        categorySlug,
        description,
        rating: Math.round(rate * 100) / 100,
      },
    });
    created++;
  }

  return { created, skipped, totalFromApi: allFake.length };
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CATEGORIES } from "@/data/categories";
import { translateToAll } from "@/lib/translate";

const DEFAULT_CATEGORIES = CATEGORIES.map((c) => ({
  name: c.name,
  slug: c.slug,
  image: c.image,
}));

export async function GET() {
  for (const def of DEFAULT_CATEGORIES) {
    try {
      await prisma.category.upsert({
        where: { slug: def.slug },
        create: {
          name: def.name,
          slug: def.slug,
          image: def.image || "",
        },
        update: {},
      });
    } catch {
      // ignore
    }
  }
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, image, nameUr, nameZh } = body;
    if (!name || !slug || typeof name !== "string" || typeof slug !== "string") {
      return NextResponse.json({ error: "name and slug required" }, { status: 400 });
    }
    const slugVal = slug.trim().toLowerCase().replace(/\s+/g, "-");
    const existing = await prisma.category.findUnique({ where: { slug: slugVal } });
    if (existing) {
      return NextResponse.json({ error: "Category with this slug already exists" }, { status: 400 });
    }
    const nameTrim = name.trim();
    const nameTranslationsObj = await translateToAll(nameTrim);
    const nameUrVal = nameTranslationsObj.ur ?? (typeof nameUr === "string" && nameUr.trim() ? nameUr.trim() : null);
    const nameZhVal = nameTranslationsObj.zh ?? (typeof nameZh === "string" && nameZh.trim() ? nameZh.trim() : null);
    const category = await prisma.category.create({
      data: {
        name: nameTrim,
        nameUr: nameUrVal,
        nameZh: nameZhVal,
        nameTranslations: Object.keys(nameTranslationsObj).length > 0 ? nameTranslationsObj : undefined,
        slug: slugVal,
        image: typeof image === "string" && image.trim() ? image.trim() : "",
      },
    });
    return NextResponse.json(category);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id || !id.trim()) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  try {
    await prisma.category.delete({ where: { id: id.trim() } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, image, nameUr, nameZh } = body;
    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const slugVal = slug != null && typeof slug === "string"
      ? slug.trim().toLowerCase().replace(/\s+/g, "-")
      : undefined;
    if (slugVal !== undefined) {
      const existing = await prisma.category.findFirst({
        where: { slug: slugVal, NOT: { id: id.trim() } },
      });
      if (existing) {
        return NextResponse.json({ error: "Another category with this slug already exists" }, { status: 400 });
      }
    }
    const updateData: { name?: string; slug?: string; image?: string; nameUr?: string | null; nameZh?: string | null; nameTranslations?: Record<string, string> } = {};
    if (name != null && typeof name === "string") updateData.name = name.trim();
    if (nameUr !== undefined) updateData.nameUr = typeof nameUr === "string" && nameUr.trim() ? nameUr.trim() : null;
    if (nameZh !== undefined) updateData.nameZh = typeof nameZh === "string" && nameZh.trim() ? nameZh.trim() : null;
    if (slugVal !== undefined) updateData.slug = slugVal;
    if (image != null && typeof image === "string") updateData.image = image.trim();
    if (name != null && typeof name === "string" && name.trim()) {
      const nameTranslationsObj = await translateToAll(name.trim());
      if (Object.keys(nameTranslationsObj).length > 0) updateData.nameTranslations = nameTranslationsObj;
      if (updateData.nameUr === undefined) updateData.nameUr = nameTranslationsObj.ur ?? null;
      if (updateData.nameZh === undefined) updateData.nameZh = nameTranslationsObj.zh ?? null;
    }
    const category = await prisma.category.update({
      where: { id: id.trim() },
      data: updateData,
    });
    return NextResponse.json(category);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

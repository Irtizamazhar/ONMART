import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const rows = await prisma.disabledCategorySlug.findMany();
  const slugs = rows.map((r) => r.slug);
  return NextResponse.json(slugs);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, disabled } = body;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }
    const s = slug.trim();
    if (disabled === true) {
      await prisma.disabledCategorySlug.upsert({
        where: { slug: s },
        create: { slug: s },
        update: {},
      });
    } else if (disabled === false) {
      await prisma.disabledCategorySlug.deleteMany({ where: { slug: s } });
    }
    const rows = await prisma.disabledCategorySlug.findMany();
    return NextResponse.json(rows.map((r) => r.slug));
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

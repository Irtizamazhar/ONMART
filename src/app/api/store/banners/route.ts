import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const banners = await prisma.banner.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(banners);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { src, href, label } = body;
    const srcTrim = typeof src === "string" ? src.trim() : "";
    if (!srcTrim) {
      return NextResponse.json({ error: "Image URL is required (upload an image or paste URL)." }, { status: 400 });
    }
    const hrefVal = typeof href === "string" && href.trim() ? href.trim() : "#";
    const labelVal = typeof label === "string" && label.trim() ? label.trim() : "Banner";
    const banner = await prisma.banner.create({
      data: {
        src: srcTrim,
        href: hrefVal,
        label: labelVal,
      },
    });
    return NextResponse.json(banner);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Banner create error:", e);
    return NextResponse.json({ error: "Could not add banner. " + msg }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id || !id.trim()) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  try {
    await prisma.banner.delete({ where: { id: id.trim() } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Banner not found" }, { status: 404 });
  }
}

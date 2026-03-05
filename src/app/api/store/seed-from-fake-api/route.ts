import { NextResponse } from "next/server";
import { seedFromFakeApi } from "@/lib/seedFromFakeApi";

/**
 * GET /api/store/seed-from-fake-api
 * Fetches all products from FakeStore API and stores them in DB.
 * Skips products that already exist (same title + categorySlug).
 * Call once to seed the database with the same products that were previously from the API.
 */
export async function GET() {
  try {
    const result = await seedFromFakeApi();
    return NextResponse.json({
      ok: true,
      message: "Seed complete",
      created: result.created,
      skipped: result.skipped,
      totalFromApi: result.totalFromApi,
    });
  } catch (e) {
    console.error("Seed from fake API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 }
    );
  }
}

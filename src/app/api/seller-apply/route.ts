import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: "Full name, email and phone are required." },
        { status: 400 }
      );
    }

    // Optional: save to DB or send email here. For now we just accept and return success.
    console.log("[Seller Apply]", { fullName, email, phone, ...body });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
  }
}

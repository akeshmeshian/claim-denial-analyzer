import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const testPassword = process.env.TEST_MODE_PASSWORD;
  if (!testPassword) {
    return NextResponse.json({ error: "Test mode is not configured." }, { status: 403 });
  }

  if (!password || password !== testPassword) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("test_mode_auth", testPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ ok: true });
}

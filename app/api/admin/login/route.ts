import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword, checkPassword, createSessionValue } from "@/lib/adminAuth";

export async function POST(req: Request) {
  if (!adminPassword()) {
    return NextResponse.json(
      { ok: false, message: "ADMIN_PASSWORD is not set (min 8 characters). Add it in Vercel and redeploy." },
      { status: 503 },
    );
  }
  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";

  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.json({ ok: false, message: "Incorrect password." }, { status: 401 });
  }

  const { value, maxAge } = createSessionValue();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && !req.url.startsWith("http://localhost"),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}

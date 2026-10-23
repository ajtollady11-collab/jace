import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Admin dashboard login.
 * Set ADMIN_PASSWORD in Vercel → Settings → Environment Variables.
 * Changing the password logs everyone out.
 */

export const ADMIN_COOKIE = "js_admin";
const SESSION_DAYS = 14;

export function adminPassword(): string | undefined {
  const p = process.env.ADMIN_PASSWORD;
  return p && p.length >= 8 ? p : undefined;
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string): boolean {
  const pw = adminPassword();
  if (!pw || typeof input !== "string") return false;
  // Compare hashes so lengths always match
  const h = (s: string) => createHmac("sha256", "js-admin-compare").update(s).digest("hex");
  return safeEqual(h(input), h(pw));
}

export function createSessionValue(): { value: string; maxAge: number } {
  const pw = adminPassword()!;
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  const payload = `admin.${expires}`;
  return { value: `${payload}.${sign(payload, pw)}`, maxAge: SESSION_DAYS * 86_400 };
}

export function isValidSession(value: string | undefined): boolean {
  const pw = adminPassword();
  if (!pw || !value) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  return safeEqual(parts[2], sign(`${parts[0]}.${parts[1]}`, pw));
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return isValidSession(jar.get(ADMIN_COOKIE)?.value);
}

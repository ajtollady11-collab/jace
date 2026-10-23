import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { cancelBooking } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });
  const { id } = await params;
  const ok = await cancelBooking(id);
  if (!ok) return NextResponse.json({ ok: false, message: "Booking not found or already cancelled." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

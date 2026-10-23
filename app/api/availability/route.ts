import { NextResponse } from "next/server";
import { booking } from "@/config/booking";
import { generateSlots } from "@/lib/slots";
import { getTakenSlots, isDatabaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Open 15-minute slots (UTC milliseconds) across the booking window. */
export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ status: "error", message: "Booking is not available yet." }, { status: 503 });
  }
  try {
    const all = generateSlots();
    const taken = all.length ? await getTakenSlots(all[0], all[all.length - 1]) : new Set<number>();
    const slots = all.filter((t) => !taken.has(t));
    return NextResponse.json(
      {
        status: "ok",
        businessTimeZone: booking.businessTimeZone,
        slotMinutes: booking.slotMinutes,
        slots,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("Availability failed:", err);
    return NextResponse.json(
      { status: "error", message: "We couldn’t load available times. Please refresh and try again." },
      { status: 500 },
    );
  }
}

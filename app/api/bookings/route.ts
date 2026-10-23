import { NextResponse } from "next/server";
import { booking } from "@/config/booking";
import { isBookableSlot, slotEnd } from "@/lib/slots";
import { createBooking, isDatabaseConfigured } from "@/lib/db";
import { validateContact, normalisePhone } from "@/lib/bookingValidation";
import { isValidTimeZone } from "@/lib/time";
import { sendWebhook } from "@/lib/webhook";

type Body = {
  applicationId?: unknown;
  token?: unknown;
  start?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  age?: unknown;
  timeZone?: unknown;
};

const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ status: "error", message: "Booking is not available yet." }, { status: 503 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid request." }, { status: 400 });
  }

  const contact = { name: str(body.name), email: str(body.email), phone: str(body.phone), age: str(body.age) };
  const errors = validateContact(contact);
  if (Object.keys(errors).length) {
    return NextResponse.json({ status: "error", message: Object.values(errors)[0], errors }, { status: 422 });
  }

  const start = Number(body.start);
  if (!isBookableSlot(start)) {
    return NextResponse.json(
      { status: "error", code: "slot_unavailable", message: "That time is no longer available. Please pick another slot." },
      { status: 409 },
    );
  }

  const timeZone = isValidTimeZone(body.timeZone) ? body.timeZone : booking.businessTimeZone;

  try {
    const result = await createBooking({
      applicationId: str(body.applicationId),
      token: str(body.token),
      startMs: start,
      endMs: slotEnd(start),
      name: contact.name.trim(),
      email: contact.email.trim().toLowerCase(),
      phone: normalisePhone(contact.phone),
      age: Number(contact.age),
      visitorTimeZone: timeZone,
    });

    if (!result.ok) {
      const status = result.code === "invalid_application" ? 404 : 409;
      return NextResponse.json({ status: "error", ...result }, { status });
    }

    await sendWebhook("booking.confirmed", {
      bookingId: result.id,
      applicationId: str(body.applicationId),
      start: new Date(start).toISOString(),
      end: new Date(slotEnd(start)).toISOString(),
      businessTimeZone: booking.businessTimeZone,
      visitorTimeZone: timeZone,
      name: contact.name.trim(),
      email: contact.email.trim().toLowerCase(),
      phone: normalisePhone(contact.phone),
      age: Number(contact.age),
    });

    return NextResponse.json(
      { status: "booked", booking: { id: result.id, start, end: slotEnd(start) } },
      { status: 201 },
    );
  } catch (err) {
    console.error("Booking failed:", err);
    return NextResponse.json(
      { status: "error", message: "Something went wrong while booking. Please try again." },
      { status: 500 },
    );
  }
}

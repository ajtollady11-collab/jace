import { booking } from "@/config/booking";
import { getZonedParts, zonedTimeToUtc } from "./time";

const DAY_MS = 86_400_000;
const MIN_MS = 60_000;

/**
 * Every bookable slot start (UTC ms) inside the booking window, before
 * removing slots that are already taken. Based on the rules in config/booking.ts.
 */
export function generateSlots(nowMs: number = Date.now()): number[] {
  const tz = booking.businessTimeZone;
  const earliest = nowMs + booking.minNoticeMinutes * MIN_MS;
  const today = getZonedParts(nowMs, tz);
  const slots: number[] = [];

  // Walk calendar days in the business time zone (use noon UTC to step safely across DST)
  const base = Date.UTC(today.year, today.month - 1, today.day, 12);
  for (let i = 0; i <= booking.bookingWindowDays; i++) {
    const d = new Date(base + i * DAY_MS);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    if (!booking.daysOfWeek.includes(d.getUTCDay())) continue;

    const start = zonedTimeToUtc(y, m, day, booking.dayStartHour, booking.dayStartMinute, tz);
    const end = zonedTimeToUtc(y, m, day, booking.dayEndHour, booking.dayEndMinute, tz);
    for (let t = start; t + booking.slotMinutes * MIN_MS <= end; t += booking.slotMinutes * MIN_MS) {
      if (t >= earliest) slots.push(t);
    }
  }
  return slots;
}

/** True if this exact instant is a bookable slot under the current rules. */
export function isBookableSlot(utcMs: number, nowMs: number = Date.now()): boolean {
  if (!Number.isFinite(utcMs) || utcMs % MIN_MS !== 0) return false;
  return generateSlots(nowMs).includes(utcMs);
}

export function slotEnd(startMs: number): number {
  return startMs + booking.slotMinutes * MIN_MS;
}

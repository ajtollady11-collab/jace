import { booking } from "@/config/booking";
import { getZonedParts, zonedTimeToUtc } from "./time";

const DAY_MS = 86_400_000;
const MIN_MS = 60_000;

/** Every slot start (UTC ms) on one calendar date in the business time zone, ignoring "now". */
export function slotsForDate(year: number, month: number, day: number): number[] {
  const tz = booking.businessTimeZone;
  const weekday = new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
  if (!booking.daysOfWeek.includes(weekday)) return [];
  const start = zonedTimeToUtc(year, month, day, booking.dayStartHour, booking.dayStartMinute, tz);
  const end = zonedTimeToUtc(year, month, day, booking.dayEndHour, booking.dayEndMinute, tz);
  const out: number[] = [];
  for (let t = start; t + booking.slotMinutes * MIN_MS <= end; t += booking.slotIntervalMinutes * MIN_MS) out.push(t);
  return out;
}

/**
 * Every bookable slot start (UTC ms) inside the booking window, before
 * removing slots that are already taken. Based on the rules in config/booking.ts.
 */
export function generateSlots(nowMs: number = Date.now()): number[] {
  const earliest = nowMs + booking.minNoticeMinutes * MIN_MS;
  const today = getZonedParts(nowMs, booking.businessTimeZone);
  const base = Date.UTC(today.year, today.month - 1, today.day, 12); // noon UTC steps safely across DST
  const slots: number[] = [];
  for (let i = 0; i <= booking.bookingWindowDays; i++) {
    const d = new Date(base + i * DAY_MS);
    for (const t of slotsForDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())) {
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

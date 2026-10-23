/**
 * ─────────────────────────────────────────────────────────────
 *  BOOKING RULES — edit these to change availability
 * ─────────────────────────────────────────────────────────────
 *  All times are in BUSINESS_TIME_ZONE (UK time). Visitors see the
 *  same slots converted to their own time zone automatically.
 *  UK clock changes (GMT ↔ BST) are handled automatically.
 */

export const booking = {
  /** Our time zone. Every booking is stored and shown to us in this zone. */
  businessTimeZone: "Europe/London",

  /** First bookable start time each day (24h, business time zone) */
  dayStartHour: 8,
  dayStartMinute: 0,

  /** Calls must END by this time (24h). 22:00 → last call starts 21:45 */
  dayEndHour: 22,
  dayEndMinute: 0,

  /** Length of each call in minutes */
  slotMinutes: 15,

  /** Days we take calls. 0 = Sunday … 6 = Saturday. Remove numbers to close those days. */
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],

  /** How many days ahead people can book */
  bookingWindowDays: 21,

  /** Minimum notice in minutes (e.g. 120 = can't book a call starting within the next 2 hours) */
  minNoticeMinutes: 120,

  /** Minimum age to book */
  minAge: 18,
  maxAge: 100,

  /** Shown on the booking screen and confirmation */
  callTitle: "Free 15-Minute Consultation",
};

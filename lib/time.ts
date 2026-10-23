/**
 * Time-zone helpers with no external libraries.
 * Works on the server and in the browser via the built-in Intl API.
 */

type ZonedParts = { year: number; month: number; day: number; hour: number; minute: number; weekday: number };

const partsFormatters = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(tz: string) {
  let f = partsFormatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      weekday: "short",
    });
    partsFormatters.set(tz, f);
  }
  return f;
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Wall-clock parts of a UTC instant in a given time zone. */
export function getZonedParts(utcMs: number, tz: string): ZonedParts {
  const out: Record<string, string> = {};
  for (const p of partsFormatter(tz).formatToParts(new Date(utcMs))) out[p.type] = p.value;
  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour) % 24,
    minute: Number(out.minute),
    weekday: WEEKDAYS[out.weekday] ?? 0,
  };
}

/** Offset (ms) of the time zone from UTC at a given instant. */
export function tzOffsetMs(tz: string, utcMs: number): number {
  const p = getZonedParts(utcMs, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return asUtc - Math.floor(utcMs / 60000) * 60000;
}

/** Convert a wall-clock time in a time zone to a UTC timestamp (handles DST). */
export function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, tz: string): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  let utc = guess - tzOffsetMs(tz, guess);
  // Re-check once in case the offset differs at the corrected instant (DST boundaries)
  const second = guess - tzOffsetMs(tz, utc);
  if (second !== utc) utc = second;
  return utc;
}

export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== "string" || !tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** "2026-10-24" for the date of an instant in a time zone */
export function dateKey(utcMs: number, tz: string): string {
  const p = getZonedParts(utcMs, tz);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function formatTime(utcMs: number, tz: string, opts: { hour12?: boolean } = {}): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: opts.hour12 ? "numeric" : "2-digit",
    minute: "2-digit",
    hour12: opts.hour12 ?? false,
  })
    .format(new Date(utcMs))
    .replace(/\s*(am|pm)$/i, (_m, ap: string) => ` ${ap.toUpperCase()}`);
}

export function formatDate(utcMs: number, tz: string, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: style === "long" ? "numeric" : undefined,
  }).format(new Date(utcMs));
}

/** Short zone label, e.g. "BST", "GMT", "EST", "GMT+5:30" */
export function tzAbbrev(utcMs: number, tz: string): string {
  const part = new Intl.DateTimeFormat("en-GB", { timeZone: tz, timeZoneName: "short" })
    .formatToParts(new Date(utcMs))
    .find((p) => p.type === "timeZoneName");
  if (tz.startsWith("America/") || tz.startsWith("US/")) {
    const us = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
      .formatToParts(new Date(utcMs))
      .find((p) => p.type === "timeZoneName");
    if (us) return us.value;
  }
  return part?.value ?? tz;
}

/** Readable zone name, e.g. "America/New_York" → "New York" */
export function tzCity(tz: string): string {
  const last = tz.split("/").pop() ?? tz;
  return last.replace(/_/g, " ");
}

/** Whether a time zone prefers 12-hour clocks (US, Canada, Australia, India …) */
export function prefers12h(tz: string): boolean {
  return /^(America|US|Australia|Pacific\/Auckland|Asia\/(Kolkata|Calcutta|Manila|Karachi))/.test(tz) && !/America\/(Sao_Paulo|Argentina|Bogota|Lima|Santiago|Caracas|Mexico_City|Montevideo)/.test(tz);
}

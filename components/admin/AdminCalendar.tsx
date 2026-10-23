"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminBooking } from "@/lib/db";
import { booking as cfg } from "@/config/booking";
import { slotsForDate } from "@/lib/slots";
import { getZonedParts, tzCity, formatTime } from "@/lib/time";

const UK = cfg.businessTimeZone;
const DAY_MS = 86_400_000;
const MIN_MS = 60_000;
const CALL_H = 40; // px height of the call part of a row
const PREP_MIN = Math.max(0, cfg.slotIntervalMinutes - cfg.slotMinutes);
const PREP_H = PREP_MIN > 0 ? 22 : 0; // px height of the prep-break part
const ROW_H = CALL_H + PREP_H;

type Day = { y: number; m: number; d: number; weekday: number; slots: number[]; key: string };
type Status = "booked" | "open" | "past" | "soon" | "later";

/** Labels for each row, from config (UK wall-clock) */
const rowLabels: string[] = (() => {
  const out: string[] = [];
  const startMin = cfg.dayStartHour * 60 + cfg.dayStartMinute;
  const endMin = cfg.dayEndHour * 60 + cfg.dayEndMinute;
  for (let t = startMin; t + cfg.slotMinutes <= endMin; t += cfg.slotIntervalMinutes) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
})();

function mondayOf(nowMs: number) {
  const p = getZonedParts(nowMs, UK);
  const noon = Date.UTC(p.year, p.month - 1, p.day, 12);
  return noon - ((p.weekday + 6) % 7) * DAY_MS; // noon UTC of Monday (UK date)
}

function buildWeek(mondayNoon: number): Day[] {
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(mondayNoon + i * DAY_MS);
    const y = dt.getUTCFullYear();
    const m = dt.getUTCMonth() + 1;
    const d = dt.getUTCDate();
    return { y, m, d, weekday: dt.getUTCDay(), slots: slotsForDate(y, m, d), key: `${y}-${m}-${d}` };
  });
}

/** Row index of a booking start (UK wall-clock), so off-grid bookings still show */
function rowIndexOf(ms: number) {
  const p = getZonedParts(ms, UK);
  const mins = p.hour * 60 + p.minute - (cfg.dayStartHour * 60 + cfg.dayStartMinute);
  return Math.floor(mins / cfg.slotIntervalMinutes);
}

export default function AdminCalendar({
  bookings,
  nowMs,
  onOpen,
}: {
  bookings: AdminBooking[];
  nowMs: number;
  onOpen: (b: AdminBooking) => void;
}) {
  const thisMonday = useMemo(() => mondayOf(nowMs), [nowMs]);
  const [weekOffset, setWeekOffset] = useState(0);
  const todayIdx = (getZonedParts(nowMs, UK).weekday + 6) % 7;
  const [mobileDay, setMobileDay] = useState(todayIdx);
  const scrollRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => buildWeek(thisMonday + weekOffset * 7 * DAY_MS), [thisMonday, weekOffset]);
  const isThisWeek = weekOffset === 0;

  // Confirmed bookings by UK day → row
  const byCell = useMemo(() => {
    const map = new Map<string, AdminBooking[]>();
    for (const b of bookings) {
      if (b.status !== "confirmed") continue;
      const ms = +new Date(b.startAt);
      const p = getZonedParts(ms, UK);
      const k = `${p.year}-${p.month}-${p.day}|${rowIndexOf(ms)}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(b);
    }
    return map;
  }, [bookings]);

  const earliestBookable = nowMs + cfg.minNoticeMinutes * MIN_MS;
  const lastBookableDay = thisMonday + ((getZonedParts(nowMs, UK).weekday + 6) % 7) * DAY_MS + cfg.bookingWindowDays * DAY_MS;

  function cellStatus(day: Day, slot: number | undefined, booked: AdminBooking[] | undefined): Status | null {
    if (booked?.length) return "booked";
    if (slot === undefined) return null;
    if (slot + cfg.slotMinutes * MIN_MS <= nowMs) return "past";
    if (slot < earliestBookable) return "soon";
    if (Date.UTC(day.y, day.m - 1, day.d, 12) > lastBookableDay) return "later";
    return "open";
  }

  // Week totals
  const totals = useMemo(() => {
    let booked = 0;
    let open = 0;
    for (const day of days) {
      rowLabels.forEach((_, i) => {
        const st = cellStatus(day, day.slots[i], byCell.get(`${day.key}|${i}`));
        if (st === "booked") booked++;
        if (st === "open") open++;
      });
    }
    return { booked, open };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, byCell, nowMs]);

  // "Now" line (only in this week, today's column)
  const nowLine = useMemo(() => {
    if (!isThisWeek) return null;
    const p = getZonedParts(nowMs, UK);
    const mins = p.hour * 60 + p.minute - (cfg.dayStartHour * 60 + cfg.dayStartMinute);
    if (mins < 0 || mins >= rowLabels.length * cfg.slotIntervalMinutes) return null;
    const row = Math.floor(mins / cfg.slotIntervalMinutes);
    const within = mins - row * cfg.slotIntervalMinutes;
    const px =
      within < cfg.slotMinutes
        ? (within / cfg.slotMinutes) * CALL_H
        : CALL_H + ((within - cfg.slotMinutes) / Math.max(1, PREP_MIN)) * PREP_H;
    return row * ROW_H + px;
  }, [isThisWeek, nowMs]);

  // On first load, scroll near the current time
  useEffect(() => {
    if (nowLine !== null && scrollRef.current) scrollRef.current.scrollTop = Math.max(0, nowLine - 120);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rangeLabel = (() => {
    const a = days[0];
    const b = days[6];
    const f = (d: Day, withYear: boolean) =>
      new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short", year: withYear ? "numeric" : undefined }).format(
        Date.UTC(d.y, d.m - 1, d.d, 12),
      );
    return `${f(a, a.y !== b.y)} – ${f(b, true)}`;
  })();

  const isToday = (i: number) => isThisWeek && i === todayIdx;

  return (
    <div className="overflow-hidden rounded-card border border-line bg-card">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-line p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
            className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-line hover:border-gold/50"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              setWeekOffset(0);
              setMobileDay(todayIdx);
            }}
            disabled={isThisWeek}
            className="h-9 rounded-[8px] border border-line px-3 text-sm hover:border-gold/50 disabled:opacity-40"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Next week"
            className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-line hover:border-gold/50"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="ml-2 font-display text-lg font-semibold sm:text-xl" aria-live="polite">
            {rangeLabel}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-fg-2">
          <span>
            <strong className="font-display text-sm text-fg">{totals.booked}</strong> booked
          </span>
          <span>
            <strong className="font-display text-sm text-fg">{totals.open}</strong> open
          </span>
          <span className="hidden h-4 w-px bg-line sm:block" />
          <Legend swatch="bg-gold" label="Booked" />
          <Legend swatch="border border-dashed border-gold/50" label="Open" />
          {PREP_MIN > 0 && <Legend swatch="prep-hatch border border-line" label={`${PREP_MIN}-min prep`} />}
          <Legend swatch="bg-muted" label="Past / too soon" />
        </div>
      </div>

      {/* Mobile day picker */}
      <div className="flex gap-1 border-b border-line p-2.5 md:hidden">
        {days.map((d, i) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setMobileDay(i)}
            aria-pressed={mobileDay === i}
            className={`flex min-w-0 flex-1 flex-col items-center rounded-[8px] border py-1.5 ${
              mobileDay === i ? "border-gold bg-gold/10" : "border-line"
            }`}
          >
            <span className={`text-[0.62rem] uppercase tracking-wider ${isToday(i) ? "text-gold-2" : "text-fg-2"}`}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
            </span>
            <span className="font-display text-base font-semibold">{d.d}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div ref={scrollRef} className="max-h-[70vh] overflow-auto">
        <div className="grid min-w-full grid-cols-[52px_1fr] md:min-w-[860px] md:grid-cols-[60px_repeat(7,minmax(0,1fr))]">
          {/* Header row */}
          <div className="sticky top-0 z-20 border-b border-line bg-card" />
          {days.map((d, i) => (
            <div
              key={d.key}
              className={`sticky top-0 z-20 border-b border-l border-line bg-card px-2 py-2.5 text-center ${
                i === mobileDay ? "" : "hidden md:block"
              }`}
            >
              <span className={`block text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${isToday(i) ? "text-gold-2" : "text-fg-2"}`}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
              </span>
              <span
                className={`mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full font-display text-sm font-semibold ${
                  isToday(i) ? "bg-gold text-ink" : ""
                }`}
              >
                {d.d}
              </span>
            </div>
          ))}

          {/* Time labels column */}
          <div className="relative">
            {rowLabels.map((label) => (
              <div key={label} style={{ height: ROW_H }} className="border-b border-line/60 pr-2 pt-1 text-right text-[0.68rem] tabular-nums text-fg-2">
                {label}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, i) => (
            <div key={day.key} className={`relative border-l border-line ${i === mobileDay ? "" : "hidden md:block"} ${isToday(i) ? "bg-gold/[0.025]" : ""}`}>
              {day.slots.length === 0 && (
                <div className="absolute inset-0 flex items-start justify-center pt-10 text-xs uppercase tracking-[0.18em] text-fg-2/60 [background:repeating-linear-gradient(135deg,transparent_0_8px,rgba(255,255,255,0.025)_8px_9px)]">
                  Closed
                </div>
              )}
              {rowLabels.map((_, r) => {
                const slot = day.slots[r];
                const booked = byCell.get(`${day.key}|${r}`);
                const st = cellStatus(day, slot, booked);
                return (
                  <div key={r} style={{ height: ROW_H }} className="border-b border-line/60 px-1 pt-1">
                    <Cell status={st} slot={slot} booked={booked} onOpen={onOpen} />
                    {PREP_H > 0 && st && (
                      <div
                        style={{ height: PREP_H - 6 }}
                        className={`prep-hatch mt-0.5 flex items-center rounded-[4px] px-1.5 text-[0.58rem] uppercase tracking-[0.12em] text-fg-2/50 ${
                          st === "past" ? "opacity-40" : ""
                        }`}
                        title={`${PREP_MIN}-minute prep break`}
                      >
                        <span className="hidden lg:inline">Prep</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {isToday(i) && nowLine !== null && (
                <div aria-hidden className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: nowLine }}>
                  <span className="-ml-1 h-2 w-2 rounded-full bg-red-400" />
                  <span className="h-px flex-1 bg-red-400/80" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="border-t border-line px-4 py-3 text-xs text-fg-2 sm:px-5">
        All times UK. Calls are {cfg.slotMinutes} minutes
        {PREP_MIN > 0 ? `, starting every ${cfg.slotIntervalMinutes} minutes with a ${PREP_MIN}-minute prep break after each` : ""}. Click a
        booking to see their details and answers.
      </p>
    </div>
  );
}

function Cell({
  status,
  slot,
  booked,
  onOpen,
}: {
  status: Status | null;
  slot: number | undefined;
  booked: AdminBooking[] | undefined;
  onOpen: (b: AdminBooking) => void;
}) {
  const h = { height: CALL_H - 4 };
  if (!status) return <div style={h} />;

  if (status === "booked" && booked) {
    const b = booked[0];
    const extra = booked.length - 1;
    const differentTz = b.visitorTimeZone !== UK;
    return (
      <button
        type="button"
        onClick={() => onOpen(b)}
        style={h}
        title={`${b.name} · ${formatTime(+new Date(b.startAt), UK)} · ${b.email}`}
        className="flex w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-[6px] bg-gold px-2 text-left text-ink shadow-[0_6px_14px_-8px_rgba(200,169,107,0.8)] transition-transform hover:-translate-y-px hover:bg-gold-2 focus-visible:outline-gold-2"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.75rem] font-semibold leading-tight">{b.name}</span>
          <span className="block truncate text-[0.62rem] leading-tight opacity-75">
            {formatTime(+new Date(b.startAt), UK)}
            {differentTz ? ` · ${tzCity(b.visitorTimeZone)}` : ""}
            {extra > 0 ? ` · +${extra}` : ""}
          </span>
        </span>
      </button>
    );
  }

  const label = status === "open" ? "Open" : status === "past" ? "" : status === "soon" ? "Too soon" : "Not open yet";
  return (
    <div
      style={h}
      title={slot ? `${formatTime(slot, UK)} · ${label || "Past"}` : undefined}
      className={`flex items-center rounded-[6px] px-2 text-[0.65rem] ${
        status === "open"
          ? "border border-dashed border-gold/40 text-gold/80"
          : status === "later"
            ? "border border-dashed border-line text-fg-2/40"
            : "bg-muted/70 text-fg-2/45"
      }`}
    >
      <span className="truncate">{label}</span>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden className={`h-3 w-4 rounded-[3px] ${swatch}`} />
      {label}
    </span>
  );
}

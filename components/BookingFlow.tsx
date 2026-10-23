"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { booking } from "@/config/booking";
import { validateContact, type ContactDetails, type ContactErrors } from "@/lib/bookingValidation";
import { dateKey, formatDate, formatTime, isValidTimeZone, prefers12h, tzAbbrev, tzCity, getZonedParts } from "@/lib/time";
import { Arrow } from "./ui";

export type BookingCredentials = { applicationId: string; token: string };
type Booked = { start: number; end: number; timeZone: string; name: string; email: string };

const STORAGE_KEY = "js-booking";
const BUSINESS_TZ = booking.businessTimeZone;

const COMMON_ZONES = [
  "Europe/London",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Toronto",
  "America/Vancouver",
  "Europe/Dublin",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
];

type Stage = "details" | "time" | "booked";

export default function BookingFlow({
  credentials,
  defaultName,
  onReset,
}: {
  credentials: BookingCredentials;
  defaultName: string;
  onReset: () => void;
}) {
  const [stage, setStage] = useState<Stage>("details");
  const [details, setDetails] = useState<ContactDetails>({ name: defaultName, email: "", phone: "", age: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [timeZone, setTimeZone] = useState<string>(BUSINESS_TZ);
  const [slots, setSlots] = useState<number[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [booked, setBooked] = useState<Booked | null>(null);
  const [existing, setExisting] = useState<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const busy = useRef(false);

  /* Detect visitor time zone + restore progress after a refresh */
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let tz = isValidTimeZone(detected) ? detected : BUSINESS_TZ;
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      if (saved?.applicationId === credentials.applicationId) {
        if (saved.details) setDetails((d) => ({ ...d, ...saved.details }));
        if (isValidTimeZone(saved.timeZone)) tz = saved.timeZone;
        if (saved.booked) {
          setBooked(saved.booked);
          setStage("booked");
        } else if (saved.stage === "time") setStage("time");
      }
    } catch {
      /* ignore */
    }
    setTimeZone(tz);
  }, [credentials.applicationId]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...credentials, details, timeZone, stage, booked, name: defaultName }),
      );
    } catch {
      /* ignore */
    }
  }, [credentials, details, timeZone, stage, booked, defaultName]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.closest("[data-quiz-root]")?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }, [stage]);

  /* Availability */
  const loadSlots = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/availability", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data.status !== "ok") throw new Error(data.message);
      setSlots(data.slots as number[]);
    } catch (e) {
      setLoadError((e as Error)?.message || "We couldn’t load available times. Please try again.");
    }
  }, []);

  useEffect(() => {
    if (stage === "time" && slots === null) loadSlots();
  }, [stage, slots, loadSlots]);

  const hour12 = prefers12h(timeZone);

  const days = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const t of slots ?? []) {
      const k = dateKey(t, timeZone);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    return [...map.entries()].map(([key, times]) => ({ key, times }));
  }, [slots, timeZone]);

  // Keep a valid day selected
  useEffect(() => {
    if (!days.length) return;
    if (!day || !days.some((d) => d.key === day)) setDay(days[0].key);
  }, [days, day]);

  // Drop a selection that no longer exists (e.g. after refresh)
  useEffect(() => {
    if (selected !== null && slots && !slots.includes(selected)) setSelected(null);
  }, [slots, selected]);

  const zoneOptions = useMemo(() => {
    let all: string[] = [];
    try {
      all = Intl.supportedValuesOf("timeZone");
    } catch {
      all = COMMON_ZONES;
    }
    const common = [...new Set([timeZone, ...COMMON_ZONES])].filter(isValidTimeZone);
    const rest = all.filter((z) => !common.includes(z));
    return { common, rest };
  }, [timeZone]);

  /* ── Handlers ── */

  function submitDetails(e: FormEvent) {
    e.preventDefault();
    const errs = validateContact(details);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(`bk-${first}`)?.focus();
      return;
    }
    setStage("time");
  }

  async function confirmBooking() {
    if (selected === null || busy.current) return;
    busy.current = true;
    setSubmitting(true);
    setBookError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...credentials, ...details, start: selected, timeZone }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201 && data.status === "booked") {
        setBooked({ start: data.booking.start, end: data.booking.end, timeZone, name: details.name.trim(), email: details.email.trim() });
        setStage("booked");
        return;
      }
      if (data.code === "already_booked") {
        setExisting(data.existingStart ?? null);
        setBookError(data.message);
        return;
      }
      if (data.code === "slot_taken" || data.code === "slot_unavailable") {
        setSelected(null);
        setSlots(null); // reload fresh availability
      }
      if (data.errors) {
        setErrors(data.errors);
        setStage("details");
      }
      setBookError(data.message || "We couldn’t complete your booking. Please try again.");
    } catch {
      setBookError("We couldn’t reach our server. Please check your connection and try again.");
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  /* ── Render ── */

  const stepIndex = stage === "details" ? 0 : stage === "time" ? 1 : 2;

  return (
    <div className="step-enter">
      {/* Header */}
      <div className="border-b border-line px-5 pb-5 pt-6 sm:px-9 sm:pt-7">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3" fill="none">
              <path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Application received
          </span>
          <span className="text-xs text-fg-2">Step {Math.min(stepIndex + 1, 2)} of 2</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5" aria-hidden>
          {[0, 1].map((i) => (
            <div key={i} className="h-[3px] overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold-2 transition-[width] duration-500"
                style={{ width: stepIndex > i ? "100%" : stepIndex === i ? "50%" : "0%" }}
              />
            </div>
          ))}
        </div>
      </div>

      {stage === "details" && (
        <form onSubmit={submitDetails} noValidate className="step-enter px-5 pb-7 pt-7 sm:px-9 sm:pb-9 sm:pt-9">
          <p className="eyebrow">{booking.callTitle}</p>
          <h3 ref={headingRef} tabIndex={-1} className="mt-3 text-[1.45rem] font-semibold leading-tight outline-none sm:text-[1.85rem]">
            Now book your free call with our team
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-fg-2">
            First, a few contact details so we can confirm your call and reach you at the right time.
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field id="bk-name" label="Full name" error={errors.name} className="sm:col-span-2">
              <input
                id="bk-name"
                autoComplete="name"
                value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "bk-name-err" : undefined}
                className={inputClass(!!errors.name)}
              />
            </Field>
            <Field id="bk-email" label="Email address" error={errors.email} className="sm:col-span-2">
              <input
                id="bk-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@business.com"
                value={details.email}
                onChange={(e) => setDetails({ ...details, email: e.target.value })}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "bk-email-err" : undefined}
                className={inputClass(!!errors.email)}
              />
            </Field>
            <Field id="bk-phone" label="Phone number" hint="Include your country code, e.g. +44 or +1" error={errors.phone}>
              <input
                id="bk-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+44 7700 900123"
                value={details.phone}
                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "bk-phone-err" : "bk-phone-hint"}
                className={inputClass(!!errors.phone)}
              />
            </Field>
            <Field id="bk-age" label="Age" error={errors.age}>
              <input
                id="bk-age"
                inputMode="numeric"
                placeholder="e.g. 32"
                maxLength={3}
                value={details.age}
                onChange={(e) => setDetails({ ...details, age: e.target.value.replace(/[^\d]/g, "") })}
                aria-invalid={!!errors.age}
                aria-describedby={errors.age ? "bk-age-err" : undefined}
                className={inputClass(!!errors.age)}
              />
            </Field>
          </div>

          <div className="mt-8 flex justify-end border-t border-line pt-6">
            <button type="submit" className="btn btn-gold !min-h-[48px] w-full sm:w-auto">
              Choose a Time <Arrow />
            </button>
          </div>
        </form>
      )}

      {stage === "time" && (
        <div className="step-enter px-5 pb-7 pt-7 sm:px-9 sm:pb-9 sm:pt-9">
          <p className="eyebrow">{booking.callTitle}</p>
          <h3 ref={headingRef} tabIndex={-1} className="mt-3 text-[1.45rem] font-semibold leading-tight outline-none sm:text-[1.85rem]">
            Pick a time that suits you
          </h3>

          {/* Time zone */}
          <div className="mt-5 flex flex-col gap-2 rounded-[10px] border border-line bg-ink-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
            <label htmlFor="bk-tz" className="flex items-center gap-2 text-sm text-fg-2">
              <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-gold" fill="none">
                <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1.8 8h12.4M8 1.7c1.8 1.9 2.6 3.9 2.6 6.3S9.8 12.4 8 14.3C6.2 12.4 5.4 10.4 5.4 8S6.2 3.6 8 1.7z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              Times shown in
            </label>
            <select
              id="bk-tz"
              value={timeZone}
              onChange={(e) => {
                setTimeZone(e.target.value);
                setSelected(null);
              }}
              className="h-10 w-full min-w-0 rounded-[8px] border border-line bg-card-2 px-3 text-sm text-fg focus:border-gold focus:outline-none sm:w-auto sm:max-w-[320px]"
            >
              <optgroup label="Common">
                {zoneOptions.common.map((z) => (
                  <option key={z} value={z}>
                    {zoneLabel(z)}
                  </option>
                ))}
              </optgroup>
              <optgroup label="All time zones">
                {zoneOptions.rest.map((z) => (
                  <option key={z} value={z}>
                    {zoneLabel(z)}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {loadError && (
            <div role="alert" className="mt-6 rounded-[10px] border border-red-400/30 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
              {loadError}{" "}
              <button type="button" onClick={loadSlots} className="font-semibold underline underline-offset-2">
                Try again
              </button>
            </div>
          )}

          {!loadError && slots === null && (
            <div className="mt-8 flex items-center justify-center gap-3 py-16 text-sm text-fg-2" role="status">
              <span aria-hidden className="spinner h-4 w-4 rounded-full border-2 border-line border-t-gold" />
              Loading available times…
            </div>
          )}

          {slots !== null && days.length === 0 && (
            <p className="mt-8 rounded-[10px] border border-line px-5 py-10 text-center text-fg-2">
              There are no open times right now. Please check back soon.
            </p>
          )}

          {days.length > 0 && (
            <>
              {/* Days */}
              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-fg-2">Date</p>
                <div
                  role="radiogroup"
                  aria-label="Choose a date"
                  className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 sm:-mx-9 sm:px-9 [scrollbar-width:thin]"
                >
                  {days.map((d) => {
                    const on = d.key === day;
                    const t = d.times[0];
                    return (
                      <button
                        key={d.key}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => {
                          setDay(d.key);
                          setSelected(null);
                        }}
                        className={`flex w-[74px] shrink-0 snap-start flex-col items-center rounded-[10px] border px-2 py-3 transition-colors ${
                          on ? "border-gold bg-gold/[0.1]" : "border-line bg-card-2/60 hover:border-fg-2/40"
                        }`}
                      >
                        <span className={`text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${on ? "text-gold-2" : "text-fg-2"}`}>
                          {new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short" }).format(t)}
                        </span>
                        <span className="mt-1 font-display text-2xl font-semibold leading-none">{getZonedParts(t, timeZone).day}</span>
                        <span className="mt-1 text-[0.7rem] text-fg-2">
                          {new Intl.DateTimeFormat("en-GB", { timeZone, month: "short" }).format(t)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Times */}
              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-fg-2">
                  {day && formatDate(days.find((d) => d.key === day)?.times[0] ?? 0, timeZone)}
                </p>
                <div role="radiogroup" aria-label="Choose a time" className="grid max-h-[300px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
                  {(days.find((d) => d.key === day)?.times ?? []).map((t) => {
                    const on = t === selected;
                    return (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => {
                          setSelected(t);
                          setBookError(null);
                        }}
                        className={`h-11 rounded-[8px] border text-sm font-medium tabular-nums transition-colors ${
                          on ? "border-gold bg-gold text-ink" : "border-line bg-card-2/60 text-fg hover:border-gold/50"
                        }`}
                      >
                        {formatTime(t, timeZone, { hour12 })}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Summary + confirm */}
          {selected !== null && (
            <div className="step-enter mt-6 rounded-[12px] border border-gold/40 bg-gold/[0.05] p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Your call</p>
              <p className="mt-2 font-display text-lg font-semibold leading-snug">
                {formatDate(selected, timeZone)} at {formatTime(selected, timeZone, { hour12 })}{" "}
                <span className="text-fg-2">{tzAbbrev(selected, timeZone)}</span>
              </p>
              <p className="mt-1 text-sm text-fg-2">
                {booking.slotMinutes} minutes
                {timeZone !== BUSINESS_TZ && <> · {formatTime(selected, BUSINESS_TZ)} UK time</>}
              </p>
            </div>
          )}

          {bookError && (
            <div role="alert" className="mt-5 rounded-[10px] border border-red-400/30 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
              {bookError}
              {existing && (
                <span className="mt-1 block text-red-200/80">
                  Your existing call: {formatDate(existing, timeZone)} at {formatTime(existing, timeZone, { hour12 })}{" "}
                  {tzAbbrev(existing, timeZone)}.
                </span>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            <button type="button" onClick={() => setStage("details")} disabled={submitting} className="btn btn-ghost !min-h-[48px] !px-4 sm:!px-5">
              <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                <path d="M14 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
            <button
              type="button"
              onClick={confirmBooking}
              disabled={selected === null || submitting}
              aria-busy={submitting}
              className="btn btn-gold !min-h-[48px] flex-1 sm:flex-none"
            >
              {submitting ? (
                <>
                  <span aria-hidden className="spinner h-4 w-4 rounded-full border-2 border-ink/30 border-t-ink" />
                  Booking…
                </>
              ) : (
                <>
                  Confirm Booking <Arrow />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {stage === "booked" && booked && <BookedScreen booked={booked} headingRef={headingRef} onReset={onReset} />}
    </div>
  );
}

/* ───────────────────────────────────────────────────────── */

function BookedScreen({
  booked,
  headingRef,
  onReset,
}: {
  booked: Booked;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onReset: () => void;
}) {
  const tz = booked.timeZone;
  const hour12 = prefers12h(tz);
  const title = `${booking.callTitle} with Jace Sullivan`;
  const details = "Your free 15-minute consultation call with our team.";
  const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${stamp(
    booked.start,
  )}/${stamp(booked.end)}&details=${encodeURIComponent(details)}`;

  function downloadIcs() {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Jace Sullivan//Booking//EN",
      "BEGIN:VEVENT",
      `UID:${booked.start}-${Math.random().toString(36).slice(2)}@jacesullivan`,
      `DTSTAMP:${stamp(Date.now())}`,
      `DTSTART:${stamp(booked.start)}`,
      `DTEND:${stamp(booked.end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${details}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "consultation-call.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="step-enter flex flex-col items-center px-6 py-12 text-center sm:px-12 sm:py-14">
      <span aria-hidden className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 bg-gold/[0.08]">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#E0C58B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h3 ref={headingRef} tabIndex={-1} role="status" className="mt-7 text-3xl font-semibold outline-none sm:text-4xl">
        Your call is booked
      </h3>
      <p className="mt-4 max-w-md leading-relaxed text-fg-2">
        Thanks, {booked.name.split(" ")[0]}. We’ve got your application and your call is in our calendar.
      </p>

      <div className="mt-8 w-full max-w-md rounded-[12px] border border-line bg-ink-2 text-left">
        <div className="border-b border-line px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{booking.callTitle}</p>
          <p className="mt-2 font-display text-lg font-semibold">{formatDate(booked.start, tz)}</p>
          <p className="mt-0.5 text-fg">
            {formatTime(booked.start, tz, { hour12 })} – {formatTime(booked.end, tz, { hour12 })}{" "}
            <span className="text-fg-2">{tzAbbrev(booked.start, tz)}</span>
          </p>
          {tz !== BUSINESS_TZ && (
            <p className="mt-1 text-sm text-fg-2">
              {formatTime(booked.start, BUSINESS_TZ)} UK time
            </p>
          )}
        </div>
        <p className="px-5 py-3 text-sm text-fg-2">
          Booked for <span className="text-fg">{booked.email}</span>
        </p>
      </div>

      <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <a href={google} target="_blank" rel="noopener noreferrer" className="btn btn-ghost flex-1 !text-[0.72rem]">
          Google Calendar
        </a>
        <button type="button" onClick={downloadIcs} className="btn btn-ghost flex-1 !text-[0.72rem]">
          Apple / Outlook (.ics)
        </button>
      </div>
      <a href="#top" onClick={onReset} className="btn btn-gold mt-6">
        Return to Home
      </a>
    </div>
  );
}

/* ───────────────────────────────────────────────────────── */

function zoneLabel(tz: string) {
  const now = Date.now();
  return `${tzCity(tz)} (${tzAbbrev(now, tz)}) · ${formatTime(now, tz, { hour12: prefers12h(tz) })}`;
}

function inputClass(error: boolean) {
  return `h-12 w-full rounded-[10px] border bg-ink-2 px-4 text-base text-fg placeholder:text-fg-2/55 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-2/50 ${
    error ? "border-red-300/60" : "border-line focus:border-gold"
  }`;
}

function Field({
  id,
  label,
  hint,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-fg-2">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

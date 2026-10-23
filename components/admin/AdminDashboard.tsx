"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminApplication, AdminBooking } from "@/lib/db";
import { answerLabels, type ApplicationAnswers } from "@/config/application";
import { booking as cfg } from "@/config/booking";
import { dateKey, formatDate, formatTime, prefers12h, tzAbbrev, tzCity } from "@/lib/time";

const UK = cfg.businessTimeZone;
type Tab = "upcoming" | "past" | "cancelled" | "unbooked";
const answerKeys = Object.keys(answerLabels) as (keyof ApplicationAnswers)[];

export default function AdminDashboard({
  bookings,
  unbooked,
  nowMs,
}: {
  bookings: AdminBooking[];
  unbooked: AdminApplication[];
  nowMs: number;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const groups = useMemo(() => {
    const upcoming: AdminBooking[] = [];
    const past: AdminBooking[] = [];
    const cancelled: AdminBooking[] = [];
    for (const b of bookings) {
      if (b.status === "cancelled") cancelled.push(b);
      else if (new Date(b.endAt).getTime() < nowMs) past.push(b);
      else upcoming.push(b);
    }
    past.reverse();
    cancelled.sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt));
    return { upcoming, past, cancelled };
  }, [bookings, nowMs]);

  const todayKey = dateKey(nowMs, UK);
  const weekEnd = nowMs + 7 * 86_400_000;
  const stats = [
    { label: "Upcoming calls", value: groups.upcoming.length },
    { label: "Today (UK)", value: groups.upcoming.filter((b) => dateKey(+new Date(b.startAt), UK) === todayKey).length },
    { label: "Next 7 days", value: groups.upcoming.filter((b) => +new Date(b.startAt) < weekEnd).length },
    { label: "Applied, not booked", value: unbooked.length },
  ];

  const q = query.trim().toLowerCase();
  const matches = (text: string) => !q || text.toLowerCase().includes(q);
  const list: AdminBooking[] =
    tab === "unbooked"
      ? []
      : groups[tab].filter((b) => matches([b.name, b.email, b.phone, b.answers?.businessType].join(" ")));
  const unbookedList = unbooked.filter((a) => matches([a.fullName, a.answers?.businessType, a.answers?.websiteOrSocial].join(" ")));

  // Group bookings by UK date
  const byDay = useMemo(() => {
    const m = new Map<string, AdminBooking[]>();
    for (const b of list) {
      const k = dateKey(+new Date(b.startAt), UK);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(b);
    }
    return [...m.entries()];
  }, [list]);

  async function cancel(b: AdminBooking) {
    const when = `${formatDate(+new Date(b.startAt), UK)} at ${formatTime(+new Date(b.startAt), UK)}`;
    if (!window.confirm(`Cancel ${b.name}'s call on ${when}?\n\nThe time slot will become available again. This doesn't notify them, so let them know yourself.`)) return;
    setCancelling(b.id);
    try {
      const res = await fetch(`/api/admin/bookings/${b.id}/cancel`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message);
      setNotice(`Cancelled ${b.name}'s call. That slot is open again.`);
      router.refresh();
    } catch (e) {
      setNotice((e as Error).message || "Couldn’t cancel that booking.");
    } finally {
      setCancelling(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "upcoming", label: "Upcoming", count: groups.upcoming.length },
    { id: "past", label: "Past", count: groups.past.length },
    { id: "cancelled", label: "Cancelled", count: groups.cancelled.length },
    { id: "unbooked", label: "Applied, not booked", count: unbooked.length },
  ];

  return (
    <div className="min-h-svh">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-5 md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <a href="/" className="whitespace-nowrap font-display text-[0.72rem] font-semibold tracking-[0.2em] hover:text-gold-2 sm:text-[0.8rem] sm:tracking-[0.28em]">
              JACE SULLIVAN
            </a>
            <span className="hidden h-4 w-px bg-line sm:block" />
            <span className="hidden text-sm text-fg-2 sm:block">Bookings dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => router.refresh()} className="btn btn-ghost !hidden !min-h-[38px] !px-3 !text-[0.68rem] sm:!inline-flex" title="Refresh">
              Refresh
            </button>
            <a href="/api/admin/export" className="btn btn-ghost !min-h-[38px] !px-3 !text-[0.68rem]">
              <span className="sm:hidden">CSV</span>
              <span className="hidden sm:inline">Export CSV</span>
            </a>
            <button type="button" onClick={logout} className="btn btn-ghost !min-h-[38px] !px-3 !text-[0.68rem]">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-[1240px] px-5 pb-24 pt-8 md:px-8 md:pt-10">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{cfg.callTitle}s</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Bookings</h1>
          </div>
          <p className="text-sm text-fg-2">All times in UK time ({tzAbbrev(nowMs, UK)}) unless noted.</p>
        </div>

        {/* Stats */}
        <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card p-5">
              <dt className="text-xs text-fg-2">{s.label}</dt>
              <dd className="mt-1 font-display text-3xl font-semibold">{s.value}</dd>
            </div>
          ))}
        </dl>

        {notice && (
          <div role="status" className="mt-5 flex items-center justify-between gap-4 rounded-[10px] border border-gold/40 bg-gold/[0.06] px-4 py-3 text-sm">
            {notice}
            <button type="button" onClick={() => setNotice(null)} className="text-fg-2 hover:text-fg" aria-label="Dismiss">
              ✕
            </button>
          </div>
        )}

        {/* Tabs + search */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Booking lists" className="-mx-5 flex gap-1 overflow-x-auto px-5 md:mx-0 md:px-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => {
                  setTab(t.id);
                  setOpen(null);
                }}
                className={`flex shrink-0 items-center gap-2 rounded-[8px] px-4 py-2 text-sm transition-colors ${
                  tab === t.id ? "bg-card-2 text-fg ring-1 ring-gold/50" : "text-fg-2 hover:bg-card hover:text-fg"
                }`}
              >
                {t.label}
                <span className={`rounded-full px-2 text-xs ${tab === t.id ? "bg-gold text-ink" : "bg-muted text-fg-2"}`}>{t.count}</span>
              </button>
            ))}
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone…"
            aria-label="Search"
            className="h-10 w-full rounded-[8px] border border-line bg-card px-3 text-sm text-fg placeholder:text-fg-2/60 focus:border-gold focus:outline-none lg:w-72"
          />
        </div>

        {/* Lists */}
        <div className="mt-6">
          {tab !== "unbooked" &&
            (byDay.length === 0 ? (
              <Empty text={q ? "No bookings match your search." : tab === "upcoming" ? "No upcoming calls yet." : "Nothing here yet."} />
            ) : (
              byDay.map(([k, items]) => (
                <section key={k} className="mb-8">
                  <h2 className="mb-3 flex items-center gap-3 text-sm font-semibold text-fg-2">
                    {k === todayKey && <span className="rounded-full bg-gold px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-ink">Today</span>}
                    {formatDate(+new Date(items[0].startAt), UK)}
                  </h2>
                  <ul className="space-y-2">
                    {items.map((b) => (
                      <BookingRow
                        key={b.id}
                        b={b}
                        open={open === b.id}
                        onToggle={() => setOpen(open === b.id ? null : b.id)}
                        onCancel={tab === "upcoming" ? () => cancel(b) : undefined}
                        cancelling={cancelling === b.id}
                      />
                    ))}
                  </ul>
                </section>
              ))
            ))}

          {tab === "unbooked" &&
            (unbookedList.length === 0 ? (
              <Empty text={q ? "No applications match your search." : "Everyone who applied has booked a call."} />
            ) : (
              <ul className="space-y-2">
                {unbookedList.map((a) => (
                  <li key={a.id} className="overflow-hidden rounded-card border border-line bg-card">
                    <button
                      type="button"
                      onClick={() => setOpen(open === a.id ? null : a.id)}
                      aria-expanded={open === a.id}
                      className="flex w-full flex-col gap-1 px-5 py-4 text-left hover:bg-card-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span>
                        <span className="font-semibold">{a.fullName}</span>
                        <span className="ml-3 text-sm text-fg-2">{a.answers?.businessType}</span>
                      </span>
                      <span className="text-sm text-fg-2">
                        Applied {formatDate(+new Date(a.createdAt), UK, "short")}, {formatTime(+new Date(a.createdAt), UK)}
                      </span>
                    </button>
                    {open === a.id && (
                      <div className="border-t border-line px-5 py-5">
                        <p className="mb-4 text-sm text-fg-2">
                          They submitted the application but didn’t book a call, so no contact details were collected. Their
                          website/social is below.
                        </p>
                        <Answers answers={a.answers} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </main>
    </div>
  );
}

function BookingRow({
  b,
  open,
  onToggle,
  onCancel,
  cancelling,
}: {
  b: AdminBooking;
  open: boolean;
  onToggle: () => void;
  onCancel?: () => void;
  cancelling: boolean;
}) {
  const start = +new Date(b.startAt);
  const end = +new Date(b.endAt);
  const theirTz = b.visitorTimeZone;
  const differentTz = theirTz !== UK;

  return (
    <li className={`overflow-hidden rounded-card border bg-card transition-colors ${open ? "border-gold/40" : "border-line"}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-4 text-left hover:bg-card-2 sm:px-5 md:grid-cols-[110px_1.2fr_1.4fr_auto]"
      >
        <span className="row-span-2 md:row-span-1">
          <span className={`block font-display text-xl font-semibold tabular-nums ${b.status === "cancelled" ? "text-fg-2 line-through" : ""}`}>
            {formatTime(start, UK)}
          </span>
          <span className="block text-xs text-fg-2">{cfg.slotMinutes} min</span>
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold">{b.name}</span>
          <span className="block truncate text-sm text-fg-2">{b.answers?.businessType}</span>
        </span>
        <span className="col-start-2 hidden min-w-0 text-sm text-fg-2 md:col-start-auto md:block">
          <span className="block truncate">{b.email}</span>
          <span className="block truncate">{b.phone}</span>
        </span>
        <span className="row-span-2 flex items-center gap-2 md:row-span-1">
          {differentTz && (
            <span className="hidden rounded-full border border-line px-2 py-0.5 text-[0.7rem] text-fg-2 sm:inline">
              {tzCity(theirTz)}
            </span>
          )}
          <svg aria-hidden viewBox="0 0 16 16" className={`h-4 w-4 text-fg-2 transition-transform ${open ? "rotate-180" : ""}`} fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="border-t border-line px-4 py-5 sm:px-5">
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Contact</h3>
              <dl className="mt-3 space-y-2.5 text-sm">
                <Item label="Name" value={b.name} />
                <Item label="Email" value={<a className="text-gold-2 underline-offset-2 hover:underline" href={`mailto:${b.email}`}>{b.email}</a>} />
                <Item label="Phone" value={<a className="text-gold-2 underline-offset-2 hover:underline" href={`tel:${b.phone}`}>{b.phone}</a>} />
                <Item label="Age" value={String(b.age)} />
              </dl>

              <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-gold">Call</h3>
              <dl className="mt-3 space-y-2.5 text-sm">
                <Item label="UK time" value={`${formatDate(start, UK, "short")}, ${formatTime(start, UK)}–${formatTime(end, UK)} ${tzAbbrev(start, UK)}`} />
                {differentTz && (
                  <Item
                    label="Their time"
                    value={`${formatTime(start, theirTz, { hour12: prefers12h(theirTz) })} ${tzAbbrev(start, theirTz)} (${tzCity(theirTz)})`}
                  />
                )}
                <Item label="Booked" value={`${formatDate(+new Date(b.createdAt), UK, "short")}, ${formatTime(+new Date(b.createdAt), UK)}`} />
                {b.cancelledAt && <Item label="Cancelled" value={`${formatDate(+new Date(b.cancelledAt), UK, "short")}, ${formatTime(+new Date(b.cancelledAt), UK)}`} />}
              </dl>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={cancelling}
                  className="mt-6 rounded-[8px] border border-red-400/40 px-4 py-2 text-sm text-red-300 transition-colors hover:bg-red-400/10 disabled:opacity-50"
                >
                  {cancelling ? "Cancelling…" : "Cancel booking"}
                </button>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Application answers</h3>
              <div className="mt-3">
                <Answers answers={b.answers} />
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function Answers({ answers }: { answers: ApplicationAnswers }) {
  return (
    <dl className="divide-y divide-line overflow-hidden rounded-[10px] border border-line bg-ink-2 text-sm">
      {answerKeys.map((k) => {
        const v = answers?.[k];
        const text = Array.isArray(v) ? v.join(", ") : v;
        const isLink = k === "websiteOrSocial" && typeof v === "string" && /\./.test(v) && !v.startsWith("@");
        return (
          <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[190px_1fr] sm:gap-4">
            <dt className="text-fg-2">{answerLabels[k]}</dt>
            <dd className="whitespace-pre-wrap break-words text-fg">
              {isLink ? (
                <a
                  href={/^https?:\/\//i.test(v) ? v : `https://${v}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-gold-2 underline-offset-2 hover:underline"
                >
                  {v}
                </a>
              ) : (
                text || "—"
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-3">
      <dt className="text-fg-2">{label}</dt>
      <dd className="break-words text-fg">{value}</dd>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-card border border-dashed border-line px-6 py-16 text-center text-fg-2">{text}</p>;
}

import { isAdmin } from "@/lib/adminAuth";
import { listBookings, listUnbookedApplications } from "@/lib/db";
import { answerLabels, type ApplicationAnswers } from "@/config/application";
import { booking as cfg } from "@/config/booking";

export const dynamic = "force-dynamic";

const ukFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: cfg.businessTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
const uk = (iso: string) => ukFormat.format(new Date(iso)).replace(",", "");

function cell(v: unknown): string {
  let s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Not signed in", { status: 401 });

  const [bookings, unbooked] = await Promise.all([listBookings(), listUnbookedApplications()]);
  const keys = Object.keys(answerLabels) as (keyof ApplicationAnswers)[];
  const header = [
    "Status",
    "Call (UK time)",
    "Name",
    "Email",
    "Phone",
    "Age",
    "Their time zone",
    "Booked at (UK)",
    "Applied at (UK)",
    ...keys.map((k) => answerLabels[k]),
  ];

  const rows = [
    ...bookings.map((b) => [
      b.status === "cancelled" ? "Cancelled" : new Date(b.startAt).getTime() < Date.now() ? "Past" : "Upcoming",
      uk(b.startAt),
      b.name,
      b.email,
      b.phone,
      b.age,
      b.visitorTimeZone,
      uk(b.createdAt),
      uk(b.appliedAt),
      ...keys.map((k) => b.answers?.[k]),
    ]),
    ...unbooked.map((a) => [
      "Applied, not booked",
      "",
      a.fullName,
      "",
      "",
      "",
      "",
      "",
      uk(a.createdAt),
      ...keys.map((k) => a.answers?.[k]),
    ]),
  ];

  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookings-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

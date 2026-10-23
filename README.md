# Jace Sullivan — Business Growth Website + Booking System

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Postgres

- Landing page with a 9-question application
- After applying, visitors book a **free 15-minute call** (age, email and phone collected; name carries over from the application)
- 15-minute calls starting **every 30 minutes, 08:00–21:30 UK time** (15-minute prep break after each), shown to each visitor in **their own time zone**
- **Team dashboard** at `/admin`: a week **calendar** of booked/open slots and breaks, plus a list view with contact details and full application answers

---

## Setup on Vercel (one time, about 5 minutes)

### 1. Add the database
Vercel → your project → **Storage** → **Create Database** → **Neon** (Postgres, free plan is fine) → **Connect** it to this project.
This adds `DATABASE_URL` automatically. The tables are created on their own the first time someone applies.

### 2. Set the dashboard password
Vercel → your project → **Settings → Environment Variables** → add:

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | A strong password, at least 8 characters |

### 3. Redeploy
**Deployments** → ⋯ on the latest → **Redeploy**. (Environment changes only apply to new deployments.)

### 4. Sign in
Go to `https://your-site/admin` and enter the password.

---

## How booking works

1. The visitor answers the application → it's saved.
2. They enter name (pre-filled), email, phone (with country code) and age (18+).
3. They pick a date and time. Their time zone is detected automatically (they can change it), e.g. a New York visitor sees 3:00 AM–4:30 PM instead of 08:00–21:30.
4. They confirm → the call is saved in UK time, and they get Google Calendar / Apple / Outlook buttons.

Built-in safeguards:
- **No double bookings.** The database refuses a second booking for the same slot, even if two people click at the same instant.
- **One upcoming call per person** (matched by application and email).
- **2 hours' minimum notice.** Slots starting sooner are hidden.
- UK clock changes (GMT ↔ BST) are handled automatically.

## The dashboard (`/admin`)

- **Calendar** (default): a week grid of every slot — booked (gold, click for details), open, prep breaks, past/too soon, and closed days — with a live "now" line. Shows one day at a time on phones.
- **List** view: **Upcoming / Past / Cancelled** calls grouped by day, in UK time, with the caller's local time too
- Click a booking to see contact details and **every application answer**
- **Applied, not booked**: people who finished the application but didn't pick a time
- **Search**, **Cancel booking** (frees the slot; doesn't notify them), **Export CSV** (opens in Excel/Sheets)

## Changing availability — `config/booking.ts`

| Setting | Default | Meaning |
|---|---|---|
| `dayStartHour` / `dayEndHour` | 8 / 22 | UK hours. Last call starts 21:30 |
| `slotMinutes` | 15 | Call length |
| `slotIntervalMinutes` | 30 | How often a call can start. The difference (15 min) is your prep break |
| `daysOfWeek` | all 7 | Remove numbers to close days (0 = Sunday … 6 = Saturday) |
| `bookingWindowDays` | 21 | How far ahead people can book |
| `minNoticeMinutes` | 120 | Minimum notice |
| `minAge` | 18 | Minimum age |

## Optional: email notifications

The site doesn't send emails itself. To get an email or Slack message for every booking, set `APPLICATION_WEBHOOK_URL` to a Zapier / Make / n8n webhook. It receives JSON for two events, `application.submitted` and `booking.confirmed` (with name, email, phone, age, time in UTC and both time zones). From there you can email yourself and the client.

## Editing site content — `config/site.ts`

- **`DEVELOPMENT_MODE`** — set to `false` to hide placeholder notes once real content is in
- **Case studies** — `caseStudies` (images go in `public/images/case-studies/`, then set `src`)
- **Program**, **FAQ** — `programIncludes`, `programTerms`, `faqs`

Application questions: `config/application.ts`.

## Without a database

If `DATABASE_URL` isn't set, the application shows a clearly labelled preview screen and nothing is saved (or it's forwarded to `APPLICATION_WEBHOOK_URL` if set). Booking turns on as soon as the database is connected.

## Before going live

- Replace the placeholder **Privacy Policy** (`app/privacy/page.tsx`) and **Terms** (`app/terms/page.tsx`). You're now storing names, emails, phone numbers and ages, so a proper privacy policy is required (UK GDPR).
- Make a test booking yourself, check it appears in `/admin`, then cancel it.

## Run locally (optional)

```
npm install
cp .env.example .env.local   # fill in DATABASE_URL (copy it from Vercel) and ADMIN_PASSWORD
npm run dev
```

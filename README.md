# Jace Sullivan — Business Growth Website

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4. Single landing page with an embedded multi-step application.

## Deploy (GitHub → Vercel)

1. Push this folder to a GitHub repo (`node_modules` and `.next` are already git-ignored).
2. In Vercel: **Add New → Project → import the repo**. Framework is detected as Next.js; no settings to change.
3. Deploy.

Run locally (optional): `npm install` then `npm run dev` → http://localhost:3000

## Turning on real applications

Until this is set, the form runs in **Development Mode**: it works fully, but on submit it shows a clearly labelled preview screen and **nothing is delivered**.

In Vercel → Project → Settings → Environment Variables, add:

| Variable | Required | What it does |
|---|---|---|
| `APPLICATION_WEBHOOK_URL` | Yes | Where each application is POSTed as JSON (Zapier, Make, n8n, a CRM webhook, your own API) |
| `APPLICATION_WEBHOOK_SECRET` | No | Sent as the `x-application-secret` header so your endpoint can verify requests |
| `NEXT_PUBLIC_SITE_URL` | No | Your live domain, e.g. `https://yourdomain.com` (used for share previews) |

Redeploy after adding them. Visitors will then see **"Application Received"**.

The webhook receives one payload:

```json
{
  "answers": {
    "businessType": "...", "biggestChallenge": "...",
    "currentMonthlyRevenue": "...", "targetMonthlyRevenue": "...",
    "growthApproachesTried": ["..."], "fullName": "...",
    "investmentCapacity": "...", "websiteOrSocial": "...",
    "motivationAndBlockers": "..."
  },
  "meta": { "submittedAt": "...", "receivedAt": "...", "pageUrl": "...", "userAgent": "..." }
}
```

Code: `app/api/apply/route.ts` (server, validates + forwards) and `lib/submitApplication.ts` (browser).

## Editing content — `config/site.ts`

Almost everything you'll want to change lives in one file:

- **`DEVELOPMENT_MODE`** — set to `false` to hide all dev notes and placeholder tags once real content is in.
- **Images** — drop files into `public/images/...` and set the matching `src`, e.g. `src: "/images/case-studies/store.jpg"`. While `src` is `null`, a labelled placeholder shows.
  - Case studies: `caseStudies[].image` → `public/images/case-studies/`
- **Evidence note** — `metricsNote` (set to `""` to remove it).
- **Case studies** — `caseStudies` (set `placeholder: false` for real ones; add `link` for full write-ups).
- **Program** — `programIncludes` (set `confirmed: true` and add `detail`), `programTerms.duration` / `.pricing`.
- **FAQ** — `faqs`.

Application questions and validation: `config/application.ts`.

## Before going live

- Replace the placeholder **Privacy Policy** (`app/privacy/page.tsx`) and **Terms** (`app/terms/page.tsx`). You're collecting personal data, so the privacy policy matters.
- Add real images, confirm program details, then set `DEVELOPMENT_MODE = false`.

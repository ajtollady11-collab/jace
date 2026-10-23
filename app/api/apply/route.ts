import { NextResponse } from "next/server";
import { questions, validateAnswer, emptyAnswers, type ApplicationAnswers } from "@/config/application";

/**
 * ─────────────────────────────────────────────────────────────
 *  APPLICATION SUBMISSION ENDPOINT
 * ─────────────────────────────────────────────────────────────
 *  To go live, set these environment variables in Vercel
 *  (Project → Settings → Environment Variables):
 *
 *    APPLICATION_WEBHOOK_URL     = where applications are sent (required)
 *    APPLICATION_WEBHOOK_SECRET  = optional shared secret header
 *
 *  The webhook receives a JSON POST: { answers: {...}, meta: {...} }
 *  Works with Zapier, Make, n8n, a CRM webhook, or your own API.
 *
 *  While APPLICATION_WEBHOOK_URL is NOT set, this route returns
 *  { status: "preview" } and the site shows a DEVELOPMENT MODE
 *  screen. Nothing is stored or delivered in that mode.
 * ─────────────────────────────────────────────────────────────
 */

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid request." }, { status: 400 });
  }

  const incoming = (body as { answers?: Partial<ApplicationAnswers> })?.answers;
  const meta = (body as { meta?: Record<string, unknown> })?.meta ?? {};
  if (!incoming || typeof incoming !== "object") {
    return NextResponse.json({ status: "error", message: "Missing application answers." }, { status: 400 });
  }

  // Re-validate on the server — never trust the browser alone.
  const answers: ApplicationAnswers = { ...emptyAnswers };
  for (const q of questions) {
    const raw = incoming[q.id];
    const value =
      q.type === "multi"
        ? Array.isArray(raw)
          ? raw.filter((x): x is string => typeof x === "string" && !!q.options?.includes(x))
          : []
        : typeof raw === "string"
          ? raw.trim()
          : "";

    if ((q.type === "single") && !q.options?.includes(value as string)) {
      return NextResponse.json(
        { status: "error", message: `Please answer: “${q.question}”` },
        { status: 422 },
      );
    }
    const error = validateAnswer(q, value);
    if (error) {
      return NextResponse.json({ status: "error", message: `${q.question} — ${error}` }, { status: 422 });
    }
    (answers as Record<string, unknown>)[q.id] = value;
  }

  const webhookUrl = process.env.APPLICATION_WEBHOOK_URL;

  // DEVELOPMENT MODE — no backend configured. Be honest: nothing is delivered.
  if (!webhookUrl) {
    return NextResponse.json({ status: "preview" });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.APPLICATION_WEBHOOK_SECRET
          ? { "x-application-secret": process.env.APPLICATION_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify({
        answers,
        meta: {
          submittedAt: typeof meta.submittedAt === "string" ? meta.submittedAt : new Date().toISOString(),
          receivedAt: new Date().toISOString(),
          pageUrl: typeof meta.pageUrl === "string" ? meta.pageUrl : "",
          userAgent: req.headers.get("user-agent") ?? "",
        },
      }),
    });

    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    return NextResponse.json({ status: "received" });
  } catch (err) {
    console.error("Application delivery failed:", err);
    return NextResponse.json(
      {
        status: "error",
        message: "Something went wrong while sending your application. Please try again in a moment.",
      },
      { status: 502 },
    );
  }
}

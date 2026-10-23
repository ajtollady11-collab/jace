import { NextResponse } from "next/server";
import { questions, validateAnswer, emptyAnswers, type ApplicationAnswers } from "@/config/application";
import { createApplication, isDatabaseConfigured } from "@/lib/db";
import { sendWebhook, webhookConfigured } from "@/lib/webhook";

/**
 * ─────────────────────────────────────────────────────────────
 *  APPLICATION SUBMISSION
 * ─────────────────────────────────────────────────────────────
 *  With a database connected (DATABASE_URL), the application is saved
 *  and the visitor goes straight on to book their call.
 *
 *  Without a database:
 *   - APPLICATION_WEBHOOK_URL set → forwarded there, "Application Received"
 *   - nothing set → DEVELOPMENT MODE preview, nothing is stored or sent
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

    if (q.type === "single" && !q.options?.includes(value as string)) {
      return NextResponse.json({ status: "error", message: `Please answer: “${q.question}”` }, { status: 422 });
    }
    const error = validateAnswer(q, value);
    if (error) {
      return NextResponse.json({ status: "error", message: `${q.question} — ${error}` }, { status: 422 });
    }
    (answers as Record<string, unknown>)[q.id] = value;
  }

  const cleanMeta = {
    submittedAt: typeof meta.submittedAt === "string" ? meta.submittedAt.slice(0, 40) : new Date().toISOString(),
    pageUrl: typeof meta.pageUrl === "string" ? meta.pageUrl.slice(0, 500) : "",
    userAgent: (req.headers.get("user-agent") ?? "").slice(0, 300),
  };

  // 1. Database connected → save and continue to booking
  if (isDatabaseConfigured()) {
    try {
      const { id, token } = await createApplication(answers, cleanMeta);
      await sendWebhook("application.submitted", { applicationId: id, answers, meta: cleanMeta });
      return NextResponse.json({ status: "received", bookingEnabled: true, applicationId: id, token });
    } catch (err) {
      console.error("Saving application failed:", err);
      return NextResponse.json(
        { status: "error", message: "Something went wrong while saving your application. Please try again." },
        { status: 500 },
      );
    }
  }

  // 2. Webhook only → forward, no booking calendar
  if (webhookConfigured()) {
    const ok = await sendWebhook("application.submitted", { answers, meta: cleanMeta });
    if (!ok) {
      return NextResponse.json(
        { status: "error", message: "Something went wrong while sending your application. Please try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ status: "received", bookingEnabled: false });
  }

  // 3. Nothing configured → honest preview
  return NextResponse.json({ status: "preview" });
}

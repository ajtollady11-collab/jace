import type { ApplicationAnswers } from "@/config/application";

/**
 * The complete application, sent as ONE payload.
 * This is exactly what your webhook / CRM / database receives.
 */
export type ApplicationPayload = {
  answers: ApplicationAnswers;
  meta: {
    submittedAt: string;
    pageUrl: string;
    userAgent: string;
  };
};

export type SubmitResult =
  | { status: "received" } // delivered to the configured backend
  | { status: "preview" } // DEVELOPMENT MODE — no backend configured, nothing delivered
  | { status: "error"; message: string };

/**
 * Sends the application to our own API route (/app/api/apply/route.ts).
 * The route forwards it server-side to APPLICATION_WEBHOOK_URL, so no
 * secrets or endpoints are ever exposed in the browser.
 */
export async function submitApplication(answers: ApplicationAnswers): Promise<SubmitResult> {
  const payload: ApplicationPayload = {
    answers,
    meta: {
      submittedAt: new Date().toISOString(),
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    },
  };

  try {
    const res = await fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => null)) as { status?: string; message?: string } | null;

    if (res.ok && data?.status === "received") return { status: "received" };
    if (res.ok && data?.status === "preview") return { status: "preview" };

    return {
      status: "error",
      message: data?.message || "We couldn’t submit your application. Please try again in a moment.",
    };
  } catch {
    return {
      status: "error",
      message: "We couldn’t reach our server. Please check your connection and try again.",
    };
  }
}

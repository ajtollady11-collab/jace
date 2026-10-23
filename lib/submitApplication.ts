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
  | { status: "received"; booking?: { applicationId: string; token: string } } // saved; `booking` present when the calendar is live
  | { status: "preview" } // DEVELOPMENT MODE — no backend configured, nothing delivered
  | { status: "error"; message: string };

/**
 * Sends the application to our own API route (/app/api/apply/route.ts),
 * which saves it to the database (and optionally a webhook) server-side,
 * so no secrets or endpoints are ever exposed in the browser.
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
    const data = (await res.json().catch(() => null)) as {
      status?: string;
      message?: string;
      bookingEnabled?: boolean;
      applicationId?: string;
      token?: string;
    } | null;

    if (res.ok && data?.status === "received") {
      return data.bookingEnabled && data.applicationId && data.token
        ? { status: "received", booking: { applicationId: data.applicationId, token: data.token } }
        : { status: "received" };
    }
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

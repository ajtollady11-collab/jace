import "server-only";

/**
 * OPTIONAL: notify another tool (Zapier, Make, n8n, a CRM …) about new
 * applications and bookings, e.g. to email yourself or the client.
 *
 *   APPLICATION_WEBHOOK_URL     = endpoint that accepts a JSON POST
 *   APPLICATION_WEBHOOK_SECRET  = optional, sent as "x-application-secret"
 *
 * Events: "application.submitted", "booking.confirmed"
 */
export function webhookConfigured(): boolean {
  return !!process.env.APPLICATION_WEBHOOK_URL;
}

export async function sendWebhook(event: string, data: Record<string, unknown>): Promise<boolean> {
  const url = process.env.APPLICATION_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.APPLICATION_WEBHOOK_SECRET
          ? { "x-application-secret": process.env.APPLICATION_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify({ event, sentAt: new Date().toISOString(), ...data }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    return true;
  } catch (err) {
    console.error(`Webhook "${event}" failed:`, err);
    return false;
  }
}

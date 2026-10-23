import "server-only";
import { Pool, type PoolClient } from "pg";
import { randomBytes } from "crypto";
import type { ApplicationAnswers } from "@/config/application";

/**
 * ─────────────────────────────────────────────────────────────
 *  DATABASE (Postgres)
 *  Vercel → Storage → Create Database → Neon (Postgres) → connect
 *  to this project. That adds DATABASE_URL automatically.
 *  Tables are created automatically on first use.
 * ─────────────────────────────────────────────────────────────
 */

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

export function isDatabaseConfigured(): boolean {
  return !!databaseUrl();
}

const g = globalThis as unknown as { __jsPool?: Pool; __jsSchema?: Promise<void> };

function pool(): Pool {
  const url = databaseUrl();
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!g.__jsPool) {
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    g.__jsPool = new Pool({
      connectionString: url,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      ssl: local ? false : { rejectUnauthorized: true },
    });
  }
  return g.__jsPool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS applications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token       text NOT NULL,
  full_name   text NOT NULL,
  answers     jsonb NOT NULL,
  meta        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id     uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  start_at           timestamptz NOT NULL,
  end_at             timestamptz NOT NULL,
  name               text NOT NULL,
  email              text NOT NULL,
  phone              text NOT NULL,
  age                integer NOT NULL,
  visitor_time_zone  text NOT NULL,
  status             text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled')),
  created_at         timestamptz NOT NULL DEFAULT now(),
  cancelled_at       timestamptz
);

-- One confirmed booking per time slot (prevents double booking)
CREATE UNIQUE INDEX IF NOT EXISTS bookings_one_per_slot
  ON bookings (start_at) WHERE status = 'confirmed';

-- One confirmed booking per application
CREATE UNIQUE INDEX IF NOT EXISTS bookings_one_per_application
  ON bookings (application_id) WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS bookings_start_idx ON bookings (start_at);
CREATE INDEX IF NOT EXISTS bookings_email_idx ON bookings (lower(email));
CREATE INDEX IF NOT EXISTS applications_created_idx ON applications (created_at DESC);
`;

async function ensureSchema(): Promise<void> {
  if (!g.__jsSchema) {
    g.__jsSchema = (async () => {
      const client = await pool().connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(718293)");
        await client.query(SCHEMA);
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK").catch(() => {});
        g.__jsSchema = undefined;
        throw e;
      } finally {
        client.release();
      }
    })();
  }
  return g.__jsSchema;
}

async function withClient<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  await ensureSchema();
  const client = await pool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);

/* ── Applications ─────────────────────────────────────────── */

export async function createApplication(
  answers: ApplicationAnswers,
  meta: Record<string, unknown>,
): Promise<{ id: string; token: string }> {
  const token = randomBytes(24).toString("base64url");
  return withClient(async (c) => {
    const r = await c.query<{ id: string }>(
      `INSERT INTO applications (token, full_name, answers, meta) VALUES ($1, $2, $3, $4) RETURNING id`,
      [token, answers.fullName, JSON.stringify(answers), JSON.stringify(meta)],
    );
    return { id: r.rows[0].id, token };
  });
}

/* ── Availability ─────────────────────────────────────────── */

export async function getTakenSlots(fromMs: number, toMs: number): Promise<Set<number>> {
  return withClient(async (c) => {
    const r = await c.query<{ start_at: Date }>(
      `SELECT start_at FROM bookings WHERE status = 'confirmed' AND start_at >= $1 AND start_at <= $2`,
      [new Date(fromMs), new Date(toMs)],
    );
    return new Set(r.rows.map((row) => new Date(row.start_at).getTime()));
  });
}

/* ── Bookings ─────────────────────────────────────────────── */

export type NewBooking = {
  applicationId: string;
  token: string;
  startMs: number;
  endMs: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  visitorTimeZone: string;
};

export type BookingResult =
  | { ok: true; id: string }
  | { ok: false; code: "invalid_application" | "slot_taken" | "already_booked"; message: string; existingStart?: number };

export async function createBooking(b: NewBooking): Promise<BookingResult> {
  if (!isUuid(b.applicationId)) {
    return { ok: false, code: "invalid_application", message: "We couldn’t find your application. Please submit it again." };
  }
  return withClient(async (c) => {
    try {
      await c.query("BEGIN");
      const app = await c.query(`SELECT id FROM applications WHERE id = $1 AND token = $2`, [b.applicationId, b.token]);
      if (app.rowCount === 0) {
        await c.query("ROLLBACK");
        return { ok: false, code: "invalid_application", message: "We couldn’t find your application. Please submit it again." };
      }

      // Same person already has an upcoming call?
      const existing = await c.query<{ start_at: Date }>(
        `SELECT start_at FROM bookings
         WHERE status = 'confirmed' AND start_at > now()
           AND (application_id = $1 OR lower(email) = lower($2))
         LIMIT 1`,
        [b.applicationId, b.email],
      );
      if (existing.rowCount) {
        await c.query("ROLLBACK");
        return {
          ok: false,
          code: "already_booked",
          message: "You already have a call booked with us.",
          existingStart: new Date(existing.rows[0].start_at).getTime(),
        };
      }

      const r = await c.query<{ id: string }>(
        `INSERT INTO bookings (application_id, start_at, end_at, name, email, phone, age, visitor_time_zone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [b.applicationId, new Date(b.startMs), new Date(b.endMs), b.name, b.email, b.phone, b.age, b.visitorTimeZone],
      );
      await c.query("COMMIT");
      return { ok: true, id: r.rows[0].id };
    } catch (e: unknown) {
      await c.query("ROLLBACK").catch(() => {});
      const err = e as { code?: string; constraint?: string };
      if (err.code === "23505") {
        if (err.constraint === "bookings_one_per_application") {
          return { ok: false, code: "already_booked", message: "You already have a call booked with us." };
        }
        return { ok: false, code: "slot_taken", message: "Sorry, someone just booked that time. Please pick another slot." };
      }
      throw e;
    }
  });
}

/* ── Admin ────────────────────────────────────────────────── */

export type AdminBooking = {
  id: string;
  applicationId: string;
  startAt: string;
  endAt: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  visitorTimeZone: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
  cancelledAt: string | null;
  answers: ApplicationAnswers;
  appliedAt: string;
};

export type AdminApplication = {
  id: string;
  fullName: string;
  answers: ApplicationAnswers;
  createdAt: string;
};

export async function listBookings(): Promise<AdminBooking[]> {
  return withClient(async (c) => {
    const r = await c.query(
      `SELECT b.*, a.answers, a.created_at AS applied_at
       FROM bookings b JOIN applications a ON a.id = b.application_id
       ORDER BY b.start_at ASC`,
    );
    return r.rows.map((row) => ({
      id: row.id,
      applicationId: row.application_id,
      startAt: new Date(row.start_at).toISOString(),
      endAt: new Date(row.end_at).toISOString(),
      name: row.name,
      email: row.email,
      phone: row.phone,
      age: row.age,
      visitorTimeZone: row.visitor_time_zone,
      status: row.status,
      createdAt: new Date(row.created_at).toISOString(),
      cancelledAt: row.cancelled_at ? new Date(row.cancelled_at).toISOString() : null,
      answers: row.answers,
      appliedAt: new Date(row.applied_at).toISOString(),
    }));
  });
}

/** Applications that never got a confirmed booking */
export async function listUnbookedApplications(): Promise<AdminApplication[]> {
  return withClient(async (c) => {
    const r = await c.query(
      `SELECT a.id, a.full_name, a.answers, a.created_at
       FROM applications a
       WHERE NOT EXISTS (SELECT 1 FROM bookings b WHERE b.application_id = a.id AND b.status = 'confirmed')
       ORDER BY a.created_at DESC
       LIMIT 500`,
    );
    return r.rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      answers: row.answers,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  });
}

export async function cancelBooking(id: string): Promise<boolean> {
  if (!isUuid(id)) return false;
  return withClient(async (c) => {
    const r = await c.query(
      `UPDATE bookings SET status = 'cancelled', cancelled_at = now() WHERE id = $1 AND status = 'confirmed'`,
      [id],
    );
    return (r.rowCount ?? 0) > 0;
  });
}

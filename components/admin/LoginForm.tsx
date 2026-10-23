"use client";

import { useState, type FormEvent } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        window.location.href = "/admin";
        return;
      }
      setError(data.message || "Couldn’t sign in.");
    } catch {
      setError("Couldn’t reach the server. Please try again.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mt-6">
      <label htmlFor="pw" className="mb-2 block text-sm font-medium">
        Password
      </label>
      <input
        id="pw"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-12 w-full rounded-[10px] border border-line bg-ink-2 px-4 text-base text-fg focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold-2/50"
        autoFocus
      />
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy || !password} className="btn btn-gold mt-6 w-full">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";

/** Renders the visitor's current year (updates without a redeploy). */
export default function CurrentYear() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <span suppressHydrationWarning>{year ?? new Date().getFullYear()}</span>;
}

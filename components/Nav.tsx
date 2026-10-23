"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/config/site";
import { Arrow } from "./ui";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll & close on Escape while the mobile menu is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close the menu if the viewport grows to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid ? "border-b border-line/80 bg-ink/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav aria-label="Main" className="container-x flex h-[72px] items-center justify-between gap-6">
        <a
          href="#top"
          onClick={() => setOpen(false)}
          className="whitespace-nowrap font-display text-[0.78rem] font-semibold tracking-[0.22em] text-fg transition-colors hover:text-gold-2 min-[400px]:text-[0.85rem] sm:text-[0.95rem] sm:tracking-[0.32em]"
        >
          JACE SULLIVAN
        </a>

        <ul className="hidden items-center gap-9 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative text-sm text-fg-2 transition-colors hover:text-fg"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href="#apply" className="btn btn-gold !min-h-[42px] !px-4 text-[0.72rem] sm:!px-5" onClick={() => setOpen(false)}>
            Apply Now
            <Arrow className="hidden sm:block" />
          </a>
          <button
            type="button"
            className="relative flex h-[42px] w-[42px] items-center justify-center rounded-[8px] border border-line text-fg lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span
              className={`absolute h-px w-[18px] bg-current transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[4px]"}`}
            />
            <span
              className={`absolute h-px w-[18px] bg-current transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[4px]"}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="h-[calc(100dvh-72px)] overflow-y-auto border-t border-line bg-ink lg:hidden"
      >
        <ul className="container-x flex flex-col py-6">
          {navLinks.map((l, i) => (
            <li key={l.href} className="border-b border-line/70">
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-5 font-display text-2xl font-medium text-fg"
              >
                {l.label}
                <span className="text-xs tracking-[0.2em] text-gold">0{i + 1}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="container-x pb-10">
          <a href="#apply" onClick={() => setOpen(false)} className="btn btn-gold w-full">
            Apply Now <Arrow />
          </a>
          <p className="mt-4 text-center text-sm text-fg-2">Takes around 3 minutes.</p>
        </div>
      </div>
    </header>
  );
}

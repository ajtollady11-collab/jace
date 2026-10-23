"use client";

import { useState } from "react";
import { faqs, DEVELOPMENT_MODE } from "@/config/site";
import Reveal from "./Reveal";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line bg-ink-2 py-24 sm:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-gold/70" />
            FAQ
          </p>
          <h2 id="faq-title" className="mt-5 text-[2.1rem] font-semibold leading-[1.06] sm:text-5xl">
            Questions, <span className="gold-text">answered honestly.</span>
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-fg-2">
            If something isn’t covered here, include it in your application and we’ll address it.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="border-t border-line">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              const id = `faq-${i}`;
              return (
                <div key={f.q} className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      id={`${id}-btn`}
                      aria-expanded={isOpen}
                      aria-controls={`${id}-panel`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                    >
                      <span
                        className={`font-display text-lg font-medium transition-colors sm:text-xl ${
                          isOpen ? "text-gold-2" : "text-fg group-hover:text-gold-2"
                        }`}
                      >
                        {f.q}
                      </span>
                      <span
                        aria-hidden
                        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                          isOpen ? "border-gold bg-gold/10" : "border-line group-hover:border-fg-2/50"
                        }`}
                      >
                        <span className="absolute h-px w-3.5 bg-current text-fg" />
                        <span
                          className={`absolute h-3.5 w-px bg-current text-fg transition-transform duration-300 ${isOpen ? "scale-y-0" : ""}`}
                        />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`${id}-panel`}
                    role="region"
                    aria-labelledby={`${id}-btn`}
                    className={`grid transition-[grid-template-rows] duration-400 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden" inert={!isOpen}>
                      <div className="max-w-2xl pb-7 pr-12">
                        <p className="leading-relaxed text-fg-2">{f.a}</p>
                        {DEVELOPMENT_MODE && f.devNote && (
                          <p className="mt-3 text-sm leading-relaxed text-gold/90">{f.devNote}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

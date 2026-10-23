const labels = ["E-Commerce", "Coaching", "Consulting", "Digital Products", "Online Businesses"];

export default function TrustStrip() {
  return (
    <section aria-label="Who we work with" className="relative border-y border-line bg-ink-2">
      <div className="container-x flex flex-col items-center gap-4 py-6 md:flex-row md:justify-between md:gap-8">
        <p className="shrink-0 text-[0.7rem] uppercase tracking-[0.22em] text-fg-2">We work with</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 md:justify-end md:gap-x-7">
          {labels.map((l, i) => (
            <li key={l} className="flex items-center gap-5 md:gap-7">
              {i > 0 && <span aria-hidden className="h-1 w-1 rotate-45 bg-gold/70" />}
              <span className="font-display text-[0.78rem] font-medium uppercase tracking-[0.2em] text-fg/85 sm:text-[0.82rem]">
                {l}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

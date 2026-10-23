import Reveal from "./Reveal";
import { SectionHeading } from "./ui";

const good = [
  "You have a clear business or offer.",
  "You want to understand what’s limiting growth.",
  "You’re willing to implement and test changes.",
  "You value a structured strategy over random tactics.",
  "You’re serious about building a more scalable business.",
];

const notFit = [
  "You expect guaranteed results without execution.",
  "You are unwilling to measure performance.",
  "You want a shortcut without understanding your business.",
  "You’re unwilling to make changes when the evidence supports them.",
];

export default function Fit() {
  return (
    <section aria-labelledby="fit-title" className="border-t border-line bg-ink-2 py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          id="fit-title"
          eyebrow="Who We Work With"
          align="center"
          title={
            <>
              We Work Best With Founders Who Are <span className="gold-text">Serious About Growth.</span>
            </>
          }
        />

        <div className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-2">
          <Reveal className="h-full">
            <div className="relative h-full overflow-hidden rounded-card border border-gold/35 bg-card p-7 sm:p-10">
              <div aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-gold via-gold-2 to-gold/20" />
              <div
                aria-hidden
                className="absolute -right-24 -top-24 h-64 w-64 rounded-full"
                style={{ background: "radial-gradient(closest-side, rgba(200,169,107,0.10), transparent)" }}
              />
              <h3 className="eyebrow relative !text-[0.8rem]">We may be a good fit if…</h3>
              <ul className="relative mt-8 space-y-1">
                {good.map((g) => (
                  <li key={g} className="flex items-start gap-4 border-b border-line/70 py-4 last:border-0">
                    <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-2">
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                        <path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[0.98rem] leading-relaxed text-fg sm:text-[1.05rem]">{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100} className="h-full">
            <div className="h-full rounded-card border border-line bg-card/50 p-7 sm:p-10">
              <h3 className="font-display text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-fg-2">
                We may not be the right fit if…
              </h3>
              <ul className="mt-8 space-y-1">
                {notFit.map((g) => (
                  <li key={g} className="flex items-start gap-4 border-b border-line/70 py-4 last:border-0">
                    <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-fg-2">
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                        <path d="M3 6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="text-[0.98rem] leading-relaxed text-fg-2 sm:text-[1.05rem]">{g}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-line pt-6 text-sm leading-relaxed text-fg-2/80">
                Early-stage businesses are welcome to apply. What matters most is a willingness to execute.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

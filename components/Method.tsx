import Reveal from "./Reveal";
import { SectionHeading, ApplyButton } from "./ui";

const stages = [
  {
    n: "01",
    title: "Diagnose",
    text: "Understand the business model, current performance, bottlenecks, and opportunities.",
    icon: (
      <>
        <circle cx="14" cy="14" r="8" />
        <path d="M20 20l7 7" />
        <path d="M10.5 14h7M14 10.5v7" strokeOpacity=".5" />
      </>
    ),
  },
  {
    n: "02",
    title: "Optimise",
    text: "Identify improvements to the offer, customer journey, conversion process, and sales systems where relevant.",
    icon: (
      <>
        <path d="M5 9h22M5 16h22M5 23h22" strokeOpacity=".45" />
        <circle cx="11" cy="9" r="2.6" />
        <circle cx="21" cy="16" r="2.6" />
        <circle cx="14" cy="23" r="2.6" />
      </>
    ),
  },
  {
    n: "03",
    title: "Acquire",
    text: "Develop a more structured approach to reaching and converting suitable customers.",
    icon: (
      <>
        <circle cx="16" cy="16" r="11" strokeOpacity=".45" />
        <circle cx="16" cy="16" r="6" />
        <circle cx="16" cy="16" r="1.6" fill="currentColor" />
      </>
    ),
  },
  {
    n: "04",
    title: "Scale",
    text: "Build repeatable systems and improve what is working as the business grows.",
    icon: (
      <>
        <path d="M5 26h6v-6h6v-6h6V8h4" />
        <path d="M5 26h22" strokeOpacity=".45" />
      </>
    ),
  },
];

export default function Method() {
  return (
    <section id="method" aria-labelledby="method-title" className="relative overflow-hidden border-y border-line bg-ink-2 py-24 sm:py-32">
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-50" style={{ maskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)" }} />

      <div className="container-x relative">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
          <SectionHeading
            id="method-title"
            eyebrow="Our Method"
            title={
              <>
                Growth Should Be Built, <span className="gold-text">Not Left To Guesswork.</span>
              </>
            }
          />
          <Reveal delay={100}>
            <p className="text-base leading-relaxed text-fg-2 sm:text-lg">
              We help business owners take a more structured approach to growth by identifying bottlenecks,
              prioritising opportunities, and building systems around what works.
            </p>
          </Reveal>
        </div>

        <ol className="relative mt-16 grid gap-4 md:grid-cols-2 lg:mt-24 lg:grid-cols-4 lg:gap-0">
          {/* connecting line (desktop) */}
          <div aria-hidden className="absolute left-[27px] right-[calc(25%-27px)] top-[27px] hidden h-px bg-line lg:block">
            <div className="h-full w-full bg-gradient-to-r from-gold/70 via-gold/30 to-gold/70" />
          </div>
          {/* connecting line (mobile) */}
          <div aria-hidden className="absolute bottom-8 left-[27px] top-8 w-px bg-gradient-to-b from-gold/60 via-line to-gold/40 md:hidden" />

          {stages.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 110} className="relative flex gap-5 lg:flex-col lg:gap-0 lg:pr-8">
              <div className="relative z-10 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border border-gold/50 bg-ink-2 text-gold-2 shadow-[0_0_0_6px_var(--color-ink-2)]">
                <svg aria-hidden viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {s.icon}
                </svg>
              </div>
              <div className="flex-1 rounded-card border border-line bg-card/70 p-6 transition-colors duration-500 hover:border-gold/35 lg:mt-8 lg:p-7">
                <p className="font-display text-5xl font-semibold leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(200,169,107,0.65)] lg:text-6xl">
                  {s.n}
                </p>
                <h3 className="mt-5 text-xl font-semibold sm:text-2xl">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-2">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-line pt-10 sm:flex-row sm:items-center">
          <p className="max-w-xl text-sm leading-relaxed text-fg-2">
            Every business starts from a different place. The method gives us structure; what we prioritise depends
            on your model, stage and constraints.
          </p>
          <ApplyButton />
        </Reveal>
      </div>
    </section>
  );
}

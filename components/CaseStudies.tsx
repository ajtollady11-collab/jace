import { caseStudies, metricsNote, DEVELOPMENT_MODE } from "@/config/site";
import ImageSlot from "./ImageSlot";
import Reveal from "./Reveal";
import { SectionHeading, DevNote, Arrow } from "./ui";

export default function CaseStudies() {
  return (
    <section id="results" aria-labelledby="results-title" className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          id="results-title"
          eyebrow="The Growth Journey"
          title={
            <>
              Different Businesses. Different Bottlenecks. <span className="gold-text">A Clearer Path Forward.</span>
            </>
          }
          intro="Every business has different constraints. Our approach starts with understanding what’s working, what’s not, and where the biggest opportunities may lie."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {caseStudies.map((c, i) => (
            <Reveal key={i} delay={i * 90} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-card transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-gold/40">
                <div className="relative">
                  <ImageSlot image={c.image} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="aspect-[16/10] w-full" />
                  <span className="absolute left-4 top-4 rounded-full border border-line bg-black/55 px-3 py-1 font-display text-[0.65rem] font-semibold tracking-[0.2em] text-fg backdrop-blur">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    {c.placeholder && <span className="dev-tag">Case study placeholder</span>}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold sm:text-[1.4rem]">{c.focus}</h3>

                  <dl className="mt-6 flex-1 divide-y divide-line border-y border-line text-sm">
                    <Row label="Business type" value={c.businessType} />
                    <Row label="Challenge" value={c.challenge} pending={c.placeholder} />
                    <Row label="Strategy" value={c.strategy} pending={c.placeholder} />
                    <Row label="Verified outcome" value={c.verifiedOutcome} pending={c.placeholder} />
                    <Row label="Time period" value={c.timePeriod} pending={c.placeholder} />
                  </dl>

                  {c.link ? (
                    <a href={c.link} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-2 hover:text-gold">
                      Read the full case study <Arrow />
                    </a>
                  ) : (
                    <p className="mt-6 text-sm text-fg-2/70">Full case study coming soon</p>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {DEVELOPMENT_MODE && metricsNote && <DevNote className="mt-6">{metricsNote}</DevNote>}
      </div>
    </section>
  );
}

function Row({ label, value, pending }: { label: string; value: string; pending?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-fg-2">{label}</dt>
      <dd className={`text-right ${pending ? "italic text-fg-2/60" : "text-fg"}`}>{value}</dd>
    </div>
  );
}

import { programIncludes, programTerms, DEVELOPMENT_MODE } from "@/config/site";
import Reveal from "./Reveal";
import { ApplyButton } from "./ui";

export default function Program() {
  const anyUnconfirmed =
    programIncludes.some((p) => !p.confirmed) || !programTerms.duration || !programTerms.pricing;

  return (
    <section id="program" aria-labelledby="program-title" className="py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[20px] border border-line bg-card">
            <div aria-hidden className="hairline-gold absolute inset-x-0 top-0" />
            <div className="grid lg:grid-cols-[1fr_1.15fr]">
              {/* Left */}
              <div className="relative flex flex-col justify-between gap-10 border-b border-line p-7 sm:p-12 lg:border-b-0 lg:border-r">
                <div
                  aria-hidden
                  className="absolute -left-32 -top-32 h-80 w-80 rounded-full"
                  style={{ background: "radial-gradient(closest-side, rgba(200,169,107,0.09), transparent)" }}
                />
                <div className="relative">
                  <p className="eyebrow flex items-center gap-3">
                    <span aria-hidden className="h-px w-8 bg-gold/70" />
                    Our Program
                  </p>
                  <h2 id="program-title" className="mt-5 text-[2.1rem] font-semibold leading-[1.06] sm:text-5xl">
                    A More Structured <span className="gold-text">Way To Scale.</span>
                  </h2>
                  <p className="mt-6 text-base leading-relaxed text-fg-2 sm:text-lg">
                    Our program is designed to help business owners understand their biggest growth constraints and
                    build a clearer plan for moving forward.
                  </p>
                </div>

                <div className="relative">
                  <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-line bg-line">
                    <Term label="Program duration" value={programTerms.duration} />
                    <Term label="Investment" value={programTerms.pricing} />
                  </dl>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <ApplyButton />
                    <p className="text-sm text-fg-2">Details are discussed with suitable applicants.</p>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="p-7 sm:p-12">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-fg-2">
                    What the program may include
                  </h3>
                  {DEVELOPMENT_MODE && anyUnconfirmed && <span className="dev-tag">Offer not yet finalised</span>}
                </div>
                <ul className="mt-6">
                  {programIncludes.map((p, i) => (
                    <li key={p.label} className="group flex items-start gap-5 border-b border-line py-5 last:border-0">
                      <span className="mt-0.5 font-display text-xs font-semibold text-gold/80">{String(i + 1).padStart(2, "0")}</span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                          <p className="font-display text-[1.05rem] font-medium text-fg transition-colors group-hover:text-gold-2">
                            {p.label}
                          </p>
                          {DEVELOPMENT_MODE && !p.confirmed && (
                            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-gold/70">
                              Placeholder
                            </span>
                          )}
                        </div>
                        {p.detail && <p className="mt-1.5 text-sm leading-relaxed text-fg-2">{p.detail}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Term({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="bg-ink-2 p-5">
      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fg-2">{label}</dt>
      <dd className="mt-2">
        {value ? (
          <span className="font-display text-xl font-semibold text-fg">{value}</span>
        ) : DEVELOPMENT_MODE ? (
          <span className="flex flex-col items-start gap-2">
            <span className="font-display text-base font-medium text-fg-2">To be confirmed</span>
            <span className="dev-tag !text-[0.55rem]">Placeholder</span>
          </span>
        ) : (
          <span className="font-display text-base font-medium text-fg-2">Discussed on application</span>
        )}
      </dd>
    </div>
  );
}

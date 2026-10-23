import { founder, team, metrics, metricsNote, DEVELOPMENT_MODE, type TeamMember } from "@/config/site";
import ImageSlot from "./ImageSlot";
import Reveal from "./Reveal";
import { DevNote } from "./ui";

export default function Team() {
  return (
    <section id="about" aria-labelledby="team-title" className="relative py-24 sm:py-32">
      <div className="container-x">
        {/* Heading */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-gold/70" />
              The People Behind The Strategy
            </p>
            <h2 id="team-title" className="mt-5 text-[2.1rem] font-semibold leading-[1.06] sm:text-5xl lg:text-[3.4rem]">
              Growth Is Easier When You Know <span className="gold-text">What To Fix</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-base leading-relaxed text-fg-2 sm:text-lg">
              Scaling a business requires more than another tactic. It takes a clear strategy, effective execution,
              and a better understanding of what is holding growth back. Our team brings a structured approach to
              identifying opportunities and helping businesses move forward.
            </p>
          </Reveal>
        </div>

        {/* Team grid */}
        <div className="mt-14 grid gap-4 sm:gap-5 lg:mt-20 lg:grid-cols-[5fr_7fr]">
          <Reveal className="h-full">
            <FounderCard member={founder} />
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {team.map((m, i) => (
              <Reveal key={m.name} delay={80 * (i + 1)}>
                <MemberCard member={m} index={i + 2} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* Evidence / metrics */}
        <Reveal className="mt-5">
          <div className="overflow-hidden rounded-card border border-line bg-ink-2">
            <div className="grid lg:grid-cols-[1fr_1.3fr]">
              <div className="border-b border-line p-7 sm:p-9 lg:border-b-0 lg:border-r">
                <p className="eyebrow">Our standard for evidence</p>
                <h3 className="mt-4 text-2xl font-semibold leading-tight sm:text-[1.7rem]">
                  We only publish results we can verify.
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-fg-2">
                  No borrowed screenshots and no inflated numbers. Each figure here will be backed by documented
                  client work before it appears on this page.
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-px bg-line">
                {metrics.map((m) => (
                  <div key={m.label} className="flex flex-col justify-between gap-6 bg-ink-2 p-6 sm:p-8">
                    <dd className="order-1">
                      {m.value ? (
                        <span className="font-display text-4xl font-semibold text-gold-2 sm:text-5xl">{m.value}</span>
                      ) : (
                        <span className="flex flex-col items-start gap-3">
                          <span aria-hidden className="font-display text-4xl font-light leading-none text-fg-2/40 sm:text-5xl">
                            —
                          </span>
                          <span className="dev-tag !whitespace-normal">Awaiting verification</span>
                        </span>
                      )}
                    </dd>
                    <dt className="order-2 text-sm leading-snug text-fg-2">{m.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          {DEVELOPMENT_MODE && metricsNote && <DevNote className="mt-4">{metricsNote}</DevNote>}
        </Reveal>
      </div>
    </section>
  );
}

function FounderCard({ member }: { member: TeamMember }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-gold/30 bg-card transition-colors duration-500 hover:border-gold/60">
      <div className="relative min-h-[380px] flex-1 sm:min-h-[460px]">
        <div className="absolute inset-0">
          <ImageSlot image={member.image} variant="portrait" sizes="(min-width: 1024px) 40vw, 100vw" className="h-full w-full" />
        </div>
        <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-black/50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold-2 backdrop-blur">
          Founder
        </span>
      </div>
      <div className="border-t border-line p-6 sm:p-7">
        <h3 className="text-2xl font-semibold sm:text-[1.75rem]">{member.name}</h3>
        <p className="mt-1.5 text-sm uppercase tracking-[0.14em] text-gold">{member.role}</p>
        {member.bio ? (
          <p className="mt-4 text-sm leading-relaxed text-fg-2">{member.bio}</p>
        ) : (
          DEVELOPMENT_MODE && <p className="mt-4 text-sm italic text-fg-2/70">Bio to be added.</p>
        )}
      </div>
    </article>
  );
}

function MemberCard({ member, index }: { member: TeamMember; index: number }) {
  return (
    <article className="group h-full overflow-hidden rounded-card border border-line bg-card transition-colors duration-500 hover:border-gold/40">
      <ImageSlot
        image={member.image}
        variant="portrait"
        compactLabel
        sizes="(min-width: 1024px) 22vw, 50vw"
        className="aspect-[4/4.2] w-full"
      />
      <div className="border-t border-line p-4 sm:p-5">
        <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-gold/80">{String(index).padStart(2, "0")}</p>
        <h3 className="mt-1.5 text-base font-semibold sm:text-lg">{member.name}</h3>
        <p className="mt-1 text-xs leading-snug text-fg-2 sm:text-sm">{member.role}</p>
        {member.bio && <p className="mt-3 text-sm leading-relaxed text-fg-2">{member.bio}</p>}
        {!member.image.src && DEVELOPMENT_MODE && (
          <p className="mt-3 text-[0.6rem] uppercase leading-snug tracking-[0.16em] text-gold/70">
            <span className="sm:hidden">Image placeholder</span>
            <span className="hidden sm:inline">{member.image.placeholderLabel}</span>
          </p>
        )}
      </div>
    </article>
  );
}

import Reveal from "./Reveal";
import { ApplyButton } from "./ui";

export default function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden py-24 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="grid-bg absolute inset-0"
          style={{ maskImage: "radial-gradient(ellipse 60% 70% at 50% 50%, black, transparent 75%)" }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(200,169,107,0.11), transparent)" }}
        />
      </div>

      <div className="container-x relative">
        <Reveal>
          <div className="relative mx-auto max-w-5xl px-2 py-14 text-center sm:px-10 sm:py-20">
            {/* frame corners */}
            <span aria-hidden className="absolute left-0 top-0 h-10 w-10 border-l border-t border-gold/60 sm:h-14 sm:w-14" />
            <span aria-hidden className="absolute right-0 top-0 h-10 w-10 border-r border-t border-gold/60 sm:h-14 sm:w-14" />
            <span aria-hidden className="absolute bottom-0 left-0 h-10 w-10 border-b border-l border-gold/60 sm:h-14 sm:w-14" />
            <span aria-hidden className="absolute bottom-0 right-0 h-10 w-10 border-b border-r border-gold/60 sm:h-14 sm:w-14" />

            <p className="eyebrow">Your next step</p>
            <h2
              id="cta-title"
              className="mx-auto mt-6 max-w-4xl text-[2.3rem] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-[4.4rem]"
            >
              Your Next Stage Of Growth Starts With <span className="gold-text">A Better Plan.</span>
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-fg-2 sm:text-lg">
              Get clear on what’s holding your business back, where the biggest opportunities may lie, and what it
              could take to move forward.
            </p>
            <div className="mt-10 flex justify-center">
              <ApplyButton className="w-full sm:w-auto sm:!px-10" />
            </div>
            <p className="mt-6 text-sm text-fg-2">For founders ready to take a more intentional approach to growth.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { images, founder } from "@/config/site";
import ImageSlot from "./ImageSlot";
import { Arrow } from "./ui";

export default function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pt-[72px]">
      {/* Background: fine grid, warm key light, hairlines */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="grid-bg absolute inset-0"
          style={{ maskImage: "radial-gradient(ellipse 80% 70% at 60% 30%, black, transparent 75%)" }}
        />
        <div
          className="absolute -top-40 right-[-10%] h-[720px] w-[720px] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(200,169,107,0.13), transparent)" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <div className="container-x relative grid items-center gap-14 pb-20 pt-12 sm:pt-16 lg:min-h-[calc(100svh-72px)] lg:grid-cols-[1.3fr_1fr] lg:gap-12 lg:pb-24 lg:pt-10 xl:gap-20">
        {/* Copy */}
        <div className="max-w-[680px]">
          <p className="eyebrow hero-in flex items-center gap-3" style={{ animationDelay: "60ms" }}>
            <span aria-hidden className="h-px w-8 bg-gold/70" />
            For Ambitious Founders &amp; Business Owners
          </p>

          <h1
            id="hero-title"
            className="hero-in mt-7 text-[2.65rem] font-semibold leading-[1.02] tracking-[-0.035em] min-[400px]:text-[3rem] sm:text-[4rem] lg:text-[3.35rem] xl:text-[3.95rem]"
            style={{ animationDelay: "140ms" }}
          >
            Turn Your Business <br className="hidden lg:block" />
            Into a <span className="gold-text">Scalable <br className="hidden lg:block" />
            Growth Machine</span>
          </h1>

          <p
            className="hero-in mt-7 max-w-[540px] text-[1.0625rem] leading-relaxed text-fg-2 sm:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            Build a smarter growth strategy, attract more of the right customers, and create the systems your
            business needs to reach its next level.
          </p>

          <div className="hero-in mt-10 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "320ms" }}>
            <a href="#apply" className="btn btn-gold">
              Apply Now <Arrow />
            </a>
            <a href="#method" className="btn btn-ghost">
              Discover Our Method
            </a>
          </div>

          <p
            className="hero-in mt-8 flex max-w-[520px] items-start gap-3 border-l border-gold/40 pl-4 text-sm leading-relaxed text-fg-2"
            style={{ animationDelay: "400ms" }}
          >
            We work with e-commerce brands, coaches, consultants, and digital businesses ready to grow.
          </p>
        </div>

        {/* Image composition */}
        <div className="hero-in relative mx-auto w-full max-w-[560px] lg:max-w-none" style={{ animationDelay: "200ms" }}>
          {/* offset frame */}
          <div aria-hidden className="absolute -right-3 -top-3 bottom-10 left-10 rounded-card border border-gold/25 sm:-right-5 sm:-top-5" />

          <div className="group relative overflow-hidden rounded-card border border-line shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
            <ImageSlot
              image={images.hero}
              variant="group"
              priority
              labelPosition="top"
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="aspect-[4/5] w-full sm:aspect-[5/5.4]"
            />
          </div>

          {/* founder caption card */}
          <div className="drift absolute -bottom-6 -left-2 w-[min(78%,290px)] rounded-[12px] border border-line bg-card-2/95 p-4 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur sm:-left-8 sm:p-5">
            <div className="flex items-center gap-3">
              <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 font-display text-xs font-semibold tracking-[0.12em] text-gold-2">
                JS
              </span>
              <div className="min-w-0">
                <p className="font-display text-[0.95rem] font-semibold leading-tight">{founder.name}</p>
                <p className="mt-0.5 truncate text-xs text-fg-2">{founder.role}</p>
              </div>
            </div>
            <div className="hairline-gold mt-4" />
            <p className="mt-3 text-xs leading-relaxed text-fg-2">Founder-led growth strategy, supported by our team.</p>
          </div>

          {/* vertical label */}
          <p
            aria-hidden
            className="absolute -right-12 top-8 hidden text-[0.62rem] tracking-[0.35em] text-fg-2/50 [writing-mode:vertical-rl] xl:block"
          >
            DIAGNOSE · OPTIMISE · ACQUIRE · SCALE
          </p>
        </div>
      </div>
    </section>
  );
}

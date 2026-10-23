import { Arrow } from "./ui";

export default function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pt-[72px]">
      {/* Background: fine grid, warm key light */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="grid-bg absolute inset-0"
          style={{ maskImage: "radial-gradient(ellipse 70% 65% at 50% 40%, black, transparent 75%)" }}
        />
        <div
          className="absolute left-1/2 top-[-280px] h-[760px] w-[1000px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(200,169,107,0.13), transparent)" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <div className="container-x relative flex flex-col items-center pb-24 pt-16 text-center sm:pt-24 lg:min-h-[calc(88svh-72px)] lg:justify-center lg:pb-28 lg:pt-16">
        <p className="eyebrow hero-in flex items-center justify-center gap-3" style={{ animationDelay: "60ms" }}>
          <span aria-hidden className="hidden h-px w-8 bg-gold/70 sm:block" />
          For Ambitious Founders &amp; Business Owners
          <span aria-hidden className="hidden h-px w-8 bg-gold/70 sm:block" />
        </p>

        <h1
          id="hero-title"
          className="hero-in mx-auto mt-7 max-w-[1180px] text-[2.65rem] font-semibold leading-[1.02] tracking-[-0.035em] min-[400px]:text-[3rem] sm:text-[3.6rem] md:text-[4rem] lg:text-[4.3rem] xl:text-[5.2rem]"
          style={{ animationDelay: "140ms" }}
        >
          Turn Your Business Into a <br className="hidden lg:block" />
          <span className="gold-text">Scalable Growth Machine</span>
        </h1>

        <p
          className="hero-in mx-auto mt-8 max-w-[600px] text-[1.0625rem] leading-relaxed text-fg-2 sm:text-lg"
          style={{ animationDelay: "240ms" }}
        >
          Build a smarter growth strategy, attract more of the right customers, and create the systems your business
          needs to reach its next level.
        </p>

        <div
          className="hero-in mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"
          style={{ animationDelay: "320ms" }}
        >
          <a href="#apply" className="btn btn-gold">
            Apply Now <Arrow />
          </a>
          <a href="#method" className="btn btn-ghost">
            Discover Our Method
          </a>
        </div>

        <div className="hero-in mt-12 flex flex-col items-center gap-4" style={{ animationDelay: "400ms" }}>
          <div aria-hidden className="hairline-gold w-40" />
          <p className="max-w-[460px] text-sm leading-relaxed text-fg-2">
            We work with e-commerce brands, coaches, consultants, and digital businesses ready to grow.
          </p>
        </div>
      </div>
    </section>
  );
}

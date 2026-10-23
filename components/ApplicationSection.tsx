import ApplicationQuiz from "./ApplicationQuiz";
import Reveal from "./Reveal";

const nextSteps = [
  { n: "01", title: "Apply", text: "Answer nine short questions about your business and goals." },
  { n: "02", title: "Review", text: "Our team reviews every application individually." },
  { n: "03", title: "Conversation", text: "If there’s a potential fit, you’ll be invited to book a call." },
];

export default function ApplicationSection() {
  return (
    <section id="apply" aria-labelledby="apply-title" className="relative border-y border-line bg-ink-2 py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[-15%] top-1/3 h-[600px] w-[600px] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(200,169,107,0.07), transparent)" }}
        />
      </div>

      <div className="container-x relative grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-24">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-gold/70" />
            Our Application
          </p>
          <h2 id="apply-title" className="mt-5 text-[2.1rem] font-semibold leading-[1.06] sm:text-5xl lg:text-[3.2rem]">
            Let’s Find Your Next <span className="gold-text">Growth Opportunity</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-fg-2 sm:text-lg">
            Tell us about your business, where you want to take it, and what’s currently holding you back.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-fg-2/80">
            Answer a few questions so we can understand your business and assess whether our program is the right
            fit.
          </p>

          <ol className="mt-10 hidden border-t border-line lg:block">
            {nextSteps.map((s) => (
              <li key={s.n} className="flex gap-5 border-b border-line py-5">
                <span className="font-display text-sm font-semibold text-gold">{s.n}</span>
                <div>
                  <p className="font-display font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-fg-2">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <div>
          <ApplicationQuiz />
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-fg-2">
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
              <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Your answers are only used to review your application.
          </p>
        </div>
      </div>
    </section>
  );
}

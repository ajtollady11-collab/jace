import Reveal from "./Reveal";
import { SectionHeading } from "./ui";

const items = [
  { title: "Offer & Positioning", text: "Clarify your offer, its value, and why the right customer should choose it." },
  { title: "Customer Acquisition", text: "Identify and improve suitable ways to attract potential customers." },
  { title: "Conversion & Sales", text: "Find opportunities to turn more qualified prospects into customers." },
  { title: "Customer Value", text: "Explore ways to improve customer value, retention, and repeat purchases where relevant." },
  { title: "Systems & Operations", text: "Identify bottlenecks and create more repeatable processes." },
  { title: "Growth Strategy", text: "Prioritise the opportunities most relevant to your business’s stage and model." },
];

export default function Capabilities() {
  return (
    <section aria-labelledby="levers-title" className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          id="levers-title"
          eyebrow="What We Help With"
          title={
            <>
              Focus On The Levers That <span className="gold-text">Actually Move Your Business Forward.</span>
            </>
          }
        />

        <Reveal className="mt-14 lg:mt-20">
          <ul className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
              <li
                key={it.title}
                className="group relative bg-card p-7 transition-colors duration-500 hover:bg-card-2 sm:p-9"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-px w-0 bg-gold transition-all duration-700 group-hover:w-full"
                />
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-sm font-semibold text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    aria-hidden
                    className="h-2 w-2 rotate-45 border border-fg-2/40 transition-colors duration-500 group-hover:border-gold group-hover:bg-gold"
                  />
                </div>
                <h3 className="mt-10 text-xl font-semibold sm:text-[1.4rem]">{it.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-2 sm:text-[0.95rem]">{it.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

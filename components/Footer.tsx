import Link from "next/link";
import { navLinks, site } from "@/config/site";
import CurrentYear from "./CurrentYear";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink-2">
      <div className="container-x py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href="#top" className="font-display text-base font-semibold tracking-[0.32em] text-fg hover:text-gold-2">
              JACE SULLIVAN
            </a>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-fg-2">{site.footerBlurb}</p>
            <a href="#apply" className="btn btn-gold mt-8 !min-h-[46px] text-[0.72rem]">
              Start Your Application
            </a>
          </div>

          <nav aria-label="Footer">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-fg-2/70">Explore</p>
            <ul className="mt-5 space-y-3 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-fg-2 transition-colors hover:text-gold-2">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#faq" className="text-fg-2 transition-colors hover:text-gold-2">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#apply" className="text-gold transition-colors hover:text-gold-2">
                  Apply
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-fg-2/70">Legal</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-fg-2 transition-colors hover:text-gold-2">
                  Privacy Policy <span className="text-xs text-gold/70">(placeholder)</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-fg-2 transition-colors hover:text-gold-2">
                  Terms of Service <span className="text-xs text-gold/70">(placeholder)</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline-gold mt-16 opacity-40" />
        <div className="mt-8 flex flex-col gap-3 text-xs text-fg-2/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> Jace Sullivan. All rights reserved.
          </p>
          <p>Results vary. No specific outcome is guaranteed.</p>
        </div>
      </div>
    </footer>
  );
}

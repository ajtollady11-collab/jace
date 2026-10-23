import type { ReactNode } from "react";
import Reveal from "./Reveal";

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={`arrow h-3.5 w-3.5 ${className}`} fill="none">
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ApplyButton({ label = "Apply Now", className = "" }: { label?: string; className?: string }) {
  return (
    <a href="#apply" className={`btn btn-gold ${className}`}>
      {label}
      <Arrow />
    </a>
  );
}

type HeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  id?: string;
  className?: string;
};

export function SectionHeading({ eyebrow, title, intro, align = "left", id, className = "" }: HeadingProps) {
  const centered = align === "center";
  return (
    <Reveal className={`${centered ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && (
        <p className={`eyebrow flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
          <span aria-hidden className="h-px w-8 bg-gold/70" />
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="mt-5 text-[2.1rem] font-semibold leading-[1.06] sm:text-5xl lg:text-[3.4rem]">
        {title}
      </h2>
      {intro && <p className="mt-6 text-base leading-relaxed text-fg-2 sm:text-lg">{intro}</p>}
    </Reveal>
  );
}

export function DevNote({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`flex items-start gap-3 rounded-[10px] border border-dashed border-gold/35 bg-gold/[0.04] px-4 py-3 text-sm leading-relaxed text-fg-2 ${className}`}
    >
      <span className="dev-tag mt-0.5 shrink-0">Dev note</span>
      <span>{children}</span>
    </p>
  );
}

/**
 * ─────────────────────────────────────────────────────────────
 *  CENTRAL SITE CONFIGURATION
 *  Edit this file to update case studies, images,
 *  program details and FAQ answers.
 * ─────────────────────────────────────────────────────────────
 *
 *  IMAGES
 *  Put image files in /public/images/... and set the matching `src`
 *  below, e.g.  src: "/images/case-studies/store.jpg"
 *  While `src` is null, a labelled placeholder is shown instead.
 */

/**
 * DEVELOPMENT MODE
 * While true, the site shows small notes explaining that case studies
 * and program details are placeholders.
 * Set to false once real evidence and offer details are added.
 */
export const DEVELOPMENT_MODE = true;

export const site = {
  name: "Jace Sullivan",
  title: "Jace Sullivan | Business Growth Strategy",
  description:
    "Discover a more structured approach to business growth. Explore how we help e-commerce founders, coaches, consultants, and online businesses identify opportunities to scale.",
  footerBlurb:
    "A founder-led business growth program helping e-commerce brands, coaches, consultants and online businesses build a more structured approach to growth.",
};

export const navLinks = [
  { label: "Home", href: "#top" },
  { label: "Our Method", href: "#method" },
  { label: "Results", href: "#results" },
] as const;

/* ── Images ────────────────────────────────────────────────── */

export type ImageAsset = {
  /** Path inside /public, e.g. "/images/case-studies/store.jpg". null = show placeholder */
  src: string | null;
  alt: string;
  /** Label shown on the placeholder while src is null */
  placeholderLabel: string;
};

/* ── Evidence note ───────────────────────────────────────── */

/** Remove or set to "" once verified evidence is published */
export const metricsNote =
  "Performance metrics and supporting case studies will be added as verified evidence becomes available.";

/* ── Case studies ──────────────────────────────────────────── */

export type CaseStudy = {
  /** true = show "CASE STUDY PLACEHOLDER" label. Set false for a real, verified case study */
  placeholder: boolean;
  focus: string;
  image: ImageAsset;
  businessType: string;
  challenge: string;
  strategy: string;
  verifiedOutcome: string;
  timePeriod: string;
  /** Link to the full case study, or null */
  link: string | null;
};

export const caseStudies: CaseStudy[] = [
  {
    placeholder: true,
    focus: "E-commerce growth",
    image: { src: null, alt: "E-commerce case study", placeholderLabel: "CASE STUDY IMAGE PLACEHOLDER" },
    businessType: "E-commerce",
    challenge: "To be documented",
    strategy: "To be documented",
    verifiedOutcome: "To be added",
    timePeriod: "To be added",
    link: null,
  },
  {
    placeholder: true,
    focus: "Client acquisition",
    image: { src: null, alt: "Coaching or consulting case study", placeholderLabel: "CASE STUDY IMAGE PLACEHOLDER" },
    businessType: "Coaching / consulting",
    challenge: "To be documented",
    strategy: "To be documented",
    verifiedOutcome: "To be added",
    timePeriod: "To be added",
    link: null,
  },
  {
    placeholder: true,
    focus: "Conversion & sales optimisation",
    image: { src: null, alt: "Conversion and sales case study", placeholderLabel: "CASE STUDY IMAGE PLACEHOLDER" },
    businessType: "Online business",
    challenge: "To be documented",
    strategy: "To be documented",
    verifiedOutcome: "To be added",
    timePeriod: "To be added",
    link: null,
  },
];

/* ── Program ───────────────────────────────────────────────── */

export type ProgramItem = {
  label: string;
  /** Short description once confirmed. Leave "" while unconfirmed */
  detail: string;
  /** false = shown as a placeholder in development mode */
  confirmed: boolean;
};

export const programIncludes: ProgramItem[] = [
  { label: "Strategy and business review", detail: "", confirmed: false },
  { label: "Growth opportunity identification", detail: "", confirmed: false },
  { label: "Offer and positioning review", detail: "", confirmed: false },
  { label: "Acquisition strategy", detail: "", confirmed: false },
  { label: "Conversion improvement opportunities", detail: "", confirmed: false },
  { label: "Implementation priorities", detail: "", confirmed: false },
  { label: "Ongoing support (if included)", detail: "", confirmed: false },
];

export const programTerms = {
  /** e.g. "12 weeks". null = not confirmed */
  duration: null as string | null,
  /** e.g. "$X,XXX". null = not confirmed. Never put a placeholder number here */
  pricing: null as string | null,
};

/* ── FAQ ───────────────────────────────────────────────────── */

export const faqs: { q: string; a: string; devNote?: string }[] = [
  {
    q: "Who is your program for?",
    a: "We work with e-commerce businesses, coaches, consultants and other online businesses that want a more structured approach to growth, rather than trying one tactic after another.",
  },
  {
    q: "Do I need to be making money already?",
    a: "Your business stage matters, but it isn't the only factor. We look at your business model, goals, current situation and readiness to execute. Every application is reviewed individually, and not every applicant will be a fit.",
  },
  {
    q: "Can you guarantee a specific revenue result?",
    a: "No. Business outcomes depend on many factors, including your business model, market, margins, execution and conditions outside anyone's control. Our focus is helping you identify the right opportunities and build a clearer plan, not promising a number.",
  },
  {
    q: "What happens after I apply?",
    a: "Straight after you submit your application, you can book a free 15-minute consultation call at a time that suits you. Times are shown in your own time zone. Our team reviews your answers before the call so we can make the most of it.",
  },
  {
    q: "How much does your program cost?",
    a: "Pricing and the final program structure are discussed with suitable applicants, based on the business and what's needed. We don't publish a fixed price here.",
  },
  {
    q: "What types of businesses can apply?",
    a: "E-commerce brands and online stores, coaches, consultants and agencies, digital product and online education businesses, and other online businesses looking to grow.",
  },
];

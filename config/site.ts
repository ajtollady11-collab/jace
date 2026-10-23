/**
 * ─────────────────────────────────────────────────────────────
 *  CENTRAL SITE CONFIGURATION
 *  Edit this file to update team details, images, metrics,
 *  case studies, program details and FAQ answers.
 * ─────────────────────────────────────────────────────────────
 *
 *  IMAGES
 *  Put image files in /public/images/... and set the matching `src`
 *  below, e.g.  src: "/images/team/jace.jpg"
 *  While `src` is null, a labelled placeholder is shown instead.
 */

/**
 * DEVELOPMENT MODE
 * While true, the site shows small notes explaining that metrics,
 * case studies and program details are placeholders.
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
  { label: "About", href: "#about" },
] as const;

/* ── Images ────────────────────────────────────────────────── */

export type ImageAsset = {
  /** Path inside /public, e.g. "/images/team/jace.jpg". null = show placeholder */
  src: string | null;
  alt: string;
  /** Label shown on the placeholder while src is null */
  placeholderLabel: string;
};

export const images = {
  hero: {
    src: null,
    alt: "Jace Sullivan and our team",
    placeholderLabel: "FOUNDER & TEAM IMAGE PLACEHOLDER",
  } satisfies ImageAsset,
};

/* ── Team ──────────────────────────────────────────────────── */

export type TeamMember = {
  name: string;
  role: string;
  /** Leave empty until a real, accurate bio is ready */
  bio: string;
  image: ImageAsset;
};

export const founder: TeamMember = {
  name: "Jace Sullivan",
  role: "Founder & Growth Strategist",
  bio: "",
  image: {
    src: null,
    alt: "Portrait of Jace Sullivan",
    placeholderLabel: "FOUNDER IMAGE PLACEHOLDER",
  },
};

export const team: TeamMember[] = [
  {
    name: "Team Member 02",
    role: "Acquisition & Marketing",
    bio: "",
    image: { src: null, alt: "Portrait of Team Member 02", placeholderLabel: "TEAM MEMBER 02 IMAGE PLACEHOLDER" },
  },
  {
    name: "Team Member 03",
    role: "Conversion & Sales",
    bio: "",
    image: { src: null, alt: "Portrait of Team Member 03", placeholderLabel: "TEAM MEMBER 03 IMAGE PLACEHOLDER" },
  },
  {
    name: "Team Member 04",
    role: "Operations & Systems",
    bio: "",
    image: { src: null, alt: "Portrait of Team Member 04", placeholderLabel: "TEAM MEMBER 04 IMAGE PLACEHOLDER" },
  },
  {
    name: "Team Member 05",
    role: "Client Strategy",
    bio: "",
    image: { src: null, alt: "Portrait of Team Member 05", placeholderLabel: "TEAM MEMBER 05 IMAGE PLACEHOLDER" },
  },
];

/* ── Performance metrics ───────────────────────────────────── */

export type Metric = {
  label: string;
  /** Only fill in with VERIFIED figures, e.g. "40+" or "$2.1M". null = not yet verified */
  value: string | null;
};

export const metrics: Metric[] = [
  { label: "Verified businesses helped", value: null },
  { label: "Verified revenue generated for clients", value: null },
  { label: "Verified case studies", value: null },
  { label: "Verified years of relevant experience", value: null },
];

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
    a: "Our team reviews each application. If there's a potential fit, you'll be invited to book a conversation with us to talk through your business in more detail.",
    devNote:
      "Please note: the application form is currently in development and is not yet connected to a live submission system.",
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

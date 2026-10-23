/**
 * APPLICATION QUESTIONS
 * Each question maps to one key in the submitted payload (`id`).
 * Order here = order in the quiz.
 */

export type QuestionType = "single" | "multi" | "text" | "profile" | "long";

export type Question = {
  id: keyof ApplicationAnswers;
  type: QuestionType;
  question: string;
  options?: string[];
  placeholder?: string;
  helper?: string;
};

export type ApplicationAnswers = {
  businessType: string;
  biggestChallenge: string;
  currentMonthlyRevenue: string;
  targetMonthlyRevenue: string;
  growthApproachesTried: string[];
  fullName: string;
  investmentCapacity: string;
  websiteOrSocial: string;
  motivationAndBlockers: string;
};

export const emptyAnswers: ApplicationAnswers = {
  businessType: "",
  biggestChallenge: "",
  currentMonthlyRevenue: "",
  targetMonthlyRevenue: "",
  growthApproachesTried: [],
  fullName: "",
  investmentCapacity: "",
  websiteOrSocial: "",
  motivationAndBlockers: "",
};

export const questions: Question[] = [
  {
    id: "businessType",
    type: "single",
    question: "What type of business do you run?",
    options: [
      "E-commerce / online store",
      "Coaching",
      "Consulting / agency",
      "Digital products / online education",
      "Other",
    ],
  },
  {
    id: "biggestChallenge",
    type: "single",
    question: "What is your biggest challenge right now?",
    options: [
      "Getting consistent customers",
      "Improving conversion rate",
      "Increasing average order value",
      "Making paid advertising profitable",
      "Getting more clients for coaching/consulting",
      "Building better systems and operations",
      "Growing beyond my current revenue level",
    ],
  },
  {
    id: "currentMonthlyRevenue",
    type: "single",
    question: "What is your current monthly revenue?",
    options: [
      "Not launched yet",
      "Under $1,000",
      "$1,000–$5,000",
      "$5,000–$10,000",
      "$10,000–$30,000",
      "$30,000–$50,000",
      "$50,000+",
    ],
  },
  {
    id: "targetMonthlyRevenue",
    type: "single",
    question: "What monthly revenue are you aiming for over the next 12 months?",
    options: ["$10,000–$20,000", "$20,000–$50,000", "$50,000–$100,000", "$100,000+"],
  },
  {
    id: "growthApproachesTried",
    type: "multi",
    question: "What have you tried so far to grow your business?",
    helper: "Select all that apply.",
    options: [
      "Learning and implementing strategies myself",
      "Paid advertising",
      "Organic social media/content",
      "Hiring freelancers or agencies",
      "Working with a coach or consultant",
      "Several approaches, but growth has been inconsistent",
      "I haven’t seriously tried anything yet",
    ],
  },
  {
    id: "fullName",
    type: "text",
    question: "What is your name?",
    placeholder: "Enter your full name",
  },
  {
    id: "investmentCapacity",
    type: "single",
    question: "How much are you willing to invest in scaling your business?",
    options: ["Under $500", "$500–$1,000", "$1,000–$2,500", "$2,500–$5,000", "$5,000–$10,000", "$10,000+"],
  },
  {
    id: "websiteOrSocial",
    type: "profile",
    question: "What is your business website or social media account?",
    placeholder: "Enter your website, Instagram, TikTok, or another business profile",
    helper: "If you don’t have a website, share the social media profile you use for your business.",
  },
  {
    id: "motivationAndBlockers",
    type: "long",
    question: "Why do you want to scale your business, and what’s currently stopping you?",
    placeholder:
      "Tell us where you want to take your business, what’s holding you back, and why you’re serious about making it happen.",
    helper: "Give us enough detail to understand your goals and current situation.",
  },
];

export const LONG_ANSWER_MIN = 40;
export const LONG_ANSWER_MAX = 3000;

/** Returns an error message, or null if the answer is valid. */
export function validateAnswer(q: Question, value: string | string[]): string | null {
  if (q.type === "single") {
    return value ? null : "Please choose an option to continue.";
  }
  if (q.type === "multi") {
    return Array.isArray(value) && value.length > 0 ? null : "Please select at least one option.";
  }
  const v = String(value ?? "").trim();
  if (q.type === "text") {
    if (!v) return "Please enter your name.";
    if (v.length < 2 || !/\p{L}/u.test(v)) return "Please enter your full name.";
    if (v.length > 100) return "That name looks a little long — please shorten it.";
    return null;
  }
  if (q.type === "profile") {
    if (!v) return "Please share your website or a business social profile.";
    if (!isPlausibleProfile(v))
      return "Please enter a website (e.g. yourbrand.com), a profile link, or a handle like @yourbrand.";
    return null;
  }
  if (q.type === "long") {
    if (!v) return "Please tell us a little about your goals and what’s holding you back.";
    if (v.length < LONG_ANSWER_MIN)
      return `Please add a little more detail (at least ${LONG_ANSWER_MIN} characters).`;
    if (v.length > LONG_ANSWER_MAX) return `Please keep your answer under ${LONG_ANSWER_MAX} characters.`;
    return null;
  }
  return null;
}

/**
 * Accepts websites, profile URLs and social handles:
 *   yourbrand.com · https://www.yourbrand.co.uk/shop · instagram.com/yourbrand
 *   tiktok.com/@yourbrand · @yourbrand · linktr.ee/yourbrand
 */
export function isPlausibleProfile(input: string): boolean {
  const v = input.trim();
  if (v.length < 3 || v.length > 300 || /\s/.test(v)) return false;
  if (/^@[\p{L}\p{N}._-]{2,}$/u.test(v)) return true;
  return /^(https?:\/\/)?([\p{L}\p{N}-]+\.)+[\p{L}]{2,}(:\d+)?([/?#]\S*)?$/iu.test(v);
}

/** Human-readable labels for each answer (used in the admin dashboard and CSV export) */
export const answerLabels: Record<keyof ApplicationAnswers, string> = {
  businessType: "Business type",
  biggestChallenge: "Biggest challenge",
  currentMonthlyRevenue: "Current monthly revenue",
  targetMonthlyRevenue: "12-month revenue target",
  growthApproachesTried: "Tried so far",
  fullName: "Name (from application)",
  investmentCapacity: "Willing to invest",
  websiteOrSocial: "Website / social",
  motivationAndBlockers: "Why scale & what's stopping them",
};

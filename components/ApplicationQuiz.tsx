"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  questions,
  emptyAnswers,
  validateAnswer,
  LONG_ANSWER_MIN,
  LONG_ANSWER_MAX,
  type ApplicationAnswers,
  type Question,
} from "@/config/application";
import { submitApplication } from "@/lib/submitApplication";
import BookingFlow, { type BookingCredentials } from "./BookingFlow";
import { Arrow } from "./ui";

const STORAGE_KEY = "js-application-draft";
const BOOKING_KEY = "js-booking";
const EXCLUSIVE_OPTION = "I haven’t seriously tried anything yet";

type Phase = "form" | "preview" | "received" | "booking";

export default function ApplicationQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ApplicationAnswers>(emptyAnswers);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [phase, setPhase] = useState<Phase>("form");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<BookingCredentials | null>(null);
  const [bookingName, setBookingName] = useState("");

  const submittingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);
  const restored = useRef(false);

  const total = questions.length;
  const q = questions[step];
  const isLast = step === total - 1;
  const value = answers[q.id];

  /* Restore an unfinished draft (e.g. accidental refresh) */
  useEffect(() => {
    try {
      // Already applied in this tab? Resume booking.
      const bk = JSON.parse(sessionStorage.getItem(BOOKING_KEY) || "null");
      if (bk?.applicationId && bk?.token) {
        setCredentials({ applicationId: bk.applicationId, token: bk.token });
        setBookingName(typeof bk.name === "string" ? bk.name : "");
        setPhase("booking");
        restored.current = true;
        return;
      }
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { answers?: Partial<ApplicationAnswers>; step?: number };
        if (saved.answers) setAnswers({ ...emptyAnswers, ...saved.answers });
        if (typeof saved.step === "number" && saved.step >= 0 && saved.step < total) setStep(saved.step);
      }
    } catch {
      /* storage unavailable — ignore */
    }
    restored.current = true;
  }, [total]);

  useEffect(() => {
    if (!restored.current || phase !== "form") return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step }));
    } catch {
      /* ignore */
    }
  }, [answers, step, phase]);

  /* Move focus to the new question & keep the quiz in view on step change */
  useEffect(() => {
    if (!interacted.current) return;
    const field = containerRef.current?.querySelector<HTMLElement>("input[type=text], textarea");
    (field ?? headingRef.current)?.focus({ preventScroll: true });
    const el = containerRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.6) {
        el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      }
    }
  }, [step, phase]);

  function update(next: string | string[]) {
    setAnswers((a) => ({ ...a, [q.id]: next }));
    if (error) setError(null);
    if (submitError) setSubmitError(null);
  }

  function toggleMulti(option: string) {
    const current = Array.isArray(value) ? value : [];
    let next: string[];
    if (current.includes(option)) next = current.filter((o) => o !== option);
    else if (option === EXCLUSIVE_OPTION) next = [option];
    else next = [...current.filter((o) => o !== EXCLUSIVE_OPTION), option];
    update(next);
  }

  function goBack() {
    if (step === 0 || submitting) return;
    interacted.current = true;
    setError(null);
    setSubmitError(null);
    setDirection(-1);
    setStep((s) => s - 1);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    interacted.current = true;

    const err = validateAnswer(q, value);
    if (err) {
      setError(err);
      return;
    }

    if (!isLast) {
      setDirection(1);
      setStep((s) => s + 1);
      return;
    }

    // Final submission — check everything once more
    for (let i = 0; i < questions.length; i++) {
      const problem = validateAnswer(questions[i], answers[questions[i].id]);
      if (problem) {
        setDirection(-1);
        setStep(i);
        setError(problem);
        return;
      }
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitApplication({
      ...answers,
      fullName: answers.fullName.trim(),
      websiteOrSocial: answers.websiteOrSocial.trim(),
      motivationAndBlockers: answers.motivationAndBlockers.trim(),
    });
    submittingRef.current = false;
    setSubmitting(false);

    if (result.status === "error") {
      setSubmitError(result.message);
      return;
    }
    if (result.status === "received") {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    if (result.status === "received" && result.booking) {
      setCredentials(result.booking);
      setBookingName(answers.fullName.trim());
      setPhase("booking");
      return;
    }
    setPhase(result.status);
  }

  function resetAll() {
    try {
      sessionStorage.removeItem(BOOKING_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    interacted.current = false;
    setAnswers(emptyAnswers);
    setStep(0);
    setCredentials(null);
    setPhase("form");
  }

  function editAnswers() {
    interacted.current = true;
    setDirection(-1);
    setPhase("form");
  }

  const progress = ((step + 1) / total) * 100;

  return (
    <div
      ref={containerRef}
      data-quiz-root
      className="relative scroll-mt-24 overflow-hidden rounded-[18px] border border-line bg-card shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)]"
    >
      <div aria-hidden className="hairline-gold absolute inset-x-10 top-0" />

      {phase === "form" && (
        <>
          {/* Progress */}
          <div className="border-b border-line px-5 pb-5 pt-6 sm:px-9 sm:pt-7">
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-semibold uppercase tracking-[0.2em] text-gold">
                Question {step + 1} <span className="text-fg-2">of {total}</span>
              </span>
              <span className="text-fg-2" aria-hidden>
                {Math.round(progress)}%
              </span>
            </div>
            <div
              className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Application progress"
              aria-valuemin={1}
              aria-valuemax={total}
              aria-valuenow={step + 1}
              aria-valuetext={`Question ${step + 1} of ${total}`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold-2 transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="px-5 pb-6 pt-7 sm:px-9 sm:pb-9 sm:pt-9">
            <div
              key={step}
              className="step-enter min-h-[300px] sm:min-h-[340px]"
              style={{ ["--step-from" as string]: direction === 1 ? "18px" : "-18px" }}
            >
              <QuestionBody
                q={q}
                value={value}
                error={error}
                headingRef={headingRef}
                onSingle={(o) => update(o)}
                onMulti={toggleMulti}
                onText={(t) => update(t)}
              />
            </div>

            {submitError && (
              <div role="alert" className="mt-6 rounded-[10px] border border-red-400/30 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
                <p className="font-semibold">Your application wasn’t sent.</p>
                <p className="mt-1 text-red-200/80">{submitError} Your answers are still saved here.</p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0 || submitting}
                className={`btn btn-ghost !min-h-[48px] !px-4 sm:!px-5 ${step === 0 ? "invisible" : ""}`}
              >
                <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                  <path d="M14 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
              <button type="submit" disabled={submitting} className="btn btn-gold !min-h-[48px] flex-1 sm:flex-none" aria-busy={submitting}>
                {submitting ? (
                  <>
                    <span aria-hidden className="spinner h-4 w-4 rounded-full border-2 border-ink/30 border-t-ink" />
                    Submitting…
                  </>
                ) : isLast ? (
                  <>
                    Submit Application <Arrow />
                  </>
                ) : (
                  <>
                    Continue <Arrow />
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}

      {phase === "booking" && credentials && (
        <BookingFlow credentials={credentials} defaultName={bookingName} onReset={resetAll} />
      )}
      {phase === "received" && <ReceivedScreen headingRef={headingRef} />}
      {phase === "preview" && <PreviewScreen headingRef={headingRef} answers={answers} onEdit={editAnswers} />}
    </div>
  );
}

/* ───────────────────────────────────────────────────────── */

type BodyProps = {
  q: Question;
  value: string | string[];
  error: string | null;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onSingle: (o: string) => void;
  onMulti: (o: string) => void;
  onText: (t: string) => void;
};

function QuestionBody({ q, value, error, headingRef, onSingle, onMulti, onText }: BodyProps) {
  const errorId = `${q.id}-error`;
  const helperId = `${q.id}-helper`;
  const describedBy = [q.helper ? helperId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  const isField = q.type !== "single" && q.type !== "multi";
  const inputId = `${q.id}-input`;
  const heading = (
    <h3
      ref={headingRef}
      tabIndex={-1}
      className="text-[1.45rem] font-semibold leading-[1.18] outline-none sm:text-[1.85rem]"
    >
      {isField ? <label htmlFor={inputId}>{q.question}</label> : q.question}
    </h3>
  );

  const errorEl = error ? (
    <p id={errorId} role="alert" className="mt-4 flex items-center gap-2 text-sm text-red-300">
      <span aria-hidden className="flex h-4 w-4 items-center justify-center rounded-full border border-red-300/60 text-[0.6rem]">!</span>
      {error}
    </p>
  ) : null;

  if (q.type === "single" || q.type === "multi") {
    const multi = q.type === "multi";
    const selected = (o: string) => (multi ? Array.isArray(value) && value.includes(o) : value === o);
    return (
      <fieldset aria-describedby={describedBy} aria-invalid={!!error || undefined}>
        <legend className="w-full p-0">{heading}</legend>
        {q.helper && (
          <p id={helperId} className="mt-2 text-sm text-fg-2">
            {q.helper}
          </p>
        )}
        <div className={`mt-6 grid gap-2.5 ${(q.options?.length ?? 0) > 5 ? "sm:grid-cols-2" : ""}`}>
          {q.options?.map((o) => {
            const on = selected(o);
            return (
              <label
                key={o}
                className={`group/opt relative flex min-h-[58px] cursor-pointer select-none items-center gap-4 rounded-[10px] border px-4 py-3.5 text-[0.95rem] leading-snug transition-[border-color,background-color,color] duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-2/70 ${
                  on
                    ? "border-gold bg-gold/[0.08] text-fg"
                    : "border-line bg-card-2/60 text-fg/90 hover:border-fg-2/40 hover:bg-card-2"
                }`}
              >
                <input
                  type={multi ? "checkbox" : "radio"}
                  name={q.id}
                  value={o}
                  checked={on}
                  onChange={() => (multi ? onMulti(o) : onSingle(o))}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-150 ${
                    multi ? "rounded-[5px]" : "rounded-full"
                  } ${on ? "border-gold bg-gold" : "border-fg-2/50 group-hover/opt:border-fg-2"}`}
                >
                  {on &&
                    (multi ? (
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                        <path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="#0B0B0C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-ink" />
                    ))}
                </span>
                <span>{o}</span>
              </label>
            );
          })}
        </div>
        {errorEl}
      </fieldset>
    );
  }

  const text = typeof value === "string" ? value : "";
  const fieldClass = `w-full rounded-[10px] border bg-ink-2 px-4 text-base text-fg placeholder:text-fg-2/55 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-2/50 ${
    error ? "border-red-300/60" : "border-line focus:border-gold"
  }`;

  return (
    <div>
      {heading}
      {q.helper && (
        <p id={helperId} className="mt-2 text-sm leading-relaxed text-fg-2">
          {q.helper}
        </p>
      )}
      <div className="mt-6">
        {q.type === "long" ? (
          <>
            <textarea
              id={inputId}
              value={text}
              onChange={(e) => onText(e.target.value)}
              placeholder={q.placeholder}
              rows={7}
              maxLength={LONG_ANSWER_MAX}
              aria-invalid={!!error}
              aria-describedby={describedBy}
              className={`${fieldClass} resize-y py-3.5 leading-relaxed`}
            />
            <p className="mt-2 flex justify-between text-xs text-fg-2">
              <span>{text.trim().length < LONG_ANSWER_MIN ? `At least ${LONG_ANSWER_MIN} characters` : "Looks good"}</span>
              <span>
                {text.length}/{LONG_ANSWER_MAX}
              </span>
            </p>
          </>
        ) : (
          <input
            id={inputId}
            type="text"
            inputMode={q.type === "profile" ? "url" : "text"}
            autoComplete={q.type === "text" ? "name" : "url"}
            autoCapitalize={q.type === "text" ? "words" : "none"}
            spellCheck={q.type === "text"}
            value={text}
            onChange={(e) => onText(e.target.value)}
            placeholder={q.placeholder}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`${fieldClass} h-14`}
          />
        )}
      </div>
      {errorEl}
      {q.type !== "long" && <p className="mt-4 hidden text-xs text-fg-2 sm:block">Press Enter ↵ to continue</p>}
    </div>
  );
}

/* ───────────────────────────────────────────────────────── */

function ReceivedScreen({ headingRef }: { headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="step-enter flex min-h-[520px] flex-col items-center justify-center px-6 py-14 text-center sm:px-12">
      <span aria-hidden className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 bg-gold/[0.08]">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#E0C58B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h3 ref={headingRef} tabIndex={-1} role="status" className="mt-8 text-3xl font-semibold outline-none sm:text-4xl">
        Application Received
      </h3>
      <p className="mt-5 max-w-md leading-relaxed text-fg-2">
        Thanks for sharing more about your business. Our team will review your application and, if there’s a
        potential fit, you’ll be invited to book a conversation with us.
      </p>
      <a href="#top" className="btn btn-gold mt-10">
        Return to Home
      </a>
    </div>
  );
}

const summaryLabels: Record<keyof ApplicationAnswers, string> = {
  businessType: "Business type",
  biggestChallenge: "Biggest challenge",
  currentMonthlyRevenue: "Current monthly revenue",
  targetMonthlyRevenue: "12-month target",
  growthApproachesTried: "Tried so far",
  fullName: "Name",
  investmentCapacity: "Investment capacity",
  websiteOrSocial: "Website / social",
  motivationAndBlockers: "Goals & blockers",
};

function PreviewScreen({
  answers,
  onEdit,
  headingRef,
}: {
  answers: ApplicationAnswers;
  onEdit: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div className="step-enter px-5 py-9 sm:px-9 sm:py-10">
      <span className="dev-tag">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Development Mode
      </span>
      <h3 ref={headingRef} tabIndex={-1} role="status" className="mt-5 text-2xl font-semibold leading-tight outline-none sm:text-3xl">
        Preview only — this application has not been delivered
      </h3>
      <p className="mt-4 leading-relaxed text-fg-2">
        The form is working, but it isn’t connected to a live submission system yet, so these answers have
        <strong className="font-semibold text-fg"> not </strong>
        been sent to our team. Once a submission endpoint is configured, applicants will see the
        “Application Received” confirmation instead.
      </p>

      <div className="mt-7 rounded-[12px] border border-line bg-ink-2">
        <p className="border-b border-line px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fg-2">
          Captured answers (kept in this browser only)
        </p>
        <dl className="max-h-[300px] divide-y divide-line overflow-y-auto">
          {(Object.keys(summaryLabels) as (keyof ApplicationAnswers)[]).map((k) => {
            const v = answers[k];
            return (
              <div key={k} className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[170px_1fr] sm:gap-4">
                <dt className="text-fg-2">{summaryLabels[k]}</dt>
                <dd className="break-words text-fg">{Array.isArray(v) ? v.join(", ") : v}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onEdit} className="btn btn-ghost">
          Edit Answers
        </button>
        <a href="#top" className="btn btn-gold">
          Return to Home
        </a>
      </div>
    </div>
  );
}

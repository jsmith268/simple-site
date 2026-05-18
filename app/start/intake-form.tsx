"use client";

import { useState, useId, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type StepId = "business" | "goals" | "pages" | "voice" | "assets" | "contact" | "done";

const STEPS: { id: StepId; label: string; title: string; sub: string }[] = [
  { id: "business", label: "Business", title: "Tell us about your business", sub: "The basics — we'll build everything else on this." },
  { id: "goals", label: "Goals", title: "What does success look like?", sub: "What should this website actually do for you?" },
  { id: "pages", label: "Pages", title: "What pages do you need?", sub: "Five are included. Each extra is $195." },
  { id: "voice", label: "Voice", title: "Voice and vibe", sub: "Show us a few sites you love (and one or two you don't)." },
  { id: "assets", label: "Assets", title: "What do you already have?", sub: "Logo, photos, copy — share what exists. We'll fill the rest." },
  { id: "contact", label: "Contact", title: "Where do we send the concepts?", sub: "We'll be in touch within 5 business days." },
];

const PAGE_OPTIONS = [
  "Home",
  "About",
  "Services",
  "Pricing",
  "Portfolio / Work",
  "Testimonials",
  "Contact",
  "Blog",
  "FAQ",
  "Locations / Service areas",
];

const VIBE_OPTIONS = [
  "Calm & minimal",
  "Warm & friendly",
  "Bold & punchy",
  "Editorial / premium",
  "Classic / traditional",
  "Playful / quirky",
];

const GOAL_OPTIONS = [
  "Get phone calls / quote requests",
  "Drive bookings or appointments",
  "Sell a product or service online",
  "Build credibility / look professional",
  "Educate visitors / explain what we do",
  "Recruit / attract team members",
];

export function IntakeForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, unknown>>({
    pages: ["Home", "About", "Services", "Contact"],
    goals: [],
    vibe: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const isDone = step >= STEPS.length || submitted;
  const current = STEPS[step];

  useEffect(() => {
    if (liveRef.current && !isDone) {
      liveRef.current.textContent = `Step ${step + 1} of ${STEPS.length}: ${current.title}`;
    }
  }, [step, current, isDone]);

  function update<T>(key: string, value: T) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function toggleArray(key: string, value: string) {
    setData((d) => {
      const arr = (d[key] as string[]) ?? [];
      return {
        ...d,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  function next(e?: React.FormEvent) {
    e?.preventDefault();
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setSubmitted(true);
    }
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }

  if (isDone) {
    return <DoneScreen data={data} />;
  }

  return (
    <div>
      <Progress step={step} total={STEPS.length} />
      <div ref={liveRef} aria-live="polite" className="sr-only" />

      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#c2410c] font-medium mb-3">
          Step {step + 1} of {STEPS.length} · {current.label}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
          {current.title}
        </h1>
        <p className="mt-2 text-black/60 text-pretty">{current.sub}</p>
      </header>

      <form onSubmit={next} className="space-y-6">
        {current.id === "business" && (
          <>
            <Field label="Business name" required>
              <input
                type="text"
                required
                autoFocus
                value={(data.businessName as string) ?? ""}
                onChange={(e) => update("businessName", e.target.value)}
                placeholder="e.g. Hunter Doors"
                className={inputCls}
              />
            </Field>
            <Field label="What does the business do?" required hint="One or two sentences a stranger could understand.">
              <textarea
                required
                rows={3}
                value={(data.businessDescription as string) ?? ""}
                onChange={(e) => update("businessDescription", e.target.value)}
                placeholder="We install and repair residential garage doors in Calgary and the surrounding area."
                className={textareaCls}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Industry">
                <input
                  type="text"
                  value={(data.industry as string) ?? ""}
                  onChange={(e) => update("industry", e.target.value)}
                  placeholder="Home services"
                  className={inputCls}
                />
              </Field>
              <Field label="Primary location / service area">
                <input
                  type="text"
                  value={(data.location as string) ?? ""}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="Calgary, AB"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Existing website (if any)">
              <input
                type="url"
                value={(data.existingSite as string) ?? ""}
                onChange={(e) => update("existingSite", e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
            </Field>
          </>
        )}

        {current.id === "goals" && (
          <>
            <Field label="What should this site help you achieve?" hint="Pick all that apply.">
              <CheckGrid
                options={GOAL_OPTIONS}
                selected={(data.goals as string[]) ?? []}
                onToggle={(v) => toggleArray("goals", v)}
              />
            </Field>
            <Field label="If we got one thing right, what would it be?" hint="The single most important outcome.">
              <textarea
                rows={3}
                value={(data.northStar as string) ?? ""}
                onChange={(e) => update("northStar", e.target.value)}
                placeholder="Phone calls. Volume and quality both up by month two."
                className={textareaCls}
              />
            </Field>
            <Field label="Who is the typical customer?">
              <textarea
                rows={2}
                value={(data.audience as string) ?? ""}
                onChange={(e) => update("audience", e.target.value)}
                placeholder="Homeowners aged 35–65 in Calgary, often after a broken spring or storm damage."
                className={textareaCls}
              />
            </Field>
          </>
        )}

        {current.id === "pages" && (
          <>
            <Field label="Pages your site needs" hint={`${(data.pages as string[])?.length ?? 0} selected · 5 included, then $195 each.`}>
              <CheckGrid
                options={PAGE_OPTIONS}
                selected={(data.pages as string[]) ?? []}
                onToggle={(v) => toggleArray("pages", v)}
              />
            </Field>
            <Field label="Other pages we should add?">
              <textarea
                rows={2}
                value={(data.otherPages as string) ?? ""}
                onChange={(e) => update("otherPages", e.target.value)}
                placeholder="Maybe a 'careers' page and a service-area page for Airdrie."
                className={textareaCls}
              />
            </Field>
            <Field label="Want a blog / CMS?" hint="Self-serve posting for blog articles. Add-on: $495.">
              <div className="grid grid-cols-2 gap-2">
                {(["Yes", "Not now"] as const).map((opt) => (
                  <Chip
                    key={opt}
                    active={data.cms === opt}
                    onClick={() => update("cms", opt)}
                  >
                    {opt}
                  </Chip>
                ))}
              </div>
            </Field>
          </>
        )}

        {current.id === "voice" && (
          <>
            <Field label="Pick the moods that feel right" hint="Two or three is usually plenty.">
              <CheckGrid
                options={VIBE_OPTIONS}
                selected={(data.vibe as string[]) ?? []}
                onToggle={(v) => toggleArray("vibe", v)}
              />
            </Field>
            <Field label="Sites you love (and why)" hint="Even competitors. Links + a line on what you like.">
              <textarea
                rows={4}
                value={(data.loveSites as string) ?? ""}
                onChange={(e) => update("loveSites", e.target.value)}
                placeholder={"linear.app — feels confident and quiet\nstripe.com — the typography\nawakenedpilates.com — calm, premium"}
                className={textareaCls}
              />
            </Field>
            <Field label="Anything to avoid?">
              <textarea
                rows={2}
                value={(data.avoid as string) ?? ""}
                onChange={(e) => update("avoid", e.target.value)}
                placeholder="No stock photos of people in headsets. No bright corporate blue."
                className={textareaCls}
              />
            </Field>
          </>
        )}

        {current.id === "assets" && (
          <>
            <Field label="Do you have a logo?">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(["Yes", "Sort of", "No — need one"] as const).map((opt) => (
                  <Chip key={opt} active={data.logo === opt} onClick={() => update("logo", opt)}>
                    {opt}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Do you have photography we can use?">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(["Plenty", "A little", "None"] as const).map((opt) => (
                  <Chip key={opt} active={data.photos === opt} onClick={() => update("photos", opt)}>
                    {opt}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Brand colors (if you have them)">
              <input
                type="text"
                value={(data.colors as string) ?? ""}
                onChange={(e) => update("colors", e.target.value)}
                placeholder="Deep green #1F3D2C and warm cream"
                className={inputCls}
              />
            </Field>
            <Field label="Anywhere we can grab existing copy or details?" hint="Old site, Google Business, brochure, etc.">
              <textarea
                rows={3}
                value={(data.contentSources as string) ?? ""}
                onChange={(e) => update("contentSources", e.target.value)}
                placeholder="Old WordPress site, our Google Business profile, the PDF brochure we use at trade shows."
                className={textareaCls}
              />
            </Field>
          </>
        )}

        {current.id === "contact" && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Your name" required>
                <input
                  type="text"
                  required
                  value={(data.name as string) ?? ""}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Phone (optional)">
                <input
                  type="tel"
                  value={(data.phone as string) ?? ""}
                  onChange={(e) => update("phone", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Email" required>
              <input
                type="email"
                required
                value={(data.email as string) ?? ""}
                onChange={(e) => update("email", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Budget" hint="Helps us know what add-ons to recommend.">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["$995", "$1,500", "$2,500+", "Not sure"] as const).map((opt) => (
                  <Chip key={opt} active={data.budget === opt} onClick={() => update("budget", opt)}>
                    {opt}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Anything else we should know?">
              <textarea
                rows={3}
                value={(data.notes as string) ?? ""}
                onChange={(e) => update("notes", e.target.value)}
                className={textareaCls}
              />
            </Field>
            <p className="text-xs text-black/50">
              By submitting you agree to be contacted about your project. We don't share your info.
            </p>
          </>
        )}

        <div className="pt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="text-sm text-black/60 hover:text-black disabled:opacity-30 disabled:hover:text-black/60 transition px-2 py-1"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="group inline-flex items-center gap-2 bg-[#111] text-white rounded-full px-5 sm:px-6 py-3 text-sm font-medium hover:bg-[#c2410c] transition-colors"
          >
            {step === STEPS.length - 1 ? "Send my intake" : "Continue"}
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full bg-white border border-black/10 rounded-lg px-4 py-3 text-[15px] placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#c2410c]/30 focus:border-[#c2410c]/60 transition";
const textareaCls = inputCls + " resize-y min-h-[88px]";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <label className="block" htmlFor={id}>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium text-[#111]">
          {label}
          {required && <span className="text-[#c2410c]"> *</span>}
        </span>
        {hint && <span className="text-xs text-black/50">{hint}</span>}
      </div>
      <div id={id}>{children}</div>
    </label>
  );
}

function CheckGrid({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <button
            type="button"
            key={opt}
            onClick={() => onToggle(opt)}
            className={cn(
              "text-left rounded-lg border px-3.5 py-3 text-sm transition flex items-center gap-2.5",
              on
                ? "border-[#c2410c] bg-[#c2410c]/5 text-[#111]"
                : "border-black/10 bg-white hover:border-black/30 text-black/70"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition",
                on ? "border-[#c2410c] bg-[#c2410c] text-white" : "border-black/20"
              )}
            >
              {on && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm transition",
        active
          ? "border-[#c2410c] bg-[#c2410c]/5 text-[#111] font-medium"
          : "border-black/10 bg-white hover:border-black/30 text-black/70"
      )}
    >
      {children}
    </button>
  );
}

function Progress({ step, total }: { step: number; total: number }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div className="mb-10">
      <div className="h-1 w-full bg-black/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#c2410c] rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DoneScreen({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="pt-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c2410c]/10 text-[#c2410c] text-xs font-medium tracking-wide uppercase mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] animate-pulse-dot" />
        Intake received
      </div>
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
        Thanks{(data.name as string) ? `, ${(data.name as string).split(" ")[0]}` : ""}. We're on it.
      </h1>
      <p className="mt-4 text-lg text-black/70 text-pretty max-w-prose">
        Three custom design concepts will be in your inbox within{" "}
        <span className="font-medium text-black">5 business days</span>. If you'd like to share
        anything else in the meantime, just reply to the confirmation email — we read every word.
      </p>
      <div className="mt-10 grid sm:grid-cols-3 gap-3 text-sm">
        <Card title="What's next" body="We review your intake, sketch directions, and design three." />
        <Card title="When" body="Concepts in 5 business days. Most sites are live within 2 weeks." />
        <Card title="Cost" body="$995 base — no card needed until we send the invoice." />
      </div>
      <a
        href="/"
        className="inline-flex items-center gap-2 mt-12 text-sm font-medium text-black/70 hover:text-black"
      >
        ← Back to the site
      </a>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-black/40 font-medium mb-2">{title}</p>
      <p className="text-black/80 leading-snug">{body}</p>
    </div>
  );
}

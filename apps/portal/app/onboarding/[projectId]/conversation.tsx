"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Chip, Divider, Field, Input, Logo, Progress, Spinner, Textarea, cn } from "../../ui";
import {
  AUDIENCE_OPTIONS,
  COLOR_MAP,
  COLOR_OPTIONS,
  type ConversationDraft,
  GOAL_OPTIONS,
  PAGE_OPTIONS,
  SECTIONS,
  VOICE_OPTIONS,
  emptyDraft,
  inferCategory,
} from "./draft";
import { checkUsernameAction, submitConversationAction } from "./conversation-actions";
import { BrandStudio } from "./brand-studio";

type Kind = "text" | "single" | "multi" | "color" | "pages" | "list" | "contact" | "brand" | "username" | "review";

interface Step {
  id: string;
  label: string; // short label for the sidebar
  kind: Kind;
  lead: string;
  sub?: string;
  placeholder?: string;
  options?: string[];
  optional?: boolean;
  skipLabel?: string;
}

const STEPS: Step[] = [
  {
    id: "pitch",
    label: "What you do",
    kind: "text",
    lead: "Hey — I'm Avery, the lead on your build. Let's scope your site like we're across a table. In a sentence or two: what's the business, and what should the site do for you?",
    sub: "Paste your current site or Instagram too — I'll read it for context.",
    placeholder: "e.g. A plumbing company in Austin. I want people to book a visit and trust we'll show up.",
  },
  { id: "name", label: "Name", kind: "text", lead: "Love it. What's it called?", placeholder: "Your business name" },
  {
    id: "category",
    label: "Industry",
    kind: "single",
    lead: "What kind of business is it? This sets the whole direction.",
    options: ["Restaurant / Café", "Bar / Winery", "Salon / Spa", "Gym / Fitness", "Medical / Dental", "Law / Professional", "Home services", "Retail / Shop", "Real estate", "Creative / Studio"],
  },
  {
    id: "goal",
    label: "Main goal",
    kind: "single",
    lead: "When someone lands on the site, what's the one thing you most want them to do?",
    sub: "This becomes the main button on every page.",
    options: GOAL_OPTIONS,
  },
  { id: "audience", label: "Audience", kind: "multi", lead: "Who's it for? Pick anyone that fits — or add your own.", options: AUDIENCE_OPTIONS, optional: true },
  { id: "voice", label: "Voice", kind: "multi", lead: "How should it feel? These words steer the design and the writing.", options: VOICE_OPTIONS, optional: true },
  { id: "color", label: "Colors", kind: "color", lead: "Colors. Want to point me somewhere, or should the designers choose?", options: COLOR_OPTIONS },
  {
    id: "avoid",
    label: "Avoid",
    kind: "text",
    lead: "Anything to steer clear of? Words, colors, or styles you can't stand.",
    placeholder: "e.g. nothing corporate or stocky; no neon",
    optional: true,
    skipLabel: "Nothing comes to mind",
  },
  { id: "pages", label: "Pages", kind: "pages", lead: "Now the pages. Want me to lay out the right set for your kind of business — or do you know exactly what you want?", sub: "Home is always included." },
  {
    id: "offerings",
    label: "Offerings",
    kind: "list",
    lead: "What do you offer? Add a few — services, dishes, packages. The more you give me, the richer the middle of the site.",
    placeholder: "e.g. Drain cleaning",
    optional: true,
    skipLabel: "Skip — pull from my description",
  },
  {
    id: "proof",
    label: "Proof",
    kind: "list",
    lead: "Any proof worth showing? Years in business, customers served, ratings, awards.",
    sub: "I never make these up — if it's blank, I leave it out.",
    placeholder: "e.g. 1,200+ jobs done",
    optional: true,
    skipLabel: "Nothing yet",
  },
  { id: "contact", label: "Contact", kind: "contact", lead: "The practical bits — so visitors can actually reach you.", sub: "Only the email is required. Everything else makes the site fuller." },
  { id: "brand", label: "Logo & colors", kind: "brand", lead: "Do you already have a logo or brand colors?", sub: "Optional — if not, we'll design a mark and choose a palette that fits.", optional: true, skipLabel: "Design these for me" },
  {
    id: "photos",
    label: "Photos",
    kind: "list",
    lead: "Got photos? Paste links and I'll use them. No photos? We'll source tasteful, on-brand stock.",
    placeholder: "https://… image link",
    optional: true,
    skipLabel: "Use stock for now",
  },
  { id: "username", label: "Address", kind: "username", lead: "Last thing — pick your web address. You can connect a real domain later." },
  { id: "review", label: "Review", kind: "review", lead: "Here's everything I've got — edit anything that's off, then I'll build you two directions to choose from." },
];

const stepIndexById = new Map(STEPS.map((s, i) => [s.id, i]));

export function Conversation({ projectId, initial }: { projectId: string; initial?: Partial<ConversationDraft> }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ConversationDraft>({ ...emptyDraft(), ...initial });
  const [idx, setIdx] = useState(0);
  const [skip, setSkip] = useState<Set<string>>(new Set());
  const [inferredNote, setInferredNote] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [submitting, setSubmitting] = useState(false);

  const step = STEPS[idx]!;
  const patch = (p: Partial<ConversationDraft>) => setDraft((d) => ({ ...d, ...p }));

  const nextIdx = (from: number) => {
    let i = from + 1;
    while (i < STEPS.length && skip.has(STEPS[i]!.id)) i++;
    return Math.min(i, STEPS.length - 1);
  };
  const prevIdx = (from: number) => {
    let i = from - 1;
    while (i > 0 && skip.has(STEPS[i]!.id)) i--;
    return Math.max(i, 0);
  };
  const next = () => setIdx((i) => nextIdx(i));
  const back = () => setIdx((i) => prevIdx(i));
  const jump = (id: string) => {
    const i = stepIndexById.get(id);
    if (i != null) setIdx(i);
  };

  // Progress over the *visible* steps.
  const visible = STEPS.filter((s) => !skip.has(s.id));
  const visiblePos = visible.findIndex((s) => s.id === step.id);
  const progress = Math.round((visiblePos / (visible.length - 1)) * 100);

  // Detail → quality meter: how many enriching answers given.
  const quality = qualityScore(draft);

  function applyInference(pitch: string) {
    const rule = inferCategory(pitch);
    if (!rule) return;
    setDraft((d) => ({
      ...d,
      category: d.category || rule.label,
      categoryKey: rule.key,
      primaryGoal: d.primaryGoal || rule.goal,
      voice: d.voice.length ? d.voice : rule.voice,
      pages: d.pages.length ? d.pages : rule.pages,
    }));
    setSkip((s) => new Set([...s, "category"]));
    setInferredNote(
      `Looks like a ${rule.label.toLowerCase()} business — I've set the category, a sensible main goal (${rule.goal}), and a starting vibe. Tweak anything on the left.`,
    );
  }

  function submit() {
    setSubmitting(true);
    start(async () => {
      const res = await submitConversationAction(projectId, draft);
      if (res.ok) router.push(`/studio/${projectId}`);
      else {
        setSubmitting(false);
        jump("username");
      }
    });
  }

  return (
    <div className="min-h-screen brand-gradient">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-[12px] text-muted sm:block">Scoping your project</span>
            <div className="w-28">
              <Progress value={progress} />
            </div>
          </div>
        </div>
        {/* mobile section strip */}
        <div className="border-t border-line/60 px-5 py-1.5 text-[12px] text-muted lg:hidden">
          {sectionForStep(step.id)?.label} · step {visiblePos + 1} of {visible.length}
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-5 py-8 sm:px-8">
        {/* Sidebar TOC */}
        <aside className="sticky top-24 hidden h-fit w-64 shrink-0 lg:block">
          <Sidebar draft={draft} skip={skip} currentId={step.id} onJump={jump} quality={quality} />
        </aside>

        {/* Conversation */}
        <main className="min-w-0 flex-1">
          <div className="flex flex-col gap-6">
            {STEPS.slice(0, idx)
              .filter((s) => !skip.has(s.id))
              .map((s) => (
                <Turn key={s.id} step={s} draft={draft} onEdit={() => jump(s.id)} />
              ))}

            {inferredNote && idx > 0 && (
              <div className="ml-11 flex items-start gap-2 rounded-md border border-brand/20 bg-brand-soft/50 px-3 py-2 text-[13px] text-ink-soft">
                <span aria-hidden>✨</span>
                <span>{inferredNote}</span>
              </div>
            )}

            <div className="reveal flex flex-col gap-4">
              <LeadBubble>{step.lead}</LeadBubble>
              {step.sub && <p className="-mt-2 pl-11 text-[13px] text-muted">{step.sub}</p>}
              <div className="pl-11">
                <ActiveInput
                  key={step.id}
                  step={step}
                  draft={draft}
                  patch={patch}
                  projectId={projectId}
                  onAdvance={next}
                  onPitch={applyInference}
                  onSubmit={submit}
                  submitting={submitting || pending}
                  onJump={jump}
                />
              </div>
            </div>
          </div>

          {idx > 0 && step.kind !== "review" && (
            <button onClick={back} className="mt-8 pl-11 text-[13px] text-muted hover:text-ink-soft">
              ← Back
            </button>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Sidebar ──────────────────────────────────────────────────────────── */

function Sidebar({
  draft,
  skip,
  currentId,
  onJump,
  quality,
}: {
  draft: ConversationDraft;
  skip: Set<string>;
  currentId: string;
  onJump: (id: string) => void;
  quality: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow mb-3">Your brief</p>
        <ol className="flex flex-col gap-3">
          {SECTIONS.map((sec) => {
            const steps = sec.steps.map((id) => STEPS.find((s) => s.id === id)!).filter(Boolean);
            const active = steps.some((s) => s.id === currentId);
            return (
              <li key={sec.id}>
                <button onClick={() => onJump(steps[0]!.id)} className={cn("text-left text-[13.5px] font-medium", active ? "text-ink" : "text-ink-soft hover:text-ink")}>
                  {sec.label}
                </button>
                <ul className="mt-1.5 flex flex-col gap-1 border-l border-line pl-3">
                  {steps.map((s) => {
                    const st = stepStatus(s.id, currentId, draft, skip);
                    return (
                      <li key={s.id}>
                        <button onClick={() => onJump(s.id)} className="group flex w-full items-center gap-2 text-left">
                          <StatusDot status={st} />
                          <span className={cn("text-[12.5px]", st === "current" ? "font-semibold text-ink" : st === "pending" ? "text-muted" : "text-ink-soft group-hover:text-ink")}>
                            {s.label}
                          </span>
                          {st === "auto" && <span className="ml-auto text-[10px] text-brand">auto</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>

      <Divider />
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[12px]">
          <span className="text-muted">Detail → quality</span>
          <span className="font-medium text-ink-soft">{quality}%</span>
        </div>
        <Progress value={quality} />
        <p className="mt-2 text-[11.5px] leading-snug text-muted">More detail makes your site more distinctive. Nothing here is required beyond a name and a sentence.</p>
      </div>
    </div>
  );
}

type StepState = "done" | "current" | "auto" | "pending";

function stepStatus(id: string, currentId: string, d: ConversationDraft, skip: Set<string>): StepState {
  if (id === currentId) return "current";
  const answered = stepAnswered(id, d);
  if (skip.has(id)) return answered ? "auto" : "pending";
  if (answered) return "done";
  // visited but not answered (optional skipped) → done
  const ci = stepIndexById.get(currentId) ?? 0;
  const si = stepIndexById.get(id) ?? 0;
  return si < ci ? "done" : "pending";
}

function stepAnswered(id: string, d: ConversationDraft): boolean {
  switch (id) {
    case "pitch": return !!d.description.trim();
    case "name": return !!d.name.trim();
    case "category": return !!d.category.trim();
    case "goal": return !!d.primaryGoal.trim();
    case "audience": return d.audience.length > 0;
    case "voice": return d.voice.length > 0;
    case "color": return d.colorChoice !== "designer" || !!d.colorNotes || d.brandColors.length > 0;
    case "avoid": return !!d.avoid.trim();
    case "pages": return d.pagesMode === "custom" ? d.pages.length > 0 : false;
    case "offerings": return d.offerings.length > 0;
    case "proof": return d.proof.length > 0;
    case "contact": return !!d.email.trim();
    case "brand": return !!d.logoUrl || d.brandColors.length > 0;
    case "photos": return d.photos.length > 0;
    case "username": return !!d.username.trim();
    default: return false;
  }
}

function StatusDot({ status }: { status: StepState }) {
  if (status === "done" || status === "auto") {
    return (
      <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-success text-brand-ink">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" aria-hidden>
          <path d="M5 12l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (status === "current") return <span className="h-4 w-4 shrink-0 rounded-full border-2 border-brand" />;
  return <span className="h-4 w-4 shrink-0 rounded-full border-2 border-line-strong" />;
}

function sectionForStep(id: string) {
  return SECTIONS.find((s) => s.steps.includes(id));
}

function qualityScore(d: ConversationDraft): number {
  const checks = [
    !!d.description.trim(),
    !!d.name.trim(),
    !!d.category.trim(),
    !!d.primaryGoal.trim(),
    d.audience.length > 0,
    d.voice.length > 0,
    d.colorChoice !== "designer" || !!d.colorNotes,
    d.offerings.length > 0,
    d.proof.length > 0,
    !!d.email.trim(),
    !!d.logoUrl || d.brandColors.length > 0,
    d.photos.length > 0,
    d.pagesMode === "custom",
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* ── Bubbles ──────────────────────────────────────────────────────────── */

function Avatar() {
  return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-semibold text-brand-ink">A</span>;
}

function LeadBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar />
      <div className="max-w-[40rem] rounded-lg rounded-tl-sm border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink shadow-xs">{children}</div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex justify-end">
      <div className="max-w-[34rem] rounded-lg rounded-tr-sm bg-brand-soft px-4 py-2.5 text-[14.5px] text-ink">{children}</div>
    </div>
  );
}

function Turn({ step, draft, onEdit }: { step: Step; draft: ConversationDraft; onEdit: () => void }) {
  const answer = answerText(step, draft);
  return (
    <div className="group flex flex-col gap-3">
      <LeadBubble>{step.lead}</LeadBubble>
      {answer ? (
        <div className="flex items-center justify-end gap-2">
          <button onClick={onEdit} className="text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100">edit</button>
          <UserBubble>{answer}</UserBubble>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2">
          <button onClick={onEdit} className="text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100">add</button>
          <span className="text-[12px] text-muted">— skipped, I&apos;ll choose</span>
        </div>
      )}
    </div>
  );
}

function answerText(step: Step, d: ConversationDraft): string {
  switch (step.id) {
    case "pitch": return d.description;
    case "name": return d.name;
    case "category": return d.category;
    case "goal": return d.primaryGoal;
    case "audience": return d.audience.join(", ");
    case "voice": return d.voice.join(", ");
    case "color": return d.colorChoice === "designer" ? "You choose" : [d.colorChoice, d.colorNotes].filter(Boolean).join(" · ");
    case "avoid": return d.avoid;
    case "pages": return d.pagesMode === "auto" ? "Lay out the right pages for me" : ["Home", ...d.pages].join(", ");
    case "offerings": return d.offerings.join(", ");
    case "proof": return d.proof.join(", ");
    case "contact": return [d.email, d.phone, [d.address, d.city].filter(Boolean).join(", "), d.instagram, d.hours].filter(Boolean).join(" · ");
    case "brand": return [d.logoUrl ? "logo provided" : "", ...d.brandColors].filter(Boolean).join(" · ");
    case "photos": return d.photos.length ? `${d.photos.length} photo${d.photos.length > 1 ? "s" : ""}` : "";
    case "username": return d.username ? `${d.username}.simplesight.co` : "";
    default: return "";
  }
}

/* ── Active input per step kind ────────────────────────────────────────── */

interface ActiveProps {
  step: Step;
  draft: ConversationDraft;
  patch: (p: Partial<ConversationDraft>) => void;
  projectId: string;
  onAdvance: () => void;
  onPitch: (text: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  onJump: (id: string) => void;
}

function ActiveInput(props: ActiveProps) {
  const { step, draft, patch, onAdvance, onPitch } = props;
  switch (step.kind) {
    case "text":
      return (
        <TextStep
          step={step}
          value={textFieldFor(step, draft)}
          onSave={(v) => {
            patch(textPatch(step, v));
            if (step.id === "pitch") onPitch(v);
          }}
          onAdvance={onAdvance}
        />
      );
    case "single":
      return <SingleStep step={step} value={singleValue(step, draft)} onSave={(v) => patch(singlePatch(step, v))} onAdvance={onAdvance} />;
    case "multi":
      return <MultiStep step={step} selected={multiFor(step, draft)} onChange={(v) => patch(multiPatch(step, v))} onAdvance={onAdvance} optional={step.optional} />;
    case "color":
      return <ColorStep draft={draft} patch={patch} onAdvance={onAdvance} />;
    case "pages":
      return <PagesStep draft={draft} patch={patch} onAdvance={onAdvance} />;
    case "list":
      return <ListStep step={step} items={listFor(step, draft)} onChange={(v) => patch(listPatch(step, v))} onAdvance={onAdvance} />;
    case "contact":
      return <ContactStep draft={draft} patch={patch} onAdvance={onAdvance} />;
    case "brand":
      return <BrandStep projectId={props.projectId} draft={draft} patch={patch} onAdvance={onAdvance} />;
    case "username":
      return <UsernameStep projectId={props.projectId} draft={draft} patch={patch} onAdvance={onAdvance} />;
    case "review":
      return <ReviewStep draft={draft} onSubmit={props.onSubmit} submitting={props.submitting} onJump={props.onJump} />;
  }
}

function textFieldFor(s: Step, d: ConversationDraft) {
  return s.id === "pitch" ? d.description : s.id === "name" ? d.name : s.id === "avoid" ? d.avoid : "";
}
function textPatch(s: Step, v: string): Partial<ConversationDraft> {
  if (s.id === "pitch") return { description: v };
  if (s.id === "name") return { name: v };
  return { avoid: v };
}
function singleValue(s: Step, d: ConversationDraft) {
  return s.id === "category" ? d.category : d.primaryGoal;
}
function singlePatch(s: Step, v: string): Partial<ConversationDraft> {
  return s.id === "category" ? { category: v } : { primaryGoal: v };
}
function multiFor(s: Step, d: ConversationDraft) {
  return s.id === "audience" ? d.audience : d.voice;
}
function multiPatch(s: Step, v: string[]): Partial<ConversationDraft> {
  return s.id === "audience" ? { audience: v } : { voice: v };
}
function listFor(s: Step, d: ConversationDraft) {
  return s.id === "offerings" ? d.offerings : s.id === "proof" ? d.proof : d.photos;
}
function listPatch(s: Step, v: string[]): Partial<ConversationDraft> {
  return s.id === "offerings" ? { offerings: v } : s.id === "proof" ? { proof: v } : { photos: v };
}

function TextStep({ step, value, onSave, onAdvance }: { step: Step; value: string; onSave: (v: string) => void; onAdvance: () => void }) {
  const [v, setV] = useState(value);
  const big = step.id === "pitch";
  const go = () => {
    onSave(v.trim());
    onAdvance();
  };
  return (
    <div className="flex flex-col gap-3">
      {big ? (
        <Textarea autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder={step.placeholder} className="min-h-[110px]" />
      ) : (
        <Input autoFocus value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (v.trim() || step.optional) && go()} placeholder={step.placeholder} />
      )}
      <div className="flex items-center gap-2">
        <Button onClick={go} disabled={!step.optional && !v.trim()}>Continue</Button>
        {step.optional && (
          <Button variant="ghost" onClick={() => { onSave(""); onAdvance(); }}>{step.skipLabel ?? "Skip"}</Button>
        )}
      </div>
    </div>
  );
}

function CustomComposer({ onAdd, placeholder = "Type your own…" }: { onAdd: (v: string) => void; placeholder?: string }) {
  const [v, setV] = useState("");
  const add = () => { if (v.trim()) { onAdd(v.trim()); setV(""); } };
  return (
    <div className="flex items-center gap-2">
      <Input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder={placeholder} className="h-9 text-[14px]" />
      <Button size="sm" variant="secondary" onClick={add}>Add</Button>
    </div>
  );
}

function SingleStep({ step, value, onSave, onAdvance }: { step: Step; value: string; onSave: (v: string) => void; onAdvance: () => void }) {
  const [sel, setSel] = useState(value);
  const opts = useMemo(() => (step.options ?? []).concat(sel && !(step.options ?? []).includes(sel) ? [sel] : []), [step.options, sel]);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <Chip key={o} as="button" selected={sel === o} onClick={() => setSel(o)}>{o}</Chip>
        ))}
      </div>
      <CustomComposer onAdd={(v) => setSel(v)} placeholder="Something else? Type it…" />
      <Button onClick={() => { onSave(sel); onAdvance(); }} disabled={!sel} className="self-start">
        {value && sel === value ? "Keep this" : "Continue"}
      </Button>
    </div>
  );
}

function MultiStep({ step, selected, onChange, onAdvance, optional }: { step: Step; selected: string[]; onChange: (v: string[]) => void; onAdvance: () => void; optional?: boolean }) {
  const toggle = (o: string) => onChange(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o]);
  const all = [...(step.options ?? []), ...selected.filter((s) => !(step.options ?? []).includes(s))];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {all.map((o) => (
          <Chip key={o} as="button" selected={selected.includes(o)} onClick={() => toggle(o)}>{o}</Chip>
        ))}
      </div>
      <CustomComposer onAdd={(v) => onChange([...selected, v])} />
      <div className="flex items-center gap-2">
        <Button onClick={onAdvance} disabled={!optional && selected.length === 0}>Continue</Button>
        {optional && <Button variant="ghost" onClick={onAdvance}>Skip</Button>}
      </div>
    </div>
  );
}

function ColorStep({ draft, patch, onAdvance }: { draft: ConversationDraft; patch: (p: Partial<ConversationDraft>) => void; onAdvance: () => void }) {
  const [picked, setPicked] = useState<string>(draft.colorChoice === "designer" ? "" : "");
  const custom = picked === "I have brand colors";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {COLOR_OPTIONS.map((o) => (
          <Chip key={o} as="button" selected={picked === o} onClick={() => { setPicked(o); patch({ colorChoice: COLOR_MAP[o]!.choice, appearance: COLOR_MAP[o]!.appearance }); }}>{o}</Chip>
        ))}
      </div>
      {custom && <Input autoFocus placeholder="e.g. deep navy and warm gold, or #1a2b3c" value={draft.colorNotes} onChange={(e) => patch({ colorNotes: e.target.value })} />}
      {picked && <Button onClick={onAdvance} className="self-start">Continue</Button>}
    </div>
  );
}

function PagesStep({ draft, patch, onAdvance }: { draft: ConversationDraft; patch: (p: Partial<ConversationDraft>) => void; onAdvance: () => void }) {
  const custom = draft.pagesMode === "custom";
  const opts = [...PAGE_OPTIONS, ...draft.pages.filter((p) => !PAGE_OPTIONS.includes(p))];
  const toggle = (p: string) => patch({ pages: draft.pages.includes(p) ? draft.pages.filter((x) => x !== p) : [...draft.pages, p] });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Chip as="button" selected={!custom} onClick={() => patch({ pagesMode: "auto" })}>Lay out the right pages for me</Chip>
        <Chip as="button" selected={custom} onClick={() => patch({ pagesMode: "custom" })}>I&apos;ll choose the pages</Chip>
      </div>
      {custom && (
        <div className="flex flex-col gap-3 rounded-md border border-line bg-paper-2/60 p-4">
          {draft.pages.length > 0 && <p className="text-[12px] text-muted">Pre-filled from your industry — tweak as you like.</p>}
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">Home</Badge>
            {opts.map((p) => (
              <Chip key={p} as="button" selected={draft.pages.includes(p)} onClick={() => toggle(p)}>{p}</Chip>
            ))}
          </div>
          <CustomComposer onAdd={(v) => patch({ pages: [...draft.pages, v] })} placeholder="Add a custom page name…" />
        </div>
      )}
      <Button onClick={onAdvance} className="self-start">Continue</Button>
    </div>
  );
}

function ListStep({ step, items, onChange, onAdvance }: { step: Step; items: string[]; onChange: (v: string[]) => void; onAdvance: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((it, i) => (
            <Badge key={`${it}-${i}`} tone="neutral" className="gap-2">
              {it}
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-muted hover:text-danger" aria-label="Remove">×</button>
            </Badge>
          ))}
        </div>
      )}
      <CustomComposer onAdd={(v) => onChange([...items, v])} placeholder={step.placeholder} />
      <div className="flex items-center gap-2">
        <Button onClick={onAdvance}>Continue</Button>
        <Button variant="ghost" onClick={onAdvance}>{step.skipLabel ?? "Skip"}</Button>
      </div>
    </div>
  );
}

function ContactStep({ draft, patch, onAdvance }: { draft: ConversationDraft; patch: (p: Partial<ConversationDraft>) => void; onAdvance: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-4 shadow-xs">
      <Field label="Email *" htmlFor="c-email">
        <Input id="c-email" type="email" autoFocus value={draft.email} onChange={(e) => patch({ email: e.target.value })} placeholder="you@business.com" />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Phone" htmlFor="c-phone"><Input id="c-phone" value={draft.phone} onChange={(e) => patch({ phone: e.target.value })} placeholder="(555) 010-2030" /></Field>
        <Field label="Instagram" htmlFor="c-ig"><Input id="c-ig" value={draft.instagram} onChange={(e) => patch({ instagram: e.target.value })} placeholder="@yourhandle" /></Field>
        <Field label="Address" htmlFor="c-addr"><Input id="c-addr" value={draft.address} onChange={(e) => patch({ address: e.target.value })} placeholder="2500 Larimer St" /></Field>
        <Field label="City" htmlFor="c-city"><Input id="c-city" value={draft.city} onChange={(e) => patch({ city: e.target.value })} placeholder="Denver, CO" /></Field>
      </div>
      <Field label="Hours" htmlFor="c-hours"><Input id="c-hours" value={draft.hours} onChange={(e) => patch({ hours: e.target.value })} placeholder="Mon–Fri 9–5, Sat 10–2" /></Field>
      <Button onClick={onAdvance} disabled={!draft.email.trim()} className="self-start">Continue</Button>
    </div>
  );
}

function BrandStep({ projectId, draft, patch, onAdvance }: { projectId: string; draft: ConversationDraft; patch: (p: Partial<ConversationDraft>) => void; onAdvance: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <BrandStudio
        projectId={projectId}
        name={draft.name}
        logoUrl={draft.logoUrl}
        brandColors={draft.brandColors}
        onChange={(p) => patch(p)}
      />
      <Button onClick={onAdvance} className="self-start">Continue</Button>
    </div>
  );
}

function UsernameStep({ projectId, draft, patch, onAdvance }: { projectId: string; draft: ConversationDraft; patch: (p: Partial<ConversationDraft>) => void; onAdvance: () => void }) {
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [checking, setChecking] = useState(false);
  async function check() {
    if (!draft.username.trim()) return;
    setChecking(true);
    const r = await checkUsernameAction(projectId, draft.username.trim());
    setStatus(r);
    setChecking(false);
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          value={draft.username}
          onChange={(e) => { patch({ username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }); setStatus(null); }}
          onBlur={check}
          placeholder="yourname"
          className="max-w-[220px]"
        />
        <span className="text-[14px] text-muted">.simplesight.co</span>
        {checking && <Spinner className="h-4 w-4 text-muted" />}
      </div>
      {status?.ok && <p className="text-[13px] text-success">That address is available.</p>}
      {status?.error && <p className="text-[13px] text-danger">{status.error}</p>}
      <Button onClick={onAdvance} disabled={!draft.username.trim() || status?.ok === false} className="self-start">Continue</Button>
    </div>
  );
}

function ReviewStep({ draft, onSubmit, submitting, onJump }: { draft: ConversationDraft; onSubmit: () => void; submitting: boolean; onJump: (id: string) => void }) {
  const rows: { k: string; v: string; step: string }[] = [
    { k: "Business", v: draft.name, step: "name" },
    { k: "What it does", v: draft.description, step: "pitch" },
    { k: "Industry", v: draft.category, step: "category" },
    { k: "Main goal", v: draft.primaryGoal, step: "goal" },
    { k: "Audience", v: draft.audience.join(", "), step: "audience" },
    { k: "Voice", v: draft.voice.join(", "), step: "voice" },
    { k: "Colors", v: draft.colorChoice === "designer" ? "Designer's choice" : [draft.colorChoice, draft.colorNotes, ...draft.brandColors].filter(Boolean).join(" · "), step: "color" },
    { k: "Pages", v: draft.pagesMode === "auto" ? "We'll choose" : ["Home", ...draft.pages].join(", "), step: "pages" },
    { k: "Offerings", v: draft.offerings.join(", "), step: "offerings" },
    { k: "Proof", v: draft.proof.join(", "), step: "proof" },
    { k: "Contact", v: [draft.email, draft.phone].filter(Boolean).join(" · "), step: "contact" },
    { k: "Address", v: draft.username ? `${draft.username}.simplesight.co` : "—", step: "username" },
  ].filter((r) => r.v);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-line bg-surface shadow-xs">
        {rows.map((r, i) => (
          <div key={r.k} className={cn("group flex items-center gap-4 px-4 py-3 text-[14px]", i > 0 && "border-t border-line")}>
            <span className="w-28 shrink-0 text-muted">{r.k}</span>
            <span className="min-w-0 flex-1 truncate text-ink">{r.v}</span>
            <button onClick={() => onJump(r.step)} className="shrink-0 text-[12px] text-brand opacity-0 transition-opacity group-hover:opacity-100">Edit</button>
          </div>
        ))}
      </div>
      <Divider />
      <div className="flex flex-col items-start gap-3">
        <p className="text-[14px] text-ink-soft">I&apos;ll build <strong>two complete directions</strong> — one from each of our studios — so you can compare and pick. This takes a few minutes while the models design, write, and build each page.</p>
        <Button size="lg" onClick={onSubmit} loading={submitting} disabled={submitting}>{submitting ? "Starting the build…" : "Build my two concepts →"}</Button>
      </div>
    </div>
  );
}

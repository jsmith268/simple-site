"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Chip, Container, Divider, Field, Input, Logo, Progress, Spinner, Textarea, cn } from "../../ui";
import { type ConversationDraft, PAGE_OPTIONS, emptyDraft } from "./draft";
import { checkUsernameAction, submitConversationAction } from "./conversation-actions";

type Kind = "text" | "single" | "multi" | "color" | "pages" | "list" | "contact" | "username" | "review";

interface Step {
  id: string;
  kind: Kind;
  lead: string; // the build-lead's message
  sub?: string;
  placeholder?: string;
  options?: string[];
  optional?: boolean;
  skipLabel?: string;
}

const STEPS: Step[] = [
  {
    id: "pitch",
    kind: "text",
    lead: "Hey — I'm Avery, the lead on your build. Let's scope your site like we're sitting across a table. In a sentence or two: what's the business, and what should the site do for you?",
    sub: "Paste your current site or Instagram if you have one — I'll read it for context.",
    placeholder: "e.g. A candlelit natural-wine bar in the Mission. I want people to book a table and join our list.",
  },
  { id: "name", kind: "text", lead: "Love it. What's it called?", placeholder: "Your business name" },
  {
    id: "category",
    kind: "single",
    lead: "What kind of business is it? This sets the whole direction.",
    options: ["Restaurant / Café", "Bar / Winery", "Salon / Spa", "Gym / Fitness", "Medical / Dental", "Law / Professional", "Home Services", "Retail / Shop", "Real Estate", "Creative / Studio"],
  },
  {
    id: "goal",
    kind: "single",
    lead: "When someone lands on the site, what's the one thing you most want them to do?",
    sub: "This becomes the main button on every page.",
    options: ["Book an appointment", "Reserve a table", "Call us", "Visit in person", "Get a quote", "Order online", "Join the list", "See our work"],
  },
  {
    id: "audience",
    kind: "multi",
    lead: "Who's it for? Pick anyone that fits — or add your own.",
    options: ["Local neighbors", "Busy professionals", "Families", "High-end clients", "Other businesses", "Tourists & visitors", "First-timers"],
    optional: true,
  },
  {
    id: "voice",
    kind: "multi",
    lead: "How should it feel? These words steer the design and the writing.",
    options: ["Warm & welcoming", "Bold & confident", "Refined & premium", "Minimal & calm", "Playful & fun", "Classic & trusted", "Modern & sleek", "A little irreverent"],
    optional: true,
  },
  {
    id: "avoid",
    kind: "text",
    lead: "Anything to steer clear of? Words, colors, or styles you can't stand.",
    placeholder: "e.g. nothing corporate or stocky; no neon",
    optional: true,
    skipLabel: "Nothing comes to mind",
  },
  {
    id: "color",
    kind: "color",
    lead: "Colors. Want to point me somewhere, or should the designers choose?",
    options: ["You choose — I trust you", "Warm & earthy", "Cool blues & greens", "Dark & moody", "Bright & airy", "I have brand colors"],
  },
  {
    id: "pages",
    kind: "pages",
    lead: "Now the pages. Want me to lay out the right set for your kind of business — or do you know exactly what you want?",
    sub: "Home is always included.",
  },
  {
    id: "offerings",
    kind: "list",
    lead: "What do you offer? Add a few — services, dishes, packages. The more you give me, the richer the middle of the site.",
    placeholder: "e.g. Bridal styling",
    optional: true,
    skipLabel: "Skip — pull from my description",
  },
  {
    id: "proof",
    kind: "list",
    lead: "Any proof worth showing? Years in business, customers served, ratings, awards.",
    sub: "I never make these up — if it's blank, I leave it out.",
    placeholder: "e.g. 2,500+ clients",
    optional: true,
    skipLabel: "Nothing yet",
  },
  {
    id: "contact",
    kind: "contact",
    lead: "The practical bits — so visitors can actually reach you.",
    sub: "Only the email is required. Everything else makes the site fuller.",
  },
  {
    id: "photos",
    kind: "list",
    lead: "Got photos? Paste links and I'll use them. No photos? We'll source tasteful, on-brand stock.",
    placeholder: "https://… image link",
    optional: true,
    skipLabel: "Use stock for now",
  },
  {
    id: "username",
    kind: "username",
    lead: "Last thing — pick your web address. You can connect a real domain later.",
  },
  { id: "review", kind: "review", lead: "Here's what I've got. Look it over — then I'll build you two different directions to choose from." },
];

const COLOR_MAP: Record<string, { choice: string; appearance: ConversationDraft["appearance"] }> = {
  "You choose — I trust you": { choice: "designer", appearance: "either" },
  "Warm & earthy": { choice: "warm", appearance: "light" },
  "Cool blues & greens": { choice: "cool", appearance: "light" },
  "Dark & moody": { choice: "dark", appearance: "dark" },
  "Bright & airy": { choice: "bright", appearance: "light" },
  "I have brand colors": { choice: "custom", appearance: "either" },
};

export function Conversation({ projectId, initial }: { projectId: string; initial?: Partial<ConversationDraft> }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ConversationDraft>({ ...emptyDraft(), ...initial });
  const [idx, setIdx] = useState(0);
  const [pending, start] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const step = STEPS[idx]!;
  const progress = Math.round((idx / (STEPS.length - 1)) * 100);
  const patch = (p: Partial<ConversationDraft>) => setDraft((d) => ({ ...d, ...p }));
  const next = () => setIdx((i) => Math.min(STEPS.length - 1, i + 1));
  const back = () => setIdx((i) => Math.max(0, i - 1));

  function submit() {
    setSubmitting(true);
    start(async () => {
      const res = await submitConversationAction(projectId, draft);
      if (res.ok) router.push(`/studio/${projectId}`);
      else {
        setSubmitting(false);
        setIdx(STEPS.findIndex((s) => s.id === "username"));
      }
    });
  }

  return (
    <div className="min-h-screen brand-gradient">
      <header className="sticky top-0 z-10 border-b border-line/70 bg-paper/80 backdrop-blur">
        <Container size="lg" className="flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-[12px] text-muted sm:block">Scoping your project</span>
            <div className="w-32">
              <Progress value={progress} />
            </div>
          </div>
        </Container>
      </header>

      <Container size="sm" className="py-10 sm:py-14">
        {/* Transcript of answered steps */}
        <div ref={scrollRef} className="flex flex-col gap-6">
          {STEPS.slice(0, idx).map((s) => (
            <Turn key={s.id} step={s} draft={draft} onEdit={() => setIdx(STEPS.findIndex((x) => x.id === s.id))} />
          ))}

          {/* Active step */}
          <div className="reveal flex flex-col gap-4">
            <LeadBubble>{step.lead}</LeadBubble>
            {step.sub && <p className="-mt-2 pl-11 text-[13px] text-muted">{step.sub}</p>}
            <div className="pl-11">
              <ActiveInput
                step={step}
                draft={draft}
                patch={patch}
                projectId={projectId}
                onAdvance={next}
                onSubmit={submit}
                submitting={submitting || pending}
              />
            </div>
          </div>
        </div>

        {idx > 0 && step.kind !== "review" && (
          <button onClick={back} className="mt-8 pl-11 text-[13px] text-muted hover:text-ink-soft">
            ← Back
          </button>
        )}
      </Container>
    </div>
  );
}

/* ── Conversation bubbles ──────────────────────────────────────────────── */

function Avatar() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-600 text-brand-ink">A</span>
  );
}

function LeadBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar />
      <div className="max-w-[40rem] rounded-lg rounded-tl-sm border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink shadow-xs">
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;
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
          <button onClick={onEdit} className="text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
            edit
          </button>
          <UserBubble>{answer}</UserBubble>
        </div>
      ) : (
        <div className="flex justify-end">
          <span className="text-[12px] text-muted">— skipped, I&apos;ll choose</span>
        </div>
      )}
    </div>
  );
}

function answerText(step: Step, d: ConversationDraft): string {
  switch (step.id) {
    case "pitch":
      return d.description;
    case "name":
      return d.name;
    case "category":
      return d.category;
    case "goal":
      return d.primaryGoal;
    case "audience":
      return d.audience.join(", ");
    case "voice":
      return d.voice.join(", ");
    case "avoid":
      return d.avoid;
    case "color":
      return d.colorChoice === "designer" ? "You choose" : [d.colorChoice, d.colorNotes].filter(Boolean).join(" · ");
    case "pages":
      return d.pagesMode === "auto" ? "Lay out the right pages for me" : ["Home", ...d.pages].join(", ");
    case "offerings":
      return d.offerings.join(", ");
    case "proof":
      return d.proof.join(", ");
    case "contact":
      return [d.email, d.phone, [d.address, d.city].filter(Boolean).join(", "), d.instagram, d.hours].filter(Boolean).join(" · ");
    case "photos":
      return d.photos.length ? `${d.photos.length} photo${d.photos.length > 1 ? "s" : ""}` : "";
    case "username":
      return d.username ? `${d.username}.simplesight.co` : "";
    default:
      return "";
  }
}

/* ── Active input per step kind ────────────────────────────────────────── */

function ActiveInput(props: {
  step: Step;
  draft: ConversationDraft;
  patch: (p: Partial<ConversationDraft>) => void;
  projectId: string;
  onAdvance: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const { step, draft, patch, onAdvance } = props;
  switch (step.kind) {
    case "text":
      return <TextStep step={step} value={textFieldFor(step, draft)} onSave={(v) => patch(textPatch(step, v))} onAdvance={onAdvance} />;
    case "single":
      return <SingleStep step={step} onPick={(v) => { patch(singlePatch(step, v)); onAdvance(); }} />;
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
    case "username":
      return <UsernameStep projectId={props.projectId} draft={draft} patch={patch} onAdvance={onAdvance} />;
    case "review":
      return <ReviewStep draft={draft} onSubmit={props.onSubmit} submitting={props.submitting} />;
  }
}

// field mapping helpers
function textFieldFor(s: Step, d: ConversationDraft): string {
  return s.id === "pitch" ? d.description : s.id === "name" ? d.name : s.id === "avoid" ? d.avoid : "";
}
function textPatch(s: Step, v: string): Partial<ConversationDraft> {
  if (s.id === "pitch") return { description: v };
  if (s.id === "name") return { name: v };
  return { avoid: v };
}
function singlePatch(s: Step, v: string): Partial<ConversationDraft> {
  if (s.id === "category") return { category: v };
  return { primaryGoal: v };
}
function multiFor(s: Step, d: ConversationDraft): string[] {
  return s.id === "audience" ? d.audience : d.voice;
}
function multiPatch(s: Step, v: string[]): Partial<ConversationDraft> {
  return s.id === "audience" ? { audience: v } : { voice: v };
}
function listFor(s: Step, d: ConversationDraft): string[] {
  return s.id === "offerings" ? d.offerings : s.id === "proof" ? d.proof : d.photos;
}
function listPatch(s: Step, v: string[]): Partial<ConversationDraft> {
  return s.id === "offerings" ? { offerings: v } : s.id === "proof" ? { proof: v } : { photos: v };
}

function TextStep({ step, value, onSave, onAdvance }: { step: Step; value: string; onSave: (v: string) => void; onAdvance: () => void }) {
  const [v, setV] = useState(value);
  const big = step.id === "pitch";
  return (
    <div className="flex flex-col gap-3">
      {big ? (
        <Textarea autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder={step.placeholder} className="min-h-[110px]" />
      ) : (
        <Input autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder={step.placeholder} />
      )}
      <div className="flex items-center gap-2">
        <Button onClick={() => { onSave(v.trim()); onAdvance(); }} disabled={!step.optional && !v.trim()}>
          Continue
        </Button>
        {step.optional && (
          <Button variant="ghost" onClick={() => { onSave(""); onAdvance(); }}>
            {step.skipLabel ?? "Skip"}
          </Button>
        )}
      </div>
    </div>
  );
}

function CustomComposer({ onAdd, placeholder = "Type your own…" }: { onAdd: (v: string) => void; placeholder?: string }) {
  const [v, setV] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && v.trim()) { onAdd(v.trim()); setV(""); } }}
        placeholder={placeholder}
        className="h-9 text-[14px]"
      />
      <Button size="sm" variant="secondary" onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(""); } }}>
        Add
      </Button>
    </div>
  );
}

function SingleStep({ step, onPick }: { step: Step; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {step.options?.map((o) => (
          <Chip key={o} as="button" onClick={() => onPick(o)}>
            {o}
          </Chip>
        ))}
      </div>
      <CustomComposer onAdd={onPick} placeholder="Something else? Type it…" />
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
          <Chip key={o} as="button" selected={selected.includes(o)} onClick={() => toggle(o)}>
            {o}
          </Chip>
        ))}
      </div>
      <CustomComposer onAdd={(v) => onChange([...selected, v])} />
      <div className="flex items-center gap-2">
        <Button onClick={onAdvance} disabled={!optional && selected.length === 0}>
          Continue
        </Button>
        {optional && (
          <Button variant="ghost" onClick={onAdvance}>
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}

function ColorStep({ draft, patch, onAdvance }: { draft: ConversationDraft; patch: (p: Partial<ConversationDraft>) => void; onAdvance: () => void }) {
  const [picked, setPicked] = useState<string>("");
  const custom = picked === "I have brand colors";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {Object.keys(COLOR_MAP).map((o) => (
          <Chip
            key={o}
            as="button"
            selected={picked === o}
            onClick={() => { setPicked(o); patch({ colorChoice: COLOR_MAP[o]!.choice, appearance: COLOR_MAP[o]!.appearance }); }}
          >
            {o}
          </Chip>
        ))}
      </div>
      {custom && (
        <Input autoFocus placeholder="e.g. deep navy and warm gold, or #1a2b3c" value={draft.colorNotes} onChange={(e) => patch({ colorNotes: e.target.value })} />
      )}
      {picked && <Button onClick={onAdvance}>Continue</Button>}
    </div>
  );
}

function PagesStep({ draft, patch, onAdvance }: { draft: ConversationDraft; patch: (p: Partial<ConversationDraft>) => void; onAdvance: () => void }) {
  const custom = draft.pagesMode === "custom";
  const toggle = (p: string) => patch({ pages: draft.pages.includes(p) ? draft.pages.filter((x) => x !== p) : [...draft.pages, p] });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Chip as="button" selected={!custom} onClick={() => patch({ pagesMode: "auto" })}>
          Lay out the right pages for me
        </Chip>
        <Chip as="button" selected={custom} onClick={() => patch({ pagesMode: "custom" })}>
          I'll choose the pages
        </Chip>
      </div>
      {custom && (
        <div className="flex flex-col gap-3 rounded-md border border-line bg-paper-2/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">Home</Badge>
            {PAGE_OPTIONS.map((p) => (
              <Chip key={p} as="button" selected={draft.pages.includes(p)} onClick={() => toggle(p)}>
                {p}
              </Chip>
            ))}
          </div>
          <CustomComposer onAdd={(v) => patch({ pages: [...draft.pages, v] })} placeholder="Add a custom page name…" />
          {draft.pages.filter((p) => !PAGE_OPTIONS.includes(p)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {draft.pages.filter((p) => !PAGE_OPTIONS.includes(p)).map((p) => (
                <Badge key={p} tone="neutral">
                  {p}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
      <Button onClick={onAdvance}>Continue</Button>
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
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-muted hover:text-danger" aria-label="Remove">
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
      <CustomComposer onAdd={(v) => onChange([...items, v])} placeholder={step.placeholder} />
      <div className="flex items-center gap-2">
        <Button onClick={onAdvance}>Continue</Button>
        <Button variant="ghost" onClick={onAdvance}>
          {step.skipLabel ?? "Skip"}
        </Button>
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
        <Field label="Phone" htmlFor="c-phone">
          <Input id="c-phone" value={draft.phone} onChange={(e) => patch({ phone: e.target.value })} placeholder="(555) 010-2030" />
        </Field>
        <Field label="Instagram" htmlFor="c-ig">
          <Input id="c-ig" value={draft.instagram} onChange={(e) => patch({ instagram: e.target.value })} placeholder="@yourhandle" />
        </Field>
        <Field label="Address" htmlFor="c-addr">
          <Input id="c-addr" value={draft.address} onChange={(e) => patch({ address: e.target.value })} placeholder="2500 Larimer St" />
        </Field>
        <Field label="City" htmlFor="c-city">
          <Input id="c-city" value={draft.city} onChange={(e) => patch({ city: e.target.value })} placeholder="Denver, CO" />
        </Field>
      </div>
      <Field label="Hours" htmlFor="c-hours">
        <Input id="c-hours" value={draft.hours} onChange={(e) => patch({ hours: e.target.value })} placeholder="Mon–Fri 9–5, Sat 10–2" />
      </Field>
      <Button onClick={onAdvance} disabled={!draft.email.trim()} className="self-start">
        Continue
      </Button>
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
      <Button onClick={onAdvance} disabled={!draft.username.trim() || status?.ok === false}>
        Continue
      </Button>
    </div>
  );
}

function ReviewStep({ draft, onSubmit, submitting }: { draft: ConversationDraft; onSubmit: () => void; submitting: boolean }) {
  const rows: [string, string][] = [
    ["Business", draft.name],
    ["What it does", draft.description],
    ["Category", draft.category],
    ["Main goal", draft.primaryGoal],
    ["Audience", draft.audience.join(", ")],
    ["Feel", draft.voice.join(", ")],
    ["Colors", draft.colorChoice === "designer" ? "Designer's choice" : [draft.colorChoice, draft.colorNotes].filter(Boolean).join(" · ")],
    ["Pages", draft.pagesMode === "auto" ? "We'll choose" : ["Home", ...draft.pages].join(", ")],
    ["Offerings", draft.offerings.join(", ")],
    ["Proof", draft.proof.join(", ")],
    ["Contact", [draft.email, draft.phone].filter(Boolean).join(" · ")],
    ["Address", draft.username ? `${draft.username}.simplesight.co` : "—"],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-line bg-surface shadow-xs">
        {rows.map(([k, v], i) => (
          <div key={k} className={cn("flex gap-4 px-4 py-3 text-[14px]", i > 0 && "border-t border-line")}>
            <span className="w-28 shrink-0 text-muted">{k}</span>
            <span className="text-ink">{v}</span>
          </div>
        ))}
      </div>
      <Divider />
      <div className="flex flex-col items-start gap-3">
        <p className="text-[14px] text-ink-soft">
          I'll build <strong>two complete directions</strong> — one from each of our studios — so you can compare and pick. Takes a few minutes.
        </p>
        <Button size="lg" onClick={onSubmit} loading={submitting} disabled={submitting}>
          {submitting ? "Starting the build…" : "Build my two concepts →"}
        </Button>
      </div>
    </div>
  );
}

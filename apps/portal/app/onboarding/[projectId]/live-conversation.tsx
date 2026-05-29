"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ChatMessage, IntakeCollected } from "@simplesight/contracts";
import { Button, Chip, Divider, Input, Logo, Progress, Spinner, Textarea, cn } from "../../ui";
import { SECTIONS, collectedToDraft } from "./draft";
import { checkUsernameAction, submitConversationAction } from "./conversation-actions";
import { intakeTurnAction } from "./intake-actions";

const OPENER =
  "Hey — I'm Avery, the lead on your build. Let's scope your site like we're across a table. In a sentence or two: what's the business, and what do you want the site to do for you? (Paste your current site or Instagram and I'll read it too.)";

function emptyCollected(): IntakeCollected {
  return { audience: [], voice: [], brandColors: [], offerings: [], proof: [], pages: [], references: [] };
}

export function LiveConversation({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: OPENER }]);
  const [collected, setCollected] = useState<IntakeCollected>(emptyCollected());
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, startThinking] = useTransition();
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function send(text: string) {
    const content = text.trim();
    if (!content || thinking) return;
    setError(null);
    setInput("");
    setSuggestions([]);
    const history = [...messages, { role: "user" as const, content }];
    setMessages(history);
    startThinking(async () => {
      const res = await intakeTurnAction(history, collected);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: res.turn.message }]);
      setCollected(res.turn.collected);
      setSuggestions(res.turn.suggestions ?? []);
      setComplete(res.turn.complete);
    });
  }

  function build(username: string) {
    setBuilding(true);
    startThinking(async () => {
      const draft = collectedToDraft({ ...collected, username });
      const res = await submitConversationAction(projectId, draft);
      if (res.ok) router.push(`/studio/${projectId}`);
      else {
        setBuilding(false);
        setError(res.error ?? "Couldn't start the build.");
      }
    });
  }

  const progress = sectionsDone(collected, complete);

  return (
    <div className="flex h-screen flex-col bg-paper">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-paper/80 px-5 backdrop-blur sm:px-8">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="hidden text-[12px] text-muted sm:block">Scoping with Avery</span>
          <div className="w-28"><Progress value={progress} /></div>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 gap-8 px-5 py-6 sm:px-8">
        {/* ToC */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto lg:block thin-scroll">
          <p className="eyebrow mb-3">Your brief</p>
          <ol className="flex flex-col gap-2.5">
            {SECTIONS.filter((s) => s.id !== "review").map((sec) => {
              const st = sectionState(sec.id, collected);
              return (
                <li key={sec.id} className="flex items-center gap-2.5">
                  <SectionDot state={st} />
                  <span className={cn("text-[13.5px]", st === "done" ? "text-ink-soft" : st === "partial" ? "text-ink" : "text-muted")}>{sec.label}</span>
                </li>
              );
            })}
          </ol>
          <Divider className="my-4" />
          <p className="text-[11.5px] leading-snug text-muted">Avery's listening and filling this in as you talk. Say <em>“just build it”</em> anytime and we'll take it from here.</p>
        </aside>

        {/* Chat */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pr-1 thin-scroll">
            <div className="mx-auto flex max-w-2xl flex-col gap-5 pb-4">
              {messages.map((m, i) =>
                m.role === "assistant" ? (
                  <div key={i} className="flex items-start gap-3">
                    <Avatar />
                    <div className="max-w-[40rem] rounded-lg rounded-tl-sm border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink shadow-xs">{m.content}</div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[34rem] rounded-lg rounded-tr-sm bg-brand-soft px-4 py-2.5 text-[14.5px] text-ink">{m.content}</div>
                  </div>
                ),
              )}
              {thinking && !building && (
                <div className="flex items-center gap-3">
                  <Avatar />
                  <div className="flex items-center gap-1.5 rounded-lg rounded-tl-sm border border-line bg-surface px-4 py-3">
                    <Dot /><Dot delay={0.15} /><Dot delay={0.3} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Composer / build */}
          <div className="mx-auto w-full max-w-2xl shrink-0 pt-3">
            {error && <p className="mb-2 text-[13px] text-danger">{error}</p>}
            {complete ? (
              <CompleteBar projectId={projectId} collected={collected} onBuild={build} building={building} />
            ) : (
              <>
                {suggestions.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <Chip key={s} as="button" onClick={() => send(s)}>{s}</Chip>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2 rounded-lg border border-line-strong bg-surface p-2 shadow-xs">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                    placeholder="Message Avery…"
                    className="min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus:outline-none"
                  />
                  <Button onClick={() => send(input)} disabled={!input.trim() || thinking} className="mb-0.5">Send</Button>
                </div>
                <p className="mt-1.5 text-center text-[11px] text-muted">Enter to send · Shift+Enter for a new line</p>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function CompleteBar({ projectId, collected, onBuild, building }: { projectId: string; collected: IntakeCollected; onBuild: (u: string) => void; building: boolean }) {
  const [username, setUsername] = useState(collected.username ?? "");
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [checking, setChecking] = useState(false);
  async function check() {
    if (!username.trim()) return;
    setChecking(true);
    setStatus(await checkUsernameAction(projectId, username.trim()));
    setChecking(false);
  }
  return (
    <div className="rounded-lg border border-brand/30 bg-brand-soft/40 p-4">
      <p className="text-[14px] font-medium text-ink">Avery's ready to build your two concepts.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-ink-soft">Your address:</span>
        <Input
          value={username}
          onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setStatus(null); }}
          onBlur={check}
          placeholder="yourname"
          className="h-9 max-w-[180px] text-[14px]"
        />
        <span className="text-[13px] text-muted">.simplesight.co</span>
        {checking && <Spinner className="h-4 w-4 text-muted" />}
      </div>
      {status?.ok && <p className="mt-1 text-[12.5px] text-success">Available.</p>}
      {status?.error && <p className="mt-1 text-[12.5px] text-danger">{status.error}</p>}
      <Button size="lg" className="mt-3" onClick={() => onBuild(username)} loading={building} disabled={building || !username.trim() || status?.ok === false}>
        {building ? "Starting the build…" : "Build my two concepts →"}
      </Button>
    </div>
  );
}

function Avatar() {
  return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-semibold text-brand-ink">A</span>;
}
function Dot({ delay = 0 }: { delay?: number }) {
  return <span className="h-1.5 w-1.5 rounded-full bg-muted" style={{ animation: "ss-rise 0.8s ease-in-out infinite alternate", animationDelay: `${delay}s` }} />;
}

type SecState = "done" | "partial" | "pending";

function sectionState(id: string, c: IntakeCollected): SecState {
  const has = (...vals: unknown[]) => vals.filter((v) => (Array.isArray(v) ? v.length > 0 : !!v)).length;
  switch (id) {
    case "business": { const n = has(c.name, c.description || c.oneLiner, c.category); return n >= 3 ? "done" : n > 0 ? "partial" : "pending"; }
    case "goals": { const n = has(c.primaryGoal, c.audience); return c.primaryGoal ? "done" : n > 0 ? "partial" : "pending"; }
    case "look": { const n = has(c.voice, c.colorNotes, c.brandColors, c.avoid); return n >= 2 ? "done" : n > 0 ? "partial" : "pending"; }
    case "content": { const n = has(c.offerings, c.pages, c.proof); return n >= 2 ? "done" : n > 0 ? "partial" : "pending"; }
    case "details": return c.email ? "done" : has(c.phone, c.address, c.city, c.instagram, c.hours) ? "partial" : "pending";
    case "brand": return c.logoUrl || (c.brandColors?.length ?? 0) > 0 ? "done" : "pending";
    case "address": return c.username ? "done" : "pending";
    default: return "pending";
  }
}

function sectionsDone(c: IntakeCollected, complete: boolean): number {
  const ids = SECTIONS.filter((s) => s.id !== "review").map((s) => s.id);
  const done = ids.filter((id) => sectionState(id, c) === "done").length;
  return complete ? 100 : Math.round((done / ids.length) * 100);
}

function SectionDot({ state }: { state: SecState }) {
  if (state === "done")
    return (
      <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-success text-brand-ink">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" aria-hidden><path d="M5 12l4 4L19 7" /></svg>
      </span>
    );
  if (state === "partial") return <span className="h-4 w-4 shrink-0 rounded-full border-2 border-brand" />;
  return <span className="h-4 w-4 shrink-0 rounded-full border-2 border-line-strong" />;
}

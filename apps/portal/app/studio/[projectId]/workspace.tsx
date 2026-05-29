"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BuildVariant, RevisionChecklist, RevisionItem, Viewport } from "@simplesight/contracts";
import { Badge, Button, Logo, Spinner, Textarea, cn } from "../../ui";
import { BrowserChrome, Preview, ViewportSwitcher } from "./preview-frame";
import { useMeasure } from "./use-measure";
import {
  addCommentAction,
  approveRevisionAction,
  deleteCommentAction,
  finalizeAction,
  previewChecklistAction,
} from "./studio-actions";

interface PageRef {
  slug: string;
  name: string;
}

const CATEGORY_TONE: Record<string, "neutral" | "brand" | "info" | "warn"> = {
  copy: "info",
  color: "warn",
  layout: "brand",
  imagery: "neutral",
  content: "neutral",
  other: "neutral",
};

export function Workspace({
  projectId,
  variant,
  pages,
  initialComments,
  revisionUsed,
  revisionMax,
}: {
  projectId: string;
  variant: BuildVariant;
  pages: PageRef[];
  initialComments: RevisionItem[];
  revisionUsed: number;
  revisionMax: number;
}) {
  const router = useRouter();
  const [page, setPage] = useState<PageRef>(pages[0] ?? { slug: "/", name: "Home" });
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [comments, setComments] = useState<RevisionItem[]>(initialComments);
  const [draft, setDraft] = useState("");
  const [checklist, setChecklist] = useState<RevisionChecklist | null>(null);
  const [pending, start] = useTransition();
  const [previewRef, { width }] = useMeasure<HTMLDivElement>();

  const base = variant.previewUrl ?? "";
  const src = base + (page.slug === "/" ? "" : page.slug);
  const remaining = Math.max(0, revisionMax - revisionUsed);

  function addComment() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    start(async () => {
      const res = await addCommentAction({ projectId, variantId: variant.id, pageSlug: page.slug, pageName: page.name, viewport, comment: text });
      if (res.ok) setComments((c) => [...c, res.item]);
    });
  }

  function removeComment(id: string) {
    setComments((c) => c.filter((x) => x.id !== id));
    start(async () => {
      await deleteCommentAction(projectId, id);
    });
  }

  function review() {
    start(async () => {
      const res = await previewChecklistAction(projectId, variant.id);
      setChecklist(res.checklist);
    });
  }

  function approve() {
    start(async () => {
      await approveRevisionAction(projectId, variant.id);
      setChecklist(null);
      setComments([]);
      router.refresh();
    });
  }

  function finalize() {
    start(async () => {
      await finalizeAction(projectId, variant.id);
      router.push(`/dashboard/${projectId}/go-live`);
    });
  }

  const pageComments = comments.filter((c) => c.pageSlug === page.slug);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-4">
        <div className="flex items-center gap-4">
          <Logo />
          <Badge tone="brand">{variant.studioLabel}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <ViewportSwitcher value={viewport} onChange={setViewport} />
          <Button size="sm" variant="ghost" onClick={finalize} disabled={pending}>
            Looks great — finalize
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Site preview — ~76% */}
        <div className="flex min-w-0 flex-[3] flex-col border-r border-line">
          {/* Page tabs */}
          <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-line bg-paper-2/50 px-3 py-2 thin-scroll">
            {pages.map((p) => (
              <button
                key={p.slug}
                onClick={() => setPage(p)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                  page.slug === p.slug ? "bg-ink text-brand-ink" : "text-ink-soft hover:bg-surface",
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div ref={previewRef} className="min-h-0 flex-1 overflow-hidden bg-paper-2/30 p-4">
            {base ? (
              <BrowserChrome url={src} className="mx-auto h-full">
                <Preview url={src} viewport={viewport} height={(width ? width : 800) * 0.62} containerWidth={width || 800} />
              </BrowserChrome>
            ) : (
              <div className="grid h-full place-items-center text-muted">Preview not available.</div>
            )}
          </div>
        </div>

        {/* Comment / chat panel — ~24% */}
        <aside className="flex w-[340px] shrink-0 flex-col bg-surface">
          <div className="shrink-0 border-b border-line px-4 py-3">
            <p className="font-display text-[16px] font-semibold">Your notes</p>
            <p className="text-[12.5px] text-muted">
              Comment on <strong className="text-ink-soft">{page.name}</strong> · {viewport}. We compile every note into one change list before rebuilding.
            </p>
          </div>

          {/* Notes list */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 thin-scroll">
            {comments.length === 0 ? (
              <p className="mt-6 text-center text-[13px] text-muted">
                Scroll the site, switch devices, and jot down anything you&apos;d change. Nothing rebuilds until you approve.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {comments.map((c) => (
                  <li key={c.id} className={cn("rounded-md border border-line bg-paper-2/40 p-2.5", c.pageSlug !== page.slug && "opacity-60")}>
                    <div className="mb-1 flex items-center gap-1.5">
                      <Badge tone={CATEGORY_TONE[c.category ?? "other"] ?? "neutral"}>{c.pageName ?? c.pageSlug}</Badge>
                      <span className="text-[11px] text-muted">{c.viewport}</span>
                      <button onClick={() => removeComment(c.id)} className="ml-auto text-[12px] text-muted hover:text-danger" aria-label="Delete note">
                        ×
                      </button>
                    </div>
                    <p className="text-[13px] leading-snug text-ink">{c.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-line p-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addComment();
              }}
              placeholder={`What would you change on ${page.name}?`}
              className="min-h-[72px] text-[14px]"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-muted">⌘↵ to add</span>
              <Button size="sm" onClick={addComment} disabled={!draft.trim() || pending}>
                Add note
              </Button>
            </div>
            <div className="mt-3 border-t border-line pt-3">
              <Button className="w-full" onClick={review} disabled={comments.length === 0 || pending || remaining === 0}>
                Review {comments.length} change{comments.length === 1 ? "" : "s"} →
              </Button>
              <p className="mt-2 text-center text-[11.5px] text-muted">
                {remaining > 0 ? `${remaining} of ${revisionMax} revisions left` : "No revisions left — finalize when ready"}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {checklist && (
        <ChecklistModal
          checklist={checklist}
          onClose={() => setChecklist(null)}
          onApprove={approve}
          busy={pending}
        />
      )}
    </div>
  );
}

function ChecklistModal({ checklist, onClose, onApprove, busy }: { checklist: RevisionChecklist; onClose: () => void; onApprove: () => void; busy: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
        <div className="border-b border-line px-5 py-4">
          <p className="font-display text-[18px] font-semibold">Approve these changes?</p>
          <p className="text-[13px] text-ink-soft">We&apos;ll keep the design you chose and apply exactly this list — then re-check quality before you see it.</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 thin-scroll">
          <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-ink">{checklist.summary}</pre>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Keep editing
          </Button>
          <Button onClick={onApprove} loading={busy} disabled={busy}>
            {busy ? "Rebuilding…" : "Approve & rebuild"}
          </Button>
        </div>
      </div>
    </div>
  );
}

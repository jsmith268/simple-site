"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BuildVariant, RegenFeedback } from "@simplesight/contracts";
import { Badge, Button, Card, Chip, Container, Eyebrow, Textarea, Title, cn } from "../../ui";
import { BrowserChrome, Preview } from "./preview-frame";
import { useMeasure } from "./use-measure";
import { regenerateAction, selectVariantAction } from "./studio-actions";

export function Compare({
  projectId,
  variants,
  round,
  used,
  max,
}: {
  projectId: string;
  variants: BuildVariant[];
  round: number;
  used: number;
  max: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [showRegen, setShowRegen] = useState(false);
  const remaining = Math.max(0, max - used);
  const multi = variants.length > 1;

  function choose(variantId: string) {
    setBusy(`select:${variantId}`);
    start(async () => {
      await selectVariantAction(projectId, variantId);
      router.refresh();
    });
  }

  function regenerate(feedback: RegenFeedback) {
    setBusy("regen");
    start(async () => {
      await regenerateAction(projectId, feedback);
      setShowRegen(false);
      setBusy(null);
      router.refresh();
    });
  }

  return (
    <Container size="lg" className="py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <Eyebrow>Round {round} of {max}</Eyebrow>
        <Title as="h1" className="text-3xl sm:text-[40px]">
          {multi ? "Two directions, built for you" : "Your site, built for you"}
        </Title>
        <p className="max-w-xl text-[15px] leading-relaxed text-ink-soft">
          {multi
            ? "Each studio took your brief and ran with it. Click through both, then keep the one that feels right — or tell us what to change and we'll try again."
            : "We took your brief and built you a complete, bespoke site. Open the full preview, then keep it — or tell us what to change and we'll rework it."}
        </p>
      </div>

      <div className={cn("mt-10 grid grid-cols-1 gap-6", multi ? "lg:grid-cols-2" : "mx-auto max-w-3xl")}>
        {variants.map((v) => (
          <VariantCard key={v.id} variant={v} onChoose={() => choose(v.id)} busy={busy === `select:${v.id}`} disabled={pending} />
        ))}
      </div>

      <div className="mt-10">
        {!showRegen ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-[14px] text-ink-soft">{multi ? "Neither quite right?" : "Not quite right?"}</p>
            <Button variant="secondary" onClick={() => setShowRegen(true)} disabled={remaining === 0}>
              {remaining === 0 ? "No regenerations left" : `${multi ? "Regenerate both" : "Regenerate"} — ${remaining} of ${max} left`}
            </Button>
            {remaining === 0 && (
              <p className="text-[13px] text-muted">You&apos;ve explored all {max} rounds. Pick the closest and refine it — refinement is unlimited per change.</p>
            )}
          </div>
        ) : (
          <RegenPanel onCancel={() => setShowRegen(false)} onSubmit={regenerate} busy={busy === "regen"} remaining={remaining} multi={multi} />
        )}
      </div>
    </Container>
  );
}

function VariantCard({ variant, onChoose, busy, disabled }: { variant: BuildVariant; onChoose: () => void; busy: boolean; disabled: boolean }) {
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const ready = variant.status === "ready" || variant.status === "selected";
  return (
    <Card hover className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge tone="brand">{variant.studioLabel}</Badge>
          {variant.designScore != null && <span className="text-[12px] text-muted">Design {variant.designScore}/100</span>}
        </div>
        {variant.previewUrl && (
          <a href={variant.previewUrl} target="_blank" rel="noreferrer" className="text-[12.5px] font-medium text-brand hover:underline">
            Open full preview ↗
          </a>
        )}
      </div>
      <div ref={ref} className="bg-paper-2/40 p-3">
        {ready && variant.previewUrl ? (
          <BrowserChrome url={variant.previewUrl} className="shadow-sm">
            <Preview url={variant.previewUrl} viewport="desktop" height={420} containerWidth={width || 600} interactive={false} />
          </BrowserChrome>
        ) : (
          <div className="grid h-[420px] place-items-center rounded-lg border border-dashed border-line-strong">
            <BuildingPulse label={variant.studioLabel} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <p className="line-clamp-2 text-[13.5px] leading-snug text-ink-soft">{variant.summary ?? "A distinctive, on-brand direction."}</p>
        <Button onClick={onChoose} loading={busy} disabled={!ready || disabled} className="shrink-0">
          Choose this
        </Button>
      </div>
    </Card>
  );
}

function BuildingPulse({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-brand" />
      </span>
      <p className="text-[13px] text-muted">{label} is building your site…</p>
    </div>
  );
}

function RegenPanel({ onCancel, onSubmit, busy, remaining, multi }: { onCancel: () => void; onSubmit: (f: RegenFeedback) => void; busy: boolean; remaining: number; multi: boolean }) {
  const [liked, setLiked] = useState("");
  const [disliked, setDisliked] = useState("");
  const [preferred, setPreferred] = useState<"A" | "B" | undefined>(undefined);
  return (
    <Card className="mx-auto max-w-2xl p-6">
      <Title as="h2" className="text-xl">
        Tell us what to change
      </Title>
      <p className="mt-1 text-[13.5px] text-ink-soft">The more specific you are, the better the next two will be. We keep what you liked and fix what you didn&apos;t.</p>
      <div className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink-soft">What worked? Keep this.</span>
          <Textarea value={liked} onChange={(e) => setLiked(e.target.value)} placeholder="e.g. the bold headline, the dark palette, the photo treatment" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink-soft">What missed? Change this.</span>
          <Textarea value={disliked} onChange={(e) => setDisliked(e.target.value)} placeholder="e.g. too corporate, hero feels empty, wrong vibe for a family café" />
        </label>
        {multi && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-ink-soft">Leaning toward one?</span>
            <Chip as="button" selected={preferred === "A"} onClick={() => setPreferred(preferred === "A" ? undefined : "A")}>
              Studio A
            </Chip>
            <Chip as="button" selected={preferred === "B"} onClick={() => setPreferred(preferred === "B" ? undefined : "B")}>
              Studio B
            </Chip>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-center gap-2">
        <Button onClick={() => onSubmit({ liked, disliked, preferredSlot: preferred })} loading={busy} disabled={busy}>
          Regenerate ({remaining} left)
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

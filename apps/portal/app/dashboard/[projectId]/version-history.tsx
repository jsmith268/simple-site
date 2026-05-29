"use client";

import type { VersionSummary } from "@simplesight/db";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Card } from "../../ui";
import { restoreVersionAction } from "./version-actions";

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function VersionHistory({
  projectId,
  versions,
}: {
  projectId: string;
  versions: VersionSummary[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function restore(id: string) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Restore this version? It replaces your current published site (you can restore again afterward).",
      )
    )
      return;
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      try {
        const r = await restoreVersionAction(projectId, id);
        if (!r.ok) setError(r.error ?? "Restore failed.");
        else router.refresh();
      } catch {
        setError("Restore failed. Please try again.");
      } finally {
        setBusyId(null);
      }
    });
  }

  return (
    <Card className="mt-6 p-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-display text-[18px] font-semibold">Version history</span>
        <span className="text-[13px] text-ink-soft">
          {versions.length} saved · {open ? "Hide" : "Show"}
        </span>
      </button>

      {open && (
        <>
          <ul className="mt-4 divide-y divide-line">
            {versions.map((v, i) => (
              <li key={v.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <div className="text-[14px] font-medium text-ink">
                    {v.label}
                    {i === 0 && (
                      <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted">
                    {v.pageCount} {v.pageCount === 1 ? "page" : "pages"} · {relTime(v.createdAt)}
                  </div>
                </div>
                {i === 0 ? (
                  <span className="text-[12px] text-muted">Live</span>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => restore(v.id)}
                    loading={pending && busyId === v.id}
                    disabled={pending}
                  >
                    Restore
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {error && (
            <p role="alert" className="mt-3 text-[13px] text-danger">
              {error}
            </p>
          )}
        </>
      )}
    </Card>
  );
}

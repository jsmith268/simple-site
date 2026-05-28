"use client";

import type { Viewport } from "@simplesight/contracts";
import { cn } from "../../ui";

export const VIEWPORTS: { id: Viewport; label: string; w: number; icon: React.ReactNode }[] = [
  {
    id: "desktop",
    label: "Desktop",
    w: 1440,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    id: "tablet",
    label: "Tablet",
    w: 834,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
    ),
  },
  {
    id: "mobile",
    label: "Mobile",
    w: 390,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="7" y="2" width="10" height="20" rx="2.5" />
        <path d="M11 18h2" />
      </svg>
    ),
  },
];

export function ViewportSwitcher({ value, onChange }: { value: Viewport; onChange: (v: Viewport) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface p-1">
      {VIEWPORTS.map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          title={v.label}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors",
            value === v.id ? "bg-ink text-brand-ink" : "text-ink-soft hover:bg-paper-2",
          )}
        >
          {v.icon}
          <span className="hidden sm:inline">{v.label}</span>
        </button>
      ))}
    </div>
  );
}

export function BrowserChrome({ url, children, className }: { url?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-line-strong bg-surface shadow-md", className)}>
      <div className="flex items-center gap-2 border-b border-line bg-paper-2/70 px-3 py-2">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        </span>
        {url && (
          <span className="mx-auto max-w-[60%] truncate rounded-full bg-surface px-3 py-0.5 text-[11px] text-muted">
            {url.replace(/^https?:\/\//, "")}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Responsive preview: the iframe renders at the chosen viewport's logical width
 * and is scaled to fit the available column, so desktop/tablet/mobile show the
 * site's *real* responsive behavior rather than a resized screenshot.
 */
export function Preview({
  url,
  viewport,
  height = 560,
  containerWidth,
  interactive = true,
}: {
  url: string;
  viewport: Viewport;
  height?: number;
  containerWidth: number;
  interactive?: boolean;
}) {
  const vw = VIEWPORTS.find((v) => v.id === viewport)?.w ?? 1440;
  const scale = Math.min(1, containerWidth / vw);
  const scaledH = height / scale;
  return (
    <div className="relative overflow-hidden bg-paper" style={{ height }}>
      <iframe
        title="Site preview"
        src={url}
        loading="lazy"
        style={{
          width: vw,
          height: scaledH,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: interactive ? "auto" : "none",
        }}
        className="bg-white"
      />
    </div>
  );
}

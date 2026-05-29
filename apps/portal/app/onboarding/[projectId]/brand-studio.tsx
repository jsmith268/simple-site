"use client";

import { useRef, useState } from "react";
import { Button, Chip, Input, Spinner, cn } from "../../ui";
import { extractPalette, monogramDataUrl, normalizeHex } from "../../brand-utils";
import { uploadLogoAction } from "./brand-actions";

type Mode = "upload" | "url" | "monogram";

export function BrandStudio({
  projectId,
  name,
  logoUrl,
  brandColors,
  onChange,
}: {
  projectId: string;
  name: string;
  logoUrl: string;
  brandColors: string[];
  onChange: (p: { logoUrl?: string; brandColors?: string[] }) => void;
}) {
  const [mode, setMode] = useState<Mode>(logoUrl ? "url" : "monogram");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const primary = brandColors[0] ?? "#c2410c";
  const secondary = brandColors[1] ?? "";
  const setColor = (i: number, hex: string) => {
    const next = [...brandColors];
    next[i] = hex;
    onChange({ brandColors: next.filter(Boolean) });
  };

  async function ingest(src: string) {
    setBusy(true);
    setNote(null);
    onChange({ logoUrl: src });
    const palette = await extractPalette(src);
    if (palette.length) {
      onChange({ logoUrl: src, brandColors: palette });
      setNote(`Pulled ${palette.length} brand color${palette.length > 1 ? "s" : ""} from your logo — tweak below.`);
    } else if (src.startsWith("http")) {
      setNote("Couldn't read colors from that link (cross-origin) — set them manually below.");
    }
    setBusy(false);
  }

  async function onFile(file: File) {
    setBusy(true);
    const dataUrl = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.readAsDataURL(file);
    });
    await ingest(dataUrl);
    // Best-effort persist to Blob (no-op offline → keeps the data URL).
    const up = await uploadLogoAction(projectId, dataUrl, "logo");
    if (up.ok && up.url !== dataUrl) onChange({ logoUrl: up.url });
    setBusy(false);
  }

  const preview = mode === "monogram" || !logoUrl ? monogramDataUrl(name || "Your Brand", primary, secondary) : logoUrl;

  return (
    <div className="flex flex-col gap-4 rounded-md border border-line bg-surface p-4 shadow-xs">
      <div className="flex items-start gap-4">
        <img src={preview} alt="Brand preview" className="h-20 w-20 shrink-0 rounded-lg border border-line object-contain" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            {(["upload", "url", "monogram"] as Mode[]).map((m) => (
              <Chip key={m} as="button" selected={mode === m} onClick={() => { setMode(m); if (m === "monogram") onChange({ logoUrl: "" }); }}>
                {m === "upload" ? "Upload a logo" : m === "url" ? "Paste a link" : "Design one for me"}
              </Chip>
            ))}
            {busy && <Spinner className="h-4 w-4 text-muted" />}
          </div>
          {mode === "upload" && (
            <div className="mt-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>Choose image…</Button>
            </div>
          )}
          {mode === "url" && (
            <div className="mt-3">
              <Input
                defaultValue={logoUrl.startsWith("data:") ? "" : logoUrl}
                onBlur={(e) => e.target.value.trim() && ingest(e.target.value.trim())}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.value.trim() && ingest(e.currentTarget.value.trim())}
                placeholder="https://… your logo"
              />
            </div>
          )}
          {mode === "monogram" && <p className="mt-3 text-[12.5px] text-muted">We&apos;ll craft a clean monogram from your initials and brand colors. Set the colors below.</p>}
        </div>
      </div>

      {note && <p className="text-[12.5px] text-success">{note}</p>}

      <div className="flex flex-wrap gap-4">
        <ColorField label="Primary" value={primary} onChange={(h) => setColor(0, h)} />
        <ColorField label="Secondary" value={secondary || monogramSecondary(primary)} onChange={(h) => setColor(1, h)} optional />
      </div>
      <p className="text-[11.5px] text-muted">Have exact brand colors? Set them precisely. Otherwise we&apos;ll choose a palette that fits.</p>
    </div>
  );
}

function monogramSecondary(primary: string): string {
  return normalizeHex(primary) ?? "#9a3412";
}

function ColorField({ label, value, onChange, optional }: { label: string; value: string; onChange: (hex: string) => void; optional?: boolean }) {
  const hex = normalizeHex(value) ?? "#c2410c";
  return (
    <label className="flex items-center gap-2">
      <span className="text-[13px] text-ink-soft">
        {label}
        {optional && <span className="text-muted"> (optional)</span>}
      </span>
      <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} className="h-8 w-8 cursor-pointer rounded border border-line bg-transparent p-0" aria-label={`${label} color`} />
      <Input value={value} onChange={(e) => { const n = normalizeHex(e.target.value); if (n) onChange(n); }} placeholder="#1a2b3c" className={cn("h-8 w-[110px] font-mono text-[13px]")} />
    </label>
  );
}

import type { SiteSpec } from "@simplesight/contracts";

/** Up to two initials from a business name, for the monogram badge. */
export function brandInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (!first) return "S";
  if (words.length === 1) return first.slice(0, 2).toUpperCase();
  const last = words[words.length - 1] ?? first;
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || "S";
}

/**
 * 1200×630 social-share card built deterministically from a SiteSpec's brand +
 * theme palette. Satori (next/og) supports flexbox only — every container sets
 * display:flex explicitly to avoid runtime "expected display" errors.
 */
export function OgCard({ spec }: { spec: SiteSpec }) {
  const p = spec.theme.palette;
  const name = spec.brand.name || "Your business";
  const tagline = spec.brand.tagline ?? spec.seo?.defaultDescription ?? "";
  const initials = brandInitials(name);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        background: `linear-gradient(135deg, ${p.background} 0%, ${p.card} 100%)`,
        color: p.foreground,
        padding: "96px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "144px",
          height: "144px",
          borderRadius: "32px",
          alignItems: "center",
          justifyContent: "center",
          background: p.primary,
          color: p.primaryForeground,
          fontSize: "72px",
          fontWeight: 700,
        }}
      >
        {initials}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "44px",
          fontSize: "88px",
          fontWeight: 800,
          lineHeight: 1.05,
          maxWidth: "1000px",
          color: p.foreground,
        }}
      >
        {name}
      </div>
      {tagline ? (
        <div
          style={{
            display: "flex",
            marginTop: "24px",
            fontSize: "40px",
            lineHeight: 1.25,
            maxWidth: "1000px",
            color: p.mutedForeground,
          }}
        >
          {tagline}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          marginTop: "48px",
          height: "14px",
          width: "240px",
          borderRadius: "8px",
          background: p.primary,
        }}
      />
    </div>
  );
}

/** Square monogram for the browser-tab favicon. */
export function IconBadge({ spec }: { spec: SiteSpec }) {
  const p = spec.theme.palette;
  const initials = brandInitials(spec.brand.name || "S");
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: p.primary,
        color: p.primaryForeground,
        fontSize: initials.length > 1 ? "28px" : "40px",
        fontWeight: 700,
        fontFamily: "sans-serif",
        borderRadius: "12px",
      }}
    >
      {initials}
    </div>
  );
}

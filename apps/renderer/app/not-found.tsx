import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/** Branded 404 for unknown tenants / missing pages on the renderer. */
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: "48px 24px",
        textAlign: "center",
        background: "linear-gradient(160deg, #faf9f6 0%, #f1ece2 100%)",
        color: "#211d17",
        fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontSize: 12,
          color: "#8a8174",
        }}
      >
        404 · Not found
      </div>
      <h1 style={{ fontSize: 38, fontWeight: 800, margin: 0, lineHeight: 1.1, maxWidth: 560 }}>
        We couldn&apos;t find that page
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.6, color: "#4b4439", margin: 0, maxWidth: 460 }}>
        The address may be mistyped, or this site isn&apos;t published yet. Double-check the
        link and try again.
      </p>
      <a
        href="/"
        style={{
          marginTop: 8,
          display: "inline-block",
          padding: "12px 22px",
          borderRadius: 10,
          background: "#c2410c",
          color: "#fffaf5",
          fontWeight: 700,
          fontSize: 15,
          textDecoration: "none",
        }}
      >
        Go to the homepage
      </a>
    </main>
  );
}

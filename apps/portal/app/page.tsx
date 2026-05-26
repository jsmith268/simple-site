import Link from "next/link";

export default function Page() {
  return (
    <main style={{ maxWidth: 560, margin: "80px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 30, fontWeight: 700 }}>Simple Site</h1>
      <p style={{ color: "#555", marginTop: 12, lineHeight: 1.6 }}>
        Professional informational websites, built for you by an autonomous team of agents. Tell us
        about your business; we build, review, and launch your site.
      </p>
      <Link
        href="/buy"
        style={{
          display: "inline-block",
          marginTop: 24,
          padding: "12px 20px",
          background: "#111827",
          color: "#fff",
          borderRadius: 10,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Get your website
      </Link>
      <p style={{ color: "#9ca3af", marginTop: 32, fontSize: 13 }}>
        Customer dashboard &amp; operator console live here (Phase 4).
      </p>
    </main>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function BuyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function purchase() {
    setError(null);
    start(async () => {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, plan }),
      });
      const data = (await res.json()) as { url?: string; redirect?: string; error?: string };
      if (data.error) return setError(data.error);
      if (data.url) return void (window.location.href = data.url);
      if (data.redirect) return router.push(data.redirect);
    });
  }

  return (
    <main style={{ maxWidth: 460, margin: "64px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Get your website</h1>
      <p style={{ color: "#555", marginTop: 8, lineHeight: 1.6 }}>
        A one-time build fee, then hosting billed{" "}
        {plan === "annual" ? "annually (save 2 months)" : "monthly"}. 30-day money-back guarantee —
        if you're not happy, full refund.
      </p>

      <label style={{ display: "block", marginTop: 24, fontWeight: 600 }}>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com"
          style={input}
        />
      </label>

      <fieldset style={{ border: 0, padding: 0, marginTop: 16 }}>
        <legend style={{ fontWeight: 600 }}>Hosting plan</legend>
        {(["monthly", "annual"] as const).map((p) => (
          <label key={p} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
            <input type="radio" name="plan" checked={plan === p} onChange={() => setPlan(p)} />
            <span style={{ textTransform: "capitalize" }}>{p}</span>
          </label>
        ))}
      </fieldset>

      {error && <p style={{ color: "#b91c1c", marginTop: 12 }}>{error}</p>}

      <button
        type="button"
        onClick={purchase}
        disabled={pending || !email}
        style={{ ...btn, opacity: pending || !email ? 0.6 : 1, marginTop: 24 }}
      >
        {pending ? "Starting…" : "Purchase & start onboarding"}
      </button>
    </main>
  );
}

const input: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 15,
};
const btn: React.CSSProperties = {
  width: "100%",
  padding: "12px 18px",
  background: "#111827",
  color: "#fff",
  border: 0,
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

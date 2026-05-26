"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  buyDomainAction,
  connectDomainAction,
  goLiveCustomAction,
  goLiveSubdomainAction,
  refundAction,
} from "../../go-live-actions";

interface DnsRecord {
  type: string;
  name: string;
  value: string;
}

export function GoLiveClient(props: {
  projectId: string;
  subdomain: string | null;
  domains: { domain: string; type: string; verified: boolean }[];
  steps: Record<string, unknown>[];
  refundOpen: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [domain, setDomain] = useState("");
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok?: boolean; error?: string; records?: DnsRecord[]; reason?: string }>) =>
    start(async () => {
      setMsg(null);
      const r = await fn();
      if (r.records) setRecords(r.records);
      if (r.error) setMsg(r.error);
      else if (r.reason) setMsg(r.reason);
      else setMsg("Done.");
      router.refresh();
    });

  return (
    <div style={{ marginTop: 24, display: "grid", gap: 24 }}>
      {/* Option 1: free subdomain */}
      <section style={card}>
        <h2 style={h2}>Launch on a SimpleSight subdomain</h2>
        <p style={muted}>
          Free, instant. Your site goes live at <code>{props.subdomain ?? "—"}</code>.
        </p>
        <button type="button" style={btn} disabled={pending} onClick={() => run(() => goLiveSubdomainAction(props.projectId))}>
          {pending ? "Working…" : "Go live on subdomain"}
        </button>
      </section>

      {/* Option 2: connect existing domain */}
      <section style={card}>
        <h2 style={h2}>Connect your own domain</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourbusiness.com"
            style={input}
          />
          <button type="button" style={btnOutline} disabled={pending || !domain} onClick={() => run(() => connectDomainAction(props.projectId, domain))}>
            Connect
          </button>
        </div>
        {records.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p style={muted}>Add these DNS records at your registrar, then verify:</p>
            <table style={{ width: "100%", fontFamily: "monospace", fontSize: 13, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Type</th>
                  <th style={th}>Name</th>
                  <th style={th}>Value</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={`${r.type}-${r.name}`}>
                    <td style={td}>{r.type}</td>
                    <td style={td}>{r.name}</td>
                    <td style={td}>{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" style={{ ...btn, marginTop: 12 }} disabled={pending || !domain} onClick={() => run(() => goLiveCustomAction(props.projectId, domain))}>
              Verify &amp; go live
            </button>
          </div>
        )}
      </section>

      {/* Option 3: buy a domain through us */}
      <section style={card}>
        <h2 style={h2}>Buy a domain through us</h2>
        <p style={muted}>We'll register it (via Vercel Domains) and wire DNS automatically.</p>
        <button type="button" style={btnOutline} disabled={pending || !domain} onClick={() => run(() => buyDomainAction(props.projectId, domain))}>
          Search &amp; buy “{domain || "yourbusiness.com"}”
        </button>
      </section>

      {msg && <p role="status" style={{ color: "#374151" }}>{msg}</p>}

      {props.steps.length > 0 && (
        <section style={card}>
          <h2 style={h2}>Connection log</h2>
          <ul style={{ fontFamily: "monospace", fontSize: 13, color: "#555" }}>
            {props.steps.map((s, i) => (
              <li key={`${String(s.stepName)}-${i}`}>
                {String(s.stepName)} — {String(s.status)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {props.refundOpen && (
        <section style={{ ...card, borderColor: "#fca5a5" }}>
          <h2 style={{ ...h2, color: "#b91c1c" }}>30-day money-back guarantee</h2>
          <p style={muted}>Not happy? Get a full refund within 30 days. This unpublishes your site.</p>
          <button
            type="button"
            style={{ ...btnOutline, color: "#b91c1c", borderColor: "#fca5a5" }}
            disabled={pending}
            onClick={() => {
              if (confirm("Request a full refund? This will take your site offline.")) {
                run(() => refundAction(props.projectId));
              }
            }}
          >
            Request a refund
          </button>
        </section>
      )}
    </div>
  );
}

const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 };
const h2: React.CSSProperties = { fontSize: 17, fontWeight: 700, marginBottom: 6 };
const muted: React.CSSProperties = { color: "#6b7280", fontSize: 14, marginBottom: 12 };
const input: React.CSSProperties = { flex: 1, padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8 };
const btn: React.CSSProperties = { padding: "10px 18px", background: "#111827", color: "#fff", border: 0, borderRadius: 8, fontWeight: 600, cursor: "pointer" };
const btnOutline: React.CSSProperties = { padding: "10px 18px", background: "#fff", color: "#111827", border: "1px solid #d1d5db", borderRadius: 8, fontWeight: 600, cursor: "pointer" };
const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "6px 8px" };
const td: React.CSSProperties = { borderBottom: "1px solid #f3f4f6", padding: "6px 8px" };

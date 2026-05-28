"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge, Button, Card, Input, cn } from "../../../ui";
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

type Tab = "subdomain" | "connect" | "buy";

export function GoLiveClient(props: {
  projectId: string;
  subdomain: string | null;
  domains: { domain: string; type: string; verified: boolean }[];
  steps: Record<string, unknown>[];
  refundOpen: boolean;
  live: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [tab, setTab] = useState<Tab>("subdomain");
  const [domain, setDomain] = useState("");
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [confirmRefund, setConfirmRefund] = useState(false);

  const run = (fn: () => Promise<{ ok?: boolean; live?: boolean; error?: string; records?: DnsRecord[]; reason?: string }>) =>
    start(async () => {
      setMsg(null);
      const r = await fn();
      if (r.records) setRecords(r.records);
      if (r.error) setMsg({ kind: "err", text: r.error });
      else if (r.reason) setMsg({ kind: "ok", text: r.reason });
      else setMsg({ kind: "ok", text: "Done." });
      router.refresh();
    });

  return (
    <div className="mt-8">
      <h2 className="font-display text-[20px] font-semibold">Your address</h2>
      <p className="mt-1 text-[14px] text-ink-soft">Pick how people find you. You can always add more domains later.</p>

      <div className="mt-4 inline-flex rounded-full border border-line-strong bg-surface p-1">
        {([
          ["subdomain", "Free address"],
          ["connect", "Connect a domain"],
          ["buy", "Buy a domain"],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors",
              tab === id ? "bg-ink text-brand-ink" : "text-ink-soft hover:bg-paper-2",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="mt-4 p-6">
        {tab === "subdomain" && (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] text-ink">
              Launch instantly at{" "}
              <code className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-[13px] text-brand">{props.subdomain ?? "—"}</code>
            </p>
            <p className="text-[13px] text-muted">Free, secure (SSL included), live in seconds. Perfect to start — add a custom domain anytime.</p>
            <Button className="self-start" loading={pending} disabled={pending || props.live} onClick={() => run(() => goLiveSubdomainAction(props.projectId))}>
              {props.live ? "You're live" : "Publish to my free address"}
            </Button>
          </div>
        )}

        {tab === "connect" && (
          <div className="flex flex-col gap-3">
            <p className="text-[14px] text-ink-soft">Already own a domain? Point it here and we&apos;ll issue SSL automatically.</p>
            <div className="flex max-w-md gap-2">
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourbusiness.com" />
              <Button variant="secondary" disabled={pending || !domain} onClick={() => run(() => connectDomainAction(props.projectId, domain))}>
                Connect
              </Button>
            </div>
            {records.length > 0 && <DnsRecords records={records} onVerify={() => run(() => goLiveCustomAction(props.projectId, domain))} busy={pending} />}
          </div>
        )}

        {tab === "buy" && (
          <div className="flex flex-col gap-3">
            <p className="text-[14px] text-ink-soft">We&apos;ll register it and wire up DNS automatically — nothing for you to configure.</p>
            <div className="flex max-w-md gap-2">
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourbusiness.com" />
              <Button variant="secondary" disabled={pending || !domain} onClick={() => run(() => buyDomainAction(props.projectId, domain))}>
                Search &amp; buy
              </Button>
            </div>
          </div>
        )}
      </Card>

      {msg && (
        <p className={cn("mt-3 text-[13.5px]", msg.kind === "err" ? "text-danger" : "text-success")} role="status">
          {msg.text}
        </p>
      )}

      {props.domains.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {props.domains.map((d) => (
            <Badge key={d.domain} tone={d.verified ? "success" : "warn"}>
              {d.domain} · {d.verified ? "verified" : "pending DNS"}
            </Badge>
          ))}
        </div>
      )}

      {props.steps.length > 0 && (
        <Card className="mt-6 p-5">
          <h3 className="mb-3 text-[14px] font-semibold">Connection progress</h3>
          <ol className="flex flex-col gap-1.5">
            {props.steps.map((s, i) => (
              <li key={`${String(s.stepName)}-${i}`} className="flex items-center gap-2 text-[13px]">
                <StepDot status={String(s.status)} />
                <span className="font-mono text-ink-soft">{String(s.stepName)}</span>
                <span className="text-muted">— {String(s.status)}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {props.refundOpen && (
        <Card className="mt-8 border-danger/30 bg-danger-soft/40 p-5">
          <h3 className="text-[15px] font-semibold text-danger">30-day money-back guarantee</h3>
          <p className="mt-1 text-[13.5px] text-ink-soft">Not happy? Get a full refund within 30 days. This unpublishes your site and releases the address.</p>
          {!confirmRefund ? (
            <Button variant="ghost" className="mt-3 text-danger hover:bg-danger/10" onClick={() => setConfirmRefund(true)}>
              Request a refund
            </Button>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[13px] text-ink-soft">Are you sure? Your site goes offline.</span>
              <Button variant="danger" size="sm" loading={pending} onClick={() => run(() => refundAction(props.projectId))}>
                Yes, refund me
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmRefund(false)}>
                Keep my site
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function StepDot({ status }: { status: string }) {
  const tone = /complete|done|verified|live|ready/i.test(status) ? "var(--color-success)" : /fail|error/i.test(status) ? "var(--color-danger)" : "var(--color-warn)";
  return <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: tone }} />;
}

function DnsRecords({ records, onVerify, busy }: { records: DnsRecord[]; onVerify: () => void; busy: boolean }) {
  return (
    <div className="mt-2 rounded-md border border-line bg-paper-2/40 p-4">
      <p className="mb-3 text-[13px] text-ink-soft">Add these records at your registrar, then verify:</p>
      <div className="overflow-hidden rounded-md border border-line">
        <div className="grid grid-cols-[64px_1fr_1fr_auto] gap-2 border-b border-line bg-surface px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          <span>Type</span>
          <span>Name</span>
          <span>Value</span>
          <span />
        </div>
        {records.map((r) => (
          <div key={`${r.type}-${r.name}`} className="grid grid-cols-[64px_1fr_1fr_auto] items-center gap-2 border-b border-line bg-surface px-3 py-2 font-mono text-[12.5px] last:border-0">
            <span className="text-ink-soft">{r.type}</span>
            <span className="truncate">{r.name}</span>
            <span className="truncate">{r.value}</span>
            <Copy text={r.value} />
          </div>
        ))}
      </div>
      <Button className="mt-3" loading={busy} disabled={busy} onClick={onVerify}>
        Verify &amp; go live
      </Button>
    </div>
  );
}

function Copy({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className="rounded px-2 py-0.5 text-[11px] font-sans font-medium text-brand hover:bg-brand-soft"
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}

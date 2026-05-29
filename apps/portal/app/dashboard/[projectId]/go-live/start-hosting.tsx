"use client";

import { useState, useTransition } from "react";
import { Button, Chip } from "../../../ui";
import { startHostingAction } from "../../go-live-actions";

export function StartHosting({ projectId, monthly, annual }: { projectId: string; monthly: number; annual: number }) {
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function go() {
    setMsg(null);
    start(async () => {
      const r = await startHostingAction(projectId, plan);
      if (r.url) window.location.href = r.url;
      else setMsg("Hosting will activate the moment you publish — no separate checkout in this environment.");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Chip as="button" selected={plan === "monthly"} onClick={() => setPlan("monthly")}>${monthly}/mo</Chip>
        <Chip as="button" selected={plan === "annual"} onClick={() => setPlan("annual")}>${annual}/yr · save 2 months</Chip>
      </div>
      <Button onClick={go} loading={pending} disabled={pending} className="self-start">Start hosting</Button>
      {msg && <p className="text-[13px] text-ink-soft">{msg}</p>}
    </div>
  );
}

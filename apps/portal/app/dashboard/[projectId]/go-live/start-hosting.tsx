"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PRICES, openCheckout, paddleConfigured } from "@/lib/paddle-client";
import { Button, Chip } from "../../../ui";
import { startHostingAction } from "../../go-live-actions";

export function StartHosting({ projectId, monthly, annual }: { projectId: string; monthly: number; annual: number }) {
  const router = useRouter();
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function go() {
    setMsg(null);
    start(async () => {
      if (paddleConfigured()) {
        // Live: Paddle.js overlay. subscription.created webhook records the
        // hosting subscription against this project (via customData.projectId).
        await openCheckout({
          priceId: plan === "annual" ? PRICES.hostingAnnual : PRICES.hostingMonthly,
          customData: { projectId, kind: "hosting" },
          successUrl: `${window.location.origin}/dashboard/${projectId}/go-live`,
        });
        return;
      }
      // Offline: record the subscription as active so go-live can proceed.
      const r = await startHostingAction(projectId, plan);
      if (r.ok) {
        setMsg("Hosting activated — you can publish your site now.");
        router.refresh();
      }
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

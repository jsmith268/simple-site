"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge, Button, Card, Chip, Container, Eyebrow, Field, Input, Logo, Title } from "../ui";

const BUILD_FEE = 1248;
const HOSTING = { monthly: 29, annual: 290 };
const INCLUDED = [
  "Two complete website directions to choose from",
  "Built by Claude Opus 4.8 and GPT-5.5 in parallel",
  "Unlimited refinement on your chosen design",
  "Hosting, SSL, and a free address included",
  "Connect your own domain anytime",
];

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
    <div className="min-h-screen brand-gradient">
      <header className="border-b border-line/70">
        <Container size="lg" className="flex h-16 items-center">
          <Logo />
        </Container>
      </header>

      <Container size="md" className="grid items-start gap-10 py-14 md:grid-cols-2">
        {/* Pitch */}
        <div>
          <Eyebrow>Your website, built for you</Eyebrow>
          <Title as="h1" className="mt-3 text-4xl leading-[1.05] sm:text-5xl">
            Two studios. One brief. <span className="text-brand">The site you actually wanted.</span>
          </Title>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-soft">
            Tell us about your business in a few minutes. Two AI studios each design and build you a complete site — you compare, choose, and refine until it&apos;s right.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {INCLUDED.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[14.5px] text-ink-soft">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" aria-hidden>
                  <path d="M5 12l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Purchase card */}
        <Card className="p-7">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[40px] font-semibold leading-none">${BUILD_FEE.toLocaleString()}</span>
            <Badge tone="success">30-day money back</Badge>
          </div>
          <p className="mt-1 text-[14px] text-muted">One-time build fee · then hosting below</p>

          <div className="mt-6 flex flex-col gap-4">
            <Field label="Email" htmlFor="buy-email">
              <Input id="buy-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
            </Field>

            <div>
              <p className="mb-2 text-[13px] font-medium text-ink-soft">Hosting plan</p>
              <div className="flex gap-2">
                <Chip as="button" selected={plan === "monthly"} onClick={() => setPlan("monthly")}>
                  ${HOSTING.monthly}/mo
                </Chip>
                <Chip as="button" selected={plan === "annual"} onClick={() => setPlan("annual")}>
                  ${HOSTING.annual}/yr · save 2 months
                </Chip>
              </div>
            </div>

            {error && <p className="text-[13.5px] text-danger">{error}</p>}

            <Button size="lg" onClick={purchase} loading={pending} disabled={pending || !email} className="mt-1 w-full">
              {pending ? "Starting…" : "Purchase & start onboarding"}
            </Button>
            <p className="text-center text-[12px] text-muted">No discovery calls, no slide decks. You&apos;ll be scoping your site in the next minute.</p>
          </div>
        </Card>
      </Container>
    </div>
  );
}

"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PRICES, openCheckout, paddleConfigured } from "@/lib/paddle-client";
import { Badge, Button, Card, Container, Eyebrow, Logo, Title } from "../ui";

const BUILD_FEE = 1248;
const INCLUDED = [
  "A complete, bespoke website designed for your business",
  "Built by Claude Opus 4.8 — not a template",
  "Unlimited refinement until it's right",
  "A free address to launch on instantly",
  "Connect your own domain whenever you're ready",
];

export default function BuyPage() {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function purchase() {
    setError(null);
    start(async () => {
      try {
        if (paddleConfigured()) {
          // Live: Paddle.js overlay. The webhook creates the project on payment;
          // customData carries the Clerk id so the project is owned correctly.
          await openCheckout({
            priceId: PRICES.buildFee,
            email: user?.primaryEmailAddress?.emailAddress,
            customData: { clerkUserId: user?.id ?? "", email: user?.primaryEmailAddress?.emailAddress ?? "" },
            successUrl: `${window.location.origin}/dashboard`,
          });
          return;
        }
        // Offline: create the project immediately (route reads the Clerk session).
        const res = await fetch("/api/checkout", { method: "POST" });
        const data = (await res.json()) as { redirect?: string; error?: string };
        if (data.error) return setError(data.error);
        if (data.redirect) router.push(data.redirect);
      } catch (e) {
        setError(String((e as Error)?.message ?? e));
      }
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
        <div>
          <Eyebrow>Your website, built for you</Eyebrow>
          <Title as="h1" className="mt-3 text-4xl leading-[1.05] sm:text-5xl">
            One brief. <span className="text-brand">The site you actually wanted.</span>
          </Title>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-soft">
            Tell us about your business in a few minutes. We design and build you a complete,
            bespoke site — then you refine it with us until it&apos;s right.
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

        <Card className="p-7">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[40px] font-semibold leading-none">${BUILD_FEE.toLocaleString()}</span>
            <Badge tone="success">30-day money back</Badge>
          </div>
          <p className="mt-1 text-[14px] text-muted">One-time build fee · no subscription to start</p>

          <div className="mt-6 flex flex-col gap-4">
            {error && <p className="text-[13.5px] text-danger">{error}</p>}

            {isLoaded && !isSignedIn ? (
              <SignInButton mode="modal" forceRedirectUrl="/buy">
                <Button size="lg" className="mt-1 w-full">Sign in to purchase</Button>
              </SignInButton>
            ) : (
              <Button size="lg" onClick={purchase} loading={pending} disabled={pending || !isLoaded} className="mt-1 w-full">
                {pending ? "Starting…" : "Purchase & start onboarding"}
              </Button>
            )}
            <p className="text-center text-[12px] text-muted">
              Hosting is set up later — you only choose a plan once you&apos;ve picked the design you love.
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}

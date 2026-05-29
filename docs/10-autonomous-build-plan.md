# Autonomous build plan (4-hour session, 2026-05-29 00:49 → 04:49)

**Constraint: ZERO product API spend.** No live Anthropic/Gateway calls — no `e2e-live`,
no convergence runs, no `dev:live`. Only code, typecheck, `next build`, and offline
(deterministic, no-LLM) runs. Everything below is buildable + verifiable without credits.

**Operating model:** a background keep-alive (`scripts/keepalive.mjs`) keeps the offline
dev servers (3300/3301/3302) up and restarts them if they die, logging to
`/tmp/ss-keepalive.log`. I self-continue via ScheduleWakeup, committing per chunk. If the
plan completes before 04:49, re-audit → write a fresh plan (docs/11+) → keep building.

## Workstreams (priority order — highest customer value first)

- **W1 · Engine robustness (no-API).** Parallelize per-page reviews in `reviewSite`
  (sequential today → ~5× slower); suppress the system-in-messages warning via
  `allowSystemInMessages`; wire the `reviewRubric` skill into the critics; thread real
  cost everywhere. Verify by typecheck.
- **W2 · Transactional email.** `@simplesight/notify` (Resend when `RESEND_API_KEY`, else
  logs offline — no Anthropic). Triggers: purchase, designs-ready, changes-applied,
  go-live, refund. Wire into the orchestration + portal actions.
- **W3 · Logo + brand colors (audit #8), no-API.** Real upload (Vercel Blob, local
  fallback), **client-side color extraction** (canvas quantization — no API), manual
  primary/secondary pickers + exact hex, and a **deterministic SVG monogram** generator
  when no logo is provided. Thread brand assets/colors into the build.
- **W4 · Project settings.** A `/dashboard/[id]/settings` page to edit business info,
  voice, colors, contact after onboarding (re-feeds the next build/revision).
- **W5 · Billing correctness.** Purchase = one-time build fee (`mode: payment`); hosting
  subscription starts at go-live. Update `billing.ts` + checkout + go-live.
- **W6 · Admin intake console.** `/admin/intake` — view Avery transcripts + tune the
  intake system prompt via operator overrides (no live calls to view/edit).
- **W7 · Quality passes.** Portal responsive + a11y; generated-blocks a11y/perf + JSON-LD
  SEO; marketing polish (hero imagery, scroll reveals, asymmetric section).
- **W8 · End-to-end offline review** + restore the cc-watchdog to defaults at session end.

## Guardrails
- Commit after each coherent chunk with a clear message.
- Typecheck the touched package + `next build` the touched app before moving on.
- Never invoke a live pipeline. Keep `SIMPLESIGHT_OFFLINE=1` for any run.
- Keep the keep-alive healthy; if it exits early, restart it.

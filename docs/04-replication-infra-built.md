# Replication infrastructure — BUILT (2026-05-27)

Everything in `docs/03-replication-infrastructure-plan.md` is implemented, on branch `feat/replication-infra`. Full monorepo typechecks clean. The visual critic was run live against the Holdfast site (score 74/revise — it independently caught the forbidden alpine hero image + missing signature devices).

## One-call entry point

```ts
import { runBespokeBuild } from '@simplesight/agents';

const run = await runBespokeBuild({
  input: 'A natural wine bar in the Mission…',   // freeform pitch OR a BusinessProfile
  projectId: 'proj_123',
  slug: 'vespera',
  dir: '/abs/path/outside/monorepo/bespoke-vespera',
  model: 'anthropic/claude-opus-4.7',
  costCeilingCents: 800,
  deploy: { scope: 'pranayr22-3147s-projects' }, // opt-in, outward-facing
  visualCritic: true,                            // advisory, after deploy
});
// → BuildRun (status succeeded | held_for_human | failed), persisted to <dir>/.simplesight/run.json
```

The orchestrator is **checkpointed/resumable** (re-running skips completed stages, resumes after a crash/529) and **cost-bounded** (holds for a human past the ceiling). Per the locked no-fallback policy, a build that can't pass the code-critic **holds for a human** rather than shipping broken.

## Plan → code map

| Phase | What | Files (`packages/...`) |
|---|---|---|
| 0 | Skill-name fix · font whitelist + brief validator · resilient LLM client | `skills/src/registry.ts`, `agents/src/bespoke/fonts.ts`, `agents/src/bespoke/validate.ts`, `engine/src/resilient.ts` (`withRetry`, `resilientGenerateText`, `generateVision`, `resolveModel`) |
| 1 | Contracts | `contracts/src/bespoke.ts` (BusinessProfile, SiteIA, ComponentType catalog, AssetManifest, GeneratedFile, BuildReport, CriticReport, BuildRun) |
| 2 | Onboarding → profile | `agents/src/bespoke/profile.ts` (ONBOARDING_QUESTIONS, `profileFromIntake`, `generateBusinessProfile`, `profileToBriefInput`) |
| 3 | IA agent (the unlock) | `agents/src/bespoke/ia.ts` (`generateSiteIA`, `validateSiteIA`, `componentsUsed`) |
| 4 | Generators | `agents/src/bespoke/{scaffold,catalog,foundation,page,parse}.ts` |
| 5 | Asset service | `agents/src/bespoke/assets.ts` (`buildAssetManifest`, `verifyImage`, `reverifyManifest`) |
| 6 | Code-critic | `agents/src/bespoke/{runner,critic-code}.ts` (`LocalBuildRunner`/`SandboxBuildRunner`, `runCodeCritic` build+fix loop) |
| 7 | Orchestrator + cost-sentinel | `agents/src/bespoke/orchestrate.ts` (`runBespokeBuild`) |
| 8 | Deploy | `agents/src/bespoke/deploy.ts` (`deploySite`) + opt-in stage |
| 9 | Visual critic | `agents/src/bespoke/{screenshot,critic-visual}.ts` (`runVisualCritic`, thum.io default provider, `generateVision`) |
| 10 | Observability + learning loop | `agents/src/bespoke/{observe,learn}.ts` (`readBuildArtifacts`, `summarizeRun`, `aggregateFindings`, `proposeSkillUpdate`) |

## Known remaining work (honest)

- **Admin UI wiring**: the read-model (`readBuildArtifacts`/`summarizeRun`) and learning-loop agent exist; rendering them in the portal `/admin` (and registering external build dirs so the dashboard can find runs) is the remaining surface.
- **Vercel Sandbox runner**: `SandboxBuildRunner` is a stubbed interface; the code-critic runs via `LocalBuildRunner` today. Visual screenshots use thum.io (keyless) — swap in Sandbox + a headless browser for hermetic capture.
- **Cost accounting** currently sums the dominant generators (foundation/pages/critic via `resilientGenerateText`) + flat estimates for the small JSON agents (brief/IA/profile go through `generateJson`, which doesn't yet surface usage). Wire usage out of `generateJson` for exact totals.
- **Embeds backends**: lead-form has no persistence; social-feed is curated stock (not the live IG API). Fine for preview; productizing needs a form endpoint + optional IG integration.
- **End-to-end live run**: the pipeline compiles and each stage is individually exercised; a full `runBespokeBuild` against a new business (with `npm install`+build+deploy) is the next validation.

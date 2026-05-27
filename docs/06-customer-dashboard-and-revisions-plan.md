# Customer Dashboard & Revision Flow — Game Plan

**Date: 2026-05-27.** Covers: the customer dashboard, the subscription/revision model (hosting + **1 revision & republish per month**), and the future **chat-based revision** flow that turns a request into a typed change-checklist.

---

## 0. The model we're designing for

A customer pays a subscription that covers **hosting** + **one revision and republish per month**. They need to: see every site they own, see what they're paying for and what's live, view the site, and request changes. Over time, "request changes" becomes a **chat** that decomposes the request into concrete, typed change-items and applies them.

---

## 1. Customer dashboard (build next)

**A list view** of the customer's sites — each row:
- Site name + thumbnail/preview, **status** (`preview` / `live` / `changes_in_progress`), live + preview URLs.
- **Hosting/subscription**: plan, renewal date, hosting status.
- **Revisions this month**: e.g. "1 of 1 remaining · resets May 1."
- Actions: **View site**, **Request a change**, **Version history**.

**A per-site view**:
- Live preview (iframe or screenshot), current design summary (direction + palette + fonts), pages.
- **Build/version history** (each published build = a snapshot, with date + a "restore" option).
- The **Request a change** entry point (form now; chat later).

**Data-model additions** (extends existing `contracts`/`db`):
- Link sites to a **customer account** (account ↔ projects).
- **Subscription** record: plan, status, renewal date, hosting flag.
- **Revision ledger**: `{ projectId, month, used, allowed }` for quota.
- **Version history**: snapshot of each published build (artifacts ref + deploy URL + timestamp).

**Reuses what exists:** `ProjectStatus` (already models purchased→preview→live), the existing `apps/portal/app/dashboard`, the provisioning/billing package, and the new `readBuildArtifacts`/`BuildRun` records for "current design summary" + version data.

---

## 2. Revision & republish engine

A **revision** = a scoped, quota-limited re-run that **reuses the orchestrator's checkpoints** and redeploys.

- The orchestrator (`runBespokeBuild`) is already **checkpointed/resumable** and has **skip flags** (`skipCodeCritic`) — a revision changes only the artifacts it must (e.g. a page file, the theme tokens, an asset), then re-runs the affected downstream stages (code-critic + deploy) and leaves the rest cached. Cheap and fast vs. a full rebuild.
- **Quota**: 1/month enforced via the revision ledger. A *preview* of a change can be free/unlimited; **publishing/republishing** consumes the monthly quota. (Design decision to confirm.)
- **Republish** = redeploy the updated app + re-alias; snapshot the prior version first (rollback path).
- **Version history**: every publish snapshots the build dir + records the deploy URL, so a customer can compare/restore.

---

## 3. Chat-based revision → change-checklist engine (future)

The flow that makes revisions self-serve:

```
Customer chat message
   → Triage agent: classify into a typed CHANGE-CHECKLIST (1..n change-items)
   → For each item: route to its typed handler → gather what's needed → confirm with customer
   → Apply (scoped regen) → preview → on approval: republish (consumes monthly quota)
```

The **checklist** is the central artifact (mirrors the multi-blog checklist pattern): each item has a `type`, a `target` (which page/section/token), the `current` value, the `requested` value, and a `status` (needs-input / ready / applied). The agent never silently guesses — it confirms each item before applying.

**Change-item types** (each maps to a handler in §4): `image`, `text`, `color`, `font`, `theme`, `content-section`, `add/remove-section`, `contact/hours`, `seo`.

---

## 4. Typed change handlers (the granular flows)

These are deliberately ordered cheapest/highest-WOW first.

**Color change** *(cheap, no codegen)* — surface the current theme tokens (primary / accent / background / foreground / muted) as **editable swatches**; customer picks new value(s); **validate WCAG** (reuse `validateDesignBrief`'s contrast logic); rewrite the palette vars in `globals.css`; re-render. Seconds, no LLM.

**Font change** *(cheap)* — surface current display / body / mono (from the **font whitelist**); customer picks new ones from the whitelist; rewire the Google Fonts `<link>` + `--font-*` vars in `layout.tsx`/`globals.css`; re-render. No LLM.

**Theme regen** — color + font changes combined → regenerate `globals.css` tokens → quick code-critic build check → republish.

**Text change** *(targeted edit, not full regen)* — locate the target copy (which page/section/string, via the chat or a click-to-edit overlay on the preview) → capture the new value → **patch just that string** in the page file → rebuild that page. (LLM only to disambiguate "which text," not to rewrite the page.)

**Image change** — identify the target image slot → capture the desired new image: **upload**, or *describe it* → the **asset service** sources candidates (Unsplash API) → customer picks → swap the URL in the asset manifest + the page → re-verify it's live → re-render the affected page(s).

**Add/remove/replace a section** — the heaviest: re-run the **IA agent** for that page + regenerate the affected page via the **page generator** → code-critic → republish.

Every handler ends in: **preview → customer approves → republish (consumes the monthly quota) → snapshot version.**

---

## 5. How this reuses what's already built

| Need | Reuses |
|---|---|
| Scoped re-run | `runBespokeBuild` checkpoints + `skipCodeCritic`; artifact store in `<dir>/.simplesight` |
| Theme/color/font edits | `validateDesignBrief` (WCAG + font whitelist), the design-token `globals.css` model |
| Image sourcing/verify | the asset service (`buildAssetManifest`/`verifyImage`/`reverifyManifest`) |
| Page/section regen | `generateSiteIA` + `generatePage` |
| Build safety | the code-critic (`runCodeCritic`) |
| Deploy/republish | `deploySite` + provisioning (alias/domains) |
| Observability | `readBuildArtifacts`/`summarizeRun`, the `/admin/builds` view |
| "Better over time" | the learning loop (`aggregateFindings`/`proposeSkillUpdate`) |

**New build:** account↔site linking + subscription + revision-ledger + version-history (data), the customer dashboard UI, the change-checklist + triage agent, and the per-type handlers (color/font first).

---

## 6. Sequencing

- **Phase A — Customer dashboard (read + view).** Account↔sites, subscription/quota display, per-site view, version list, manual "request a change" form. *Highest near-term value.*
- **Phase B — Revision engine + quota + version history.** Scoped re-run + republish + monthly quota enforcement + rollback.
- **Phase C — Typed handlers, cheapest first:** color → font → theme → text → image → section. (Color/font are no-LLM, instant, high-WOW — ship them first.)
- **Phase D — Chat triage → checklist** wrapping the handlers; click-to-edit overlay on the preview.

---

## 7. Honest notes / decisions to confirm

- **Preview vs. publish quota:** recommend unlimited *previews*, quota only on *republish*. Confirm.
- **Quota reset & rollover:** calendar month vs. billing-cycle anchored; do unused revisions roll over? (Recommend: no rollover, billing-cycle anchored.)
- **Abuse/scope:** a "revision" should be bounded (e.g. a checklist of N items in one cycle), or a single republish can bundle many changes — recommend the latter (one republish = one revision, any number of bundled changes).
- **Rollback** must snapshot *before* republish so a bad change is reversible without spending another revision.
- **Billing hooks**: republish should check quota + (optionally) offer a paid one-off extra revision when exhausted.

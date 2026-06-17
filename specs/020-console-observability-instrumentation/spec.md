# Spec 020 — Console Observability Instrumentation (Sentry frontend errors + replay)

**Status:** SPECIFY-ONLY — draft for owner review. No SDK install, no DSN, no component code, no contract change authored or implied here.
**Owning repo:** Retail-Tower-Console.
**Date:** 2026-06-17.
**Parent:** Orchestrator [AD-TOOL-003 — Observability Layer: Sentry + Datadog](https://github.com/ahmed-shaaban-94/Retail-Tower-Orchestrator/blob/main/docs/decisions/AD-TOOL-003-observability-layer-sentry-datadog.md) (Accepted, owner-ratified 2026-06-17) + its [Phase 0 inventory](https://github.com/ahmed-shaaban-94/Retail-Tower-Orchestrator/blob/main/docs/tooling/observability-phase-0-inventory.md).
**Reference pattern:** POS-Pulse's production Sentry integration (`@sentry/electron`, `sendDefaultPii: false`, `beforeSend` scrub-or-drop, DSN-gated default-inert) — Phase 0 §2.1. This spec ports that posture to the React/browser context.

---

> **⚠️ NOT a monitoring dashboard.** This spec is about instrumenting the **Console app itself** so Sentry captures the Console's *own* crashes/JS errors/session replay. It is the opposite of the product-feature drafts **`013-rf-monitoring-ops`** and **`014-rf-monitoring-alerts`**, which are admin *screens* that display pipeline/platform health *to* the operator. 020 = "watch the Console"; 013/014 = "the Console shows you the platform." Do not conflate.

---

## 1. Summary

Retail-Tower-Console (Vite + React) has **no error instrumentation today** — a frontend crash or unhandled rejection is invisible. Per AD-TOOL-003 D1, Sentry owns the Console's app/user-facing error layer. This spec defines wiring **Sentry browser** into the Console for: unhandled errors + promise rejections, a top-level React error boundary, and (gated) session replay — all with the locked-down, privacy-first posture proven in POS-Pulse.

Datadog is **not** in scope for the Console (AD-TOOL-003 D2 keeps Datadog on the platform/backend layer; the Console is a browser app whose user-facing errors are Sentry's domain). RUM is explicitly out of scope.

## 2. Goals

- **G1** — Capture Console **unhandled errors + unhandled promise rejections** in Sentry.
- **G2** — A **top-level React error boundary** that reports the caught error to Sentry and renders a safe fallback (no white screen).
- **G3** — **Session replay**, gated and **privacy-first**: `maskAllText` + `blockAllMedia` on by default; unmask only explicitly-reviewed non-sensitive elements.
- **G4** — **DSN-gated default-inert**: empty/missing `VITE_SENTRY_DSN` (or runtime-config equivalent) → Sentry never initializes; the app runs normally. Mirrors POS-Pulse.
- **G5** — A `beforeSend` scrub-or-drop that strips request/user/context keys matching a Console forbidden-key denylist (ported from POS-Pulse's `forbidden-keys` semantics).

## 3. Non-goals

- No Datadog / RUM in the Console.
- No SDK install, no `package.json`/lockfile edit, no DSN committed in this spec.
- No change to the generated API client (`src/generated/`) or any DP-2 contract.
- No new screen, route, or UI feature (this is cross-cutting instrumentation, not a monitoring dashboard — see the banner).
- No APM-trace-to-Sentry correlation (AD-TOOL-003 Phase 3, future).
- No auth-provider change (the Console's auth provider is its own sanctioned egress; Sentry is additive).

## 4. Privacy / redaction (OQ-4 — gating)

- **Session replay:** `maskAllText: true`, `blockAllMedia: true` by default. Operator names, tenant/store identifiers, receivables/claims figures, and any patient/RX-adjacent text must never render unmasked. Unmasking any element requires explicit per-element review.
- **`sendDefaultPii: false`**; `integrations: []` baseline — each integration (DOM/fetch/history) reviewed before enabling.
- **`beforeSend` scrub-or-drop:** strip auth tokens/JWTs, operator email/identity, and any business/catalog/inventory/sales payload before send; drop the event if nothing safe remains (AD-TOOL-003 D5).
- **DSN delivery:** prefer runtime config over `VITE_`-inlined env where feasible, so the DSN is not hard-baked into the shipped bundle (POS-Pulse handles this via IPC; the browser analogue is runtime/window config — mechanism deferred to `plan.md`).

## 5. Sampling (OQ-3 — conservative default)

- **Errors:** 100%.
- **Replay:** low session sample (e.g. `replaysSessionSampleRate` ~0.1) + **100% on sessions with an error** (`replaysOnErrorSampleRate: 1.0`) — captures the failure, not the routine session. Tunable after the pilot week (compensating control for the no-cap decision, Phase 0 OQ-1).

## 6. Secrets (R-4)

`VITE_SENTRY_DSN` / runtime DSN sourced from deploy-time env (1Password-backed), never committed. `.env.example` carries an empty value (default-inert).

## 7. Acceptance criteria

- AC-1: With DSN empty, the Console builds and runs identically to today (Sentry inert).
- AC-2: With DSN set, a thrown render error is caught by the error boundary, reported to Sentry **scrubbed**, and a safe fallback renders (no white screen).
- AC-3: An unhandled promise rejection reaches Sentry, scrubbed.
- AC-4: A captured replay has all text masked + media blocked by default.
- AC-5: No business/catalog/inventory/sales payload and no operator PII appears in any Sentry event or replay.

## 8. Scope of authority / lifecycle

`SPECIFY-ONLY`. No `/speckit-specify` build, no `/plan`, no `/tasks` run. The SDK add, the init module, the error boundary, and the replay config are authored by a **separate Console implementation slice under Console review**, only when AD-TOOL-003 Phase 1 is separately owner-approved. Local authoring here is preparation evidence, not `origin/main` truth.

## 9. Owner decisions (deferred — NOT decided here)

| OD | Question | Status |
|---|---|---|
| OD-1 | DSN delivery mechanism: `VITE_`-inlined vs runtime/window config (bundle-leakage trade-off). | OPEN — `plan.md`. |
| OD-2 | Whether session replay ships in the first Console slice or defers behind errors-only. | OPEN. |
| OD-3 | Error-boundary granularity: single top-level vs per-route boundaries. | OPEN. |

> **SPECIFY-ONLY spec.** Records the Console-side frontend-error/replay instrumentation design. Authors no SDK, DSN, component code, or contract change. Distinct from the 013/014 monitoring-UI drafts. Each downstream activity remains independently owner-gated per AD-TOOL-003 D6.

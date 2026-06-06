# Implementation Plan: RF-1 Auth Shell & Active Context

**Branch**: `003-rf1-auth-shell` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-rf1-auth-shell/spec.md`

**Companion artifacts**:
- [api-readiness.md](./api-readiness.md) — RF-1 readiness carried forward from foundation (all `stable`; one residual OQ)
- [research.md](./research.md) — Phase 0 output (RF-1 stack-primitive deferrals R3-1..R3-5)
- [data-model.md](./data-model.md) — Phase 1 output (render-side projection; this repo owns no model)
- [contracts/rf1-auth-context.md](./contracts/rf1-auth-context.md) — Phase 1 output (the 7-operation consumption boundary for this slice)
- [quickstart.md](./quickstart.md) — Phase 1 output (planning walkthrough, not a setup runbook)
- [checklists/requirements.md](./checklists/requirements.md) — Spec quality checklist (from `/speckit-specify`)

> **Mode contract.** Planning-only. This plan sequences the RF-1 work and
> records the constraints any future answer must satisfy. It does **not**
> authorize implementation, pick RF-1's router/state/data-fetching primitives,
> or create any `src/` file. Implementation begins only after the foundation
> FR-008 five-gate approval for this slice (spec + plan + tasks + API map +
> validation gates).

---

## Summary

This is the **first product-UI plan** for Retail-Tower-Console. Its job is to
sequence the RF-1 auth shell (SF-1 sign-in, SF-2 app shell, SF-3 active-context
provider) against the seven Data-Pulse-2 operations the foundation RF-1
consumption boundary already fixed, and to record the per-decision constraints
RF-1 must satisfy before its FR-008 implementation gate clears.

**Primary requirement** (from spec.md): specify how the auth shell consumes the
seven RF-1 operations through the slice-002 generated client, renders backend
truth (never a frontend authorization decision), and establishes the
read-only active-context provider every later family attaches to.

**Technical approach.** RF-1 builds on the slice-002 stack as **fixed context**
(React 19 + Vite SPA, TypeScript strict, Vitest + Playwright, Biome, generated
client at `src/generated/` pinned at Data-Pulse-2 `62d0906`). This plan does
**not** pick RF-1's own router, state store, or data-fetching primitive — those
are deferred decisions enumerated in [research.md](./research.md) R3-1..R3-5 and
resolved in `/speckit-clarify` (with any new dependency approved per Constitution
Principle 9) before code begins. The plan fixes (a) surface sequencing
(SF-1 → SF-3 → SF-2), (b) the consumption boundary (7 operations, generated
client only), and (c) the validation-gate shape RF-1 must define.

---

## Technical Context

| Item | Value | Source / gate |
| --- | --- | --- |
| Language / framework | TypeScript (strict) + React 19 + Vite 6 SPA | Slice 002 D-1/D-8 (fixed) |
| API consumption | Generated client `src/generated/`, `openapi-fetch` | Slice 002 D-2/D-7; Constitution Principle 8 |
| Data-Pulse-2 pin | `62d0906` | Slice 002 C-4 (fixed for this slice) |
| Auth transport | `dp2_session` cookie (HttpOnly+Secure+SameSite=Lax) | Foundation contract §Transport; slice 002 C-2 |
| Unit/integration tests | Vitest | Slice 002 D-3 |
| E2E tests | Playwright (in CI) | Slice 002 D-4/D-6 |
| Lint/format | Biome | Slice 002 D-5 |
| Router | react-router (data-router pattern) — *selected, pending Principle 9* | research R3-1; clarify Session 2026-06-06 |
| Active-context state store | TanStack Query cache as the read-only context store — *selected, pending Principle 9* | research R3-2/R3-3 (coupled); clarify Session 2026-06-06 |
| Data-fetching strategy | TanStack Query over `openapi-fetch` — *selected, pending Principle 9* | research R3-3; clarify Session 2026-06-06 |
| Form handling (sign-in) | Uncontrolled native form + minimal validation (no form library) | research R3-4; clarify Session 2026-06-06 |
| Error/notification surface | Inline error component system + persistent banner (no toast library) | research R3-5; clarify Session 2026-06-06 |

**Clarify resolutions (Session 2026-06-06).** R3-1..R3-5 are resolved above
(version numbers pinned later, at Principle 9 / implementation). New runtime
dependencies introduced: **react-router** and **TanStack Query** — both
*selected, pending Constitution Principle 9 approval*; resolving the choice here
is NOT Principle 9 sign-off. Form handling and the error surface add **no**
dependency. Coexistence note: react-router's data-router triggers navigation and
route-level loading; TanStack Query owns the active-context cache and the seven
operations' fetching (re-fetch-after-mutation, 401 reactive-refresh interceptor).
Behavioral resolutions (OQ-2 reactive on-401-retry-once, OQ-4 auto-select,
S5 full redirect) live in [`spec.md`](./spec.md) Clarifications, not here.

**Constitution Check.** This plan introduces no `package.json`, lockfile, CI,
deployment, `src/`, or secret change *at plan stage* — the two selected
dependencies (react-router, TanStack Query) are added only at implementation
after Principle 9 approval. It consumes exactly the seven RF-1 operations (no
scope expansion). It modifies no foundation or slice-002 artifact. All checks
pass at plan level.

---

## Surface sequencing (build order, not UX flow)

RF-1's three surfaces have a dependency order. Implementation (post-gate) should
follow it:

1. **SF-3 — Active-context provider first.** It is the read-only projection
   every other surface and every later family depends on. Built against
   `getActiveContext` + the three context mutators, with no optimistic update.
2. **SF-1 — Sign-in surface second.** It drives the ANONYMOUS → AUTHENTICATED
   transition (data-model ST-1) that populates SF-3. Consumes `signIn`.
3. **SF-2 — App shell last.** It composes SF-3's context indicator + chooser,
   the sign-out control (`signOut`), the proactive `refreshSession`, and the
   route guard (401 → SF-1). It is the frame for RF-2..RF-7.

Rationale: SF-2 cannot render a meaningful context indicator without SF-3, and
the route guard cannot be validated without SF-1 to redirect to.

---

## Per-decision deferral discipline

Each RF-1 stack primitive is deferred with its constraint recorded in
[research.md](./research.md). The discipline (mirroring slice 002 FR-002-003):

- `/speckit-plan` (this document) does **not** default-pick R3-1..R3-5. It
  records constraints only.
- `/speckit-clarify` resolves each R3-N explicitly, owner-confirmed.
- Any R3-N answer that adds a runtime dependency to `package.json` lands only in
  the implementation phase after Principle 9 approval, and is justified in
  `tasks.md` against its R3-N (mirroring slice 002 FR-002-006).

---

## Validation-gate shape (the 5th FR-008 gate, defined here, approved later)

RF-1's validation gates (to be ratified in `tasks.md` per spec OQ-5):

- **VG-1 — Unit coverage.** Vitest unit coverage ≥ the repo threshold for the
  SF-3 context-reduction logic and the SF-1 response-branching logic.
- **VG-2 — E2E journeys.** Playwright journeys covering: single-membership
  sign-in (S1), multi-membership chooser (S2), store switch + 409 (S3),
  tenant-switch-clears-store (S4), 401-expiry → sign-in (S5), sign-out (S6),
  no-access (S7). Driven against an approved mock (FR-003-012), not live DP2.
- **VG-3 — Boundary grep.** A check that no hand-written `fetch(`/XHR targets a
  Data-Pulse-2 path (only the generated client is used); no OpenAPI bytes copied;
  no `Authorization: Bearer` header set by the console.
- **VG-4 — No-scope-creep grep.** A check that none of the four out-of-scope
  auth operations (`requestPasswordReset`, `confirmPasswordReset`,
  `requestEmailVerification`, `confirmEmailVerification`) is referenced.

These are *defined* here and *approved* as part of the FR-008 gate; this plan
does not run them (no code exists yet).

---

## What this plan does NOT do

- Does not pick R3-1..R3-5 (router/state/data-fetching/form/error-surface).
- Does not create `src/` files, route files, components, hooks, or tests.
- Does not regenerate or re-pin `src/generated/schema.d.ts`.
- Does not add a mock (FR-003-012).
- Does not modify any foundation or slice-002 artifact (FR-003-010).
- Does not clear any FR-008 gate — it is one input to the gate.

---

## Next Spec Kit phases

1. `/speckit-clarify` resolves OQ-1..OQ-5 (spec) and R3-1..R3-5 (research),
   owner-confirmed.
2. `/speckit-tasks` produces `tasks.md` for RF-1, tracing each task to a surface
   (SF-1/2/3) and each new dependency to its R3-N.
3. FR-008 five-gate approval for slice 003 specifically.
4. Implementation, in the SF-3 → SF-1 → SF-2 order above.

---

**End of Implementation Plan: RF-1 Auth Shell & Active Context.**

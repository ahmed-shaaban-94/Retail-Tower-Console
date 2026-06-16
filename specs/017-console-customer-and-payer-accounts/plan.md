# Implementation Plan: Console — Customer & Payer Accounts

**Branch**: `017-console-customer-and-payer-accounts` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/017-console-customer-and-payer-accounts/spec.md`

**Companion artifacts** (Phase 0/1 outputs; authored at PLAN, conceptual only):
- [research.md](./research.md) — Phase 0 (017 reuses RF-1 primitives; consumed-op readiness)
- [data-model.md](./data-model.md) — Phase 1 (render-side projection; this repo owns no model)
- [contracts/console-payer-accounts.md](./contracts/console-payer-accounts.md) — Phase 1 (the 2-operation consumption boundary)
- [tasks.md](./tasks.md) — Phase 2 output (`/speckit-tasks`)

> **Mode contract.** Planning-only. This plan sequences the 017 work and records
> the constraints any future answer must satisfy. It does **NOT** authorize
> implementation, author any OpenAPI YAML, regenerate the generated client, create
> any `src/` file, or re-pick the console's router/state/data-fetching primitives
> (it reuses the RF-1 foundation's). Implementation begins only after the
> foundation FR-008 five-gate approval for this slice (spec + plan + tasks +
> API map + validation gates). The settlement contract is owned by **DP-2 035**;
> 017 only consumes the generated client built from it.

---

## Summary

017 is the **first** Console child of the settlement work package (DP-2 035 §12).
Its job is to let a Console accounts administrator **create and list payer accounts**
(credit customer / corporate / insurer) for the active tenant, as render-side
reactions to backend truth through the generated Data-Pulse-2 client — never holding
settlement state, never authoring backend logic, never calling ERPNext.

**Primary requirement** (from spec.md): render the payer-account **create** form and
the **list** (newest-first, keyset-paginated, category-filterable) surfaces by
consuming **exactly two** ratified DP-2 035 G2 operations —
`consoleCreatePayerAccount` and `consoleListPayerAccounts` — over the
`cookieAuth` Console human session.

**Technical approach.** 017 builds on the console's foundation stack and RF-1's
resolved primitives as **fixed context** (TypeScript-strict + React + Vite SPA;
generated client + `openapi-fetch`; TanStack Query as the read-only server-state
cache; the shared error surface; the `ActiveContextProvider`). 017 introduces **no
new runtime dependency** and **no new backend**. The plan fixes (a) the consumption
boundary (the two payer-account ops, generated client only), (b) the create
idempotency-key design, (c) the read-through projection (no Console-side store of
record), and (d) the validation-gate shape 017 must define before implementation.

This is a **planning-only** plan: it produces no code and no OpenAPI.

---

## Technical Context

| Item | Value | Source / gate |
| --- | --- | --- |
| Language / framework | TypeScript (strict) + React + Vite SPA | Console foundation (fixed) |
| API consumption | Generated client `src/generated/`, `openapi-fetch` | Constitution (generated-client only); **regenerate at pin to expose the settlement payer-account ops** |
| Upstream contract | DP-2 035 `settlement.yaml` (**G2 RATIFIED** — PR #574, `cb4a7e5`) | DP-2 035 §10; consumed read-only |
| DP-2 pin | DP-2 `main` settlement contract @ G2 ratification | recorded in `api-readiness.md` at PLAN |
| Auth transport | `dp2_session` cookie (httpOnly), `DashboardAuthGuard` + `RolesGuard` | DP-2 035 §8 / G10; RF-1 auth shell |
| Unit/integration tests | Vitest | foundation (fixed) |
| E2E tests | Playwright (in CI) | foundation (fixed) |
| Lint/format | Biome | foundation (fixed) |
| Router | data-router — **reused from RF-1**; 017 registers a new protected route in the shell | RF-1 plan |
| Server-state store | TanStack Query cache — **reused**; 017 adds payer-account queries | RF-1 plan |
| Data-fetching | TanStack Query over `openapi-fetch` typed wrappers — **reused; 017 adds 2 typed op wrappers + the create `Idempotency-Key` shape** | RF-1 plan |
| Form handling (create) | Uncontrolled native form + minimal validation (no form library) — **reused from RF-1** | RF-1 research |
| Error/notification surface | Shared `Banner` + `InlineError` (no toast library) — **reused from RF-1** | RF-1 research |
| Active context | `ActiveContextProvider` / `useActiveContext` — **reused**; 017 reads the active tenant; tenant is server-resolved on write | RF-1 plan |

**Reuse-of-foundation.** Every primitive 017 needs (router, server-state cache,
typed-op wrappers, error surface, active-context provider, design tokens) is
**already resolved** by the merged foundation / RF-1 slices; 017 adds **no new
runtime dependency**. PLAN must verify these against the merged code (cite file:line
in `research.md`) before any implementation task — not assume them.

**Constitution Check.** This plan introduces **no** `package.json`, lockfile, CI,
deployment, `src/`, OpenAPI YAML, migration, or secret change at plan stage. It adds
**no new runtime dependency**. It consumes **exactly two** ratified DP-2 035 G2
operations (no scope expansion; no receivable/claim/reconciliation op; no POS op; no
connector op). It modifies no foundation artifact and no DP-2 contract. All checks
pass at plan level. The one residual is the generated-client regeneration at pin to
expose the two settlement payer-account ops — a **gated implementation task**,
scheduled in `tasks.md`, NOT done here.

---

## Phase 0 — Research (conceptual; `research.md`)

| ID | Question | Resolution direction |
| --- | --- | --- |
| R0-1 | Are `consoleCreatePayerAccount` + `consoleListPayerAccounts` present and ratified in DP-2 035 `settlement.yaml`? | **Yes** — verified in the ratified contract (§3.1 of spec). Record the DP-2 pin + commit in `api-readiness.md`. |
| R0-2 | Which foundation primitives does 017 reuse, and where (file:line)? | Reuse RF-1's router/query/client/error-surface/active-context. Cite merged code in `research.md`; assume nothing. |
| R0-3 | How is create idempotency satisfied client-side? | Stable per-submission `Idempotency-Key` (UUID); replay same key on retry (G5/FR-020). |
| R0-4 | How is the list paginated/filtered? | Opaque keyset cursor (`cursor`/`page_size`) + the contract `category` filter only; free-text is client-side over the page. |
| R0-5 | Does 017 hold any state of record? | **No** — read-through projection from DP-2; ephemeral view state only. |

## Phase 1 — Design (conceptual; `data-model.md`, `contracts/*.md`)

- **Consumption boundary** (`contracts/console-payer-accounts.md`): pin the **two**
  operationIds, their request/response schemas (`PayerAccountCreate`, `PayerAccount`,
  `PayerAccountPage`, `PayerCategory`), auth (`cookieAuth`), and the error mapping
  (400/401/403/409/500) — **consume-only**, no YAML authored.
- **Data model** (`data-model.md`): render-side projection only. 017 owns **no**
  table, migration, or cache of record; `PayerAccount` is read-through, the create is
  write-through. Document the projection fields exactly as the contract defines them.
- **Surfaces**: (a) payer-account **list** (newest-first, keyset paginated, category
  filter, empty-state), (b) payer-account **create** form (category + displayName
  required; optional externalRef / storeId; `creditTerms` opaque placeholder).
- **Identity/access design note**: `cookieAuth` human session + `Management`-family
  RBAC; payer = record not principal (OQ-1); cross-tenant → backend safe-404.

## Phase 2 — Tasks (`/speckit-tasks` → `tasks.md`)

Tasks are authored at SPECIFY/PLAN granularity — they define the contract-consuming
work and its gates, **not** code-writing steps. Implementation stays gated behind the
foundation FR-008 five-gate rule.

---

## Surface sequencing

```text
S17-1  Pin consumption boundary (2 ops, generated client) ──┐
                                                            ├──► S17-3  Create-payer-account surface
S17-2  Verify foundation reuse (router/query/client) ───────┘            │
                                                                         ▼
                                                            S17-4  List-payer-accounts surface
                                                            (category filter + keyset pagination)
```

List (S17-4) depends on the same consumption boundary as create (S17-3); both depend
on the foundation-reuse verification (S17-2) and the boundary pin (S17-1).

---

## Gate Plan (Console 017's own gates — NONE satisfied here)

> Upstream **DP-2 035 G2 is RATIFIED** (verified dependency precondition — PR #574,
> `cb4a7e5`). That unblocks planning; it does **not** flip any 017 gate.

| Gate | Cleared by | Status |
| --- | --- | --- |
| **CON-G1 — Contract pin** | `contracts/console-payer-accounts.md` pins the 2 ops + schemas + DP-2 pin | **NOT satisfied** (identified; pin at impl) |
| **CON-G2 — Design approval** | Owner approves the 017 design | **NOT satisfied** |
| **CON-G3 — API readiness** | `api-readiness.md` verifies the 2 ops against DP-2 `main` | **NOT satisfied** |
| **CON-G4 — Foundation attach** | `research.md` cites the reused RF-1 primitives (file:line) | **NOT satisfied** |
| **CON-G5 — Implementation gate** | Foundation FR-008 five-gate clearance before any UI code | **NOT satisfied** |

---

## Complexity Tracking

No constitution violations. 017 adds no new project, no new runtime dependency, no
new pattern: it is a narrow two-operation consumption slice over the existing
foundation stack and the ratified DP-2 035 G2 contract.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |

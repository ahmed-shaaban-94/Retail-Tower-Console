# Implementation Plan: Console Receivables & Insurance Claims

**Branch**: `018-console-receivables-and-insurance-claims` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-console-receivables-and-insurance-claims/spec.md`

> **Mode contract.** Specify / design-ahead plan. This plan sequences the Console
> receivable-tracking + claim/remittance surface against the **four named** DP-2
> 035 G2 ops, reusing the merged RF-1/RF-2 stack with zero new runtime dependency.
> It authorizes **no code now**: the DP-2 035 contract is RATIFIED but
> `1.0.0-draft` with **no runtime** (§Constitution / gate check), so the build
> phases are **gated on DP-2 implementing the 035 contract**. It does NOT edit any
> OpenAPI, author a migration, add an egress, or open the 017/019 surfaces.

---

## Summary

018 attaches a new content route family to the merged RF-1 shell, mirroring RF-2 /
RF-4a structure: a typed data layer (`receivables-queries`), TanStack Query hooks,
and presentational surfaces (queue list, inspect drawer, submit-claim confirm,
reconcile-remittance form), wired by a route fragment mounted in `App.tsx`. It
consumes **exactly four** generated ops from the DP-2 035 settlement client
(`consoleGetReceivable`, `consoleListReceivables`, `consoleSubmitClaim`,
`consoleReconcileRemittance`) and reuses the shared presenters. It introduces no
new shared primitive and no new remote egress.

The load-bearing difference from RF-4a: RF-4a's ops were **runtime-merged** and
buildable; 018's four ops are **contract-present, runtime-absent** (the DP-2 035
contract is `1.0.0-draft`, no controller yet). So 018 is **design-ahead** — the
codegen + data-layer + UI + test phases below are **planned and gated**, not
executed, until the DP-2 035 runtime lands.

## Technical Context

**Language/Version**: TypeScript (React SPA), as established by the Console foundation slices.

**Primary Dependencies**: React, TanStack Query, `openapi-fetch` + generated client, react-router — **all already present** (no new dependency).

**Storage**: None owned. The Console holds no settlement state; all state is DP-2's, read/written via the generated client.

**Testing**: vitest (unit + boundary), Playwright (e2e + a11y) — the established Console stack.

**Target Platform**: Browser SPA (the admin Console).

**Project Type**: Web application — frontend only (this repo); the backend is DP-2 (separate repo, separate contract owner).

**Performance Goals**: Queue list renders the bounded backend page (`page_size` ≤ 200) with opaque keyset pagination; no client-side aggregation.

**Constraints**: cookie transport only (no `Authorization` header); render exact-decimal money strings (no float coercion); no frontend authorization branching; no new remote egress.

**Scale/Scope**: One route family, four consumed ops, ~four presentational surfaces; design-ahead (not yet built).

## Constitution / gate check

*GATE: must pass before any build phase. NONE is satisfied in this artifact.*

- **Principle 8 (single DP-2 call surface):** all calls via the generated client
  (VG-1). PASS **by design** — no code yet.
- **Principle 7 (no frontend authorization):** no role-conditioned hiding (VG-3).
  PASS **by design**.
- **Op-scope boundary (VG-2):** the layer calls only the four named ops; none of
  `consoleApplyPayment` (017) / `consoleCreatePayerAccount` / `consoleListPayerAccounts`
  (017) / `posRecordSettlementIntent` (POS-020). PASS **by design**; asserted by a
  boundary test in the build slice.
- **No new egress (VG-4 / architecture invariant):** manual adjudication entry
  only; no insurer API, no remittance-file import. PASS **by design**.
- **G-runtime (BLOCKING, NOT satisfied):** the four consumed ops have **no DP-2
  controller** at any codegen pin (contract is `1.0.0-draft`). This gate is
  **OPEN** and blocks the codegen + build phases. **Not satisfied.**
- **No new dependency:** reuses TanStack Query, `openapi-fetch`, react-router.
  PASS **by design**.

> No 018 gate is marked satisfied. The upstream DP-2 035 **G2** is RATIFIED
> (precondition); it is not an 018 gate and is not re-certified here.

## Project Structure

### Documentation (this feature)

```text
specs/018-console-receivables-and-insurance-claims/
├── plan.md              # This file
├── spec.md              # /specify + /clarify output
├── research.md          # Phase 0 — reuse + boundary + runtime-gate decisions (build-slice)
├── data-model.md        # Phase 1 — render-side projections (no owned model)
├── contracts/
│   └── receivables-claims.md   # Phase 1 — the 4-op consumption boundary (Markdown; NOT OpenAPI)
└── tasks.md             # /tasks output (planning granularity)
```

### Source Code (repository root)

> **Planned, NOT created in this artifact.** Concrete paths are sequenced for the
> build slice that runs only once `G-runtime` clears. Mirrors the RF-2 / RF-4a
> layout.

```text
src/
├── lib/
│   └── receivables-queries.ts        # typed wrappers + query keys + error map (planned)
├── receivables/
│   ├── useReceivableQueries.ts       # TanStack hooks (planned)
│   ├── useReceivableScope.ts         # active tenant/store from ActiveContextProvider (planned)
│   ├── ReceivableList.tsx            # queue table + state/payer/store filters (planned)
│   ├── ReceivableInspectDrawer.tsx   # Receivable projection (planned)
│   ├── SubmitClaim.tsx               # confirm-step claim submission (planned)
│   └── ReconcileRemittance.tsx       # remittance entry + result render (planned)
└── shell/
    └── rf018Routes.tsx               # route fragment, mounted in App.tsx (planned)

tests/
├── unit/                             # error mapping, list/inspect render, claim/reconcile flows, boundary (planned)
└── e2e/                              # queue → inspect → submit-claim → reconcile journey + a11y (planned)
```

**Structure Decision**: Web frontend, single route family attached to the RF-1
shell — the established Console pattern. No backend code in this repo (DP-2 owns
it). All paths above are **planned**; none is authored by this design-ahead
artifact.

## Phases

> Phases 0–1 are design (authored as companion Markdown in the feature dir, no
> code). Phases 2+ are the **build slice**, **gated on `G-runtime`** (DP-2 035
> runtime present) and therefore **not executed here**.

- **Phase 0 — research** (design): reuse map (RF-1/RF-2 primitives), the
  017/018/019 boundary, and the **runtime-vs-contract gate** (the four ops are
  contract-present / runtime-absent) → `research.md`.
- **Phase 1 — design** (design): render-side projections (`data-model.md`) and the
  four-op consumption boundary (`contracts/receivables-claims.md`, Markdown —
  **never** OpenAPI; DP-2 owns the contract).
- **Phase 2 — codegen** *(GATED on G-runtime)*: add the DP-2 `settlement/settlement.yaml`
  source to the codegen config at a pinned SHA; regenerate the client; confirm the
  four ops appear. Cannot run until DP-2 ships the runtime.
- **Phase 3 — data layer** *(GATED)*: typed wrappers + query keys + `mapReceivableError`
  (per-op documented statuses; 409 on submit/reconcile only; no 422/429); TanStack
  hooks; scope hook from `ActiveContextProvider`.
- **Phase 4 — surfaces** *(GATED)*: queue list (+ state/payer/store filters),
  inspect drawer, submit-claim confirm, reconcile-remittance form + result; route
  fragment mounted in `App.tsx`.
- **Phase 5 — tests** *(GATED)*: unit (error mapping, render, flows), boundary
  (VG-1..VG-4: no hand-written HTTP, only the four ops, no role-branching, no new
  egress), e2e + a11y.
- **Phase 6 — validation** *(GATED)*: typecheck / test / lint / boundary / regen-ops
  check, all green, before any merge.

## Reuse map (no new shared primitive)

| Need | Reused from |
| --- | --- |
| typed wrappers + error map | RF-2 `rf2-queries.ts` pattern |
| queue table | shared `DataTable` |
| inspect panel | shared `Drawer` |
| claim confirm step | shared `ConfirmDelete` pattern |
| states (loading / empty / error) | shared `ListState` / `Banner` |
| scope binding | `ActiveContextProvider` + `useStoreScope` pattern |
| route wiring | RF-2 route-fragment pattern + `App.tsx` |
| generated-client call surface | the existing `apiClient` (cookie transport) |

## Dependency & gate plan

- **Hard upstream:** DP-2 035 G2 contract (RATIFIED) → source of the four ops +
  field shapes. **DP-2 035 runtime/impl (`G-runtime`)** → **OPEN**; the build
  phases (2–6) do not start until it clears.
- **Sibling boundary:** disjoint from Console 017 (payer CRUD + apply-payment) and
  Console 019 (reconciliation). No shared mutable surface.
- **Rejection reuse:** DP-026 + Connector Arc A + POS-014 (no rejection UI built
  here).
- **Sequencing for the eventual build slice:** confirm `G-runtime` → Phase 2
  codegen at a pinned SHA → Phases 3–6. The owner approves the dispatch of that
  build slice; this plan does not dispatch it.

## Complexity tracking

> No Constitution violation requiring justification. The surface reuses existing
> primitives, adds no dependency, owns no state, and introduces no egress. The
> only "complexity" is the **design-ahead** posture, which is a sequencing
> consequence of the runtime-absent upstream (§Constitution / gate check), not an
> architecture deviation.

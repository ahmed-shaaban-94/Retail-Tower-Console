# Implementation Plan: Console Receivables & Insurance Claims

**Branch**: `018-console-receivables-and-insurance-claims` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-console-receivables-and-insurance-claims/spec.md`

> **Mode contract.** Specify plan. This plan sequences the Console
> receivable-tracking + claim/remittance surface against the **four named** DP-2
> 035 G2 ops, reusing the merged RF-1/RF-2 stack with zero new runtime dependency.
> It authorizes **no code now**: the DP-2 035 contract is RATIFIED **and its
> runtime is MERGED on DP-2 `origin/main` @ `cb44d4f`** (controller + services +
> `SettlementModule` @ `app.module.ts:222` + migration `0027`, verified
> 2026-06-16; §Constitution / gate check). The build phases are therefore gated on
> **018's own residuals — G-client + G-boundary**, not on a missing upstream
> runtime. Activation caveat: contract is `1.0.0-draft`; migration `0027`'s G3 is
> an open human review gate. It does NOT edit any OpenAPI, author a migration, add
> an egress, or open the 017/019 surfaces.

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

Like RF-4a, 018's four consumed ops are **runtime-merged** on DP-2 `origin/main`
(@ `cb44d4f`: `settlement.controller.ts` + services + `SettlementModule` @
`app.module.ts:222` + migration `0027`, verified 2026-06-16) — the upstream
runtime is **present**, not absent. 018 is nonetheless **not yet built**: the
codegen + data-layer + UI + test phases below are **planned and gated on 018's
own G-client + G-boundary** (generate the client → boundary test), plus the
activation caveat that the contract is `1.0.0-draft` and migration `0027`'s G3 is
an open human review gate. An earlier draft framed this as "runtime-absent /
design-ahead"; that was false — copied from `settlement.yaml`'s stale header
comment, not the source tree.

## Technical Context

**Language/Version**: TypeScript (React SPA), as established by the Console foundation slices.

**Primary Dependencies**: React, TanStack Query, `openapi-fetch` + generated client, react-router — **all already present** (no new dependency).

**Storage**: None owned. The Console holds no settlement state; all state is DP-2's, read/written via the generated client.

**Testing**: vitest (unit + boundary), Playwright (e2e + a11y) — the established Console stack.

**Target Platform**: Browser SPA (the admin Console).

**Project Type**: Web application — frontend only (this repo); the backend is DP-2 (separate repo, separate contract owner).

**Performance Goals**: Queue list renders the bounded backend page (`page_size` ≤ 200) with opaque keyset pagination; no client-side aggregation.

**Constraints**: cookie transport only (no `Authorization` header); render exact-decimal money strings (no float coercion); no frontend authorization branching; no new remote egress.

**Scale/Scope**: One route family, four consumed ops, ~four presentational surfaces; SPECIFY-phase, not yet built (residual: G-client + G-boundary; upstream runtime present @ `cb44d4f`).

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
- **DP-2 035 runtime (upstream precondition, PRESENT):** the four consumed ops
  have a live DP-2 controller — `settlement.controller.ts` + services +
  `SettlementModule` @ `app.module.ts:222` + migration `0027`, merged on
  `origin/main` @ `cb44d4f` (verified 2026-06-16). This is an **upstream
  precondition, not an 018 gate**, and it is **not a blocker**. Activation caveat:
  contract is `1.0.0-draft`; migration `0027`'s G3 is an open human review gate.
- **G-client + G-boundary (BLOCKING, NOT satisfied — the real residuals):** the
  DP-2 035 client is **not yet generated** into the Console (G-client) and the
  VG-1..VG-4 boundary test is **not yet authored** (G-boundary). These 018-owned
  gates are **OPEN** and block the codegen + build phases. **Not satisfied.**
- **No new dependency:** reuses TanStack Query, `openapi-fetch`, react-router.
  PASS **by design**.

> No 018 gate is marked satisfied. The upstream DP-2 035 **G2** is RATIFIED **and
> its runtime is merged** (@ `cb44d4f`) — both are preconditions, not 018 gates,
> and are not re-certified here. The earlier "no runtime / runtime-absent" framing
> came from `settlement.yaml`'s stale header comment (~line 13); trust the DP-2
> source tree, not that comment.

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
> build slice that runs once 018's own **G-client + G-boundary** clear (the
> upstream DP-2 035 runtime they consume is already present @ `cb44d4f`). Mirrors
> the RF-2 / RF-4a layout.

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
it). All paths above are **planned**; none is authored by this SPECIFY-phase
artifact (which is not yet built — residual G-client + G-boundary).

## Phases

> Phases 0–1 are design (authored as companion Markdown in the feature dir, no
> code). Phases 2+ are the **build slice**, **gated on 018's own G-client +
> G-boundary** (the DP-2 035 runtime it consumes is already present, @ `cb44d4f`)
> and therefore **not executed here**.

- **Phase 0 — research** (design): reuse map (RF-1/RF-2 primitives), the
  017/018/019 boundary, and the **runtime-vs-contract status** (the four ops are
  contract-present **and** runtime-present on DP-2 @ `cb44d4f`; the residual is
  018's own G-client + G-boundary) → `research.md`.
- **Phase 1 — design** (design): render-side projections (`data-model.md`) and the
  four-op consumption boundary (`contracts/receivables-claims.md`, Markdown —
  **never** OpenAPI; DP-2 owns the contract).
- **Phase 2 — codegen** *(GATED on G-client)*: add the DP-2 `settlement/settlement.yaml`
  source to the codegen config at a pinned SHA (the DP-2 035 runtime is present @
  `cb44d4f`, so a runtime-backed SHA exists); regenerate the client; confirm the
  four ops appear. This phase **is** the G-client step.
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
  field shapes. **DP-2 035 runtime/impl** → **PRESENT** (merged on `origin/main` @
  `cb44d4f`, verified 2026-06-16). The build phases (2–6) are gated on 018's own
  **G-client + G-boundary**, not on the upstream runtime. Activation caveat:
  contract `1.0.0-draft`; migration `0027` G3 = open human review gate.
- **Sibling boundary:** disjoint from Console 017 (payer CRUD + apply-payment) and
  Console 019 (reconciliation). No shared mutable surface.
- **Rejection reuse:** DP-026 + Connector Arc A + POS-014 (no rejection UI built
  here).
- **Sequencing for the eventual build slice:** Phase 2 codegen at a pinned
  runtime-backed SHA (this is G-client) → Phases 3–6 (G-boundary asserted in
  Phase 5). The owner approves the dispatch of that build slice; this plan does
  not dispatch it.

## Complexity tracking

> No Constitution violation requiring justification. The surface reuses existing
> primitives, adds no dependency, owns no state, and introduces no egress. The
> only "complexity" is that this is a **SPECIFY-phase, not-yet-built** artifact —
> a sequencing consequence of 018's own open residuals (**G-client + G-boundary**;
> the upstream DP-2 035 runtime it consumes is already present @ `cb44d4f`), not an
> architecture deviation.

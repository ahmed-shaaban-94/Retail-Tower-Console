# Implementation Plan: Console Settlement Reconciliation

**Branch**: `019-console-settlement-reconciliation` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/019-console-settlement-reconciliation/spec.md`

> **Mode contract.** Specify / design-ahead plan. This plan sequences the Console
> settlement-reconciliation surface (apply-payment settlement action + posting
> retry) against the **named** DP-2 035 G2 ops **plus** the DP-2 032 sale-sync-ops
> repair op, reusing the merged RF-1/RF-2 stack with zero new runtime dependency.
> It authorizes **no code now**: the DP-2 035 contract is RATIFIED but
> `1.0.0-draft` with **no runtime**, AND the DP-2 032 sale-sync-ops **end-to-end
> posting-retry (G7) wiring is unverified ⇒ treated as a blocker** — so the build
> phases are **gated on BOTH**. It does NOT edit
> any OpenAPI, author a migration, add an egress, or open the 017/018/POS-020
> surfaces.

---

## Summary

019 attaches a new content route family to the merged RF-1 shell, mirroring RF-2 /
RF-4a / 018 structure: a typed data layer (`settlement-recon-queries`), TanStack
Query hooks, and presentational surfaces (receivable queue list, inspect drawer,
apply-payment confirm form, posting-retry confirm action), wired by a route
fragment mounted in `App.tsx`. It consumes **three** generated ops from the DP-2
035 settlement client (`consoleApplyPayment` + the two receivable reads
`consoleGetReceivable` / `consoleListReceivables`) and **one** op from the DP-2 032
sale-sync-ops client (`consoleRepairSaleSync`), and reuses the shared presenters.
It introduces no new shared primitive and no new remote egress.

The load-bearing difference from 018: 018 carried **one** runtime gate (DP-2 035
impl absent). 019 carries **two** — the DP-2 035 ops are contract-present /
runtime-absent, **and** the DP-2 032 sale-sync-ops end-to-end posting-retry (G7)
wiring is unverified ⇒ treated as a blocker (the `consoleRepairSaleSync` controller
is present on DP-2 `main`, but the end-to-end path is not self-certified here — the
extra dependency that makes 019 the LAST child). So 019 is **design-ahead** — the
codegen + data-layer + UI + test phases below are **planned and gated on both
runtimes**, not executed.

## Technical Context

**Language/Version**: TypeScript (React SPA), as established by the Console foundation slices.

**Primary Dependencies**: React, TanStack Query, `openapi-fetch` + generated client(s), react-router — **all already present** (no new dependency).

**Storage**: None owned. The Console holds no settlement or sync state; all state is DP-2's, read/written via the generated client(s).

**Testing**: vitest (unit + boundary), Playwright (e2e + a11y) — the established Console stack.

**Target Platform**: Browser SPA (the admin Console).

**Project Type**: Web application — frontend only (this repo); the backend is DP-2 (separate repo, separate contract owner for BOTH `settlement.yaml` and `sale-sync-ops.yaml`).

**Performance Goals**: Queue list renders the bounded backend page (`page_size` ≤ 200) with opaque keyset pagination; no client-side aggregation.

**Constraints**: cookie transport only (no `Authorization` header) on both contracts; render exact-decimal money strings (no float coercion); send the receivable `version` on apply-payment; no frontend authorization branching; no new remote egress.

**Scale/Scope**: One route family; four consumed ops across two DP-2 contracts; ~four presentational surfaces; design-ahead (not yet built).

## Constitution Check

*GATE: must pass before any build phase. NONE is satisfied in this artifact.*

- **Principle 8 (single DP-2 call surface):** all calls via the generated
  client(s) (VG-1). PASS **by design** — no code yet.
- **Principle 7 (no frontend authorization):** no role-conditioned hiding (VG-3).
  PASS **by design**.
- **Op-scope boundary (VG-2):** the layer calls only the four named ops
  (`consoleApplyPayment` + two receivable reads + `consoleRepairSaleSync`); none of
  `consoleSubmitClaim` / `consoleReconcileRemittance` (018) /
  `consoleCreatePayerAccount` / `consoleListPayerAccounts` (017) /
  `posRecordSettlementIntent` (POS-020). PASS **by design**; asserted by a boundary
  test in the build slice.
- **No new egress (VG-4 / architecture invariant):** no new remote target; the
  posting retry is server-mediated by DP-2 032, not a direct ERPNext call. PASS
  **by design**.
- **G-runtime-035 (BLOCKING, NOT satisfied):** the three consumed settlement ops
  have **no DP-2 controller** at any codegen pin (contract is `1.0.0-draft`). OPEN;
  blocks codegen + build. **Not satisfied.**
- **G-runtime-032 / G7 (BLOCKING, NOT satisfied — the EXTRA 019 gate):** the DP-2
  032 `consoleRepairSaleSync` controller route is **present on DP-2 `main`**
  (verified: `SaleSyncOpsController`, `POST .../sales/{saleRef}/repair`), so the
  runtime is **not flatly absent**; but the **end-to-end posting-retry (G7) wiring
  is unverified** and 019 does not self-certify it. Per the gate rule (uncertain ⇒
  blocker) this is **treated as a blocker**, confirmed at build time before codegen.
  Blocks the posting-retry build. **Not satisfied.**
- **No new dependency:** reuses TanStack Query, `openapi-fetch`, react-router.
  PASS **by design**.

> No 019 gate is marked satisfied. The upstream DP-2 035 **G2** is RATIFIED
> (precondition); it is not an 019 gate and is not re-certified here.

## Project Structure

### Documentation (this feature)

```text
specs/019-console-settlement-reconciliation/
├── plan.md              # This file
├── spec.md              # /specify + /clarify output
├── research.md          # Phase 0 — reuse + boundary + TWO-runtime-gate decisions (build-slice)
├── data-model.md        # Phase 1 — render-side projections (no owned model)
├── contracts/
│   └── settlement-recon.md   # Phase 1 — the 4-op (two-contract) consumption boundary (Markdown; NOT OpenAPI)
└── tasks.md             # /tasks output (planning granularity)
```

### Source Code (repository root)

> **Planned, NOT created in this artifact.** Concrete paths are sequenced for the
> build slice that runs only once BOTH `G-runtime-035` and `G-runtime-032` clear.
> Mirrors the RF-2 / RF-4a / 018 layout.

```text
src/
├── lib/
│   └── settlement-recon-queries.ts    # typed wrappers + query keys + error maps (planned)
├── settlement/
│   ├── useSettlementReconQueries.ts   # TanStack hooks (planned)
│   ├── useSettlementScope.ts          # active tenant/store from ActiveContextProvider (planned)
│   ├── ReceivableSettlementList.tsx   # queue table + state/payer/store filters (planned)
│   ├── ReceivableInspectDrawer.tsx    # Receivable projection (planned)
│   ├── ApplyPayment.tsx               # confirm-step apply-payment (amount + version) (planned)
│   └── PostingRetry.tsx               # confirm-step consoleRepairSaleSync action (planned)
└── shell/
    └── rf019Routes.tsx                # route fragment, mounted in App.tsx (planned)

tests/
├── unit/                              # error mapping, list/inspect render, apply/retry flows, boundary (planned)
└── e2e/                              # queue → inspect → apply-payment → posting-retry journey + a11y (planned)
```

**Structure Decision**: Web frontend, single route family attached to the RF-1
shell — the established Console pattern. No backend code in this repo (DP-2 owns
both the settlement and sale-sync-ops contracts). All paths above are **planned**;
none is authored by this design-ahead artifact.

## Phases

> Phases 0–1 are design (authored as companion Markdown in the feature dir, no
> code). Phases 2+ are the **build slice**, **gated on BOTH `G-runtime-035` and
> `G-runtime-032`** and therefore **not executed here**.

- **Phase 0 — research** (design): reuse map (RF-1/RF-2 primitives), the
  017/018/019 boundary (incl. the **apply-payment ownership correction**, §2.1 of
  spec), and the **two-runtime-gate** posture (035 ops contract-present /
  runtime-absent; 032 end-to-end posting-retry G7 wiring unverified ⇒ blocker,
  controller present on `main`) → `research.md`.
- **Phase 1 — design** (design): render-side projections (`data-model.md`) and the
  four-op, two-contract consumption boundary (`contracts/settlement-recon.md`,
  Markdown — **never** OpenAPI; DP-2 owns both contracts).
- **Phase 2 — codegen** *(GATED on BOTH runtimes)*: add the DP-2
  `settlement/settlement.yaml` AND `sale-sync-ops/sale-sync-ops.yaml` sources to
  the codegen config at pinned SHAs (the SHAs at which DP-2 has shipped the 035
  runtime AND the 032 end-to-end posting-retry path is confirmed wired, G7);
  regenerate the client(s); confirm the four ops appear. Cannot run until BOTH
  conditions are verified at build time.
- **Phase 3 — data layer** *(GATED)*: typed wrappers + query keys +
  `mapSettlementError` / `mapRepairError` (per-op documented statuses; 409 on
  apply-payment + repair only; no 422/429); TanStack hooks; scope hook from
  `ActiveContextProvider`.
- **Phase 4 — surfaces** *(GATED)*: queue list (+ state/payer/store filters),
  inspect drawer, apply-payment confirm form (amount + last-observed version),
  posting-retry confirm action; route fragment mounted in `App.tsx`.
- **Phase 5 — tests** *(GATED)*: unit (error mapping, render, flows incl. 409
  over-application / stale-version / repair-conflict), boundary (VG-1..VG-4: no
  hand-written HTTP, only the four ops, no role-branching, no new egress), e2e +
  a11y.
- **Phase 6 — validation** *(GATED)*: typecheck / test / lint / boundary / regen-ops
  check, all green, before any merge.

## Reuse map (no new shared primitive)

| Need | Reused from |
| --- | --- |
| typed wrappers + error map | RF-2 `rf2-queries.ts` pattern (+ 018 `receivables-queries`) |
| receivable queue table | shared `DataTable` |
| inspect panel | shared `Drawer` |
| apply-payment / posting-retry confirm step | shared `ConfirmDelete` pattern |
| states (loading / empty / error) | shared `ListState` / `Banner` |
| scope binding | `ActiveContextProvider` + `useStoreScope` pattern |
| route wiring | RF-2 route-fragment pattern + `App.tsx` |
| generated-client call surface | the existing `apiClient` (cookie transport) — extended to the 032 client |

## Dependency & gate plan

- **Hard upstream (contract):** DP-2 035 G2 contract (RATIFIED) → source of
  `consoleApplyPayment` + the two receivable reads + field shapes. DP-2 032
  sale-sync-ops contract (present at `1.0.0-draft`; ratification status per DP-2,
  not certified here) → source of `consoleRepairSaleSync`.
- **Hard upstream (runtime):** **DP-2 035 runtime/impl (`G-runtime-035`)** →
  **OPEN** (verified absent from the 035 contract text). **DP-2 032 end-to-end
  posting-retry wiring (`G-runtime-032` / G7)** → **OPEN (unverified ⇒ blocker)**:
  the `consoleRepairSaleSync` controller is present on DP-2 `main`, but the
  end-to-end G7 path is not self-certified here. The build phases (2–6) do not start
  until **both** clear — 019 is the only 035 child with the second runtime gate.
- **Sibling boundary:** disjoint **write** surfaces from Console 017 (payer CRUD)
  and Console 018 (claim/remittance writes). 019 shares only receivable **reads**
  with 018; no shared mutable surface.
- **Reversal reuse:** DP-026 + Connector Arc A + POS-014 (no reversal UI built
  here; posting retry is a sync re-queue, not a reversal).
- **Sequencing for the eventual build slice:** confirm `G-runtime-035` **and**
  `G-runtime-032` → Phase 2 codegen at pinned SHAs → Phases 3–6. The owner
  approves the dispatch of that build slice; this plan does not dispatch it.

## Complexity Tracking

> No Constitution violation requiring justification. The surface reuses existing
> primitives, adds no dependency, owns no state, and introduces no egress. The
> only "complexity" is the **design-ahead** posture with **two** blocking runtime
> gates, which is a sequencing consequence of the runtime-absent 035 impl and the
> unverified 032 end-to-end posting-retry (G7) wiring (§Constitution Check), not an
> architecture deviation.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |

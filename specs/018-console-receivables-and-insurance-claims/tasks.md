# Tasks — Console Receivables & Insurance Claims (018)

Generated from [plan.md](./plan.md). **Planning granularity** — these tasks define
the **contract-consuming work** (which ops, which boundaries, which gates), not
implementation steps that write code. No task is checked; nothing here is built,
dispatched, or run.

> **Design-ahead posture.** The build phases (T-codegen onward) are **GATED on
> `G-runtime`** — DP-2 must implement the 035 contract runtime for the four
> consumed ops before any build begins. Until then the design phases (research /
> data-model / contracts-boundary) are the only authorable work, and they author
> Markdown only — never OpenAPI, code, or a migration.

## Phase 0 — Design: research & boundary (authorable now; Markdown only)

- [ ] T001 Author `research.md`: record the reuse map (RF-1/RF-2 primitives,
  shared presenters) and the **017/018/019 boundary** decision — 018 owns
  receivable-tracking + claim/remittance; 017 owns payer CRUD + `consoleApplyPayment`;
  019 owns cross-receivable reconciliation. No code.
- [ ] T002 In `research.md`, record the **runtime-vs-contract gate** (load-bearing):
  the four consumed ops are **contract-present** in `settlement/settlement.yaml`
  (`1.0.0-draft`) but **runtime-absent** on DP-2 (no controller). State that this
  inverts 007's gate and makes 018 design-ahead; define the `G-runtime` blocking
  gate.
- [ ] T003 In `research.md`, confirm the consumed-vs-NOT-consumed op partition
  against the contract and record the inline reason for each excluded op
  (`consoleApplyPayment`, `consoleCreatePayerAccount`, `consoleListPayerAccounts`
  → 017; `posRecordSettlementIntent` → POS-020).

## Phase 1 — Design: data-model & consumption boundary (authorable now; Markdown only)

- [ ] T004 Author `data-model.md`: the **render-side projections only** —
  `Receivable` (fields `receivableRef` / `saleRef` / `payerRef` /
  `outstandingBalance` / `state` / `version` / `taxPlaceholder` /
  `erpnextPaymentEntryRef`), `ReceivableState` (five non-reversal values),
  `Claim`, `ReconciliationResult`. State that 018 **owns no model**; field shapes
  belong to the DP-2 035 G2 contract.
- [ ] T005 Author `contracts/receivables-claims.md` (**Markdown design doc, NOT
  OpenAPI**): the four-op consumption boundary — for each of `consoleGetReceivable`
  / `consoleListReceivables` / `consoleSubmitClaim` / `consoleReconcileRemittance`,
  record method+path, request/response projection consumed, and the **exact
  documented status set** (get/list: 400/401/403/404/500; submit/reconcile add
  **409**; no 422/429). Note that DP-2 owns and may not be edited.
- [ ] T006 In `contracts/receivables-claims.md`, record the **auth surface**
  (`cookieAuth` human session only; no `Authorization`/`Bearer`; not the POS
  `operatorAuthorization` envelope) and the **safe-404** non-disclosing isolation
  (FR-018-008/009).

## Phase 2 — Codegen *(GATED on G-runtime — do NOT start until DP-2 035 runtime lands)*

- [ ] T007 *(gated)* Add the DP-2 `settlement/settlement.yaml` source to the
  Console codegen config at a **pinned codegen SHA** (the SHA at which DP-2 has
  shipped the 035 runtime); regenerate the generated client.
- [ ] T008 *(gated)* Confirm the four consumed ops
  (`consoleGetReceivable` / `consoleListReceivables` / `consoleSubmitClaim` /
  `consoleReconcileRemittance`) appear in the generated client types, and that the
  other four settlement ops, though generated whole, are **not** wired by 018.

## Phase 3 — Data layer *(GATED on G-runtime)*

- [ ] T009 *(gated)* Typed wrappers over the four ops (read one / list / submit
  claim / reconcile remittance) + query keys, mirroring the RF-2 typed data-layer
  pattern. Cookie transport; no hand-written HTTP (VG-1).
- [ ] T010 *(gated)* `mapReceivableError`: per-op documented statuses exactly
  (409 on submit/reconcile only; non-disclosing 404; no 422/429), with a
  no-undocumented-status assertion (FR-018-009).
- [ ] T011 *(gated)* TanStack hooks (list / inspect / submit-claim /
  reconcile-remittance) returning result-encoded errors; scope hook reading active
  tenant/store from `ActiveContextProvider` (no context/membership mutation).

## Phase 4 — Surfaces *(GATED on G-runtime)*

- [ ] T012 *(gated)* Receivable **queue list**: shared `DataTable` + state/payer/store
  filter row + `ListState`/`Banner`; opaque `nextCursor` pagination; backend-scoped
  page rendered as-is (no client-side authorization filter, VG-3).
- [ ] T013 *(gated)* Receivable **inspect drawer**: shared `Drawer` rendering the
  `Receivable` projection (money as exact-decimal string, no float coercion);
  `saleRef` display-only, never mutated.
- [ ] T014 *(gated)* **Submit-claim** action: confirm step (shared `ConfirmDelete`
  pattern) sending `payerRef` + `receivableRefs` (1..500); required `Idempotency-Key`;
  invalidate queue on success; affected rows reflect `claimed` from the response.
- [ ] T015 *(gated)* **Reconcile-remittance** form: enter `remittedAmount`
  (+ optional `remittanceRef`) against a `claimRef`; required `Idempotency-Key`;
  render `ReconciliationResult` (`settled`/`partial`/`flagged`). **No rejection UI**
  — rejection routes to DP-026 + Connector Arc A + POS-014 (FR-018-006).
- [ ] T016 *(gated)* Route fragment for the 018 family; mount in `App.tsx` behind
  the RF-1 auth shell.

## Phase 5 — Tests *(GATED on G-runtime)*

- [ ] T017 *(gated)* Unit: `mapReceivableError` per-op status coverage +
  no-undocumented-status assertion.
- [ ] T018 *(gated)* Unit: queue renders rows / empty / 404 banner; filter re-keys;
  inspect renders the projection.
- [ ] T019 *(gated)* Unit: claim-submit and remittance-reconcile flows, including
  the 409 (stale `version` / not-in-reconcilable-state / `idempotency_key_conflict`)
  inline rendering.
- [ ] T020 *(gated)* **Boundary test** (VG-1..VG-4): no hand-written
  `fetch`/`axios`/`Bearer`; calls **only** the four named ops (none of
  `consoleApplyPayment` / `consoleCreatePayerAccount` / `consoleListPayerAccounts` /
  `posRecordSettlementIntent`, no context/membership mutator); no role-conditioned
  hiding; **no new remote egress**.
- [ ] T021 *(gated)* E2E + a11y: queue → inspect → submit-claim → reconcile journey.

## Phase 6 — Validation *(GATED on G-runtime)*

- [ ] T022 *(gated)* Typecheck + build green.
- [ ] T023 *(gated)* Unit + boundary tests green.
- [ ] T024 *(gated)* Lint green; regen-ops check confirms the four ops only are
  wired. Owner approval required before any merge/dispatch of the build slice.

## Out-of-scope reminders (do NOT add tasks for these)

- `consoleApplyPayment` (cash application) — Console **017**.
- `consoleCreatePayerAccount` / `consoleListPayerAccounts` (payer CRUD) — Console **017**.
- `posRecordSettlementIntent` (intent capture) — **POS-020**.
- Cross-receivable settlement-reconciliation — Console **019**.
- Any reversal / void / refund / **insurance-rejection** workflow — reuse
  DP-026 + Connector Arc A + POS-014.
- Editing `settlement/settlement.yaml` or any OpenAPI — **DP-2 owns the contract**.
- Any insurer API / remittance-file import / **new egress** — manual adjudication
  entry only (OQ-3 v1).
- Any ERPNext call — forbidden by the architecture invariant.

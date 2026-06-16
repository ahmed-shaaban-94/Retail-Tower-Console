# Tasks — Console Settlement Reconciliation (019)

Generated from [plan.md](./plan.md). **Planning granularity** — these tasks define
the **contract-consuming work** (which ops, which boundaries, which gates), not
implementation steps that write code. No task is checked; nothing here is built,
dispatched, or run.

> **Design-ahead posture — TWO blocking runtime gates.** The build phases
> (T-codegen onward) are **GATED on BOTH `G-runtime-035` AND `G-runtime-032`/G7**:
> DP-2 must (a) implement the 035 contract runtime for `consoleApplyPayment` + the
> two receivable reads, **and** (b) confirm the 032 end-to-end posting-retry (G7)
> path is wired so `consoleRepairSaleSync` runs end-to-end — the
> `consoleRepairSaleSync` controller is already present on DP-2 `main`, but the
> end-to-end G7 path is unverified ⇒ treated as a blocker — before any build begins.
> 019 is the only 035 child carrying the second runtime gate. Until both clear, only
> the design
> phases (research / data-model / contracts-boundary) are authorable, and they
> author Markdown only — never OpenAPI, code, or a migration.

## Phase 0 — Design: research & boundary (authorable now; Markdown only)

- [ ] T001 Author `research.md`: record the reuse map (RF-1/RF-2 primitives, shared
  presenters, the 018 `receivables-queries` pattern) and the **017/018/019
  boundary** decision — 017 owns payer CRUD; 018 owns the claim/remittance writes
  + receivable reads; 019 owns the **apply-payment settlement action** +
  **posting retry**, sharing only receivable **reads** with 018. No code.
- [ ] T002 In `research.md`, record the **apply-payment ownership correction**
  (load-bearing, spec §2.1): the neighbor 018 prose attributed `consoleApplyPayment`
  to 017, but 017's SPECIFY artifact consumes only the two payer-CRUD ops and
  excludes apply-payment — the op was effectively unassigned; this dispatch assigns
  it to 019. Note 018's apply-payment prose is now stale.
- [ ] T003 In `research.md`, record the **two-runtime-gate** posture (load-bearing):
  the three consumed 035 ops are **contract-present** in `settlement/settlement.yaml`
  (`1.0.0-draft`) but **runtime-absent** on DP-2 (verified from the 035 contract
  text); AND the 032 `consoleRepairSaleSync` **controller is present on DP-2 `main`**
  (verified) but its **end-to-end posting-retry (G7) wiring is unverified ⇒ treated
  as a blocker** (gate rule: uncertain ⇒ blocker). Define both blocking gates
  (`G-runtime-035`, `G-runtime-032`) and state 019 cannot build until BOTH clear.
- [ ] T004 In `research.md`, confirm the consumed-vs-NOT-consumed op partition
  against BOTH contracts and record the inline reason for each excluded op
  (`consoleSubmitClaim` / `consoleReconcileRemittance` → 018; `consoleCreatePayerAccount`
  / `consoleListPayerAccounts` → 017; `posRecordSettlementIntent` → POS-020), plus
  the rule that shared receivable **reads** are permitted (only writes are
  single-owned).

## Phase 1 — Design: data-model & consumption boundary (authorable now; Markdown only)

- [ ] T005 Author `data-model.md`: the **render-side projections only** —
  `Receivable` (fields `receivableRef` / `saleRef` / `payerRef` /
  `outstandingBalance` / `state` / `version` / `taxPlaceholder` /
  `erpnextPaymentEntryRef`), `ReceivableState` (five non-reversal values),
  `PaymentApplicationCreate` (`amount` + `version` + optional `note`), and
  `SaleSyncStatus` (the 032 posting-retry result). State that 019 **owns no
  model**; field shapes belong to the DP-2 035 / 032 contracts.
- [ ] T006 Author `contracts/settlement-recon.md` (**Markdown design doc, NOT
  OpenAPI**): the four-op, two-contract consumption boundary — for each of
  `consoleApplyPayment` / `consoleGetReceivable` / `consoleListReceivables`
  (035) and `consoleRepairSaleSync` (032), record method+path, request/response
  projection consumed, and the **exact documented status set** (reads:
  400/401/403/404/500; apply-payment + repair add **409**; no 422/429). Note that
  DP-2 owns both contracts and neither may be edited.
- [ ] T007 In `contracts/settlement-recon.md`, record the **auth surface**
  (`cookieAuth` human session only on both contracts; no `Authorization`/`Bearer`;
  not the POS `operatorAuthorization` envelope), the **apply-payment optimistic
  concurrency** requirement (send last-observed `version`; stale → 409), the
  **over-application** 409, the **repair-conflict** 409, and the **safe-404**
  non-disclosing isolation (FR-019-008/009).

## Phase 2 — Codegen *(GATED on BOTH runtimes — do NOT start until DP-2 035 runtime lands AND the 032 end-to-end posting-retry G7 wiring is verified)*

- [ ] T008 *(gated)* Add the DP-2 `settlement/settlement.yaml` source to the Console
  codegen config at a **pinned codegen SHA** (the SHA at which DP-2 has shipped the
  035 runtime); regenerate the generated client.
- [ ] T009 *(gated)* Add the DP-2 `sale-sync-ops/sale-sync-ops.yaml` source to the
  codegen config at a **pinned codegen SHA** (the SHA at which the 032 end-to-end
  posting-retry path is **confirmed wired**, G7 — the `consoleRepairSaleSync`
  controller is already on `main`; verify the end-to-end path at build time);
  regenerate.
- [ ] T010 *(gated)* Confirm the four consumed ops (`consoleApplyPayment` /
  `consoleGetReceivable` / `consoleListReceivables` / `consoleRepairSaleSync`)
  appear in the generated client types, and that the other settlement ops, though
  generated whole, are **not** wired by 019.

## Phase 3 — Data layer *(GATED on BOTH runtimes)*

- [ ] T011 *(gated)* Typed wrappers over the four ops (read one / list / apply-payment
  / repair-sale-sync) + query keys, mirroring the RF-2 / 018 typed data-layer
  pattern. Cookie transport on both contracts; no hand-written HTTP (VG-1).
- [ ] T012 *(gated)* `mapSettlementError` + `mapRepairError`: per-op documented
  statuses exactly (409 on apply-payment + repair only — over-application /
  stale `version` / `repair_conflict` / `idempotency_key_conflict`; non-disclosing
  404; no 422/429), with a no-undocumented-status assertion (FR-019-009).
- [ ] T013 *(gated)* TanStack hooks (list / inspect / apply-payment / posting-retry)
  returning result-encoded errors; scope hook reading active tenant/store from
  `ActiveContextProvider` (no context/membership mutation).

## Phase 4 — Surfaces *(GATED on BOTH runtimes)*

- [ ] T014 *(gated)* Receivable **queue list**: shared `DataTable` + state/payer/store
  filter row + `ListState`/`Banner`; opaque `nextCursor` pagination; backend-scoped
  page rendered as-is (no client-side authorization filter, VG-3).
- [ ] T015 *(gated)* Receivable **inspect drawer**: shared `Drawer` rendering the
  `Receivable` projection (money as exact-decimal string, no float coercion; show
  `version`); `saleRef` display-only, never mutated.
- [ ] T016 *(gated)* **Apply-payment** action: confirm step (shared `ConfirmDelete`
  pattern) sending `amount` + last-observed `version` against a `receivableRef`;
  required `Idempotency-Key`; invalidate queue on success; render the advanced
  receivable state. Over-application and stale `version` render the inline 409.
- [ ] T017 *(gated)* **Posting-retry** action: confirm step calling
  `consoleRepairSaleSync` against a `saleRef` (path + `Idempotency-Key`, **no
  body**); render the returned `SaleSyncStatus`; a non-repairable sale renders the
  inline `409 repair_conflict`. **No reversal UI**, **no POS-local override** —
  reversal reuses DP-026 + Connector Arc A + POS-014 (FR-019-006).
- [ ] T018 *(gated)* Route fragment for the 019 family; mount in `App.tsx` behind
  the RF-1 auth shell.

## Phase 5 — Tests *(GATED on BOTH runtimes)*

- [ ] T019 *(gated)* Unit: `mapSettlementError` / `mapRepairError` per-op status
  coverage + no-undocumented-status assertion.
- [ ] T020 *(gated)* Unit: queue renders rows / empty / 404 banner; filter re-keys;
  inspect renders the projection (money string, version).
- [ ] T021 *(gated)* Unit: apply-payment flow (partial → `partially_applied`,
  clearing → `settled`) including the 409 over-application + stale-`version` inline
  rendering; posting-retry flow including the `409 repair_conflict` inline rendering.
- [ ] T022 *(gated)* **Boundary test** (VG-1..VG-4): no hand-written
  `fetch`/`axios`/`Bearer`; calls **only** the four named ops (none of
  `consoleSubmitClaim` / `consoleReconcileRemittance` / `consoleCreatePayerAccount` /
  `consoleListPayerAccounts` / `posRecordSettlementIntent`, no context/membership
  mutator); no role-conditioned hiding; **no new remote egress**.
- [ ] T023 *(gated)* E2E + a11y: queue → inspect → apply-payment → posting-retry
  journey.

## Phase 6 — Validation *(GATED on BOTH runtimes)*

- [ ] T024 *(gated)* Typecheck + build green.
- [ ] T025 *(gated)* Unit + boundary tests green.
- [ ] T026 *(gated)* Lint green; regen-ops check confirms the four ops only are
  wired across the two clients. Owner approval required before any merge/dispatch of
  the build slice.

## Out-of-scope reminders (do NOT add tasks for these)

- `consoleCreatePayerAccount` / `consoleListPayerAccounts` (payer CRUD) — Console **017**.
- `consoleSubmitClaim` / `consoleReconcileRemittance` (claim/remittance writes) — Console **018**.
- `posRecordSettlementIntent` (intent capture) — **POS-020**.
- Any reversal / void / refund / **insurance-rejection** workflow — reuse
  DP-026 + Connector Arc A + POS-014. Posting retry is a sync re-queue, not a reversal.
- Any **POS-local repair override** — repair is Console-mediated only (DP-2 032).
- Editing `settlement/settlement.yaml`, `sale-sync-ops/sale-sync-ops.yaml`, or any
  OpenAPI — **DP-2 owns both contracts**.
- Any new egress / direct ERPNext call — forbidden by the architecture invariant
  (the posting retry is server-mediated by DP-2, not a Console→ERPNext call).
- Any build before BOTH the DP-2 035 runtime exists AND the DP-2 032 end-to-end
  posting-retry (G7) wiring is verified (§3.4 of spec).

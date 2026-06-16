# Tasks: Console — Customer & Payer Accounts

**Input**: Design documents from `specs/017-console-customer-and-payer-accounts/`
**Prerequisites**: plan.md (required), spec.md (clarified CLARIFY pass 2026-06-16), and the PLAN companion artifacts (`research.md`, `data-model.md`, `contracts/console-payer-accounts.md`)

> **⛔ GATE BANNER — READ BEFORE EXECUTING ANY TASK.** This is the 3rd FR-008
> gate input, **not** authorization to write code. No task below may be executed
> as implementation until the foundation FR-008 five-gate is explicitly approved
> for slice 017 (spec + plan + tasks + API map + validation gates). 017 adds
> **no** new runtime dependency (it reuses the foundation/RF-1 stack), so there is
> no new-dependency sub-gate — but the generated client MUST be regenerated at the
> DP-2 pin to expose the **two** settlement payer-account ops first. Until the gate
> clears, `tasks.md` is a **plan of record**. Generating it does not start
> implementation. The settlement contract is owned by **DP-2 035**; 017 authors no
> OpenAPI YAML and regenerates the client only from the ratified `settlement.yaml`.

**Status**: Proposed / Draft. Nothing below is built, done, or dispatched.

**Tests**: Two validation gates are named (VG-1 unit, VG-2 E2E journeys) as FR-008
inputs — defined here, **executed only after the gate clears**, and only against an
approved mock of the DP-2 contract, never live DP-2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: `[USn]` ≡ spec.md User Story n (US1 = create, US2 = list)
- **[SHARED]**: touches a file shared with sibling Console slices — sequence,
  never two slices at once (`src/App.tsx`, the shell nav, `src/lib/client.ts`,
  `openapi-ts.config.ts`)
- Granularity is **SPECIFY/PLAN level**: these tasks define the contract-consuming
  work and its gates. They are a plan of record, not code-writing steps; no task
  emits code, OpenAPI, or a migration in this artifact.

## Consumed contract boundary (the whole of 017)

| operationId | Surface | Schema |
| --- | --- | --- |
| `consoleCreatePayerAccount` | US1 create | `PayerAccountCreate` → `PayerAccount` |
| `consoleListPayerAccounts` | US2 list | query → `PayerAccountPage` |

**Exactly these two. No receivable / claim / reconciliation / POS-intent / connector
op** (those are Console 018/019, POS-020, Connector 009 — spec §7 Non-Goals).

---

## Phase 1: Gate & Boundary (Shared Prerequisites)

**Purpose**: Confirm the upstream precondition + pin the consumption boundary. Blocks everything.

- [ ] T001 Confirm upstream **DP-2 035 G2 is RATIFIED** (PR #574, `cb4a7e5`, owner-approved — spec §8) and record the exact DP-2 pin the generated client will be built from, in `api-readiness.md`. If G2 is not verifiable as ratified, **STOP** (CON-G3).
- [ ] T002 Confirm the foundation FR-008 gate for slice 017 is recorded before any implementation task runs. If not approved, `tasks.md` stays a plan of record — do **not** start implementation (CON-G5).
- [ ] T003 [P] Pin the **two** consumed operationIds + their schemas (`PayerAccountCreate`, `PayerAccount`, `PayerAccountPage`, `PayerCategory` enum `credit_customer|corporate|insurer`) and the error mapping (400/401/403/409/500) in `contracts/console-payer-accounts.md` — **consume-only**, no YAML authored (CON-G1).
- [ ] T004 [P] Verify the reused foundation primitives are present (router, TanStack Query cache, `openapi-fetch` typed-op wrappers, shared `Banner`/`InlineError`, `ActiveContextProvider`) and cite each at file:line in `research.md`; assert **no new runtime dependency** (CON-G4).

**Checkpoint**: G2 precondition verified, boundary pinned to 2 ops, foundation reuse confirmed.

---

## Phase 2: Foundational (Blocking Prerequisites — definition only)

**Purpose**: Define the shared client wrappers + query wiring + idempotency shape every surface depends on. **Definition / design tasks** — code is written only after the FR-008 gate.

- [ ] T005 [SHARED] Specify the **two** typed op wrappers to add to `src/lib/client.ts` in the existing `{ status, data, error }` shape: `consoleCreatePayerAccount`, `consoleListPayerAccounts`. `consoleCreatePayerAccount` MUST send a client-generated `Idempotency-Key` header (FR-005). Document the wrapper signatures in `contracts/console-payer-accounts.md`; do **not** hand-edit the generated client.
- [ ] T006 Specify the payer-account read query + invalidation: `consoleListPayerAccounts` keyed by active tenant + `category` filter + opaque cursor; a successful create invalidates + re-fetches the list (no optimistic mutation). Document in `data-model.md` (render-side projection only — 017 owns no store of record; spec §9).
- [ ] T007 Specify the create **idempotency** design (OQ-CON-IDEMPOTENCY): generate a stable per-submission `Idempotency-Key` (UUID) and replay the same key on retry of the same submission, so a double-submit never creates two accounts (G5/FR-020). Define the 409-conflict handling (deterministic, non-disclosing). Record in `contracts/console-payer-accounts.md`.
- [ ] T008 Specify the identity/access posture (`cookieAuth` human session + `Management`-family RBAC) and the **payer = record, not principal** rule (OQ-1); confirm 017 sends **no** `tenant_id`/actor (server-resolved) and uses **no** operator/connector credential (FR-011/FR-012; spec §6).

**Checkpoint**: Wrapper, query, idempotency, and access design defined and recorded — ready for surface design.

---

## Phase 3: US1 — Create payer account (Priority: P1) 🎯 MVP

**Goal**: Define the create-payer-account surface that calls `consoleCreatePayerAccount` (spec US1).

**Independent Test**: Given a mocked `consoleCreatePayerAccount`, a valid `PayerAccountCreate` (category + displayName) yields a rendered `PayerAccount`; a same-key replay yields one account; a 409 surfaces deterministically.

- [ ] T009 [US1] Define the create form: `category` (enum select), `displayName` (1..200, required), optional `externalRef`, optional `storeId` (null = tenant-wide), `creditTerms` carried as opaque placeholder (FR-004; **no** credit-terms/tax field invented — spec §7 NG-8). Record fields exactly as `PayerAccountCreate` defines them in `data-model.md`.
- [ ] T010 [US1] Define the success path: render the returned `PayerAccount` projection (`payerRef`, `category`, `displayName`, `externalRef`, `status`, `storeId`, `version`); `status`/`version` are **read-only** in v1 (OQ-CON-EDIT / FR-009 — no update/suspend op fabricated).
- [ ] T011 [US1] Define the error/edge handling: 400 validation → `InlineError`; 401/403 → session/RBAC; 409 (idempotency/version) → deterministic non-disclosing banner; cross-tenant → backend safe-404 (FR-013; spec §4 Edge Cases). No active tenant → route to scope chooser before calling.
- [ ] T012 [US1] **(VG-1)** Define the unit-test plan for the create reduction + state matrix (default/submitting/error/success/replay) — to run post-gate against a mock.
- [ ] T013 [US1] **(VG-2)** Define the E2E journey: open create → submit valid → `PayerAccount` rendered + list re-fetch; duplicate submit → single account (replay) — to run post-gate against a mock.

**Checkpoint**: Create surface fully defined against the consumed contract; independently reviewable.

---

## Phase 4: US2 — List & filter payer accounts (Priority: P2)

**Goal**: Define the list surface that calls `consoleListPayerAccounts` (spec US2).

**Independent Test**: Given a mocked `consoleListPayerAccounts`, the list renders a newest-first `PayerAccountPage`; the `category` filter and keyset pagination follow the contract; a null `nextCursor` is the last page.

- [ ] T014 [US2] Define the list table rendering the `PayerAccount` projection newest-first; empty-state for a tenant with zero accounts (not an error; spec §4 Edge Cases).
- [ ] T015 [US2] Define the **keyset pagination**: pass the prior page's `nextCursor` as `cursor`; treat null `nextCursor` as the last page; `page_size` within the contract bounds (1..200) (FR-007).
- [ ] T016 [US2] Define the `category` filter (`credit_customer|corporate|insurer`) passed to the server; any free-text `displayName` search is a **client-side** affordance over the returned page only (OQ-CON-LIST-FILTER) — no client-invented server filter.
- [ ] T017 [US2] [SHARED] Specify the protected route registration + un-gating the payer-accounts entry in the shell nav (`src/App.tsx` + shell nav array) — sequence vs sibling slices.
- [ ] T018 [US2] **(VG-1/VG-2)** Define the unit + E2E plans for list render, category filter, and cursor pagination — to run post-gate against a mock.

**Checkpoint**: List surface fully defined; create + list together form the 017 MVP.

---

## Phase 5: Boundary & Honesty Verification

**Purpose**: Prove 017 stayed inside its two-operation boundary and made no over-claim.

- [ ] T019 [P] Verify 017 consumes **exactly** `consoleCreatePayerAccount` + `consoleListPayerAccounts` and **zero** other settlement ops (SC-001) — no receivable/claim/reconciliation/POS-intent/connector op leaked in (spec §7).
- [ ] T020 [P] Verify 017 authors **zero** OpenAPI YAML, migration, or backend logic and integrates only through the generated DP-2 client, never ERPNext directly (SC-004; FR-010/FR-014).
- [ ] T021 [P] Verify the actor/identity decision holds: payer = account record (not principal), surface operated by the Console admin via `cookieAuth` (not the cashier) (SC-005; OQ-1/OQ-7-applied).
- [ ] T022 [P] Verify the claim ceiling: **none** of Console 017's own gates (CON-G1..G5) are marked satisfied; upstream DP-2 035 G2 is reported as a verified dependency only (spec §10).

**Checkpoint**: Boundary, ownership, identity, and status-honesty all verified before any gate request.

---

## Dependencies & Sequencing

```text
Phase 1 (gate + boundary)
        │
        ▼
Phase 2 (wrappers / query / idempotency / access — definition)
        │
        ├──► Phase 3 (US1 create)  ─┐
        │                           ├──► Phase 5 (boundary & honesty verification)
        └──► Phase 4 (US2 list)   ──┘
```

- Phase 1 blocks all. Phase 2 blocks both surface phases.
- US1 (create) and US2 (list) share the same consumption boundary; they can be
  defined in parallel after Phase 2, but `[SHARED]` file touches (T005, T017)
  sequence against sibling Console slices.
- Phase 5 runs last, gating any FR-008 approval request.

## Out of scope (do NOT add tasks for these)

- Receivable list/read/apply-payment (Console 018).
- Claims / remittance reconciliation (Console 018/019).
- Settlement-reconciliation surface (Console 019).
- POS settlement-intent capture (POS-020).
- ERPNext / Payment-Entry posting (Connector 009).
- Payer-account edit / suspend (no G2 op — deferred; OQ-CON-EDIT / FR-009).
- Any OpenAPI YAML, migration, DTO, service/worker, or generated-client authorship.

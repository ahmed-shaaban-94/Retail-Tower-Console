# Tasks: RF-1 Auth Shell & Active Context

**Input**: Design documents from `specs/003-rf1-auth-shell/`
**Prerequisites**: plan.md, spec.md (clarified Session 2026-06-06), research.md, data-model.md, contracts/rf1-auth-context.md, quickstart.md

> **⛔ GATE BANNER — READ BEFORE EXECUTING ANY TASK.** This is the 3rd FR-008
> gate input, **not** authorization to write code. No task below may be executed
> until the foundation FR-008 five-gate is explicitly approved for slice 003
> (spec + plan + tasks + API map + validation gates) and the two new runtime
> dependencies clear Constitution Principle 9 (T002/T003). Until then `tasks.md`
> is a **plan of record**. Generating it does not start implementation
> (spec FR-003-011; Non-goals §3).

**Tests**: Included and **required** — VG-1 (Vitest unit coverage) and VG-2
(Playwright journeys) are FR-008 validation gates (plan.md §Validation-gate
shape), not optional. Tests against an approved mock only; never live DP2
(FR-003-012, slice 002 C-5).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: Maps to spec.md scenarios S1–S7
- Exact file paths included. Repo is a React 19 + Vite SPA; no `src/models/`,
  no DB — the console owns zero domain entities (data-model.md).

## Path conventions (this repo)

- Source root: `src/`. RF-1 areas: `src/auth/` (SF-1), `src/context/` (SF-3),
  `src/shell/` (SF-2), `src/lib/` (client/router/query wiring), `src/components/`
  (shared error surface).
- Tests: `tests/unit/` (Vitest), `tests/e2e/` (Playwright). Generated client is
  consumed from `src/generated/` — never edited (slice 002 D-7).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependency approvals + wiring the resolved primitives. Blocks everything.

- [ ] T001 Confirm FR-008 gate approval for slice 003 is recorded before any further task runs (spec FR-003-011). If not approved, STOP.
- [ ] T002 Obtain Constitution Principle 9 approval for **react-router** (data-router) as a new runtime dependency; record approval + pinned version in plan.md Technical Context (R3-1).
- [ ] T003 Obtain Constitution Principle 9 approval for **TanStack Query** as a new runtime dependency; record approval + pinned version in plan.md (R3-2/R3-3).
- [ ] T004 [P] Add approved deps to `package.json` and refresh `pnpm-lock.yaml` (only after T002/T003); no other dependency added (FR-003-009).
- [ ] T005 [P] Re-run `pnpm generate:client` to confirm `src/generated/schema.d.ts` is current at pin `62d0906`; do not edit the generated file (slice 002 D-7).
- [ ] T006 Resolve OQ-3 (CSRF posture) against the pinned auth/context contracts; if a token is required, record it in `api-readiness.md` before wiring mutating calls (research.md verification policy).

**Checkpoint**: Deps approved + present, client current, CSRF posture known.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared client/router/query/error plumbing every surface depends on. Build order follows plan.md: SF-3 store first, then the guard, then the shell frame.

**⚠️ CRITICAL**: No surface (Phase 3+) work begins until this phase completes.

- [ ] T007 Configure the openapi-fetch client in `src/lib/client.ts` with `credentials: "include"` (cookie transport, no `Authorization: Bearer`; FR-003-003). Single source for the seven operations.
- [ ] T008 Configure the TanStack Query provider in `src/lib/query.ts` (query client, defaults). This cache is the read-only active-context store (research.md R3-2).
- [ ] T009 Implement the 401 reactive-refresh interceptor in `src/lib/auth-interceptor.ts`: on 401, call `refreshSession` (op #3) **once** + retry; if refresh also 401s, clear the Query cache and signal redirect to SF-1 (OQ-2, Scenario S5). No other operation added (exactly-seven, §6).
- [ ] T010 Configure react-router data-router in `src/lib/router.tsx` with the public (SF-1) ↔ protected (SF-2/SF-3) boundary; the guard reacts to backend 401 only — no frontend authorization (FR-003-004).
- [ ] T011 [P] Implement the shared error/notification surface in `src/components/Banner.tsx` + `src/components/InlineError.tsx`: persistent banner (not toast), surfaces backend `request_id` (VD-4), uniform 404 (VD-5). Reusable by RF-2..RF-7 (research.md R3-5).

**Checkpoint**: Client, query store, 401 interceptor, router boundary, error surface ready.

---

## Phase 3: SF-3 Active-Context Provider — Scenarios S3/S4 (Priority: P1) 🎯 MVP

**Goal**: The read-only active-context projection every later surface and family depends on (plan.md build order #1).

**Independent Test**: Given a mocked `getActiveContext`, the provider exposes active tenant/store/role read-only; a `switchActiveTenant` invalidates + re-fetches and clears store-scoped state; no optimistic mutation occurs.

### Tests for SF-3

- [ ] T012 [P] [US3] Unit test the context reducer/cache: re-fetch-after-mutation, tenant-switch-clears-store, 401-clears-cache, in `tests/unit/context-provider.test.tsx` (VG-1).
- [ ] T013 [P] [US4] Unit test tenant-switch-clears-store mirroring (FR-003-006) in `tests/unit/context-tenant-switch.test.tsx`.

### Implementation for SF-3

- [ ] T014 [US3] Implement the active-context provider in `src/context/ActiveContextProvider.tsx` reading `getActiveContext` as a TanStack query; expose read-only (FR-003-005).
- [ ] T015 [US3] Implement context mutators in `src/context/useContextMutations.ts` wrapping `switchActiveTenant` / `switchActiveStore` / `clearActiveStore`, each followed by `getActiveContext` invalidation (no optimistic update).
- [ ] T016 [US4] Implement tenant-switch store-clear in the mutator path (drop store-scoped cached queries; FR-003-006).

**Checkpoint**: SF-3 provider fully functional + independently testable against a mock.

---

## Phase 4: SF-1 Sign-in Surface — Scenarios S1/S7 (Priority: P1) 🎯 MVP

**Goal**: The ANONYMOUS → AUTHENTICATED transition that populates SF-3 (build order #2).

**Independent Test**: Single-membership sign-in auto-selects and lands in the shell (S1); zero-membership shows no-access + sign-out (S7); 401 shows a generic error (no leak); 429 disables submit with retry-after.

### Tests for SF-1

- [ ] T017 [P] [US1] E2E single-membership sign-in → auto-select → shell, in `tests/e2e/signin-single-membership.spec.ts` (VG-2, Scenario S1).
- [ ] T018 [P] [US7] E2E no-access (zero memberships) → sign-out, in `tests/e2e/signin-no-access.spec.ts` (VG-2, Scenario S7).
- [ ] T019 [P] [US1] Unit test SF-1 response branching (401 generic / 429 retry-after / success) in `tests/unit/signin-branching.test.tsx` (VG-1, FR-003-007).

### Implementation for SF-1

- [ ] T020 [US1] Implement the sign-in surface in `src/auth/SignIn.tsx` as an uncontrolled native form (no form library); calls `signIn` (research.md R3-4); credentials never persisted (FR-003-009).
- [ ] T021 [US1] Wire the post-sign-in resolution in `src/auth/useSignInFlow.ts`: on success → SF-3 `getActiveContext`; if `memberships.length === 1` → auto `switchActiveTenant` then land in shell (OQ-4, S1).
- [ ] T022 [US7] Implement the no-access render in `src/auth/NoAccess.tsx` for `memberships.length === 0` + sign-out (S7, VD-2).
- [ ] T023 [US1] Render `signIn` 401 generic (no account-existence leak) and 429 retry-after (disabled submit) via the shared error surface (FR-003-007).

**Checkpoint**: SF-1 + SF-3 together complete the MVP sign-in loop, independently testable.

---

## Phase 5: SF-2 Authenticated App Shell — Scenarios S2/S5/S6 (Priority: P2)

**Goal**: The frame wrapping RF-2..RF-7: scope header, chooser, sign-out, route guard (build order #3).

**Independent Test**: Multi-membership shows the full-screen scope gate before any protected route (S2); a 401 mid-session triggers reactive refresh then (if it fails) full redirect to SF-1 (S5); sign-out clears session and navigates to SF-1 (S6).

### Tests for SF-2

- [ ] T024 [P] [US2] E2E multi-membership scope gate (tenant→store) gates protected routes, in `tests/e2e/scope-gate-multi-membership.spec.ts` (VG-2, S2).
- [ ] T025 [P] [US5] E2E session-expiry: 401 → reactive refresh fails → redirect to SF-1, in `tests/e2e/session-expiry-redirect.spec.ts` (VG-2, S5).
- [ ] T026 [P] [US6] E2E sign-out (204 and 401-as-success) → SF-1, in `tests/e2e/sign-out.spec.ts` (VG-2, S6).

### Implementation for SF-2

- [ ] T027 [US2] Implement the app shell in `src/shell/AppShell.tsx`: top-bar + persistent gold scope header + sidebar + content (DESIGN.md layout); single primary per context.
- [ ] T028 [US2] Implement the persistent scope header in `src/shell/ScopeHeader.tsx` (gold bar, click-to-switch; gold is scope-only). Switch drives the SF-3 mutators + re-fetch.
- [ ] T029 [US2] Implement the full-screen scope gate in `src/shell/ScopeGate.tsx` (tenant step → store step) for multi-membership; blocks RF-2..RF-7 until resolved (S2, VD-2).
- [ ] T030 [US6] Implement sign-out in `src/shell/useSignOut.ts` calling `signOut`; treat 204 and 401 as successful sign-out → SF-1 (S6).
- [ ] T031 [US5] Wire the route guard to the 401 interceptor (T009): full redirect to SF-1 after a failed reactive refresh; drop cached context (S5).

**Checkpoint**: All three surfaces functional; the auth shell is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation gates VG-3/VG-4, accessibility, and closeout.

- [ ] T032 [P] VG-3 boundary grep: assert no hand-written `fetch(`/XHR targets a DP2 path, no OpenAPI bytes copied, no `Authorization: Bearer` set by the console (FR-003-002/003). Wire as a CI/test check.
- [ ] T033 [P] VG-4 no-scope-creep grep: assert none of the four out-of-scope auth ops (`requestPasswordReset`, `confirmPasswordReset`, `requestEmailVerification`, `confirmEmailVerification`) is referenced (FR-003-001).
- [ ] T034 [P] Accessibility pass: keyboard nav, AA contrast, screen-reader labels on SF-1 form + scope chooser, `prefers-reduced-motion` respected (PRODUCT.md Accessibility; DESIGN.md motion).
- [ ] T035 [P] Confirm VG-1 unit coverage ≥ repo threshold for SF-3 reduction + SF-1 branching logic.
- [ ] T036 Run quickstart.md validation walkthrough end-to-end against the approved mock; remove the disposable mock per its removal task (FR-003-012).

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (P1)**: T001 gates everything; T002/T003 (Principle 9) gate T004; T006 (CSRF) gates mutating-call wiring (T009/T015).
- **Foundational (P2)**: depends on Setup. Blocks all surfaces.
- **SF-3 (P3)**: first surface (plan.md order); MVP with SF-1.
- **SF-1 (P4)**: depends on SF-3 (auto-select calls SF-3 mutators) + Foundational.
- **SF-2 (P5)**: depends on SF-3 (context indicator/chooser) + SF-1 (guard redirect target).
- **Polish (P6)**: depends on all surfaces.

### Surface build order (plan.md, not UX flow)

SF-3 → SF-1 → SF-2. SF-2's context indicator needs SF-3; the guard needs SF-1 to redirect to.

### Parallel opportunities

- Setup: T004/T005 [P] after approvals.
- Foundational: T011 [P] (error surface) independent of client/router wiring.
- Within each surface: the test tasks marked [P] run together; implementation files in different paths marked [P] run together.
- Polish: T032–T035 all [P].

---

## Implementation Strategy

### MVP (SF-3 + SF-1)

1. Setup (deps approved, client current, CSRF known)
2. Foundational (client, query store, 401 interceptor, router, error surface)
3. SF-3 active-context provider → test independently
4. SF-1 sign-in → **STOP and VALIDATE** the single-membership sign-in loop (S1) end-to-end
5. This is the minimum that proves the auth shell resolves a session + context.

### Incremental delivery

1. MVP above (SF-3 + SF-1, scenarios S1/S3/S4/S7)
2. Add SF-2 shell + scope gate + sign-out + guard (S2/S5/S6)
3. Polish: VG-3/VG-4 grems, a11y, coverage, quickstart validation

---

## Notes

- [P] = different files, no incomplete dependencies.
- Every task traces to a surface (SF-1/2/3 ↔ US1–7) and, where it adds a dep, to its Principle 9 approval (T002/T003).
- Tests use an approved disposable mock only; never live DP2 (FR-003-012).
- Commit after each task or logical group.
- **Nothing here executes until the FR-008 gate clears (see gate banner).**

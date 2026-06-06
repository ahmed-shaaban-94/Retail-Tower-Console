# Tasks: RF-5 Operator / Admin Management

**Input**: Design documents from `specs/005-rf5-operator-admin/`
**Prerequisites**: plan.md, spec.md (clarified Session 2026-06-06), research.md, data-model.md, contracts/rf5-operator-admin.md, design-brief.md, quickstart.md

> **⛔ GATE BANNER — READ BEFORE EXECUTING ANY TASK.** This is the 3rd FR-008
> gate input, **not** authorization to write code. No task below may be executed
> until the foundation FR-008 five-gate is explicitly approved for slice 005
> (spec + plan + tasks + API map + validation gates). RF-5 adds **no** new runtime
> dependency (it reuses RF-1's react-router + TanStack Query, already approved in
> slice 003), so there is no Principle-9 sub-gate here — but the generated client
> MUST be regenerated at pin `62d0906` to expose the RF-5 ops first (T002, OQ-5).
> Until the gate clears, `tasks.md` is a **plan of record**. Generating it does
> not start implementation (spec FR-005-012; Non-goals §3).

**Tests**: Included and **required** — VG-1 (Vitest unit coverage) and VG-2
(Playwright journeys) are FR-008 validation gates (plan.md §Validation-gate
shape), not optional. Tests against an approved mock only; never live DP2
(FR-005-014, slice 002 C-5).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: `[USn]` ≡ spec.md Scenario **Sn** (US1≡S1 … US7≡S7). Phases group
  by *surface* (SF5-1..4); a surface phase can carry tasks from several scenarios.
- **[SHARED]**: touches a file shared with sibling RF-2..RF-7 slices — implement
  SEQUENTIALLY, never two slices at once (`src/App.tsx`, `src/shell/AppShell.tsx`,
  `src/lib/client.ts`).
- Exact file paths included. Repo is a React 19 + Vite SPA; no `src/models/`, no
  DB — the console owns zero domain entities (data-model.md).

## Path conventions (this repo)

- Source root: `src/`. RF-5 areas: `src/operators/` (SF5-1..3 surfaces),
  `src/auth/` (SF5-4 public accept — sibling of SF-1), `src/lib/` (client
  wrappers, member-query wiring), `src/components/` (reused shared error surface).
- Tests: `tests/unit/` (Vitest), `tests/e2e/` (Playwright). Generated client is
  consumed from `src/generated/` — regenerated at pin `62d0906`, never hand-edited
  (slice 002 D-7).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Gate confirmation + client regeneration + reuse wiring. Blocks everything.

- [ ] T001 Confirm FR-008 gate approval for slice 005 is recorded before any further task runs (spec FR-005-012). If not approved, STOP.
- [ ] T002 **(OQ-5)** Regenerate the generated client at pin `62d0906` so `src/generated/schema.d.ts` includes `/api/v1/tenants/{tenant_id}/members`, `/api/v1/memberships/invite`, `/api/v1/memberships/{membership_id}`, and `/api/v1/invitations/accept`. This is a regeneration at the EXISTING pin (not a re-pin); do not hand-edit the output (slice 002 D-7). Verify the four paths appear.
- [ ] T003 Confirm RF-1's react-router + TanStack Query + shared `Banner`/`InlineError` + `ActiveContextProvider` are present and reused as-is (no new dependency; FR-005-010). No `package.json`/lockfile change.
- [ ] T004 **(OQ-1 / CSRF)** Re-confirm against the regenerated client that the RF-5 mutating ops carry only `cookieAuth` (no CSRF header) and that `acceptInvitation` is `security: []`; record in `api-readiness.md` before wiring mutating calls.

**Checkpoint**: Gate approved, client exposes the five ops, reuse confirmed, transport posture known.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared client wrappers + member-query wiring + the 401-disambiguation interceptor every surface depends on.

**⚠️ CRITICAL**: No surface (Phase 3+) work begins until this phase completes.

- [ ] T005 [SHARED] Add the five typed op wrappers to `src/lib/client.ts` in the existing `{ status, data, error }` shape (verified `client.ts:1-71`): `listMembers`, `createInvitation`, `updateMembership`, `revokeMembership`, `acceptInvitation`. `createInvitation` MUST also send a client-generated `Idempotency-Key` header (new shape vs. body-only wrappers; §6.3, FR-005-008).
- [ ] T006 Add the member-graph query + invalidation in `src/lib/query.ts` / a new `src/operators/useMembers.ts`: `listMembers` keyed by `active_tenant.id`; the three mutations invalidate + re-fetch (no optimistic mutation; FR-005-005), mirroring RF-1's invalidate-after-mutation (`useActiveContext.ts:73-86`).
- [ ] T007 **(make-or-break, OQ-1)** Implement RF-5's 401-disambiguation in `src/operators/useInviteAuth.ts`, scoped to **`createInvitation`** (the only RF-5 op with a precondition 401 per the contracts): wrap that call with a dedicated `createAuthRetry` instance (reused from `src/lib/auth-interceptor.ts:32-60`) whose injected `onSessionLost` (refresh-failed) is the ONLY sign-out path; a 401 that SURVIVES a successful refresh is classified as precondition ("no active tenant") and routes to the RF-1 scope chooser. MUST NOT reuse `useActiveContext`'s blanket `status===401 → session-lost` mapping on `createInvitation`. `listMembers`/`updateMembership`/`revokeMembership` use the standard RF-1 wrapper (no precondition path); the `listMembers` active-tenant precondition is guarded *before* the call (route to chooser when `active_tenant` null) (FR-005-007).
- [ ] T008 Wire the `Idempotency-Key` generator (UUIDv7, format `^[\x21-\x7E]{16,128}$`) and the replay/conflict/425 handling helpers in `src/operators/inviteIdempotency.ts` (§6.3).

**Checkpoint**: Client wrappers, member query, 401-disambiguation, idempotency helpers ready.

---

## Phase 3: SF5-1 Member List — Scenarios S1/S3 (Priority: P1) 🎯 MVP

**Goal**: The read-only membership-graph table every management surface refreshes into (plan.md build order #1).

**Independent Test**: Given a mocked `listMembers`, the table renders identity/role/store-access/state; a precondition-401 routes to the scope chooser (NOT sign-out); an expiry-401 routes to sign-in.

### Tests for SF5-1

- [ ] T009 [P] [US1] Unit test the member-list reduction + state matrix (default/empty/loading/error/success) in `tests/unit/member-list.test.tsx` (VG-1; design-brief SF5-1 matrix).
- [ ] T010 [P] [US3] Unit test the `createInvitation` 401-disambiguation: refresh-fails → sign-out; refresh-ok-but-401 → scope chooser, in `tests/unit/invite-401-disambiguation.test.ts` (VG-1, FR-005-007). Also assert `listMembers` routes to the scope chooser via the pre-call active-tenant guard (not via a 401).
- [ ] T011 [P] [US3] E2E no-active-tenant (pre-call guard on `listMembers`; precondition-401 on `createInvitation`) → RF-1 scope chooser, in `tests/e2e/members-no-active-tenant.spec.ts` (VG-2, S3).

### Implementation for SF5-1

- [ ] T012 [US1] Implement the member list table in `src/operators/MemberList.tsx` as `.data-table` (DESIGN.md rule 7): Member (name/email), Role badge, Store-access (All / N stores — ids not names, OQ-3), State (Revoked badge when `revoked_at`). Page header + right-aligned "Invite member" `.btn-primary` (design-brief SF5-1).
- [ ] T013 [US1] Implement empty/loading/error states per the design-brief matrix. `listMembers` documents only `404` (no access) → uniform `.alert--danger` with `request_id` (FR-005-009). The no-active-tenant precondition is handled by the pre-call guard → scope chooser (not a 401/403 on `listMembers`).
- [ ] T014 [US1] [SHARED] Un-gate the `Operators` entry in `src/shell/AppShell.tsx` `GATED_NAV` (verified `AppShell.tsx:12-18`) — turn it into a live nav link to the Operators route.
- [ ] T015 [US1] [SHARED] Register the protected Operators route in `src/App.tsx` (inline routing, verified `App.tsx:24-32`; NO `src/lib/router.tsx`).

**Checkpoint**: SF5-1 renders the graph + handles both 401 meanings; independently testable against a mock.

---

## Phase 4: SF5-2 / SF5-3 Invite + Edit/Revoke — Scenarios S2/S4/S5 (Priority: P1) 🎯 MVP

**Goal**: Mutate the graph then re-fetch SF5-1 (plan.md build order #2).

**Independent Test**: Invite shows pending + handles replay/409/425 (S2); edit changes role/store-access then re-fetches (S4); revoke confirms then soft-deletes (S5).

### Tests

- [ ] T016 [P] [US2] Unit test invite idempotency: Idempotency-Key generation, `Idempotent-Replayed:true` = same invite, `idempotency_key_conflict` terminal, 425 retry-with-same-key, in `tests/unit/invite-idempotency.test.ts` (VG-1, FR-005-008).
- [ ] T017 [P] [US2] E2E invite → 201 + pending + list re-fetch; duplicate-pending 409 banner, in `tests/e2e/invite-member.spec.ts` (VG-2, S2).
- [ ] T018 [P] [US4] E2E edit role/store-access → re-fetch; uniform 404, in `tests/e2e/edit-member.spec.ts` (VG-2, S4).
- [ ] T019 [P] [US5] E2E revoke → confirm → 204 → revoked marker, in `tests/e2e/revoke-member.spec.ts` (VG-2, S5).

### Implementation

- [ ] T020 [US2] Implement the invite drawer in `src/operators/InviteMember.tsx` (uncontrolled native form; email/role/store-access; single `.btn-primary`; design-brief SF5-2). Calls `createInvitation` via T005/T008.
- [ ] T021 [US2] Render the invite outcomes: 400 inline (`InlineError`), 403/409 persistent `.alert`, 425 disabled-submit + countdown (mirrors SF-1 429). Distinguish the two 409 causes (FR-005-009).
- [ ] T022 [US4] Implement the edit drawer in `src/operators/EditMember.tsx` (pre-filled role/store-access; `updateMembership`; re-fetch; uniform 404; design-brief SF5-3).
- [ ] T023 [US5] Implement revoke in `src/operators/EditMember.tsx` revoke section: `.btn-destructive` + confirm step → `revokeMembership` → re-fetch (no nested card, rule 5).

**Checkpoint**: SF5-1 + SF5-2 + SF5-3 complete the MVP management loop, independently testable.

---

## Phase 5: SF5-4 Accept Invitation (public) — Scenario S7 (Priority: P2)

**Goal**: The standalone public accept route (sibling of RF-1 sign-in; build order #3).

**Independent Test**: Valid token → session established → land in shell; invalid/expired token → generic error.

### Tests

- [ ] T024 [P] [US7] E2E accept-invitation: valid token → shell; invalid token → error, in `tests/e2e/accept-invitation.spec.ts` (VG-2, S7).
- [ ] T025 [P] [US7] Unit test the accept-form branching (new-user password required vs. existing) in `tests/unit/accept-invitation.test.tsx` (VG-1).

### Implementation

- [ ] T026 [US7] Implement the public accept surface in `src/auth/AcceptInvitation.tsx` (centered `.card`; token from link; optional display-name/password; `acceptInvitation` `security: []`; design-brief SF5-4).
- [ ] T027 [US7] [SHARED] Register the public accept route in `src/App.tsx` alongside `/signin` (inline routing; NOT behind the protected guard).
- [ ] T028 [US7] On 200, establish session → redirect into the RF-1 shell; on 400, render "invalid or expired" generically.

**Checkpoint**: All four surfaces functional; the operator/admin management family is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation gates VG-3/VG-4, accessibility, and closeout.

- [ ] T029 [P] VG-3 boundary grep: assert no hand-written `fetch(`/XHR targets a DP2 path, no OpenAPI bytes copied, no `Authorization: Bearer` set by the console (FR-005-002/003). Wire as a CI/test check.
- [ ] T030 [P] VG-4 POS-boundary grep: assert no reference to `/api/pos/v1/`, no `pos-operators` operationId, and no `listStores` (RF-2) anywhere in RF-5 code (FR-005-001, FR-005-013).
- [ ] T031 [P] Accessibility pass: keyboard nav, AA contrast, screen-reader labels on invite/edit forms + the member table + the destructive confirm; `prefers-reduced-motion` respected (DESIGN.md motion; rule 10 touch targets).
- [ ] T032 [P] Confirm VG-1 unit coverage ≥ repo threshold for member-list reduction, invite idempotency, and the 401-disambiguation logic.
- [ ] T033 Run quickstart.md validation walkthrough end-to-end against the approved mock; remove the disposable mock per its removal task (FR-005-014).

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (P1)**: T001 gates everything; T002 (client regen, OQ-5) gates all op wrappers; T004 (CSRF/security) gates mutating-call wiring.
- **Foundational (P2)**: depends on Setup. Blocks all surfaces. T007 (401-disambiguation) is load-bearing for every surface's error path.
- **SF5-1 (P3)**: first surface (plan.md order); MVP with SF5-2/3.
- **SF5-2/3 (P4)**: depends on SF5-1 (re-fetch target) + Foundational.
- **SF5-4 (P5)**: independent public route; built last.
- **Polish (P6)**: depends on all surfaces.

### Shared-file sequencing (collides with sibling slices)

`src/App.tsx` (T015, T027), `src/shell/AppShell.tsx` (T014), `src/lib/client.ts`
(T005) are touched by sibling RF-2..RF-7 slices. Implement these SEQUENTIALLY —
never run two slices' shared-file edits concurrently. Verified real paths
(no `src/lib/router.tsx`).

### Surface build order (plan.md, not UX flow)

SF5-1 → SF5-2/3 → SF5-4. Management surfaces refresh into the list; the public
accept route is independent and built last.

### Parallel opportunities

- Setup: none (sequential gating).
- Foundational: T005/T006/T008 can overlap; T007 depends on T005.
- Within each surface: the test tasks marked [P] run together; implementation
  files in different paths marked [P] run together (but NOT the [SHARED] ones).
- Polish: T029–T032 all [P].

---

## Implementation Strategy

### MVP (SF5-1 + SF5-2/3)

1. Setup (gate, client regen, reuse confirmed, security known)
2. Foundational (client wrappers, member query, **401-disambiguation**, idempotency)
3. SF5-1 member list → test independently (incl. precondition-401 branch)
4. SF5-2/3 invite + edit/revoke → **STOP and VALIDATE** the manage loop (S2/S4/S5)
5. This is the minimum that proves the console can view + manage the membership graph.

### Incremental delivery

1. MVP above (SF5-1 + SF5-2/3, scenarios S1/S2/S3/S4/S5/S6)
2. Add SF5-4 public accept (S7)
3. Polish: VG-3/VG-4 greps, a11y, coverage, quickstart validation

---

## Notes

- [P] = different files, no incomplete dependencies. [SHARED] = sequential across slices.
- Every task traces to a surface (SF5-1..4 ↔ US1–7) and to the design-brief state matrix.
- The **401-disambiguation (T007/T010)** is the highest-correctness item — grounded
  in reading `src/lib/auth-interceptor.ts:32-60`, not the pattern.
- The A6 / POS boundary is enforced by VG-4 (T030) in addition to the spec assertion.
- Tests use an approved disposable mock only; never live DP2 (FR-005-014).
- Commit after each task or logical group.
- **Nothing here executes until the FR-008 gate clears (see gate banner).**

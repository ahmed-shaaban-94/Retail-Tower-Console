# Tasks: RF-6 Audit / Search

**Input**: Design documents from `specs/006-rf6-audit-search/`
**Prerequisites**: plan.md, spec.md (clarified Session 2026-06-06), research.md, data-model.md, contracts/rf6-audit-search.md, design-brief.md, quickstart.md

> **⛔ GATE BANNER — READ BEFORE EXECUTING ANY TASK.** This is the 3rd FR-008
> gate input, **not** authorization to write code. No task below may be executed
> until the foundation FR-008 five-gate is explicitly approved for slice 006
> (spec + plan + tasks + API map + validation gates). RF-6 adds **no** new
> runtime dependency (it reuses RF-1's react-router + TanStack Query, already
> approved under Principle 9 for slice 003), so there is no Principle-9 dep gate
> here — but the OQ-3 actor-matrix read and (for any POS-dependent feature) the
> OQ-5 POS sub-row re-verification must be resolved before the API-dependency
> gate. Until the gate clears, `tasks.md` is a **plan of record**. Generating it
> does not start implementation (spec FR-006-012; Non-goals §3).

**Tests**: Included and **required** — VG-1 (Vitest unit coverage) and VG-2
(Playwright journeys) are FR-008 validation gates (plan.md §Validation-gate
shape), not optional. Tests against an approved mock only; never live DP2
(FR-006-013, slice 002 C-5).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: `[USn]` ≡ spec.md Scenario **Sn** (US1≡S1 … US7≡S7). Phases group by
  *surface* (SF-6-1 / SF-6-2) and the shared shell-attachment; a surface phase can
  carry tasks from several scenarios.
- Exact file paths included. Repo is a React 19 + Vite SPA; no `src/models/`, no
  DB — the console owns zero domain entities (data-model.md).

## Path conventions (this repo)

- Source root: `src/`. RF-6 areas: `src/audit/` (SF-6-1 table + SF-6-2 drawer +
  hooks), `src/lib/` (the `listAuditEvents` wrapper added to the existing
  `client.ts`). Shared shell files: `src/App.tsx`, `src/shell/AppShell.tsx`.
- Tests: `tests/unit/` (Vitest), `tests/e2e/` (Playwright). Generated client is
  consumed from `src/generated/` — never edited (slice 002 D-7).
- **Shared-file touches (verified at planning; collide with RF-2/3/5/7 → SEQUENTIAL
  implement):** `src/App.tsx` (nested route registration — there is **no**
  `src/lib/router.tsx`), `src/shell/AppShell.tsx` (`<Outlet/>` insertion + un-gate
  the `Audit` `GATED_NAV` entry), `src/lib/client.ts` (add `listAuditEvents`).

---

## Phase 1: Setup (gate + readiness residuals)

**Purpose**: Confirm the gate and resolve the readiness residuals. Blocks everything.

- [ ] T001 Confirm FR-008 gate approval for slice 006 is recorded before any further task runs (spec FR-006-012). If not approved, STOP.
- [ ] T002 Resolve OQ-3 (actor → RF-6 permission matrix) against the pinned Data-Pulse-2 authorization model @ `62d0906`; record the result in `api-readiness.md` + `spec.md` OQ-3 (same edit). This sizes the 403 and empty states accurately (design-brief §4).
- [ ] T003 If any POS-label-dependent feature is in scope, re-verify the POS sub-rows (OQ-5) against `pos-audit-events.openapi.yaml` @ `62d0906` + POS-Pulse emission semantics before that feature's gate (FR-006-007); record in `api-readiness.md`. (If POS rows render generically per research R6-6, this is a no-op for this slice.)
- [ ] T004 Confirm zero new runtime dependency is needed (react-router + TanStack Query reused from RF-1; FR-006-010). If `/speckit-clarify` had surfaced one, it would be recorded in `plan.md` as *selected, pending Principle 9* — none was.
- [ ] T005 🔗 SHARED-FILE Add `packages/contracts/openapi/audit.openapi.yaml` to `OPENAPI_SOURCES` in `openapi-ts.config.ts` and re-run `pnpm generate:client` **at the same pin `62d0906`** so `src/generated/schema.d.ts` exposes `listAuditEvents` types. This is regeneration at the pinned SHA (NOT a re-pin) and edits a slice-002 scaffold config — acknowledge at the FR-008 gate. Sequence vs sibling slices (each adds its own contract to the same config). Do not hand-edit the generated output.

**Checkpoint**: Gate confirmed, actor matrix known, dependency posture confirmed (zero-new), client types present.

---

## Phase 2: Foundational — shell attachment + client wrapper (Blocking Prerequisites)

**Purpose**: The shared plumbing both surfaces depend on. **These are the
shared-file touches; implement SEQUENTIALLY with sibling RF-2/3/5/7 slices to
avoid `src/App.tsx` / `src/shell/AppShell.tsx` collisions.**

**⚠️ CRITICAL**: No surface (Phase 3+) work begins until this phase completes.

- [ ] T006 Add the `listAuditEvents(query)` typed wrapper to `src/lib/client.ts`, matching the existing `{ status, data, error }` shape, calling `apiClient.GET("/api/v1/audit/events", { params: { query } })`. Cookie transport already set; no `Authorization: Bearer`, no `device_token_attestation` (FR-006-002/003). **No** `posAuditEventsSync` wrapper, **no** invented single-event read (FR-006-001).
- [ ] T007 Insert a content `<Outlet/>` into `src/shell/AppShell.tsx`'s content area so child routes render inside the shell; make the existing Overview block the index route's content (additive, behavior-preserving for RF-1; research R6-1).
- [ ] T008 Un-gate the `Audit` entry in `src/shell/AppShell.tsx` `GATED_NAV`: render it as an active `<Link>`/nav entry to `/audit` (the active-nav gold marker is the sanctioned scope-only gold use; DESIGN.md). Remove only the `Audit`/`RF-6` gated row; leave RF-2/3/4/5 gated.
- [ ] T009 Register the nested `/audit` route in `src/App.tsx` under the protected branch (inline `<Routes>` — there is **no** `src/lib/router.tsx`), so it is reachable only through `ProtectedArea` → `ScopeGate` → `AppShell` (RF-1 sequencing; FR-006-005).
- [ ] T010 [P] Add the audit query-key factory + scope binding in `src/audit/auditQueryKeys.ts`: key = `["audit", activeTenantId, activeStoreId, filters]` so a scope switch (RF-1 SF-3) re-queries and drops prior results (FR-006-005, Scenario S6).

**Checkpoint**: `listAuditEvents` callable, `/audit` mounts in the shell, nav un-gated, scope-keyed query ready.

---

## Phase 3: SF-6-1 Audit Search Table — Scenarios S1/S2/S4/S5/S6 (Priority: P1) 🎯 MVP

**Goal**: The filterable, cursor-paginated audit table — the core RF-6 surface.

**Independent Test**: Given a mocked `listAuditEvents`, the table renders rows for the active scope; an `action`/time filter re-queries; a non-null `next_cursor` shows "load more" which appends a page; an empty result renders empty-after-filter (distinct from pre-query); a 403 renders not-permitted with `request_id`; a scope switch drops results and re-queries.

### Tests for SF-6-1

- [ ] T011 [P] [US1] Unit test the filter→query-param projection + query-key reduction (scope + filters) in `tests/unit/audit-query.test.tsx` (VG-1).
- [ ] T012 [P] [US1] Unit test cursor "load more" append logic (`next_cursor` → next page appended; null → no more) in `tests/unit/audit-pagination.test.tsx` (VG-1, OQ-4).
- [ ] T013 [P] [US5] Unit test the state-matrix branching (pre-query / loading / 200-rows / 200-empty / 403 / generic) in `tests/unit/audit-state-matrix.test.tsx` (VG-1, FR-006-008, design-brief §4).
- [ ] T014 [P] [US1] E2E scoped search + `action`/time filter → rows, in `tests/e2e/audit-search-filter.spec.ts` (VG-2, S1).
- [ ] T015 [P] [US2] E2E POS-event row (`shift.forced_close` / `operator.session.takeover`) surfaced **read-only** (no write affordance), in `tests/e2e/audit-pos-event-readonly.spec.ts` (VG-2, S2, FR-006-006/009).
- [ ] T016 [P] [US4] E2E 403 not-permitted state with `request_id`, in `tests/e2e/audit-forbidden.spec.ts` (VG-2, S4, FR-006-004).
- [ ] T017 [P] [US6] E2E scope switch (RF-1 SF-3) resets filters + results, in `tests/e2e/audit-scope-switch-reset.spec.ts` (VG-2, S6).

### Implementation for SF-6-1

- [ ] T018 [US1] Implement the audit list hook in `src/audit/useAuditSearch.ts` using `useInfiniteQuery` over `listAuditEvents` (scope-keyed; `getNextPageParam` reads `next_cursor`); read-only, no optimistic mutation (research R6-2/R6-3).
- [ ] T019 [US1] Implement the filter bar in `src/audit/AuditFilters.tsx` as uncontrolled native inputs (action prefix, actor, store-when-permitted, from/to date-time); no form library (research R6-5).
- [ ] T020 [US1] Implement the audit table in `src/audit/AuditTable.tsx`: semantic `<table>`, mono `action`/`request_id`, right-aligned tabular time; POS rows render generically (research R6-6); severity badge in contained status color, never gold, never a side-stripe (design-brief §2).
- [ ] T021 [US1] Implement the "load more" pager in `src/audit/AuditPager.tsx` driven by `next_cursor` (hidden when null); navy button, no page numbers (OQ-4).
- [ ] T022 [US5] Implement the state-matrix renders in `src/audit/AuditSearch.tsx` (the `/audit` route component): pre-query, loading skeleton (`aria-busy`), rows, empty-after-filter (+ Clear), and route 401/403/generic to the shared `Banner` with `request_id` (FR-006-008, VD-6-*). 401 is NOT special-cased at this slice (OQ-1; shared interceptor handles expiry).
- [ ] T023 [US4] Wire 403/generic rendering through the reused `Banner`/`InlineError` (no toast; surfaces `request_id`; FR-006-008, RF-1 VD-4).

**Checkpoint**: SF-6-1 fully functional + independently testable against a mock. This is the RF-6 MVP.

---

## Phase 4: SF-6-2 Row Inspect Drawer — Scenario S3 (Priority: P2)

**Goal**: The read-only drill into a single already-fetched row (no backend call).

**Independent Test**: Clicking a row opens a right drawer showing the full `metadata`/`target_*`/`actor_*`/`request_id` from the row already in hand; no extra `listAuditEvents` call fires; the drawer is read-only (no action buttons) and closes on Esc/backdrop/close, returning focus to the row.

### Tests for SF-6-2

- [ ] T024 [P] [US3] Unit test that inspect reads the already-fetched row (no new fetch) and renders all fields incl. `metadata`, in `tests/unit/audit-inspect.test.tsx` (VG-1, OQ-2).
- [ ] T025 [P] [US3] E2E open inspect drawer from a row → full detail, read-only, Esc closes + focus returns, in `tests/e2e/audit-row-inspect.spec.ts` (VG-2, S3, FR-006-009).

### Implementation for SF-6-2

- [ ] T026 [US3] Implement the inspect drawer in `src/audit/AuditInspectDrawer.tsx`: `role="dialog"` `aria-modal`, focus-trapped, composed from existing surface/overlay tokens; renders the passed-in row (no fetch); `request_id` copy-to-clipboard; **no** action buttons (read-only; FR-006-009, design-brief §3).
- [ ] T027 [US3] Wire row→drawer selection state in `src/audit/AuditSearch.tsx` (the inspected-row reference; cleared on close; data-model state machine).

**Checkpoint**: Both surfaces functional; RF-6 audit search + inspect complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation gates VG-3/VG-4, accessibility, and closeout.

- [ ] T028 [P] VG-3 boundary grep: assert no hand-written `fetch(`/XHR targets a DP2 path, no OpenAPI bytes copied, no `Authorization: Bearer`/`device_token_attestation` set by the console (FR-006-002/003). Wire as a CI/test check.
- [ ] T029 [P] VG-4 no-scope-creep grep: assert **`posAuditEventsSync` is never referenced**, no `getAuditEvent`/`readAuditEvent` operation appears, and no mutation/export/annotate affordance is wired (FR-006-001/006/009). Wire as a CI/test check.
- [ ] T030 [P] Accessibility pass: semantic table + `<th scope>`, row-inspect trigger is a real `<button>`, drawer focus-trap + Esc + focus-return, AA contrast on rows/badges (mid-ramp `--color-*-on-dark` tokens), `prefers-reduced-motion` respected (PRODUCT.md Accessibility; design-brief §5).
- [ ] T031 [P] Confirm VG-1 unit coverage ≥ repo threshold for the filter/query-key reduction, pagination append, and state-matrix branching.
- [ ] T032 [P] Confirm gold-scope-only: grep RF-6 styles for any gold token use on rows/badges/severity/buttons; the only permitted gold is the inherited scope header + active-nav marker (DESIGN.md rule 1; design-brief §2).
- [ ] T033 Run quickstart.md validation walkthrough end-to-end against the approved mock; remove the disposable mock per its removal task (FR-006-013).

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (P1)**: T001 gates everything; T002 (actor matrix) sizes the 403/empty states; T003 (POS re-verify) gates any POS-dependent feature only.
- **Foundational (P2)**: depends on Setup. The **shared-file touches** (T006/T007/T008/T009) are SEQUENTIAL vs sibling slices. Blocks all surfaces.
- **SF-6-1 (P3)**: depends on Foundational; the RF-6 MVP.
- **SF-6-2 (P4)**: depends on SF-6-1 (needs rows in hand to inspect).
- **Polish (P5)**: depends on all surfaces.

### Surface build order (plan.md, not UX flow)

Shell attachment + client wrapper → SF-6-1 → SF-6-2. SF-6-2 has no data without
SF-6-1; both have nowhere to mount without the attachment.

### Shared-file collision note (SEQUENTIAL implement)

`src/App.tsx` (route registration), `src/shell/AppShell.tsx` (`<Outlet/>` + nav
un-gate), and `src/lib/client.ts` (new wrapper) are touched by every content
family (RF-2/3/5/7). These tasks (T006–T009) MUST be implemented sequentially
across sibling slices — do not parallelize them with another slice's edits to the
same files. The RF-6 edits are additive and behavior-preserving for RF-1.

### Parallel opportunities

- Setup: T005 [P].
- Foundational: T010 [P] (query-key factory) independent of the shared-file edits.
- SF-6-1: test tasks T011–T017 [P] together; implementation files in different
  paths run in parallel where dependencies allow.
- SF-6-2: T024/T025 [P].
- Polish: T028–T032 all [P].

---

## Implementation Strategy

### MVP (SF-6-1)

1. Setup (gate confirmed, actor matrix known, zero-new-dep confirmed)
2. Foundational (client wrapper, shell `<Outlet/>`, `/audit` route, nav un-gate, scope-keyed query) — SEQUENTIAL on shared files
3. SF-6-1 audit table → **STOP and VALIDATE** scoped search + filter + load-more + 403 + empty-vs-pre-query (S1/S4/S5/S6) end-to-end
4. This is the minimum that proves an operator can search and read audit activity.

### Incremental delivery

1. MVP above (SF-6-1, scenarios S1/S2/S4/S5/S6)
2. Add SF-6-2 inspect drawer (S3)
3. Polish: VG-3/VG-4 greps, a11y, coverage, gold-scope-only check, quickstart validation

---

## Notes

- [P] = different files, no incomplete dependencies.
- Every task traces to a surface (SF-6-1/2 ↔ US1–6) and the design-brief state matrix.
- RF-6 adds **no** runtime dependency (reuses RF-1's react-router + TanStack Query).
- Tests use an approved disposable mock only; never live DP2 (FR-006-013).
- The console **never** calls `posAuditEventsSync` and wires **no** mutation (read-only).
- **Scenario S7 (mid-search session expiry) has no dedicated RF-6 task by design:** the 401-expiry path is delegated to the reused RF-1 401 interceptor (`src/lib/auth-interceptor.ts`); RF-6 does **not** special-case the 401 at this slice (spec OQ-1). It is exercised incidentally by the VG-2 journeys, not as a new RF-6 behavior.
- Commit after each task or logical group.
- **Nothing here executes until the FR-008 gate clears (see gate banner).**

# Phase 0 Research: RF-6 Audit / Search

**Feature**: 006-rf6-audit-search
**Phase**: 0 — Outline & Research
**Date**: 2026-06-06
**Input**: [`plan.md`](./plan.md) Technical Context, [`spec.md`](./spec.md) §10 Open questions
**RF-1 reference**: [`003-rf1-auth-shell/research.md`](../003-rf1-auth-shell/research.md) R3-1..R3-6 (the primitives RF-6 inherits as resolved)

---

## R6-0 Posture (read this first)

The slice-002 stack (framework, build tool, package manager, test frameworks,
lint/format, generated-client toolchain + storage) is **resolved and fixed**
(slice 002 D-1..D-8). The RF-1 per-screen primitives (router, query/cache layer,
data-fetching strategy, form handling, error surface) are **also resolved and
merged** (slice 003 R3-1..R3-5; FR-008 gate-approval recorded). RF-6 **reuses**
both layers and does **not** re-open them.

What RF-6 must decide is **how to attach a read-only, filterable, paginated list
surface to the existing shell** using those merged primitives, plus whether any
of its specific needs (e.g., list virtualization for large result sets) require a
genuinely new dependency. The default answer is **no new dependency** — RF-6 is a
list + detail-drill over one GET operation, which the merged stack already covers.

This document lists, for each RF-6 decision: the constraint any answer must
satisfy, the alternatives, and the resolution (headless, Session 2026-06-06). It
names primitive libraries **here** (research/plan), never in `spec.md` (AC-5).

---

## R6-1 — Content-route attachment to the shell

- **Constraint:** RF-6 must register a route reachable only inside the
  authenticated shell (RF-1 sequencing). It must NOT bypass the
  `ProtectedArea` → `ScopeGate` → `AppShell` gating. **Verified merged-code
  fact:** `src/App.tsx` declares routes **inline**
  (`<BrowserRouter><Routes><Route path="/" element={<ProtectedArea />} /></Routes></BrowserRouter>`)
  — there is **no** `src/lib/router.tsx`. `ProtectedArea` renders `AppShell`
  **directly** with no nested `<Outlet>`/content-router; `AppShell` renders a
  fixed `Overview` content block. So **no content-routing mechanism exists yet**;
  RF-6 is the first family that needs one.
- **Alternatives:** (a) add nested routes under the protected branch in
  `src/App.tsx` and render an `<Outlet/>` inside `AppShell`'s content area; (b)
  keep a flat route list in `App.tsx` (`/`, `/audit`) each rendering its own
  `ProtectedArea`-wrapped shell; (c) a non-router content switch (state-driven)
  inside the shell.
- **Decision (Session 2026-06-06):** **react-router nested routes with an
  `<Outlet/>` in the `AppShell` content area** (option a). Rationale: it scales to
  every later family (RF-2/3/5/7) without each re-wrapping the shell, keeps the
  guard/scope-gate in one place (`ProtectedArea`), and matches the data-router
  model RF-1 already approved (R3-1). This **touches `src/App.tsx`** (nested route
  registration) and **`src/shell/AppShell.tsx`** (insert `<Outlet/>` + un-gate the
  `Audit` nav entry) — both are declared shared-file touches (spec §6) and the
  `AppShell` `<Outlet/>` insertion is the one RF-1-touching structural change RF-6
  introduces; it is **additive** (Overview becomes the index route, behavior
  preserved). *Reuses the RF-1 react-router Principle 9 approval; adds no new dep.*

## R6-2 — Audit list query state + cache

- **Constraint:** Hold the `listAuditEvents` result as a **read-only projection**
  keyed by the active filter set + scope. Re-run on filter change and on scope
  switch (drop prior results, spec S6). Support cursor "load more" (append the
  next page, spec OQ-4). No optimistic mutation (RF-6 is read-only). Must not
  bleed results across tenant/store scope.
- **Alternatives** (mirroring R3-2): TanStack Query cache, React Context +
  reducer, Zustand, ad-hoc `useState`.
- **Decision (Session 2026-06-06):** the **TanStack Query cache** holds the audit
  results, exactly as RF-1 uses it for context (R3-2/R3-3). Query key includes the
  active scope (from `useActiveContextValue`) + the filter set, so a scope switch
  naturally invalidates/re-queries (S6) and there is no cross-scope bleed.
  Cursor pages use `useInfiniteQuery` with `getNextPageParam` reading
  `next_cursor` (null → no more). *Reuses the RF-1 TanStack Query Principle 9
  approval; adds no new dep.*

## R6-3 — Data-fetching for `listAuditEvents`

- **Constraint:** Call `listAuditEvents` through the generated client
  (`openapi-fetch`, slice 002 D-2) via a typed wrapper in `src/lib/client.ts`
  matching the existing `{ status, data, error }` shape (spec FR-006-002). Must
  flow through the same cookie transport (`credentials: "include"`) and the same
  401 interceptor as the seven RF-1 ops (with the OQ-1 caveat). Must run in tests
  without live DP2 (slice 002 C-5).
- **Alternatives:** add the wrapper to `src/lib/client.ts` (consistent with RF-1)
  vs. a separate `src/lib/audit-client.ts` module.
- **Decision (Session 2026-06-06):** add a single `listAuditEvents(params)`
  wrapper to **`src/lib/client.ts`** (declared shared-file touch), same shape as
  the RF-1 wrappers, calling `apiClient.GET("/api/v1/audit/events", { params: { query: {...} } })`.
  **Interceptor caveat (OQ-1):** the audit query routes through the existing
  `createAuthRetry` reactive-refresh path like any consumed call; per the
  Clarifications resolution, RF-6 does **not** special-case the audit 401 at this
  slice (the scope gate makes "no active tenant" unreachable on the normal path).
  *No new dep.*

## R6-4 — Table / list rendering for audit rows

- **Constraint:** Audit data is **list data** → render as a **table, not cards**
  (DESIGN.md binding rule; design-brief.md). Columns: time, action, actor, target,
  store (when present), request id. Must handle the state matrix (pre-query,
  loading, rows, empty-after-filter, 401, 403, generic) — spec FR-006-008. Must
  remain accessible (semantic table, sortable headers if added later). Should not
  require a heavy grid dependency for a paginated (≤200/page) list.
- **Alternatives:** plain semantic `<table>` styled with `controls.css`/tokens;
  a headless table lib (TanStack Table); a full data-grid (AG Grid, MUI
  DataGrid).
- **Decision (Session 2026-06-06):** **plain semantic `<table>`** styled with the
  existing `src/styles/tokens.css` + `controls.css` (extended with an
  audit-table stylesheet). At ≤200 rows/page with cursor "load more", no
  virtualization or grid dependency is justified — adding one would trip
  FR-006-010 / Principle 9 for no benefit. If a future slice needs sorting/column
  config, a headless table lib is reconsidered **then**. *Adds no new dep.*

## R6-5 — Filter / search controls + error surface

- **Constraint:** Collect the contract's query params — `action` (prefix text),
  `actor_user_id`, `store_id`, `from`/`to` (date-time range) — and re-query on
  change. Surface 401/403/generic errors via the shared `Banner`/`InlineError`
  with `request_id` (spec FR-006-008; RF-1 VD-4). Empty-after-filter distinct
  from pre-query (spec S5). No form library (consistent with RF-1 R3-4).
- **Alternatives:** uncontrolled native form inputs + minimal validation (RF-1
  R3-4 pattern); a form library; a filter-DSL component.
- **Decision (Session 2026-06-06):** **uncontrolled native inputs + minimal
  validation**, reusing the RF-1 `Banner`/`InlineError` components and the
  `controls.css` input/button primitives. Date range uses native
  `<input type="datetime-local">` (or date), serialized to the contract's
  `date-time`. Errors render through the shared `Banner` (persistent, not toast;
  DESIGN.md rule 4) surfacing `request_id`. *Adds no new dep.*

## R6-6 — POS-event labelling (carried at draft ceiling, not decided)

- **Constraint:** POS-catalogue `action` values (`shift.*`,
  `operator.session.takeover`, `cashier.pin.*`) appear as ordinary rows. A
  POS-specific label/icon/filter-preset would **depend on the `draft` POS
  sub-rows** (spec FR-006-007, OQ-5) and inherits the re-verify gate.
- **Decision (Session 2026-06-06):** at this slice RF-6 renders the raw `action`
  string for **all** rows (POS and non-POS) generically — this is the `stable`
  core and needs no POS-catalogue dependency. Any POS-specific affordance is
  **deferred** behind the OQ-5 re-verification. Recorded so RF-6 authors do not
  silently couple a `stable`-gated feature to a `draft` catalogue.

---

## Constraints common to all RF-6 decisions

These hold regardless of which primitive is chosen (sourced from spec.md FRs +
slice 002 / RF-1 constraints):

- **Single operation, generated client only** (FR-006-001/002, Principle 8) — no
  hand-rolled DP2 HTTP; never `posAuditEventsSync`; never an invented read op.
- **Cookie transport, no bearer, no device token** (FR-006-003).
- **No frontend authorization; backend-scoped results** (FR-006-004/005,
  Principle 7).
- **Read-only** — no mutation/export/annotation affordance (FR-006-009).
- **POS read-through only** (FR-006-006); POS sub-rows held at `draft` (FR-006-007).
- **No new dependency without Principle 9 approval** (FR-006-010) — none anticipated.
- **No foundation/slice-002/slice-003 spec modification; only the declared
  additive shared-file touches** (FR-006-011).

---

## Verification policy (carried from foundation R-9)

RF-6 plans against Data-Pulse-2 pin `62d0906` (slice 002 C-4). The audit core is
`stable` and carried forward by reference in [`api-readiness.md`](./api-readiness.md);
the POS sub-rows are `draft` (OQ-5, must re-verify before a POS-dependent gate),
the actor matrix is a backend-truth read (OQ-3, must resolve before the
API-dependency gate), and the audit-401/interceptor interaction (OQ-1) is a
behavioral edge tested against the RF-1 code. RF-6 does not re-classify the
readiness optimistically.

---

**End of Phase 0 Research: RF-6 Audit / Search.**

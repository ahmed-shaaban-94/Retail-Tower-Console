# Implementation Plan: RF-6 Audit / Search

**Branch**: `006-rf6-audit-search` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-rf6-audit-search/spec.md`

**Companion artifacts**:
- [api-readiness.md](./api-readiness.md) — RF-6 dual readiness carried forward (`stable` audit core / `draft` POS sub-rows); residuals OQ-3/OQ-5
- [research.md](./research.md) — Phase 0 output (RF-6 attachment + reuse decisions R6-1..R6-6)
- [data-model.md](./data-model.md) — Phase 1 output (render-side projection; this repo owns no model)
- [contracts/rf6-audit-search.md](./contracts/rf6-audit-search.md) — Phase 1 output (the 1-operation consumption boundary)
- [design-brief.md](./design-brief.md) — Phase 1 design output (`/impeccable shape`; the state matrix tasks trace to)
- [quickstart.md](./quickstart.md) — Phase 1 output (planning walkthrough, not a setup runbook)
- [checklists/requirements.md](./checklists/requirements.md) — Spec quality checklist (from `/speckit-specify`)

> **Mode contract.** Planning-only. This plan sequences the RF-6 work and records
> the constraints any future answer must satisfy. It does **not** authorize
> implementation, and it does **not** re-open RF-1's router/state/data-fetching
> primitives (those are merged and fixed). Implementation begins only after the
> foundation FR-008 five-gate approval for this slice (spec + plan + tasks + API
> map + validation gates).

---

## Summary

This is the **first content-family plan** that attaches to the merged RF-1 app
shell. Its job is to sequence the RF-6 audit/search surfaces (SF-6-1 search
table, SF-6-2 row inspect) against the **single** Data-Pulse-2 operation
`listAuditEvents`, reusing the RF-1 stack with **zero new runtime dependency**,
and to record the per-decision constraints RF-6 must satisfy before its FR-008
implementation gate clears.

**Primary requirement** (from spec.md): specify how RF-6 consumes
`listAuditEvents` through the slice-002 generated client, renders backend truth
read-only (search + inspect, no mutation), surfaces POS-originated events
read-through only, and attaches a content route to the RF-1 shell — while
flagging (not fixing) the audit-401-vs-interceptor interaction (OQ-1) and the
actor-permission-matrix backend-truth read (OQ-3).

**Technical approach.** RF-6 builds on the merged RF-1 stack as **fixed context**
(react-router data-router inline in `src/App.tsx`, TanStack Query as the
query/cache layer, the shared `src/lib/client.ts` wrappers + `Banner`/`InlineError`
surface + `ActiveContextProvider` scope, `src/styles` tokens). This plan resolves
RF-6's own decisions (R6-1..R6-6) — all of which **reuse** RF-1 primitives and
add **no** dependency — fixes (a) surface sequencing (SF-6-1 → SF-6-2), (b) the
consumption boundary (one operation, generated client only, never the POS
ingestion endpoint), (c) the content-route attachment mechanism, and (d) the
validation-gate shape RF-6 must define.

---

## Technical Context

| Item | Value | Source / gate |
| --- | --- | --- |
| Language / framework | TypeScript (strict) + React 19 + Vite 6 SPA | Slice 002 D-1/D-8 (fixed) |
| API consumption | Generated client `src/generated/`, `openapi-fetch` | Slice 002 D-2/D-7; Constitution Principle 8 |
| Data-Pulse-2 pin | `62d0906` | Slice 002 C-4 (fixed for this slice) |
| Auth transport | `dp2_session` cookie (HttpOnly+Secure+SameSite=Lax); `listAuditEvents` is GET → no CSRF concern | Foundation contract §Transport; slice 002 C-2; RF-1 OQ-3 resolved |
| Unit/integration tests | Vitest | Slice 002 D-3 |
| E2E tests | Playwright (in CI) | Slice 002 D-4/D-6 |
| Lint/format | Biome | Slice 002 D-5 |
| Router / route attachment | react-router **nested routes + `<Outlet/>`** in the `AppShell` content area; Overview becomes the index route, `/audit` a sibling — *reuses RF-1's react-router approval (R3-1); no new dep* | research R6-1; clarify Session 2026-06-06 |
| Audit list query state | TanStack Query cache keyed by **active scope + filter set**; `useInfiniteQuery` for cursor paging (`getNextPageParam` reads `next_cursor`) — *reuses RF-1's TanStack Query approval (R3-2/R3-3); no new dep* | research R6-2; clarify Session 2026-06-06 |
| Data-fetching | `listAuditEvents` typed wrapper added to `src/lib/client.ts` (same `{status,data,error}` shape), via `apiClient.GET("/api/v1/audit/events", { params: { query } })` — *no new dep* | research R6-3; clarify Session 2026-06-06 |
| Table rendering | Plain semantic `<table>` styled from existing `tokens.css` + `controls.css` (+ an audit-table stylesheet); no virtualization/grid dep at ≤200 rows/page | research R6-4; clarify Session 2026-06-06 |
| Filter controls + error surface | Uncontrolled native inputs (no form lib) + reused `Banner`/`InlineError`; native date-time inputs | research R6-5; clarify Session 2026-06-06 |
| Row inspect | Right drawer (`role="dialog"`) composed from existing surface/overlay tokens; reads the already-fetched row (no backend call) | research R6-2; design-brief §3 |

**Clarify resolutions (Session 2026-06-06).** R6-1..R6-6 are resolved above. **New
runtime dependencies introduced: NONE.** RF-6 reuses react-router and TanStack
Query (already approved for RF-1 under Constitution Principle 9 in slice 003's
gate-approval) and adds no library. If a future need (e.g., list virtualization
for very large pages, a headless table for column config) emerges, it is recorded
*then* as *selected, pending Principle 9* — it is **not** anticipated for this
slice. Behavioral resolutions (OQ-1 audit-401 reachability tested against RF-1
code, OQ-4 cursor load-more, scope-switch reset) live in [`spec.md`](./spec.md)
Clarifications, not here.

**Constitution Check.** This plan introduces no `package.json`, lockfile, CI,
deployment, or secret change. It adds **no** new dependency (so Principle 9 is not
re-triggered). It consumes exactly **one** operation (`listAuditEvents`) and never
the POS ingestion endpoint (Principles 1/3/6/8 hold; FR-006-001/006/013). It
modifies no foundation, slice-002, or slice-003 *spec* artifact; the three
**source** shared-file touches (`src/App.tsx` route, `src/shell/AppShell.tsx`
`<Outlet/>` + nav un-gate, `src/lib/client.ts` wrapper) are additive and
behavior-preserving for RF-1. RF-6 is read-only (no mutation; Principle 1).
**All checks pass at plan level.** Residuals before the implementation gate:
OQ-3 (actor matrix, FR-005 backend-truth read) and OQ-5 (POS sub-row re-verify,
FR-006-007); OQ-1 is a behavioral edge that may, if its defensive branch is
pursued, raise an RF-1 amendment (it does **not** block the `stable` core).

---

## Surface sequencing (build order, not UX flow)

RF-6's surfaces and the shell-attachment have a dependency order. Implementation
(post-gate) should follow it:

1. **Shell attachment + client wrapper first.** Add the `listAuditEvents` wrapper
   to `src/lib/client.ts`; add the content `<Outlet/>` to `AppShell` and the
   nested `/audit` route to `App.tsx`; un-gate the `Audit` nav entry. This is the
   shared-file, sequential-implement-sensitive layer (see §Shared-file note). It
   must be done before either surface renders.
2. **SF-6-1 — Audit search table second.** The list query (scoped + filtered,
   cursor-paged), the filter bar, the state matrix (pre-query / loading / rows /
   empty-after-filter / 401 / 403 / generic). Consumes `listAuditEvents`.
3. **SF-6-2 — Row inspect last.** The right drawer reading an already-fetched
   SF-6-1 row (no backend call). It cannot be built or tested without SF-6-1
   producing rows to inspect.

Rationale: SF-6-2 has no data without SF-6-1; both have nowhere to mount without
the shell attachment.

---

## Per-decision discipline (reuse, not re-decide)

Unlike RF-1 (which *deferred* its primitives to clarify), RF-6 **inherits**
resolved primitives. The discipline:

- `/speckit-plan` (this document) records that each R6-N **reuses** a merged RF-1
  primitive and adds no dependency. Where RF-6 genuinely differs (the content
  `<Outlet/>`, `useInfiniteQuery` for paging, the audit-table + drawer styling),
  the difference is additive and built from existing tokens/components.
- `/speckit-clarify` resolved R6-1..R6-6 (recorded in research.md), and tested
  OQ-1 against the merged RF-1 code.
- No R6-N answer adds a runtime dependency. If one ever did, it would land only at
  implementation after Principle 9 approval and be justified in `tasks.md` —
  none is anticipated.

---

## Validation-gate shape (the 5th FR-008 gate, defined here, approved later)

RF-6's validation gates (to be ratified in `tasks.md` per spec OQ-6):

- **VG-1 — Unit coverage.** Vitest unit coverage ≥ the repo threshold for the
  SF-6-1 filter/query-key reduction, the cursor "load more" append logic, and the
  state-matrix branching (200-empty vs pre-query vs 401 vs 403 vs generic).
- **VG-2 — E2E journeys.** Playwright journeys covering: scoped search + filter
  (S1), POS-event row surfaced read-only (S2), row inspect drawer from list
  payload (S3), 403 not-permitted (S4), empty-after-filter vs pre-query (S5),
  scope-switch resets the search (S6). Driven against an approved mock
  (FR-006-013), not live DP2.
- **VG-3 — Boundary grep.** A check that no hand-written `fetch(`/XHR targets a
  Data-Pulse-2 path (only the generated client is used); no OpenAPI bytes copied;
  no `Authorization: Bearer`/`device_token_attestation` set by the console.
- **VG-4 — No-scope-creep grep.** A check that **`posAuditEventsSync` is never
  referenced** (the POS ingestion endpoint is never consumed), no invented
  `getAuditEvent`/`readAuditEvent` operation appears, and no mutation/export
  affordance is wired (read-only, FR-006-009).

These are *defined* here and *approved* as part of the FR-008 gate; this plan does
not run them (no code exists yet).

---

## What this plan does NOT do

- Does not re-pick RF-1's router/state/data-fetching/form/error-surface (reused).
- Does not create `src/` files, route files, components, hooks, or tests.
- Does not regenerate or re-pin `src/generated/schema.d.ts`.
- Does not add a dependency (zero new dep) or a mock (FR-006-013).
- Does not call, mock, or reference `posAuditEventsSync` as consumed (FR-006-006/013).
- Does not promote the POS sub-rows off `draft` (FR-006-007).
- Does not resolve OQ-1's defensive branch (a fix there is an RF-1 amendment).
- Does not modify any foundation, slice-002, or slice-003 *spec* artifact.
- Does not clear any FR-008 gate — it is one input to the gate.

---

## Next Spec Kit phases

1. `/speckit-clarify` resolved OQ-1..OQ-6 (spec) and R6-1..R6-6 (research),
   self-confirmed (headless). Done.
2. `/speckit-tasks` produces `tasks.md` for RF-6, tracing each task to a surface
   (SF-6-1/2), the design-brief state matrix, and the shared-file touches.
3. `/speckit-analyze` cross-artifact consistency (read-only).
4. FR-008 five-gate approval for slice 006 specifically (incl. OQ-3 actor-matrix
   read + OQ-5 POS re-verify for any POS-dependent feature).
5. Implementation, in the attachment → SF-6-1 → SF-6-2 order above, **sequential**
   with sibling slices on the shared files.

---

**End of Implementation Plan: RF-6 Audit / Search.**

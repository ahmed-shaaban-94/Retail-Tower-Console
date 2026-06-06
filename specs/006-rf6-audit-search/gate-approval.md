# FR-008 Implementation Gate Approval — Slice 006 (RF-6 Audit / Search)

**Date:** 2026-06-06
**Owner / approver:** Ahmed Shaaban (repository owner)
**Branch:** `006-rf6-impl`
**Authority:** Constitution v1.0.1 §Implementation readiness gates; foundation FR-008.

> Records the owner's explicit approval to begin RF-6 implementation ("merged,
> fire") — the final slice of the sequential 004 → 005 → 006 arc. The gate guards
> against accidental scope creep, not the owner's direct, recorded instruction. A
> gate cleared for 004/005 does **not** carry to 006; this is the per-slice record
> FR-008 demands.

## Five-gate checklist (Constitution v1.0.1)

- [x] **Spec approved** — `spec.md` (clarified Session 2026-06-06; PR #27).
- [x] **Plan approved** — `plan.md` (primitives resolved as reuse of RF-1; PR #27).
- [x] **Task list approved** — `tasks.md` (33 tasks; PR #27; verify-audited — the
      generated-client blocker it surfaced was repaired pre-merge).
- [x] **API dependency map approved** — `api-readiness.md` +
      `contracts/rf6-audit-search.md`: the single operation `listAuditEvents`
      (`GET /api/v1/audit/events`, `audit.openapi.yaml`) confirmed present in the
      regenerated client at pin `62d0906`. Response `{ items: AuditEvent[],
      next_cursor: string | null }`; query params action/actor_user_id/store_id/
      from/to/cursor/limit; documented codes 200/401/403.
- [x] **Validation gates defined and approved** — VG-1 (Vitest coverage), VG-2
      (Playwright journeys S1–S6), VG-3 (boundary grep), VG-4 (no-scope-creep:
      no `posAuditEventsSync`, no invented single-event read, no mutation/export
      affordance — scoped to RF-6 files), per `plan.md` and `tasks.md` Polish.

## Constitution Principle 9 — dependency approval

**No new runtime dependency is added by slice 006.** RF-6 reuses RF-1's resolved
primitives (react-router, @tanstack/react-query incl. `useInfiniteQuery` for
cursor pagination, openapi-fetch generated client, ActiveContextProvider,
Banner/InlineError, uncontrolled native forms) and RF-5's shared `Drawer`
primitive — verified against `package.json` at implementation start. No table/grid
or virtualization library: a ≤200-rows/page cursor list does not justify one
(research R6-4).

## openapi-ts.config.ts edit — regeneration, NOT a re-pin (T005)

Added `audit.openapi.yaml` to `OPENAPI_SOURCE_SPECS` and re-ran
`pnpm generate:client` **at the unchanged pin `62d0906`** so `schema.d.ts` exposes
`listAuditEvents`. Regeneration at the unchanged pinned SHA, not a re-pin
(`DATA_PULSE_2_PIN` unchanged). Edits a slice-002 scaffold config surface — the
explicit acknowledgment of that touch at the gate. Generated output never
hand-edited.

## OQ-3 — actor → RF-6 permission matrix (T002)

Resolved against the pinned audit contract @ `62d0906`: the audit API is scoped
to **tenant-admin or platform-admin** (contract description "Tenant-admin or
platform-admin scope"); insufficient role → **403**, no active tenant → **401**.
RF-6 enforces **no** frontend authorization (Principle 7, FR-006-004): it renders
the backend-scoped result, never pre-hides by role, and surfaces a backend 403 as
a permission banner with `request_id`. The store-filter visibility is **scope-driven**
(shown when a store dimension is in scope), never role-driven.

## OQ-5 — POS sub-rows (T003): no-op for this slice

POS-originated audit events (`shift.*`, `operator.session.takeover`,
`cashier.pin.*`) render as **ordinary rows showing the raw `action` string**
(research R6-6); RF-6 calls **no** POS operation and never `/api/pos/v1/*`. No
POS-specific label/icon/filter-preset is wired, so the `draft` POS sub-row
re-verification (OQ-5) does not gate this slice. POS-event fixtures use the
action-code strings only, never a POS path or operationId (preserves RF-5's
VG-4 POS-boundary gate).

## OQ-1 — audit 401 NOT special-cased (T022)

`listAuditEvents` documents a `401` ("No active tenant"). Per the clarified
resolution, RF-6 does **not** special-case it at this slice. Verified against the
merged RF-1 code: `createAuthRetry` is per-call (wraps only `getActiveContext`),
so an audit `401` does **not** flow through the refresh/sign-out interceptor — and
RF-6 deliberately does **not** wire `createAuthRetry` around `listAuditEvents`
(that would be scope creep). A mid-search expiry renders defensively as a
persistent `Banner` with `request_id`; the scope gate makes "no active tenant"
unreachable on the normal path. Scenario S7 has no dedicated task (delegated to
the shared interceptor for the real-expiry case; exercised incidentally by VG-2).

## Scope reaffirmed

- Consumes exactly the one operation `listAuditEvents`. No `posAuditEventsSync`,
  no invented single-event read (FR-006-001).
- Read-only: no mutation / export / annotation affordance (FR-006-009); the
  inspect drawer reads the already-fetched row, issuing no extra call (OQ-2).
- Cookie transport, no bearer, no device-token attestation (FR-006-003).
- No frontend authorization; backend-scoped results; roles display-only
  (Principle 7, FR-006-004/005).
- Tests use a `disposable: true` mock (FR-006-013) with a removal task; never
  live DP2.

## Build order (plan.md)

Setup → Foundational (client wrapper, `/audit` route, un-gate Audit, scope-keyed
query — the `<Outlet/>` already exists from slice 004, so T007 is a no-op) →
SF-6-1 audit table (**MVP — STOP and VALIDATE**) → SF-6-2 inspect drawer (reuses
RF-5's `Drawer`) → Polish. TDD per surface (VG-1/VG-2 are gate items).

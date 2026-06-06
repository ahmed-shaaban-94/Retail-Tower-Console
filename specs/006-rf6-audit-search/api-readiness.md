# API Readiness — 006 RF-6 Audit / Search

| Field | Value |
| --- | --- |
| Spec | [spec.md](./spec.md) |
| Feature ID | 006 |
| Short name | rf6-audit-search |
| Branch | `006-rf6-audit-search` |
| Mode | Planning-only (per-slice readiness carried forward from foundation) |
| Owner | Ahmed Shaaban |
| Created | 2026-06-06 |
| Data-Pulse-2 pin | `62d0906` (slice 002 C-4 — the SHA the generated client is produced against) |
| Status | **Dual** — `stable` (audit query + operational-event search) / `draft` (POS-originated event sub-rows). Carried forward by reference from [`../001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md) §RF-6. This file does not re-derive or re-classify. Two residuals before the implementation gate: the actor→RF-6 permission matrix (OQ-3) and the POS sub-row re-verification (OQ-5). |

---

## Purpose

This is the per-slice readiness artifact for RF-6. It exists to:

1. **Carry forward** the foundation RF-6 dual readiness by reference, so the RF-6
   plan/tasks can cite a single per-slice readiness record (foundation
   `api-readiness.md` §How to update — downstream slices do not re-verify a
   `stable` row absent a logged demotion; they DO re-verify a `draft` row before
   an implementation gate that depends on it).
2. **Record the residuals** RF-6 must resolve before its FR-008 implementation
   gate clears: the actor→RF-6 permission matrix (spec OQ-3) and the POS-event
   sub-row re-verification (spec OQ-5).
3. **Satisfy FR-005** (re-verify a non-`stable` residual before the
   implementation gate) and **FR-011** (no optimistic classification).

This file does **not** copy Data-Pulse-2 OpenAPI content (reference only) and
does **not** authorize implementation (FR-008 five-gate approval still required).

---

## Status legend

Same four statuses as foundation `spec.md` §6 / `api-readiness.md` (no
additional statuses): `stable` / `draft` / `blocked` / `unknown`. The foundation
§Status legend "Version-suffix convention rule" and "Promotion rule" apply
unchanged; this slice does not re-state them.

---

## RF-6 — Audit / search (carried forward, dual)

Carried forward from the foundation level against Data-Pulse-2 `main @ 62d0906`
(foundation RF-6 verification; corroborated by the upstream
`001-foundation-auth-tenant-store/sc-verification.md` SC-7 for the audit core).
RF-6 **consumes** this readiness; it does not re-verify a `stable` row absent a
logged demotion, and it inherits the `draft` ceiling on the POS sub-rows.

| Backend surface (named, not specified) | Status | Carried from | Notes |
| --- | --- | --- | --- |
| Audit query + operational-event search (`listAuditEvents`) | `stable` | [`../001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md) §RF-6 | `GET /api/v1/audit/events`, `audit.openapi.yaml`. Returns `{ items: AuditEvent[], next_cursor }`; filters `action`/`actor_user_id`/`store_id`/`from`/`to`/`cursor`/`limit`. Errors **200/401/403 only** (401 = "no active tenant", a precondition — see Residual / OQ-1). SC-7 Verified. Consumed by SF-6-1; SF-6-2 reads the same payload. |
| POS-originated event sub-rows (`shift.*` / `operator.session.takeover` / `cashier.pin.*`) surfaced **through** `listAuditEvents` | `draft` | §RF-6 | Catalogue lives in `pos-audit-events.openapi.yaml` (`v1.0.0-draft`, no `sc-verification.md`, append-only). Persisted to the same `audit_events` table the query reads. **Read-through only** — the console never calls the POS ingestion endpoint (`posAuditEventsSync`, a write/device-auth path). Re-verify before any gate that depends on POS-specific labels/filters (OQ-5). |

**Gate impact.** The `stable` audit core is met for planning and may be planned
to gate independently. The console may not *begin implementation* until the full
FR-008 five-gate approval for this slice, and until the two residuals below are
resolved (FR-005).

---

## Residuals to resolve before the implementation gate

| Residual | Status | To verify against | Notes |
| --- | --- | --- | --- |
| Actor → RF-6 permission matrix (spec OQ-3) | **open** | Data-Pulse-2 authorization model @ `62d0906` (foundation OQ-4) | Contract prose says "tenant-admin or platform-admin scope"; foundation §4 grants A4/A5 store-scoped audit/search. RF-6 renders backend truth (incl. 403) and pre-judges nothing (FR-006-004), but the *actual* shape across A1–A5 must be confirmed before the API-dependency gate so the design-brief's empty/403 states are accurate. A read of backend truth, NOT a frontend decision. |
| POS-event sub-row re-verification (spec OQ-5) | **open (draft ceiling)** | `pos-audit-events.openapi.yaml` @ `62d0906` + POS-Pulse emission semantics | The POS sub-rows are `draft`. The `stable` core (rendering arbitrary `action` strings as generic rows) proceeds without this. Any POS-label-dependent feature must re-verify the catalogue + emission before its gate (FR-006-007). |
| Audit 401 vs RF-1 interceptor (spec OQ-1) | **open (behavioral)** | Merged RF-1 source: `src/lib/auth-interceptor.ts`, `src/context/useActiveContext.ts`, `src/shell/ProtectedArea.tsx` | Not a readiness/contract gap — a *behavioral* interaction: the audit 401 ("no active tenant") differs from the RF-1 expiry-401 the interceptor assumes. Recorded here because resolving it may touch RF-1 code (an amendment). Resolution belongs to `/speckit-clarify` tested against the code; if reachability is ruled out (scope gate guarantees an active tenant before RF-6 is reachable), this closes without an RF-1 change. |

These are RF-6's residuals. They do **not** demote any RF-6 row; OQ-3/OQ-5 are
the foundation-reserved confirmations for this slice and OQ-1 is a downstream
behavioral interaction.

---

## What this slice does NOT touch in readiness

- It does not re-classify the audit core (carried `stable`) or the POS sub-rows
  (carried `draft`).
- It does not promote the POS sub-rows to `stable` (no `sc-verification.md`
  exists upstream; FR-006-007).
- It does not touch RF-1..RF-5 / RF-7 rows (out of scope).
- It does not re-pin the generated client (pin `62d0906` is slice-002-owned).
- It does not call or assert anything about `posAuditEventsSync` beyond "never
  consumed" (FR-006-006/013).

---

## How to update this file

If a residual is resolved during this slice's `/speckit-clarify` or a pre-gate
verification, record the exact Data-Pulse-2 reference (`main @ <sha>` or
`OpenAPI @ <path>:<sha>`), the date (ISO `YYYY-MM-DD`), and the confirmer, and
mirror the resolution in `spec.md` §10 in the same edit. Do not copy
Data-Pulse-2 contract content into this file (reference only). If a foundation
RF-6 row is ever demoted, this carried-forward record must be re-checked.

---

## Verification log

A dated, append-only journal. Most recent first.

### 2026-06-06 — Initial creation (RF-6 readiness carried forward, dual)

- File created from `/speckit-specify` for slice 006.
- RF-6 recorded **dual**: audit core (`listAuditEvents`) `stable`; POS-originated
  event sub-rows `draft` — **carried forward by reference** from foundation
  `api-readiness.md` §RF-6 (pin `62d0906`). No re-derivation; no optimistic
  re-classification.
- Error matrix (200/401/403) read directly from `audit.openapi.yaml` end-to-end;
  401 = "No active tenant" (precondition, not expiry) noted as the OQ-1 driver.
- Residuals recorded: OQ-3 (actor matrix), OQ-5 (POS sub-row re-verify), and the
  OQ-1 behavioral interceptor interaction (may touch RF-1).
- Confirmer: Ahmed Shaaban.
- Verified against: this commit on branch `006-rf6-audit-search`, citing the
  foundation verification at Data-Pulse-2 `main @ 62d0906`.

---

**End of API Readiness: 006 RF-6 Audit / Search.**

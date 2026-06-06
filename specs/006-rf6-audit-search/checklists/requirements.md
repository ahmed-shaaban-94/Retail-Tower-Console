# Specification Quality Checklist: RF-6 Audit / Search

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-06-06
**Feature**: [spec.md](../spec.md)
**Spec Kit phase**: post-`/speckit-specify`, pre-`/speckit-clarify`

---

## Content Quality

- [x] No implementation details (router/state/styling/component names, file paths under `src/` as RF-6 *choices*, route paths)
- [x] Focused on user value and backend-truth rendering (audit search + inspect), not UI mechanics
- [x] Written for reviewers and downstream-slice authors
- [x] All mandatory sections completed

**Notes**: The spec names surfaces SF-6-1/SF-6-2 by responsibility and the single
consumed operation by operationId/method/path, with no framework primitive
choice. The RF-1/slice-002 stack is referenced only as *fixed context*. The
shared-file paths (`src/App.tsx`, `src/shell/AppShell.tsx`, `src/lib/client.ts`)
are named as **verified collision flags**, not as RF-6 primitive choices — these
were read at planning time (App.tsx routes are inline; there is no
`src/lib/router.tsx`; `GATED_NAV` lists `Audit`/`RF-6`).

---

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined (S1..S7)
- [x] Edge cases are identified (S4 403, S5 empty-vs-pre-query, S6 scope-switch reset, S7 401 expiry vs precondition)
- [x] Scope is clearly bounded (exactly one operation; SF-6-1/SF-6-2; read-only)
- [x] Dependencies and assumptions identified

**Notes**:
- No `[NEEDS CLARIFICATION]` markers were used. Deferred per-screen primitive
  decisions live in `spec.md` §10 (OQ-1..OQ-6) and `research.md` (R6-1..R6-5),
  mirroring the foundation / slice-003 posture.
- The error matrix (200/401/403) is derived from reading `audit.openapi.yaml`
  end-to-end. The 401 = "No active tenant" (precondition, not expiry) meaning is
  surfaced as OQ-1 against the RF-1 interceptor — flagged, not silently fixed.
- The single-operation boundary is the explicit scope bound; `posAuditEventsSync`
  (POS ingestion, a write endpoint) and the absence of a single-event read op are
  both named so exclusion is visible (FR-006-001 / AC-2).

---

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows (S1 search, S2 POS event, S3 inspect) and edge flows (S4/S5/S6/S7)
- [x] Feature meets measurable outcomes defined in Acceptance Criteria
- [x] No implementation details leak into specification

**Notes**:
- FR-006-001..FR-006-013 each anchor to a foundation FR or constitution
  principle; each is inspectable against an RF-6 plan/tasks/implementation.
- Scenarios S1–S7 illustrate the audit search/inspect journeys; layout and
  interaction design are deferred to `plan.md` + `design-brief.md`.

---

## Boundary Compliance (project-specific)

Added because this repository's constitution and Agent OS playbook impose
boundary rules beyond the generic Spec Kit template.

- [x] Spec stays inside Retail-Tower-Console boundaries (no backend, no POS, no infra ownership)
- [x] No Data-Pulse-2 OpenAPI contract content is copied into this slice (POS catalogue values referenced as possible `action` values, not reproduced)
- [x] No POS-Pulse runtime concern is referenced as in-scope — A6 named as producer/subject only; `posAuditEventsSync` named only to assert it is NEVER consumed (FR-006-006/013)
- [x] No ERPNext / Connector surface is called or referenced as in-scope
- [x] Exactly the one foundation RF-6 operation is consumed; no scope expansion (FR-006-001 / foundation FR-009)
- [x] FR-006-002 (generated client only), FR-006-010 (no scaffold/package/CI), FR-006-012 (full FR-008 gate) asserted at spec level
- [x] RF-6 readiness carried forward **dual** (`stable` audit core / `draft` POS sub-rows); not optimistically re-classified — FR-005/FR-011, OQ-5
- [x] No `[ ]` item in the spec authorizes a forbidden file (`package.json`, lockfile, new `src/` create, CI, deployment, `.env*`); the three shared-file touches are additive and flagged for sequential implement
- [x] No foundation, slice-002, or slice-003 spec artifact is modified (FR-006-011)
- [x] Spec cross-references the constitution, foundation spec/api-readiness, RF-1 slice + the merged RF-1 source files it reasons about, and slice 002
- [x] The 401-meaning collision with the RF-1 interceptor is recorded as a genuine OQ tested against the merged RF-1 code (OQ-1), not asserted-fixed (the 004 near-miss class)

---

## Validation Iterations

- **Iteration 1** (2026-06-06): All items pass on first write. The error matrix
  and the A6 producer/consumer boundary were derived from reading both contracts
  end-to-end; the 401/interceptor interaction was checked against the merged RF-1
  source (`auth-interceptor.ts`, `useActiveContext.ts`, `ProtectedArea.tsx`).

---

## Hand-off readiness

- [x] Spec is ready for `/speckit-clarify` to resolve OQ-1..OQ-6 (interceptor/401, inspect, actor matrix, pagination, POS re-verify, validation gates)
- [x] Spec is ready for `/speckit-plan` after the owner reviews §10. OQ-1 (audit 401 vs interceptor) and OQ-3 (actor matrix) are the highest-impact items for the eventual implementation gate.

---

## Notes

- The "no `[NEEDS CLARIFICATION]` markers remain" item is satisfied by *not using
  the marker*; deferred decisions live in §10 Open Questions and `research.md`.
- RF-6 readiness is carried forward from the foundation; the pre-implementation
  residuals are OQ-3 (actor matrix) and OQ-5 (POS sub-row re-verify), both
  reserved by the foundation for this slice.

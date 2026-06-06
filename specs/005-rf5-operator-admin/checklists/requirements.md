# Specification Quality Checklist: RF-5 Operator / Admin Management

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-06-06
**Feature**: [spec.md](../spec.md)
**Spec Kit phase**: post-`/speckit-specify`, pre-`/speckit-clarify`

---

## Content Quality

- [x] No implementation details (router/state/styling/component names, file paths under `src/`, route paths)
- [x] Focused on user value and backend-truth rendering (the membership-graph behavior), not UI mechanics
- [x] Written for reviewers and downstream-slice authors
- [x] All mandatory sections completed

**Notes**: The spec names surfaces SF5-1..SF5-4 by responsibility and the five
consumed operations by operationId/method/path, with no framework primitive
choice. The slice-002 stack and RF-1's resolved primitives are referenced only as
*fixed context to reuse*, never re-decided (spec AC-5). The generated-client
location `src/generated/` is named because it is a slice-002-fixed fact, not an
RF-5 implementation choice. RF-1 surfaces SF-1/SF-2/SF-3 are named by reference
(allowed by AC-5).

---

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined (S1..S7)
- [x] Edge cases are identified (S3 precondition-401, S6 expiry-401, S2 idempotency replay/409, S5 revoke 404, S7 invalid token)
- [x] Scope is clearly bounded (exactly five operations; SF5-1..4 only; A6 excluded; RF-2 `listStores` excluded)
- [x] Dependencies and assumptions identified

**Notes**:
- No `[NEEDS CLARIFICATION]` markers were used. Deferred / cross-slice decisions
  live in `spec.md` §10 (OQ-1..OQ-6) and `research.md` (R5-1..R5-6) as the
  documented place for them, mirroring the RF-1/foundation posture.
- Acceptance criteria AC-1..AC-9 are the testable acceptance set for this spec.

---

## Boundary & Constitution Compliance

- [x] A6 / POS-operator surface explicitly excluded with the five excluded ops named (§6.4, FR-005-013, Principle 3)
- [x] Generated-client-only consumption asserted (FR-005-002, Principle 8)
- [x] No frontend authorization; 403/404 rendered verbatim (FR-005-004, Principle 7)
- [x] No backend/schema/OpenAPI ownership; no contract bytes copied (AC-7, Principles 2/6)
- [x] No package/lockfile/CI change; no new runtime dependency (FR-005-010, Principle 9)
- [x] Foundation + slice-002 + slice-003 immutability asserted (FR-005-011)
- [x] FR-008 five-gate precondition asserted before any code (FR-005-012)

**Notes**: The A6 boundary is the highest-risk item for this slice; it is
asserted in §4 (actor row), §6.4 (excluded ops list), FR-005-013, and the
contract file. The `pos-operators.openapi.yaml` contract was read end-to-end to
exclude it precisely, not from a grep.

---

## Error-Matrix & 401-Disambiguation (read the contracts, not greps)

- [x] Error matrix derived from reading the contracts end-to-end (400/401/403/404/409/425)
- [x] `createInvitation` 401 (precondition "no active tenant") distinguished from session-expiry 401 (FR-005-007, OQ-1)
- [x] Idempotency contract specified (Idempotency-Key, Idempotent-Replayed, idempotency_key_conflict terminal, 425 retry) (§6.3, FR-005-008)
- [x] Uniform 404 (leak-avoidance) specified (FR-005-009, VD-5)
- [x] `acceptInvitation` public (`security: []`) flow scoped (SF5-4, OQ-2)

**Notes**: The 401-meaning distinction is the make-or-break correctness item
(the kind the 004 verify caught by reading code). It is grounded against RF-1's
actual `createAuthRetry` behavior (refresh-once; session-lost only on refresh
failure), cited file:line in `plan.md`/`research.md` — not assumed from the
pattern. The vendored-client subset gap (OQ-5) is recorded as a gated impl task,
not a planning blocker.

---

**End of Specification Quality Checklist.**

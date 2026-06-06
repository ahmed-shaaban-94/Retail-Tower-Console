# FR-008 Implementation Gate Approval — Slice 003 (RF-1 Auth Shell)

**Date:** 2026-06-06
**Owner / approver:** Ahmed Shaaban (repository owner)
**Branch:** `003-rf1-impl`
**Authority:** Constitution v1.0.1 §Implementation readiness gates; foundation FR-008.

> This file records the owner's explicit approval to begin RF-1 implementation.
> The owner instructed implementation directly ("end to end implement … fire").
> The gate guards against accidental scope creep, not the owner's direct,
> recorded instruction. This is the written trail the constitution requires.

## Five-gate checklist (Constitution v1.0.1)

- [x] **Spec approved** — `spec.md` (clarified Session 2026-06-06, PR #17).
- [x] **Plan approved** — `plan.md` (primitives resolved; PR #17).
- [x] **Task list approved** — `tasks.md` (36 tasks; PR #18; analyzed 0-critical, code-reviewed).
- [x] **API dependency map approved** — `api-readiness.md`: all three RF-1 rows
      `stable` @ pin `62d0906`; the sole residual (OQ-3 CSRF) **resolved
      2026-06-06** (no CSRF token required; cookie transport only).
- [x] **Validation gates defined and approved** — VG-1 (Vitest coverage),
      VG-2 (Playwright journeys S1–S7), VG-3 (boundary grep), VG-4 (no-scope-creep
      grep), per `plan.md` and `tasks.md` Polish phase.

## Constitution Principle 9 — dependency approval

The following NEW runtime dependencies are approved for addition to
`package.json` (only these two; FR-003-009):

- [x] **react-router** `^7.17.0` (data-router pattern) — SF-1↔SF-2/SF-3 routing + 401 guard (R3-1).
- [x] **@tanstack/react-query** `^5.101.0` — data fetching for the seven
      operations + read-only active-context cache (R3-2/R3-3).

Form handling (uncontrolled native) and the error surface (inline + banner) add
**no** dependency. Exact versions pinned at install time; lockfile updated in the
same change.

## Scope reaffirmed

- Consumes exactly the seven RF-1 operations; the four out-of-scope auth ops stay excluded.
- Generated client consumed as-is from `src/generated/` @ `62d0906`; not edited, not re-pinned.
- No backend/schema/migration/OpenAPI/POS code (Principles 1, 3, 6).
- Tests use a `disposable: true` mock (FR-003-012) with a removal task (T036); never live DP2.

## Build order (plan.md)

SF-3 (active-context provider) → SF-1 (sign-in) → SF-2 (app shell). TDD per phase
(tests before implementation; VG-1/VG-2 are gate items, not optional).

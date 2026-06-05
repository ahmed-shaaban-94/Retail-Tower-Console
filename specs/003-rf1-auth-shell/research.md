# Phase 0 Research: RF-1 Auth Shell & Active Context

**Feature**: 003-rf1-auth-shell
**Phase**: 0 — Outline & Research
**Date**: 2026-06-05
**Input**: [`plan.md`](./plan.md) Technical Context, [`spec.md`](./spec.md) §10 Open questions
**Foundation reference**: [`001-console-foundation/research.md`](../001-console-foundation/research.md) R-4..R-8 (the deferred per-screen decisions this slice inherits)

---

## R3-0 Posture (read this first)

The slice-002 stack decisions (framework, build tool, package manager, test
frameworks, lint/format, generated-client toolchain + storage) are **resolved
and fixed** (slice 002 D-1..D-8). RF-1 does not re-open them.

What remains deferred at RF-1 are the **per-screen primitives** the foundation
explicitly assigned to "slice 003" (foundation `research.md` R-4 through R-7,
and R-8 i18n): a router, an active-context state store, a data-fetching
strategy, sign-in form handling, and an error/notification surface.

This document lists, for each deferred RF-1 decision: the constraint any future
answer MUST satisfy, the alternatives already on the table, and the gating
mechanism (resolved in `/speckit-clarify`, dependency approved per Constitution
Principle 9). It does **not** pick values — that is the clarify skill's job.

---

## R3-1 — Routing / route-guard primitive

- **Constraint:** Must enforce the SF-1 (public) ↔ SF-2/SF-3 (protected)
  boundary by *reacting* to backend responses (401 → SF-1), never by a frontend
  authorization decision (spec FR-003-004). Must work in a Vite SPA (no SSR;
  slice 002 D-1). Must allow a redirect-to-sign-in interceptor wired to the
  generated client's responses.
- **Alternatives already considered** (foundation `research.md` R-5):
  react-router, TanStack Router, wouter, hand-rolled history-based routing.
- **Decision deferred to:** this slice's `/speckit-clarify`. Any library added
  to `package.json` requires Constitution Principle 9 approval first.

## R3-2 — Active-context state store

- **Constraint:** Must hold the `getActiveContext` result as a **read-only
  projection** (spec FR-003-005). Mutations go through the three context
  endpoints + a re-fetch — no optimistic local mutation. Must clear store-scoped
  state on tenant switch (FR-003-006) and drop all context on 401 (S5).
- **Alternatives already considered** (foundation `research.md` R-4): React
  Context + reducer, Zustand, Jotai, Redux Toolkit, TanStack Query cache as the
  store.
- **Decision deferred to:** `/speckit-clarify`. Note R3-2 and R3-3 are coupled
  (a data-fetching cache may double as the context store).

## R3-3 — Data-fetching strategy for the seven operations

- **Constraint:** Must call the seven operations through the generated client
  (`openapi-fetch`, slice 002 D-2) — no hand-rolled `fetch` to a DP2 path (spec
  FR-003-002). Must support the re-fetch-after-mutation pattern (FR-003-005), a
  401 interceptor (S5), and the proactive `refreshSession` cadence (OQ-2). Must
  run in tests without a live DP2 (slice 002 C-5).
- **Alternatives already considered** (foundation `research.md` R-4): TanStack
  Query over `openapi-fetch`, SWR, plain `openapi-fetch` calls in effects, a
  thin custom hook layer.
- **Decision deferred to:** `/speckit-clarify`.

## R3-4 — Sign-in form handling

- **Constraint:** Collects credentials for `signIn`; must surface the `signIn`
  401 generically (no account-existence leak) and the 429 retry-after with a
  disabled submit (spec FR-003-007). Must not store credentials beyond the
  request. No secret/credential committed (FR-003-009).
- **Alternatives already considered:** React Hook Form, TanStack Form,
  uncontrolled native form + minimal validation.
- **Decision deferred to:** `/speckit-clarify`.

## R3-5 — Error / notification rendering surface

- **Constraint:** Must render the RF-1 error behaviors (FR-003-007/008) and
  surface the backend `request_id` in user-visible messages (data-model VD-4).
  Must render uniform 404 (VD-5). Reusable by RF-2..RF-7 later.
- **Alternatives already considered** (foundation `research.md` R-7): a toast
  library, an inline error component system, a hand-rolled notification context.
- **Decision deferred to:** `/speckit-clarify`.

## R3-6 — i18n posture (carried, not decided at RF-1)

- **Constraint:** Foundation `research.md` R-8 deferred i18n. RF-1 should not
  hard-block a future i18n layer (avoid baking copy into logic), but choosing an
  i18n library is **not** in RF-1 scope.
- **Decision deferred to:** a later slice (foundation R-8). Recorded here so RF-1
  authors do not silently couple copy to logic.

---

## Constraints common to all RF-1 decisions

These hold regardless of which primitive is chosen (sourced from spec.md FRs +
slice 002 constraints):

- **Generated client only** (FR-003-002, Principle 8) — no hand-rolled DP2 HTTP.
- **Cookie transport, no bearer** (FR-003-003, slice 002 C-2).
- **No frontend authorization** (FR-003-004, Principle 7).
- **Server-resolved context, no optimistic update** (FR-003-005).
- **Test isolation, no live DP2, no unapproved mock** (FR-003-012, slice 002 C-5).
- **No new dependency without Principle 9 approval** (FR-003-009).
- **No foundation/slice-002 artifact modification** (FR-003-010).

---

## Verification policy (carried from foundation R-9)

RF-1 plans against Data-Pulse-2 pin `62d0906` (slice 002 C-4). The RF-1 readiness
is `stable` and carried forward by reference in [`api-readiness.md`](./api-readiness.md);
the one residual (CSRF posture, OQ-3) must be re-verified against the pinned
contract before the FR-008 implementation gate clears (FR-005). RF-1 does not
re-classify the readiness optimistically.

---

**End of Phase 0 Research: RF-1 Auth Shell & Active Context.**

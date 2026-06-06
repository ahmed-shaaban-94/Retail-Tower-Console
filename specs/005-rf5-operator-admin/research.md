# Phase 0 Research: RF-5 Operator / Admin Management

**Feature**: 005-rf5-operator-admin
**Phase**: 0 — Outline & Research
**Date**: 2026-06-06
**Input**: [`plan.md`](./plan.md) Technical Context, [`spec.md`](./spec.md) §10 Open questions
**Foundation reference**: [`001-console-foundation/research.md`](../001-console-foundation/research.md)
**RF-1 reference**: [`003-rf1-auth-shell/research.md`](../003-rf1-auth-shell/research.md) R3-1..R3-5 (the resolved primitives RF-5 reuses)

---

## R5-0 Posture (read this first)

The slice-002 stack (framework, build tool, package manager, test frameworks,
lint/format, generated-client toolchain + storage) is **resolved and fixed**
(slice 002 D-1..D-8). RF-1 (slice 003) then resolved the **per-screen
primitives** — router, server-state store, data-fetching, form handling, error
surface — and *merged* them into `src/`. **RF-5 does not re-open either layer.**
It **reuses RF-1's resolved, merged primitives.**

This document lists, for each RF-5 decision, what RF-1 already resolved (cited to
the merged file:line it was read from), and the **RF-5-specific extension** the
reuse requires. It does **not** re-pick values. RF-5 adds **no new runtime
dependency** (spec OQ-4, FR-005-010).

---

## R5-1 — Routing / new-route registration

- **RF-1 resolution (verified):** react-router (data-router), wired **inline in
  `src/App.tsx:24-32`** as `<BrowserRouter><Routes><Route …></Routes>`. **There
  is NO `src/lib/router.tsx`** — routes register in `App.tsx`.
- **RF-5 extension:** register a new **protected** route for the Operators surface
  (SF5-1..3) and a new **public** route for accept-invitation (SF5-4) **in
  `src/App.tsx`**, alongside the existing `/signin` (public) and `/` (protected)
  routes. SHARED-FILE TOUCH (collides with sibling slices — sequential implement).
- **Constraint:** the protected Operators route reacts to backend truth only
  (401 → handled per R5-4); no frontend authorization (FR-005-004). The public
  accept route mirrors `/signin`'s public placement.
- **Dependency:** none new (react-router already present from slice 003).

## R5-2 — Server-state / membership-graph store

- **RF-1 resolution (verified):** TanStack Query cache is the read-only
  server-state store; `useActiveContext.ts:61-71` holds the context query;
  `src/lib/query.ts` provides `createQueryClient` + `queryKeys`.
- **RF-5 extension:** add a `listMembers` query keyed by `active_tenant.id`; the
  three mutations (`createInvitation`/`updateMembership`/`revokeMembership`)
  invalidate that query (re-fetch, no optimistic mutation — FR-005-005), mirroring
  RF-1's invalidate-after-mutation pattern (`useActiveContext.ts:73-86`).
- **Constraint:** read-only projection; re-fetch after every mutation; no
  optimistic local edit of the member list.
- **Dependency:** none new (TanStack Query already present from slice 003).

## R5-3 — Data-fetching / typed operation wrappers

- **RF-1 resolution (verified):** typed wrappers over the generated `apiClient` in
  `src/lib/client.ts:1-71`, each returning `{ status, data, error }`; cookie
  transport set on the generated client (`credentials: "include"`).
- **RF-5 extension:** add **five** typed wrappers in the same shape
  (`listMembers`, `createInvitation`, `updateMembership`, `revokeMembership`,
  `acceptInvitation`). **`createInvitation` needs a new shape**: it must pass a
  client-generated `Idempotency-Key` **header** in addition to the body (the
  existing wrappers pass body only — see `client.ts:51-56`). SHARED-FILE TOUCH.
- **Constraint:** generated-client only (FR-005-002); no hand-rolled fetch to a
  DP2 path. Requires the client regenerated at pin `62d0906` to expose the RF-5
  paths (OQ-5 — currently the vendored `schema.d.ts` only has auth+context paths).
- **Dependency:** none new (`openapi-fetch` already present).

## R5-4 — 401 handling (the make-or-break extension)

- **RF-1 resolution (verified):** `createAuthRetry` in
  `src/lib/auth-interceptor.ts:32-60` — a **per-call** wrapper (NOT global
  middleware): on 401, `refreshSession` once; if it fails, `onSessionLost()`; if
  it succeeds, re-issue and return the result. `useActiveContext.ts:64-68` maps
  `status===401 → session-lost` **for the context query only**.
- **RF-5 extension:** RF-5's member-graph ops have a **second** 401 cause —
  `createInvitation`/`listMembers` return 401 "No active tenant" (a precondition,
  session still valid). RF-5 wires its **own** `createAuthRetry` instance whose
  `onSessionLost` (refresh-failed path) is the **only** route to sign-out; a 401
  that **survives a successful refresh** is a precondition error → route to the
  RF-1 scope chooser. RF-5 MUST NOT reuse the `useActiveContext`
  "status===401 → session-lost" mapping.
- **Constraint:** FR-005-007 / OQ-1. This is the contradiction a code-blind
  consistency scan would miss — it is grounded in reading the interceptor, not the
  claim. RF-5 owns its interceptor instance (deps injected per-instance), so no
  RF-1 modification is needed (FR-005-011).
- **Open design note (OQ-1):** `createAuthRetry` signals session-loss via the
  injected side effect, not a returned discriminator. RF-5 captures a local
  `refreshOk` flag in its injected `refreshSession`/`onSessionLost` to tell
  "refresh failed (expiry)" from "refresh ok but still 401 (precondition)".
  Resolved at implementation; no RF-1 change.
- **Dependency:** none new.

## R5-5 — Form handling + error/notification surface

- **RF-1 resolution (verified):** uncontrolled native form + minimal validation
  (no form library, RF-1 R3-4); shared `Banner` + `InlineError`
  (`src/components/Banner.tsx`, `src/components/InlineError.tsx`) — persistent
  banner, not toast (RF-1 R3-5, DESIGN.md rule 4).
- **RF-5 extension:** the invite form (SF5-2) and edit form (SF5-3) are
  uncontrolled native forms; the 400/403/404/409/425 outcomes render through the
  shared `Banner`/`InlineError`. Revoke (SF5-3) uses a destructive-confirm
  pattern (DESIGN.md `.btn-destructive`).
- **Constraint:** surface the backend `request_id` (FR-005-009); render uniform
  404 (leak-avoidance); distinguish the two 409 causes (pending vs. key conflict).
- **Dependency:** none new.

## R5-6 — i18n posture (carried, not decided at RF-5)

- **Constraint:** foundation `research.md` R-8 deferred i18n; RF-1 carried it.
  RF-5 should not bake copy into logic (so a future i18n layer is unblocked) but
  choosing an i18n library is **not** in RF-5 scope.
- **Decision deferred to:** a later slice. Recorded so RF-5 authors do not couple
  copy to logic.

---

## Constraints common to all RF-5 decisions

These hold regardless of the (reused) primitive (sourced from spec FRs + slice 002
+ RF-1 constraints):

- **Generated client only** (FR-005-002, Principle 8) — no hand-rolled DP2 HTTP.
- **Cookie transport, no bearer**; `Idempotency-Key` is a header not a credential
  (FR-005-003).
- **No frontend authorization** (FR-005-004, Principle 7) — render 403/404 verbatim.
- **Server-resolved graph, no optimistic mutation** (FR-005-005).
- **Attaches to RF-1 active context; does not re-implement it** (FR-005-006).
- **Precondition 401 ≠ session-expiry** (FR-005-007) — the make-or-break rule.
- **No POS op, no RF-2 `listStores`** (FR-005-001, FR-005-013).
- **No new dependency** without Principle 9 approval (FR-005-010).
- **No foundation/slice-002/slice-003 artifact modification** (FR-005-011).
- **Test isolation, no live DP2, no unapproved mock** (FR-005-014, slice 002 C-5).

---

## Verification policy (carried from foundation R-9)

RF-5 plans against Data-Pulse-2 pin `62d0906` (slice 002 C-4). The RF-5 readiness
is `stable` and carried forward by reference in [`api-readiness.md`](./api-readiness.md).
The one residual before the implementation gate is **OQ-5**: the vendored client
must be regenerated at the pin to expose the RF-5 paths (a gated task, not a
re-pin, not a readiness demotion). RF-5 does not re-classify the readiness
optimistically.

---

**End of Phase 0 Research: RF-5 Operator / Admin Management.**

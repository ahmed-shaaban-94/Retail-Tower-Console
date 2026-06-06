# Implementation Plan: RF-5 Operator / Admin Management

**Branch**: `005-rf5-operator-admin` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-rf5-operator-admin/spec.md`

**Companion artifacts**:
- [api-readiness.md](./api-readiness.md) — RF-5 readiness carried forward from foundation (all `stable`; OQ-5 client-regen residual)
- [research.md](./research.md) — Phase 0 output (RF-5 reuses RF-1 primitives; R5-1..R5-5)
- [data-model.md](./data-model.md) — Phase 1 output (render-side projection; this repo owns no model)
- [contracts/rf5-operator-admin.md](./contracts/rf5-operator-admin.md) — Phase 1 output (the 5-operation consumption boundary)
- [design-brief.md](./design-brief.md) — UI/UX design brief (`/impeccable shape`, DESIGN.md-grounded)
- [quickstart.md](./quickstart.md) — Phase 1 output (planning walkthrough, not a setup runbook)
- [checklists/requirements.md](./checklists/requirements.md) — Spec quality checklist (from `/speckit-specify`)

> **Mode contract.** Planning-only. This plan sequences the RF-5 work and records
> the constraints any future answer must satisfy. It does **not** authorize
> implementation, re-pick RF-5's router/state/data-fetching primitives (it reuses
> RF-1's), or create any `src/` file. Implementation begins only after the
> foundation FR-008 five-gate approval for this slice (spec + plan + tasks + API
> map + validation gates).

---

## Summary

RF-5 is the operator/admin management slice. Its job is to read and manage the
A1–A5 membership graph of the **active tenant** (resolved by RF-1), through the
five Data-Pulse-2 operations the foundation RF-5 consumption boundary fixed, and
to do so as render-side reactions to backend truth — never frontend
authorization.

**Primary requirement** (from spec.md): render the membership graph (table) and
the invite / edit / revoke management surfaces, attaching to RF-1's
active-context provider, honoring the `createInvitation` idempotency contract, and
distinguishing a precondition 401 ("no active tenant") from a session-expiry 401.

**Technical approach.** RF-5 builds on the slice-002 stack **and** RF-1's resolved
primitives as **fixed context** (React 19 + Vite SPA, TS strict, Vitest +
Playwright, Biome; react-router; TanStack Query as the read-only server-state
cache over `openapi-fetch`; the shared `Banner`/`InlineError` surface; the
`ActiveContextProvider`). RF-5 introduces **no new runtime dependency**. The plan
fixes (a) surface sequencing (SF5-1 → SF5-2/3 → SF5-4), (b) the consumption
boundary (5 operations, generated client only), (c) the 401-disambiguation design
note, and (d) the validation-gate shape RF-5 must define.

---

## Technical Context

| Item | Value | Source / gate |
| --- | --- | --- |
| Language / framework | TypeScript (strict) + React 19 + Vite 6 SPA | Slice 002 D-1/D-8 (fixed) |
| API consumption | Generated client `src/generated/`, `openapi-fetch` | Slice 002 D-2/D-7; Constitution Principle 8; **regenerate at pin to add RF-5 ops (OQ-5)** |
| Data-Pulse-2 pin | `62d0906` | Slice 002 C-4 (fixed for this slice) |
| Auth transport | `dp2_session` cookie (HttpOnly+Secure+SameSite=Lax) | RF-1 FR-003-003; slice 002 C-2 |
| Unit/integration tests | Vitest | Slice 002 D-3 |
| E2E tests | Playwright (in CI) | Slice 002 D-4/D-6 |
| Lint/format | Biome | Slice 002 D-5 |
| Router | react-router (data-router) — **reused from RF-1**, new RF-5 routes register in `src/App.tsx` | RF-1 plan; verified `src/App.tsx:24-32` |
| Server-state / context store | TanStack Query cache — **reused from RF-1**; RF-5 adds member-graph queries | RF-1 plan; verified `src/lib/query.ts`, `src/context/useActiveContext.ts` |
| Data-fetching | TanStack Query over `openapi-fetch` typed wrappers in `src/lib/client.ts` — **reused; RF-5 adds 5 typed op wrappers + the `Idempotency-Key` shape** | RF-1 plan; verified `src/lib/client.ts:1-71` |
| Form handling (invite/edit) | Uncontrolled native form + minimal validation (no form library) — **reused from RF-1 R3-4** | RF-1 research R3-4 |
| Error/notification surface | Shared `Banner` + `InlineError` (no toast library) — **reused from RF-1 R3-5** | RF-1 research R3-5; verified `src/components/Banner.tsx`, `src/components/InlineError.tsx` |
| Active context | `ActiveContextProvider` / `useActiveContext` — **reused from RF-1**; RF-5 reads `active_tenant.id` | verified `src/context/useActiveContext.ts:44-107` |
| 401 interceptor | `createAuthRetry` per-call wrapper — **reused; RF-5 wires its own onSessionLost / precondition branch** | verified `src/lib/auth-interceptor.ts:32-60` |

**Reuse-of-RF-1 (verified by reading the merged code, not assumed).** Every claim
about RF-1 below cites the file:line it was read from. There is **no**
`src/lib/router.tsx`; routing is inline in `src/App.tsx`.

| RF-1 artifact (verified) | Cite | How RF-5 extends it |
| --- | --- | --- |
| Inline routing | `src/App.tsx:24-32` (`<BrowserRouter><Routes><Route path="/signin"…/><Route path="/"…/>`) | RF-5 registers a new protected route (Operators) and a public accept-invitation route **here in `src/App.tsx`**, not in a router module. SHARED-FILE TOUCH. |
| GATED_NAV array | `src/shell/AppShell.tsx:12-18` (`{ label: "Operators", gate: "RF-5" }`) | RF-5 un-gates the `Operators` entry (turns it into a live nav link). SHARED-FILE TOUCH. |
| Typed op wrappers | `src/lib/client.ts:1-71` (`apiClient.GET/POST/...` → `{ status, data, error }`) | RF-5 adds 5 wrappers in the same shape; `createInvitation` adds an `Idempotency-Key` header (new shape). SHARED-FILE TOUCH. |
| Active-context hook | `src/context/useActiveContext.ts:44-107` (read-only projection; `membershipCount`; `context.active_tenant`) | RF-5 reads `active_tenant.id` from this hook; does not re-implement it. |
| 401 reactive-refresh | `src/lib/auth-interceptor.ts:32-60` (`createAuthRetry`: refresh once; `onSessionLost` fires only if refresh fails; per-call, NOT global middleware) | RF-5 wraps **`createInvitation`** (the only op with a precondition 401) with its own `createAuthRetry` instance, with a `onSessionLost` that drives sign-out **only** on a failed refresh; a precondition 401 (refresh succeeds, call still 401s) routes to the scope chooser. The other three calls use the standard RF-1 wrapper. See "401 disambiguation" below. |
| Shared error surface | `src/components/Banner.tsx`, `src/components/InlineError.tsx` | RF-5 renders its 400/403/404/409/425 outcomes through these; no new error component family. |
| Design tokens | `src/styles/tokens.css`, `src/styles/controls.css` | RF-5 reuses; extends `docs/design/` mockups for the member table (see design-brief.md). |

**Constitution Check.** This plan introduces **no** `package.json`, lockfile, CI,
deployment, `src/`, or secret change at plan stage. It adds **no new runtime
dependency** (RF-5 reuses RF-1's react-router + TanStack Query; both already
approved/added in slice 003). It consumes exactly the five RF-5 operations (no
scope expansion; no POS op; no RF-2 op). It modifies no foundation, slice-002, or
slice-003 artifact. All checks pass at plan level. The one residual is OQ-5 (the
generated client must be regenerated at pin `62d0906` to expose the RF-5 ops — a
gated impl task, scheduled in `tasks.md`).

---

## 401 disambiguation (the make-or-break design note)

This is the contradiction the 004 verify pass would catch by reading the code.
Read against `src/lib/auth-interceptor.ts:32-60` and
`src/context/useActiveContext.ts:61-90`:

- `createAuthRetry` (auth-interceptor.ts:44-59): on a `401`, calls `refreshSession`
  **once**; if `refreshed.ok` is false, calls `onSessionLost()` and returns the
  original `401`; if `refreshed.ok` is true, **re-issues the request** and returns
  its result (which may itself be a `401`).
- `useActiveContext` (useActiveContext.ts:64-68) maps `res.status === 401` →
  `{ kind: "session-lost" }`. That mapping is correct **for the context query**
  because RF-1's only 401 cause there is session-expiry.

**`createInvitation`** has a **second** 401 cause (per the contracts, it is the
**only** RF-5 op that does): `401` "No active tenant" — a **precondition**, session
still valid. After a successful refresh the retried `createInvitation` **still**
returns `401`. (`listMembers`/`updateMembership`/`revokeMembership` take explicit
path params and document **only** `200`/`204` + `404` — no precondition 401, no
403; their 401, if any, is generic auth → standard RF-1 expiry. The `listMembers`
active-tenant precondition is guarded *before* the call by routing to the scope
chooser when `active_tenant` is null.) Therefore:

- RF-5 MUST NOT reuse the `useActiveContext` "status===401 → session-lost"
  mapping **on the `createInvitation` call**.
- RF-5 wraps **`createInvitation`** with its own `createAuthRetry` instance whose
  `onSessionLost` is the **only** path to sign-out (fires only when the refresh
  itself fails). A 401 that **survives** a successful refresh is classified as a
  precondition error and routes the operator to the RF-1 scope chooser (set active
  tenant), NOT to sign-out. The other three calls use the standard RF-1 wrapper.
- **Design gap to resolve at implementation (OQ-1 note):** the current
  `createAuthRetry` returns the original response and signals session-loss via the
  injected `onSessionLost` side effect; it does not return a discriminator like
  "refresh failed?" to the caller. RF-5 either (a) reads the post-retry status
  (still-401-after-successful-refresh ⇒ precondition) using a local `refreshOk`
  flag captured in its injected `refreshSession`/`onSessionLost`, or (b) inspects
  the 401 body's error semantics. Option (a) needs no RF-1 change (the deps are
  injected per-instance); RF-5 owns its own instance. This is a `plan.md`/impl
  design note, not an RF-1 modification (FR-005-011).
- **Retry-layer composition note.** `createInvitation` carries two retry layers:
  the §6.3 idempotency `425 Too Early` retry (same key + body) and the RF-1
  auth-retry refresh-once. They compose safely because both re-issue the **same
  request thunk** (the `Idempotency-Key` is captured in the thunk, so a re-issue
  replays the same key) and neither double-fires: `createAuthRetry` fires the
  refresh at most once per 401 burst (coalesced, `auth-interceptor.ts:33-42`), and
  the 425 retry is a separate, post-success backoff. Confirm no double-submit at
  implementation.

---

## Surface sequencing (build order, not UX flow)

1. **SF5-1 — Member list first.** It is the read-only view every management
   surface refreshes back into. Built against `listMembers` (active tenant), the
   precondition-401 → scope-chooser branch, and the member table.
2. **SF5-2 / SF5-3 — Invite + edit/revoke second.** They mutate then re-fetch
   SF5-1. SF5-2 carries the idempotency contract; SF5-3 carries the destructive
   revoke confirmation. Built together because both depend on SF5-1's list.
3. **SF5-4 — Accept invitation (public) last.** It is the standalone public route
   (sibling of RF-1 sign-in); independent of SF5-1..3 but built last because it
   needs the invite flow understood end-to-end.

Rationale: management surfaces refresh into the list, so the list exists first;
the public accept route is independent and small, built last.

---

## Per-decision reuse discipline

Each RF-5 stack primitive is **reused** from RF-1 with its constraint recorded in
[research.md](./research.md) R5-1..R5-5:

- `/speckit-plan` (this document) does **not** re-pick R5-1..R5-5 — it reuses
  RF-1's resolutions and records only the RF-5-specific extensions.
- `/speckit-clarify` confirmed each reuse (Session 2026-06-06) and resolved the
  RF-5-specific OQs (precondition-401, public accept, store-name rendering).
- RF-5 adds **no** runtime dependency; if any is later found necessary it lands
  only at implementation after Principle 9 approval, justified in `tasks.md`.

---

## Validation-gate shape (the 5th FR-008 gate, defined here, approved later)

RF-5's validation gates (to be ratified in `tasks.md` per spec OQ-6):

- **VG-1 — Unit coverage.** Vitest unit coverage ≥ the repo threshold for the
  member-list reduction, the invite idempotency-key/replay/conflict/425 logic, and
  the **401-disambiguation** logic (precondition vs. expiry).
- **VG-2 — E2E journeys.** Playwright journeys covering: view membership graph
  (S1), invite incl. replay + duplicate-409 (S2), **precondition-401 → scope
  chooser** (S3), edit role/store-access (S4), revoke + confirmation (S5),
  **expiry-401 → sign-in** (S6), public accept-invitation (S7). Driven against an
  approved mock (FR-005-014), not live DP2.
- **VG-3 — Boundary grep.** No hand-written `fetch(`/XHR targets a DP2 path (only
  the generated client is used); no OpenAPI bytes copied; no `Authorization:
  Bearer` set by the console.
- **VG-4 — POS-boundary grep.** No reference to `/api/pos/v1/`, no
  `pos-operators` operationId, and no `listStores` (RF-2) anywhere in RF-5 code
  (FR-005-001, FR-005-013).

These are *defined* here and *approved* as part of the FR-008 gate; this plan
does not run them (no code exists yet).

---

## What this plan does NOT do

- Does not re-pick R5-1..R5-5 (reuses RF-1's router/state/data-fetching/form/error
  surface).
- Does not create `src/` files, route files, components, hooks, or tests.
- Does not re-pin `src/generated/schema.d.ts` (regenerating at the existing pin to
  add RF-5 ops is a gated impl task — OQ-5).
- Does not add a mock (FR-005-014).
- Does not modify any foundation, slice-002, or slice-003 artifact (FR-005-011).
- Does not clear any FR-008 gate — it is one input to the gate.

---

## Next Spec Kit phases

1. `/speckit-clarify` resolved OQ-1..OQ-6 (spec) and confirmed R5-1..R5-5 reuse
   (Session 2026-06-06).
2. `/speckit-tasks` produced `tasks.md` for RF-5, tracing each task to a surface
   (SF5-1..4), the design-brief state matrix, and the reuse-of-RF-1 file touches.
3. FR-008 five-gate approval for slice 005 specifically.
4. Implementation, in the SF5-1 → SF5-2/3 → SF5-4 order above, after the OQ-5
   client regeneration.

---

**End of Implementation Plan: RF-5 Operator / Admin Management.**

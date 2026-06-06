# Phase 0 Research: RF-2 Tenant / Store Management

**Feature**: 004-rf2-tenant-store-mgmt
**Phase**: 0 — Outline & Research
**Date**: 2026-06-06
**Input**: [`plan.md`](./plan.md) Technical Context, [`spec.md`](./spec.md) §10 Open questions
**Foundation reference**: [`001-console-foundation/research.md`](../001-console-foundation/research.md) R-4..R-8
**RF-1 reference**: [`003-rf1-auth-shell/research.md`](../003-rf1-auth-shell/research.md) R3-1..R3-6 (the primitives RF-2 reuses)

---

## R4-0 Posture (read this first)

The slice-002 stack (framework, build tool, package manager, test frameworks,
lint/format, generated-client toolchain + storage) is **resolved and fixed**
(slice 002 D-1..D-8). The RF-1 (slice 003) per-screen primitives — router,
active-context store, data-fetching strategy, form handling, error/notification
surface — are **also resolved and merged** (RF-1 R3-1..R3-5; committed in
`src/`). RF-2 does not re-open either.

What RF-2 decides at Phase 0 is therefore narrow: for each primitive it needs,
**confirm reuse of RF-1's resolved choice** and record the constraint that makes
the reuse valid. The strong default — and the recorded decision — is **reuse +
zero new runtime dependency**. This mirrors the slice-002 / RF-1 deferral
discipline, but resolves to *reuse* rather than *new selection*.

---

## R4-1 — Active-tenant/store scope source

- **Constraint:** RF-2's store surfaces are tenant-scoped; the scope must be the
  server-resolved active context, read as a read-only projection (spec
  FR-004-005). RF-2 must add **no** new context operation (spec OQ-5,
  FR-004-001). A scope switch (an RF-1 action) must re-scope RF-2's lists.
- **Alternatives considered:** (a) reuse RF-1's `ActiveContextProvider`;
  (b) RF-2 calls `getActiveContext` itself; (c) RF-2 holds its own scope copy.
- **Decision (Session 2026-06-06): reuse RF-1's `ActiveContextProvider`.** RF-2
  reads active tenant/store + `memberships[]` from the existing provider and
  calls **no** context operation. (b)/(c) are rejected — they would add a context
  op (violating OQ-5) or duplicate authoritative state (violating FR-004-005).
  **No dependency added.**

## R4-2 — Data-fetching strategy for the ten operations

- **Constraint:** Call the ten operations through the generated client
  (`openapi-fetch`, slice 002 D-2) — no hand-rolled `fetch` to a DP2 path (spec
  FR-004-002). Support list queries, detail queries, create/update/soft-delete
  mutations with re-fetch-after-mutation, the RF-1 401 reactive-refresh
  interceptor (with the store no-active-tenant `401` disambiguated — see note
  below), and the typed-error mapping (403/404/409/401-scope/5xx; the contracts
  document no 422/429 on these ops). Run in
  tests without live DP2 (slice 002 C-5).
- **Alternatives considered:** reuse RF-1's TanStack Query + `openapi-fetch`
  client; SWR; plain `openapi-fetch` in effects; a new thin hook layer.
- **Decision (Session 2026-06-06): reuse RF-1's TanStack Query over the shared
  `openapi-fetch` client** (`src/lib/client.ts`, `src/lib/query.ts`). Lists and
  details are queries; create/update/soft-delete are mutations that invalidate +
  re-fetch the relevant list/detail. **No dependency added.**
- **401-disambiguation note / OQ-10 (added after reading the stores contract @
  `62d0906` AND RF-1's merged code).** `listStores`/`createStore` return **`401`
  ("No active tenant")** as a scope-precondition — a *second meaning* of `401`
  that RF-1 never had to handle. **Verified, not assumed:** RF-1's
  `createAuthRetry` (`src/lib/auth-interceptor.ts`) is **not** global middleware —
  it is a `useRef`-local in `src/context/useActiveContext.ts:48` wrapping **only**
  the `getActiveContext` query. RF-1's "every 401 → refresh-then-maybe-sign-out"
  therefore applies to the **context fetch only**; a `401` from a *new* RF-2
  operation does **not** automatically flow through sign-out. So this is a design
  decision about how RF-2 wires *its own* data layer, not a misrender RF-1 forces.
  **Options (resolve in `/speckit-clarify` / the gated build):** (a) **pre-gate
  store calls on the active tenant** read from `ActiveContextProvider` — no active
  tenant → scope chooser, never issue the call (the `401` is avoided); RF-2 renders
  any residual scope-`401` as a prompt directly, since RF-1's interceptor isn't in
  that path. (b) RF-2 routes its calls through a shared `createAuthRetry` instance
  — then honoring "scope-`401` → prompt, never sign-out" requires extending the
  interceptor to split the two `401`s, a real shared-file touch on
  `src/lib/auth-interceptor.ts`. **Recommended: (a)** — cleaner "scope before
  action", no shared-interceptor change. **No dependency added.**

## R4-3 — Create/edit form handling + error surface

- **Constraint:** Two small forms (tenant: a couple of fields; store: a couple of
  fields, no tenant picker — scope from active context). Must surface the
  conflict the contract defines inline: `createTenant` `409` slug conflict and
  `createStore` `409` store-code conflict (OQ-9); `403` permission via the shared
  banner; backend field-validation messages inline as reported. (The tenant/store
  contracts document **no** `422`/`429` envelope on these ops; RF-2 asserts none.)
  RF-2 implements **no** business validation (FR-004-004; the backend is the
  validation authority). No secret/credential committed.
- **Alternatives considered:** a form library (React Hook Form / TanStack Form);
  reuse RF-1's uncontrolled-native-form posture; reuse RF-1's `Banner` +
  `InlineError` for errors vs a new surface.
- **Decision (Session 2026-06-06): reuse RF-1's uncontrolled native form posture
  and RF-1's `Banner` + `InlineError`** (`src/components/`). Field errors render
  via `InlineError` against the field (`aria-invalid`); surface errors render in
  the persistent `Banner` (DESIGN.md rule 4: persistent banners, not toasts);
  every 4xx surfaces the backend `request_id` (VD-4). **No dependency added.**

## R4-4 — Table rendering for the list surfaces

- **Constraint:** RF-2 is the canonical tables-over-cards surface (DESIGN.md
  rule 7). Render the backend-scoped row set (no client-side authorization filter
  — spec OQ-2) in a dense, keyboard-navigable, AA-contrast table; row → detail;
  36px touch floor (DESIGN.md rule 10). Reusable by later list families.
- **Alternatives considered:** a table/grid library (e.g. a virtualized data
  grid); DESIGN.md's hand-rolled `.data-table` CSS; a card grid (rejected by
  rule 7 / PRODUCT.md anti-references).
- **Decision (Session 2026-06-06): hand-rolled `.data-table` from DESIGN.md**
  (`src/styles` tokens). It matches the design brief, adds no dependency, and
  scales to the expected roster sizes (tens of tenants per platform admin; tens
  of stores per tenant). A virtualized-grid dependency is **not** anticipated; if
  a future very-large-roster need arises it is recorded as *selected, pending
  Principle 9* — not now. **No dependency added.**

## R4-5 — List query shape (sort / pagination affordance)

- **Constraint:** The list query must render the set the backend returns; any
  sort/pagination must follow the contract's parameters (read from the generated
  client), never a client-side re-authorization or re-scope. RF-2 invents no
  query parameter the contract does not expose.
- **Alternatives considered:** client-side sort/paginate of the full set;
  backend-driven sort/paginate via contract params; no pagination (render all).
- **Decision (Session 2026-06-06): backend-driven where the contract exposes it,
  else render the full returned set** via RF-1's TanStack Query pattern. The
  exact column set and whether sort/pagination params exist are read from the
  generated client at implementation time (design brief DB-1). **No dependency
  added.**

## R4-6 — i18n posture (carried, not decided at RF-2)

- **Constraint:** Foundation `research.md` R-8 / RF-1 R3-6 deferred i18n. RF-2
  should not hard-block a future i18n layer (avoid baking copy into logic), but
  choosing an i18n library is **not** in RF-2 scope.
- **Decision deferred to:** a later slice. Recorded so RF-2 authors do not
  silently couple copy to logic (design brief DB-3).

---

## Constraints common to all RF-2 decisions

These hold regardless of primitive (sourced from spec.md FRs + slice 002 / RF-1
constraints):

- **Generated client only** (FR-004-002, Principle 8) — no hand-rolled DP2 HTTP.
- **Cookie transport, no bearer** (FR-004-003, slice 002 C-2; reuse RF-1 client).
- **No frontend authorization** (FR-004-004, Principle 7) — backend-scoped list,
  actions not pre-hidden, roles display-only.
- **Server-resolved scope, no optimistic update** (FR-004-005); zero new context
  operation (OQ-5).
- **Test isolation, no live DP2, no unapproved mock** (FR-004-012, slice 002 C-5).
- **No new dependency without Principle 9 approval** (FR-004-009) — RF-2 expects
  to add none.
- **No foundation/slice-002/RF-1 artifact modification at planning time**
  (FR-004-010); the two RF-1 shared-file touches are tracked implementation tasks.

---

## Verification policy (carried from foundation R-9)

RF-2 plans against Data-Pulse-2 pin `62d0906` (slice 002 C-4). The RF-2 readiness
is `stable` and carried forward by reference in [`api-readiness.md`](./api-readiness.md);
the CSRF posture is carried forward from RF-1's resolution (cookie transport, no
CSRF token at this pin) and re-confirmed against the tenant/store contracts (spec
OQ-6) before the FR-008 implementation gate. RF-2 does not re-classify the
readiness optimistically.

---

**End of Phase 0 Research: RF-2 Tenant / Store Management.**

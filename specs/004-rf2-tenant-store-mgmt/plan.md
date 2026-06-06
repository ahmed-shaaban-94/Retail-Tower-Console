# Implementation Plan: RF-2 Tenant / Store Management

**Branch**: `004-rf2-tenant-store-mgmt` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-rf2-tenant-store-mgmt/spec.md`

**Companion artifacts**:
- [api-readiness.md](./api-readiness.md) — RF-2 readiness carried forward from foundation (both rows `stable`; CSRF residual carried from RF-1)
- [research.md](./research.md) — Phase 0 output (RF-2 stack-primitive **reuse** decisions R4-1..R4-5)
- [data-model.md](./data-model.md) — Phase 1 output (render-side projection; this repo owns no model)
- [contracts/rf2-tenant-store.md](./contracts/rf2-tenant-store.md) — Phase 1 output (the 10-operation consumption boundary for this slice)
- [design-brief.md](./design-brief.md) — the impeccable `shape` brief for the RF-2 surfaces (self-confirmed, headless)
- [quickstart.md](./quickstart.md) — Phase 1 output (planning walkthrough, not a setup runbook)
- [checklists/requirements.md](./checklists/requirements.md) — Spec quality checklist (from `/speckit-specify`)

> **Mode contract.** Planning-only. This plan sequences the RF-2 work and records
> the constraints any future answer must satisfy. It does **not** authorize
> implementation, re-pick RF-1's router/state/data-fetching primitives, or create
> any `src/` file. Implementation begins only after the foundation FR-008
> five-gate approval for this slice (spec + plan + tasks + API map + validation
> gates).

---

## Summary

This is the **second product-UI plan** for Retail-Tower-Console and the **first
that reuses, rather than establishes, the auth shell**. Its job is to sequence
the RF-2 tenant/store management surfaces (tenant list/detail/create-edit, store
list/detail/create-edit, scope-aware layout) against the ten Data-Pulse-2
operations the foundation RF-2 consumption boundary already fixed, and to record
the per-decision constraints RF-2 must satisfy before its FR-008 implementation
gate clears.

**Primary requirement** (from spec.md): specify how RF-2 consumes the ten
tenant/store operations through the slice-002 generated client, renders backend
truth (the list is backend-scoped; unpermitted actions surface as 403; never a
frontend authorization decision), reuses RF-1's active-context provider for scope
(zero new context operation), and reuses RF-1's shell + error surface.

**Technical approach.** RF-2 builds on the slice-002 stack and the **RF-1
(slice 003) auth shell** as fixed, merged context (React 19 + Vite SPA,
TypeScript strict, Vitest + Playwright, Biome, generated client at
`src/generated/` pinned at Data-Pulse-2 `62d0906`; react-router + TanStack Query
+ the shared `openapi-fetch` client + `ActiveContextProvider` + `Banner`/
`InlineError` + `AppShell` all already in `src/`). This plan **reuses** those
primitives and is expected to add **zero** new runtime dependency. It fixes
(a) surface sequencing (tenant surfaces then store surfaces), (b) the consumption
boundary (10 operations, generated client only, zero new context op), (c) the
design brief the UI traces to, and (d) the validation-gate shape RF-2 must
define, including a no-frontend-authorization assertion gate.

---

## Technical Context

| Item | Value | Source / gate |
| --- | --- | --- |
| Language / framework | TypeScript (strict) + React 19 + Vite 6 SPA | Slice 002 D-1/D-8 (fixed) |
| API consumption | Generated client `src/generated/`, `openapi-fetch` | Slice 002 D-2/D-7; Constitution Principle 8 |
| Data-Pulse-2 pin | `62d0906` | Slice 002 C-4 (fixed for this slice) |
| Auth transport | `dp2_session` cookie (HttpOnly+Secure+SameSite=Lax) | Foundation contract §Transport; slice 002 C-2 |
| Unit/integration tests | Vitest | Slice 002 D-3 |
| E2E tests | Playwright (in CI) | Slice 002 D-4/D-6 |
| Lint/format | Biome | Slice 002 D-5 |
| Router | react-router (data-router) — **reused from RF-1** (`src/lib/router.tsx`) | RF-1 R3-1; RF-2 registers RF-2 routes inside RF-1's protected boundary |
| Data fetching | TanStack Query over `openapi-fetch` — **reused from RF-1** (`src/lib/query.ts`, `src/lib/client.ts`) | RF-1 R3-3; RF-2 R4-2 |
| Active-tenant/store scope | RF-1 `ActiveContextProvider` (`src/context/`) — **reused; RF-2 adds no new context op** | RF-1 R3-2; spec OQ-5; RF-2 R4-1 |
| List query / pagination | TanStack Query lists over the generated client — **reused pattern** | research R4-5 |
| Form handling (create/edit) | Uncontrolled native form + minimal client affordance (no form library) | research R4-3; RF-1 R3-4 (same posture) |
| Table rendering | Hand-rolled `.data-table` from DESIGN.md (no table library) | research R4-4; DESIGN.md tables-over-cards |
| Error/notification surface | RF-1 `Banner` + `InlineError` (`src/components/`) — **reused, no new surface** | RF-1 R3-5; RF-2 R4-3 |
| New runtime dependencies | **None expected.** RF-2 reuses RF-1's deps. | spec FR-004-009; Constitution Principle 9 |

**Reuse posture (Session 2026-06-06).** R4-1..R4-5 (research.md) are **reuse**
decisions, not new selections: RF-2 mounts in RF-1's `AppShell`, registers its
routes in RF-1's react-router config, fetches via RF-1's TanStack Query +
`openapi-fetch` client, reads scope from RF-1's `ActiveContextProvider`, and
renders 4xx/5xx via RF-1's `Banner`/`InlineError`. Tables use DESIGN.md's
hand-rolled `.data-table`; forms use uncontrolled native inputs (RF-1's posture).
**No new runtime dependency is anticipated.** If `/speckit-clarify` or
implementation surfaces one (e.g. a virtualized-table need for very large
rosters), it is recorded here as *selected, pending Constitution Principle 9
approval* and justified in `tasks.md` against its R4-N — but the strong default,
and the current decision, is reuse + zero new deps.

**Constitution Check.** This plan introduces no `package.json`, lockfile, CI,
deployment, `src/`, or secret change *at plan stage*. It adds **no** new
dependency (reuse of RF-1's). It consumes exactly the ten RF-2 operations and
**zero** new context operation (no scope expansion; spec FR-004-001, OQ-5). It
modifies no foundation, slice-002, or RF-1 artifact at planning time. The
implementation-slice touch of two shared RF-1 files (below) is a tracked, gated
change, not a plan-stage edit. All checks pass at plan level.

---

## Surface sequencing (build order, not UX flow)

RF-2's surfaces have a dependency order. Implementation (post-gate) should follow
it:

1. **Tenant surfaces first (SF-T1 then SF-T2 then SF-T3).** Tenant list, then
   detail, then create/edit + soft-delete. Tenants are the parent scope; stores
   live inside a tenant. Built against `listTenants` / `readTenant` /
   `createTenant` / `updateTenant` / `softDeleteTenant`.
2. **Store surfaces second (SF-S1 then SF-S2 then SF-S3).** Store list, detail,
   create/edit + soft-delete — all scoped to the **active tenant** read from
   RF-1's `ActiveContextProvider`. A store surface with no active tenant routes
   to RF-1's scope chooser first (spec FR-004-006). Built against `listStores` /
   `readStore` / `createStore` / `updateStore` / `softDeleteStore`.
3. **Scope-aware layout (SF-L) throughout.** Not a new shell: RF-2 mounts in
   RF-1's `AppShell` and reads RF-1's active context. The un-gate of the "Stores"
   nav entry and the route registration happen as the surfaces land.

Rationale: stores cannot be listed or created without a resolved active tenant
(scope before action); the tenant surfaces also exercise the create/edit/error
patterns the store surfaces reuse.

---

## Shared-file touches (flag for sequential implement)

RF-2's implementation slice will touch **two shared RF-1 files**. These are
flagged here so the implementation is sequenced (not run in parallel with another
slice touching the same files), and so the touch is a tracked change, not a
smuggled edit. **No edit happens at planning time** (spec FR-004-010):

- **`src/shell/AppShell.tsx` — un-gate the "Stores" `GATED_NAV` entry.** The RF-1
  app shell renders a disabled "Stores" nav entry with `gate: "RF-2"`. RF-2
  un-gates it: the entry becomes an active route link to the store list (SF-S1),
  removed from `GATED_NAV` (or promoted to an enabled nav entry). The remaining
  gated entries (Catalog / Unknown items / Operators / Audit) stay gated.
- **`src/lib/router.tsx` — register the RF-2 routes** inside RF-1's existing
  protected boundary (no new public route; RF-2 is entirely behind the RF-1
  401 → sign-in guard).

Both are recorded as explicit tasks in [`tasks.md`](./tasks.md) with the
shared-file flag.

**Conditional third touch — RF-1's 401 interceptor.** The stores contract returns
`401` ("No active tenant") as a *scope precondition*, but RF-1's
`src/lib/auth-interceptor.ts` treats every `401` as session-expiry (research
R4-2). The **recommended** resolution avoids touching the interceptor: RF-2
**pre-gates** store calls on the active tenant read from RF-1's
`ActiveContextProvider` (no active tenant → route to the scope chooser, never
issue the store call), so the scope `401` is *avoided*, not interpreted. Only if
that proves insufficient does RF-2 extend `src/lib/auth-interceptor.ts` to
distinguish the two `401`s — a **third** shared-file touch, flagged then. The
default plan adds no interceptor change.

---

## Per-decision deferral / reuse discipline

Each RF-2 stack primitive is a **reuse** of RF-1's resolved choice, recorded in
[research.md](./research.md). The discipline (mirroring slice 002 / RF-1):

- `/speckit-plan` (this document) records reuse + constraints; it picks no **new**
  primitive and adds no dependency.
- `/speckit-clarify` confirmed the reuse posture (spec Clarifications OQ-1).
- Any R4-N answer that would add a runtime dependency lands only in the
  implementation phase after Principle 9 approval, justified in `tasks.md`
  against its R4-N. The current decision adds **none**.

---

## Design brief (impeccable shape, recorded in [design-brief.md](./design-brief.md))

The UI-bearing parts of this plan are shaped by the self-confirmed (headless)
impeccable `shape` brief in [`design-brief.md`](./design-brief.md). Key bindings
the implementation traces to:

- **Register product, color strategy Restrained, dark command-room** (DESIGN.md
  committed dark surface; gold scope-only under 10%; navy drives actions).
- **Tables-over-cards** is THE RF-2 pattern: list surfaces are `.data-table`
  filling the workspace; no hero metric, no stat-card grid (PRODUCT.md
  anti-references).
- **Reuse the RF-1 visual contract**: `src/styles/tokens.css` verbatim, and the
  RF-1 `AppShell` / `ScopeHeader` / `Banner` / `InlineError`; DESIGN.md
  `.btn-primary`/`.btn-secondary`/`.btn-destructive` / `.input` / `.badge` /
  `.alert` / `.card`.
- **Full state matrix per surface** (default / empty / loading / error /
  success), with errors first-class through the shared banner/inline surface,
  mapped to the statuses the tenant/store contracts actually define @ `62d0906`:
  403 permission (banner + `request_id`), 404 uniform, 409 tenant-slug-conflict
  inline + 409 store-code-conflict inline (OQ-9), 401 no-active-tenant on store
  ops as a scope prompt distinct from session-expiry 401 (OQ-4), 5xx retry-able
  banner. The contracts document no 422/429 on these ten ops, so RF-2 asserts
  none (Principle 2 / FR-011).
- **No frontend authorization** (the brief's hard rule, matching spec
  FR-004-004): actions are rendered and the backend 403 is shown; roles are
  display-only badges; the list is backend-scoped; store forms have no tenant
  picker.

Each UI task in [`tasks.md`](./tasks.md) references the brief's surface +
state-matrix decision and reuses `src/styles` tokens + RF-1 components rather
than re-deriving them.

---

## Validation-gate shape (the 5th FR-008 gate, defined here, approved later)

RF-2's validation gates (to be ratified in `tasks.md` per spec OQ-7):

- **VG-1 — Unit coverage.** Vitest unit coverage ≥ the repo threshold for the
  RF-2 list/detail/form state logic (the default/empty/loading/error/success
  matrix per surface) and the error-mapping (403/404/409/401-scope/5xx) logic.
- **VG-2 — E2E journeys.** Playwright journeys covering: tenant roster + detail
  (S1), tenant onboard + 409 slug-conflict (S2), unpermitted action → 403 render
  (S3), store list in active tenant (S4), store list/create with no active tenant
  → scope prompt via 401, not sign-out (S5), store edit + 409 store-code conflict
  inline (S6), tenant-switch re-scopes list (S7), soft-delete + uniform 404 (S8).
  Driven against an approved mock (FR-004-012), not live DP2.
- **VG-3 — Boundary grep.** A check that no hand-written `fetch(`/XHR targets a
  Data-Pulse-2 path (only the generated client is used); no OpenAPI bytes (field
  names, slug pattern, status enum, validation rule) copied; no `Authorization:
  Bearer` header set by the console.
- **VG-4 — No-scope-creep grep.** A check that RF-2 references none of the
  excluded operations: `listMembers`, the four `memberships.openapi.yaml`
  operations (RF-5), and that RF-2 adds **no** new context operation call
  (`getActiveContext` / `switchActiveTenant` / `switchActiveStore` /
  `clearActiveStore` are RF-1's — RF-2 reads via the provider, does not call).
- **VG-5 — No-frontend-authorization assertion.** A check that RF-2 contains no
  role/`is_platform_admin`-conditioned hiding or disabling of a list, action, or
  route (spec FR-004-004; OQ-2/OQ-3). Lists render the backend set; actions are
  rendered and 403s are caught; roles are display-only badges. This is the RF-2
  correctness gate that the foundation Principle 7 makes load-bearing.

These are *defined* here and *approved* as part of the FR-008 gate; this plan
does not run them (no code exists yet).

---

## What this plan does NOT do

- Does not re-pick RF-1's router/state/data-fetching/form/error primitives — it
  **reuses** them (research R4-1..R4-5).
- Does not add any new runtime dependency (reuse of RF-1's; spec FR-004-009).
- Does not create `src/` files, route files, components, hooks, or tests.
- Does not edit `src/shell/AppShell.tsx` or `src/lib/router.tsx` at plan time —
  it **flags** them as the implementation slice's shared-file touches.
- Does not consume `listMembers`, `memberships.openapi.yaml`, or any new context
  operation (spec FR-004-001, OQ-5).
- Does not regenerate or re-pin `src/generated/schema.d.ts`.
- Does not add a mock (FR-004-012).
- Does not modify any foundation, slice-002, or RF-1 spec artifact (FR-004-010).
- Does not clear any FR-008 gate — it is one input to the gate.

---

## Next Spec Kit phases

1. `/speckit-clarify` resolved OQ-1..OQ-8 (spec) and confirmed R4-1..R4-5 reuse
   (research), headless.
2. `/speckit-tasks` produces `tasks.md` for RF-2, tracing each task to a surface
   (SF-T*/SF-S*/SF-L), to the design brief's state matrix, and (for the two
   shared-file touches) to the sequential-implement flag.
3. FR-008 five-gate approval for slice 004 specifically.
4. Implementation, in the tenant then store surface order above.

---

**End of Implementation Plan: RF-2 Tenant / Store Management.**

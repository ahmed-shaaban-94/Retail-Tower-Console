# Phase 1 Data Model: RF-1 Auth Shell & Active Context

**Feature**: 003-rf1-auth-shell
**Phase**: 1 — Design & Contracts
**Date**: 2026-06-05
**Input**: [`spec.md`](./spec.md), [`api-readiness.md`](./api-readiness.md), [`contracts/rf1-auth-context.md`](./contracts/rf1-auth-context.md)
**Foundation reference**: [`001-console-foundation/data-model.md`](../001-console-foundation/data-model.md) (E-1/E-2/E-3, ST-1, VD-1..VD-5)

---

## Ownership disclaimer (read this first)

This repository owns **zero domain entities**. Every entity RF-1 touches is
**owned by Data-Pulse-2** and rendered by the console. RF-1 defines no entity,
persists none, validates none. Constitution Principles 1, 2, 7 codify this.

This file documents only the **render-side projection** RF-1 needs for the auth
shell and active-context surface, by reference to the foundation data-model's
entities — it does **not** re-inline or duplicate Data-Pulse-2 OpenAPI schemas
(Principle 2 forbids that copy). Exact field types are read from the generated
client (`src/generated/schema.d.ts`, slice 002 pin `62d0906`) at implementation
time.

---

## Entities RF-1 projects

RF-1 touches exactly three foundation entities. They are restated by reference;
their authoritative definitions live in foundation `data-model.md`.

### E-1 — User (current authenticated identity)

- **Foundation reference:** `001-console-foundation/data-model.md` E-1.
- **Origin:** Data-Pulse-2 `auth.openapi.yaml` `UserSummary`; also
  `context.openapi.yaml` `ContextResponse.user`.
- **RF-1 render-side use:** SF-2 renders the current user (e.g., display name,
  email) in the app-shell header. `is_platform_admin` is a **display flag only**
  (a badge) — it unlocks no UI (foundation VD-1, spec FR-003-004).

### E-2 — Membership (user ↔ tenant relationship)

- **Foundation reference:** E-2.
- **Origin:** `auth.openapi.yaml` `MembershipSummary` (in `SignInResponse`);
  `context.openapi.yaml` `ContextResponse.memberships[]`.
- **RF-1 render-side use:** drives the SF-2 tenant chooser. `memberships.length`
  selects the SF-3 sign-in branch (0 → no-access; 1 → may auto-select; >1 →
  chooser) per the foundation contract notes and spec scenarios S1/S2/S7.

### E-3 — Active context (tenant + store + role for the session)

- **Foundation reference:** E-3.
- **Origin:** `context.openapi.yaml` `ContextResponse`.
- **RF-1 render-side use:** SF-3 holds this as a **read-only projection**.
  SF-2 renders `active_tenant` / `active_store` as a context indicator and
  `active_role_code` for display. `getActiveContext` is source of truth; the
  three mutators change it backend-side, then SF-3 re-fetches (spec FR-003-005;
  no optimistic update).
- **Reset rule:** `switchActiveTenant` clears `active_store` backend-side; SF-3
  mirrors by dropping cached store-scoped state (spec FR-003-006; foundation E-3
  reset rule).

> Entities E-4..E-10 (Tenant, Store, Catalog row, Unknown item, Operator,
> Audit entry, Setting) are **out of RF-1 scope**. They belong to RF-2..RF-7.
> RF-1 only resolves the session and the active context those families read.

---

## State the console holds (render-side only)

RF-1 holds no authoritative domain state. The only render-side state is the
**read-only projection of the active context** (E-3) plus transient UI state
(SF-1 form input, in-flight request flags). All of it is derived from, and
re-synced to, backend responses.

| Render-side state | Owned by | Refresh trigger |
| --- | --- | --- |
| Active-context projection (E-3) | SF-3 | `getActiveContext` after sign-in, after any context mutation, on re-focus per OQ-2 cadence |
| Available memberships (E-2) | SF-3 (from sign-in + context) | `signIn` response, then `getActiveContext` |
| Current user (E-1) | SF-2 (from context) | `getActiveContext` |
| SF-1 form input | SF-1 | Transient; never persisted (spec FR-003-009) |

---

## State transitions consumed

### ST-1 — Session lifecycle (RF-1 owns the drive of this)

Restated from foundation `data-model.md` ST-1. RF-1's SF-3 is the **only**
driver of these transitions; every RF-2..RF-7 family is downstream of the
resulting AUTHENTICATED (context resolved) state.

```
ANONYMOUS ──(signIn success)──> AUTHENTICATED (no active context)
                                       │
                                       │ (SF-3: getActiveContext;
                                       │  if memberships==1 may switchActiveTenant)
                                       ▼
                     AUTHENTICATED (context resolved)
                       │     │
                       │     ├─(switchActiveTenant)──> AUTHENTICATED (tenant switched, store cleared)
                       │     ├─(switchActiveStore)───> AUTHENTICATED (store switched)
                       │     └─(clearActiveStore)────> AUTHENTICATED (store cleared)
                       │
                       ├─(signOut, 204)──────────────> ANONYMOUS
                       └─(401 from any endpoint)──────> ANONYMOUS (re-auth; route to SF-1)
```

**Notes (RF-1 specifics):**

- `signIn` with `memberships.length === 0` lands in a **no-access** terminal
  render (S7, VD-2), not a reachable AUTHENTICATED-context state.
- `refreshSession` extends the sliding window; it is a backend-driven transition
  that does **not** change the AUTHENTICATED-state semantics (foundation ST-1).
  Cadence is OQ-2.
- The `(401 from any endpoint)` transition is **rendering of backend truth**,
  not a frontend decision (spec FR-003-004).

---

## Validation / display rules (render-side only)

Validation is **backend-enforced** (spec FR-003-004, Principle 7). RF-1
implements **no business validation**. The following are display rules RF-1
honors, restated from foundation `data-model.md`:

- **VD-1** — `User.is_platform_admin === true` → SF-2 may show a "Platform
  Admin" badge. Display only; not an authorization decision.
- **VD-2** — `ContextResponse.active_tenant === null` → SF-2 shows a tenant
  chooser; `memberships.length === 0` → "no access" + sign-out (S7).
- **VD-3** — `active_store === null` is acceptable at RF-1; store choosers for
  store-scoped families (RF-3/4/7) are those families' concern, not RF-1's.
- **VD-4** — All backend 4xx carry `code` / `message` / `request_id`; RF-1
  surfaces `request_id` in any user-visible error (spec FR-003-007).
- **VD-5** — Tenant/store 404 rendered identically regardless of cause (spec
  FR-003-008).

---

## Cross-reference to readiness rows

| Entity | api-readiness row | Status (carried from foundation) |
| --- | --- | --- |
| E-1 User | RF-1 sign-in / session | `stable` |
| E-2 Membership | RF-1 sign-in / session-context | `stable` |
| E-3 Active context | RF-1 session-context | `stable` |

**Implication.** All three RF-1 entities are `stable` (foundation
`api-readiness.md` §RF-1, pin `62d0906`) — RF-1 may plan against them now. The
one residual before the implementation gate is the CSRF re-verification (OQ-3),
not an entity-readiness gap.

---

**End of Phase 1 Data Model: RF-1 Auth Shell & Active Context.**

# Phase 1 Data Model: RF-2 Tenant / Store Management

**Feature**: 004-rf2-tenant-store-mgmt
**Phase**: 1 — Design & Contracts
**Date**: 2026-06-06
**Input**: [`spec.md`](./spec.md), [`api-readiness.md`](./api-readiness.md), [`contracts/rf2-tenant-store.md`](./contracts/rf2-tenant-store.md)
**Foundation reference**: [`001-console-foundation/data-model.md`](../001-console-foundation/data-model.md) (E-3, E-4, E-5, VD-1..VD-5)
**RF-1 reference**: [`003-rf1-auth-shell/data-model.md`](../003-rf1-auth-shell/data-model.md) (E-1/E-2/E-3, ST-1)

---

## Ownership disclaimer (read this first)

This repository owns **zero domain entities**. Every entity RF-2 touches is
**owned by Data-Pulse-2** and rendered by the console. RF-2 defines no entity,
persists none, validates none. Constitution Principles 1, 2, 7 codify this.

This file documents only the **render-side projection** RF-2 needs for the
tenant/store surfaces, by reference to the foundation data-model's entities — it
does **not** re-inline or duplicate Data-Pulse-2 OpenAPI schemas (Principle 2
forbids that copy; spec AC-7). Exact field types, the slug pattern, the status
enum values, name length, and all validation rules are read from the generated
client (`src/generated/schema.d.ts`, slice 002 pin `62d0906`) at implementation
time, never copied here.

---

## Entities RF-2 projects

RF-2 touches the two management entities (Tenant, Store) and **reads** the active
context (E-3) from RF-1's provider. They are restated by reference; their
authoritative definitions live in foundation `data-model.md`.

### E-4 — Tenant

- **Foundation reference:** `001-console-foundation/data-model.md` (Tenant).
- **Origin:** Data-Pulse-2 `tenants.openapi.yaml` (`Tenant` and its
  create/update shapes).
- **RF-2 render-side use:** SF-T1 renders the backend-scoped tenant set as a
  table; SF-T2 renders one tenant's fields + status badge; SF-T3 collects fields
  for create/update and surfaces backend validation/conflict errors. The exact
  field set (identifier, slug, name, status, timestamps) and the slug/status
  validation rules are read from the generated client, not stated here.

### E-5 — Store

- **Foundation reference:** `001-console-foundation/data-model.md` (Store).
- **Origin:** Data-Pulse-2 `stores.openapi.yaml` (`Store` and its create/update
  shapes).
- **RF-2 render-side use:** SF-S1 renders the active tenant's store set as a
  table; SF-S2 renders one store's fields; SF-S3 collects fields for
  create/update **scoped to the active tenant** (no tenant picker — spec
  FR-004-005). Field set + validation are read from the generated client.

### E-3 — Active context (read from RF-1, not owned by RF-2)

- **Foundation reference:** E-3; **RF-1 reference:** RF-1 `data-model.md` E-3.
- **Origin:** `context.openapi.yaml` `ContextResponse`, consumed by **RF-1**.
- **RF-2 render-side use:** RF-2 reads `active_tenant` / `active_store` /
  `active_role_code` / `memberships[]` / `user.is_platform_admin` from RF-1's
  `ActiveContextProvider`. It is the scope for store operations and the source of
  the display-only role/platform-admin badges. **RF-2 calls no context
  operation** (spec OQ-5); it reads the projection RF-1 already holds.

> Entities E-1/E-2 (User, Membership) are RF-1's; E-6..E-10 (Catalog row,
> Unknown item, Operator, Audit entry, Setting) are RF-3..RF-7's. RF-2 manages
> only Tenant (E-4) and Store (E-5), and reads active context (E-3).

---

## State the console holds (render-side only)

RF-2 holds no authoritative domain state. Its render-side state is the
**transient UI state of the tenant/store surfaces** plus the **query cache** of
the ten operations' responses (owned by the reused TanStack Query layer). Scope
is read from RF-1, not held by RF-2.

| Render-side state | Owned by | Refresh trigger |
| --- | --- | --- |
| Tenant list/detail projection (E-4) | RF-2 query cache (reused layer) | `listTenants`/`readTenant`; invalidated after create/update/soft-delete |
| Store list/detail projection (E-5) | RF-2 query cache (reused layer) | `listStores`/`readStore`; invalidated after create/update/soft-delete; re-scoped on active-tenant switch |
| Active-context projection (E-3) | **RF-1** `ActiveContextProvider` (read-only here) | RF-1's triggers; RF-2 only reads |
| Create/edit form input | RF-2 surface (SF-T3/SF-S3) | Transient; never persisted; no credential (FR-004-009) |

---

## State transitions consumed

RF-2 drives **no** session-lifecycle transition (that is RF-1's ST-1). RF-2's
own transitions are per-resource CRUD render-states, all reactions to backend
truth:

```
LIST (backend-scoped set) ──(row select)──> DETAIL (readTenant/readStore)
        │                                        │
        │                                        ├─(edit submit ok)──> DETAIL (re-fetched)
        │                                        ├─(soft-delete ok)──> LIST (re-fetched)
        │                                        └─(404)────────────> uniform "not available"
        │
        ├─(create submit ok)──────> DETAIL/LIST (re-fetched)
        ├─(createTenant 409 slug)─> FORM (inline slug-conflict error)
        ├─(createStore 409 code)──> FORM (inline store-code-conflict error)   [OQ-9]
        ├─(store op 401 no-tenant)─> SCOPE PROMPT (resolve tenant; NOT sign-out) [OQ-4]
        └─(any 403)───────────────> rendered via shared Banner (no pre-hide)
```

**Notes (RF-2 specifics — corrected against the contracts @ pin `62d0906`):**

- The **list set is whatever the backend returns** — no client-side
  authorization filter (spec OQ-2, FR-004-004).
- An **unpermitted action is attempted, not pre-blocked**; the backend 403 is the
  transition trigger (spec OQ-3).
- A **store operation with no active tenant** returns **`401`** ("No active
  tenant"); RF-2 renders it as a scope prompt, **distinct from a session-expiry
  `401`** (spec FR-004-006, OQ-4) — preferably by pre-gating store calls on the
  active tenant so the `401` is avoided (research R4-2).
- The **`createStore` `409`** is a **store-code conflict within the tenant**
  (OQ-9), rendered inline — not a scope error.
- The tenant/store contracts document **no `422`/`429`** on these ten
  operations; RF-2 surfaces backend field errors as reported and asserts no
  envelope it has not seen (Principle 2 / FR-011).
- A **scope switch** (RF-1 action) re-scopes the store list and drops
  store-scoped views (spec S7); RF-2 holds no authoritative scope.

---

## Validation / display rules (render-side only)

Validation is **backend-enforced** (spec FR-004-004, AS-5, Principle 7). RF-2
implements **no business validation** (no client-side slug-pattern, name-length,
or status-enum check). The following are display rules RF-2 honors, restated from
foundation `data-model.md`:

- **VD-1** — `User.is_platform_admin === true` → SF-T1/SF-T2 may show a "Platform
  Admin" badge (read from RF-1's context). Display only; not an authorization
  decision and not a list filter.
- **VD-2** — A zero-row list is a **successful empty state** (spec OQ-8), not an
  error; render the empty message + the create entry point (still not
  role-hidden). `active_tenant === null` on a store surface → scope prompt.
- **VD-4** — All backend 4xx carry `code` / `message` / `request_id`; RF-2
  surfaces `request_id` in any user-visible error (spec FR-004-007), and renders
  any backend field-validation message verbatim (it authors none). The
  tenant/store contracts @ `62d0906` document no `422`/`429` on these ten ops;
  RF-2 asserts none (Principle 2 / FR-011).
- **VD-5** — Tenant/store 404 rendered **identically** regardless of cause
  (resource absent vs no access; spec FR-004-008).
- **Status display** — tenant/store status is rendered as a `.badge`; the
  permitted values are read from the generated client's enum (not copied here).

---

## Cross-reference to readiness rows

| Entity | api-readiness row | Status (carried from foundation) |
| --- | --- | --- |
| E-4 Tenant | RF-2 tenant CRUD | `stable` |
| E-5 Store | RF-2 store CRUD | `stable` |
| E-3 Active context | RF-1 session-context (read-only here) | `stable` (RF-1-owned) |

**Implication.** Both RF-2 management entities are `stable` (foundation
`api-readiness.md` §RF-2, pin `62d0906`) — RF-2 may plan against them now. The
one residual before the implementation gate is the CSRF re-confirmation (OQ-6),
carried forward from RF-1's resolution, not an entity-readiness gap.

---

**End of Phase 1 Data Model: RF-2 Tenant / Store Management.**

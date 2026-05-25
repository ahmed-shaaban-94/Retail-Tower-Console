# Phase 1 Data Model: Console Foundation

**Feature**: 001-console-foundation
**Phase**: 1 — Design & Contracts
**Date**: 2026-05-25
**Input**: [`spec.md`](./spec.md), [`api-readiness.md`](./api-readiness.md), [`research.md`](./research.md)

---

## Ownership disclaimer (read this first)

This repository owns **zero domain entities**. Every entity referenced
below is **owned by Data-Pulse-2** (the backend) or **owned by POS-Pulse**
(the POS terminal). The console renders these entities. It does not
define them, persist them, validate them, or enforce constraints on
them. Constitution Principles 1, 2, 3, 6, and 7 codify this disclaimer.

**This file therefore documents the *render-side view*** — the minimal
read-projection the console needs in order to display each entity, plus
the consumption boundary that keeps the projection from drifting into
ownership. The fields and shapes named below are NOT a duplication of
Data-Pulse-2 OpenAPI schemas (Principle 2 forbids that copy). They are
*references-by-shape-name* into those schemas, with a citation to the
file and operation that defines them upstream.

If a downstream slice needs to know an exact field type, it reads the
generated TypeScript client (when `002-tooling-and-scaffold` ships it).
It MUST NOT copy schema definitions into this repository.

---

## Entities visible to the console

For each entity: name, render-side fields the console will likely show,
upstream definition reference, and the actor scopes (spec.md §4) that
may see it.

### E-1 — User (current authenticated identity)

- **Origin:** Data-Pulse-2 `auth.openapi.yaml` schema `UserSummary`;
  also returned in `context.openapi.yaml` `ContextResponse.user`.
- **Render-side fields likely shown:** `id`, `email`, `display_name`,
  `is_platform_admin`.
- **Render-side scope:** Visible to the authenticated user themselves
  on every screen (header, "current user" menu).
- **Authorization note:** `is_platform_admin: true` does **not** unlock
  UI in this repo. The backend enforces what platform admins can see;
  the console renders the boolean for display only (e.g., showing a
  "Platform Admin" badge). Per FR-002.

### E-2 — Membership (the user's relationship to a tenant)

- **Origin:** Data-Pulse-2 `auth.openapi.yaml` schema
  `MembershipSummary`; also in `context.openapi.yaml`
  `ContextResponse.memberships[]`.
- **Render-side fields likely shown:** `tenant_id`, `tenant_name`,
  `role_code`, `store_access_kind` (enum: `all` | `specific`),
  `accessible_store_ids` (in `ContextResponse`; absent in the
  `SignInResponse` projection).
- **Render-side scope:** Visible to the authenticated user. Used to
  drive the active-tenant chooser when `memberships.length > 1` (per
  api-readiness.md §RF-1 row 1 Notes).
- **Sub-cardinality:** One user may have N memberships (one per tenant
  they belong to). One tenant may have N memberships (one per user).

### E-3 — Active context (tenant + store + role for the current session)

- **Origin:** Data-Pulse-2 `context.openapi.yaml` schema
  `ContextResponse`.
- **Render-side fields likely shown:** `active_tenant` (TenantSummary,
  nullable), `active_store` (StoreSummary, nullable),
  `active_role_code` (nullable). The console shell renders the active
  tenant/store as a breadcrumb-like context indicator.
- **Render-side scope:** Visible to every authenticated actor on every
  screen.
- **Lifecycle:** `getActiveContext` is the source of truth. The
  `switchActiveTenant`, `switchActiveStore`, and `clearActiveStore`
  endpoints mutate it backend-side; the console refreshes by calling
  `getActiveContext` again, not by optimistic update (R-4).
- **Reset rule:** When `switchActiveTenant` runs, `active_store` is
  cleared by the backend. The console MUST NOT preserve the previous
  store across a tenant switch (per `context.openapi.yaml`
  `/api/v1/context/tenant` 200 response).

### E-4 — Tenant (RF-2)

- **Origin:** Data-Pulse-2 — anticipated `tenants.openapi.yaml`.
  Verified file exists (api-readiness.md §Cross-repo references). Field
  shape NOT verified at foundation level — RF-2 row in api-readiness.md
  is `unknown`. Per-family slice `004-rf2-tenant-store-mgmt` will
  verify before any RF-2 UI is planned.
- **Render-side scope:** A1 (cross-tenant), A2 (own tenant), A3 (own
  tenant). A4/A5 see only the tenant via their store membership.

### E-5 — Store (RF-2)

- **Origin:** Data-Pulse-2 — anticipated `stores.openapi.yaml`.
  Verified file exists. Field shape NOT verified at foundation level.
- **Render-side scope:** A1, A2, A3 (all stores in the active tenant),
  A4/A5 (only stores their membership grants access to per
  `store_access_kind` + `accessible_store_ids` from E-2).

### E-6 — Catalog row (RF-3)

- **Origin:** Data-Pulse-2 — anticipated `catalog/` subdirectory in
  `packages/contracts/openapi/`. Verified directory exists. Field
  shape and identity model NOT verified at foundation level (RF-3 row
  `unknown`, plus a dedicated identity-model row for RF-4b
  reconciliation that is currently `unknown`).
- **Render-side scope:** A1–A5 within their tenant/store scope.
- **Cross-reference:** RF-4a (unknown items) consumes the same catalog
  identity model when it eventually lands.

### E-7 — Unknown item (RF-4a)

- **Origin:** Data-Pulse-2 `packages/contracts/openapi/catalog/unknown-items.yaml`
  (verified to exist at api-readiness.md §RF-4 verification). Wave 1
  operations: `posCaptureItem`, `tenantAdminListUnknownItems`,
  `tenantAdminDismissUnknownItem`.
- **Render-side fields likely shown:** Schema NOT inlined here. The
  per-family slice `007-rf4a-unknown-items` will reference the generated
  client's projection.
- **Render-side scope:** A3 (tenant-scope), A4 (store-scope), A5
  (store-scope read).
- **Lifecycle:** An unknown item is captured by A6 (POS device,
  indirect) and surfaces in the console queue. A3/A4 may dismiss it.
  Linking to existing or creating a new catalog row from it is **RF-4b**
  which is **deferred via SD-1**.
- **POS boundary note:** The unknown item is **POS-originated read-only
  data** in this repo (Principle 3, FR-003). The console does not echo
  data back to the POS device.

### E-8 — Operator / admin identity (RF-5)

- **Origin:** Data-Pulse-2 — anticipated `memberships.openapi.yaml` and
  related identity endpoints. Verified `memberships.openapi.yaml`
  exists.
- **Render-side scope:** A1 (platform-wide), A2/A3 (tenant-wide),
  A4 (store-wide). MUST NOT overlap with POS-Pulse-owned A6 operator
  surfaces (api-readiness.md §RF-5 "Boundary check" row).
- **Critical boundary:** A6 (POS operators) are NOT entities owned by
  this repo's RF-5. RF-5 is about A1–A5 only. Any rendering that
  appears to "list POS operators" inside RF-5 violates Principle 3.

### E-9 — Audit entry / operational event (RF-6)

- **Origin:** Data-Pulse-2 — anticipated `audit.openapi.yaml` (verified
  file exists). POS-originated events go through
  `pos-audit-events.openapi.yaml` (verified).
- **Render-side scope:** A1 (platform-wide), A2/A3 (tenant-wide), A4
  (store-wide), A5 (store-wide read).
- **POS event boundary note:** Read-only on this side (FR-003).
  Investigation *actions* (if any) on POS-originated events belong to
  the RF-6 per-family spec — not this foundation.

### E-10 — Setting (RF-7)

- **Origin:** Data-Pulse-2 — anticipated tenant-, store-, and
  platform-level settings endpoints. Files not yet identified.
- **Render-side scope:** Tenant settings visible to A2/A3. Store
  settings to A4. Platform settings to A1 only — enforced by backend
  (FR-002).

---

## Relationships at the foundation level

```text
User (E-1) ─── 1..N ─── Membership (E-2) ─── N..1 ─── Tenant (E-4)
                                                          │
                                                          │ 1..N
                                                          ▼
                                                       Store (E-5)
                                                          │
                                                          │ 1..N
                                                          ▼
                                                    Catalog row (E-6)
                                                          ▲
                                                          │ (RF-4b — DEFERRED)
                                                          │
                                                    Unknown item (E-7)
                                                          ▲
                                                          │ produced by
                                                          │
                                                       POS device (A6)
                                                       ─── indirect only ───

Active context (E-3) is derived per session from { current User, current
Membership selection, current Store selection }. It is server-resolved on
every authenticated request (api-readiness.md §RF-1).

Operator / admin identity (E-8) refers to E-1+E-2 records for A1–A5 only.
A6 (POS operator identity) is POS-Pulse-owned and out of scope.

Audit entry (E-9) is emitted by backend (and POS-Pulse via Data-Pulse-2
ingestion). Read-only on this side.

Setting (E-10) attaches to Tenant, Store, or Platform; scoping enforced
by backend.
```

---

## State transitions

Most state transitions are **owned by Data-Pulse-2** and rendered by the
console. The foundation lists only the **session/context** transitions
the console interacts with via API calls.

### ST-1 — Session lifecycle (RF-1)

```
ANONYMOUS ──(POST /auth/signin success)──> AUTHENTICATED (no active context)
                                                  │
                                                  │ (auto: getActiveContext)
                                                  ▼
                          AUTHENTICATED (context resolved)
                            │      │
                            │      └─(POST /context/tenant)──> AUTHENTICATED (tenant switched, store cleared)
                            │      └─(POST /context/store)───> AUTHENTICATED (store switched)
                            │      └─(DELETE /context/store)─> AUTHENTICATED (store cleared)
                            │
                            ├─(POST /auth/signout)─────────> ANONYMOUS
                            │
                            └─(401 from any endpoint)────> ANONYMOUS (re-auth required)
```

**Notes:**

- The transition `AUTHENTICATED (context resolved) → AUTHENTICATED
  (tenant switched, store cleared)` enforces the "active store is
  cleared on tenant switch" rule from `context.openapi.yaml`.
- The `(401 from any endpoint)` transition is **not** a console
  decision — the backend returns 401, the console's API client
  intercepts it and navigates to RF-1 sign-in. This is rendering of
  backend truth (FR-002).
- `POST /auth/refresh` (`refreshSession`) extends the sliding session
  window. It is a backend-driven transition; the console may call it
  proactively before token expiry, but it does NOT change the
  AUTHENTICATED state semantics.

### ST-2 — Unknown item lifecycle (RF-4a only)

```
(captured by POS, A6) → UNKNOWN_IN_QUEUE ──(tenantAdminDismissUnknownItem)──> DISMISSED
                                          │
                                          ├─(tenantAdminLinkUnknownItem) ────> LINKED_TO_CATALOG  ← RF-4b, DEFERRED (SD-1)
                                          └─(tenantAdminCreateProductFromUnknownItem) ──> NEW_CATALOG_ROW ← RF-4b, DEFERRED (SD-1)
```

The dashed transitions are **out of scope for the first-pass plan**
(SD-1). RF-4a covers only `UNKNOWN_IN_QUEUE → DISMISSED`.

---

## Validation rules

Validation is **backend-enforced** (FR-002, Principle 7). The console
does NOT implement business validation. The following are read-side
*display* rules only:

- **VD-1** — If `User.is_platform_admin === true`, the console may show
  a "Platform Admin" badge. This is a display flag, not an
  authorization decision.
- **VD-2** — If `ContextResponse.active_tenant === null`, the console
  shows a tenant chooser. If `memberships.length === 0` (no tenant at
  all), the console shows a "no access" message and a sign-out option.
- **VD-3** — If `ContextResponse.active_store === null` AND the route
  family requires store scope (RF-3 catalog edits, RF-4 unknown items,
  RF-7 store settings), the console shows a store chooser before
  rendering the family.
- **VD-4** — All backend 4xx responses include an `Error` object with
  `code`, `message`, and `request_id`. The console MUST surface
  `request_id` in any user-visible error message (so support can trace
  it).
- **VD-5** — All backend 404 responses for tenant/store endpoints use
  the *same* response shape regardless of cause (`tenant doesn't exist`
  vs `user has no access`) — per `context.openapi.yaml` `FR-ISO-4`
  note. The console MUST render them identically (Principle 7).

---

## Cross-reference to api-readiness rows

| Entity | Backed by api-readiness row(s) | Status today |
| --- | --- | --- |
| E-1 User | RF-1 sign-in / session-context | `draft` |
| E-2 Membership | RF-1 sign-in / session-context | `draft` |
| E-3 Active context | RF-1 session-context | `draft` |
| E-4 Tenant | RF-2 (all rows) | `unknown` |
| E-5 Store | RF-2 (all rows) | `unknown` |
| E-6 Catalog row | RF-3 (all rows) | `unknown` |
| E-7 Unknown item | RF-4a (both rows) | `draft` (carried, not yet verified) |
| E-8 Operator/admin identity | RF-5 (all rows) | `unknown` |
| E-9 Audit entry / op event | RF-6 (all rows) | `unknown` |
| E-10 Setting | RF-7 (all rows) | `unknown` |

**Implication.** Only E-1, E-2, and E-3 are ready for slice
`003-rf1-auth-shell` to plan against (their api-readiness rows are
`draft`). E-7 is partially ready for slice `007-rf4a-unknown-items` but
needs re-verification first. Every other entity gates on its row(s)
being resolved during the corresponding per-family slice's
`planning/spec` phase.

---

**End of Phase 1 Data Model: Console Foundation.**

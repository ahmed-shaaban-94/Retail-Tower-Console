# API Readiness — 004 RF-2 Tenant / Store Management

| Field | Value |
| --- | --- |
| Spec | [spec.md](./spec.md) |
| Feature ID | 004 |
| Short name | rf2-tenant-store-mgmt |
| Branch | `004-rf2-tenant-store-mgmt` |
| Mode | Planning-only (per-slice readiness carried forward from foundation) |
| Owner | Ahmed Shaaban |
| Created | 2026-06-06 |
| Data-Pulse-2 pin | `62d0906` (slice 002 C-4 — the SHA the generated client is produced against) |
| Status | Both RF-2 rows `stable`, **carried forward by reference** from [`../001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md) §RF-2. This file does not re-derive or re-classify them. One residual re-confirmation before the implementation gate: CSRF posture (OQ-6), carried forward from RF-1's resolution and re-confirmed against the tenant/store contracts below. |

---

## Purpose

This is the per-slice readiness artifact for RF-2. It exists to:

1. **Carry forward** the foundation RF-2 `stable` verification by reference, so
   the RF-2 plan/tasks can cite a single per-slice readiness record (foundation
   `api-readiness.md` §How to update — downstream slices do not re-verify a
   `stable` row unless a demotion has been logged).
2. **Record the one residual** RF-2 must re-confirm before its FR-008
   implementation gate clears: the CSRF posture on the four writes + two
   soft-deletes (spec OQ-6), carried forward from the RF-1 resolution.
3. **Satisfy FR-005** (re-verify a non-`stable` residual before the
   implementation gate) and **FR-011** (no optimistic classification).

This file does **not** copy Data-Pulse-2 OpenAPI content (reference only) and
does **not** authorize implementation (FR-008 five-gate approval still required).

---

## Status legend

Same four statuses as foundation `spec.md` §6 / `api-readiness.md`: `stable` /
`draft` / `blocked` / `unknown`. The foundation §Status legend rules apply
unchanged; this slice does not re-state them.

---

## RF-2 — Tenant / store management (carried forward)

Both rows are `stable`, carried forward from the foundation level against
Data-Pulse-2 `main` (foundation RF-2 verification 2026-05-30 @ `62d0906`;
corroborated by the foundation `sc-verification.md`, SC-1/SC-2/SC-3 Verified).
The generated client RF-2 consumes is **pinned at `62d0906`** (slice 002 C-4).
RF-2 **consumes** this readiness; it does not re-verify a `stable` row absent a
logged demotion.

| Backend surface (named, not specified) | Status | Carried from | Notes |
| --- | --- | --- | --- |
| Tenant CRUD (`listTenants` / `readTenant` / `createTenant` / `updateTenant` / `softDeleteTenant`) | `stable` | [`../001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md) §RF-2 | `tenants.openapi.yaml`. `listTenants` returns the caller-scoped set (all, if platform admin) — backend-scoped (spec OQ-2). Consumed by SF-T1/T2/T3. |
| Store CRUD (`listStores` / `readStore` / `createStore` / `updateStore` / `softDeleteStore`) | `stable` | §RF-2 | `stores.openapi.yaml`. Store ops are scoped to the active tenant (read from RF-1's provider); `listStores`/`createStore` return **`401`** ("No active tenant") when none is set (OQ-4), and `createStore` returns **`409`** on a store-code conflict (OQ-9). Consumed by SF-S1/S2/S3. |

**Context membership graph — reused, not a new readiness row.** RF-2 reads
active tenant scope + `memberships[]` from RF-1's active-context provider
(`context.openapi.yaml`, RF-1-owned, `stable`). RF-2 adds **no** new context
operation (spec OQ-5); no separate RF-2 readiness row is created for it.

**Gate impact.** RF-2 readiness is met for planning. The console may not *begin
implementation* until the full FR-008 five-gate approval for this slice, and
until the OQ-6 residual below is re-confirmed (FR-005).

---

## Residual to re-confirm before the implementation gate

| Residual | Status | Verified against | Notes |
| --- | --- | --- | --- |
| CSRF posture on `createTenant` / `updateTenant` (writes) + `softDeleteTenant` / `softDeleteStore` (deletes) + `createStore` / `updateStore` (writes) | **RESOLVED — no CSRF token required** | Data-Pulse-2 `tenants.openapi.yaml` + `stores.openapi.yaml` @ `62d0906`, verified 2026-06-06 | Confirmed: both contracts declare global `security: [cookieAuth: []]`; `cookieAuth` is the same `type: apiKey, in: cookie, name: dp2_session` scheme defined in `auth.openapi.yaml` (RF-1). **No** `X-CSRF-Token`/`X-XSRF-Token` parameter or header appears anywhere in either contract (grep: no `csrf`/`xsrf` references). This is the RF-1 resolution carried forward to the tenant/store contracts. RF-2 reuses RF-1's cookie-transport client (`credentials: "include"`, no CSRF-header plumbing). Mirrored in `spec.md` OQ-6. |

This is the only RF-2 residual; it is resolved. It did **not** demote any RF-2
row from `stable`; it was a transport-detail confirmation carried forward from
RF-1.

---

## What this slice does NOT touch in readiness

- It does not re-classify RF-2 (carried `stable`).
- It does not touch RF-1, RF-3..RF-7 rows (RF-1 reused; the rest out of scope).
- It does not create a new context readiness row (reuses RF-1's; OQ-5).
- It does not consume `listMembers` or `memberships.openapi.yaml` (RF-5 rows).
- It does not re-pin the generated client (pin `62d0906` is slice-002-owned).

---

## How to update this file

If a residual is resolved during this slice's `/speckit-clarify` or a pre-gate
verification, record the exact Data-Pulse-2 reference (`main @ <sha>` or
`OpenAPI @ <path>:<sha>`), the date (ISO `YYYY-MM-DD`), and the confirmer, and
mirror the resolution in `spec.md` §10 in the same edit. Do not copy
Data-Pulse-2 contract content into this file (reference only). If a foundation
RF-2 row is ever demoted, this carried-forward record must be re-checked.

---

## Verification log

A dated, append-only journal. Most recent first.

### 2026-06-06 — OQ-6 CSRF residual RESOLVED (carried forward from RF-1)

- Re-confirmed the CSRF posture directly against Data-Pulse-2
  `tenants.openapi.yaml` and `stores.openapi.yaml` at pin `62d0906`.
- Finding: **no CSRF token required.** Both contracts use global
  `security: [cookieAuth: []]`; `cookieAuth` is the `apiKey`-in-cookie
  `dp2_session` scheme (same as `auth.openapi.yaml`). No `csrf`/`xsrf`
  parameter or header anywhere in either contract.
- Implication: RF-2 reuses RF-1's cookie-transport client with
  `credentials: "include"` and **no** CSRF-header plumbing (FR-004-003). The
  single RF-2 residual is closed.
- Mirrored in `spec.md` §10 OQ-6.
- Confirmer: Ahmed Shaaban (owner); verified on branch `004-rf2-tenant-store-mgmt`.

### 2026-06-06 — Initial creation (RF-2 readiness carried forward)

- File created from `/speckit-specify` for slice 004.
- RF-2 (both rows) recorded as `stable`, **carried forward by reference** from
  foundation `api-readiness.md` §RF-2 (pin `62d0906`). No re-derivation; no
  optimistic re-classification.
- CSRF posture recorded as the single residual, carried forward from RF-1's
  resolution, to re-confirm against the tenant/store contracts (spec OQ-6).
- Confirmer: Ahmed Shaaban.
- Verified against: this commit on branch `004-rf2-tenant-store-mgmt`, citing the
  foundation verification at Data-Pulse-2 `main` @ `62d0906`.

---

**End of API Readiness: 004 RF-2 Tenant / Store Management.**

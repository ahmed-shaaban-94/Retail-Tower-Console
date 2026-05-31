# API Readiness — 001 Console Foundation

| Field | Value |
| --- | --- |
| Spec | [spec.md](./spec.md) |
| Feature ID | 001 |
| Short name | console-foundation |
| Branch | `001-console-foundation` |
| Mode | Planning-only (cross-repo verification artifact) |
| Owner | Ahmed Shaaban |
| Created | 2026-05-25 |
| Last verified | 2026-05-30 (RF-2 / RF-5 / RF-6 audit-query rows promoted to `stable`; RF-3 / RF-7 verified-absent → `blocked`; RF-4a evidence refreshed to v1.2.0; **RF-4b promoted `blocked` → `draft` on verified contract+runtime — `stable` still gated by FR-012, SD-1 still deferred**; **OQ-5 RF-6 POS-event surface resolved `unknown` → `draft` via dual-repo verification**) |
| Status | Verified against Data-Pulse-2 `main` @ `62d0906` (2026-05-30). `stable`: RF-1 (3 rows), RF-2 (CRUD + matrix-shape), RF-5 (identity + A6-boundary), RF-6 (audit query + operational-event search). `draft`: RF-4a (list/dismiss/inspect/filter/sort/group), RF-4b (reconciliation link/create — owner-confirmed present; re-verify before impl gate per FR-005, SD-1 keeps it out of first-pass plan scope), RF-6 POS-originated event surface (dual-repo verified; no upstream sc-verification). `blocked`: RF-3 (no standalone catalog-mgmt contract on main), RF-7 (no settings contract on main). **No `unknown` rows remain.** |

---

## Purpose

This file records the **cross-repo verification state** of every backend
surface the console depends on, as defined in `spec.md` §6 (Backend dependency
map). It exists for three reasons:

1. **Resolve OQ-1 through OQ-5 from `spec.md` §10** by capturing dated, source-
   linked confirmations from Data-Pulse-2 (and where relevant, POS-Pulse).
2. **Satisfy FR-005** (no per-family `implementation` slice opens until the
   relevant rows here are resolved away from `unknown`) and **FR-011** (no
   optimistic classification).
3. **Be the OQ-7 verification artifact**: a single human-readable, machine-
   greppable record of *which contract was confirmed, against which Data-Pulse-2
   reference, on which date, by whom*.

This file does **not**:

- Copy, paraphrase, or vendor Data-Pulse-2 OpenAPI content. References only.
- Authorize implementation. Implementation gating still requires the five
  human-approval gates in Constitution §Implementation readiness gates and
  `spec.md` FR-008.
- Replace `spec.md` §6. When a row here is updated, the corresponding row in
  `spec.md` §6 MUST be updated in the same edit (or in a follow-up edit on
  the same branch) to keep the two documents in sync.

---

## Status legend

Same four statuses as `spec.md` §6 (no additional statuses permitted):

- `stable` — Contract confirmed present and stable in Data-Pulse-2 `main` AND
  the OpenAPI source. Safe to plan a UI slice against.
- `draft` — Contract exists but is incomplete, in active change, or has open
  contract questions. UI may begin planning but **must** re-verify before any
  implementation gate clears.
- `blocked` — Contract is known to be absent, deferred, or intentionally not
  started in Data-Pulse-2. UI must not plan implementation against it yet.
- `unknown` — This repository has not yet performed (or cannot complete) a
  cross-repo confirmation. Default starting state. Forbidden as a final state
  before any per-family `implementation` slice opens.

**Promotion rule.** A row may move from `unknown` to one of the three other
statuses **only** when the "Verified against" cell on that row names a
specific Data-Pulse-2 reference (branch + SHA, OpenAPI file path + commit,
wave-status filename + date, or active spec path + commit). "I checked, looks
fine" is not a verification.

**Version-suffix convention rule.** Every OpenAPI file in
Data-Pulse-2 `packages/contracts/openapi/` carries the version label
`1.0.0-draft` (or `1.1.0-draft`, etc.). This is a Data-Pulse-2 repo-wide
**labeling convention**, not a per-surface stability flag. The `-draft`
suffix therefore does NOT, by itself, force a row to classify as `draft`.

A row MAY classify as `stable` despite an upstream `-draft` suffix when
**all three** of the following hold:

1. The named OpenAPI file (with `-draft` suffix) exists on Data-Pulse-2
   `main` and defines the operationId(s) the row depends on.
2. The upstream Data-Pulse-2 slice that owns those operationId(s)
   provides a `sc-verification.md` (or equivalent named verification
   artifact) declaring milestone completion at a specific Data-Pulse-2
   SHA.
3. That `sc-verification.md` reports the relevant Success Criteria as
   `Verified` (not `Partial`, not `Pending`).

Without all three, the row remains `draft` even if the OpenAPI file
looks complete. With all three, `stable` is the correct classification
and `draft` would be under-classification (which has its own audit
cost — see Demotion rule note).

**Demotion rule.** A row may move *back* to a less-stable status (e.g.,
`stable` → `draft`, or `draft` → `blocked`) if a subsequent verification
shows the contract changed or was withdrawn. The history of changes is
tracked in §Verification log below.

*Note on under-classification.* Classifying a `stable` surface as
`draft` is **not safer** than classifying it correctly. A `draft` row
triggers re-verification work on every downstream slice (FR-005), which
costs reviewer time and creates churn. The audit goal is *accurate*
classification, not maximally-conservative classification. The
Version-suffix convention rule above exists to enable correct
promotion when corroborating evidence is strong.

---

## Cross-repo references

The verifier (whoever is filling this file) MUST consult these sources, in
this order, before promoting a row away from `unknown`:

1. **Data-Pulse-2 `main` branch** — implementation truth.
   - Repo: `https://github.com/ahmed-shaaban-94/Data-Pulse-2`
   - Branch: `main`
   - HEAD at time of RF-1 verification: `b5142fe` (2026-05-25)
   - HEAD at time of 2026-05-30 RF-2..RF-7 verification: `62d0906`
     (PR #406, "test(007): address CodeRabbit review on #405").
2. **Data-Pulse-2 OpenAPI source** — contract truth.
   - Path inside Data-Pulse-2: `packages/contracts/openapi/` — the six
     contracts-of-record listed in `packages/contracts/README.md`
     (`auth`, `context`, `tenants`, `stores`, `memberships`, `audit`),
     plus `outbox.openapi.yaml`, the `pos-*` POS-namespace contracts, and
     `catalog/unknown-items.yaml`. All carry a `*-draft` version label per
     the repo-wide convention (see §Status legend Version-suffix rule).
3. **Data-Pulse-2 active specs / execution maps / wave-status files** —
   in-flight contract intent.
   - Path inside Data-Pulse-2: `specs/<NNN-slice>/` — notably
     `specs/001-foundation-auth-tenant-store/sc-verification.md` (foundation
     SC-1..SC-9 Verified at SHA `602ae5c`),
     `specs/005-pos-catalog-sync-reconciliation/wave-status.md`,
     `specs/007-unknown-items-review-queue-api/wave-status.md`.
     **Caution:** as of 2026-05-30 the 005 and 007 `wave-status.md` /
     `execution-map.yaml` files were observed *locally modified* (uncommitted)
     in the working tree. Where a wave-status claim is load-bearing this file
     cites the committed contract YAML and `git show HEAD:<path>` instead, not
     the dirty working-tree copy.
4. **POS-Pulse `main` and active specs** — only required for rows whose
   surface is fed by POS (currently RF-4 unknown-item capture and RF-6 audit
   events) or rows that must confirm a POS boundary (RF-5 A6).
   - Repo: `https://github.com/ahmed-shaaban-94/POS-Pulse`, branch `main`
     (HEAD `c9fd404` at 2026-05-30). POS device/operator identity is
     POS-Pulse-owned (Electron terminal); the backend operator surface it
     pairs against is Data-Pulse-2 `pos-operators.openapi.yaml`
     (`/api/pos/v1/operators/*`, Clerk JWT) — a distinct namespace from the
     console's session-cookie surfaces.

Verification MUST NOT proceed from a fork, a feature branch, or a personal
copy. The reference is always Data-Pulse-2 `main` (or, for in-flight intent,
the named active spec/wave-status file on `main`).

**Constitution anchor.** This order matches `.specify/memory/constitution.md`
§Source-of-truth order.

---

## RF-1 — Auth / session / context shell

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Sign-in / session endpoint | `stable` | Data-Pulse-2 `packages/contracts/openapi/auth.openapi.yaml` on `main` @ `b5142fe` (`-draft` per repo convention; `operationId: signIn`, `POST /api/v1/auth/signin`; cookie-based dashboard sessions, `dp2_session` HttpOnly cookie); Data-Pulse-2 `specs/001-foundation-auth-tenant-store/sc-verification.md` on `main` (declares "All nine Success Criteria SC-1 … SC-9 are now Verified — Foundation milestone complete" at SHA `602ae5c`) | 2026-05-25 (promoted to `stable` per §Status legend Version-suffix convention rule) | Ahmed Shaaban | OQ-1 closed for this row. Promotion rationale: upstream SC-verification declares Foundation milestone complete at SHA `602ae5c`; SC-1, SC-3, SC-4, SC-5 (auth-relevant) all Verified. `-draft` suffix is the Data-Pulse-2 labeling convention. SignInResponse includes `memberships[]` driving the active-tenant chooser. |
| Session-context endpoint (active tenant + active store for the authenticated actor) | `stable` | Data-Pulse-2 `packages/contracts/openapi/context.openapi.yaml` on `main` @ `b5142fe` (`-draft` per repo convention; `operationId: getActiveContext`, `GET /api/v1/context/me`; also `switchActiveTenant POST /api/v1/context/tenant`, `switchActiveStore POST /api/v1/context/store`, `clearActiveStore DELETE /api/v1/context/store`); Data-Pulse-2 `specs/001-foundation-auth-tenant-store/sc-verification.md` SC-5 (p95 = 7.0 ms ≤ 200 ms threshold, Verified) | 2026-05-25 (promoted to `stable` per §Status legend Version-suffix convention rule) | Ahmed Shaaban | OQ-1 closed for this row. Promotion rationale: SC-5 directly Verified at p95 = 7.0 ms (35× headroom under target). ContextResponse carries `user`, `active_tenant`, `active_store`, `active_role_code`, `memberships[]` (with `store_access_kind` enum and `accessible_store_ids`). Sufficient for the console's tenant/store context shell. |
| Session lifecycle (sign-out, refresh, expiry semantics) | `stable` | Data-Pulse-2 `packages/contracts/openapi/auth.openapi.yaml` on `main` @ `b5142fe` (`operationId: signOut POST /api/v1/auth/signout`; `operationId: refreshSession POST /api/v1/auth/refresh` for sliding window within absolute cap); Data-Pulse-2 `specs/001-foundation-auth-tenant-store/frontend-bypass-probe.md` (server-only authorization confirmed via T205 automated test + manual probe — backs FR-002) | 2026-05-25 (promoted to `stable` per §Status legend Version-suffix convention rule) | Ahmed Shaaban | OQ-1 closed for this row. Promotion rationale: SC-4 (server-only authorization) Verified via T205 + manual probe. Auth surface also defines password-reset (`requestPasswordReset`, `confirmPasswordReset`) and email-verification (`requestEmailVerification`, `confirmEmailVerification`) — not required for RF-1 MVP but available to later RF-5 work. |

**Gate impact.** Until all RF-1 rows are at `stable` or `draft`, no per-family
`implementation` slice (RF-2..RF-7) may open. **All three RF-1 rows are now
at `stable`** (verified 2026-05-25 against Data-Pulse-2 `main` @ `b5142fe`,
promoted from `draft` to `stable` on 2026-05-25 per the §Status legend
Version-suffix convention rule). This gate is now met. The console may not
yet *begin implementation* — that still requires the full FR-008 five-gate
approval per slice — but planning is unblocked, and downstream slices
consuming RF-1 do NOT need to re-verify the surface (only re-verify if a
Data-Pulse-2 demotion event has been logged here).

---

## RF-2 — Tenant / store management

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Tenant list (scoped by actor) | `stable` | Data-Pulse-2 `packages/contracts/openapi/tenants.openapi.yaml` on `main` @ `62d0906` (`operationId: listTenants`, `GET /api/v1/tenants` — returns all for platform-admin, scoped otherwise); foundation `specs/001-foundation-auth-tenant-store/sc-verification.md` (SC-1 cross-tenant isolation Verified) | 2026-05-30 | Ahmed Shaaban | OQ-3 closed for this row. Promoted per §Status legend Version-suffix convention rule: same sc-verification basis already used for RF-1. |
| Tenant detail / create / update | `stable` | Data-Pulse-2 `tenants.openapi.yaml` on `main` @ `62d0906` (`readTenant GET /{id}`, `createTenant POST` — 403 if not platform-admin, `updateTenant PATCH`, `softDeleteTenant DELETE`); sc-verification SC-1 / SC-3 Verified | 2026-05-30 | Ahmed Shaaban | OQ-3 closed. A1-only for create/delete enforced by backend (403) per FR-002. |
| Store list (scoped by tenant + actor) | `stable` | Data-Pulse-2 `packages/contracts/openapi/stores.openapi.yaml` on `main` @ `62d0906` (`listStores GET /api/v1/stores` — scoped to active tenant; 401 if no active tenant); sc-verification SC-2 cross-store isolation Verified | 2026-05-30 | Ahmed Shaaban | OQ-3 closed for this row. |
| Store detail / create / update | `stable` | Data-Pulse-2 `stores.openapi.yaml` on `main` @ `62d0906` (`readStore GET /{id}`, `createStore POST` — 403 insufficient role, `updateStore PATCH`, `softDeleteStore DELETE`); sc-verification SC-2 / SC-3 Verified | 2026-05-30 | Ahmed Shaaban | OQ-3 closed. Role enforcement (tenant-admin/owner) backend-side per FR-002. |
| Tenant ↔ store ↔ actor scope graph (read of backend's authorization model) | `stable` | Data-Pulse-2 `context.openapi.yaml` on `main` @ `62d0906` (`getActiveContext` returns `memberships[]` with `role_code`, `store_access_kind` enum `[all, specific]`, `accessible_store_ids`); foundation sc-verification SC-3 (authorization coverage — four-variant matrix) Verified | 2026-05-30 | Ahmed Shaaban | OQ-4 closed for this row. The shape of the actor-permission matrix is readable from the context/membership response; the console reads + renders it and never decides scope (FR-002). |

---

## RF-3 — Catalog management

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Catalog read (scoped by tenant/store) | `blocked` | Data-Pulse-2 `packages/contracts/openapi/` on `main` @ `62d0906` — no standalone catalog-management contract exists (`README.md` lists six contracts-of-record; `catalog/` directory contains only `unknown-items.yaml`); `specs/003-catalog-foundation/spec.md` is **specification-only** ("No application code … No OpenAPI files") | 2026-05-30 | Ahmed Shaaban | OQ-3 resolved → `blocked` (verified-absent). 003 defines the catalog source-of-truth *model* but ships no consumable CRUD contract. A standalone catalog-management API is a future gated Data-Pulse-2 feature. |
| Catalog write (create / update / delete catalog rows) | `blocked` | Same as catalog-read row above — no catalog-write contract on `main` @ `62d0906`. (Note: `tenantAdminCreateProductFromUnknownItem` in `catalog/unknown-items.yaml` creates a product *from an unknown item* — that is RF-4b reconciliation, not a general catalog-write surface.) | 2026-05-30 | Ahmed Shaaban | OQ-3 resolved → `blocked` (verified-absent). Write semantics + scope enforcement will live in Data-Pulse-2 when the catalog-management feature ships. |
| Catalog row identity model (how a row is uniquely identified across stores) | `blocked` | Data-Pulse-2 `specs/003-catalog-foundation/spec.md` on `main` @ `62d0906` — defines Tenant Catalog / Store Override / Product Aliases as concepts but ships no contract; the identity model is described in spec prose, not a consumable API | 2026-05-30 | Ahmed Shaaban | OQ-3 resolved → `blocked` (verified-absent). The `product_id` referenced by RF-4b reconciliation requests exists in the runtime (`tenant_products`), but no console-facing catalog read/identity contract is published on `main`. |

---

## RF-4 — Unknown items review

### RF-4a — List / dismiss

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Unknown-item list (scoped by tenant/store) | `draft` | Data-Pulse-2 `packages/contracts/openapi/catalog/unknown-items.yaml` on `main` @ `62d0906` — now **v1.2.0-draft** (was v1.0.0-draft at the 2026-05-25 lookup); `operationId: tenantAdminListUnknownItems` + the 007 list-param extensions (`source_system`, `sort`, `group_by`) present in the committed contract. | 2026-05-30 (re-verified; evidence refreshed) | Ahmed Shaaban | **Status unchanged (`draft`), evidence advanced.** **Load-bearing reason for `draft`:** the catalog/unknown-items surface has **no upstream `sc-verification.md`** (unlike foundation 001); the §Status legend Version-suffix convention rule requires that artifact for `stable`, so `draft` is the correct ceiling regardless of runtime state. (Color, not load-bearing: the 007 wave-status — observed locally modified — attributes the list/filter/sort/group runtime to PR #405.) Must be re-verified before RF-4 implementation gate (FR-005). |
| Unknown-item dismiss | `draft` | Data-Pulse-2 `catalog/unknown-items.yaml` on `main` @ `62d0906` (v1.2.0-draft) — `operationId: tenantAdminDismissUnknownItem` present; dismiss response now narrows to the `ReviewQueueItem` projection (007, no `sale_context`). | 2026-05-30 (re-verified) | Ahmed Shaaban | Same classification reasoning as list row above: runtime merged, no sc-verification ⇒ `draft`. |
| Unknown-item inspect / filter / sort / group (007 review-queue read surface) | `draft` | Data-Pulse-2 `catalog/unknown-items.yaml` on `main` @ `62d0906` (v1.2.0-draft) — `operationId: tenantAdminInspectUnknownItem` (`GET /api/v1/catalog/unknown-items/{id}`), `source_system`/`sort`/`group_by` list params, `ReviewQueueItem` projection, and `forbidden` 8th error category all present in the committed contract. | 2026-05-30 (new row) | Ahmed Shaaban | New `draft` row recording the 007 read-side advance — review-safe list/filter/sort/group/inspect is contract-confirmed on `main`. **Load-bearing reason for `draft` (not `stable`):** the catalog/unknown-items surface has **no upstream `sc-verification.md`** (unlike foundation 001); the §Status legend Version-suffix convention rule requires that artifact for `stable`. (Color, not load-bearing: the 007 wave-status — observed locally modified — attributes the runtime to PR #405/#406; classification does not rest on that file.) |
| Unknown-item reopen (`tenantAdminReopenUnknownItem`) | `draft` | Data-Pulse-2 `catalog/unknown-items.yaml` on `main` @ `62d0906` (v1.2.0-draft) — `operationId: tenantAdminReopenUnknownItem` present in the committed **contract** (tenant-wide actors only, FR-042). **Runtime confirmed absent in committed `main`:** `git show HEAD:apps/api/src/catalog/.../*.controller.ts` @ `62d0906` has no reopen route handler (only a comment referencing the future `forbidden`-category use); `git grep -niE "Reopen" HEAD` finds no committed controller route. | 2026-05-30 (new row) | Ahmed Shaaban | **Contract-on-main but runtime-absent-in-committed-main** (verified against HEAD, not the dirty wave-status). Kept `draft` and explicitly gated: contract presence is not runtime readiness. Re-verify both contract and runtime before any RF-4 reopen implementation. Do NOT mark reopen runtime stable. |
| Unknown-item bulk-dismiss (`tenantAdminBulkDismissUnknownItems`) | `draft` | Data-Pulse-2 `catalog/unknown-items.yaml` on `main` @ `62d0906` (v1.2.0-draft) — `operationId: tenantAdminBulkDismissUnknownItems` present in the committed **contract** (≤200 ids, whole-batch reject over ceiling). **Runtime confirmed absent in committed `main`:** `git grep -niE "BulkDismiss" HEAD -- apps/api/src` @ `62d0906` finds no committed controller route handler. | 2026-05-30 (new row) | Ahmed Shaaban | **Contract-on-main but runtime-absent-in-committed-main** (verified against HEAD). Same gating as reopen row. Do NOT mark bulk-dismiss runtime stable. |

### RF-4b — Link to existing / create new from unknown (reconciliation)

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Link unknown-item to existing catalog row | `draft` (promoted from `blocked` 2026-05-30 on verified evidence; `stable` still gated by FR-012 — see notes) | Data-Pulse-2 `packages/contracts/openapi/catalog/unknown-items.yaml` on `main` @ `62d0906` — **v1.2.0-draft**, `operationId: tenantAdminLinkUnknownItem` present in committed contract (`POST /api/v1/catalog/unknown-items/{id}/link`); 005 Wave 2 LINK-HAPPY/EDGES runtime merged on `main` (`ReconciliationController` route at `git show HEAD:apps/api/src/catalog/reconciliation/reconciliation.controller.ts`, link handler present; PRs #355/#357/#359 per 005 wave-status) | 2026-05-30 (promoted `blocked` → `draft` on verified contract+runtime) | Ahmed Shaaban | **`blocked` → `draft` on the verified evidence alone** (contract + runtime on committed `main` @ `62d0906`). FR-012 requires no special ceremony for this move — both `blocked` and `draft` are inside the permitted band; the 2026-05-25 "deferred / not-in-main" rationale is simply superseded by the merge. **Held at `draft`, not `stable`:** FR-012 gates the move *to `stable`* on the owner recording that Data-Pulse-2 has confirmed the contract is **stable** — that confirmation has **not** been made, and the catalog/unknown-items surface has **no upstream `sc-verification.md`** (same ceiling as RF-4a). Must be re-verified before the RF-4b implementation gate clears (FR-005). **SD-1 remains deferred:** RF-4b is still out of scope for the first-pass plan; closing SD-1 is a separate spec amendment the owner makes when an RF-4b slice opens. |
| Create new catalog row from unknown-item | `draft` (promoted from `blocked` 2026-05-30 on verified evidence; `stable` still gated by FR-012) | Data-Pulse-2 `catalog/unknown-items.yaml` on `main` @ `62d0906` (v1.2.0-draft) — `operationId: tenantAdminCreateProductFromUnknownItem` present in committed contract (`POST /api/v1/catalog/unknown-items/{id}/create-product`); 005 Wave 2 CREATE-HAPPY/EDGES runtime merged on `main` (`reconciliation.controller.ts` create-product handler present at HEAD; PRs #364/#367 per 005 wave-status) | 2026-05-30 (promoted `blocked` → `draft` on verified contract+runtime) | Ahmed Shaaban | Same basis as the link row above: `blocked` → `draft` on verified contract+runtime (committed `main`); no FR-012 ceremony needed for that move. Held at `draft` because FR-012's *stable*-gate is unmet (no sc-verification). SD-1 deferred. |

**Cross-reference.** `spec.md` FR-012 codifies the reconciliation guard:
RF-4b "MUST remain classified as `blocked` or `draft` **until** the human
owner records that Data-Pulse-2 has confirmed the reconciliation contract is
**stable**." Read literally, FR-012 gates the move **to `stable`** — it does
**not** gate `blocked` → `draft` (both are inside the permitted band). So:
- The **2026-05-30 `blocked` → `draft` move stands on the verified evidence
  alone** (contract + runtime merged on committed `main` @ `62d0906`); no
  owner ceremony was required for it.
- The **FR-012 stable-confirmation has NOT been recorded** — and the
  catalog/unknown-items surface has no `sc-verification.md` — which is exactly
  **why these rows are `draft` and not `stable`.**

This change is mirrored in `spec.md` §6 in the same edit (sync rule).
**SD-1 (spec.md §11) stays in force**: RF-4b remains out of scope for the
first-pass plan until a separate owner amendment closes it. A future move to
`stable` requires the owner to record an FR-012 stability confirmation —
which in turn needs either an upstream `sc-verification.md` for the
catalog/unknown-items surface or an explicit, recorded owner override.

---

## RF-5 — Operator / admin management

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Identity list (for A1–A5 only; A6 is POS-Pulse-owned and must not appear here) | `stable` | Data-Pulse-2 `packages/contracts/openapi/tenants.openapi.yaml` on `main` @ `62d0906` (`operationId: listMembers`, `GET /api/v1/tenants/{tenant_id}/members` → `MembershipDetail[]`); foundation `sc-verification.md` SC-1/SC-2 isolation Verified | 2026-05-30 | Ahmed Shaaban | OQ-3 + OQ-4 boundary check closed. The console membership-list surface is session-cookie-auth (`cookieAuth`) and tenant-scoped — distinct from the POS A6 surface (see boundary row below). |
| Identity detail / invite / disable | `stable` | Data-Pulse-2 `packages/contracts/openapi/memberships.openapi.yaml` on `main` @ `62d0906` (`createInvitation POST /api/v1/memberships/invite` (idempotency-key required), `updateMembership PATCH /{id}`, `revokeMembership DELETE /{id}`, `acceptInvitation POST /api/v1/invitations/accept`); sc-verification SC-6 onboarding (invite→accept→signin) Verified | 2026-05-30 | Ahmed Shaaban | OQ-3 closed. "Disable" = soft-delete via `revokeMembership` (revoked_at). |
| Role / scope assignment surface | `stable` | Data-Pulse-2 `memberships.openapi.yaml` on `main` @ `62d0906` (`MembershipUpdate` carries `role_code`, `store_access_kind` enum `[all, specific]`, `store_ids`); foundation sc-verification SC-2 (D-6 revoke-cache) + SC-3 Verified | 2026-05-30 | Ahmed Shaaban | OQ-4 closed for this row. Backend enforces the scope; the console reads + renders (FR-002). |
| Boundary check: no overlap with POS-Pulse A6 operator surfaces | `stable` | Data-Pulse-2 `main` @ `62d0906`: the console identity surfaces above live on `/api/v1/memberships/*` + `/api/v1/tenants/{id}/members` under `cookieAuth`. The **A6 POS operator** surface is a **separate** contract `packages/contracts/openapi/pos-operators.openapi.yaml` ("POS-Pulse 004 Backend operator identity surface") on `/api/pos/v1/operators/*` under Clerk JWT bearer. POS-Pulse `main` @ `c9fd404` owns the terminal/operator-session app (Electron). | 2026-05-30 | Ahmed Shaaban | Boundary confirmed **clean**: A6 operators are not exposed via the A1–A5 endpoints. Console RF-5 scope is A1–A5 only; POS device/operator management belongs to POS-Pulse and its dedicated DP2 POS-namespace contract — **not in the console's scope** (FR-003, spec.md §4 POS boundary rule). |

---

## RF-6 — Audit / search

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Audit query (scoped by tenant + optionally store) | `stable` | Data-Pulse-2 `packages/contracts/openapi/audit.openapi.yaml` on `main` @ `62d0906` (`operationId: listAuditEvents`, `GET /api/v1/audit/events` — filters `action` (prefix match), `actor_user_id`, `store_id`, `from`/`to`, cursor pagination; tenant-admin/platform-admin scope); foundation `sc-verification.md` SC-7 auditability Verified (365-day retention, insert-only, RLS-scoped) | 2026-05-30 | Ahmed Shaaban | OQ-3 closed for this row. Basic audit query readiness confirmed: read-only, tenant-scoped, server-enforced role (403). |
| Operational event search | `stable` | Same surface as audit-query row: `listAuditEvents` on `audit.openapi.yaml` @ `62d0906` provides the action/actor/store/time filtered search. `AuditEvent` carries `action`, `target_type`, `target_id`, `metadata`. sc-verification SC-7 Verified | 2026-05-30 | Ahmed Shaaban | OQ-3 closed. The console's operational-event search consumes the same `listAuditEvents` query surface. (POS-*originated* event semantics are a separate concern — see the next row, now resolved to `draft` via dual-repo verification.) |
| POS-originated event surface (which POS-Pulse event types reach the audit/search read API, and under which retention + visibility rules) | `draft` | **Dual-repo verified 2026-05-30.** *Ingestion (Data-Pulse-2 `main` @ `62d0906`):* `packages/contracts/openapi/pos-audit-events.openapi.yaml` (`operationId: posAuditEventsSync`, `POST /api/pos/v1/audit-events`) persists each event to **the same `audit_events` table the console's `listAuditEvents` reads** (the contract names "the `actor_user_id` FK on the audit_events table"; `acting_operator_id` Clerk subject → `users.id` via `users.clerk_user_id`). Closed POS event catalogue: `shift.open`, `shift.close`, `shift.forced_close`, `operator.session.takeover`, `cashier.pin.reset`, `cashier.pin.unlock`. *Emission (POS-Pulse `main` @ `c9fd404`):* `specs/004-operator-session/contracts/backend-endpoints.md` Endpoint 5 declares the **identical** catalogue emitted via the same `POST /api/pos/v1/audit-events`. *Retention:* single `audit_events` table ⇒ foundation SC-7 365-day mark-only retention applies uniformly (no POS-specific carve-out found in `packages/db`). *Visibility:* tenant + store scoped (`branch_id` → `store_id` at DTO boundary), RLS-enforced (foundation SC-1/SC-2). | 2026-05-30 | Ahmed Shaaban | **OQ-5 resolved `unknown` → `draft`.** Both ingestion (DP2) and emission (POS-Pulse) corroborate the same closed event catalogue reaching the console-readable `audit_events` table; payloads are redaction-guarded (PR-1/FR-027 forbidden-key list). `draft` not `stable`: `pos-audit-events.openapi.yaml` is `v1.0.0-draft` with **no upstream `sc-verification.md`** for the POS-audit ingestion surface, and the contract states its action-category catalogue is **append-only** (future categories land in a contract revision) — an active-evolution signal. **Specific residual to re-verify before the RF-6 impl gate (FR-005):** this verification confirmed POS events land in the *shared* `audit_events` table (the contract's `actor_user_id` FK reference) and are tenant/store-scoped; it did **not** confirm (a) how the POS `action_category` (e.g. `shift.forced_close`) maps onto the `action` column that `listAuditEvents` filters on, nor (b) that no dashboard-side visibility filter excludes POS-namespace rows from the console read. Those two mappings are exactly what the `draft` ceiling reserves. Console remains read-only over these events (FR-003). |

---

## RF-7 — Settings / system management

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Tenant-level configuration surface | `blocked` | Data-Pulse-2 `packages/contracts/openapi/` on `main` @ `62d0906` — no settings/system-configuration contract exists among the contracts-of-record or any other published OpenAPI file. (`tenants.openapi.yaml` `TenantUpdate` exposes `name`/`status` only — tenant *administration*, not a general settings surface.) | 2026-05-30 | Ahmed Shaaban | OQ-3 resolved → `blocked` (verified-absent). A dedicated settings/system-management API is a future gated Data-Pulse-2 feature; nothing to plan a UI slice against yet. |
| Store-level configuration surface | `blocked` | Same as tenant-level row: no settings contract on `main` @ `62d0906`. (`stores.openapi.yaml` `StoreUpdate` exposes `name`/`is_active` only.) | 2026-05-30 | Ahmed Shaaban | OQ-3 resolved → `blocked` (verified-absent). |
| Platform-level configuration surface (A1 only) | `blocked` | Same: no platform-configuration contract on `main` @ `62d0906`. | 2026-05-30 | Ahmed Shaaban | OQ-3 resolved → `blocked` (verified-absent). When such a surface ships, backend authorization will restrict it to A1 per FR-002. |

---

## Cross-cutting

| Concern | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Actor → route-family permission matrix shape | `stable` | Data-Pulse-2 `context.openapi.yaml` on `main` @ `62d0906` (`getActiveContext` → `memberships[]` with `role_code` + `store_access_kind` + `accessible_store_ids`; `active_role_code`); foundation `sc-verification.md` SC-3 (four-variant authorization matrix — unauthenticated / wrong-tenant / wrong-store / insufficient-role) Verified | 2026-05-30 | Ahmed Shaaban | OQ-4 resolved. The matrix *shape* is readable from the membership/context response. Frontend never decides scope; it reads + renders backend truth (FR-002). |
| POS-Pulse boundary integrity (no console call ever writes back to a POS device or terminal) | `stable` | Data-Pulse-2 `main` @ `62d0906`: every console-consumed surface (auth/context/tenants/stores/memberships/audit + the `/api/v1/catalog/unknown-items` review surface) is `cookieAuth` dashboard-facing. POS write-paths are isolated to `/api/pos/v1/*` POS-namespace contracts (`pos-operators`, `pos-shifts`, `pos-audit-events`, `pos-terminal-pairing`, `pos-payments/`) under Clerk JWT — the console consumes none of them. POS-Pulse `main` @ `c9fd404` is the Electron terminal app; the console renders POS-originated data via Data-Pulse-2 read APIs only. | 2026-05-30 | Ahmed Shaaban | Boundary confirmed: no console surface writes to a POS device. The console stays read-only for POS-originated data (FR-003). (The narrower question of *which POS event types* surface in audit/search is resolved to `draft` — see §RF-6 OQ-5.) |
| Generated-client toolchain + storage location | `stable` (toolchain, storage location, and generated output are committed from pinned Data-Pulse-2 auth/context contracts) | **Toolchain: `openapi-typescript` + `openapi-fetch`** (D-2). **Storage: vendored at `src/generated/`, committed** (D-7). Decided in slice `002-tooling-and-scaffold` `/speckit-clarify` (`e766a76`) and implemented in slice 002 (`openapi-ts.config.ts` pins Data-Pulse-2 @ `62d0906`; `pnpm generate:client` reads the pinned git objects and writes `src/generated/schema.d.ts`). The generated file namespaces the separate auth/context OpenAPI documents because the upstream sources have overlapping component names, then composes their `paths` type for `openapi-fetch`. | 2026-05-31 (toolchain + storage chosen, committed, and regenerated from pinned contracts) | Ahmed Shaaban | OQ-6 toolchain choice is **resolved** (was gated by FR-006 → decided in slice 002 per the clarify). **OQ-002-1 confirmed:** no upstream client package ⇒ 002 generates locally and vendors output (the foreclosed "consume a package" branch). **Pin:** 002 re-pinned C-4 `b5142fe` → `62d0906`; the generator config targets that SHA. RF implementation slices should re-run `pnpm generate:client` when their consumed upstream contracts change, without copying OpenAPI source contracts into this repository. |
| Verification artifact shape (this file) | `confirmed` | This document | 2026-05-25 | Ahmed Shaaban | OQ-7 closure: this file is the artifact. Format may evolve via amendment; the *existence* of the artifact is now answered. |

---

## Plan gate decision

A standing record of whether `/speckit-plan` may run against this feature.
Updated whenever a row above changes status enough to affect the gate.

| Field | Value |
| --- | --- |
| `/speckit-plan` status | **ready** |
| Decision date | 2026-05-25 (gate-lift) |
| Decided by | Ahmed Shaaban |

### Resolved blockers

- ~~**RF-1 auth/session/context remains `unknown`**~~ — **resolved
  2026-05-25.** All three RF-1 rows verified and promoted to `stable`
  against Data-Pulse-2 `main` @ `b5142fe` (`auth.openapi.yaml` +
  `context.openapi.yaml`; Data-Pulse-2 slice `001-foundation-auth-tenant-store`
  is past `sc-verification.md` with all 9 success criteria Verified at
  SHA `602ae5c`). Promoted from `draft` to `stable` on 2026-05-25 per
  the §Status legend Version-suffix convention rule (added in the same
  edit). OQ-1 closed in spec.md §10 traceability via the Verification
  log entry below. Gate-lift condition 1 now met (would have been met
  at `draft`; `stable` is the more accurate classification).
- ~~**RF-4b unknown-item link / create-new reconciliation remains
  `blocked`**~~ — resolved 2026-05-25 by `spec.md` §11 SD-1 (Scope
  deferrals). RF-4b is deferred *out* of the first-pass plan; the
  upstream Wave 2 gate no longer blocks planning. FR-012 guard remains
  active for any *future* slice that depends on RF-4b. Gate-lift
  condition 2b met.
  - **2026-05-30 update:** SD-1's re-evaluation trigger **fired**. The
    Data-Pulse-2 Wave 2 reconciliation contract **and** runtime are merged on
    `main` @ `62d0906` (see §RF-4b + the 2026-05-30 "Follow-up resolutions"
    Verification log entry), so RF-4b moved **`blocked` → `draft`** on that
    verified evidence (FR-012 does not gate this move — both states are inside
    its permitted band). This does **not** change the plan gate (still
    `ready`). **SD-1 stays deferred:** RF-4b remains out-of-scope for the
    first-pass plan; closing SD-1 (bringing RF-4b into plan scope) is a
    separate spec amendment for when an RF-4b slice opens. **The remaining
    gate to `stable`** is FR-012's owner stable-confirmation, which is unmet
    and itself needs an upstream `sc-verification.md` for the
    catalog/unknown-items surface (FR-005 re-verify-before-impl).

### Allowed next work

- **Run `/speckit-plan`** against this spec. Both gate-lift conditions are
  met. The plan MUST:
  - Treat RF-1 as the foundational layer (spec.md §5 sequencing rule)
    and consume the Data-Pulse-2 endpoints recorded in §RF-1 above
    (signIn / signOut / refreshSession; getActiveContext /
    switchActiveTenant / switchActiveStore / clearActiveStore).
  - Honor SD-1: RF-4b is out of scope for the first-pass plan. (Note: as
    of 2026-05-30 the SD-1 re-evaluation trigger has fired — see Resolved
    blockers above — but RF-4b stays out-of-scope until an owner decision
    closes SD-1.)
  - Treat the per-family readiness now recorded (2026-05-30): RF-2, RF-5,
    and RF-6 (audit query + operational-event search) are `stable`; RF-4a,
    RF-4b, and RF-6 POS-originated-event surface are `draft`; RF-3 and RF-7
    are `blocked`. **No `unknown` rows remain.** The plan may sequence their
    work but MUST NOT clear FR-008 gates for any of them in this round, and
    MUST honor SD-1 (RF-4b out of first-pass scope).
- Continue cross-repo API readiness verification where rows remain at a
  non-`stable` ceiling: the `draft` rows (RF-4a / RF-4b / RF-6 POS-event)
  must be re-verified before their implementation gates clear (FR-005), and
  the `blocked` RF-3 / RF-7 surfaces should be re-checked when Data-Pulse-2
  ships catalog-management / settings contracts. These gate their respective
  per-family implementation slices, not the foundation plan.
- Continue updating this file (and `spec.md` §6 in sync) as further
  verifications land.

### Not yet allowed

- Do not begin any per-family **implementation** slice. `/speckit-plan` is
  ready, but FR-008's full five-gate approval (spec + plan + tasks + API
  map + validation gates, all approved by the human owner) is still
  required per-slice.
- Do not add `package.json`, lockfile, `src/`, `app/`, `pages/`,
  `components/`, framework scaffold, generated client, CI workflow, or
  deployment configuration. These remain gated by the constitution
  regardless of plan-gate status.

### Gate-lift conditions

The `/speckit-plan` status MAY move from `blocked` to `ready` only when
**both** of the following hold:

1. RF-1 (all three rows under RF-1 in §RF-1 above) is resolved to
   `stable` or `draft` against a specific Data-Pulse-2 reference.
   **Status: met. All three rows `stable` against Data-Pulse-2 `main` @
   `b5142fe`, verified 2026-05-25 and promoted from `draft` to `stable`
   on 2026-05-25 per the Version-suffix convention rule (see
   Verification log).**
2. RF-4b is either (a) demoted to `draft` against a Data-Pulse-2 reference
   that supersedes the current Wave 2 "gated approval" posture, or
   (b) explicitly scoped *out* of the first-pass plan via an amendment to
   `spec.md` (in which case FR-009 "no silent scope expansion" requires
   that amendment to be visible and approved before planning proceeds).
   **Status: met via path (b) — `spec.md` §11 SD-1 (2026-05-25).**

**Both conditions met as of 2026-05-25.** `/speckit-plan` is unblocked.

Per-family planning for RF-2 / RF-3 / RF-5 / RF-6 / RF-7 remains additionally
gated on their own `unknown` rows resolving — but those are per-family
planning decisions, not the foundation plan gate above.

---

## How to update this file

When performing a cross-repo verification, update the affected row(s) and
**also** update `spec.md` §6 in the same edit so the two stay in sync.

For each row being promoted away from `unknown`:

1. Record the exact reference in **Verified against**. Acceptable forms:
   - `Data-Pulse-2 main @ <commit-sha>` (preferred)
   - `Data-Pulse-2 OpenAPI @ <path>:<commit-sha>`
   - `Data-Pulse-2 wave-status @ <filename> (<date>)`
   - `Data-Pulse-2 active spec @ <path>:<commit-sha>`
   - `POS-Pulse main @ <commit-sha>` (only for POS-touched rows)
2. Record **Date** as ISO `YYYY-MM-DD` (the date the verification was
   actually performed, not the date you typed the row).
3. Record **Confirmer** as the human who performed the verification.
4. Update **Current status** to one of `stable` / `draft` / `blocked` (never
   leave a row at `unknown` after a verification — record what you found).
5. Append a line to the §Verification log below describing the change.
6. If the change affects `spec.md` §6, edit that section in the same commit.
   A commit that updates this file without updating `spec.md` §6 (when §6
   needs updating) is incomplete and should be amended before push.

Do **not** record information that copies Data-Pulse-2 contract content
(field names, types, request/response shapes) into this file. Reference only.

---

## Verification log

A dated, append-only journal of every change to this file's row statuses.
One entry per verification event. Most recent first.

### 2026-05-30 — Follow-up resolutions: RF-4b owner promotion, OQ-5 dual-repo verification, OQ-002-1 input

This entry follows the same-day cross-repo re-verification below; it records
the owner-decision and additional-verification follow-ups taken to remove the
deferred obstacles that the first pass had surfaced.

- **RF-4b (both rows) `blocked` → `draft`.** Promoted on the **verified
  evidence alone** — the reconciliation contract **and** runtime are on
  Data-Pulse-2 `main` @ `62d0906`, verified against committed state:
  `git show HEAD:apps/api/src/catalog/reconciliation/reconciliation.controller.ts`
  carries both `POST /api/v1/catalog/unknown-items/:id/link`
  (`tenantAdminLinkUnknownItem`) and `.../create-product`
  (`tenantAdminCreateProductFromUnknownItem`), Zod-validated, role-gated,
  `@Auditable`. **FR-012 note:** FR-012 gates the move *to `stable`*, not
  `blocked` → `draft` (both are inside its permitted band), so this move needs
  no owner ceremony — the merge supersedes the 2026-05-25 "deferred" rationale.
  Rows held at **`draft`, not `stable`**, precisely because FR-012's
  stable-confirmation is **unmet**: there is no upstream `sc-verification.md`
  for the catalog/unknown-items surface (same ceiling as RF-4a; FR-005
  re-verify-before-impl still applies). **SD-1 (spec.md §11) remains
  deferred** — RF-4b stays out of the first-pass plan until a separate owner
  amendment closes SD-1. `spec.md` §6 RF-4b row updated in the same edit.
- **RF-6 POS-originated event surface `unknown` → `draft` (OQ-5 resolved).**
  Dual-repo verification completed:
  - *Ingestion (Data-Pulse-2 `main` @ `62d0906`):* `pos-audit-events.openapi.yaml`
    (`posAuditEventsSync`, `POST /api/pos/v1/audit-events`) persists to the same
    `audit_events` table `listAuditEvents` reads; closed catalogue =
    `shift.open` / `shift.close` / `shift.forced_close` /
    `operator.session.takeover` / `cashier.pin.reset` / `cashier.pin.unlock`;
    payload redaction enforced (PR-1/FR-027 forbidden keys).
  - *Emission (POS-Pulse `main` @ `c9fd404`):*
    `specs/004-operator-session/contracts/backend-endpoints.md` Endpoint 5
    declares the identical catalogue over the same endpoint.
  - *Retention:* single `audit_events` table ⇒ foundation SC-7 365-day
    mark-only retention applies uniformly (no POS carve-out). *Visibility:*
    tenant+store scoped (`branch_id`→`store_id`), RLS-enforced (SC-1/SC-2).
  - `draft` not `stable`: `pos-audit-events.openapi.yaml` is `v1.0.0-draft`, no
    sc-verification, append-only catalogue (evolution signal). Console stays
    read-only over these events (FR-003). `spec.md` §6 RF-6 row updated in sync.
- **OQ-002-1 input recorded (Cross-cutting generated-client row).** Verified
  Data-Pulse-2 `packages/contracts/README.md` @ `62d0906` states generated
  client types are "intentionally deferred" — DP2 publishes no client package.
  Recorded as input for slice 002's `/speckit-clarify` (D-2/D-7 = generate +
  vendor locally). The toolchain *choice* stays gated by FR-006 (`deferred`).
  Also recorded: C-4 pin refresh recommendation (`b5142fe` → `62d0906`) for
  slice 002's spec.
- **No `unknown` rows remain in this file** after this entry.
- Confirmer: Ahmed Shaaban.

### 2026-05-30 — RF-2 / RF-3 / RF-4 / RF-5 / RF-6 / RF-7 cross-repo re-verification

Verified against Data-Pulse-2 `main` @ `62d0906` (PR #406) and POS-Pulse
`main` @ `c9fd404`. Foundation `specs/001-foundation-auth-tenant-store/sc-verification.md`
(SC-1..SC-9 Verified at SHA `602ae5c`) is the corroborating SC-verification
artifact for the tenant/store/membership/audit promotions, per the §Status
legend Version-suffix convention rule (the same basis already used for RF-1).

- **RF-2 Tenant / store management** — all five rows `unknown` → `stable`.
  `tenants.openapi.yaml` (`listTenants`, `readTenant`, `createTenant`,
  `updateTenant`, `softDeleteTenant`), `stores.openapi.yaml` (`listStores`,
  `readStore`, `createStore`, `updateStore`, `softDeleteStore`),
  `context.openapi.yaml` membership graph. OQ-3 + OQ-4 (matrix-shape row)
  closed.
- **RF-3 Catalog management** — all three rows `unknown` → `blocked`
  (verified-absent). No standalone catalog-management contract exists on
  `main`; `catalog/` holds only `unknown-items.yaml`; `specs/003-catalog-foundation`
  is specification-only. NOT promoted to `stable` — catalog foundation/spec
  material is not an implementation-ready API. OQ-3 resolved.
- **RF-4a Unknown items — list / dismiss / inspect / filter / sort / group** —
  evidence refreshed; status stays `draft`. `catalog/unknown-items.yaml` is now
  **v1.2.0-draft** (was v1.0.0-draft on 2026-05-25). 007 Wave 1 P1-MVP runtime
  merged on `main` (PR #405 `0c1bec7` + #406 `62d0906`): `tenantAdminListUnknownItems`,
  `tenantAdminDismissUnknownItem`, `tenantAdminInspectUnknownItem`,
  `source_system`/`sort`/`group_by` list params, `ReviewQueueItem` projection,
  `forbidden` 8th error category. Review-safe list/filter/sort/group/inspect
  is verified on `main`. NOT promoted to `stable`: the catalog/unknown-items
  surface has no upstream `sc-verification.md`. Two new gated rows added for
  **reopen** and **bulk-dismiss** — those operationIds are contract-defined on
  `main` but their runtime (007 Phase 6/7) is still `proposed`, not merged; kept
  `draft` and explicitly gated so contract presence is not read as runtime
  readiness.
- **RF-4b Unknown items — link / create-new reconciliation** — **status kept
  `blocked`, but the SD-1 re-evaluation trigger has FIRED.** The 2026-05-25
  rationale ("Wave 2 requires gated approval / not in `main`") is now stale:
  `tenantAdminLinkUnknownItem` and `tenantAdminCreateProductFromUnknownItem`
  are present in the committed contract (`unknown-items.yaml` v1.2.0-draft @
  `62d0906`, verified via `git show HEAD:`) **and** the 005 Wave 2 reconciliation
  runtime is merged on `main` (`ReconciliationController` mounted; PRs
  #355/#357/#359/#364/#367 per 005 wave-status). Per **FR-012**, RF-4b promotion
  is reserved to the human owner — this verification records the changed
  evidence and surfaces the decision but does **not** promote the rows or
  close SD-1. spec.md §11 SD-1's re-evaluation trigger condition
  ("Data-Pulse-2 promotes the Wave 2 reconciliation contract out of 'requires
  gated approval' … by merging the Wave 2 spec into `main`") is met. Owner
  action required (see §RF-4b notes + the final report's RF-4b decision item).
  **[Superseded later the same day — see the "Follow-up resolutions" entry
  above: these rows moved `blocked` → `draft` on the verified contract+runtime
  (FR-012 does not gate that move; the move *to `stable`* stays gated on an
  unmet FR-012 stable-confirmation); SD-1 remains deferred.]**
- **RF-5 Operator / admin management** — all four rows `unknown` → `stable`.
  `tenants.openapi.yaml` (`listMembers`), `memberships.openapi.yaml`
  (`createInvitation`, `updateMembership`, `revokeMembership`,
  `acceptInvitation`). Boundary check confirmed **clean**: the A6 POS-operator
  surface is the separate `pos-operators.openapi.yaml` (`/api/pos/v1/operators/*`,
  Clerk JWT) — not exposed via the A1–A5 console endpoints. POS operator
  management remains POS-Pulse / DP2-POS-namespace scope, **not** the console's
  (FR-003). OQ-3 + OQ-4 boundary check closed.
- **RF-6 Audit / search** — audit-query and operational-event-search rows
  `unknown` → `stable` (`audit.openapi.yaml` `listAuditEvents`; sc-verification
  SC-7 auditability Verified). The **POS-originated event surface** row is kept
  `unknown` (OQ-5): the generic audit query does not document which POS-Pulse
  event types reach it or POS-side emission/retention/visibility semantics, and
  the required dual-repo (Data-Pulse-2 + POS-Pulse) corroboration has not been
  completed. Gated per FR-011. **[Superseded later the same day — see the
  "Follow-up resolutions" entry above: the dual-repo corroboration was
  completed and this row moved `unknown` → `draft`.]**
- **RF-7 Settings / system management** — all three rows `unknown` → `blocked`
  (verified-absent). No settings/system-configuration contract on `main`.
  OQ-3 resolved.
- **Cross-cutting** — actor→route-family matrix-shape row and POS-Pulse
  boundary-integrity row both `unknown` → `stable` (context/membership response
  + SC-3; POS namespace isolation confirmed).
- **Integrity note.** The Data-Pulse-2 working tree carried *uncommitted*
  modifications to `specs/005-…/` and `specs/007-…/` wave-status / execution-map
  files at verification time. All load-bearing claims above are cited against
  the **committed** contract YAML (clean at `62d0906`) and `git show HEAD:`
  / `git log` PR evidence — never the dirty working-tree copy.
- Confirmer: Ahmed Shaaban.
- `spec.md` §6 updated in the same edit (sync rule).

### 2026-05-25 — Initial creation

- File created from `/speckit-clarify` follow-up.
- All RF-1 / RF-2 / RF-3 / RF-5 / RF-6 / RF-7 rows initialized at `unknown`.
- RF-4a rows initialized at `draft` (carried from `spec.md` §6 per spec
  author instruction; not yet verified against any Data-Pulse-2 reference).
- RF-4b rows initialized at `blocked` (carried from `spec.md` §6 per
  spec.md FR-012; not yet verified).
- Cross-cutting row "Verification artifact shape" recorded as `confirmed`
  because the artifact (this file) now exists. Resolves OQ-7 from
  `spec.md` §10.
- Confirmer: Ahmed Shaaban.
- Verified against: this commit on branch `001-console-foundation`.

### 2026-05-25 — RF-1 promotion `draft` → `stable` + Version-suffix convention rule added

- §Status legend: added "Version-suffix convention rule" — a row MAY
  classify as `stable` despite an upstream `-draft` version suffix
  when (1) the OpenAPI file exists on Data-Pulse-2 `main` and defines
  the operationId(s), (2) the upstream slice owning those operations
  provides a `sc-verification.md` or equivalent, and (3) that
  verification artifact reports the relevant Success Criteria as
  `Verified`. Same section also adds an under-classification note:
  classifying a `stable` surface as `draft` is not safer than
  classifying it correctly.
- RF-1 "Sign-in / session endpoint": `draft` → `stable`.
- RF-1 "Session-context endpoint": `draft` → `stable`.
- RF-1 "Session lifecycle (sign-out / refresh / expiry)": `draft` → `stable`.
- Promotion evidence (unchanged from the original RF-1 verification —
  re-stated here for the audit trail):
  - All three rows verified earlier on 2026-05-25 against Data-Pulse-2
    `main` @ `b5142fe`. See the "2026-05-25 — RF-1 verification against
    Data-Pulse-2 (OQ-1)" entry below.
  - Upstream slice `001-foundation-auth-tenant-store`'s
    `sc-verification.md` declares "All nine Success Criteria
    SC-1 … SC-9 are now Verified — Foundation milestone complete"
    at Data-Pulse-2 SHA `602ae5c`.
  - SC-1, SC-3, SC-4, SC-5 are the auth/context-relevant criteria, all
    directly Verified (SC-5 measured at p95 = 7.0 ms vs 200 ms target).
- Confirmer: Ahmed Shaaban.
- Driver: 2026-05-25 external review (S-1) flagged that the literal
  "`-draft` suffix → `draft` row" rule was producing under-classification
  in the face of overwhelming corroborating evidence. The Version-suffix
  convention rule resolves the tension: literal rule still holds in the
  general case; explicit named exception when the SC-verification trio
  is met.
- `spec.md` §6 RF-1 row updated in the same commit (sync rule).

### 2026-05-25 — RF-4a verification (incidental to RF-4b lookup)

- RF-4a "Unknown-item list (scoped by tenant/store)":
  `draft` (seeded) → `draft` (verified, no status change).
- RF-4a "Unknown-item dismiss":
  `draft` (seeded) → `draft` (verified, no status change).
- Verified against:
  - Data-Pulse-2 `packages/contracts/openapi/catalog/unknown-items.yaml` on
    `main` @ `b5142fe` — Wave 1 operations confirmed present in the same
    lookup that verified RF-4b: `tenantAdminListUnknownItems`,
    `tenantAdminDismissUnknownItem`, and `posCaptureItem` (the latter is
    the POS-side capture that feeds the queue and is out of console scope
    for direct invocation; it produces the data the console reads).
- Confirmer: Ahmed Shaaban.
- Status promotion rationale: NOT promoted to `stable` even though the
  operations are present. Wave 1 sits inside an upstream wave-status
  process where Wave 2 reconciliation is explicitly gated; until
  Data-Pulse-2 publishes a SC-verification for the unknown-items surface
  comparable to slice `001-foundation-auth-tenant-store`'s, `draft` is
  the correct ceiling. The §Status legend Version-suffix convention rule
  requires an upstream SC-verification artifact for `stable` — absent
  for RF-4a today.
- Note: The seeded `draft` from spec.md author instruction is now backed
  by actual cross-repo evidence. Prior to this entry, the rows carried
  `draft` without a Verification log entry (an audit gap pointed out in
  the 2026-05-25 external review); this entry closes that gap.
- `spec.md` §6 RF-4a row does NOT need updating: status unchanged.

### 2026-05-25 — RF-1 verification against Data-Pulse-2 (OQ-1)

- RF-1 "Sign-in / session endpoint": `unknown` → `draft`.
- RF-1 "Session-context endpoint": `unknown` → `draft`.
- RF-1 "Session lifecycle (sign-out / refresh / expiry)": `unknown` → `draft`.
- Verified against:
  - Data-Pulse-2 `packages/contracts/openapi/auth.openapi.yaml` on `main`
    @ `b5142fe` — v1.0.0-draft, defines `signIn POST /api/v1/auth/signin`,
    `signOut POST /api/v1/auth/signout`, `refreshSession POST
    /api/v1/auth/refresh`, plus password-reset and email-verification
    sub-surfaces. Uses cookie-based dashboard sessions
    (`dp2_session` HttpOnly + Secure + SameSite=Lax).
  - Data-Pulse-2 `packages/contracts/openapi/context.openapi.yaml` on
    `main` @ `b5142fe` — v1.0.0-draft, defines `getActiveContext GET
    /api/v1/context/me`, `switchActiveTenant POST /api/v1/context/tenant`,
    `switchActiveStore POST /api/v1/context/store`, `clearActiveStore
    DELETE /api/v1/context/store`. ContextResponse includes user,
    active_tenant, active_store, active_role_code, memberships.
  - Data-Pulse-2 `specs/001-foundation-auth-tenant-store/sc-verification.md`
    on `main` — declares "All nine Success Criteria SC-1 … SC-9 are now
    Verified — Foundation milestone complete" at Data-Pulse-2 SHA
    `602ae5c`. SC-5 (context resolution p95 ≤ 200 ms) Verified at p95 =
    7.0 ms. SC-4 (server-only authorization) Verified.
  - Data-Pulse-2 `specs/001-foundation-auth-tenant-store/frontend-bypass-probe.md`
    on `main` — confirms FR-002 ("backend-enforced tenant/store safety")
    is operationally backed via T205 + manual probe.
- Confirmer: Ahmed Shaaban.
- Classification reasoning: All 10 OpenAPI files in Data-Pulse-2
  `packages/contracts/openapi/` carry the version label `1.0.0-draft`.
  This is a repo-wide convention, not a contract-instability marker.
  Per the literal Step 4 rule in this file ("file version is `*-draft`
  → `draft`"), all three rows classified `draft` rather than `stable`.
  Corroborating evidence (SC-verification "Foundation milestone
  complete") is strong but does not override the literal version-label
  rule. A future status promotion to `stable` would require the
  upstream `info.version` to drop the `-draft` suffix.
- OQ-1 from `spec.md` §10 is now answered for all three RF-1 rows.
- `spec.md` §6 RF-1 row MUST be updated in this same commit (sync rule):
  status `unknown` → `draft`, with reference to this verification log
  entry.

### 2026-05-25 — RF-4b verification against Data-Pulse-2 (OQ-2)

- RF-4b "Link unknown-item to existing catalog row": `blocked` → `blocked`
  (no status change; verification confirms the existing classification).
- RF-4b "Create new catalog row from unknown-item": `blocked` → `blocked`
  (no status change; verification confirms the existing classification).
- Verified against:
  - Data-Pulse-2 `packages/contracts/openapi/catalog/unknown-items.yaml`
    on `main` — v1.0.0-draft. Defines Wave 1 operations only:
    `posCaptureItem`, `tenantAdminListUnknownItems`,
    `tenantAdminDismissUnknownItem`. The same YAML states Wave 2
    reconciliation operations (link / create-new) are deferred to a
    separate gated extension.
  - Data-Pulse-2 `specs/005-pos-catalog-sync-reconciliation/wave-status.md`
    on `main` — Wave 2 contract for `tenantAdminLinkUnknownItem` and
    `tenantAdminCreateProductFromUnknownItem` requires gated approval.
- Confirmer: Ahmed Shaaban.
- OQ-2 from `spec.md` §10 is now answered for both RF-4b rows.
  FR-012 guard remains active until Data-Pulse-2 promotes the Wave 2
  contract out of "requires gated approval."
- Note: `spec.md` §6 RF-4b classification (currently `blocked`) does not
  need to change — the verification confirmed the existing status.

<!-- Append new entries below this line. Format:
### YYYY-MM-DD — <short title>
- RF-x.y "<row label>": <old status> → <new status>
- Verified against: <reference>
- Confirmer: <name>
- Notes: <optional, 1–3 lines>
-->

---

## Cross-reference index

- `.specify/memory/constitution.md` — Source-of-truth order; Implementation
  readiness gates; Principles 2, 3, 7, 8.
- [`spec.md`](./spec.md) — §6 Backend dependency map (must stay in sync with
  this file), §10 Open Questions (OQ-1..OQ-7), FR-005, FR-006, FR-011,
  FR-012.
- [`checklists/requirements.md`](./checklists/requirements.md) — Validation
  checklist for `spec.md`.
- `docs/agent-os/maestro-playbook.md` — §Cross-repo checks (when backend
  APIs / POS integration are relevant).
- `docs/product/repo-boundaries.md` — Ownership matrix that this file
  presupposes.

---

**End of API Readiness — 001 Console Foundation.**

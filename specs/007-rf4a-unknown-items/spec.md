# Feature Specification: RF-4a Unknown-Items Review Queue (read surface)

| Field | Value |
| --- | --- |
| Feature ID | 007 |
| Short name | rf4a-unknown-items |
| Branch | `feat/console-rf4a-unknown-items` |
| Status | Draft |
| Owner | Ahmed Shaaban |
| Mode | Implementation |
| Created | 2026-06-10 |
| Spec Kit phase | `/speckit specify` (this document) |
| Foundation slice | [`specs/001-console-foundation`](../001-console-foundation/) (merged) |
| Scaffold slice | [`specs/002-tooling-and-scaffold`](../002-tooling-and-scaffold/) (merged) |
| Auth-shell slice | [`specs/003-rf1-auth-shell`](../003-rf1-auth-shell/) (merged) |
| Data-layer precedent | [`specs/004-rf2-tenant-store-mgmt`](../004-rf2-tenant-store-mgmt/) (merged) |

> **Mode contract**: Implementation. This spec authorizes the RF-4a unknown-items
> review-queue **read surface** (list / inspect / dismiss) consuming the
> runtime-merged Data-Pulse-2 `catalog/unknown-items.yaml` operations through the
> slice-002 generated client. It authorizes UI code for that surface only. It
> does NOT authorize RF-4b reconciliation writes (link / create-product), the
> runtime-absent `reopen` / `bulk-dismiss` operations, any OpenAPI edit, any
> new runtime dependency, or any cross-surface change.

---

## 1. Background and why

Retail-Tower-Console is the admin web frontend in the three-repo Retail Tower
split (Data-Pulse-2 backend / POS-Pulse terminal / Retail-Tower-Console admin).
The foundation slice named seven route families RF-1..RF-7 and established RF-1
as a hard prerequisite for every other family.

RF-1 (`003-rf1-auth-shell`) and RF-2 (`004-rf2-tenant-store-mgmt`) are merged:
the auth shell, the read-only active-context provider, the shared
client/query/error surface (Banner / InlineError / ListState / DataTable /
Drawer / ConfirmDelete), and the RF-2 typed data-layer pattern
(`src/lib/rf2-queries.ts`) all exist.

RF-4 — Unknown-items review — lets an authenticated admin work the queue of POS
catalog item references that did not resolve against the tenant's alias set.
RF-4 splits into:

- **RF-4a (this slice)** — the review-queue **read surface**: list the pending
  queue scoped by tenant/store (with the 007 filter / sort / group params),
  inspect a single item, and dismiss an item as invalid.
- **RF-4b** — reconciliation **writes** (link to an existing product / create a
  new product). Out of scope here (SD-1 deferred; a separate later slice).

## 2. Why RF-4a is the unblockable first cut

Of RF-3 / RF-4 / RF-7, the `console-rf-readiness` workflow (2026-06-10, 4
agents) verified RF-4 as the only unblockable surface: RF-3 (catalog
management) and RF-7 (settings) remain blocked — no Data-Pulse-2 contract
satisfies them. RF-4a consumes the contract-confirmed, **runtime-merged** ops
on `catalog/unknown-items.yaml`.

## 3. Runtime-vs-contract gate (load-bearing)

`catalog/unknown-items.yaml` (v1.2.0-draft) carries eight operations. Only a
subset is RUNTIME-MERGED on Data-Pulse-2 `main` @ the codegen pin `62d0906`.
Verified by `git grep` of the controllers at that SHA:

- **RUNTIME-PRESENT (this slice consumes these three):**
  - `tenantAdminListUnknownItems` — `GET /api/v1/catalog/unknown-items`
    (`unknown-items.controller.ts:339`)
  - `tenantAdminInspectUnknownItem` — `GET /api/v1/catalog/unknown-items/{id}`
    (`unknown-items.controller.ts:403`)
  - `tenantAdminDismissUnknownItem` — `POST /api/v1/catalog/unknown-items/{id}/dismiss`
    (`unknown-items.controller.ts:467`)
- **CONTRACT-ON-MAIN but RUNTIME-ABSENT (NOT consumed — they 404):**
  - `tenantAdminReopenUnknownItem`, `tenantAdminBulkDismissUnknownItems`
    (no controller route at the pin).
- **RF-4b writes (NOT consumed — SD-1 deferred):**
  - `tenantAdminLinkUnknownItem`, `tenantAdminCreateProductFromUnknownItem`
    (`reconciliation.controller.ts` routes exist, but RF-4b is out of scope).
- **POS capture (`posCaptureItem`):** terminal-side, clerkJwt; not a Console op.

The generated client emits TypeScript types for ALL eight ops (unavoidable —
the document is generated whole). The boundary discipline is that the RF-4a
query layer and UI **call** only the three consumed ops. This is asserted by
the VG-3/VG-4 boundary test.

## 4. User stories

- **US-1 (review queue)** — As a tenant admin / store-scoped operator, I see the
  pending unknown-items queue scoped to my active tenant (and the stores I can
  access), as a table ordered newest-first, so I can work the backlog.
- **US-2 (filter / sort / group)** — I can filter by `source_system`, choose a
  `sort` (`age_asc` / `age_desc` / `store`), and optionally `group_by`
  (`store` / `source_system`), so the queue is workable at volume.
- **US-3 (inspect)** — I can open one item to see its full `ReviewQueueItem`
  detail (identifier, store, lifecycle, timestamps) — never `sale_context`.
- **US-4 (dismiss)** — I can dismiss a pending item as invalid behind a confirm
  step; the row refreshes from the backend response.

## 5. Functional requirements

- **FR-4a-001** — The list surface consumes `tenantAdminListUnknownItems` only,
  via the generated client; it renders the backend-scoped page exactly (no
  client-side authorization filter). Zero rows is a successful empty state.
- **FR-4a-002** — The list passes through the 007 query params (`status`,
  `store_id`, `cursor`, `limit`, `source_system`, `sort`, `group_by`) as typed
  by the generated operation; defaults match the contract (`status=pending`,
  `sort=age_desc`).
- **FR-4a-003** — Pagination uses the opaque `next_cursor` (treated as opaque).
- **FR-4a-004** — The inspect surface consumes `tenantAdminInspectUnknownItem`
  and renders the `ReviewQueueItem` projection only. It MUST NOT reference
  `sale_context` (that field exists on `UnknownItem`, not the projection).
- **FR-4a-005** — The dismiss action consumes `tenantAdminDismissUnknownItem`
  behind a confirm step (mirror RF-2 `ConfirmDelete`); on success the queue
  invalidates and the item's terminal row is reflected from the response.
- **FR-4a-006** — Scope is read from RF-1's `ActiveContextProvider` (active
  tenant; optional active store). RF-4a holds no authoritative scope and calls
  no context operation (OQ-5 parity with RF-2).
- **FR-4a-007 (error mapping)** — Map EXACTLY the documented statuses per op and
  assert no undocumented status (AS-5 discipline):
  - List: 400 / 401 / 403.
  - Inspect: 400 / 401 / 403 / 404.
  - Dismiss: 400 / 401 / 403 / 404 / 409.
  - 403 with `error.code = "forbidden"` is the 007 8th category (in-scope but
    insufficient authority); rendered as a persistent banner, distinct from the
    non-disclosing 404. No 422 / 429 anywhere (the contract documents none).
  - Dismiss 409 = `already_reconciled` (the item is already terminal) — NOT a
    field conflict; rendered inline on the item, not as a slug/code conflict.

## 6. Out of scope (hard)

- RF-4b reconciliation writes (`link`, `create-product`) — SD-1 deferred.
- `reopen` / `bulk-dismiss` — runtime-absent at the pin; no UI is built against
  them.
- Editing any OpenAPI spec (the contract is CONSUMED, never edited).
- Any new runtime dependency, CI file, secret, or other RF surface's `src`.

## 7. Non-functional / boundary

- **VG-3** — every Data-Pulse-2 call goes through the generated client; no
  hand-written `fetch` / `axios` / `XMLHttpRequest`; no `Authorization` /
  `Bearer` header (cookie transport).
- **VG-4** — the RF-4a layer calls none of the RF-4b / reopen / bulk-dismiss ops
  and no membership / context mutator.
- **VG-5** — no frontend authorization: the surface does not branch a
  list / action / route on a role or `is_platform_admin` (Principle 7).
- **Auth** — `cookieAuth`; a tenant-admin / store-operator human session
  (RF-1 shell). The test fixture can hold such a session (cookie transport).

## 8. Open questions

- **OQ-4a-1** — Grouping is an ordering concern per the contract (flat
  `items` array; `group_by` makes group members contiguous). RF-4a renders the
  flat ordered list and a group label column when `group_by` is set; a richer
  grouped envelope is out of v1 scope.
- **OQ-4a-2** — The list documents no 404 (RLS filters to an empty page rather
  than erroring). RF-4a does not synthesize a 404 for the list.

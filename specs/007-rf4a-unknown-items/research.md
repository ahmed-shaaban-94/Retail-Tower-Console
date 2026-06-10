# Phase 0 Research — RF-4a Unknown-Items Review Queue

Decisions (R4a-1..R4a-6) that fix the RF-4a approach before planning.

## R4a-1 — Reuse the RF-2 data-layer pattern verbatim

The RF-2 layer (`src/lib/rf2-queries.ts`) is the precedent: thin typed wrappers
over the generated `apiClient` returning `{ status, data?, error? }`, stable
query keys, and a pure `map*Error` function the surfaces branch on. RF-4a adds
`src/lib/unknown-items-queries.ts` in the same shape. No new dependency, no new
context op, no hand-written fetch. Scope (active tenant / store) is read from
RF-1's `ActiveContextProvider`, not fetched.

## R4a-2 — Consume exactly three ops

`tenantAdminListUnknownItems`, `tenantAdminInspectUnknownItem`,
`tenantAdminDismissUnknownItem`. Runtime presence confirmed at codegen pin
`62d0906` (controller routes in `apps/api/src/catalog/unknown-items/
unknown-items.controller.ts`). The other five document-level ops
(posCapture / link / create-product / reopen / bulk-dismiss) are NOT wrapped and
NOT called.

## R4a-3 — Error mapping is per-op and documented-only (AS-5)

Unlike RF-2, the 409 here is `already_reconciled` (item already terminal), not a
slug/code uniqueness conflict — so `mapRf2Error`'s 409 branch is NOT reused. A
dedicated `mapUnknownItemError` maps only the statuses each op documents and
treats anything else as a generic banner. The 007 `forbidden` (403) is its own
branch, distinct from the non-disclosing 404. No 422/429 is asserted.

## R4a-4 — ReviewQueueItem is the only projection on the read surface

List, inspect, and the dismiss response all return `ReviewQueueItem`
(= `UnknownItem` minus `sale_context`). The inspect drawer renders only
`ReviewQueueItem` fields; it must not reference `sale_context`.

## R4a-5 — Reuse the shared presenters

DataTable (list), Drawer (inspect), ConfirmDelete (dismiss), Banner / ListState
(states). No new shared primitive is introduced; RF-4a is a composition of
existing ones plus its own surface files under `src/unknown-items/`.

## R4a-6 — Scope binding mirrors RF-2's `useStoreScope`

Active tenant id (+ optional active store id) is read from
`ActiveContextProvider` and folded into the query key so a tenant/store switch
re-scopes the cache structurally (no imperative invalidation).

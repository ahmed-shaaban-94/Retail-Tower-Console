# Contract Consumption Boundary — RF-4a

Source of record: Data-Pulse-2 `packages/contracts/openapi/catalog/unknown-items.yaml`
(v1.2.0-draft) at codegen pin `62d0906`. CONSUMED, never edited.

Generated into `src/generated/schema.d.ts` under the `UnknownItemsSchema`
namespace and composed into `paths` / `operations` / `components`
(see `openapi-ts.config.ts` — `UnknownItems` source).

## The three consumed operations (runtime-merged, confirmed)

| operationId | method + path | wrapper | controller route @ 62d0906 |
| --- | --- | --- | --- |
| `tenantAdminListUnknownItems` | `GET /api/v1/catalog/unknown-items` | `listUnknownItems(params)` | `unknown-items.controller.ts:339` |
| `tenantAdminInspectUnknownItem` | `GET /api/v1/catalog/unknown-items/{id}` | `inspectUnknownItem(id)` | `unknown-items.controller.ts:403` |
| `tenantAdminDismissUnknownItem` | `POST /api/v1/catalog/unknown-items/{id}/dismiss` | `dismissUnknownItem(id)` | `unknown-items.controller.ts:467` |

Auth: document-level `cookieAuth` (`dp2_session` cookie; same transport as RF-2).

## NOT consumed (boundary)

- `posCaptureItem` — terminal-side clerkJwt op.
- `tenantAdminLinkUnknownItem`, `tenantAdminCreateProductFromUnknownItem` —
  RF-4b reconciliation writes (SD-1 deferred).
- `tenantAdminReopenUnknownItem`, `tenantAdminBulkDismissUnknownItems` —
  contract-on-main but runtime-absent at the pin (would 404).

The VG-3/VG-4 boundary test asserts the RF-4a `src/` never references the five
non-consumed operationIds and never hand-writes a DP-2 fetch.

## Documented statuses (the only ones mapped)

- List: 200, 400, 401, 403.
- Inspect: 200, 400, 401, 403, 404.
- Dismiss: 200, 400, 401, 403, 404, 409 (`already_reconciled`).

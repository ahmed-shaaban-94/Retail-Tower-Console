# API Readiness — RF-4a (carried forward + runtime re-verified)

Verified against Data-Pulse-2 at the codegen pin `62d0906` on 2026-06-10 by the
RF-4a implementation agent (re-verification of the RF-4 implementation gate,
foundation FR-005).

## Runtime gate (load-bearing) — RE-VERIFIED

`git grep` of the controllers at `62d0906`:

| Op | Contract | Runtime route @ 62d0906 | Consumed |
| --- | --- | --- | --- |
| `tenantAdminListUnknownItems` | present | `unknown-items.controller.ts:339` (`@Get api/v1/catalog/unknown-items`) | YES |
| `tenantAdminInspectUnknownItem` | present | `unknown-items.controller.ts:403` (`@Get api/v1/catalog/unknown-items/:id`) | YES |
| `tenantAdminDismissUnknownItem` | present | `unknown-items.controller.ts:467` (`@Post .../:id/dismiss`) | YES |
| `tenantAdminLinkUnknownItem` | present | `reconciliation.controller.ts:144` | NO (RF-4b, SD-1 deferred) |
| `tenantAdminCreateProductFromUnknownItem` | present | `reconciliation.controller.ts:241` | NO (RF-4b, SD-1 deferred) |
| `tenantAdminReopenUnknownItem` | present | **ABSENT** (no controller route; only a comment) | NO (runtime-absent) |
| `tenantAdminBulkDismissUnknownItems` | present | **ABSENT** (no controller route) | NO (runtime-absent) |
| `posCaptureItem` | present | `unknown-items.controller.ts:222` (clerkJwt, POS) | NO (terminal-side) |

The three consumed ops are runtime-present → RF-4a read surface is unblockable.
reopen / bulk-dismiss confirmed runtime-absent → correctly excluded.

## Classification

`draft` (not `stable`): the catalog/unknown-items surface still has no upstream
`sc-verification.md`, so the foundation §Status version-suffix convention caps it
at `draft` regardless of runtime state. RF-4a builds against `draft` because the
runtime gate (controller routes present) is the operative implementation
precondition (FR-005), and the gate passes.

## RF-1 prerequisite

RF-1 shipped (`ActiveContextProvider`, generated client, Banner / InlineError,
TanStack Query) — present in `src/`. The cookie-auth tenant-admin/store-operator
session is the same `cookieAuth` transport RF-2 uses; the test fixture holds it.

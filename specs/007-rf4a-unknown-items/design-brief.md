# Design Brief — RF-4a Review Queue

Composes existing shared primitives; introduces no new shared component.

## Surfaces

### SF-4a-1 — Review queue (list)
- A `DataTable` (tables-over-cards) of the backend-scoped page. Columns:
  identifier (value, mono) + identifier type, store (or group label when
  `group_by=store`), source system, encountered-at, status.
- A filter/sort/group control row: `source_system` text filter, `sort` select,
  `group_by` select. State is local; changes re-key the query.
- States via `ListState`: loading / empty (zero rows = success). Errors route
  through the persistent `Banner` (403 forbidden, retryable 5xx) — never toasts.
- Row activation opens the inspect drawer (SF-4a-2). No role-hiding of actions.

### SF-4a-2 — Inspect drawer
- `Drawer` (right-side panel, focus-trapped, Escape closes) rendering the
  `ReviewQueueItem` fields read-only. No `sale_context`.
- A "Dismiss" affordance for a `pending` item opens the confirm step inline.

### SF-4a-3 — Dismiss confirm
- `ConfirmDelete`-style inline confirm naming the item's identifier. On confirm,
  calls `dismissUnknownItem`; pending state disables the button. On success the
  list query invalidates and the drawer reflects the terminal row; a 409
  `already_reconciled` renders inline (already terminal — refresh).

## State matrix (what each state renders)

| State | List | Drawer |
| --- | --- | --- |
| loading | `ListState loading` | spinner row |
| empty (200, 0 rows) | `ListState empty` | n/a |
| ready (200, rows) | `DataTable` | `ReviewQueueItem` detail |
| 403 forbidden | `Banner danger` (no retry) | `Banner` |
| 404 (inspect/dismiss) | n/a | uniform not-found copy |
| 409 already_reconciled (dismiss) | n/a | inline "already resolved" + refresh |
| 5xx | `Banner danger` + Retry | `Banner` + Retry |

## A11y
- DataTable rows keyboard-activatable (Enter/Space), 36px+ touch floor.
- Drawer is an ARIA dialog, focus moved in + trapped, Escape closes.
- Banner is `role="alert"`, persistent, surfaces `request_id`.

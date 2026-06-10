# Phase 1 Data Model — RF-4a (render-side projection)

This repo owns no persistent model. RF-4a renders the Data-Pulse-2
`ReviewQueueItem` projection read-only. The shapes below are the generated-client
types the surface consumes; they are NOT redefined by hand (the wrappers reuse
`components["schemas"][...]` from `src/generated/schema.d.ts`).

## ReviewQueueItem (the review-surface projection)

`UnknownItem` MINUS `sale_context` (FR-007). Fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid | primary key |
| `tenant_id` | uuid | active tenant |
| `store_id` | uuid | capture store (non-null per 005 FR-010) |
| `identifier_type` | enum | barcode / sku / plu / supplier_code / external_pos_id |
| `identifier_value` | string | the unresolved reference |
| `source_system` | string \| null | non-null when type = external_pos_id |
| `resolution_status` | enum | pending / resolved / dismissed |
| `resolution_action` | enum \| null | linked / created / dismissed (null when pending) |
| `resolved_at` | date-time \| null | |
| `resolved_by` | uuid \| null | acting principal when not pending |
| `resolved_product_id` | uuid \| null | conditional (authority-gated); OMITTED, not in `required` |
| `encountered_at` | date-time | age basis for sort/filter |

**No `sale_context`.** The drawer must not read it.

## ListUnknownItemsResponse

```
{ items: ReviewQueueItem[]; next_cursor: string | null }
```

`next_cursor` is opaque (treat as token, never parse).

## List query params (007 extensions)

`status` (default `pending`), `store_id`, `cursor`, `limit` (1..200, default 50),
`source_system`, `sort` (`age_asc` | `age_desc` | `store`, default `age_desc`),
`group_by` (`store` | `source_system`).

## Error envelope

`{ error: { code, message, request_id? } }`. The closed review-queue code
vocabulary: `validation`, `target_unavailable`, `alias_conflict`,
`idempotency_key_conflict`, `already_reconciled`, `not_found`, `forbidden`,
`system_failure`. RF-4a only encounters: `validation` (400), `forbidden` (403),
`not_found`/non-disclosing 404, `already_reconciled` (dismiss 409).

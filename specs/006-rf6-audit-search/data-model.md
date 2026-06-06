# Phase 1 Data Model: RF-6 Audit / Search

**Feature**: 006-rf6-audit-search
**Phase**: 1 — Design & Contracts
**Date**: 2026-06-06
**Input**: [`spec.md`](./spec.md), [`api-readiness.md`](./api-readiness.md), [`contracts/rf6-audit-search.md`](./contracts/rf6-audit-search.md)
**RF-1 reference**: [`003-rf1-auth-shell/data-model.md`](../003-rf1-auth-shell/data-model.md) (E-1/E-2/E-3, ST-1, VD-1..VD-5)

---

## Ownership disclaimer (read this first)

This repository owns **zero domain entities**. Every entity RF-6 touches is
**owned by Data-Pulse-2** and rendered by the console. RF-6 defines no entity,
persists none, validates none. Constitution Principles 1, 2, 7 codify this.

This file documents only the **render-side projection** RF-6 needs for the audit
search/inspect surface, by reference — it does **not** re-inline or duplicate
Data-Pulse-2 OpenAPI schemas (Principle 2 forbids that copy). Exact field types
are read from the generated client (`src/generated/schema.d.ts`, slice 002 pin
`62d0906`) at implementation time.

---

## Entities RF-6 projects

### E-6 — Audit event (read-only row)

- **Origin:** Data-Pulse-2 `audit.openapi.yaml` `AuditEvent` (the `items[]` of the
  `listAuditEvents` 200 response). The POS-catalogue `action` values originate in
  `pos-audit-events.openapi.yaml` but reach the console **only** through the same
  `audit_events` table read by `listAuditEvents` (read-through).
- **Render-side fields used** (names per the generated client; not re-typed here):
  `id`, `occurred_at`, `actor_user_id` (nullable), `actor_label` (nullable),
  `tenant_id`, `store_id` (nullable), `action`, `target_type` (nullable),
  `target_id` (nullable), `request_id` (nullable), `metadata` (free object).
- **RF-6 render-side use:** SF-6-1 renders a table row per `AuditEvent`; SF-6-2
  renders the full field set + `metadata` of a **single already-fetched** row (no
  second backend call — spec OQ-2). The `action` is rendered generically for all
  rows (POS and non-POS) at this slice (research R6-6).
- **No mutation.** RF-6 never writes, patches, or deletes an `AuditEvent`
  (FR-006-009).

### E-3 — Active context (reused from RF-1, scope only)

- **Origin / reference:** RF-1 `data-model.md` E-3 (`context.openapi.yaml`
  `ContextResponse`), read via the merged `ActiveContextProvider`.
- **RF-6 render-side use:** RF-6 reads `active_tenant` / `active_store` **only** to
  (a) label the search scope and (b) key the audit query so a scope switch
  re-runs the query and drops prior results (spec FR-006-005, S6). RF-6 does not
  mutate context; it is downstream of RF-1's resolved AUTHENTICATED-context state.

> Entities E-1 User, E-2 Membership, and the RF-2..RF-5/RF-7 entities are **out of
> RF-6 scope** except where `AuditEvent.actor_*` references a user id/label, which
> RF-6 renders verbatim (no user lookup).

---

## Query parameters RF-6 sends (render-side filter projection)

The SF-6-1 filter bar projects to the `listAuditEvents` query params (read from
the generated client; not re-typed here):

| Filter (UI) | Query param | Notes |
| --- | --- | --- |
| Action | `action` | Prefix match (e.g. `auth.` / `shift.`). |
| Actor | `actor_user_id` | UUID. |
| Store | `store_id` | UUID; shown only when the active scope permits a store filter. |
| From / To | `from` / `to` | ISO `date-time`; native date-time inputs serialized. |
| (paging) | `cursor` | Opaque; supplied from the prior page's `next_cursor`. |
| (page size) | `limit` | Default 50, max 200; RF-6 uses the default unless tuned. |

RF-6 sends only these documented params; it invents none.

---

## State the console holds (render-side only)

RF-6 holds no authoritative domain state. The only render-side state is the
**read-only projection of the audit query result** (E-6 list) plus transient UI
state (filter inputs, the inspected-row reference, in-flight flags). All of it is
derived from, and re-synced to, backend responses, and is **scoped** to the
active context.

| Render-side state | Owned by | Refresh trigger |
| --- | --- | --- |
| Audit result pages (E-6, cursor-appended) | SF-6-1 (TanStack Query, key = scope + filters) | Apply filters; "load more" (`next_cursor`); scope switch (drops + re-queries) |
| Inspected-row reference | SF-6-2 | Row click; cleared on drawer close. No fetch. |
| Filter inputs | SF-6-1 | Transient; never persisted as a secret (FR-006-010) |
| Active scope (E-3) | RF-1 `ActiveContextProvider` (read) | RF-1 SF-3 mutations; RF-6 only reads |

---

## State transitions consumed

RF-6 introduces no session-lifecycle transition; it is **downstream** of RF-1's
AUTHENTICATED (context resolved) state (RF-1 ST-1). RF-6's own surface-level state
machine is the **response-driven state matrix** (design-brief §4), reproduced here
as the render contract:

```
mounted ──> pre-query ──(Apply)──> loading ──> 200+rows ──(load more)──> 200+rows (appended)
                │                      │            │
                │                      │            └─(200 empty)──> empty-after-filter
                │                      ├─(401)──> [OQ-1: not special-cased; shared interceptor → expiry redirect]
                │                      ├─(403)──> not-permitted (Banner + request_id)
                │                      └─(other)─> generic error (Banner + request_id + retry)
                │
                └─(scope switch via RF-1 SF-3)──> drop results + filters, return to pre-query/loading in new scope
```

Row inspect (SF-6-2) is orthogonal: `row click → drawer open (from cached row) → close`.
No loading sub-state (data already in hand).

---

## Validation / display rules (render-side only)

Validation is **backend-enforced** (spec FR-006-004, Principle 7). RF-6
implements **no business validation** and **no authorization check**. Display
rules RF-6 honors:

- **VD-6-1** — Empty `items` after a query → **empty-after-filter** state, visibly
  distinct from the **pre-query** state (spec S5, FR-006-008).
- **VD-6-2** — `next_cursor === null` → no "load more" affordance; non-null →
  show it (spec OQ-4).
- **VD-6-3** — 403 → render a "not permitted" state with the backend `request_id`;
  draw no prior conclusion about the actor (spec FR-006-004, S4).
- **VD-6-4** — All error states surface the backend `request_id` when present
  (inherits RF-1 VD-4; reuse `Banner`).
- **VD-6-5** — POS-catalogue `action` values render identically to non-POS rows at
  this slice; severity emphasis (e.g. `shift.forced_close`) is a **badge** in a
  contained status color, **never gold**, never a side-stripe (design-brief §2).
- **VD-6-6** — `actor_user_id`/`actor_label`/`store_id` nullable fields render a
  muted placeholder when absent; the console performs no lookup to fill them.

---

## Cross-reference to readiness rows

| Entity / surface | api-readiness row | Status (carried from foundation) |
| --- | --- | --- |
| E-6 Audit event (audit query + non-POS operational events) | RF-6 audit core | `stable` |
| E-6 Audit event (POS-catalogue `action` sub-rows) | RF-6 POS sub-rows | `draft` (OQ-5 re-verify before a POS-dependent gate) |
| E-3 Active context (scope) | RF-1 session-context (reused) | `stable` |

**Implication.** The `stable` audit core may be planned now; the `draft` POS
sub-rows constrain only POS-label-dependent features (FR-006-007). The actor
matrix (OQ-3) is a backend-truth read required before the API-dependency gate.

---

**End of Phase 1 Data Model: RF-6 Audit / Search.**

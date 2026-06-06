# RF-6 Consumption Boundary (slice 006) — Audit / Search

**Family**: RF-6 — Audit / search (foundation `spec.md` §5)
**Slice**: `006-rf6-audit-search`
**api-readiness state**: Dual — `stable` (audit query / operational-event search) / `draft` (POS-originated event sub-rows). See [`../api-readiness.md`](../api-readiness.md).
**Data-Pulse-2 pin**: `62d0906` (slice 002 C-4 — the SHA the generated client at `src/generated/` is produced against)
**Foundation reference**: foundation [`spec.md`](../../001-console-foundation/spec.md) §6 RF-6 + [`api-readiness.md`](../../001-console-foundation/api-readiness.md) §RF-6

---

## Relationship to the foundation posture

This is the **slice-level** consumption boundary for RF-6. The foundation §6 RF-6
row records the required backend surface (audit query + operational-event search,
plus the POS-originated event surface) and its dual readiness. This file maps the
**one** operation RF-6 actually consumes to the surface that consumes it, and
draws the POS boundary explicitly. Adding any operation beyond the one below is a
scope expansion forbidden by spec FR-006-001 / foundation FR-009.

This file does **NOT** replicate the OpenAPI contract. For request/response
shapes, the implementation reads the generated TypeScript client provided by
slice `002-tooling-and-scaffold` (`src/generated/schema.d.ts`). No byte of
`audit.openapi.yaml` or `pos-audit-events.openapi.yaml` is copied here (spec
AC-7, Constitution Principle 2).

---

## Operation consumed (the one, mapped to surfaces)

> Convention: `<operationId> | <HTTP method> <path> | <upstream file>`. Upstream
> files are in `Data-Pulse-2/packages/contracts/openapi/`.

### Audit query — `audit.openapi.yaml`

| operationId | HTTP | Surface | RF-6 use |
| --- | --- | --- | --- |
| `listAuditEvents` | `GET /api/v1/audit/events` | SF-6-1 (SF-6-2 reads from same payload) | Tenant/store-scoped audit query. Returns `{ items: AuditEvent[], next_cursor }`. Filters: `action` (prefix match), `actor_user_id`, `store_id`, `from`, `to`, `cursor`, `limit` (default 50, max 200). SF-6-2 inspect reads `metadata`/`target_*`/`actor_*`/`request_id` from an already-fetched `items[]` row — no second call. |

### Explicitly NOT consumed by RF-6

Named so a reviewer sees they were considered and intentionally excluded
(spec FR-006-001 / AC-2), not overlooked:

- **`posAuditEventsSync`** (`POST /api/pos/v1/audit-events`,
  `pos-audit-events.openapi.yaml`) — the **POS terminal → backend ingestion**
  (write) endpoint. Authenticates a **device** (`device_token_attestation` in
  body; optional Clerk `Authorization: Bearer`), processes a batch of
  locally-emitted POS events with per-event idempotency, returns
  `{ accepted, duplicates, rejected }`. **The console NEVER calls it** (spec
  FR-006-006/013). It is read here only to learn the POS `action_category`
  catalogue (below). Consuming it would breach the POS boundary and the
  cookie-only transport posture.
- **No single-event read operation** — none exists at pin `62d0906`. SF-6-2
  inspect is satisfied from the SF-6-1 list payload (spec OQ-2). RF-6 MUST NOT
  invent a `getAuditEvent`/`readAuditEvent` wrapper.
- **The four out-of-scope auth ops, the context ops, etc.** — irrelevant to RF-6;
  RF-6 touches the audit query only.

---

## POS-originated event catalogue (read-through reference only)

The POS event catalogue surfaced *through* `listAuditEvents` (same `audit_events`
table). RF-6 reads these as the `action` values that may appear on a row; it
never calls the POS endpoint. Source: `pos-audit-events.openapi.yaml`
`AuditEventItem.action_category` enum (`v1.0.0-draft`):

- `shift.open`
- `shift.close`
- `shift.forced_close`  *(MUST render distinctly from `shift.close` — the backend
  persists them separately; the console labels them separately)*
- `operator.session.takeover`
- `cashier.pin.reset`
- `cashier.pin.unlock`

**Draft ceiling.** These sub-rows are `draft` (no upstream `sc-verification.md`,
append-only catalogue). Any RF-6 feature that *depends* on these specific values
(POS-specific labels, a POS-only filter preset) inherits the `draft` gate and
must be re-verified before its implementation gate (spec FR-006-007, OQ-5). The
`stable` audit core (rendering arbitrary `action` strings, including these, as
generic rows) does not.

---

## Transport & security posture

Inherited from the RF-1 contract (not re-derived):

- **Session transport.** `dp2_session` HttpOnly + Secure + SameSite=Lax cookie;
  the browser attaches it on every same-site request. The RF-1 client
  (`src/lib/client.ts`) is already configured with `credentials: "include"`.
  JavaScript never reads the cookie (spec FR-006-003).
- **No bearer / no device token.** The console MUST NOT attach an
  `Authorization: Bearer` header and MUST NOT present a `device_token_attestation`.
  Those schemes belong to the POS ingestion path, which the console never calls
  (spec FR-006-003/006/013).
- **CSRF.** `listAuditEvents` is a **GET** — no state-changing request, no CSRF
  concern. (The RF-1 CSRF question, resolved "no token required" at this pin,
  concerned the POSTs/DELETE; GET inherits cookie transport with no header
  plumbing.)

---

## Error contract behavior (RF-6 specifics)

Derived from reading `audit.openapi.yaml` end-to-end. The contract documents
**exactly** 200/401/403 for `listAuditEvents`:

- **200 OK** — `{ items: AuditEvent[], next_cursor: string|null }`. Empty `items`
  → empty-after-filter state (distinct from pre-query). `next_cursor` null → no
  "load more".
- **401 "No active tenant."** — a **precondition** failure (no active tenant
  resolved), **not** session-expiry. This collides with the RF-1 interceptor's
  expiry semantics → **spec OQ-1** (flagged, not fixed). RF-6's intended render
  is a "no active scope" state routing to the SF-3 scope gate, but whether the
  shared interceptor must change is the open question.
- **403 "Insufficient role."** — backend refuses for the actor's role/scope. RF-6
  renders a "not permitted" state with the `request_id`; it pre-judges nothing
  (spec FR-006-004). Reconciles with the §4 actor-scope discrepancy (OQ-3).
- **Any other non-2xx** — not enumerated by the contract. RF-6 renders a generic
  defensive fallback surfacing `request_id`; it does NOT invent a 404/409/429
  behavior for this operation (spec §6, FR-011 posture).

All error states surface the backend `request_id` when present (RF-1 VD-4
pattern; reuse `Banner`/`InlineError`).

---

## What this contract does NOT authorize

- ❌ Implementation of the RF-6 UI. Requires the FR-008 five-gate approval for
  slice 006.
- ❌ Choice of a router, list-query state store, data-fetching library, table
  primitive, or filter-control library — deferred to this slice's
  `/speckit-clarify` ([`../research.md`](../research.md) R6-1..R6-5).
- ❌ Adding any operation beyond `listAuditEvents` (spec FR-006-001) — in
  particular `posAuditEventsSync` and any invented single-event read.
- ❌ Calling, authenticating against, or writing back to any POS device or the
  POS ingestion endpoint (spec FR-006-006/013).
- ❌ Any mutation/annotation/export/redaction/deletion of an audit event
  (read-only; spec FR-006-009).
- ❌ Vendoring or copying any byte of `audit.openapi.yaml` /
  `pos-audit-events.openapi.yaml`.
- ❌ Regenerating or re-pinning `src/generated/schema.d.ts`.
- ❌ Building a mock server (requires explicit approval; spec FR-006-013).

---

**End of RF-6 Consumption Boundary (slice 006).**

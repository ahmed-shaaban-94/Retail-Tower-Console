# Feature Specification: RF-6 Audit / Search

| Field | Value |
| --- | --- |
| Feature ID | 006 |
| Short name | rf6-audit-search |
| Branch | `006-rf6-audit-search` |
| Status | Draft |
| Owner | Ahmed Shaaban |
| Mode | Planning-only |
| Created | 2026-06-06 |
| Spec Kit phase | `/speckit-specify` (this document) |
| Foundation slice | [`specs/001-console-foundation`](../001-console-foundation/) (merged) |
| Scaffold slice | [`specs/002-tooling-and-scaffold`](../002-tooling-and-scaffold/) (merged) |
| Auth-shell slice | [`specs/003-rf1-auth-shell`](../003-rf1-auth-shell/) (merged) |

> **Mode contract**: Planning-only. This spec specifies the RF-6 audit / search
> surface (foundation `spec.md` §5, route family RF-6). It must not be used to
> justify any implementation, component file, route file, generated-client
> regeneration, mock server, CI change, or commit beyond this spec document and
> its companion planning artifacts. Implementation is gated by the constitution
> (`.specify/memory/constitution.md`) and the foundation spec's FR-008 five-gate
> rule. This spec authorizes **no UI code**.

---

## 1. Background and why

Retail-Tower-Console is the admin web frontend in the three-repo Retail Tower
split (Data-Pulse-2 backend / POS-Pulse terminal / Retail-Tower-Console admin).
The foundation slice ([`001-console-foundation`](../001-console-foundation/))
named seven route families RF-1 through RF-7 and established that **RF-1 is a
hard prerequisite for every other family** (foundation `spec.md` §5 sequencing
rule): no RF-2..RF-7 screen is reachable without an authenticated session and a
resolved active tenant/store context.

RF-1 ([`003-rf1-auth-shell`](../003-rf1-auth-shell/)) is merged: the auth shell
(SF-1 sign-in), the authenticated app shell (SF-2), and the read-only
active-context provider (SF-3) exist, along with a shared client/query/error
surface. RF-6 is a **downstream family**: it attaches to the RF-1 app shell, is
reachable only after the active-context scope is resolved, and renders backend
truth read-only.

RF-6 — Audit / search — lets an authenticated admin **search and inspect**
audit entries and operational events emitted by the backend, **including
POS-originated events**. It is a **read-mostly** family (foundation §4 A5
"looks up audit entries"; foundation `spec.md` §5 RF-6 definition): search and
inspect only, no mutation. This document is its `/speckit-specify` output: it
specifies *what* the audit/search surface must do, the **single** Data-Pulse-2
operation it consumes, the POS-event sub-row boundary, and the gates that must
clear before implementation begins. It does **not** design the UI, choose a
router/state/data primitive, or authorize any source file.

### Why now

- RF-6's backend dependency is recorded **dual-status** in foundation
  `api-readiness.md` §RF-6: `stable` for the audit query + operational-event
  search surface (`audit.openapi.yaml`, `listAuditEvents`; foundation
  `sc-verification.md` SC-7 Verified), and `draft` for the **POS-originated
  event sub-rows** (`pos-audit-events.openapi.yaml`, `v1.0.0-draft`, no
  upstream `sc-verification.md`). OQ-5 (foundation) was resolved via dual-repo
  verification. Planning of the `stable` surface is unblocked.
- The generated client (slice 002, `src/generated/schema.d.ts`, pin `62d0906`)
  was generated from the **auth + context** contracts only, so it does **not**
  yet expose `listAuditEvents`' types. Making them available is a gated
  implementation task: add `audit.openapi.yaml` to `openapi-ts.config.ts`
  `OPENAPI_SOURCES` and re-run `pnpm generate:client` **at the same pin
  `62d0906`** (regeneration at the pinned SHA, not a re-pin; see Non-goals +
  tasks). RF-6 is the slice that first consumes the audit operation.
- RF-6 is the **first content-bearing family to attach to the RF-1 app shell**.
  It surfaces a real shared-file pattern (route registration, nav un-gating, a
  new typed operation) that sibling RF-2..RF-7 slices will repeat — specifying
  it precisely here documents the pattern once.

---

## Clarifications

### Session 2026-06-06

Behavioral resolutions only. Per AC-5, RF-6's router/state/data-fetching/
table/error-surface **primitive** choices are NOT named here; they are resolved
in [`plan.md`](./plan.md) Technical Context and [`research.md`](./research.md)
R6-1..R6-5. This section records only resolutions that name no library.

- Q: OQ-1 — RF-6 stack primitives (route registration, list-query state, data fetching, table rendering, filter/search controls, error surface)? → A: Resolved in `plan.md` Technical Context and `research.md` R6-1..R6-5 (named there, not here, per AC-5). RF-6 reuses RF-1's resolved primitives; each is *selected, reusing the RF-1 Principle 9 approval where the same dependency applies*, with no new runtime dependency anticipated.
- Q: OQ-2 — "inspect" without a single-event read operation? → A: Inspect is a **client-side drill/expand of an already-fetched list row** (`AuditEvent` carries `metadata` / `target_type` / `target_id` / `request_id`). RF-6 consumes **no** `getAuditEvent`/`readAuditEvent` operation because the backend exposes none at pin `62d0906`. Recorded against Scenario S3.
- Q: OQ-4 — auto-load all results vs. cursor "load more"? → A: Cursor pagination — fetch the first page (`limit` default 50), expose a "load more" affordance driven by `next_cursor`; stop when `next_cursor` is null. No client-side auto-fetch-until-exhausted. Applies to Scenarios S1/S5.
- Q: Filter reset on scope switch? → A: When the RF-1 active-context scope changes (tenant or store switch via SF-3), RF-6's in-flight filters and result page are dropped and the query re-runs in the new scope (audit results are tenant/store-scoped by the backend). No cross-scope result bleed. Reconciled into Scenario S6.
- Q: OQ-1 sub-question (a) — is the audit 401 "no active tenant" actually reachable from RF-6? → A: **Tested against the merged RF-1 code** (`src/shell/ProtectedArea.tsx`): the protected area renders `<ScopeGate />` whenever `!context.active_tenant`, so no shell content (RF-6 included) is reachable until an active tenant is resolved. Therefore the audit 401 "no active tenant" is **not reachable on the normal path** — the RF-1 scope gate already guarantees the precondition the audit 401 reports. **Recommended interpretation (headless):** RF-6 does NOT special-case the audit 401 at this slice; it lets the shared RF-1 interceptor handle a 401 as expiry (the realistic cause once the scope gate has passed). OQ-1 stays **open** only for the defensive edge (a backend that drops the active tenant mid-session) and for whether a future per-call interceptor opt-out is warranted — neither is resolved here, and any fix touching `src/lib/auth-interceptor.ts` is an RF-1 amendment, not an RF-6 change. No contradiction with Scenario S7 (which is the expiry path).

---

## 2. Goals

- **G1.** Specify the **audit search surface**: the filterable, cursor-paginated
  list of audit events the backend returns for the active tenant/store scope.
- **G2.** Specify the **audit inspect surface**: the client-side drill into a
  single already-fetched audit row (metadata, target, actor, request id), with
  **no** dependence on a single-event backend read operation (none exists).
- **G3.** Enumerate the **exactly one** Data-Pulse-2 operation RF-6 consumes
  (`listAuditEvents`), and assert the POS-event ingestion endpoint
  (`posAuditEventsSync`) is **never** consumed by the console.
- **G4.** Specify the **POS-originated event sub-row** behavior: POS events
  (`shift.*`, `operator.session.takeover`, `cashier.pin.*`) are surfaced
  read-only **through** `listAuditEvents` (same `audit_events` table), not via
  any POS-facing call.
- **G5.** Specify the **error-rendering** behaviors for the status codes RF-6
  encounters (401 "no active tenant", 403 "insufficient role", plus the shared
  4xx/5xx surface), and flag the genuine 401-meaning collision with the RF-1
  interceptor as an open question.
- **G6.** Define the **functional requirements** and **acceptance criteria** any
  RF-6 plan / task list / implementation slice must satisfy.
- **G7.** Record the **open questions** that must resolve before an RF-6
  implementation gate (FR-008) clears.

---

## 3. Non-goals

This spec **does not**:

- Authorize implementation of the RF-6 UI. That requires the foundation FR-008
  five-gate approval for this slice specifically.
- Choose a router, state store, data-fetching library, table/list-virtualization
  library, styling system, component library, or filter-control library. Those
  are RF-6 *plan/clarify* decisions, recorded in this slice's `plan.md` /
  `/speckit-clarify`, not invented here.
- Create any `src/` file, route file, component, hook, test file, or mock.
- Regenerate, edit, or re-pin `src/generated/schema.d.ts` **as a spec/plan
  action**. (RF-6's operation `listAuditEvents` is not in the slice-002
  auth+context client; adding `audit.openapi.yaml` to `openapi-ts.config.ts` and
  re-running `pnpm generate:client` **at the same pin `62d0906`** is a gated
  *implementation* task — regeneration at the pinned SHA, not a re-pin, not a
  spec action. Per foundation `api-readiness.md`: slices re-run
  `pnpm generate:client` when their consumed contracts change.)
- Define, copy, paraphrase, or vendor any byte of Data-Pulse-2's
  `audit.openapi.yaml` or `pos-audit-events.openapi.yaml`. Request/response
  shapes are read from the generated client at implementation time.
- Define backend APIs, audit ingestion, retention, the audit-event schema, or
  authorization. Those belong to Data-Pulse-2.
- Define POS terminal behavior, the POS audit-event emission/sync path, or any
  write-path to a POS device or to the audit log. The console **never** calls
  the POS audit-event ingestion endpoint.
- Mutate, annotate, acknowledge, export, redact, or delete any audit event. RF-6
  is read-only (search + inspect).
- Add RF-2..RF-5 / RF-7 screens. RF-6 attaches to the RF-1 shell but other
  families are out of this slice's scope.
- Plan the POS-event sub-rows to a `stable`-grade implementation gate. They are
  `draft` (foundation §6 RF-6) and re-verification is required before any
  implementation gate that depends on them (FR-005).

---

## 4. Actors

RF-6 is consumed by the authenticated-actor categories defined in the foundation
spec (`001-console-foundation/spec.md` §4). The console carries **no**
authorization opinion about which actor reaches RF-6 — the backend enforces it
(FR-002). The table below records the foundation's actor posture for audit/search
and is **not** a frontend gate.

| ID | Actor | RF-6 relevance |
| --- | --- | --- |
| A1 | Platform Admin | Cross-tenant; may query audit for the active tenant scope. Whether the backend widens scope for A1 is backend truth, not a console decision (FR-002). |
| A2 | Tenant Owner | Tenant-scoped audit/search. |
| A3 | Tenant Admin | Tenant-scoped audit/search (foundation §4: "tenant-scoped audit/search"). |
| A4 | Store Manager | Store-scoped audit/search (foundation §4: "store-scoped audit/search"). The console renders whatever the backend returns for the active store scope. |
| A5 | Store Staff | Read-mostly; "looks up audit entries within store scope" (foundation §4). |
| A6 | POS Device / POS Operator | **Never authenticates against the console.** A6 is the **producer** of the POS-originated events RF-6 surfaces (via the backend ingestion path the console never calls), and the **subject** of others. A6 has **no** RF-6 surface, no sign-in, and the console never writes back to A6. Named here pointedly because POS events are RF-6's subject matter — the producer/consumer boundary (foundation §4 POS boundary rule, FR-006-013) must stay crisp. |
| A7 | Anonymous / unauthenticated | No RF-6 surface. RF-6 is behind the RF-1 protected boundary; A7 is routed to SF-1. |

**Actor-scope discrepancy (flagged, not resolved).** The upstream contract
(`audit.openapi.yaml`) describes the query as "tenant-admin or platform-admin
scope," while foundation §4 grants A4/A5 *store-scoped* audit/search. This is a
real divergence between the contract's prose and the foundation actor model. RF-6
does **not** resolve it in the frontend (FR-002 forbids a frontend authorization
opinion): the console issues the query and renders the backend's response,
including a 403 if the backend refuses. The shape of the actor→RF-6 permission
matrix is OQ-3 (a read of backend truth, foundation OQ-4), not a UI decision.

**Authorization rule.** RF-6 never decides whether an actor *may* see an audit
event. The backend enforces authorization and scope; RF-6 renders what the
backend returns, including rejections (FR-002, Constitution Principle 7).

---

## 5. Surfaces in scope

RF-6 is one route family comprising two render-side surfaces plus its attachment
to the RF-1 shell. This spec names them and their responsibilities; **layout,
navigation, and interaction design are deferred to this slice's `plan.md` and
[`design-brief.md`](./design-brief.md)** (no wireframes here).

| ID | Surface | Responsibility |
| --- | --- | --- |
| SF-6-1 | Audit search surface | The filterable, cursor-paginated list of audit events for the active tenant/store scope. Collects filter inputs (action, actor, store, time range), issues `listAuditEvents`, and renders the returned rows as a table (list data → table, not cards). Drives "load more" from `next_cursor`. |
| SF-6-2 | Audit inspect surface | The client-side drill into a single **already-fetched** audit row: full `metadata`, `target_type`/`target_id`, `actor_user_id`/`actor_label`, `request_id`, `occurred_at`, and the `action` (including POS-catalogue actions). No backend single-event read; the data is already in the SF-6-1 page payload. |

**Shell-attachment rule.** RF-6 attaches to the RF-1 SF-2 app shell. Reaching
RF-6 requires an authenticated session and a resolved active-context scope
(RF-1 sequencing, foundation §5). The mechanism by which a content route
attaches to the shell (route registration + nav entry) is a `plan.md`/`tasks.md`
decision and a **shared-file touch** flagged for sequential implementation
(§6 Shared-file note); the *behavior* (RF-6 is unreachable without RF-1 scope)
is specified here.

**Read-only rule.** Neither surface mutates anything. There is no acknowledge,
annotate, export, redact, or delete action in RF-6 scope (read-mostly per
foundation §5; reinforced by FR-006-009).

---

## 6. Backend dependency — RF-6 consumption boundary

RF-6 consumes **exactly one** Data-Pulse-2 operation. This is the foundation
RF-6 consumption posture (foundation `spec.md` §6 RF-6 row); this slice does not
add to it. Adding an operation is an FR-009 scope expansion that requires a
foundation amendment, not a line in this spec.

The detailed consumption boundary for this slice lives in
[`contracts/rf6-audit-search.md`](./contracts/rf6-audit-search.md). The operation
is named only (operationId + method + path + upstream file); request/response
shapes are read from the generated client (`src/generated/schema.d.ts`, slice
002 pin `62d0906`), never copied here.

| # | operationId | HTTP | Upstream file | Surface |
| --- | --- | --- | --- | --- |
| 1 | `listAuditEvents` | `GET /api/v1/audit/events` | `audit.openapi.yaml` | SF-6-1 (+ SF-6-2 reads from the same payload) |

### Explicitly NOT consumed by RF-6

Named so a reviewer sees they were considered and intentionally excluded
(FR-006-001), not overlooked:

- **`posAuditEventsSync`** (`POST /api/pos/v1/audit-events`,
  `pos-audit-events.openapi.yaml`) — this is the **POS terminal → backend
  ingestion** endpoint. It is a **write** path used by POS-Pulse to push
  locally-emitted events INTO the backend audit log; it authenticates a
  *device* (body-based `device_token_attestation`, optional Clerk JWT), not a
  console session. **The console NEVER calls it.** RF-6 surfaces the events this
  endpoint persisted, but only by reading them back through `listAuditEvents`.
  Treating this as a second consumed operation would violate FR-006-013 (no POS
  surface) and FR-006-003 (cookie-session transport only).
- **No single-event read operation** — the backend exposes no
  `getAuditEvent`/`readAuditEvent` at pin `62d0906`. SF-6-2 "inspect" is
  satisfied from the SF-6-1 list payload (OQ-2), not by inventing an operation.

### POS-originated event sub-rows (read-through, dual readiness)

The POS event catalogue — `shift.open`, `shift.close`, `shift.forced_close`,
`operator.session.takeover`, `cashier.pin.reset`, `cashier.pin.unlock`
(`pos-audit-events.openapi.yaml` `action_category` enum) — is persisted by the
ingestion endpoint to the **same `audit_events` table** that `listAuditEvents`
reads. RF-6 therefore surfaces these as ordinary audit rows whose `action`
carries a POS-catalogue value. RF-6 reads the catalogue **only to know what
values may appear** in the `action` field and how to label them — never to call
the POS endpoint.

**Readiness.** Dual, carried forward from foundation `api-readiness.md` §RF-6
(this slice's [`api-readiness.md`](./api-readiness.md) carries it; it does not
re-derive or optimistically re-classify):

- `listAuditEvents` audit query + operational-event search → **`stable`**
  (foundation `sc-verification.md` SC-7 Verified, pin `62d0906`).
- POS-originated event sub-rows → **`draft`** (`pos-audit-events.openapi.yaml`
  `v1.0.0-draft`, no upstream `sc-verification.md`, append-only catalogue). The
  POS sub-rows MUST be re-verified before any implementation gate that depends
  on them (FR-005); the `stable` core surface (audit query + non-POS operational
  events) may be planned to gate independently of the `draft` POS sub-rows.

### Error matrix (read from the contract, not from a grep)

`listAuditEvents` (`audit.openapi.yaml`) documents exactly these responses. RF-6
renders each; it decides none:

| Status | Contract meaning | RF-6 render-side behavior |
| --- | --- | --- |
| 200 | OK — `{ items: AuditEvent[], next_cursor: string\|null }` | Render the table; if `items` is empty, render an empty state distinct from the pre-query state (FR-006-008). `next_cursor` drives "load more"; null → no more pages. |
| 401 | **"No active tenant."** (a *precondition* failure — no active tenant is resolved server-side), **NOT** session-expiry | See OQ-1 (the genuine interceptor-interaction open question below). RF-6 renders a "no active scope" state and routes the operator to resolve scope (RF-1 SF-3), **not** necessarily a sign-out. This 401 meaning differs from the RF-1 session-expiry 401, which is exactly why it is an OQ. |
| 403 | "Insufficient role." | Render a backend-driven "not permitted" state with the `request_id`; the console does not pre-judge the actor's access (FR-002). Reconciles with the actor-scope discrepancy in §4 (the backend, not the console, decides). |

**No 404, 409, 429, or 5xx are enumerated by the audit contract** for this
operation. RF-6 still renders the shared error surface for any unexpected
non-2xx (defensive, generic, surfaces `request_id`), but the *specified* matrix
is 200/401/403. Inventing a 404/409 behavior for this operation would be a
designed-from-pattern error of the kind the foundation forbids (FR-011 posture).

### Shared-file note (collides with sibling slices → sequential implement)

RF-6's attachment to the shell touches files that RF-2/RF-3/RF-5/RF-7 will also
touch. These are real, verified paths (read at planning time; see
[`plan.md`](./plan.md) and [`tasks.md`](./tasks.md)):

- `src/App.tsx` — route registration. Routing is declared **inline** in
  `App.tsx` (there is **no** separate router module; specifically **no**
  `src/lib/router.tsx`). RF-6 registers its route here. **Note:** the current
  protected area is a single root route rendering `ProtectedArea`, and
  `ProtectedArea` renders the shell directly with **no nested content-router**
  — so RF-6 is the first slice that needs a content-routing mechanism inside the
  shell; the *mechanism choice* is a `plan.md` decision (R6-1). (The specific
  routing primitive is named in `plan.md`/`research.md`, never here — AC-5.)
- `src/shell/AppShell.tsx` — the `GATED_NAV` array currently lists `Audit` as a
  gated (`RF-6`) entry. RF-6 **un-gates** the `Audit` nav entry here.
- `src/lib/client.ts` — RF-6 adds the `listAuditEvents` typed wrapper here, in
  the same `{ status, data, error }` shape as the seven RF-1 wrappers.

---

## 7. User scenarios

Illustrative of *why* RF-6 exists. Not UX flows; they do not constrain layout.

### Scenario S1 — Store manager searches recent activity

A4 (Store Manager), already signed in with an active store scope (RF-1), opens
Audit. SF-6-1 issues `listAuditEvents` for the active scope and renders the first
page (default `limit`). A4 narrows by `action` prefix (e.g., `auth.`) and a time
range (`from`/`to`); the list re-queries. When more rows exist, a "load more"
affordance fetches the next page via `next_cursor`.

### Scenario S2 — Investigating a POS-originated event

A4 investigates a POS terminal incident. In SF-6-1 they filter to a POS action
(e.g., `shift.forced_close` or `operator.session.takeover`). The row renders
read-only — it was emitted by a POS terminal (A6) and ingested by the backend;
the console never contacted the POS device. (Foundation Scenario S3 names this
exact flow.)

### Scenario S3 — Inspecting a single event's detail

A3 (Tenant Admin) clicks a row to inspect it (SF-6-2). The full `metadata`
object, `target_type`/`target_id`, `actor_user_id`/`actor_label`, and
`request_id` are shown from the **already-fetched** list payload — no extra
backend call (OQ-2: there is no single-event read operation).

### Scenario S4 — Backend refuses the query (403)

A5 (Store Staff) opens Audit but the backend returns 403 ("insufficient role")
for the requested scope. SF-6-1 renders a backend-driven "not permitted" state
with the `request_id`. The console drew no prior conclusion about A5's access
(FR-002) — it rendered what the backend returned.

### Scenario S5 — Empty result vs. no query yet

A3 applies a filter that matches nothing. SF-6-1 renders an "empty result for
this filter" state, distinct from the initial pre-query state and from a loading
state (FR-006-008, design-brief state matrix). Clearing the filter re-runs the
query.

### Scenario S6 — Scope switch resets the search

A1 (Platform Admin) switches the active tenant via the RF-1 scope header (SF-3)
while an audit search is open. RF-6 drops the in-flight filters and result page
and re-runs `listAuditEvents` in the new scope. No cross-scope result bleed —
audit results are tenant/store-scoped by the backend (Clarifications, OQ resolved).

### Scenario S7 — Session expires mid-search

A2's session expires while paging audit results. The next `listAuditEvents`
returns 401. This routes through the **RF-1 401 reactive-refresh interceptor**
(`src/lib/auth-interceptor.ts`): one `refreshSession` + retry; if the refresh
also 401s, the session is lost and the operator is routed to SF-1. **But note**
the audit contract's 401 also means "no active tenant" (a precondition, not
expiry) — distinguishing the two is OQ-1, the genuine interceptor-interaction
question. This scenario describes the *expiry* path; OQ-1 governs the
*precondition* path.

---

## 8. Functional requirements

Each is testable against this slice's plan, tasks, or implementation, and
anchored to a foundation FR or constitution principle.

### Consumption boundary

- **FR-006-001 — Exactly-one consumption.** RF-6's implementation MUST consume
  exactly the one operation in §6 (`listAuditEvents`) and no others. In
  particular it MUST NOT consume `posAuditEventsSync` (the POS ingestion
  endpoint) and MUST NOT invent a single-event read operation.
  *Anchors:* foundation FR-009; foundation `spec.md` §6 RF-6.

- **FR-006-002 — Generated-client only.** RF-6 MUST call `listAuditEvents`
  through the generated client at `src/generated/` (slice 002), via a typed
  wrapper in `src/lib/client.ts` matching the existing `{ status, data, error }`
  shape. No hand-rolled `fetch`/XHR targeting a Data-Pulse-2 path. No OpenAPI
  byte is copied into this repo.
  *Anchors:* Constitution Principle 8; foundation FR-006; slice 002 C-3.

- **FR-006-003 — Cookie transport, no bearer.** RF-6 MUST rely on the
  `dp2_session` cookie the browser attaches automatically (the RF-1 client is
  already configured with `credentials: "include"`). The console MUST NOT attach
  an `Authorization: Bearer` header. The bearer/`device_token_attestation`
  schemes on the POS ingestion endpoint are explicitly **out of scope** —
  the console never authenticates as a device.
  *Anchors:* foundation `contracts/rf1-auth-context.md` §Transport; slice 002 C-2;
  RF-1 FR-003-003.

### Backend-enforced authorization

- **FR-006-004 — No frontend authorization.** RF-6 MUST NOT contain any logic
  that decides whether the current actor may run an audit query, see a row, or
  reach the surface. The query is issued and the response (including 401/403) is
  rendered. The actor-scope discrepancy in §4 is resolved by the backend, never
  by the console.
  *Anchors:* Constitution Principle 7; foundation FR-002.

- **FR-006-005 — Backend-scoped results.** The set of audit rows RF-6 displays is
  exactly what `listAuditEvents` returns for the active context. RF-6 MUST NOT
  re-scope, re-filter for authorization, or merge results across scopes. A scope
  switch (RF-1 SF-3) re-runs the query in the new scope and drops prior results.
  *Anchors:* Constitution Principle 7; foundation FR-002; this spec Scenario S6.

### POS boundary

- **FR-006-006 — POS events are read-through only.** RF-6 MUST surface
  POS-originated events (`shift.*`, `operator.session.takeover`,
  `cashier.pin.*`) only by reading them back via `listAuditEvents`. RF-6 MUST
  NOT call the POS ingestion endpoint, MUST NOT write to the audit log, and MUST
  NOT write back to any POS device. POS event rows render identically to other
  audit rows (read-only).
  *Anchors:* Constitution Principle 3; foundation FR-003, §4 POS boundary rule.

- **FR-006-007 — POS sub-row draft gate.** The POS-originated event sub-rows are
  `draft` (foundation §6 RF-6). RF-6 MUST NOT plan the POS sub-rows to a
  `stable`-grade implementation gate; their readiness MUST be re-verified
  against the pinned contract before any implementation gate that depends on them
  (FR-005). The `stable` core (audit query + non-POS operational events) may
  gate independently.
  *Anchors:* foundation §6 RF-6; foundation FR-005, FR-011; Constitution Principle 2.

### Error rendering & state matrix

- **FR-006-008 — RF-6 state matrix.** RF-6 MUST render distinct states for:
  pre-query (no search run yet), loading, success-with-rows, success-but-empty
  (empty-after-filter, distinct from pre-query), 401 "no active scope", 403 "not
  permitted", and a generic non-2xx fallback. Each error state surfaces the
  backend `request_id` when present (RF-1 VD-4 pattern).
  *Anchors:* foundation `data-model.md` VD-4; this spec §6 error matrix;
  design-brief state matrix.

- **FR-006-009 — Read-only surface.** RF-6 MUST expose no action that mutates,
  annotates, acknowledges, exports, redacts, or deletes an audit event. Any
  apparent write affordance is out of scope and a scope-creep flag.
  *Anchors:* foundation §5 RF-6 (read-mostly); Constitution Principle 1.

### Scope and gates

- **FR-006-010 — No scaffold/package/CI change without approval.** This slice
  MUST NOT add or modify `package.json`, any lockfile, CI workflow, deployment
  config, or `.env*` at planning stage. RF-6 is expected to reuse the
  RF-1-approved stack (its routing primitive, its query/cache layer, and the
  shared client/query/error surface) and add
  **no** new runtime dependency; if `/speckit-clarify` surfaces a genuinely
  required new dependency (e.g., list virtualization), it is recorded in
  `plan.md` as *selected, pending Constitution Principle 9* and approved before
  implementation.
  *Anchors:* Constitution Principle 9, Principle 10; foundation FR-007, FR-010.

- **FR-006-011 — Foundation & sibling immutability.** This slice MUST NOT modify
  any file under `specs/001-console-foundation/`, `specs/002-tooling-and-scaffold/`,
  or `specs/003-rf1-auth-shell/`, nor the constitution, nor merged RF-1 source
  beyond the **declared shared-file touches** (`src/App.tsx` route registration,
  `src/shell/AppShell.tsx` nav un-gate, `src/lib/client.ts` new wrapper). Those
  touches are additive and flagged for sequential implementation; they do not
  alter RF-1 behavior. If RF-6 surfaces a foundation/RF-1 defect, STOP and open
  an amendment slice.
  *Anchors:* foundation FR-014; RF-1 FR-003-010; Constitution §Governance.

- **FR-006-012 — Full FR-008 gate before code.** No RF-6 implementation begins
  until all five foundation FR-008 gates are explicitly approved for this slice:
  spec, plan, task list, API dependency map (audit core row confirmed `stable`,
  POS sub-rows re-verified per FR-006-007), and validation gates. Clearing a gate
  for another slice does not carry over.
  *Anchors:* foundation FR-008; Constitution §Implementation readiness gates.

- **FR-006-013 — No POS surface, no mock without approval.** RF-6 MUST NOT
  contain any POS sign-in, terminal-pairing, device-token, or POS-operator
  surface (A6 never authenticates against the console). RF-6 tests MUST NOT
  depend on a live Data-Pulse-2 instance (slice 002 C-5); any mock of
  `listAuditEvents` requires explicit human approval, a `disposable: true`
  marking, and a removal task. This spec does not pre-authorize a mock.
  *Anchors:* Constitution Principle 3; foundation FR-003; slice 002 C-5;
  Maestro playbook §Mock rule.

---

## 9. Acceptance criteria

This **spec** is acceptable when all of the following hold:

- **AC-1.** All mandatory sections (Header, Background, Goals, Non-goals, Actors,
  Surfaces, Backend dependency, Scenarios, Functional requirements, Acceptance
  criteria, Open questions) are present with concrete content.
- **AC-2.** Exactly the one operation in §6 is listed (`listAuditEvents`); the
  POS ingestion endpoint (`posAuditEventsSync`) and the absence of a single-event
  read operation are both explicitly named as excluded.
- **AC-3.** The two surfaces SF-6-1/SF-6-2 are each defined with a one-line
  responsibility, neither introduces a frontend authorization decision, and
  neither introduces a write/mutation affordance (read-only).
- **AC-4.** Every functional requirement FR-006-001..FR-006-013 is testable and
  anchored to a foundation FR or constitution principle.
- **AC-5.** No section names a router, state library, data-fetching library,
  table/virtualization library, styling system, component library, framework
  primitive, file path under `src/` *as an RF-6 implementation choice*, or
  component name. (Naming the *repository*, the *generated-client location*
  `src/generated/`, the slice-002/RF-1 *decisions as fixed context*, and the
  **real shared-file paths RF-6 must touch** — `src/App.tsx`,
  `src/shell/AppShell.tsx`, `src/lib/client.ts` — is allowed, because those are
  verified existing facts and collision flags, not RF-6's own primitive choices.
  Choosing RF-6's own router/state/table primitive is not allowed here; it lives
  in `plan.md`.)
- **AC-6.** The backend dependency (§6 + [`api-readiness.md`](./api-readiness.md))
  carries the foundation RF-6 **dual** readiness forward by reference (`stable`
  audit core / `draft` POS sub-rows); it does not re-classify optimistically and
  names the SHA pin (`62d0906`).
- **AC-7.** No byte of Data-Pulse-2 OpenAPI content is copied into any file of
  this slice. The POS catalogue values are referenced as the `action` values that
  may appear, not reproduced as a contract.
- **AC-8.** The error matrix (§6) is derived from **reading** `audit.openapi.yaml`
  end-to-end (200/401/403 only; 401 = "no active tenant", not expiry), and the
  401-meaning collision with the RF-1 interceptor is recorded as OQ-1 — not
  silently "fixed."
- **AC-9.** The spec quality checklist
  [`checklists/requirements.md`](./checklists/requirements.md) is filled in with
  each item marked, and no failing item is left unaddressed at hand-off.
- **AC-10.** Open questions (§10) name every cross-repo confirmation or deferred
  decision that must resolve before `/speckit-plan` or the FR-008 implementation
  gate.

---

## 10. Open questions

These block `/speckit-plan` or the FR-008 implementation gate, not the
acceptance of this spec as a `/speckit-specify` output.

- **OQ-1 — Audit 401 meaning vs. the RF-1 interceptor (genuine interaction
  question).** `audit.openapi.yaml` documents 401 as **"No active tenant"** — a
  *precondition* failure, not session-expiry. The merged RF-1 interceptor
  (`src/lib/auth-interceptor.ts`) treats every 401 as expiry: it fires
  `refreshSession` once + retries, and on a second 401 the
  `useActiveContext`/`ProtectedArea` path routes to sign-out/SF-1
  (`src/context/useActiveContext.ts`, `src/shell/ProtectedArea.tsx`). If RF-6's
  query 401s for "no active tenant", running it through the unmodified
  interceptor would: refresh (succeed, the session is valid) → retry → 401 again
  → potentially route a *validly authenticated* operator to sign-in. This is a
  real contradiction, **flagged not fixed**. Sub-question (a) — *is the audit 401
  even reachable?* — was **tested against the RF-1 code in Clarifications (Session
  2026-06-06)**: `ProtectedArea` renders `ScopeGate` until `active_tenant` is set,
  so RF-6 is unreachable without an active tenant and the audit 401 is **not on
  the normal path**. Recommended (headless) resolution: RF-6 does not special-case
  the audit 401 at this slice. Sub-question (b) stays **open**: if a backend drops
  the active tenant mid-session, should RF-6 distinguish the "no active tenant"
  401 from the expiry 401 (route to SF-3, not sign-out) — and does that require a
  per-call opt-out of the shared interceptor (an RF-1-touching change)? Any fix
  touching `src/lib/auth-interceptor.ts` is an RF-1 amendment, not an RF-6 change.

- **OQ-2 — "Inspect" without a single-event read operation.** **RESOLVED
  (Session 2026-06-06):** there is no `getAuditEvent`/`readAuditEvent` at pin
  `62d0906`; SF-6-2 inspect is a client-side drill into the already-fetched
  SF-6-1 row payload (`AuditEvent` carries `metadata`/`target_*`/`request_id`).
  Recorded against Scenario S3. (Kept as an OQ so the absence is a visible,
  verified decision rather than an assumed gap.)

- **OQ-3 — Actor → RF-6 permission matrix.** The contract prose says
  "tenant-admin or platform-admin scope," but foundation §4 grants A4/A5
  store-scoped audit/search. What is the **actual** backend authorization shape
  for `listAuditEvents` across A1–A5 at pin `62d0906`? This is a read of backend
  truth (foundation OQ-4), not a frontend design decision. Until confirmed, RF-6
  renders whatever the backend returns (including 403) and draws no conclusion
  (FR-006-004). Must resolve before the FR-008 API-dependency gate.

- **OQ-4 — Pagination affordance.** **RESOLVED (Session 2026-06-06):** cursor
  "load more" driven by `next_cursor` (first page at `limit` default 50, max
  200); no auto-fetch-until-exhausted. Applies to Scenarios S1/S5. The control's
  visual treatment is a `design-brief.md` decision.

- **OQ-5 — POS sub-row re-verification + draft ceiling.** The POS-originated
  event sub-rows are `draft` (`pos-audit-events.openapi.yaml` `v1.0.0-draft`, no
  `sc-verification.md`). Before any implementation gate that *depends* on the POS
  sub-rows (e.g., POS-specific labels/filters), the `draft` status MUST be
  re-verified against Data-Pulse-2 `main` (and POS-Pulse emission semantics)
  per FR-006-007 / foundation FR-005. The `stable` audit core can proceed without
  this; a POS-label-dependent feature cannot. Recorded in
  [`api-readiness.md`](./api-readiness.md).

- **OQ-6 — Validation-gate definition.** FR-006-012 requires "validation gates
  defined and approved" as the 5th FR-008 gate. What are RF-6's validation gates
  (unit coverage threshold for the filter/state-reduction logic, the specific
  Playwright journeys for SF-6-1/SF-6-2, the no-`fetch`-against-DP2-paths grep,
  the no-`posAuditEventsSync` grep)? Defined in `plan.md` / `tasks.md`, not here.

---

## 11. Assumptions (informational only)

Recorded so a future reader can challenge them explicitly.

- **AS-1.** The RF-1 merged stack (the routing setup inline in `src/App.tsx`,
  the RF-1 query/cache layer, the shared `src/lib/client.ts` wrappers, the
  `Banner`/`InlineError` surface, `src/styles/tokens.css` + `controls.css`) is
  fixed context for RF-6. RF-6 reuses it and re-opens none of those decisions;
  it adds **no** new runtime dependency unless `/speckit-clarify` proves one is
  required (then Principle 9). The named primitive libraries live in `plan.md` /
  `research.md`, never here (AC-5).
- **AS-2.** The Data-Pulse-2 pin `62d0906` (slice 002 C-4) is the contract
  reference RF-6 plans against. A re-pin is a separate change outside this slice.
- **AS-3.** `listAuditEvents` is the exhaustive RF-6 consumption set. Any further
  audit operation (export, single-event read, mutation) belongs to a later slice
  or a foundation amendment (FR-006-001), not RF-6.
- **AS-4.** Audit data is fully backend-scoped per request; the console holds no
  authoritative copy and never re-scopes for authorization (foundation
  `data-model.md`; FR-006-005).
- **AS-5.** POS-originated events reach the console only via the backend audit
  log (read-through). The console never participates in POS event emission,
  sync, or the device-token attestation path.

---

## 12. Cross-reference index

- Constitution: `.specify/memory/constitution.md` (v1.0.1)
- Foundation spec: [`specs/001-console-foundation/spec.md`](../001-console-foundation/spec.md) (§4 actors incl. A6 POS boundary, §5 RF-6 definition + sequencing, §6 RF-6 dual readiness, FR-002/003/005/006/007/008/009/011/014)
- Foundation api-readiness: [`specs/001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md) (§RF-6, pin `62d0906`)
- RF-1 slice (the shell RF-6 attaches to): [`specs/003-rf1-auth-shell/spec.md`](../003-rf1-auth-shell/spec.md); merged source `src/App.tsx`, `src/shell/AppShell.tsx` (`GATED_NAV`), `src/lib/client.ts`, `src/lib/auth-interceptor.ts`, `src/context/useActiveContext.ts`, `src/shell/ProtectedArea.tsx`
- Scaffold slice: [`specs/002-tooling-and-scaffold/spec.md`](../002-tooling-and-scaffold/spec.md) (D-1..D-8 fixed stack, C-1..C-8 constraints)
- Upstream contracts (referenced, never copied): `audit.openapi.yaml` (`listAuditEvents`), `pos-audit-events.openapi.yaml` (`posAuditEventsSync` — NOT consumed; POS catalogue source)
- This slice's companions: [`plan.md`](./plan.md), [`research.md`](./research.md), [`data-model.md`](./data-model.md), [`api-readiness.md`](./api-readiness.md), [`contracts/rf6-audit-search.md`](./contracts/rf6-audit-search.md), [`design-brief.md`](./design-brief.md), [`quickstart.md`](./quickstart.md), [`checklists/requirements.md`](./checklists/requirements.md)

---

**End of Feature Specification: RF-6 Audit / Search.**

# Feature Specification: RF-5 Operator / Admin Management

| Field | Value |
| --- | --- |
| Feature ID | 005 |
| Short name | rf5-operator-admin |
| Branch | `005-rf5-operator-admin` |
| Status | Draft |
| Owner | Ahmed Shaaban |
| Mode | Planning-only |
| Created | 2026-06-06 |
| Spec Kit phase | `/speckit-specify` (this document) |
| Foundation slice | [`specs/001-console-foundation`](../001-console-foundation/) (merged) |
| Scaffold slice | [`specs/002-tooling-and-scaffold`](../002-tooling-and-scaffold/) (merged) |
| Auth-shell slice | [`specs/003-rf1-auth-shell`](../003-rf1-auth-shell/) (merged) — RF-5 attaches to it |

> **Mode contract**: Planning-only. This spec specifies the RF-5 operator / admin
> management surface (foundation `spec.md` §5 route family RF-5: "View and manage
> the identities that belong to A1–A5, excluding A6 POS operators"). It must not
> be used to justify any implementation, component file, route file,
> generated-client regeneration, mock server, CI change, or commit beyond this
> spec document and its companion planning artifacts. Implementation is gated by
> the constitution (`.specify/memory/constitution.md`) and the foundation spec's
> FR-008 five-gate rule. This spec authorizes **no UI code**.

---

## 1. Background and why

Retail-Tower-Console is the admin web frontend in the three-repo Retail Tower
split (Data-Pulse-2 backend / POS-Pulse terminal / Retail-Tower-Console admin).
The foundation slice ([`001-console-foundation`](../001-console-foundation/))
named seven route families RF-1 through RF-7. **RF-5 — Operator / admin
management** (foundation `spec.md` §5) is the family that lets a tenant's
administrators *see who belongs to the tenant and in what role*, and *manage that
membership graph* (invite, change role/store-access, revoke).

RF-1 ([`003-rf1-auth-shell`](../003-rf1-auth-shell/), merged) already established
the authenticated app shell (SF-2), the read-only active-context provider (SF-3),
and the public/protected route boundary. **RF-5 attaches to RF-1**: it is one of
the gated `Management` nav entries (the `Operators` entry, currently shown gated
in the RF-1 app shell) and it reads the active tenant RF-1 resolved. RF-5 adds no
new session-lifecycle behavior; it consumes the membership graph *within* the
already-resolved active tenant.

### Why now

- RF-5's backend dependency is `stable` per foundation `api-readiness.md` §RF-5,
  verified against Data-Pulse-2 `main` @ `62d0906`: `tenants.openapi.yaml`
  (`listMembers`) + `memberships.openapi.yaml` (`createInvitation` /
  `updateMembership` / `revokeMembership` / `acceptInvitation`); upstream
  `sc-verification.md` SC-6 Verified. Planning is unblocked.
- The **A6 / POS-operator boundary is confirmed clean** (foundation
  `api-readiness.md` §RF-5): the A6 operator surface is the *separate*
  `pos-operators.openapi.yaml` (`/api/pos/v1/operators/*`, Clerk-JWT, device-token
  scoped). POS operator management is **not** in console scope (Constitution
  Principle 3, foundation FR-003). This spec reads that contract only to assert
  the exclusion precisely (§4, §6.4).
- RF-1 (merged) gives RF-5 the active-context provider and shell frame to attach
  to. RF-5 is the natural next admin slice after RF-1.

---

## Clarifications

### Session 2026-06-06

Behavioral resolutions only. Per AC-5, RF-5's router / state / data-fetching /
form / error-surface **primitive** choices are NOT named here; they are recorded
in [`plan.md`](./plan.md) Technical Context and [`research.md`](./research.md)
(reusing RF-1's resolved primitives). This section records only resolutions that
name no library.

- Q: OQ-1 — Does a `createInvitation` 401 ("No active tenant") mean the same as a
  session-expiry 401 (which RF-1 routes to sign-out)? → A: **No — they are
  distinct.** A `createInvitation`/`listMembers` precondition 401 (no active
  tenant) MUST NOT be treated as session-expiry. RF-5 MUST distinguish: an
  expiry 401 (where the reactive single-refresh also fails) routes to SF-1; a
  precondition 401 (where the session is still valid) routes the operator to the
  RF-1 scope chooser to set an active tenant first. RF-5 MUST NOT reuse a blanket
  "any 401 → session-lost" mapping. Reconciled into Scenarios S1, S3; FR-005-007.
- Q: OQ-2 — Is the public `acceptInvitation` flow (anonymous invitee accepting a
  token) in RF-5 scope? → A: **Yes, as a distinct public surface (SF5-4),** a
  sibling of the RF-1 public sign-in route (not an A1–A5 admin action). Foundation
  scopes `acceptInvitation` to RF-5. It is reachable only via an emailed token;
  it establishes a session on success and lands the new member in the RF-1 shell.
- Q: OQ-3 — How are `store_access_kind: "specific"` store names rendered in the
  member list/detail, given store metadata is RF-2's surface? → A: **Render the
  store identifiers (UUIDs/count) only in RF-5; do NOT consume an RF-2 operation
  (`listStores`) to resolve names.** Resolving store names to human labels is an
  RF-2 dependency flagged in OQ-3 (open); RF-5 ships with id/count display until
  RF-2 is available. RF-5 MUST NOT silently pull in an RF-2 op (FR-009 scope).
- Q: OQ-4 — RF-5 stack primitives (router, state store, data-fetching, form,
  error surface)? → A: **Reuse RF-1's resolved primitives** (recorded in
  `plan.md` Technical Context / `research.md`, named there not here per AC-5).
  RF-5 introduces **zero** new runtime dependency; if any is later found
  necessary it is "selected, pending Constitution Principle 9."

---

## 2. Goals

- **G1.** Specify the **member-list surface**: how RF-5 reads and renders the
  membership graph (who belongs to the active tenant, in what role, with what
  store-access policy) as a table (DESIGN.md rule 7: tables over cards for list
  data).
- **G2.** Specify the **member-management surfaces**: invite a new member, change
  a member's role / store-access policy, and revoke a membership — each as a
  render-side reaction to a backend operation followed by a re-fetch.
- **G3.** Enumerate the **exactly five** Data-Pulse-2 operations RF-5 consumes,
  with no addition beyond the foundation RF-5 consumption boundary, and assert
  the **A6 / POS-operator exclusion** explicitly.
- **G4.** Specify the **idempotency contract** RF-5 honors on `createInvitation`
  (client-generated `Idempotency-Key`, replay, conflict, 425 Too Early).
- **G5.** Specify the **error-rendering** behaviors for the status codes RF-5
  encounters (400/401/403/404/409/425), distinguishing the *precondition* 401
  ("no active tenant") from session-expiry (FR-005-007), and rendering uniform
  404 (leak-avoidance).
- **G6.** Define the **functional requirements** and **acceptance criteria** any
  RF-5 plan / task list / implementation slice must satisfy.
- **G7.** Record the **open questions** that must resolve before an RF-5
  implementation gate (FR-008) clears.

---

## 3. Non-goals

This spec **does not**:

- Authorize implementation of the RF-5 UI. That requires the foundation FR-008
  five-gate approval for this slice specifically.
- Re-choose a router, state-management library, data-fetching library, styling
  system, component library, or form library. RF-5 **reuses RF-1's** resolved
  primitives (recorded in this slice's `plan.md` / `research.md`, named there
  not here).
- Create any `src/` file, route file, component, hook, test file, or mock.
- Regenerate, edit, or re-pin `src/generated/schema.d.ts`. (RF-5's operations are
  not yet vendored in the slice-002 client subset — see §6.5 / OQ-5 — but the
  regeneration itself is a gated implementation task, not a spec action.)
- Define, copy, paraphrase, or vendor any byte of Data-Pulse-2's
  `tenants.openapi.yaml`, `memberships.openapi.yaml`, `context.openapi.yaml`, or
  `pos-operators.openapi.yaml`. Request/response shapes are read from the
  generated client at implementation time.
- Define backend APIs, authorization logic, database schema, role definitions, or
  invitation token issuance. Those belong to Data-Pulse-2.
- **Manage A6 POS operators.** POS operator identity, sign-in, roster, takeover,
  and active-session (the `pos-operators.openapi.yaml` surface) are POS-Pulse /
  Data-Pulse-2-POS owned and are explicitly out of console scope (§6.4,
  FR-005-013, Constitution Principle 3).
- Resolve `store_access_kind: "specific"` store IDs to human store names — that
  needs RF-2's `listStores`, an out-of-scope operation (OQ-3).
- Re-implement RF-1's session lifecycle, active-context provider, or route guard.
  RF-5 consumes them (FR-005-006).

---

## 4. Actors

RF-5 is consumed by the authenticated administrative-actor categories defined in
the foundation spec (`001-console-foundation/spec.md` §4). The backend enforces
*which* actor may invite/modify/revoke; RF-5 renders the backend's `403`/`404`
verbatim and carries no authorization opinion (FR-005-004).

| ID | Actor | RF-5 relevance |
| --- | --- | --- |
| A1 | Platform Admin | May view/manage members across tenants (subject to backend authorization). Acts within whichever tenant RF-1 has made active. |
| A2 | Tenant Owner | Manages the membership graph of the owned tenant: invite, change role/store-access, revoke. |
| A3 | Tenant Admin | Tenant-scoped administrative identity; manages members within the active tenant (subject to backend `403` on insufficient role). |
| A4 | Store Manager | Store-scoped identity; may view members and (subject to backend role checks) manage store-level operators. RF-5 renders what the backend permits. |
| A5 | Store Staff | Typically read-only in RF-5; the backend returns `403` on any management action A5 is not permitted, and RF-5 renders that. |
| A6 | **POS Device / POS Operator** | **EXCLUDED.** A6 never appears in RF-5 and is never managed here. POS operators are managed through `pos-operators.openapi.yaml` (`/api/pos/v1/operators/*`, Clerk-JWT, device-token scoped) — a POS-Pulse / DP2-POS surface this console does not touch (Constitution Principle 3, foundation FR-003). RF-5 reads that contract *only* to assert this exclusion. The membership graph RF-5 manages is the A1–A5 platform-membership graph (`memberships` + `tenants/{id}/members`), which is a separate identity surface from POS operator sessions. |
| A8 (anonymous invitee) | A user accepting an emailed invitation token | Reaches **only** the public accept-invitation surface (SF5-4). The accept token authenticates the request (`acceptInvitation` is `security: []`); on success a session is established and the new member lands in the RF-1 shell. Not an A1–A5 admin action. |

**Authorization rule.** RF-5 never decides whether an actor *may* invite,
modify, or revoke a member. The backend enforces it (role checks, tenant
isolation); RF-5 renders the result, including `403` (insufficient role) and
`404` (not found / no access) verbatim (FR-005-004, Constitution Principle 7).

---

## 5. Surfaces in scope

RF-5 is one route family comprising four render-side surfaces. This spec names
them and their responsibilities; **layout, navigation, and interaction design are
deferred to [`design-brief.md`](./design-brief.md) and `plan.md`** (no wireframes
in this spec).

| ID | Surface | Responsibility |
| --- | --- | --- |
| SF5-1 | Member list | The default RF-5 view. Reads `listMembers` for the active tenant and renders the membership graph as a **table** (member identity, role, store-access policy, revoked state). The destination the RF-1 `Operators` nav entry un-gates to. |
| SF5-2 | Invite member | A form surface that collects email + role + store-access policy and calls `createInvitation` with a client-generated `Idempotency-Key` (§6.3). Renders the idempotency / conflict / 425 outcomes (FR-005-008). On success the member list re-fetches. |
| SF5-3 | Edit / revoke member | Per-member management: change role and/or store-access policy (`updateMembership`) or revoke (`revokeMembership`). Each is followed by a `listMembers` re-fetch. Revoke is a **destructive** action (DESIGN.md `.btn-destructive`, confirmation). |
| SF5-4 | Accept invitation (public) | The anonymous invitee surface (OQ-2 resolved: in scope). Reachable only via an emailed token; calls `acceptInvitation` (`security: []`), establishes a session on success, and lands the new member in the RF-1 shell. A sibling of RF-1's public sign-in route, not an A1–A5 admin action. |

**Scope rule.** SF5-1/2/3 are reachable only inside an RF-1-resolved active
tenant (the membership graph is tenant-scoped: `listMembers` takes
`{tenant_id}`). If no active tenant is set, RF-5 routes to the RF-1 scope chooser
first (FR-005-007, Scenario S3) — it does **not** sign the operator out. SF5-4 is
public and stands outside the active-tenant gate.

---

## 6. Backend dependency — RF-5 consumption boundary

### 6.1 The exactly-five operations

RF-5 consumes **exactly five** Data-Pulse-2 operations. This set is the
foundation RF-5 consumption boundary (foundation `api-readiness.md` §RF-5; there
is no separate foundation `contracts/rf5-*.md`). This slice does not add to it.
Adding an operation is an FR-009 scope expansion that requires a foundation
amendment, not a line in this spec.

The detailed consumption boundary for this slice lives in
[`contracts/rf5-operator-admin.md`](./contracts/rf5-operator-admin.md).
Operations are named only (operationId + method + path + upstream file);
request/response shapes are read from the generated client, never copied here.

| # | operationId | HTTP | Upstream file | Surface |
| --- | --- | --- | --- | --- |
| 1 | `listMembers` | `GET /api/v1/tenants/{tenant_id}/members` | `tenants.openapi.yaml` | SF5-1 |
| 2 | `createInvitation` | `POST /api/v1/memberships/invite` | `memberships.openapi.yaml` | SF5-2 |
| 3 | `updateMembership` | `PATCH /api/v1/memberships/{membership_id}` | `memberships.openapi.yaml` | SF5-3 |
| 4 | `revokeMembership` | `DELETE /api/v1/memberships/{membership_id}` | `memberships.openapi.yaml` | SF5-3 |
| 5 | `acceptInvitation` | `POST /api/v1/invitations/accept` | `memberships.openapi.yaml` | SF5-4 |

### 6.2 Reused (not newly consumed) — RF-1 active context

RF-5 **depends on** but does **not re-consume** the RF-1 active-context
operations. `listMembers` needs `{tenant_id}`, which RF-5 reads from RF-1's
already-resolved `active_tenant.id` (SF-3, `context.openapi.yaml`
`ContextResponse`). RF-5 attaches to RF-1's active-context provider rather than
re-fetching context itself. Switching tenant/store remains RF-1's surface; RF-5
re-reads members when the active tenant changes.

### 6.3 Idempotency contract on `createInvitation`

`createInvitation` is `x-idempotency: required`. RF-5 MUST:

- Generate a client-side opaque `Idempotency-Key` header per invite attempt
  (UUIDv7 recommended; pattern `^[\x21-\x7E]{16,128}$`). This is a **new wrapper
  shape** vs. the RF-1 client wrappers (which pass body only) — recorded as a
  plan/research note.
- Treat a `201` with `Idempotent-Replayed: true` as a successful replay of the
  same request (idempotent retry), not a duplicate.
- Treat `idempotency_key_conflict` (a `409` from re-using a key with a different
  body) as a **terminal client error** — generate a new key, do not auto-retry.
- Treat `425 Too Early` (original request still processing) as a transient: retry
  after the `Retry-After` interval **with the same key and body**.

### 6.4 EXCLUDED — the A6 POS-operator surface (`pos-operators.openapi.yaml`)

Named so a reviewer sees it was read and intentionally excluded (Constitution
Principle 3, foundation FR-003), not overlooked. The following operations are
**NOT** consumed by RF-5 and never appear in this console:

- `posOperatorSignIn` (`POST /api/pos/v1/operators/sign-in`)
- `posOperatorSignOut` (`POST /api/pos/v1/operators/sign-out`)
- `posOperatorRoster` (`GET /api/pos/v1/operators/roster`)
- `posOperatorTakeoverConfirm` (`POST /api/pos/v1/operators/takeover/confirm`)
- `posOperatorActiveSession` (`GET /api/pos/v1/operators/active-session`)

These are Clerk-JWT + device-token-scoped POS terminal operations owned by
POS-Pulse / Data-Pulse-2-POS. The membership graph RF-5 manages (A1–A5) is a
distinct identity surface. **Boundary confirmed clean** (foundation
`api-readiness.md` §RF-5). No console call reaches `/api/pos/v1/*`.

### 6.5 Readiness & vendored-client note

**Readiness.** RF-5's five operations are `stable` per foundation
`api-readiness.md` §RF-5 (verified against Data-Pulse-2 `main` @ `62d0906`;
upstream `sc-verification.md` SC-6 Verified). This slice's
[`api-readiness.md`](./api-readiness.md) carries that verification forward — it
does **not** re-derive or optimistically re-classify it.

**Vendored-client subset note (OQ-5).** The slice-002 generated client at
`src/generated/schema.d.ts` (pin `62d0906`) currently exposes only the
RF-1 auth + context paths; it does **not yet** expose
`/api/v1/tenants/{tenant_id}/members`, `/api/v1/memberships/*`, or
`/api/v1/invitations/accept`. This is expected (slice 002 generated the RF-1
subset). The contracts themselves are `stable`; RF-5 implementation requires the
client to be regenerated at the pinned SHA to include these operations. That
regeneration is a **gated implementation task** (not a spec action, not a
re-pin), recorded as OQ-5 and in `api-readiness.md`.

---

## 7. User scenarios

Illustrative of *why* RF-5 exists. Not UX flows; they do not constrain layout.

### Scenario S1 — View the membership graph

A2 (Tenant Owner) with an active tenant opens `Operators`. RF-5 reads
`listMembers` for `active_tenant.id` and renders the members as a table: each
row shows the member identity (email / display name), `role_code`, and
store-access policy (`all`, or `specific` with the accessible-store count/ids).
Revoked members render with a `revoked_at` marker. (If no active tenant is set,
RF-5 routes to the RF-1 scope chooser first — Scenario S3, FR-005-007.)

### Scenario S2 — Invite a new member

A3 (Tenant Admin) invites `new@tenant.test` as a store-manager role with
`store_access_kind: specific` for two stores. SF5-2 generates an
`Idempotency-Key`, calls `createInvitation`, and on `201` shows the pending
invitation and re-fetches the list. A double-submit (same key, same body) returns
`201` with `Idempotent-Replayed: true` and is treated as the same invite. A
duplicate pending invite for that email returns `409` and RF-5 surfaces it as
"an invitation is already pending for this email."

### Scenario S3 — Management attempted with no active tenant (precondition 401)

A1 (Platform Admin) opens `Operators` but has not yet selected an active tenant
(or the active tenant was cleared). `listMembers`/`createInvitation` returns a
**precondition `401` ("No active tenant")** — the session is still valid. RF-5
MUST route the operator to the RF-1 scope chooser to set an active tenant first.
It MUST NOT treat this as session-expiry and MUST NOT sign the operator out
(FR-005-007, OQ-1). Contrast with Scenario S6.

### Scenario S4 — Change a member's role / store access

A2 changes a member's role and switches them from `store_access_kind: all` to
`specific`. SF5-3 calls `updateMembership` with the changed fields and re-fetches
`listMembers` (no optimistic local mutation — mirrors RF-1's FR-003-005
discipline). A `404` (member not found OR caller has no access) renders
identically regardless of cause (FR-005-009).

### Scenario S5 — Revoke a membership

A2 revokes a member. SF5-3 shows a destructive-action confirmation, then calls
`revokeMembership`. A `204` means the membership row is soft-deleted (audit
logged backend-side); RF-5 re-fetches the list, where the member now renders with
a `revoked_at` marker. A `404` is rendered uniformly (FR-005-009).

### Scenario S6 — Session expiry mid-management (true expiry 401)

A3's session expires while editing a member. The next consumed call returns
`401`; the RF-1 reactive-refresh interceptor attempts `refreshSession` **once**;
if that **also** fails, the session is lost and the operator is routed to SF-1
(RF-1 Scenario S5). This is the *expiry* 401 — distinct from the *precondition*
401 in Scenario S3. The discriminator is whether the reactive refresh fails
(expiry → SF-1) vs. succeeds-but-the-call-still-401s (precondition → scope
chooser) (FR-005-007, OQ-1).

### Scenario S7 — Accept an invitation (public)

A8 (anonymous invitee) opens the emailed accept link. SF5-4 (public, no active
session required) calls `acceptInvitation` with the token (and a password /
display name if not yet a registered user). On `200` a membership is created and
a session is established; the new member lands in the RF-1 shell with the new
tenant resolvable. An invalid/expired token returns `400`, rendered as
"this invitation link is invalid or has expired."

---

## 8. Functional requirements

Each is testable against this slice's plan, tasks, or implementation, and
anchored to a foundation FR or constitution principle.

### Consumption boundary

- **FR-005-001 — Exactly-five consumption.** RF-5's implementation MUST consume
  exactly the five operations in §6.1 and no others. It MUST NOT consume any
  `pos-operators.openapi.yaml` operation (§6.4) or any RF-2 operation such as
  `listStores` (OQ-3).
  *Anchors:* foundation FR-009; foundation `api-readiness.md` §RF-5.

- **FR-005-002 — Generated-client only.** RF-5 MUST call the five operations
  through the generated client at `src/generated/` (regenerated at pin `62d0906`
  to include them — §6.5). No hand-rolled `fetch`/XHR targeting a Data-Pulse-2
  path is permitted. No OpenAPI byte is copied into this repo.
  *Anchors:* Constitution Principle 8; foundation FR-006; slice 002 C-3.

- **FR-005-003 — Cookie transport, no bearer.** RF-5 MUST rely on the
  `dp2_session` HttpOnly+Secure+SameSite=Lax cookie that the browser attaches
  automatically (the same posture RF-1 wired). JavaScript MUST NOT read the
  cookie, and the console MUST NOT attach an `Authorization: Bearer` header (the
  bearer scheme is for POS / server-to-server use, never the console). The
  `createInvitation` `Idempotency-Key` is a request header, **not** a credential.
  *Anchors:* foundation contract §Transport; slice 002 C-2; RF-1 FR-003-003.

### Backend-enforced authorization

- **FR-005-004 — No frontend authorization.** RF-5 MUST NOT contain any logic
  that decides whether the current actor may view, invite, modify, or revoke a
  member. It renders the backend's `403`/`404` verbatim; it does not pre-judge
  access or hide actions based on a frontend role guess. Role and store-access
  policy are rendered for display only.
  *Anchors:* Constitution Principle 7; foundation FR-002; RF-1 FR-003-004.

- **FR-005-005 — Server-resolved membership graph, no optimistic mutation.** The
  membership graph is whatever `listMembers` returns. Each mutation
  (`createInvitation` / `updateMembership` / `revokeMembership`) is followed by a
  `listMembers` re-fetch. No optimistic local mutation of the member list.
  *Anchors:* RF-1 FR-003-005 (same discipline); foundation `data-model.md`.

### Active-context dependency

- **FR-005-006 — Attaches to RF-1 active context.** RF-5 MUST read the active
  tenant from RF-1's active-context provider (SF-3) and MUST NOT re-implement
  session lifecycle, the route guard, or the active-context fetch. Switching
  tenant/store is RF-1's surface; RF-5 re-reads members when the active tenant
  changes.
  *Anchors:* RF-1 SF-3 / FR-003-005; Constitution Principle 1.

- **FR-005-007 — Precondition 401 ≠ session-expiry.** RF-5 MUST distinguish a
  *precondition* `401` ("No active tenant", session still valid) from a
  *session-expiry* `401`. A precondition 401 routes the operator to the RF-1
  scope chooser; it MUST NOT trigger sign-out. A session-expiry 401 (the RF-1
  reactive single-refresh also fails) routes to SF-1. RF-5 MUST NOT reuse a
  blanket "any 401 → session-lost" mapping. The discriminator is whether the
  reactive refresh fails.
  *Anchors:* OQ-1; RF-1 Scenario S5 / reactive-refresh interceptor behavior;
  `memberships.openapi.yaml` / `tenants.openapi.yaml` 401 semantics.

### Idempotency & error rendering

- **FR-005-008 — Invitation idempotency.** RF-5 MUST honor the §6.3 idempotency
  contract on `createInvitation`: client-generated `Idempotency-Key`, treat
  `Idempotent-Replayed: true` as a successful replay, treat
  `idempotency_key_conflict` (`409`) as terminal (new key), and retry `425 Too
  Early` after `Retry-After` with the same key + body.
  *Anchors:* `memberships.openapi.yaml` `/memberships/invite` `x-idempotency`.

- **FR-005-009 — RF-5 error behaviors.** RF-5 MUST render: `createInvitation`
  `400` validation/idempotency codes distinctly; `403` (insufficient role) as a
  permission banner; `404` (not found / no access) **uniformly** regardless of
  cause (leak-avoidance); `409` (pending invite exists vs. key conflict)
  distinctly; and surface the backend `request_id` in any user-visible 4xx
  message where present.
  *Anchors:* foundation leak-avoidance design; RF-1 FR-003-007/008 (same
  pattern); `memberships.openapi.yaml` / `tenants.openapi.yaml` error matrix.

### Scope and gates

- **FR-005-010 — No scaffold/package/CI change.** This slice MUST NOT add or
  modify `package.json`, any lockfile, CI workflow, deployment config, or
  `.env*`. RF-5 reuses RF-1's stack and adds no new runtime dependency (OQ-4).
  Any new dependency later found necessary is its own decision recorded in
  `plan.md` and approved per Constitution Principle 9 before implementation.
  *Anchors:* Constitution Principle 9, Principle 10; foundation FR-007, FR-010.

- **FR-005-011 — Foundation & prior-slice immutability.** This slice MUST NOT
  modify any file under `specs/001-console-foundation/`,
  `specs/002-tooling-and-scaffold/`, or `specs/003-rf1-auth-shell/`, the
  constitution, or merged scaffold/RF-1 artifacts. If RF-5 surfaces a defect in a
  prior slice, STOP and open an amendment slice.
  *Anchors:* foundation FR-014; Constitution §Governance.

- **FR-005-012 — Full FR-008 gate before code.** No RF-5 implementation begins
  until all five foundation FR-008 gates are explicitly approved for this slice:
  spec, plan, task list, API dependency map (RF-5 rows confirmed `stable` + the
  OQ-5 client-regen task scheduled), and validation gates. Clearing a gate for
  another slice does not carry over.
  *Anchors:* foundation FR-008; Constitution §Implementation readiness gates.

- **FR-005-013 — No POS surface.** RF-5 MUST NOT contain any POS-operator
  sign-in, roster, takeover, active-session, or terminal-pairing surface, and no
  console call may reach `/api/pos/v1/*`. A6 is never managed in the console.
  *Anchors:* Constitution Principle 3; foundation FR-003; §6.4.

- **FR-005-014 — No mock without approval.** RF-5 tests MUST NOT depend on a live
  Data-Pulse-2 instance (slice 002 C-5). Any mock of the five operations requires
  explicit human approval, a `disposable: true` marking, and a removal task
  (Maestro playbook §Mock rule). This spec does not pre-authorize a mock.
  *Anchors:* slice 002 C-5; Maestro playbook §Mock rule.

---

## 9. Acceptance criteria

This **spec** is acceptable when all of the following hold:

- **AC-1.** All mandatory sections (Header, Background, Goals, Non-goals, Actors,
  Surfaces, Backend dependency, Scenarios, Functional requirements, Acceptance
  criteria, Open questions) are present with concrete content.
- **AC-2.** Exactly the five operations in §6.1 are listed; no sixth operation
  appears, and the five excluded `pos-operators.openapi.yaml` operations are
  explicitly named as excluded (§6.4).
- **AC-3.** The four surfaces SF5-1..SF5-4 are each defined with a one-line
  responsibility, and no surface introduces a frontend authorization decision.
- **AC-4.** Every functional requirement FR-005-001..FR-005-014 is testable and
  anchored to a foundation FR or constitution principle.
- **AC-5.** No section names a router, state library, styling system, component
  library, framework primitive, file path under `src/`, route path, or component
  name. (Naming the *repository*, the *generated-client location* `src/generated/`,
  the slice 002 *stack decisions as fixed context*, and the *RF-1 surfaces*
  SF-1/SF-2/SF-3 *by reference* is allowed; choosing RF-5's own primitives is not.)
- **AC-6.** The backend dependency (§6 + [`api-readiness.md`](./api-readiness.md))
  carries the foundation RF-5 `stable` verification forward by reference; it does
  not re-classify RF-5 optimistically and names the SHA pin (`62d0906`).
- **AC-7.** No byte of Data-Pulse-2 OpenAPI content is copied into any file of
  this slice.
- **AC-8.** The spec quality checklist
  [`checklists/requirements.md`](./checklists/requirements.md) is filled in with
  each item marked, and no failing item is left unaddressed at hand-off.
- **AC-9.** Open questions (§10) name every cross-repo / cross-slice confirmation
  or deferred decision that must resolve before `/speckit-plan` or the FR-008
  implementation gate; the A6 exclusion and the precondition-401 distinction are
  each addressed.

---

## 10. Open questions

These block `/speckit-plan` or the FR-008 implementation gate, not the acceptance
of this spec as a `/speckit-specify` output.

- **OQ-1 — Precondition 401 vs. session-expiry 401.** **RESOLVED (Session
  2026-06-06):** distinct. `createInvitation`/`listMembers` can return `401`
  meaning "no active tenant" (a *precondition*, session still valid) — this MUST
  NOT route through RF-1's sign-out path. The discriminator is whether the RF-1
  reactive single-refresh fails (true expiry → SF-1) vs. succeeds but the call
  still 401s (precondition → RF-1 scope chooser). RF-5 MUST NOT reuse the RF-1
  active-context "status===401 → session-lost" mapping verbatim. Whether the RF-1
  interceptor currently surfaces "did the refresh fail / did the session-lost
  callback fire?" to a downstream caller is a `plan.md` design note (see
  `research.md`). Reconciled into Scenarios S3/S6, FR-005-007.

- **OQ-2 — Public `acceptInvitation` flow in scope?** **RESOLVED (Session
  2026-06-06): yes,** as a distinct public surface SF5-4, a sibling of RF-1's
  public sign-in route (not an A1–A5 admin action). Foundation scopes
  `acceptInvitation` to RF-5. Reconciled into Scenario S7.

- **OQ-3 — Rendering `store_access_kind: "specific"` store names.** **PARTIALLY
  OPEN.** RF-5 renders store **identifiers/count** only; resolving them to human
  store names needs RF-2's `listStores`, an out-of-scope operation. Decision:
  ship id/count display in RF-5; do NOT pull in an RF-2 op (FR-005-001). The
  human-label enhancement is a cross-slice dependency to revisit when RF-2 ships.

- **OQ-4 — RF-5 stack primitives.** **RESOLVED (Session 2026-06-06):** reuse
  RF-1's resolved primitives (router / query cache / data-fetching / form
  handling / error surface — named in `plan.md`/`research.md`, not here per
  AC-5). RF-5 adds **no** new runtime dependency. Any later-found necessity is
  "selected, pending Constitution Principle 9."

- **OQ-5 — Generated-client subset does not yet expose RF-5 ops.** **OPEN
  (resolves at the implementation gate).** The slice-002 client at
  `src/generated/schema.d.ts` (pin `62d0906`) currently exposes only RF-1
  auth+context paths; the five RF-5 operations are not vendored yet. The
  contracts are `stable`; RF-5 implementation requires regenerating the client at
  the pinned SHA to include `tenants/{tenant_id}/members`, `memberships/*`, and
  `invitations/accept`. This is a **gated implementation task** (not a spec
  action, not a re-pin). Recorded in `api-readiness.md`; scheduled as the first
  setup task in `tasks.md`.

- **OQ-6 — Validation-gate definition.** FR-005-012 requires "validation gates
  defined and approved" as the 5th FR-008 gate. RF-5's validation gates (unit
  coverage threshold; the specific Playwright journeys for SF5-1..SF5-4 incl. the
  precondition-401 vs. expiry-401 discriminator; the no-`fetch`-against-DP2-paths
  grep; the no-`/api/pos/v1/*` grep) are defined in `plan.md` / `tasks.md`, not
  here.

---

## 11. Assumptions (informational only)

Recorded so a future reader can challenge them explicitly.

- **AS-1.** The slice 002 stack (React 19 + Vite SPA, TS strict, Vitest +
  Playwright, Biome, generated client at `src/generated/`) and RF-1's resolved
  primitives are fixed context for RF-5. RF-5 consumes them and does not re-open
  those decisions.
- **AS-2.** The Data-Pulse-2 pin `62d0906` (slice 002 C-4) is the contract
  reference RF-5 plans against. A re-pin is a separate change outside this slice;
  regenerating the *existing* pin's client to include RF-5 ops is not a re-pin.
- **AS-3.** The five RF-5 operations are exhaustive for the operator/admin
  membership surface. POS-operator management (A6) is a separate POS-Pulse /
  DP2-POS surface, not RF-5 (FR-005-013).
- **AS-4.** The membership graph is fully server-resolved per request; the
  console holds no authoritative copy (mirrors RF-1's active-context discipline).
- **AS-5.** `MembershipDetail` (from `listMembers`) carries full member identity
  (email, display_name) — intentionally richer than the POS roster's
  minimum-disclosure cashier record, because the console admin surface needs to
  identify members. This is a console-appropriate disclosure level, noted so a
  reviewer sees the contrast is deliberate.

---

## 12. Cross-reference index

- Constitution: `.specify/memory/constitution.md` (v1.0.1)
- Foundation spec: [`specs/001-console-foundation/spec.md`](../001-console-foundation/spec.md) (§4 actors, §5 RF-5 family, FR-002/003/006/007/008/009/010/014)
- Foundation api-readiness: [`specs/001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md) (§RF-5, pin `62d0906`, A6 boundary clean)
- RF-1 slice (attached to): [`specs/003-rf1-auth-shell/spec.md`](../003-rf1-auth-shell/spec.md) (SF-1/2/3, FR-003-003/004/005, Scenario S5)
- Scaffold slice: [`specs/002-tooling-and-scaffold/spec.md`](../002-tooling-and-scaffold/spec.md) (D-1..D-8, C-1..C-8)
- This slice's companions: [`plan.md`](./plan.md), [`research.md`](./research.md), [`data-model.md`](./data-model.md), [`api-readiness.md`](./api-readiness.md), [`contracts/rf5-operator-admin.md`](./contracts/rf5-operator-admin.md), [`design-brief.md`](./design-brief.md), [`quickstart.md`](./quickstart.md), [`checklists/requirements.md`](./checklists/requirements.md), [`tasks.md`](./tasks.md)

---

**End of Feature Specification: RF-5 Operator / Admin Management.**

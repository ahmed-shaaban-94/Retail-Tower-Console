# RF-5 Consumption Boundary (slice 005) — Operator / Admin Management

**Family**: RF-5 — Operator / admin management (foundation `spec.md` §5)
**Slice**: `005-rf5-operator-admin`
**api-readiness state**: All RF-5 rows `stable` (carried forward — see [`../api-readiness.md`](../api-readiness.md))
**Data-Pulse-2 pin**: `62d0906` (slice 002 C-4 — the SHA the generated client is produced against)
**Foundation reference**: [`../../001-console-foundation/api-readiness.md`](../../001-console-foundation/api-readiness.md) §RF-5 (no separate foundation `contracts/rf5-*.md` exists)
**Attaches to**: [`../../003-rf1-auth-shell/contracts/rf1-auth-context.md`](../../003-rf1-auth-shell/contracts/rf1-auth-context.md) (RF-1 active context, reused not re-consumed)

---

## Relationship to the foundation boundary

This is the **slice-level** consumption boundary for RF-5. The foundation set the
boundary in `api-readiness.md` §RF-5 (there is no foundation `contracts/rf5-*.md`
file — confirmed by directory listing of `specs/001-console-foundation/contracts/`,
which holds only `README.md` and `rf1-auth-context.md`). This file **restates the
same five operations** the foundation `api-readiness.md` §RF-5 enumerated and maps
each to the RF-5 surface (SF5-1..SF5-4) that consumes it. Adding any operation
beyond these five is a scope expansion forbidden by spec FR-005-001 / foundation
FR-009.

This file does **NOT** replicate the OpenAPI contract. For request/response
shapes, the implementation reads the generated TypeScript client
(`src/generated/schema.d.ts`) — regenerated at the pinned SHA `62d0906` to include
these operations (see [`../api-readiness.md`](../api-readiness.md) OQ-5). No byte
of `tenants.openapi.yaml`, `memberships.openapi.yaml`, `context.openapi.yaml`, or
`pos-operators.openapi.yaml` is copied here (spec AC-7, Constitution Principle 2).

---

## Operations consumed (the five, mapped to surfaces)

> Convention: `<operationId> | <HTTP method> <path> | <upstream file>`. Upstream
> files are in `Data-Pulse-2/packages/contracts/openapi/`.

### Member list — `tenants.openapi.yaml`

| operationId | HTTP | Surface | RF-5 use |
| --- | --- | --- | --- |
| `listMembers` | `GET /api/v1/tenants/{tenant_id}/members` | SF5-1 | Reads the membership graph for the active tenant. `{tenant_id}` is RF-1's resolved `active_tenant.id` (reused, §RF-1 active context). Renders `MembershipDetail[]` as a table. Documented codes: **200, 404** (no access) only — no precondition 401, no 403. RF-5 guards the active-tenant precondition *before* calling (route to scope chooser when `active_tenant` is null). |

### Membership management — `memberships.openapi.yaml`

| operationId | HTTP | Surface | RF-5 use |
| --- | --- | --- | --- |
| `createInvitation` | `POST /api/v1/memberships/invite` | SF5-2 | Invite an email into the active tenant. **`x-idempotency: required`** — RF-5 sends a client-generated `Idempotency-Key` header (see Idempotency contract below). Documented codes: **`201`(+replay) / `400` / `401`(precondition "No active tenant") / `403` / `409` / `425`**. This is the **only** RF-5 op with a precondition 401 and a 403. |
| `updateMembership` | `PATCH /api/v1/memberships/{membership_id}` | SF5-3 | Change a member's role and/or store-access policy. Documented codes: **`200` / `404`** only (no 403, no precondition 401). `200` → re-fetch `listMembers`. `404` = not found / no access (uniform). |
| `revokeMembership` | `DELETE /api/v1/memberships/{membership_id}` | SF5-3 | Revoke (soft-delete; backend audit-logs). Documented codes: **`204` / `404`** only (no 403, no precondition 401). `204` → re-fetch `listMembers` (member shows `revoked_at`). `404` = not found / no access (uniform). Destructive action (confirmation). |
| `acceptInvitation` | `POST /api/v1/invitations/accept` | SF5-4 | **Public (`security: []`).** A7 (anonymous) invitee accepts an emailed token; a session is established on `200`. Documented codes: **`200` / `400`** (invalid/expired token). Sibling of RF-1's public sign-in route. |

### Reused (NOT re-consumed) — RF-1 active context (`context.openapi.yaml`)

RF-5 **depends on** RF-1's active-context provider for the active tenant id but
does **not** re-consume these operations (they remain RF-1's surface). Listed for
traceability only:

| operationId | HTTP | Why reused |
| --- | --- | --- |
| `getActiveContext` | `GET /api/v1/context/me` | Source of `active_tenant.id` for `listMembers`. RF-5 reads RF-1's projection (SF-3); it does not re-fetch. |
| `switchActiveTenant` | `POST /api/v1/context/tenant` | The RF-1 scope chooser RF-5 routes to on a precondition 401 (no active tenant). RF-5 does not call it directly. |

### Explicitly NOT consumed by RF-5 — the A6 POS-operator surface (`pos-operators.openapi.yaml`)

Named so a reviewer sees they were read and intentionally excluded
(Constitution Principle 3, foundation FR-003, spec FR-005-013), not overlooked.
**No console call reaches `/api/pos/v1/*`.**

- `posOperatorSignIn` — `POST /api/pos/v1/operators/sign-in`
- `posOperatorSignOut` — `POST /api/pos/v1/operators/sign-out`
- `posOperatorRoster` — `GET /api/pos/v1/operators/roster`
- `posOperatorTakeoverConfirm` — `POST /api/pos/v1/operators/takeover/confirm`
- `posOperatorActiveSession` — `GET /api/pos/v1/operators/active-session`

These are Clerk-JWT + device-token-scoped POS terminal operations. The A1–A5
membership graph RF-5 manages is a distinct identity surface (boundary confirmed
clean, foundation `api-readiness.md` §RF-5).

### Also NOT consumed — RF-2 store metadata

`listStores` (`stores.openapi.yaml`, RF-2's boundary) is **not** consumed. RF-5
renders `store_access_kind: "specific"` as store **ids/count**, not human names;
resolving names is a deferred RF-2 dependency (spec OQ-3, FR-005-001).

---

## Idempotency contract — `createInvitation`

`createInvitation` is `x-idempotency: required`. RF-5 MUST (spec §6.3, FR-005-008):

| Situation | RF-5 behavior |
| --- | --- |
| Each invite attempt | Send a client-generated opaque `Idempotency-Key` header (UUIDv7 recommended; format `^[\x21-\x7E]{16,128}$`). **This is a new client-wrapper shape** vs. RF-1's body-only wrappers. |
| `201` with `Idempotent-Replayed: true` | Successful replay of the same request — treat as the same invite, not a duplicate. |
| `409` `idempotency_key_conflict` (same key, different body) | **Terminal** client error — generate a new key; do NOT auto-retry. |
| `409` (pending invite already exists for the email) | Surface "an invitation is already pending for this email"; distinct from the key-conflict 409. |
| `425 Too Early` | Original request still processing — retry after `Retry-After` seconds with the **same** key + body. |

---

## Transport & security posture

Inherited from RF-1's resolved posture (not re-derived):

- **Session transport.** `dp2_session` HttpOnly + Secure + SameSite=Lax cookie set
  by sign-in; browser attaches it on every same-site request. JavaScript never
  reads it (spec FR-005-003).
- **No bearer.** The console MUST NOT attach an `Authorization: Bearer` header;
  the cookie is the only credential. Bearer is for POS / server-to-server use.
- **`Idempotency-Key` is a header, not a credential** (spec FR-005-003).
- **CSRF.** RF-1 resolved (slice 003 OQ-3) that the console-facing scheme is
  `cookieAuth` only (no CSRF token on the auth/context POSTs at this pin). The
  RF-5 mutating ops (`createInvitation` POST, `updateMembership` PATCH,
  `revokeMembership` DELETE) carry the same global `security: [cookieAuth]` and no
  documented CSRF parameter/header at pin `62d0906`. RF-5 inherits RF-1's
  `credentials: "include"` posture with no CSRF plumbing. (Confirm at the
  implementation gate against the regenerated client — `api-readiness.md`.)
- **`acceptInvitation` is `security: []`** (public) — the A7 (anonymous) invitee's
  accept token in the body authenticates the request; no cookie required to reach
  it.

---

## Error contract behavior (RF-5 specifics)

Restated for this slice's FR-005-007/008/009 (read from the contracts, not copied):

- **`listMembers` 404** — no access; rendered uniformly (leak-avoidance, VD-rule).
  (No precondition 401 / no 403 — RF-5 guards the active-tenant precondition
  before the call.)
- **`createInvitation` 400** — `validation_error` / `idempotency_key_required` /
  `idempotency_key_malformed`; render the specific cause distinctly.
- **`createInvitation` 401** — **precondition** "No active tenant" (session still
  valid) → route to RF-1 scope chooser; MUST NOT sign out (spec FR-005-007, OQ-1).
  **This is the only RF-5 op with a precondition 401.**
- **`createInvitation` 403** — insufficient role; render as a permission banner.
  **This is the only RF-5 op with a 403.**
- **`createInvitation` 409** — pending invite exists **or** `idempotency_key_conflict`
  (terminal). Render distinctly per the body's error code.
- **`createInvitation` 425** — Too Early; retry with `Retry-After` (see idempotency).
- **`updateMembership` / `revokeMembership` 404** — not found / no access, rendered
  identically regardless of cause (leak-avoidance). These ops document **only**
  `200`/`204` and `404` — no 403, no precondition 401.
- **`acceptInvitation` 400** — invalid/expired token; render generically.
- **Any 4xx** — surface the backend `request_id` where present in the body.

> **401 disambiguation (the make-or-break rule, scoped to `createInvitation`).**
> RF-1's reactive-refresh interceptor attempts `refreshSession` once on a 401 and
> only signals session-lost if the refresh itself fails. **Only `createInvitation`**
> can return a precondition 401 ("No active tenant"), so RF-5's disambiguation
> wrapper is needed **only on that call**: a 401 where the refresh **succeeds**
> but the retried `createInvitation` still 401s is a precondition and routes to
> the scope chooser, not to sign-in. `listMembers`/`updateMembership`/
> `revokeMembership` 401s are generic auth → standard RF-1 expiry handling; the
> `listMembers` active-tenant precondition is guarded before the call. See
> `plan.md` for the interceptor interaction design note.

---

## What this contract does NOT authorize

- ❌ Implementation of the RF-5 UI. Requires the FR-008 five-gate approval for
  slice 005.
- ❌ Re-choosing a router, state store, data-fetching library, form library, or
  notification surface — RF-5 reuses RF-1's ([`../research.md`](../research.md)).
- ❌ Adding any operation beyond the five above (spec FR-005-001).
- ❌ Consuming any `pos-operators.openapi.yaml` op or RF-2's `listStores`.
- ❌ Vendoring or copying any byte of the upstream OpenAPI contracts.
- ❌ Re-pinning `src/generated/schema.d.ts` (regenerating at the existing pin to
  include RF-5 ops is a gated impl task, not a re-pin — OQ-5).
- ❌ Building a mock server (requires explicit approval; spec FR-005-014).

---

**End of RF-5 Consumption Boundary (slice 005).**

# RF-1 Consumption Boundary (slice 003) — Auth / Session / Context Shell

**Family**: RF-1 — Auth / session / context shell (foundation `spec.md` §5)
**Slice**: `003-rf1-auth-shell`
**api-readiness state**: All three RF-1 rows `stable` (carried forward — see [`../api-readiness.md`](../api-readiness.md))
**Data-Pulse-2 pin**: `62d0906` (slice 002 C-4 — the SHA the generated client at `src/generated/` is produced against)
**Foundation contract**: [`../../001-console-foundation/contracts/rf1-auth-context.md`](../../001-console-foundation/contracts/rf1-auth-context.md)

---

## Relationship to the foundation contract

This is the **slice-level** consumption boundary for RF-1. It does not redefine
the boundary the foundation already set — it **restates the same seven
operations** the foundation `contracts/rf1-auth-context.md` enumerated and maps
each to the RF-1 surface (SF-1/SF-2/SF-3) that consumes it. Adding any operation
beyond these seven is a scope expansion forbidden by spec FR-003-001 / foundation
FR-009.

This file does **NOT** replicate the OpenAPI contract. For request/response
shapes, the implementation reads the generated TypeScript client provided by
slice `002-tooling-and-scaffold` (`src/generated/schema.d.ts`). No byte of
`auth.openapi.yaml` or `context.openapi.yaml` is copied here (spec AC-7,
Constitution Principle 2).

---

## Operations consumed (the seven, mapped to surfaces)

> Convention: `<operationId> | <HTTP method> <path> | <upstream file>`. Upstream
> files are in `Data-Pulse-2/packages/contracts/openapi/`.

### Sign-in / session — `auth.openapi.yaml`

| operationId | HTTP | Surface | RF-1 use |
| --- | --- | --- | --- |
| `signIn` | `POST /api/v1/auth/signin` | SF-1 | Drives ANONYMOUS → AUTHENTICATED. Response `memberships[]` selects the SF-3 branch (0 → no-access; 1 → may auto-select; >1 → chooser). |
| `signOut` | `POST /api/v1/auth/signout` | SF-2 | Fire-and-forget: 204 → cookie cleared by server → navigate to SF-1. 401 → treat as successful sign-out. |
| `refreshSession` | `POST /api/v1/auth/refresh` | SF-2 | Proactive sliding-window extension. Cadence is a `plan.md` decision (spec OQ-2). Does not change AUTHENTICATED-state semantics. |

### Active context — `context.openapi.yaml`

| operationId | HTTP | Surface | RF-1 use |
| --- | --- | --- | --- |
| `getActiveContext` | `GET /api/v1/context/me` | SF-3 | Source of truth. SF-3 caches the result as a read-only projection; no optimistic update. |
| `switchActiveTenant` | `POST /api/v1/context/tenant` | SF-2/SF-3 | Sets active tenant. Backend clears active store — SF-3 mirrors by dropping store-scoped cache (spec FR-003-006). Then re-fetch `getActiveContext`. |
| `switchActiveStore` | `POST /api/v1/context/store` | SF-2/SF-3 | Sets active store. 409 if no active tenant — SF-2 offers a tenant chooser first. Then re-fetch. |
| `clearActiveStore` | `DELETE /api/v1/context/store` | SF-2/SF-3 | Clears active store within the active tenant. Then re-fetch. |

### Explicitly NOT consumed by RF-1 (present in `auth.openapi.yaml`)

Named so a reviewer sees they were considered and intentionally excluded
(spec FR-003-001), not overlooked:

- `requestPasswordReset` / `confirmPasswordReset` — deferred to a later
  user-management slice (likely RF-5).
- `requestEmailVerification` / `confirmEmailVerification` — same.

---

## Transport & security posture

Inherited verbatim-in-intent from the foundation contract (not re-derived):

- **Session transport.** `dp2_session` HttpOnly + Secure + SameSite=Lax cookie
  set by `signIn`; browser attaches it on every same-site request. JavaScript
  never reads it (spec FR-003-003).
- **No bearer.** The console MUST NOT attach an `Authorization: Bearer` header;
  the cookie is the only credential. Bearer is for POS / server-to-server use
  (spec FR-003-003).
- **CSRF — MUST re-verify (OQ-3).** No `X-CSRF-Token` header is documented on the
  consumed POSTs at pin `62d0906` (slice 002 OQ-002-2), but the upstream auth
  plan reserves "double-submit token where needed." RF-1 MUST re-confirm before
  the implementation gate and record the result in [`../api-readiness.md`](../api-readiness.md)
  + `spec.md` OQ-3 (same edit).

---

## Error contract behavior (RF-1 specifics)

Inherits the foundation contract's RF-1 error rules; restated for this slice's
FR-003-007/008:

- **`signIn` 401** — generic ("email or password is incorrect"); MUST NOT reveal
  whether the email exists.
- **`signIn` 429** — render retry-after; disable the submit until the window
  elapses.
- **`signOut` 401** — session already expired; treat as a successful sign-out
  (navigate to SF-1).
- **`switchActiveStore` 409** — no active tenant; SF-2 offers a tenant chooser.
- **Any 4xx** — surface the backend `request_id` (data-model VD-4).
- **Tenant/store 404** — render identically regardless of cause (data-model VD-5).

---

## State transitions consumed

Maps to [`../data-model.md`](../data-model.md) ST-1 (Session lifecycle). SF-3 is
the only driver of ST-1; every RF-2..RF-7 family is downstream of the resulting
AUTHENTICATED (context resolved) state.

---

## What this contract does NOT authorize

- ❌ Implementation of the RF-1 UI. Requires the FR-008 five-gate approval for
  slice 003.
- ❌ Choice of a router, state store, data-fetching library, form library, or
  notification surface — deferred to this slice's `/speckit-clarify`
  ([`../research.md`](../research.md) R3-1..R3-5).
- ❌ Adding any operation beyond the seven above (spec FR-003-001).
- ❌ Vendoring or copying any byte of `auth.openapi.yaml` / `context.openapi.yaml`.
- ❌ Regenerating or re-pinning `src/generated/schema.d.ts`.
- ❌ Building a mock server (requires explicit approval; spec FR-003-012).

---

**End of RF-1 Consumption Boundary (slice 003).**

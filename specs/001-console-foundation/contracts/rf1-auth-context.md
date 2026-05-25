# RF-1 Consumption Boundary — Auth / Session / Context Shell

**Family**: RF-1 — Auth / session / context shell (spec.md §5)
**api-readiness state**: All three rows `draft` (verified 2026-05-25)
**Data-Pulse-2 reference**: `main` @ `b5142fe`
**Upstream slice**: `Data-Pulse-2/specs/001-foundation-auth-tenant-store`
(`sc-verification.md` reports "Foundation milestone complete" at SHA `602ae5c`)

---

## Boundary statement

Retail-Tower-Console consumes the seven operations listed below to
implement the console's auth shell, route guards, and active-context
provider. Every other route family (RF-2..RF-7) attaches to the
provider this family establishes.

This file does NOT replicate the OpenAPI contract. For request /
response shapes, the implementation slice (`003-rf1-auth-shell`) reads
the generated TypeScript client provided by slice
`002-tooling-and-scaffold`.

---

## Operations consumed

> Convention: `<operationId> | <HTTP method> <path> | <upstream file>`.
> All upstream files are in
> `Data-Pulse-2/packages/contracts/openapi/`.

### Sign-in / session

| operationId | HTTP | Upstream file |
| --- | --- | --- |
| `signIn` | `POST /api/v1/auth/signin` | `auth.openapi.yaml` |
| `signOut` | `POST /api/v1/auth/signout` | `auth.openapi.yaml` |
| `refreshSession` | `POST /api/v1/auth/refresh` | `auth.openapi.yaml` |

**Notes:**

- `signIn` returns the user's available memberships (`SignInResponse.memberships`).
  When `memberships.length > 1`, RF-1 MUST show a tenant chooser
  before any RF-2..RF-7 route is reachable. When `memberships.length === 1`,
  RF-1 MAY auto-select that membership and call `switchActiveTenant`.
  When `memberships.length === 0`, RF-1 MUST show a "no access"
  state.
- `signOut` is fire-and-forget on the client side: a 204 means the
  session cookie is cleared by the server; the console then navigates
  to the public sign-in route.
- `refreshSession` is called proactively by the auth shell to extend
  the sliding window. Cadence is decided in slice `003-rf1-auth-shell`.

### Active context

| operationId | HTTP | Upstream file |
| --- | --- | --- |
| `getActiveContext` | `GET /api/v1/context/me` | `context.openapi.yaml` |
| `switchActiveTenant` | `POST /api/v1/context/tenant` | `context.openapi.yaml` |
| `switchActiveStore` | `POST /api/v1/context/store` | `context.openapi.yaml` |
| `clearActiveStore` | `DELETE /api/v1/context/store` | `context.openapi.yaml` |

**Notes:**

- `getActiveContext` is the source of truth. The console caches its
  result but treats the cache as a read-only projection. State changes
  go through the three mutating endpoints, then a re-fetch of
  `getActiveContext`. No optimistic updates (research §R-4).
- `switchActiveTenant` clears `active_store` on the backend. The
  console MUST mirror that (drop any cached store-scoped state on
  tenant switch).
- `switchActiveStore` returns 409 if no active tenant is set. RF-1
  shell MUST sequence "switch tenant first, then switch store"
  appropriately.

### Out of scope for RF-1 (live in `auth.openapi.yaml` but NOT consumed at foundation)

- `requestPasswordReset` / `confirmPasswordReset` — password reset is
  a per-family decision for the eventual user-management slice (likely
  RF-5).
- `requestEmailVerification` / `confirmEmailVerification` — same; not
  consumed by RF-1 at foundation.

These are explicitly named so a future reviewer sees they were
considered and intentionally left out, not overlooked.

---

## Transport & security posture

- **Session transport.** `dp2_session` HttpOnly + Secure + SameSite=Lax
  cookie set by `signIn`. Browser handles transport on every same-site
  request. No JavaScript reads the cookie.
- **CSRF.** Data-Pulse-2's session cookie uses `SameSite=Lax`, which
  blocks cross-site cookie-attached POSTs by default. Additional CSRF
  protection (e.g., a `X-CSRF-Token` header) is **NOT** documented in
  the verified `auth.openapi.yaml`. The implementation slice
  `003-rf1-auth-shell` MUST re-verify whether Data-Pulse-2 expects a
  CSRF token on `POST /api/v1/auth/signin`, `POST /api/v1/auth/signout`,
  `POST /api/v1/auth/refresh`, and the three context-switching POSTs.
  If yes, the slice records the verification in api-readiness.md.
- **Bearer tokens.** `auth.openapi.yaml` declares a `bearerAuth` scheme
  in `components.securitySchemes`. Default security on all paths is
  `cookieAuth`. The console **MUST NOT** attach a bearer token from the
  frontend (it has no token to attach; the cookie is the only credential).
  Bearer is for POS-Pulse or for server-to-server uses outside the
  console's scope.

---

## Error contract behavior (RF-1 specifics)

Inherits from the global error rendering policy in
[`README.md`](./README.md) §Rule 7. RF-1-specific behaviors:

- **`signIn` 401** — invalid credentials. Render the generic 401 ("email
  or password is incorrect") *without* distinguishing whether the email
  exists (the OpenAPI explicitly says the 401 is generic to avoid
  leaking account existence).
- **`signIn` 429** — rate-limited. Render the retry-after notice and
  disable the sign-in submit button until the retry window elapses.
- **`signOut` 401** — not authenticated. This is reachable if the
  session expired between page-load and the sign-out click. Treat as a
  successful sign-out from the user's perspective (navigate to sign-in
  page).
- **`switchActiveStore` 409** — no active tenant. RF-1 shell MUST
  catch this and offer a tenant chooser.

---

## State transitions consumed

Mapped to data-model.md §ST-1 (Session lifecycle). The auth shell is
the *only* component that drives ST-1 transitions; every other family
is downstream of the resulting AUTHENTICATED state.

---

## What this contract does NOT authorize

- ❌ Implementation of the RF-1 UI. That requires slice
  `003-rf1-auth-shell` with full FR-008 gate approval.
- ❌ Choice of a state management library, a routing library, a styling
  system, a component library, or any framework primitive. All
  deferred (research §R-1 through §R-5).
- ❌ Vendoring or copying any byte of `auth.openapi.yaml` or
  `context.openapi.yaml` into this repository.
- ❌ Building a mock server. Mocks require explicit human approval
  per Maestro playbook §Mock rule.

---

**End of RF-1 Consumption Boundary.**

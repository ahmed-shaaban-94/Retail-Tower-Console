# Feature Specification: RF-1 Auth Shell & Active Context

| Field | Value |
| --- | --- |
| Feature ID | 003 |
| Short name | rf1-auth-shell |
| Branch | `003-rf1-auth-shell` |
| Status | Draft |
| Owner | Ahmed Shaaban |
| Mode | Planning-only |
| Created | 2026-06-05 |
| Spec Kit phase | `/speckit-specify` (this document) |
| Foundation slice | [`specs/001-console-foundation`](../001-console-foundation/) (merged) |
| Scaffold slice | [`specs/002-tooling-and-scaffold`](../002-tooling-and-scaffold/) (merged) |

> **Mode contract**: Planning-only. This spec specifies the RF-1 auth shell and
> active-context surface (foundation `spec.md` §5, route family RF-1). It must
> not be used to justify any implementation, component file, route file,
> generated-client regeneration, mock server, CI change, or commit beyond this
> spec document and its companion planning artifacts. Implementation is gated
> by the constitution (`.specify/memory/constitution.md`) and the foundation
> spec's FR-008 five-gate rule. This spec authorizes **no UI code**.

---

## 1. Background and why

Retail-Tower-Console is the admin web frontend in the three-repo Retail Tower
split (Data-Pulse-2 backend / POS-Pulse terminal / Retail-Tower-Console admin).
The foundation slice ([`001-console-foundation`](../001-console-foundation/))
named seven route families RF-1 through RF-7 and established that **RF-1 is a
hard prerequisite for every other family** (foundation `spec.md` §5 sequencing
rule): no RF-2..RF-7 screen is reachable without an authenticated session and a
resolved active tenant/store context.

The scaffold slice ([`002-tooling-and-scaffold`](../002-tooling-and-scaffold/))
authorized the stack (React 19 + Vite 6 SPA, TypeScript strict, Vitest +
Playwright, Biome, GitHub Actions CI) and vendored a generated OpenAPI client at
`src/generated/` from Data-Pulse-2 contracts pinned at SHA `62d0906`.

RF-1 is therefore the **first product-UI slice**. It is the slice that
foundation `quickstart.md` §4 and slice 002 Scenario DS-1 both name
`003-rf1-auth-shell`. This document is its `/speckit-specify` output: it
specifies *what* the auth shell and active-context surface must do, *which*
seven Data-Pulse-2 operations it consumes, and *which* gates must clear before
implementation begins. It does **not** design the UI, choose a router or state
store, or authorize any source file.

### Why now

- RF-1's backend dependency is `stable` (all three rows) per foundation
  `api-readiness.md` §RF-1, verified against Data-Pulse-2 `main` and corroborated
  by the upstream `001-foundation-auth-tenant-store/sc-verification.md`
  (SC-1/SC-3/SC-4/SC-5 Verified). Planning is unblocked.
- The generated client (slice 002, `src/generated/schema.d.ts`) already exposes
  the seven RF-1 operations' types. RF-1 is the slice that first consumes them.
- Every later slice (RF-2..RF-7) attaches to the auth shell and active-context
  provider this slice specifies. Specifying RF-1 once, precisely, prevents each
  later slice from re-deriving the session lifecycle.

---

## 2. Goals

- **G1.** Specify the **auth shell** surface: the sign-in entry point, the
  authenticated application shell, and the public/protected route boundary.
- **G2.** Specify the **active-context provider**: how the console reads the
  server-resolved active tenant/store/role and exposes it (read-only) to every
  downstream family.
- **G3.** Enumerate the **exactly seven** Data-Pulse-2 operations RF-1 consumes,
  with no addition beyond the foundation RF-1 consumption boundary.
- **G4.** Specify the **session lifecycle** behaviors (sign-in, sign-out,
  refresh, expiry, tenant/store switching) as render-side reactions to backend
  truth — never as frontend authorization decisions.
- **G5.** Specify the **error-rendering** behaviors for the status codes RF-1
  encounters (401/403/404/409/429/5xx), inheriting the foundation contract's
  RF-1-specific error rules.
- **G6.** Define the **functional requirements** and **acceptance criteria** any
  RF-1 plan / task list / implementation slice must satisfy.
- **G7.** Record the **open questions** that must resolve before an RF-1
  implementation gate (FR-008) clears.

---

## 3. Non-goals

This spec **does not**:

- Authorize implementation of the RF-1 UI. That requires the foundation
  FR-008 five-gate approval for this slice specifically.
- Choose a router, state-management library, data-fetching library, styling
  system, component library, or form library. Those are RF-1 *plan/clarify*
  decisions (foundation `research.md` R-4 through R-7), recorded in this slice's
  `plan.md` / `/speckit-clarify`, not invented here.
- Create any `src/` file, route file, component, hook, test file, or mock.
- Regenerate, edit, or re-pin `src/generated/schema.d.ts`. The generated client
  is consumed as-is from slice 002's pin (`62d0906`).
- Define, copy, paraphrase, or vendor any byte of Data-Pulse-2's
  `auth.openapi.yaml` or `context.openapi.yaml`. Request/response shapes are
  read from the generated client at implementation time.
- Define backend APIs, authorization logic, database schema, or session storage.
  Those belong to Data-Pulse-2.
- Define POS terminal behavior or any write-path to a POS device.
- Add RF-2..RF-7 screens. They attach to RF-1 but are out of this slice's scope.
- Implement password-reset or email-verification flows. Those operations exist
  in `auth.openapi.yaml` but are **not** consumed by RF-1 (foundation
  `contracts/rf1-auth-context.md` §Out of scope; deferred to RF-5).

---

## 4. Actors

RF-1 is consumed by the authenticated-actor categories defined in the
foundation spec (`001-console-foundation/spec.md` §4). RF-1 itself touches three
of those plus the anonymous category:

| ID | Actor | RF-1 relevance |
| --- | --- | --- |
| A7 | Anonymous / unauthenticated | Can reach **only** the sign-in surface. Every protected route redirects A7 to sign-in. The backend rejects any protected call from A7; the console renders that rejection. |
| A1 | Platform Admin | Signs in via RF-1; may have a cross-tenant membership set. RF-1 renders the `is_platform_admin` flag for display only (no UI unlock — FR-002). |
| A2–A5 | Tenant Owner / Tenant Admin / Store Manager / Store Staff | Sign in via RF-1; select active tenant (and where applicable active store) via the active-context provider. RF-1 surfaces the tenant/store chooser driven by the backend `memberships[]` projection. |
| A6 | POS Device / POS Operator | **Never authenticates against the console.** RF-1 has no POS surface. A6 is named here only to assert its absence from RF-1 (foundation §4 POS boundary rule, FR-003). |

**Authorization rule.** RF-1 never decides whether an actor *may* see or do
something. The backend enforces authorization; RF-1 renders what the backend
returns, including rejections (FR-002, Constitution Principle 7).

---

## 5. Surfaces in scope

RF-1 is one route family but comprises three render-side surfaces. This spec
names them and their responsibilities; **layout, navigation, and interaction
design are deferred to this slice's `plan.md`** (no wireframes here).

| ID | Surface | Responsibility |
| --- | --- | --- |
| SF-1 | Sign-in surface | The public entry point. Collects credentials, calls `signIn`, and reacts to the response (success → context resolution; 401 → generic error; 429 → retry-after). The only surface reachable by A7. |
| SF-2 | Authenticated app shell | The cross-app frame that wraps every RF-2..RF-7 screen. Renders the current user, the active tenant/store context indicator, the sign-out control, and the tenant/store chooser. Hosts the active-context provider (SF-3). |
| SF-3 | Active-context provider | The render-side projection of the server-resolved active context. Reads `getActiveContext`, treats the result as a read-only cache, and drives context changes through the three mutating context endpoints followed by a re-fetch. Exposed to downstream families as read-only state. |

**Route-guard rule.** The boundary between SF-1 (public) and SF-2/SF-3
(protected) is enforced by *rendering backend truth*: a protected route that
receives a 401 from any consumed endpoint routes the caller back to SF-1. The
console MUST NOT carry its own authorization opinion about which routes an actor
may reach (FR-002). The route-guard *mechanism* (how the SPA wires this) is a
`plan.md` decision; the *behavior* (401 → sign-in) is specified here.

---

## 6. Backend dependency — RF-1 consumption boundary

RF-1 consumes **exactly seven** Data-Pulse-2 operations. This set is the
foundation RF-1 consumption boundary
([`001-console-foundation/contracts/rf1-auth-context.md`](../001-console-foundation/contracts/rf1-auth-context.md));
this slice does not add to it. Adding an operation is an FR-009 scope expansion
that requires a foundation amendment, not a line in this spec.

The detailed consumption boundary for this slice lives in
[`contracts/rf1-auth-context.md`](./contracts/rf1-auth-context.md). Operations
are named only (operationId + method + path + upstream file); request/response
shapes are read from the generated client (`src/generated/schema.d.ts`, slice
002 pin `62d0906`), never copied here.

| # | operationId | HTTP | Upstream file | Surface |
| --- | --- | --- | --- | --- |
| 1 | `signIn` | `POST /api/v1/auth/signin` | `auth.openapi.yaml` | SF-1 |
| 2 | `signOut` | `POST /api/v1/auth/signout` | `auth.openapi.yaml` | SF-2 |
| 3 | `refreshSession` | `POST /api/v1/auth/refresh` | `auth.openapi.yaml` | SF-2 |
| 4 | `getActiveContext` | `GET /api/v1/context/me` | `context.openapi.yaml` | SF-3 |
| 5 | `switchActiveTenant` | `POST /api/v1/context/tenant` | `context.openapi.yaml` | SF-2/SF-3 |
| 6 | `switchActiveStore` | `POST /api/v1/context/store` | `context.openapi.yaml` | SF-2/SF-3 |
| 7 | `clearActiveStore` | `DELETE /api/v1/context/store` | `context.openapi.yaml` | SF-2/SF-3 |

**Readiness.** All three RF-1 readiness rows are `stable` per foundation
`api-readiness.md` §RF-1 (verified against Data-Pulse-2 `main`; corroborated by
upstream `sc-verification.md`). This slice's
[`api-readiness.md`](./api-readiness.md) carries that verification forward — it
does **not** re-derive or optimistically re-classify it. One residual
re-verification (CSRF posture on the POSTs) is recorded as OQ-3.

---

## 7. User scenarios

Illustrative of *why* RF-1 exists. Not UX flows; they do not constrain layout.

### Scenario S1 — Single-membership sign-in

A4 (Store Manager, one membership) opens the console, lands on SF-1, and signs
in. `signIn` returns one membership. SF-3 auto-selects it
(`switchActiveTenant`), re-fetches `getActiveContext`, and SF-2 renders the app
shell with that tenant active. (Auto-select on `memberships.length === 1` is
permitted by the foundation contract; final cadence is a `plan.md` decision.)

### Scenario S2 — Multi-membership tenant chooser

A1 (Platform Admin) signs in. `signIn` returns N memberships. SF-2 shows a
tenant chooser before any RF-2..RF-7 route is reachable. On selection, SF-3
calls `switchActiveTenant`, then re-fetches `getActiveContext`.

### Scenario S3 — Store switch within a tenant

A3 (Tenant Admin) with an active tenant switches active store. SF-3 calls
`switchActiveStore`. If no active tenant is set, the backend returns 409; SF-2
catches it and surfaces the tenant chooser first (foundation contract
`switchActiveStore` 409 rule).

### Scenario S4 — Tenant switch clears store

A3 switches active tenant while a store is active. The backend clears the active
store on tenant switch; SF-3 mirrors that by dropping any cached store-scoped
state (foundation contract `switchActiveTenant` note). No optimistic update —
SF-3 re-fetches `getActiveContext` as source of truth.

### Scenario S5 — Session expiry mid-session

A2's session expires while on an RF-2 screen. The next consumed call returns
401. The console's client intercepts it, SF-3 drops cached context, and the
caller is routed to SF-1. This is rendering of backend truth, not a frontend
authorization decision (FR-002).

### Scenario S6 — Sign-out

A5 clicks sign-out. SF-2 calls `signOut`; a 204 means the backend cleared the
session cookie, and the console navigates to SF-1. A `signOut` 401 (session
already expired) is treated as a successful sign-out from the user's
perspective (foundation contract `signOut` 401 rule).

### Scenario S7 — No-access identity

A user with zero memberships signs in. `signIn` returns `memberships.length ===
0`. SF-2 renders a "no access" state with a sign-out option (data-model VD-2).
No RF-2..RF-7 route is reachable.

---

## 8. Functional requirements

Each is testable against this slice's plan, tasks, or implementation, and
anchored to a foundation FR or constitution principle.

### Consumption boundary

- **FR-003-001 — Exactly-seven consumption.** RF-1's implementation MUST consume
  exactly the seven operations in §6 and no others. The four out-of-scope
  `auth.openapi.yaml` operations (`requestPasswordReset`, `confirmPasswordReset`,
  `requestEmailVerification`, `confirmEmailVerification`) MUST NOT be consumed by
  this slice.
  *Anchors:* foundation FR-009; foundation `contracts/rf1-auth-context.md`.

- **FR-003-002 — Generated-client only.** RF-1 MUST call the seven operations
  through the generated client at `src/generated/` (slice 002). No hand-rolled
  `fetch`/XHR targeting a Data-Pulse-2 path is permitted. No OpenAPI byte is
  copied into this repo.
  *Anchors:* Constitution Principle 8; foundation FR-006; slice 002 C-3.

- **FR-003-003 — Cookie transport, no bearer.** RF-1 MUST rely on the
  `dp2_session` HttpOnly+Secure+SameSite=Lax cookie that the browser attaches
  automatically. JavaScript MUST NOT read the cookie, and the console MUST NOT
  attach an `Authorization: Bearer` header (the bearer scheme is for POS /
  server-to-server use, not the console).
  *Anchors:* foundation `contracts/rf1-auth-context.md` §Transport; slice 002 C-2.

### Backend-enforced authorization

- **FR-003-004 — No frontend authorization.** RF-1 MUST NOT contain any logic
  that decides whether the current actor may see or modify data, or may reach a
  route. Route guards react to backend responses (e.g., 401 → sign-in); they do
  not pre-judge access. The `is_platform_admin` flag and `role_code` are
  rendered for display only.
  *Anchors:* Constitution Principle 7; foundation FR-002.

- **FR-003-005 — Active context is server-resolved.** The active tenant/store/role
  is whatever `getActiveContext` returns. SF-3 treats it as a read-only
  projection: context changes go through `switchActiveTenant` /
  `switchActiveStore` / `clearActiveStore` followed by a re-fetch of
  `getActiveContext`. No optimistic local mutation of active context.
  *Anchors:* foundation `data-model.md` E-3, ST-1; research R-4.

- **FR-003-006 — Tenant switch clears store.** When `switchActiveTenant` runs,
  SF-3 MUST drop any cached store-scoped state, mirroring the backend's
  store-clear-on-tenant-switch behavior.
  *Anchors:* foundation `contracts/rf1-auth-context.md` `switchActiveTenant` note;
  foundation `data-model.md` E-3 reset rule.

### Error rendering

- **FR-003-007 — RF-1 error behaviors.** RF-1 MUST render the foundation
  contract's RF-1-specific error behaviors: `signIn` 401 generic (no account-
  existence leak), `signIn` 429 retry-after with disabled submit, `signOut` 401
  treated as successful sign-out, `switchActiveStore` 409 → offer tenant chooser.
  All 4xx responses surface the backend `request_id` in the user-visible message.
  *Anchors:* foundation `contracts/rf1-auth-context.md` §Error contract;
  foundation `data-model.md` VD-4.

- **FR-003-008 — Uniform 404.** RF-1 MUST render tenant/store 404 responses
  identically regardless of cause (resource absent vs. no access), per the
  backend's leak-avoidance design.
  *Anchors:* foundation `data-model.md` VD-5; Constitution Principle 7.

### Scope and gates

- **FR-003-009 — No scaffold/package/CI change.** This slice MUST NOT add or
  modify `package.json`, any lockfile, CI workflow, deployment config, or
  `.env*`. The stack is fixed by slice 002; RF-1 consumes it. Any new runtime
  dependency (e.g., a router) is its own decision recorded in this slice's
  `plan.md` and approved per Constitution Principle 9 before implementation.
  *Anchors:* Constitution Principle 9, Principle 10; foundation FR-007, FR-010.

- **FR-003-010 — Foundation immutability.** This slice MUST NOT modify any file
  under `specs/001-console-foundation/` or `specs/002-tooling-and-scaffold/`, the
  constitution, or slice 002's committed scaffold artifacts. If RF-1 surfaces a
  foundation defect, STOP and open an amendment slice.
  *Anchors:* foundation FR-014; Constitution §Governance.

- **FR-003-011 — Full FR-008 gate before code.** No RF-1 implementation begins
  until all five foundation FR-008 gates are explicitly approved for this slice:
  spec, plan, task list, API dependency map (RF-1 rows confirmed `stable`), and
  validation gates. Clearing a gate for another slice does not carry over.
  *Anchors:* foundation FR-008; Constitution §Implementation readiness gates.

- **FR-003-012 — No mock without approval.** RF-1 tests MUST NOT depend on a
  live Data-Pulse-2 instance (slice 002 C-5). Any mock of the seven operations
  requires explicit human approval, a `disposable: true` marking, and a removal
  task (Maestro playbook §Mock rule). This spec does not pre-authorize a mock.
  *Anchors:* slice 002 C-5; Maestro playbook §Mock rule.

### POS boundary

- **FR-003-013 — No POS surface.** RF-1 MUST NOT contain any POS sign-in,
  terminal-pairing, or POS-operator surface. A6 never authenticates against the
  console. No console call writes back to a POS device.
  *Anchors:* Constitution Principle 3; foundation FR-003, §4 POS boundary rule.

---

## 9. Acceptance criteria

This **spec** is acceptable when all of the following hold:

- **AC-1.** All mandatory sections (Header, Background, Goals, Non-goals, Actors,
  Surfaces, Backend dependency, Scenarios, Functional requirements, Acceptance
  criteria, Open questions) are present with concrete content.
- **AC-2.** Exactly the seven operations in §6 are listed; no eighth operation
  appears, and the four out-of-scope auth operations are explicitly named as
  excluded.
- **AC-3.** The three surfaces SF-1/SF-2/SF-3 are each defined with a one-line
  responsibility, and no surface introduces a frontend authorization decision.
- **AC-4.** Every functional requirement FR-003-001..FR-003-013 is testable and
  anchored to a foundation FR or constitution principle.
- **AC-5.** No section names a router, state library, styling system, component
  library, framework primitive, file path under `src/`, route path, or component
  name. (Naming the *repository*, the *generated-client location* `src/generated/`,
  and the slice 002 *stack decisions as fixed context* is allowed; choosing
  RF-1's own router/state primitives is not.)
- **AC-6.** The backend dependency (§6 + [`api-readiness.md`](./api-readiness.md))
  carries the foundation RF-1 `stable` verification forward by reference; it does
  not re-classify RF-1 optimistically and names the SHA pin (`62d0906`).
- **AC-7.** No byte of Data-Pulse-2 OpenAPI content is copied into any file of
  this slice.
- **AC-8.** The spec quality checklist
  [`checklists/requirements.md`](./checklists/requirements.md) is filled in with
  each item marked, and no failing item is left unaddressed at hand-off.
- **AC-9.** Open questions (§10) name every cross-repo confirmation or deferred
  decision that must resolve before `/speckit-plan` or the FR-008 implementation
  gate.

---

## 10. Open questions

These block `/speckit-plan` or the FR-008 implementation gate, not the
acceptance of this spec as a `/speckit-specify` output.

- **OQ-1 — Router / state / data-fetching primitives.** RF-1 needs a route
  guard, an active-context store, and a data-fetching strategy for the seven
  operations. The choice of router, state library, and data-fetching library is
  foundation `research.md` R-4..R-7 territory, deferred to this slice. It MUST be
  resolved in `/speckit-clarify` / `plan.md` (and any new dependency approved per
  Constitution Principle 9) before implementation. This spec does not pick them.

- **OQ-2 — `refreshSession` cadence.** The foundation contract leaves the proactive
  refresh cadence to this slice. What triggers a proactive `refreshSession`
  (timer, on-focus, on-401-retry-once)? Resolved in `plan.md`; it does not change
  the AUTHENTICATED-state semantics (foundation `data-model.md` ST-1).

- **OQ-3 — CSRF posture on the six POSTs + one DELETE.** Foundation
  `contracts/rf1-auth-context.md` flags a MUST-re-verify: does Data-Pulse-2
  expect a CSRF token (e.g., double-submit) on `signin` / `signout` / `refresh`
  and the three context-mutating endpoints? Slice 002 OQ-002-2 found no
  `X-CSRF-Token` header on any console-facing contract at pin `62d0906`, but the
  upstream auth plan reserves "double-submit token where needed." This MUST be
  re-confirmed against the pinned contract before the RF-1 implementation gate
  clears; if a token is required, the resolution is recorded in this slice's
  `api-readiness.md`.

- **OQ-4 — Auto-select-on-single-membership behavior.** When
  `memberships.length === 1`, the foundation contract permits (does not require)
  auto-selecting the membership. Should RF-1 auto-select, or always show the
  chooser? A `plan.md`/clarify decision; it is a UX behavior, not a backend
  contract question.

- **OQ-5 — Validation-gate definition.** FR-003-011 requires "validation gates
  defined and approved" as the 5th FR-008 gate. What are RF-1's validation gates
  (unit coverage threshold, the specific Playwright journeys for SF-1/SF-2/SF-3,
  the no-`fetch`-against-DP2-paths grep)? Defined in `plan.md` / `tasks.md`, not
  here.

---

## 11. Assumptions (informational only)

Recorded so a future reader can challenge them explicitly.

- **AS-1.** The slice 002 stack (React 19 + Vite SPA, TS strict, Vitest +
  Playwright, Biome, generated client at `src/generated/`) is fixed context for
  RF-1. RF-1 consumes it and does not re-open those decisions.
- **AS-2.** The Data-Pulse-2 pin `62d0906` (slice 002 C-4) is the contract
  reference RF-1 plans against. A re-pin is a separate change outside this slice.
- **AS-3.** The seven RF-1 operations are exhaustive for the auth shell and
  active-context surface. Additional auth surfaces (password reset, email
  verification) belong to a later slice (likely RF-5), not RF-1 (FR-003-001).
- **AS-4.** Active context is fully server-resolved per request; the console
  holds no authoritative copy (foundation `data-model.md` E-3).

---

## 12. Cross-reference index

- Constitution: `.specify/memory/constitution.md` (v1.0.1)
- Foundation spec: [`specs/001-console-foundation/spec.md`](../001-console-foundation/spec.md) (§4 actors, §5 RF-1 sequencing, FR-002/003/006/007/008/009/010/014)
- Foundation RF-1 contract: [`specs/001-console-foundation/contracts/rf1-auth-context.md`](../001-console-foundation/contracts/rf1-auth-context.md)
- Foundation data-model: [`specs/001-console-foundation/data-model.md`](../001-console-foundation/data-model.md) (E-1/E-2/E-3, ST-1, VD-1..VD-5)
- Foundation api-readiness: [`specs/001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md) (§RF-1, pin `62d0906`)
- Scaffold slice: [`specs/002-tooling-and-scaffold/spec.md`](../002-tooling-and-scaffold/spec.md) (D-1..D-8, C-1..C-8, OQ-002-2)
- This slice's companions: [`plan.md`](./plan.md), [`research.md`](./research.md), [`data-model.md`](./data-model.md), [`api-readiness.md`](./api-readiness.md), [`contracts/rf1-auth-context.md`](./contracts/rf1-auth-context.md), [`quickstart.md`](./quickstart.md), [`checklists/requirements.md`](./checklists/requirements.md)

---

**End of Feature Specification: RF-1 Auth Shell & Active Context.**

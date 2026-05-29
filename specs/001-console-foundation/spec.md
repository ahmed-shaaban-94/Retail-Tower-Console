# Feature Specification: Console Foundation

| Field | Value |
| --- | --- |
| Feature ID | 001 |
| Short name | console-foundation |
| Branch | `001-console-foundation` |
| Status | Draft |
| Owner | Ahmed Shaaban |
| Mode | Planning-only |
| Created | 2026-05-25 |
| Spec Kit phase | `/speckit-specify` (this document) |

> **Mode contract**: Planning-only. This spec must not be used to justify any
> implementation, scaffold, package file, generated client, CI configuration,
> deployment configuration, or commit beyond this spec document and its
> validation checklist. Implementation is gated by the constitution
> (`.specify/memory/constitution.md`) and the Maestro playbook
> (`docs/agent-os/maestro-playbook.md`).

---

## 1. Background and why

Retail-Tower-Console is the future admin web console for Retail Tower OS. It is
the third repository in a three-repo product split:

- **Data-Pulse-2** — backend APIs, OpenAPI contracts, database schema, SQL
  migrations, workers, and audit ingestion. Authoritative source of truth for
  every server-side contract Retail-Tower-Console will consume.
- **POS-Pulse** — POS terminal application: Electron code, local SQLite,
  hardware pairing, terminal sessions, and POS-side runtime logic. Emits the
  events and unknown-item captures that the console will later let admins
  triage.
- **Retail-Tower-Console** — this repository. Admin web frontend only. Consumes
  Data-Pulse-2 contracts via a generated API client. Does not own backend,
  schema, POS, infrastructure, or analytics.

Today, Retail-Tower-Console is planning-only. No application code, framework
scaffold, package files, generated clients, CI, or deployment configuration
exists. Before any UI is implemented, the product needs a single foundational
specification that:

1. Names every admin route family the console will eventually own.
2. Names every actor that will interact with each family.
3. Records, for each family, the current readiness of the backend contract it
   depends on — without guessing or copying contracts into this repo.
4. Establishes the readiness gates that must clear before any route family
   moves from `planning/spec` to `implementation`.

This document is that foundational specification. It is the input to
`/speckit-plan` and to every subsequent per-route-family slice. It does not
itself authorize implementation of any route family.

### Why now

- The constitution, charter, repo-boundary matrix, Agent OS standing rules, and
  Maestro playbook are in place. The next planning artifact in the chain is a
  named, ID-tagged specification of the console's foundational surface.
- Future per-screen slices (e.g., `002-tenant-management`,
  `003-catalog-management`) will reference this foundation rather than
  re-deriving actors, route families, or dependency posture each time.
- Backend readiness against the route families named here is uneven; recording
  the current dependency posture once, in writing, prevents per-slice guessing
  later.

---

## 2. Goals

- **G1.** Enumerate the seven route families the console will own, with a
  one-line definition of each.
- **G2.** Enumerate the seven actor categories that will interact with the
  console, with a one-line definition of each.
- **G3.** Record, for every route family, the current backend dependency
  posture (`stable` / `draft` / `blocked` / `unknown`) without guessing and
  without copying Data-Pulse-2 contract details into this repo.
- **G4.** Define the functional requirements that any per-route-family slice
  must satisfy before its `planning/spec` slice closes.
- **G5.** Define the acceptance criteria that mark this foundation spec itself
  as ready for `/speckit-plan`.
- **G6.** Capture the open questions that block movement of specific route
  families from `planning/spec` toward implementation.

---

## 3. Non-goals

This spec **does not**:

- Authorize implementation of any route family.
- Choose a frontend framework, build tool, package manager, router, state
  store, styling system, design system, or testing framework.
- Create `package.json`, lockfiles, `src/`, route files, components, generated
  API client code, OpenAPI source contracts, CI configuration, deployment
  configuration, or `.env` files.
- Define backend APIs, database schema, SQL migrations, worker logic, or audit
  ingestion behavior. Those belong to Data-Pulse-2.
- Define POS terminal behavior, local SQLite schema, hardware pairing, or
  terminal-session UX. Those belong to POS-Pulse.
- Reproduce, copy, or paraphrase any Data-Pulse-2 OpenAPI contract. The console
  will consume the generated client; the contract source stays upstream.
- Define UX flows, screen layouts, wireframes, or interaction details. Those
  belong to per-route-family specs that come after this one.
- Define quantitative performance, scale, or SLO targets. Those belong with the
  per-route-family specs and the eventual implementation plan.

---

## 4. Actors

The console serves seven actor categories. Authorization for every actor is
**enforced by Data-Pulse-2** (see FR-002); the console must not replicate,
shadow, or work around backend authorization.

| ID | Actor | Definition | Direct user of console? |
| --- | --- | --- | --- |
| A1 | Platform Admin | Operator of the Retail Tower OS platform itself. Cross-tenant. Manages tenants, system-wide settings, and platform-level audit. | Yes |
| A2 | Tenant Owner | Highest-privileged identity inside a single tenant. Owns tenant configuration, store provisioning, and tenant-scoped admin staff. | Yes |
| A3 | Tenant Admin | Tenant-scoped administrative identity delegated by a Tenant Owner. Manages stores, catalog, operators, and tenant-scoped audit/search. | Yes |
| A4 | Store Manager | Store-scoped identity. Manages a specific store's catalog, unknown items, store-level operators, and store-scoped audit/search. | Yes |
| A5 | Store Staff | Store-scoped identity with restricted operational access. Read-mostly: views catalog, reviews unknown items, looks up audit entries within store scope. | Yes |
| A6 | POS Device / POS Operator | POS terminal and the operator using it. **Indirect actor only.** Produces the events, unknown-item captures, and audit entries that A1–A5 later review in the console. Never logs into the console. | **No** — indirect data producer only |
| A7 | Anonymous / unauthenticated | Any caller that has not completed the auth handshake. Can reach only the auth/session entry points. All other route families MUST reject this actor at the backend. | Limited — auth surface only |

**Tenant/store scoping rule.** Actors A2–A5 see a tenant-scoped (and where
applicable store-scoped) slice of every route family. Data-Pulse-2 enforces
the scope; the console only renders what the backend returns.

**POS boundary rule.** Actor A6 never authenticates against the console. The
console renders data produced by A6 (via the backend) but never sends data back
to a POS device. Any feature that appears to do so triggers the POS-Pulse
boundary stop rule (Maestro playbook §Cross-repo checks).

---

## 5. Product route families

The console will eventually own seven route families. This spec only **names**
them; per-family route layouts, page lists, and component breakdowns are out
of scope here and belong to per-family specs.

| ID | Route family | One-line definition |
| --- | --- | --- |
| RF-1 | Auth / session / context shell | Sign-in surface, session lifecycle, and the cross-app shell that renders the active tenant/store context for every other family. |
| RF-2 | Tenant / store management | Create, view, and configure tenants and the stores within them. |
| RF-3 | Catalog management | View and manage the product catalog scoped to a tenant or store. |
| RF-4 | Unknown items review | Triage POS-captured items that did not match the catalog. Supports list, dismiss, link-to-existing, and create-new-from-unknown actions. |
| RF-5 | Operator / admin management | View and manage the identities that belong to A1–A5 (excluding A6 POS operators, which are POS-Pulse-owned). |
| RF-6 | Audit / search | Search and inspect audit entries and operational events emitted by the backend (including POS-originated events). |
| RF-7 | Settings / system management | Tenant-level, store-level, and (for A1) platform-level configuration surfaces. |

**Sequencing rule.** RF-1 is a hard prerequisite for every other family — no
RF-2 through RF-7 screen can be reached without an authenticated session and
an active tenant/store context. This is a sequencing fact about the spec, not
a UI design decision.

---

## 6. Backend dependency map

This map records the **current** posture of each route family's backend
dependency, as understood by this repository at the time of writing. It does
**not** copy contract details from Data-Pulse-2 and does **not** guess at
contract shape.

**Status legend** (per user instruction; do not invent additional statuses):

- `stable` — Backend contract verified present and stable in Data-Pulse-2
  `main`, by name and surface. Safe to plan a UI slice against.
- `draft` — Backend contract exists but is incomplete, in active change, or
  has open contract questions. UI may begin planning but **must** re-check
  before any implementation gate clears.
- `blocked` — Backend contract is known to be absent, deferred, or
  intentionally not yet started. UI must not plan implementation against this
  surface yet.
- `unknown` — This repository cannot confirm the contract's current state from
  inside its own boundary. Cross-repo confirmation against Data-Pulse-2 `main`,
  OpenAPI source, and active wave-status files is required before any
  per-family slice opens.

**Rule of this spec**: where the status cannot be confirmed without reading
Data-Pulse-2, the status is `unknown`. Optimistic guesses are forbidden by
the constitution (Principle 2, "Data-Pulse-2 contract authority").

| Route family | Required backend surface (named only, not specified) | Status | Notes |
| --- | --- | --- | --- |
| RF-1 Auth / session / context shell | Sign-in/session endpoint; active tenant/store context endpoint | `stable` | Verified 2026-05-25 against Data-Pulse-2 `main` @ `b5142fe`: `auth.openapi.yaml` (signIn / signOut / refreshSession, cookie-based `dp2_session`) and `context.openapi.yaml` (getActiveContext / switchActiveTenant / switchActiveStore / clearActiveStore). Promoted from `draft` to `stable` on 2026-05-25 per `api-readiness.md` §Status legend Version-suffix convention rule, on the strength of Data-Pulse-2 `specs/001-foundation-auth-tenant-store/sc-verification.md` ("Foundation milestone complete" at SHA `602ae5c`; SC-1 / SC-3 / SC-4 / SC-5 directly Verified). `-draft` suffix is a Data-Pulse-2 repo-wide convention, not a stability marker. Full record: [`api-readiness.md`](./api-readiness.md) §RF-1 + Verification log entries "2026-05-25 — RF-1 verification (OQ-1)" and "2026-05-25 — RF-4a verification". |
| RF-2 Tenant / store management | Tenant CRUD; store CRUD; tenant/store list scoped to actor | `stable` | Verified 2026-05-30 against Data-Pulse-2 `main` @ `62d0906`: `tenants.openapi.yaml` (listTenants / readTenant / createTenant / updateTenant / softDeleteTenant) + `stores.openapi.yaml` (listStores / readStore / createStore / updateStore / softDeleteStore) + `context.openapi.yaml` membership graph; foundation `sc-verification.md` SC-1/SC-2/SC-3 Verified. Full record: [`api-readiness.md`](./api-readiness.md) §RF-2 + 2026-05-30 Verification log. |
| RF-3 Catalog management | Catalog read; catalog write; catalog scope by tenant/store | `blocked` | Verified-absent 2026-05-30 against Data-Pulse-2 `main` @ `62d0906`: no standalone catalog-management contract exists (the `catalog/` dir holds only `unknown-items.yaml`); `specs/003-catalog-foundation` is specification-only. Catalog foundation/spec material is **not** an implementation-ready API — not promoted to `stable`. Re-check when DP2 ships a catalog-management contract. [`api-readiness.md`](./api-readiness.md) §RF-3. |
| RF-4a Unknown items — list / dismiss / inspect / filter / sort / group | List unknown items; dismiss; inspect single; filter/sort/group the review queue | `draft` | Evidence refreshed 2026-05-30 against Data-Pulse-2 `main` @ `62d0906`: `catalog/unknown-items.yaml` now **v1.2.0-draft** with list/dismiss/inspect + `source_system`/`sort`/`group_by` + `ReviewQueueItem` + `forbidden` present in the committed contract. Stays `draft` — load-bearing reason is the **absence of an upstream `sc-verification.md`** for this surface (the §Status legend rule caps it at `draft` regardless of runtime). **reopen** and **bulk-dismiss** are contract-on-main but their runtime is confirmed **absent in committed `main`** (no controller route at HEAD) — gated. [`api-readiness.md`](./api-readiness.md) §RF-4a. |
| RF-4b Unknown items — link / create-new reconciliation | Link unknown item to existing catalog row; create new catalog row from unknown item | `draft` | **Promoted `blocked` → `draft` on 2026-05-30 on verified evidence.** Verified against Data-Pulse-2 `main` @ `62d0906`: `tenantAdminLinkUnknownItem` + `tenantAdminCreateProductFromUnknownItem` present in the committed contract (v1.2.0-draft) **and** their runtime is merged on `main` (committed `reconciliation.controller.ts` carries both `:id/link` and `:id/create-product` routes, Zod-validated + role-gated + `@Auditable`). FR-012 does **not** gate `blocked` → `draft` (both are inside its permitted band), so the merge alone justifies the move. Held at `draft` not `stable` **because FR-012's stable-confirmation is unmet** — no upstream `sc-verification.md` for the catalog/unknown-items surface (re-verify before impl gate, FR-005). **SD-1 (§11) stays deferred** — RF-4b remains out of the first-pass plan until a separate owner amendment closes it. [`api-readiness.md`](./api-readiness.md) §RF-4b + 2026-05-30 Verification log. |
| RF-5 Operator / admin management | Identity list/detail for A1–A5; role/scope assignment surface | `stable` | Verified 2026-05-30 against Data-Pulse-2 `main` @ `62d0906`: `tenants.openapi.yaml` (listMembers) + `memberships.openapi.yaml` (createInvitation / updateMembership / revokeMembership / acceptInvitation); sc-verification SC-6 Verified. **Boundary confirmed clean:** the A6 POS-operator surface is the separate `pos-operators.openapi.yaml` (`/api/pos/v1/operators/*`, Clerk JWT) — POS operator management is **not** in console scope (FR-003). [`api-readiness.md`](./api-readiness.md) §RF-5. |
| RF-6 Audit / search | Audit query surface; operational-event search surface | `stable` (audit query + operational-event search) / `draft` (POS-originated event surface) | Verified 2026-05-30 against Data-Pulse-2 `main` @ `62d0906`: `audit.openapi.yaml` (`listAuditEvents`) provides tenant-scoped audit query + operational-event search; sc-verification SC-7 Verified — these rows `stable`. The **POS-originated event surface** is now `draft` (OQ-5 resolved via dual-repo verification): DP2 `pos-audit-events.openapi.yaml` persists a closed POS event catalogue (`shift.*`, `operator.session.takeover`, `cashier.pin.*`) to the same `audit_events` table `listAuditEvents` reads, and POS-Pulse `specs/004-operator-session` (Endpoint 5, `main` @ `c9fd404`) emits the identical catalogue. `draft` not `stable`: `pos-audit-events.openapi.yaml` is `v1.0.0-draft`, no sc-verification, append-only catalogue. POS-originated events are read-only on this side (FR-003). [`api-readiness.md`](./api-readiness.md) §RF-6. |
| RF-7 Settings / system management | Tenant/store config surfaces; platform-level config surface for A1 | `blocked` | Verified-absent 2026-05-30 against Data-Pulse-2 `main` @ `62d0906`: no settings/system-configuration contract exists. (`TenantUpdate`/`StoreUpdate` expose name/status only — administration, not a general settings surface.) Re-check when DP2 ships a settings contract. Platform surfaces remain A1-only when they ship. [`api-readiness.md`](./api-readiness.md) §RF-7. |

**Mandatory follow-up.** Every `unknown` row above MUST be resolved to one of
`stable` / `draft` / `blocked` **before** the corresponding per-family spec
opens. Resolution is recorded in the per-family spec's API dependency map, not
in this document.

---

## 7. User scenarios

These scenarios are illustrative of *why* each route family exists from an
actor's point of view. They are not UX flows and do not constrain layout,
navigation, or interaction design.

### Scenario S1 — Platform Admin onboards a new tenant

A1 signs in (RF-1), creates a new tenant and its first store (RF-2), and
provisions the Tenant Owner identity (RF-5). All of this happens against
Data-Pulse-2 contracts; the console renders backend responses.

### Scenario S2 — Tenant Admin manages catalog and reviews unknown items

A3 signs in (RF-1), selects the active store context (RF-1), reviews and
edits the catalog (RF-3), then opens the unknown items queue (RF-4) to
dismiss noise and (when reconciliation is unblocked) link or create-new from
captured items.

### Scenario S3 — Store Manager investigates a POS-originated event

A4 signs in (RF-1), opens audit/search (RF-6) scoped to their store, and
inspects an operational event emitted by a POS-Pulse terminal. The console
displays it read-only; investigation actions (if any) must be defined in the
RF-6 per-family spec, not here.

### Scenario S4 — Tenant Owner adjusts tenant-level settings

A2 signs in (RF-1) and adjusts tenant-scoped settings (RF-7). Platform-level
settings remain invisible because backend authorization (FR-002) restricts
them to A1.

### Scenario S5 — Anonymous caller is rejected outside auth surface

A7 attempts to reach a route in RF-2 through RF-7 without an authenticated
session. The backend rejects the request; the console renders the rejection
and routes the caller back into RF-1. The console MUST NOT carry its own
authorization opinion (FR-002).

### Scenario S6 — POS terminal feeds unknown items into the queue (indirect)

A6 captures an item that does not match the catalog. POS-Pulse forwards the
capture into Data-Pulse-2. Some time later, A3 or A4 sees that item in RF-4.
A6 never authenticates against the console; the console never writes back to
A6.

---

## 8. Functional requirements

Every requirement below is testable against a per-family spec, plan, or
implementation slice. Each is anchored to a constitution principle where
relevant.

### Source-of-truth and ownership

- **FR-001 — Source-of-truth preservation.** Every artifact produced under
  this feature (this spec, downstream plans, downstream task lists, downstream
  API dependency maps) MUST resolve conflicts using the constitution's
  source-of-truth order (Data-Pulse-2 main → Data-Pulse-2 OpenAPI →
  Data-Pulse-2 active specs → POS-Pulse main → POS-Pulse specs →
  Retail-Tower-Console planning → current human instruction). No artifact may
  invert or shortcut this order.
  *Anchors:* Constitution §Source-of-truth order, Principle 2.

- **FR-002 — Backend-enforced tenant/store safety.** The console MUST NOT
  contain any tenant- or store-authorization logic that decides whether the
  current actor may see or modify data. Authorization is enforced by
  Data-Pulse-2. The console renders backend responses, including authorization
  rejections, and adapts its UI surface to what the backend returns. Any
  appearance of "the frontend checks scope before calling the backend" is a
  violation of this requirement.
  *Anchors:* Constitution Principle 7.

- **FR-003 — No POS ownership.** The console MUST NOT contain POS terminal
  code, Electron code, local SQLite schemas, hardware pairing logic, terminal
  session lifecycle code, or any direct write-path to a POS device. Read-only
  rendering of POS-originated data (delivered via Data-Pulse-2) is permitted.
  *Anchors:* Constitution Principle 3.

### Planning gates

- **FR-004 — Route-family definition before UI.** No per-family UI work may
  begin until that family is named, defined, and listed in §5 of this spec
  (or in a successor spec that supersedes this one with explicit approval).
  Implementation of an undeclared route family is forbidden.
  *Anchors:* Constitution Principle 4, Principle 5.

- **FR-005 — API dependency map before implementation.** No per-family
  `implementation` slice may open until the family's API dependency map
  resolves every `unknown` row from §6 to `stable` or `draft`, AND every
  `blocked` row that the slice depends on is independently unblocked and
  re-classified. The map is produced in the per-family spec, not here.
  *Anchors:* Constitution §Implementation readiness gates, Principle 2.

- **FR-006 — No generated client until explicitly approved.** No
  Data-Pulse-2-generated API client may be added, committed, vendored,
  scaffolded, or referenced from real code in this repository until the human
  owner has explicitly approved (a) the relevant per-family slice, (b) the
  client-generation toolchain, and (c) the storage location of the generated
  output. Mention of the client in planning documents is not an approval.
  *Anchors:* Constitution Principle 8.

- **FR-007 — No scaffold or package work until explicitly approved.** This
  repository MUST NOT gain `package.json`, any lockfile
  (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, etc.), a framework
  scaffold (Next.js, Vite, Remix, Astro, or any other), `src/`, `app/`,
  `pages/`, `components/`, CI workflow files under `.github/workflows/`, or
  deployment files (Dockerfile, docker-compose, k8s manifests, Terraform,
  fly.toml, Vercel config, etc.) until the human owner has approved a specific
  slice that authorizes that exact change.
  *Anchors:* Constitution Principle 9, Principle 10; Maestro playbook §Stop
  rules.

- **FR-008 — Implementation gate completeness.** No `implementation` slice
  may begin until **all five** of the following are explicitly approved by
  the human owner for that slice:
    1. Spec approved.
    2. Plan approved.
    3. Task list approved.
    4. API dependency map approved (relevant Data-Pulse-2 contracts confirmed
       stable in Data-Pulse-2 `main` and OpenAPI source).
    5. Validation gates defined and approved.
  Gates clear per-slice; clearing them once for one slice does NOT carry over
  to another slice.
  *Anchors:* Constitution §Implementation readiness gates, Principle 4.

### Scope-discipline

- **FR-009 — No silent scope expansion.** No per-family slice may add a route
  family, actor category, or backend dependency that is not declared in this
  spec (or in a successor spec that explicitly amends this one). Scope
  expansions MUST land as an explicit amendment, not as a smuggled-in line in
  a downstream spec.
  *Anchors:* Constitution Principle 5.

- **FR-010 — No secrets, no deployment assumptions.** No secret, credential,
  API key, token, tenant identifier, or environment-specific value may be
  committed under this feature. The spec MUST NOT assume any particular
  hosting target, deployment topology, runtime environment, or networking
  posture. Those decisions are gated by a separate, future architectural
  decision.
  *Anchors:* Constitution Principle 10.

### Backend-dependency posture

- **FR-011 — No optimistic dependency classification.** Any backend
  dependency whose state cannot be confirmed against Data-Pulse-2 `main`,
  Data-Pulse-2 OpenAPI source, or Data-Pulse-2 active wave-status files MUST
  be recorded as `unknown` (or, where the human owner has named a stricter
  status, as `blocked` or `draft`). Classifying an unconfirmed contract as
  `stable` or `draft` without verification is forbidden.
  *Anchors:* Constitution Principle 2; §6 of this spec.

- **FR-012 — Reconciliation contract guard (RF-4b).** The unknown-item
  link-to-existing and create-new-from-unknown surfaces (RF-4b) MUST remain
  classified as `blocked` or `draft` until the human owner records that
  Data-Pulse-2 has confirmed the reconciliation contract is stable. Any
  per-family plan, task list, or implementation slice that depends on RF-4b
  inherits this gate.
  *Anchors:* §6 RF-4b; Constitution Principle 2.

### Documentation discipline

- **FR-013 — Spec-Kit artifact discipline.** Every artifact this feature
  produces MUST live under `specs/001-console-foundation/` (this spec,
  validation checklist, and any downstream `plan.md`, `tasks.md`, or API
  dependency map). Artifacts outside this directory are not part of this
  feature and MUST be referenced by relative path, not copied.

- **FR-014 — Constitution amendment requires its own slice.** If a downstream
  artifact appears to require changing a constitution principle, the work
  STOPS. A separate `planning/spec` slice opens for the constitution
  amendment, runs through human approval, and only then may the dependent
  work resume.
  *Anchors:* Constitution §Governance, §Amendment rule.

---

## 9. Acceptance criteria

This **foundation spec** is acceptable when **all** of the following are
true:

- **AC-1.** Every section listed by the spec author (Header, Background,
  Goals, Non-goals, Actors, Route families, Backend dependency map, User
  scenarios, Functional requirements, Acceptance criteria, Open questions) is
  present, in order, with concrete content (not placeholders).
- **AC-2.** All seven actor categories (A1–A7) are listed with one-line
  definitions and an explicit note on whether they are direct or indirect
  users of the console.
- **AC-3.** All seven route families (RF-1 through RF-7) are listed with
  one-line definitions.
- **AC-4.** The backend dependency map (§6) assigns one of the four allowed
  statuses (`stable` / `draft` / `blocked` / `unknown`) to every route family.
  Nothing is left blank.
- **AC-5.** No row in §6 is classified as `stable` without naming an
  out-of-document confirmation source (i.e., no row claims `stable` from
  inside this spec alone). As of 2026-05-30 the `stable` rows (RF-1, RF-2,
  RF-5, RF-6 audit query) each name a Data-Pulse-2 `main` @ `62d0906`
  reference plus the foundation `sc-verification.md`; see
  [`api-readiness.md`](./api-readiness.md).
- **AC-6.** RF-4b is recorded as `blocked` or `draft` (per spec author
  instruction; FR-012 reserves the move *to `stable`* for the human owner's
  recorded stable-confirmation). As of 2026-05-30 it is **`draft`** — the
  upstream reconciliation contract+runtime have landed on Data-Pulse-2 `main`,
  which moves RF-4b off `blocked` on verified evidence alone (FR-012 does not
  gate `blocked` → `draft`). It is held at `draft` (not `stable`) precisely
  because FR-012's stable-confirmation is unmet — the catalog/unknown-items
  surface has no `sc-verification.md` — and §11 SD-1 keeps it out of the
  first-pass plan. The criterion (`blocked` or `draft`) holds.
- **AC-7.** Functional requirements FR-001 through FR-014 are testable and
  each is anchored to a constitution principle or to an explicit section of
  this spec.
- **AC-8.** No section of this spec contains framework names, package names,
  build-tool names, lockfile choices, deployment-target choices, CI tooling
  choices, file paths under `src/`, route paths, component names, or any
  other implementation detail. (Naming the *repository* Retail-Tower-Console
  is allowed; naming the *frontend framework it will use* is not.)
- **AC-9.** The spec quality checklist at
  `specs/001-console-foundation/checklists/requirements.md` is filled in,
  with each item marked pass / fail, and no failing item remains unaddressed
  at hand-off time.
- **AC-10.** Open questions (§10) name every cross-repo confirmation that
  must occur before `/speckit-plan` runs against this spec.

---

## 10. Open questions

These questions MUST be resolved before `/speckit-plan` produces a plan
against this spec, or before any per-family slice opens against the
corresponding row of §6. They are not blockers on accepting this spec as a
foundation document; they are blockers on the next phase.

- **OQ-1 — RF-1 auth/session/context contract.** What is the current state in
  Data-Pulse-2 `main` of the sign-in/session and active tenant/store-context
  endpoints? Until answered, RF-1 stays `unknown` and every other RF inherits
  the blocker (because RF-1 is a hard prerequisite, §5).

- **OQ-2 — RF-4b reconciliation contract.** Has Data-Pulse-2 confirmed the
  unknown-item link-to-existing and create-new-from-unknown reconciliation
  contract as stable? Until the human owner records confirmation, RF-4b
  stays `blocked` (FR-012).

- **OQ-3 — RF-2/RF-3/RF-5/RF-6/RF-7 contract states.** For each of these
  families, what is the current state in Data-Pulse-2 `main` and OpenAPI
  source? Resolution may be batched (one cross-repo audit covering all five)
  or split (one per family).

- **OQ-4 — Actor → route-family permission matrix.** Backend enforces
  authorization (FR-002), but the **shape** of the matrix (which actors can
  reach which families at all) must be confirmed against Data-Pulse-2's
  authorization model before any per-family plan defines what the UI surfaces
  to whom. This is a read of backend truth, not a frontend design decision.

- **OQ-5 — POS-originated event surface in RF-6.** Which POS-Pulse-emitted
  event types reach Data-Pulse-2's audit/search surface, and under what
  retention and visibility rules? Cross-repo confirmation against
  Data-Pulse-2 (for ingestion) and POS-Pulse (for emission semantics) is
  required before RF-6 leaves spec phase.

- **OQ-6 — Generated-client toolchain and storage.** When RF-1 reaches an
  implementation gate, what client-generation toolchain produces the API
  client, and where in this repo is the generated output stored? (Answer
  remains undefined until FR-006 explicitly approves it; this question
  exists so the answer is known *before* the gate clears, not invented at
  gate time.)

- **OQ-7 — Cross-repo verification cadence.** §6 says every `unknown` row
  must be resolved before the corresponding per-family spec opens. What is
  the verification artifact (e.g., a dated snapshot of Data-Pulse-2 OpenAPI
  hashes, or a referenced wave-status file) that records each resolution?
  The artifact's form belongs to a future planning decision, but the spec
  notes that it must exist.

---

## 11. Scope deferrals

A scope deferral is an **explicit narrowing** of the first-pass plan: a
route family (or sub-family) that this spec still names and owns at the
foundation level but that the upcoming `plan.md` will *not* cover in its
first pass. Deferrals are recorded here so they are visible (FR-009 "no
silent scope expansion" — symmetrically, no silent scope contraction
either) and so future per-family slices can re-evaluate them against
fresh evidence.

A deferral does **not** remove the family from the spec, does **not**
weaken any constitution principle, and does **not** lift any
implementation gate. It records that the upcoming plan will be drafted
without the deferred surface in scope.

### SD-1 — RF-4b unknown-item reconciliation (link / create-new)

- **Deferred surface:** RF-4b — both rows ("Link unknown-item to existing
  catalog row" and "Create new catalog row from unknown-item").
- **Why:** Verified 2026-05-25 against Data-Pulse-2 `main`. The Wave 2
  reconciliation contract is deferred to a gated upstream extension in
  Data-Pulse-2 and is not stable in `main`. Evidence:
  `packages/contracts/openapi/catalog/unknown-items.yaml` (v1.0.0-draft,
  Wave 1 only) and
  `specs/005-pos-catalog-sync-reconciliation/wave-status.md` (Wave 2
  requires gated approval). Full record:
  [`api-readiness.md`](./api-readiness.md) §RF-4b and §Verification log
  entry "2026-05-25 — RF-4b verification against Data-Pulse-2 (OQ-2)".
- **What stays in scope:** RF-4a (unknown-item list / dismiss) is *not*
  deferred. RF-4 is a useful product surface without reconciliation — an
  admin who can triage and dismiss noise from the unknown-item queue
  delivers value even before link/create-new is available.
- **First-pass plan posture:** `plan.md` MUST NOT include design, route
  planning, task decomposition, or implementation work for RF-4b. If
  `plan.md` references RF-4b at all, it MUST be to acknowledge the
  deferral (e.g., a one-line "RF-4b deferred per SD-1 — out of scope for
  this plan").
- **Re-evaluation trigger:** When Data-Pulse-2 promotes the Wave 2
  reconciliation contract out of "requires gated approval" (either by
  merging the Wave 2 spec into `main`, or by re-classifying it as `draft`
  or `stable` in a successor wave-status file). At that point the
  Verification log in `api-readiness.md` should record a new RF-4b
  verification, RF-4b §6 status should update, and a new spec amendment
  may close SD-1 by referencing the updated evidence.
- **Re-evaluation trigger status (2026-05-30): FIRED; owner acted on the
  readiness status.** Data-Pulse-2 has merged the Wave 2 reconciliation
  contract **and** runtime into `main` (`tenantAdminLinkUnknownItem` +
  `tenantAdminCreateProductFromUnknownItem` in committed
  `catalog/unknown-items.yaml` v1.2.0-draft @ `62d0906`; runtime in committed
  `reconciliation.controller.ts`). On the readiness side, **RF-4b moved
  `blocked` → `draft`** on that verified evidence (see
  [`api-readiness.md`](./api-readiness.md) §RF-4b + its 2026-05-30 "Follow-up
  resolutions" Verification log entry) — FR-012 does not gate `blocked` →
  `draft`, so the merge alone justifies the move; the move to `stable` stays
  gated on an FR-012 owner stable-confirmation (still unmet, pending an
  upstream `sc-verification.md`). **SD-1 itself is NOT yet closed.**
  SD-1 governs *first-pass plan scope*, not the readiness status: RF-4b
  remains deferred out of the first-pass plan. Closing SD-1 (bringing RF-4b
  into plan scope) is a separate, explicit amendment the re-evaluation owner
  makes when an RF-4b implementation slice is opened — at which point RF-4b
  must also clear the FR-005 re-verify-before-impl gate (its `draft` ceiling
  reflects the still-missing catalog/unknown-items `sc-verification.md`).
  (No silent scope contraction: the plan-scope deferral remains in force
  until that amendment.)
- **Re-evaluation owner:** Ahmed Shaaban.
- **Closes:** Gate-lift condition 2b in
  [`api-readiness.md`](./api-readiness.md) §Plan gate decision —
  "RF-4b ... explicitly scoped *out* of the first-pass plan via an
  amendment to `spec.md`."

### Constitution and FR anchors

- **FR-009** (no hidden scope expansion) — deferrals are recorded
  visibly here rather than smuggled in downstream.
- **FR-012** (RF-4b reconciliation guard) — unchanged; the guard
  remains active while the upstream contract is gated.
- **Constitution Principle 5** (no hidden scope expansion) — the same
  principle is read symmetrically for contractions.

---

## Assumptions (informational only)

These are reasonable defaults taken to keep this foundation spec moving.
They are recorded so a future reader can challenge them explicitly rather
than discovering them as hidden choices.

- **AS-1.** The console serves human admins via a web browser, not a desktop
  app or a CLI. (Charter §Purpose says "browser-based.")
- **AS-2.** The Retail Tower OS three-repo split (Data-Pulse-2 / POS-Pulse /
  Retail-Tower-Console) is the stable product topology for the foreseeable
  planning horizon. A change to that topology is a constitution amendment,
  not a downstream spec change.
- **AS-3.** Actor categories A1–A7 are exhaustive for the foundation surface.
  Sub-roles within a category (e.g., "billing admin" inside A1) belong to
  per-family specs, not here.
- **AS-4.** The seven route families RF-1 through RF-7 are exhaustive for
  the foundation surface. Additional families (e.g., a reporting/analytics
  family) belong in a successor spec, not as a smuggled addition (FR-009).
- **AS-5.** This repository will remain on `main` plus per-feature branches
  (`001-console-foundation`, `002-...`) for spec-kit work. Branch hygiene is
  enforced by the spec-kit git extension, not by this spec.

---

## Cross-reference index

For traceability when reviewing this spec against repository governance:

- Constitution: `.specify/memory/constitution.md`
- Charter: `docs/product/retail-tower-console-charter.md`
- Repo boundaries: `docs/product/repo-boundaries.md`
- Agent OS standing rules: `docs/agent-os/standing-rules.md`
- Maestro playbook: `docs/agent-os/maestro-playbook.md`
- Slice schema: `docs/agent-os/slice-schema.yaml`
- Validation checklist for this spec:
  `specs/001-console-foundation/checklists/requirements.md`

---

**End of Feature Specification: Console Foundation.**

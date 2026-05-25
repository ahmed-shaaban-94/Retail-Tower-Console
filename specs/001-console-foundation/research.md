# Phase 0 Research: Console Foundation

**Feature**: 001-console-foundation
**Phase**: 0 — Outline & Research
**Date**: 2026-05-25
**Input**: [`plan.md`](./plan.md) Technical Context
**Plan reference**: this file resolves every "NEEDS CLARIFICATION" the spec-kit
`plan-template.md` would otherwise raise — but resolves them by **explicitly
deferring** each decision to a future approved slice, not by picking values
here. That's the constitutionally-correct posture for this repository at
this phase.

---

## R-0 Posture (read this first)

The spec-kit plan-template asks for concrete answers to: Language/Version,
Primary Dependencies, Storage, Testing, Target Platform, Project Type,
Performance Goals, Constraints, Scale/Scope.

For a planning-only repository whose Constitution Principle 9 says "no
package, lockfile, or CI changes without approval" and whose spec.md
FR-007 forbids scaffold/package work until explicitly approved, the
honest answer to half those questions is **"deferred to a future slice
whose only job is to make this decision."**

This research document lists, for each deferred decision:

- **R-N — `<decision title>`**
- **Decision now:** The constraint(s) any future answer MUST satisfy.
- **Decision deferred to:** The named slice that will eventually resolve
  this, with a reference to the constitution principle that requires the
  deferral.
- **Alternatives considered (now, at this level of abstraction):** What
  shape the eventual decision is likely to take, and what's ruled out
  already by the constitution.
- **Rationale for deferring:** Why a foundation plan is the wrong place
  to pick this.

This produces a research artifact that has zero unresolved
`NEEDS CLARIFICATION` markers (every one is resolved by explicit
deferral) while not pre-committing to a stack the constitution forbids
the foundation plan from picking.

---

## R-1 — Frontend framework + build tool

- **Decision now:** Must satisfy:
  - Compiles to JavaScript or WebAssembly for modern evergreen browsers.
  - Supports the generated OpenAPI client consumption pattern
    (TypeScript-friendly type generation if the client is TS, or
    equivalent for whatever language the eventual client uses).
  - Capable of an admin SPA with server-rendered fallback if needed.
    Server-rendering itself is not required; the console may be a plain
    SPA.
  - Compatible with the cookie-based session model
    (`dp2_session` HttpOnly + Secure + SameSite=Lax) confirmed in
    api-readiness.md §RF-1. This rules out approaches that require the
    frontend to read the session token (cookie is `HttpOnly` — JS cannot
    read it; the browser sends it automatically on same-site requests).
- **Decision deferred to:** Slice `002-tooling-and-scaffold`.
- **Alternatives considered:**
  - **React (Next.js)** — strong ecosystem, server-rendering option,
    well-supported OpenAPI client generators. Not ruled in or out here.
  - **React (Vite SPA)** — simpler than Next.js; sufficient for an
    admin console.
  - **Svelte / SvelteKit** — smaller runtime, strong DX.
  - **Solid / Solid Start** — fine-grained reactivity.
  - **Vue / Nuxt** — strong ecosystem.
  - **Plain HTMX or vanilla TS** — possible for an admin surface but
    increases per-screen effort.
  - **Ruled out by constitution:** Electron (Principle 3); any
    framework that requires backend code in this repo (Principle 1, 6);
    any framework whose default project layout creates `backend/`.
- **Rationale for deferring:** Framework choice has implications for
  build tool, test framework, linting, type system, state management,
  and routing — six downstream decisions that collapse into one once a
  framework is picked. Picking a framework requires evaluating the
  generated-client toolchain options (R-2) in tandem, and ratifying both
  in a slice that the human owner approves. Foundation plan picks zero
  of them so a downstream reviewer can challenge the choice without
  re-litigating the foundation.

---

## R-2 — Generated client toolchain and storage location

- **Decision now:** Must satisfy:
  - Consumes Data-Pulse-2 OpenAPI source from a pinned reference
    (commit SHA, tag, or release artifact — not "always latest main").
  - Produces a typed client this repo can import as a dependency.
  - The generated output's storage location is chosen here (the
    repository — vendored under e.g. `src/generated/`) or upstream
    (Data-Pulse-2 publishes a client package this repo consumes via
    package manager).
  - Whatever the choice, the location and toolchain are recorded
    explicitly in `api-readiness.md` §Cross-cutting "Generated-client
    toolchain + storage location" row (currently `deferred`, gated by
    FR-006).
- **Decision deferred to:** Slice `002-tooling-and-scaffold`. May spawn
  a focused sub-slice (`002a-generated-client`) if the toolchain
  selection is contentious.
- **Alternatives considered:**
  - **openapi-typescript + openapi-fetch** — minimal, type-only,
    fetch-based.
  - **orval** — richer; supports React Query / SWR / Zod hooks.
  - **openapi-generator** (Java-based) — heavyweight; large output.
  - **swagger-codegen** — similar; older.
  - **Hand-rolled typed wrapper** — **ruled out by Principle 8** (no
    hand-written API client code).
  - **Data-Pulse-2 publishes its own typed client** — possible if
    Data-Pulse-2's maintainers add a publish target. Would simplify
    this repo; requires upstream coordination.
- **Rationale for deferring:** The client toolchain decision binds to
  the framework choice (R-1) — orval is React-friendly, others are
  framework-agnostic. Making this call before R-1 inverts the
  dependency order.

---

## R-3 — Test framework + test taxonomy

- **Decision now:** Must satisfy:
  - Supports unit, integration, and end-to-end tests at the slice
    level (per Maestro playbook §Mock rule — no implementation slice
    ships without tests).
  - Does NOT require a live Data-Pulse-2 instance. Either mocks the
    generated client (with the per-slice mock approval rule) or runs
    against a contract-conformance fixture derived from the generated
    client's types.
- **Decision deferred to:** Slice `002-tooling-and-scaffold`.
- **Alternatives considered:**
  - **Vitest** — fast, framework-agnostic, ESM-first.
  - **Jest** — older, widely known, slower.
  - **Node native test runner** — minimal, no dependencies.
  - **Playwright** — for E2E. Likely the choice if any E2E is in scope.
  - **Cypress** — alternative E2E.
- **Rationale for deferring:** Test-framework choice binds to the
  build-tool choice (R-1). Picking Vitest with a Webpack-based scaffold
  is friction; picking Jest with a Vite scaffold is friction. Decide
  together.

---

## R-4 — State management

- **Decision now:** Must satisfy:
  - State that mirrors backend authorization (active tenant, active
    store, current user, memberships) is **read-only** from the
    frontend's perspective. The backend's `getActiveContext` response
    is the source of truth; the console caches it for the render but
    cannot decide whether the user *should* see a different tenant
    (Principle 7, FR-002).
  - State mutations that affect the active tenant/store happen by
    calling Data-Pulse-2 (`switchActiveTenant`, `switchActiveStore`,
    `clearActiveStore`) and then re-fetching context. The console MUST
    NOT optimistically update the active-context state.
- **Decision deferred to:** Slice `003-rf1-auth-shell`. The auth shell
  is the natural home for the context-provider abstraction.
- **Alternatives considered:**
  - **React Context + useReducer** — simple, no library.
  - **TanStack Query / SWR** — data-fetching + cache; pairs well with
    the generated client.
  - **Zustand / Jotai** — lightweight global state.
  - **Redux Toolkit** — heavier; unlikely needed for an admin console.
- **Rationale for deferring:** State management binds to the framework
  (R-1) and the client toolchain (R-2). Premature commitment forces
  unrelated downstream slices into a particular shape.

---

## R-5 — Styling system + component library

- **Decision now:** Must satisfy:
  - Supports the multi-tenant admin context (per-tenant theming may
    eventually be required; not required at foundation).
  - Does not introduce CSS-in-JS runtime overhead that bloats the
    admin bundle past reasonable defaults.
  - Accessible by default (WCAG AA target as a constraint).
- **Decision deferred to:** Slice `003-rf1-auth-shell` (the auth shell
  is the first surface that needs styled UI). The slice may further
  defer the component-library decision to a `003a-design-system` slice.
- **Alternatives considered:** Tailwind, vanilla CSS modules, Linaria,
  Panda CSS, shadcn/ui, Radix UI, Mantine, Chakra UI. None ruled out
  here.
- **Rationale for deferring:** Styling decisions interact strongly
  with the framework choice and with the eventual design language. No
  benefit to picking here; significant cost to picking wrong.

---

## R-6 — Routing strategy

- **Decision now:** Must satisfy:
  - The seven route families (spec.md §5) translate to seven top-level
    route trees in the console. RF-1 (auth shell) wraps every other
    family with a session/context guard.
  - Anonymous users (A7) MUST be redirected to RF-1's sign-in by the
    backend (the backend returns 401 on every protected endpoint per
    api-readiness.md §RF-1 verification). The console MUST translate
    401 into a navigation to RF-1; this is rendering of backend truth,
    not authorization.
  - URL structure is a per-family slice decision.
- **Decision deferred to:** Slice `003-rf1-auth-shell` for shell-level
  routing patterns; per-family URL structure is decided in each
  RF-N's slice.
- **Alternatives considered:** Framework default routing (Next.js
  app-router, TanStack Router, React Router), nested layouts,
  parallel routes. Not evaluated at this level.

---

## R-7 — Error & loading UX patterns

- **Decision now:** Must satisfy:
  - 401 from Data-Pulse-2 means re-authenticate (navigate to RF-1).
  - 403 from Data-Pulse-2 means the backend rejected the actor's
    scope; render a generic "you don't have access" without leaking
    *why* (per Principle 7, FR-002 — the frontend doesn't make scope
    decisions, so it shouldn't pretend to know why).
  - 404 (e.g., tenant/store doesn't exist OR user has no membership —
    same response per Data-Pulse-2 `context.openapi.yaml`) means
    "not found from your perspective" — same UX regardless of cause.
  - 429 (rate limit) means render a retry-after notice.
  - 5xx renders a generic error with a request-id surfaced (the
    `Error` schema in `auth.openapi.yaml` includes `request_id`).
  - Loading states are required wherever the network call is on a
    user-blocking path. Skeleton vs spinner is a per-family decision.
- **Decision deferred to:** Slice `003-rf1-auth-shell` for the shell's
  fallback UX; per-family slices own family-specific empty/loading
  states.
- **Rationale for deferring:** Concrete UX patterns require a
  component library (R-5) and a styling system, both deferred.

---

## R-8 — Accessibility, internationalization, observability

- **Decision now:** Must satisfy:
  - **Accessibility**: WCAG AA. Every interactive surface ships with
    keyboard navigation and screen-reader labels. This is a
    per-slice acceptance criterion, not a foundation choice.
  - **Internationalization**: scope unconfirmed at foundation. If
    i18n is required, the decision rides with R-1 (framework) and is
    made in slice `003-rf1-auth-shell` or earlier.
  - **Observability**: client-side error reporting (Sentry-like
    tooling) is a per-slice decision; the foundation does not commit
    to any tool. Whatever is chosen MUST NOT log session cookies,
    auth tokens, tenant identifiers, or other PII to a third party
    (Principle 10).
- **Decision deferred to:** Slice `003-rf1-auth-shell` for shell-level
  a11y patterns and i18n posture; observability gets its own slice
  (`011-observability`) when the first implementation lands.

---

## R-9 — Verification / contract conformance with Data-Pulse-2

- **Decision now:**
  - This repository will periodically re-verify that Data-Pulse-2
    contracts referenced in `api-readiness.md` still exist and have
    not regressed. The cadence and mechanism are defined here.
  - **Trigger to re-verify a row in `api-readiness.md`:**
    1. Before any per-family `implementation` slice opens against that
       family.
    2. When Data-Pulse-2 publishes a new release tag or wave-status
       update affecting the family.
    3. On a quarterly walking-audit.
  - **Verification mechanism:**
    1. Clone Data-Pulse-2 read-only.
    2. Confirm the file path and operation IDs named in the row's
       "Verified against" cell still exist on `main`.
    3. Confirm `info.version` in the referenced YAML hasn't regressed
       (e.g., `1.0.0-draft` is still `1.0.0-draft` or has progressed;
       NOT downgraded).
    4. Confirm corroborating wave-status / spec evidence still says
       the surface is intended for downstream consumption.
    5. Update the row's "Date" and HEAD SHA; append a Verification log
       entry.
- **Decision deferred to:** Not deferred — the policy is recorded here
  and reinforced by `api-readiness.md` §Promotion rule.

---

## R-10 — Branch and PR strategy for downstream slices

- **Decision now:**
  - Each slice opens its own feature branch from `main` (pattern:
    `NNN-short-name` matching the spec directory).
  - PRs target `main`. Squash-merge or merge-commit is at the human
    owner's discretion per-PR; the constitution doesn't pin a strategy.
  - **Audit policy reminder:** `git-config.yml` keeps every
    `auto_commit` flag at `false`. Spec-kit hooks do not auto-stage.
    Every commit is deliberate.
  - **Pitfall from session 2026-05-25 to remember:** GitHub merges a
    PR using the diff *at the moment of merge button click*. If new
    commits land on the branch after the PR is opened, they may not
    ride along with the merge — they'd need a new PR. Workflow rule:
    don't push to a branch after its PR has been opened for review
    unless the PR's `additions/changedFiles` stats are visibly growing.
- **Decision deferred to:** Not deferred — encoded here for downstream
  slices to inherit.

---

## R-11 — What the foundation plan does NOT decide

Recorded explicitly so a future reader does not mistake the foundation
plan for an authorization to act:

- ❌ Framework choice (R-1)
- ❌ Generated-client toolchain (R-2)
- ❌ Test framework (R-3)
- ❌ State management library (R-4)
- ❌ Styling system or component library (R-5)
- ❌ Routing library or URL structure (R-6)
- ❌ Loading/error UX patterns (R-7)
- ❌ i18n approach, observability tooling (R-8)
- ❌ Any per-family implementation
- ❌ Any per-family API dependency resolution for RF-2 / RF-3 / RF-5 /
  RF-6 / RF-7 — those are still `unknown` in `api-readiness.md` and
  must be verified before their per-family planning opens.

The foundation plan deciding these would be exactly the "silent scope
expansion" Principle 5 / FR-009 forbids.

---

## Resolved NEEDS CLARIFICATION (spec-kit template)

The spec-kit `plan-template.md` Technical Context section asks for
concrete values for Language/Version, Primary Dependencies, Storage,
Testing, Target Platform, Project Type, Performance Goals, Constraints,
Scale/Scope. Below maps each to its resolution in this research:

| Template field | Resolution |
| --- | --- |
| Language / Version | R-1 — deferred to slice `002-tooling-and-scaffold`; constraint: JS/WASM in modern browsers |
| Primary Dependencies | R-1 + R-2 — both deferred; constraints recorded |
| Storage | plan.md §Technical Context — **N/A** (no storage) |
| Testing | R-3 — deferred to slice `002-tooling-and-scaffold`; constraints recorded |
| Target Platform | plan.md §Technical Context — modern evergreen desktop browsers |
| Project Type | plan.md §Technical Context — web application, frontend only |
| Performance Goals | R-1 / R-3 / per-family — backend p95 known good (api-readiness.md), frontend deferred per-family |
| Constraints | plan.md §Constraints — exhaustive list anchored to constitution |
| Scale / Scope | plan.md §Scale / Scope — 7 route families minus RF-4b (SD-1) |

**Zero `[NEEDS CLARIFICATION]` markers remain** — every prompt is
resolved by either an explicit answer (Storage = N/A, Project Type =
web frontend-only), an explicit constraint, or an explicit deferral to
a named downstream slice.

---

**End of Phase 0 Research: Console Foundation.**

# Feature Specification: Tooling and Scaffold

| Field | Value |
| --- | --- |
| Feature ID | 002 |
| Short name | tooling-and-scaffold |
| Branch | `002-tooling-and-scaffold` |
| Status | Draft |
| Owner | Ahmed Shaaban |
| Mode | Planning-only-for-spec |
| Created | 2026-05-25 |
| Spec Kit phase | `/speckit-specify` (this document) |
| Foundation slice | [`specs/001-console-foundation`](../001-console-foundation/) (merged) |

> **Mode contract.** Spec phase is planning-only. This document does not
> authorize implementation. Slice 002 progresses through
> `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → implementation
> per spec.md FR-008. Implementation gate clears only after the full
> five-gate approval for this slice.
>
> **Constitution posture.** This slice does **NOT** lift or weaken any
> constitution principle. It operates **within** Constitution Principle 9
> by being a slice that obtains the per-artifact approvals Principle 9
> requires. The framing "this slice lifts Principle 9" would be
> incorrect (see §2 Background).

---

## 1. Background and why

The foundation slice ([`001-console-foundation`](../001-console-foundation/))
ratified the constitution, defined the seven route families RF-1..RF-7,
verified RF-1 to `stable` against Data-Pulse-2, and produced a foundation
plan whose `Technical Context` section **deferred every stack-and-tooling
choice to a future approved slice** (per Constitution Principle 9 + spec
FR-007).

That deferral is the predicate for this slice. Concretely, the foundation
plan's [`research.md`](../001-console-foundation/research.md) items R-1,
R-2, R-3, R-5 each end with **"Decision deferred to: Slice
`002-tooling-and-scaffold`"** (R-4 is deferred to slice 003;
R-9 records a verification policy, not a tooling choice; R-10 records a
branch policy already in force). This spec exists to be the slice those
items point at.

### What this slice exists to authorize

Constitution Principle 9 says:

> The following require explicit human approval before being created or
> modified: `package.json` and any package manager manifest, lockfiles,
> `.github/workflows/` or any CI configuration, any dependency addition
> or removal.

Slice 002 is **the slice that obtains those approvals** — specifically
and only for the eight artifacts named in §3 Goals. It is not a permission
slip for arbitrary future scaffold work; future scaffold work (e.g.,
adding a state-management library in slice 003) needs its own slice and
its own approval per Principle 9.

Slice 002 also obtains the FR-007 approval ("No scaffold or package work
until explicitly approved") for those same eight artifacts.

### What this slice does NOT lift

- It does NOT weaken or amend the constitution. Any such change would
  require its own amendment slice per spec FR-014 and the constitution's
  §Governance §Amendment rule.
- It does NOT amend the foundation spec, plan, research, data-model,
  contracts, quickstart, or api-readiness. Foundation is frozen by merge;
  any change to those documents requires its own amendment slice.
- It does NOT pre-authorize per-family UI work (RF-1..RF-7 — those are
  slices 003 through 009).
- It does NOT authorize deployment configuration, observability tooling,
  or secrets handling.

### Why bundle eight decisions into one slice (vs eight separate slices)

The eight authorized artifacts are tightly coupled:

- The framework choice (D-1) constrains the build tool, the test
  framework, the lint/format toolchain, and the generated-client
  toolchain — each of those depends on what compiles and bundles the
  output the framework produces.
- The generated-client toolchain (D-2) constrains the typed-output
  format, which constrains whether TypeScript is in scope (D-8).
- The CI workflow shape (D-6) consumes the package manager + framework
  + test framework choices and binds them to a Node/runtime version.

Splitting these into eight serial slices would force eight sequential
approval cycles to land any of them; bundling them into one slice
preserves the per-decision audit trail (each decision gets its own
stable label D-1..D-8) while letting the planning skills reason about
the choices together. The audit cost of bundling is recovered through
the per-decision labels and the requirement that `/speckit-clarify`
resolves each label explicitly (FR-002-003).

---

## 2. Goals

Each bullet is an explicit per-artifact authorization that the
human owner grants by approving this spec's eventual `/speckit-plan`
output.

- **G-1.** Authorize **one** `package.json` at repository root with the
  fields appropriate to the chosen framework.
- **G-2.** Authorize **one** lockfile (`pnpm-lock.yaml` OR
  `package-lock.json` OR `yarn.lock` — exactly one, chosen per D-1).
- **G-3.** Authorize **one** frontend framework + **one** build tool
  (coupled in D-1 because the choice is not separable in practice).
- **G-4.** Authorize **one** TypeScript config (`tsconfig.json` and any
  framework-specific TS configs) **if** D-8 resolves TypeScript-in-scope.
- **G-5.** Authorize the **initial** `src/` tree shape (frontend-only —
  the constitution forbids `backend/` or `apps/api/` per Principle 1).
- **G-6.** Authorize **one** test framework (unit/integration) +
  **one** E2E framework (D-3, D-4 — separately because unit and E2E
  tooling rarely share a runtime).
- **G-7.** Authorize **one** lint + **one** formatter (D-5 — may be
  the same tool, e.g. Biome).
- **G-8.** Authorize **one** generated OpenAPI client toolchain +
  storage location for the generated output (D-2 toolchain, D-7
  storage location). Promotes `api-readiness.md` §Cross-cutting
  "Generated-client toolchain + storage location" from `deferred` to
  the recorded value (per FR-002-004).
- **G-9.** Authorize **one** `.github/workflows/ci.yml` (install +
  build + test + lint per PR), **including the Node/runtime version +
  OS** that CI uses (D-6 — CI runtime config is part of CI workflow
  shape, NOT part of deployment config, per FR-002-005).

The word "one" is load-bearing. The implementation slice's diff must
not introduce more than one of each authorized artifact.

---

## 3. Non-goals

This slice **explicitly does not authorize**:

- Any per-family UI implementation (RF-1..RF-7 — those belong to
  slices 003 through 009 per foundation plan §Per-family slice
  ordering).
- Any per-family `/speckit-specify` or `/speckit-plan` invocation
  (slice 002's `/speckit-tasks` does NOT produce per-family tasks).
- State management library, styling system, component library, or
  routing library beyond what the framework choice (D-1) bundles by
  default. These are slice 003's decisions (R-4, R-5, R-6 in
  foundation `research.md`).
- Deployment configuration: Dockerfile, docker-compose, k8s manifests,
  Terraform, Vercel/Fly/Netlify config, Pages settings, environment
  variables. Constitution Principle 10 + spec FR-010 hold.
- Analytics or observability tooling (Sentry-equivalent and similar —
  scheduled as slice 011 per foundation plan).
- Any change to `.specify/memory/constitution.md`, `docs/agent-os/*`,
  `docs/product/*`, or anything under `specs/001-console-foundation/*`
  (foundation is frozen by merge).
- Any change to FR-014's "constitution amendment requires its own
  slice" rule.
- Any secret, credential, token, tenant identifier, or other
  environment-specific value.
- Cadence/automation for re-pinning Data-Pulse-2 SHAs. Slice 002
  records the *initial* pin (commit `62d0906`) as part of D-2; an
  automated re-pin workflow is a future slice if one is needed.

---

## 4. Constraints inherited from the foundation

These are non-negotiable. Every decision D-1..D-8 must satisfy them.
Sources: foundation `research.md` R-1..R-5, R-9.

- **C-1 (browser target).** Must compile to JavaScript or WebAssembly
  for modern evergreen browsers (Chrome / Edge / Firefox / Safari
  current and prior major).
- **C-2 (auth transport).** Must support cookie-based auth
  (`dp2_session` HttpOnly + Secure + SameSite=Lax). JavaScript must
  not be expected to read the cookie. No `Authorization: Bearer`
  header plumbing on console-originated calls (the bearer scheme in
  Data-Pulse-2's `auth.openapi.yaml` is for POS-Pulse or
  server-to-server use, not for the console).
- **C-3 (client consumption).** Must consume Data-Pulse-2 OpenAPI via
  a **generated client** (Constitution Principle 8 — no hand-rolled
  API code). The generated client is the only API surface allowed in
  per-family slices.
- **C-4 (Data-Pulse-2 pin).** Generated client toolchain must pin to a
  specific Data-Pulse-2 commit SHA. The initial pin is **`62d0906`** (the
  SHA against which RF-1 *and* the rest of the console's consumed surfaces —
  RF-2 / RF-5 / RF-6 — were verified `stable`, and RF-4a / RF-4b / RF-6
  POS-event verified `draft`, on 2026-05-30; see
  [`../001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md)
  §Cross-repo references + the 2026-05-30 Verification log).
  Pin policy (manual update, scheduled bump, etc.) is part of D-2.
  *Pin history:* the foundation plan and this spec's original draft pinned
  `b5142fe` (the 2026-05-25 RF-1-only verification basis); re-pinned to
  `62d0906` on 2026-05-30 when the full RF-2..RF-7 readiness refresh landed
  against that SHA, so the generated client is produced against the same
  commit the readiness file verifies.
- **C-5 (test isolation).** Tests must not depend on a live
  Data-Pulse-2 instance. Mocks of Data-Pulse-2 require explicit
  per-slice approval per the Maestro playbook §Mock rule; slice 002
  itself does not commit any mocks.
- **C-6 (no POS, no Electron).** No Electron, no native installer, no
  POS terminal code. Constitution Principle 3 holds; POS-Pulse owns
  Electron-based code.
- **C-7 (no backend).** No backend code, schema, OpenAPI source,
  worker, analytics warehouse, or POS terminal logic. Principles 1,
  3, 6 hold. No `backend/`, `apps/api/`, `server/`, `worker/` paths.
- **C-8 (no secrets).** No secrets, credentials, tokens, tenant
  identifiers, or environment-specific values. Principle 10 + FR-010
  hold.

---

## 5. Open decisions

This section enumerates ambiguities. It does **not** prescribe what
`/speckit-clarify` should ask. The clarify skill is responsible for
designing its own question queue against these ambiguities; it may
consolidate coupled decisions into multi-select questions or split
them per its own heuristic.

If `/speckit-clarify` hits its 5-question cap and any open decision
remains unresolved, a **second `/speckit-clarify` run is required
before `/speckit-plan`** (per FR-002-003). `/speckit-plan` is NOT
authorized to default-with-rationale on slice 002's open decisions —
defaults belong in the foundation plan, not in this slice's plan.

### D-1 — Frontend framework + build tool

- **Constraint:** C-1, C-2 (cookie auth — frameworks that require
  client-side token storage are ruled out), C-3 (compatibility with
  the chosen D-2 toolchain), C-6, C-7.
- **Alternatives already considered** (foundation `research.md` R-1):
  - React (Next.js) — strong ecosystem, server-rendering option,
    well-supported OpenAPI client generators.
  - React (Vite SPA) — simpler than Next.js; sufficient for an admin
    console.
  - Svelte / SvelteKit — smaller runtime, strong DX.
  - Solid / Solid Start — fine-grained reactivity.
  - Vue / Nuxt — strong ecosystem.
  - Plain HTMX or vanilla TS — possible for admin surface but
    increases per-screen effort.
  - **Ruled out:** Electron (Principle 3); any framework that requires
    backend code in this repo (Principle 1, 6); any framework whose
    default project layout creates `backend/`.
- **Coupling note.** Build tool is bundled with framework choice
  because the practical pairing is rarely separable (Next.js with
  webpack/Turbopack; SvelteKit with Vite; Vue with Vite; etc.).
- **Decided in:** `/speckit-clarify` → spec.md §Clarifications.

### D-2 — Generated OpenAPI client toolchain

- **Constraint:** C-3, C-4. Must consume Data-Pulse-2 OpenAPI from
  pinned reference (commit SHA `62d0906`); must produce a
  typed client importable by D-1.
- **Alternatives already considered** (foundation `research.md` R-2):
  - **openapi-typescript + openapi-fetch** — minimal, type-only,
    fetch-based.
  - **orval** — richer; supports React Query / SWR / Zod hooks.
  - **openapi-generator** (Java-based) — heavyweight; large output.
  - **swagger-codegen** — similar; older.
  - **Hand-rolled typed wrapper** — **ruled out** by Principle 8.
  - ~~**Data-Pulse-2 publishes its own typed client**~~ — **ruled out by
    OQ-002-1 answer (2026-05-30):** Data-Pulse-2 `packages/contracts/README.md`
    @ `62d0906` states "Generated TypeScript client/server types are
    intentionally deferred" — no published client package exists. D-2 must
    therefore generate locally; D-7 must vendor the generated output (there
    is no package to consume).
- **Pin policy.** Slice 002 records the *initial* pin (`62d0906`).
  Cadence/automation for re-pinning is out of scope (§3 non-goals).
- **Decided in:** `/speckit-clarify` → spec.md §Clarifications.

### D-3 — Test framework (unit/integration)

- **Constraint:** C-5 (must work without a live Data-Pulse-2),
  compatibility with D-1's build tool, compatibility with D-8 (if TS,
  test framework must support TS without separate transpile step or
  ship one).
- **Alternatives already considered** (foundation `research.md` R-3):
  - **Vitest** — fast, framework-agnostic, ESM-first.
  - **Jest** — older, widely known, slower.
  - **Node native test runner** — minimal, no dependencies.
- **Decided in:** `/speckit-clarify` → spec.md §Clarifications.

### D-4 — E2E test framework

- **Constraint:** C-5 (no live Data-Pulse-2), must drive a real
  browser (per C-1 admin browser target).
- **Alternatives already considered** (foundation `research.md` R-3):
  - **Playwright** — likely choice if any E2E is in scope.
  - **Cypress** — alternative E2E.
- **Decided in:** `/speckit-clarify` → spec.md §Clarifications.

### D-5 — Lint + format toolchain

- **Constraint:** Must understand D-1's framework conventions; must
  understand D-8 (TypeScript if applicable); should not require a
  separate runtime from D-3 / D-4.
- **Alternatives already considered** (foundation `research.md` R-5
  context):
  - **ESLint + Prettier** — two tools, widely understood.
  - **Biome** — one tool for lint + format, fast, single config.
  - **dprint** — formatter alone; would pair with ESLint.
  - **oxlint** — fast lint, no format; would pair with Prettier or
    Biome's formatter.
- **Coupling note.** Lint and formatter MAY be the same tool (Biome
  example). If `/speckit-clarify` consolidates this into a single
  question, that's the skill's call.
- **Decided in:** `/speckit-clarify` → spec.md §Clarifications.

### D-6 — CI workflow shape (including Node/OS version)

- **Constraint:** Must run install + build + test + lint per PR
  against `main`. Must use the runtime version compatible with D-1
  through D-5. **CI runtime config (Node version + OS) is part of
  this decision**, NOT part of deployment config (per FR-002-005).
- **Alternatives already considered:** (none specifically — the
  decision is "what does ci.yml look like" rather than "which CI
  product"; GitHub Actions is implied by the workflow path
  `.github/workflows/ci.yml`).
- **Sub-questions naturally bundled here:**
  - Node version pinning policy (single version, matrix, "active LTS").
  - OS (ubuntu-latest is the default for GitHub-hosted runners;
    others are possible but unusual for a frontend repo).
  - Whether E2E (D-4) runs in CI or only locally, and if in CI,
    whether browser binaries are part of CI cache.
- **Decided in:** `/speckit-clarify` → spec.md §Clarifications.

### D-7 — Generated client storage location

- **Constraint:** Must integrate with D-1's import resolution. Must
  not be `.gitignore`d (the generated output is committed so CI is
  reproducible without running the generator). Must be clearly
  separable from hand-written `src/` code so per-family slices can
  reference it without confusion.
- **Alternatives already considered** (foundation `research.md` R-2
  context):
  - **Vendored in this repo** at `src/generated/` (or similar).
  - **Published from Data-Pulse-2** as a package this repo
    consumes — depends on OQ-002-1.
- **Decided in:** `/speckit-clarify` → spec.md §Clarifications.

### D-8 — TypeScript-or-not

- **Constraint:** The generated client (D-2) is most ergonomic when
  the consuming repo is TypeScript-typed. Plain JavaScript is
  possible but loses ~70% of the value of the generated client.
- **Alternatives:**
  - TypeScript (strict mode).
  - TypeScript (non-strict / `noImplicitAny: false`).
  - Plain JavaScript with JSDoc types.
  - Plain JavaScript, no type annotations.
- **Decided in:** `/speckit-clarify` → spec.md §Clarifications.

---

## 6. User scenarios (developer-perspective)

These scenarios describe what slice 002 enables for the developer
opening slice 003 onwards. They are not UX flows for end-users (this
slice has no end-user UI).

### Scenario DS-1 — Slice 003 developer adds the first UI component

The developer opens slice `003-rf1-auth-shell` after slice 002 merges.
They:

1. Run the package manager's install command (per D-1's manifest).
2. Add a UI component file under `src/...` using the chosen framework
   (per D-1).
3. Import the generated client from D-7's storage location and call
   the typed `signIn` operation. They do not write any `fetch` code.
4. Add a unit test using D-3, and (if scoped) an E2E test using D-4.
5. Open a PR. The D-6 CI workflow runs install + build + test + lint
   and reports pass/fail on the PR.

### Scenario DS-2 — A future slice needs a new dev dependency

The developer opens slice `004-rf2-tenant-store-mgmt` and discovers
they need a date library. Per Constitution Principle 9, **adding a
dependency requires explicit human approval**. The developer:

1. Documents the dependency need in slice `004`'s spec under "Open
   decisions" or similar section.
2. Resolves the choice in slice `004`'s `/speckit-clarify` (which
   options, with rationale).
3. The human owner approves slice `004`'s plan, which lists the new
   dependency in `package.json` + lockfile.
4. The dependency is added in the implementation phase of slice `004`.

Slice 002 does NOT pre-authorize this future addition. Each
dependency is its own decision.

### Scenario DS-3 — Data-Pulse-2 ships a contract change

Data-Pulse-2 promotes `auth.openapi.yaml` from `1.0.0-draft` to
`1.1.0-draft` with a backwards-compatible addition. The console
maintainer:

1. Updates D-7's stored generated output by re-running the D-2
   toolchain against Data-Pulse-2's new SHA.
2. Records the new pin in `api-readiness.md`'s Verification log per
   the file's update rules.
3. Opens a PR with the regenerated client + readiness update.

The cadence/automation for this re-pin is OUT of slice 002's scope
(§3 non-goals). Slice 002 only ensures D-2 *can* re-pin manually.

### Scenario DS-4 — Reviewer audits slice 002's diff

The reviewer of slice 002's implementation PR confirms:

- Exactly one `package.json` is added.
- Exactly one lockfile is added.
- Exactly one `.github/workflows/*.yml` is added.
- `src/` exists with frontend-only shape; no `backend/`,
  `apps/api/`, `server/`, `worker/`.
- The generated client output exists at D-7's recorded location;
  no hand-written API code in `src/`.
- Every dependency in `package.json` is cited in `plan.md` with its
  decision label D-N (per FR-002-006).
- No secrets, credentials, or `.env*` files.
- `api-readiness.md` §Cross-cutting "Generated-client toolchain +
  storage location" row is promoted from `deferred` to the recorded
  value, **in the same commit** that introduces the toolchain (per
  AC-002-7).

---

## 7. Functional requirements

Anchored to foundation FRs and constitution principles where
relevant.

- **FR-002-001 — exact-scope authorization.** Slice 002 authorizes
  exactly the eight artifacts listed in §2 Goals (G-1 through G-9);
  no more, no less. Adding a ninth artifact (e.g., a Storybook
  config, a Husky config, a `.prettierrc` separate from D-5's choice)
  requires either an amendment to this spec or a separate slice.
  *Anchors:* Constitution Principle 5; foundation spec FR-009.
- **FR-002-002 — foundation immutability.** Slice 002 changes nothing
  in `specs/001-console-foundation/*`. The foundation is frozen by
  merge. If slice 002's work surfaces a defect in the foundation
  (e.g., a constraint that turns out to be impossible to satisfy),
  STOP and open an amendment slice; do NOT modify the foundation
  documents from inside slice 002.
  *Anchors:* foundation spec FR-014; constitution §Governance.
- **FR-002-003 — clarify-not-default.** Every open decision D-1..D-8
  is resolved by `/speckit-clarify`, possibly across a second clarify
  run if the first run hits the 5-question cap. `/speckit-plan` is
  NOT authorized to "default-with-rationale" on any D-N for slice
  002. Foundation-level defaults belong in `research.md`; per-slice
  picks belong in `/speckit-clarify`.
  *Anchors:* foundation `research.md` R-1..R-5 (constraints recorded
  as foundation-level deferrals).
- **FR-002-004 — readiness-row sync.** Slice 002's implementation
  PR MUST update `specs/001-console-foundation/api-readiness.md`
  §Cross-cutting "Generated-client toolchain + storage location" row
  from `deferred` to the recorded toolchain (D-2) + storage location
  (D-7). The promotion happens in the same commit that introduces
  the toolchain files.
  *Anchors:* foundation spec FR-013; api-readiness §How to update.
- **FR-002-005 — CI-runtime vs deployment-runtime separation.** The
  Node version + OS that CI uses is part of D-6 (CI workflow shape).
  This is **not** the same as the runtime/Node version/OS used to
  *serve* the application in any environment. Deployment-runtime
  decisions remain out of scope for slice 002 and require a separate
  slice.
  *Anchors:* Constitution Principle 10; foundation spec FR-010.
- **FR-002-006 — dependency justification.** Every dependency added
  in slice 002's `package.json` (both `dependencies` and
  `devDependencies`) MUST appear in slice 002's `plan.md` with a
  one-line justification linking it to its decision D-N. Dependencies
  that don't trace to a D-N are forbidden — they imply a hidden
  decision was made.
  *Anchors:* Constitution Principle 5; foundation spec FR-009.
- **FR-002-007 — no premature scaffold.** Slice 002's `/speckit-plan`
  output does not authorize implementation work. Implementation
  begins only after the full FR-008 five-gate approval (spec + plan
  + tasks + API map + validation gates) for slice 002 specifically.
  *Anchors:* foundation spec FR-008.

---

## 8. Acceptance criteria

Testable against the slice's eventual `plan.md` and the post-
implementation PR diff.

- **AC-002-1.** A `package.json` exists at repository root with
  fields `name`, `version`, `private: true`, `license`, and the
  framework-specific fields required by D-1. No other top-level
  fields beyond what the framework requires.
- **AC-002-2.** Exactly one lockfile exists at repository root —
  one of `pnpm-lock.yaml`, `package-lock.json`, or `yarn.lock`. Not
  zero, not two.
- **AC-002-3.** `.github/workflows/` contains exactly one workflow
  file (`ci.yml`) and that file runs install + build + test + lint
  per PR against `main`.
- **AC-002-4.** `src/` exists with the frontend-only shape recorded
  in slice 002's `plan.md`. `backend/`, `apps/api/`, `server/`,
  `worker/` do NOT exist.
- **AC-002-5.** The generated client output exists at the location
  decided in D-7 (recorded in `/speckit-plan`'s Technical Context).
  No hand-written API code exists anywhere in `src/` (greppable
  against `fetch(` calls that target Data-Pulse-2 paths).
- **AC-002-6.** Every dependency in `package.json` has a
  corresponding decision D-N citation in `plan.md` (per
  FR-002-006). A reviewer running a script that lists
  `dependencies + devDependencies` and grepping `plan.md` for each
  finds exactly one D-N reference per dependency.
- **AC-002-7.** `specs/001-console-foundation/api-readiness.md`
  §Cross-cutting "Generated-client toolchain + storage location"
  row has been promoted from `deferred` to the recorded toolchain
  + storage location, in the **same commit** that introduces the
  toolchain files. (Per FR-002-004 + api-readiness §How to update
  sync rule.)
- **AC-002-8.** No file under `specs/001-console-foundation/`
  (other than the api-readiness row update in AC-002-7) is
  modified by slice 002's implementation PR. The foundation is
  frozen.
- **AC-002-9.** No secret, credential, token, or `.env*` file is
  added by slice 002's PR. Grep for common secret patterns and
  `.env` filenames returns no new matches.
- **AC-002-10.** Every open decision D-1..D-8 has a `## Clarifications`
  entry in this spec (`spec.md`) populated by one or more
  `/speckit-clarify` runs (per FR-002-003).

---

## 9. Open questions

These are cross-repo or out-of-scope-for-spec questions that should
be resolved before `/speckit-clarify` runs against this spec, or
they remain blockers for specific decisions.

- **OQ-002-1 — Does Data-Pulse-2 publish a generated client
  package? — ✅ RESOLVED (2026-05-30): NO.** Cross-repo check against
  `Data-Pulse-2/main` @ `62d0906`: `packages/contracts/README.md` states
  "Generated TypeScript client/server types are intentionally deferred."
  No published client package exists on npm/GitHub Packages. **Consequence
  for D-2/D-7:** generate the client locally and **vendor the output here**
  (the "use the package; no local storage" branch is foreclosed). Recorded
  also in `../001-console-foundation/api-readiness.md` §Cross-cutting
  generated-client row.
- **OQ-002-2 — CSRF posture. — ◑ PARTIALLY RESOLVED (2026-05-30).**
  Verified against `Data-Pulse-2/main` @ `62d0906`: **no console-facing
  contract declares an `X-CSRF-Token`/`X-XSRF-Token` header** on any POST
  endpoint (checked `auth`, `context`, `tenants`, `stores`, `memberships`,
  `audit`, `catalog/unknown-items`). **However**, the foundation auth plan
  (`specs/001-foundation-auth-tenant-store/plan.md`) states CSRF is
  "mitigated by SameSite + **double-submit token where needed**" — so a
  double-submit token *may* be introduced on specific endpoints later
  without a contract-header change being visible today. **Net:** the
  console can plan for cookie-`SameSite=Lax` transport with **no
  CSRF-header plumbing required against the current contract set**, but D-1
  should keep a framework that *can* add a double-submit header if a future
  Data-Pulse-2 endpoint requires one. Not a blocker for D-1 selection; the
  "MUST re-verify" flag from foundation `contracts/rf1-auth-context.md` is
  answered for the current contract surface.
- **OQ-002-3 — Workspace structure.** Single-package repo, or
  pnpm workspaces / Turborepo / Nx monorepo? The foundation's
  "frontend-only" rule rules out workspaces that imply a separate
  `backend/`, but a workspace structure for shared lint/test config
  across hypothetical future microfrontends is open. This belongs
  in D-1 (or as a derivative of D-1) but is called out separately
  here because it affects the answer to D-7 (storage location)
  meaningfully.
- **OQ-002-4 — Browser support breadth.** "Modern evergreen
  browsers" (C-1) is the foundation constraint. Does this include
  mobile Safari iOS 15+? Mobile Chrome on Android? The console is
  an admin surface, so mobile is unusual but not impossible — and
  the framework choice (D-1) has implications for legacy-browser
  fallback bundles. Recommended resolution: ask in
  `/speckit-clarify` D-1 or accept the foundation default ("desktop
  evergreen only; mobile is a per-family slice decision").

---

## 10. Cross-references

For traceability when reviewing this slice against repository
governance and prior planning:

- **Constitution:** `.specify/memory/constitution.md` (v1.0.0)
- **Foundation spec:** [`specs/001-console-foundation/spec.md`](../001-console-foundation/spec.md)
- **Foundation plan:** [`specs/001-console-foundation/plan.md`](../001-console-foundation/plan.md)
  (§Technical Context, §Per-family slice ordering row 1)
- **Foundation research:** [`specs/001-console-foundation/research.md`](../001-console-foundation/research.md)
  R-1..R-5, R-9, R-10
- **Foundation api-readiness:** [`specs/001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md)
  (§Cross-cutting "Generated-client toolchain + storage location"
  row + §Plan gate decision)
- **Foundation contracts policy:** [`specs/001-console-foundation/contracts/README.md`](../001-console-foundation/contracts/README.md)
  (the rules slice 002's CI must enforce)
- **Foundation RF-1 contract:** [`specs/001-console-foundation/contracts/rf1-auth-context.md`](../001-console-foundation/contracts/rf1-auth-context.md)
  (the 7 operations slice 003 will consume via the D-2 toolchain)
- **Charter:** `docs/product/retail-tower-console-charter.md`
- **Repo boundaries:** `docs/product/repo-boundaries.md`
- **Maestro playbook:** `docs/agent-os/maestro-playbook.md`
  (§Stop rules — slice 002 obtains approvals listed there)
- **Validation checklist for this spec:** [`checklists/requirements.md`](./checklists/requirements.md)

---

## Important framing note (for downstream skills)

This spec's §5 Open decisions section enumerates **ambiguities**, not
questions. It deliberately does not prescribe what `/speckit-clarify`
should ask. The clarify skill is responsible for designing its own
question queue against these ambiguities; it may consolidate coupled
decisions into multi-select questions or split them per its own
heuristic.

If a downstream agent processing this spec is tempted to "pre-resolve"
a D-N item by writing what it thinks the answer should be — STOP. The
discipline of this slice is that decisions live in the dedicated
decision-resolution skill (`/speckit-clarify`), not in the spec.md
generation step. Defaults are recorded in foundation `research.md`,
not here.

---

**End of Feature Specification: Tooling and Scaffold.**

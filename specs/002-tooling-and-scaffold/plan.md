# Implementation Plan: Tooling and Scaffold

**Branch**: `002-tooling-and-scaffold` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-tooling-and-scaffold/spec.md`

**Clarifications basis**: spec.md §Clarifications (Session 2026-05-30,
committed `e766a76`) — every open decision D-1..D-8 plus OQ-002-3/4 is
resolved and owner-confirmed. This plan records those picks; it does
**not** re-open or default on any of them (FR-002-003).

**Foundation**: [`specs/001-console-foundation`](../001-console-foundation/)
(merged). This slice consumes that plan's §Technical Context deferrals
(R-1, R-2, R-3, R-5) and turns them into concrete values.

---

## Summary

Slice 002 is the **scaffold-authorization plan**. The foundation plan
(slice 001) deliberately deferred *every* stack-and-tooling choice to a
future approved slice; this slice is that slice. Its `/speckit-clarify`
resolved the eight coupled decisions D-1..D-8. This `plan.md` records
the concrete technical picks, the concrete frontend-only source tree the
scaffold will create, the per-decision dependency trace required by
FR-002-006, and the validation gates (the fifth readiness gate) that the
eventual implementation PR must clear.

**Primary requirement** (spec §2 Goals G-1..G-9): authorize exactly
*one* of each of the eight tightly-coupled artifacts — one
`package.json`, one lockfile, one framework+build tool, one TS config,
one initial `src/` tree, one unit test framework + one E2E framework,
one lint+format tool, one generated-client toolchain + storage location,
one CI workflow — with each dependency traced to its decision label.

**Technical approach** (from §Clarifications): a **React 19 + Vite 6
single-package SPA**, **TypeScript strict**, consuming Data-Pulse-2 via a
**locally-generated, vendored OpenAPI client** (`openapi-typescript` +
`openapi-fetch`, output at `src/generated/`), tested with **Vitest** +
**Playwright**, linted/formatted with **Biome**, gated by a **GitHub
Actions** CI workflow on **Node 22 LTS / ubuntu-latest**. Package manager
**pnpm**. No SSR server, no `backend/`, no secrets, no deployment config.

**Mode** (unchanged from spec §Mode contract): **planning-only**. This
plan does NOT authorize implementation work. Per FR-002-007, the actual
creation of `package.json`, the lockfile, `.github/workflows/ci.yml`,
`src/`, and the vendored client happens only after the full five-gate
approval for this slice clears (see §Implementation readiness gates).

---

## Technical Context

> **Posture — note the inversion.** The foundation plan (slice 001)
> recorded every line below as **"Deferred to slice."** Slice 002 is the
> slice those deferrals pointed at, so every line here carries a
> **concrete value** sourced from spec.md §Clarifications, with its
> decision label D-N. No line says "deferred" — that would re-defer a
> decision the owner already made.

**Language / Version**:
- **TypeScript** (strict mode, `"strict": true`) targeting ES2022.
  *(D-8.)* Compiles to JavaScript for modern evergreen browsers per C-1.

**Primary Dependencies**:
- **React 19** + **Vite 6** (SPA mode, no SSR). *(D-1.)*
- **openapi-typescript** (build-time type generation) +
  **openapi-fetch** (~6 KB runtime fetch wrapper). *(D-2.)*
- Package manager: **pnpm** (single lockfile `pnpm-lock.yaml`, G-2).
- Full per-decision dependency trace in §Dependency → decision trace.

**Storage**:
- **N/A.** No client-side business-data storage. The browser carries the
  Data-Pulse-2 `dp2_session` HttpOnly cookie (set by the backend; JS
  cannot read it — C-2) and minimal UI state in client memory. No
  IndexedDB / localStorage for business data, no service-worker API
  cache. *(Inherited from foundation plan §Storage.)*

**Testing**:
- **Vitest** for unit/integration *(D-3)*; **Playwright** for E2E
  *(D-4)*, running in CI with browser binaries cached. Tests must not
  depend on a live Data-Pulse-2 (C-5) — they mock the generated client
  (with per-slice mock approval per Maestro playbook §Mock rule; slice
  002 itself commits no mocks).

**Target Platform**:
- **Modern evergreen desktop browsers** (Chrome / Edge / Firefox / Safari
  current and prior major). *(C-1; OQ-002-4 retains this foundation
  default — mobile is a per-family decision.)* No native installer, no
  Electron (C-6, Principle 3).

**Project Type**:
- **Web application — frontend only, single-package repo.** *(OQ-002-3.)*
  No `backend/`, no `apps/api/`, no `server/`, no `worker/` (C-7,
  Principles 1 & 6). The spec-kit template's "Option 2" backend subtree
  is forbidden here.

**Performance Goals**:
- **Deferred to per-family slices.** The console's frontend perf targets
  ride with the first UI slice (`003-rf1-auth-shell`). Backend
  context-resolution p95 is already verified good (api-readiness.md §RF-1,
  p95 = 7.0 ms). *(This is a genuine foundation-level deferral, not a
  slice-002 decision — slice 002 owns no UI.)*

**Constraints** (lifted from spec §4 C-1..C-8; non-negotiable):
- **C-1** browser target: JS/WASM, modern evergreen. Satisfied by D-1/D-8.
- **C-2** cookie auth: `dp2_session` HttpOnly + Secure + SameSite=Lax;
  no JS cookie read; no `Authorization: Bearer` plumbing on
  console-originated calls. Satisfied by `openapi-fetch` (D-2, fetch
  sends the cookie automatically same-origin).
- **C-3** generated-client consumption only (Principle 8). Satisfied by
  D-2 (no hand-rolled API code).
- **C-4** Data-Pulse-2 pin `62d0906`. The D-2 toolchain pins to this SHA.
- **C-5** test isolation (no live Data-Pulse-2). Satisfied by D-3/D-4
  mocking the generated client.
- **C-6** no POS, no Electron. Satisfied (plain web SPA).
- **C-7** no backend / schema / OpenAPI source / worker / analytics.
  Satisfied (single frontend tree).
- **C-8** no secrets. Satisfied (no `.env*`, no credentials added).

**Scale / Scope**:
- **Exactly the eight authorized artifacts** (spec §2, G-1..G-9). The
  implementation diff must introduce no more than one of each. No
  per-family UI (slices 003..009 own that).

---

## Constitution Check

**GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.**

Anchored to `.specify/memory/constitution.md` (v1.0.0).

| # | Principle | Pre-research check | Post-design check |
| --- | --- | --- | --- |
| 1 | Frontend-only ownership | ✅ Single frontend `src/` tree; no `backend/`/`apps/api/`. | ✅ Phase 1 source tree is frontend-only; data-model.md owns no backend semantics. |
| 2 | Data-Pulse-2 contract authority | ✅ D-2 consumes Data-Pulse-2 OpenAPI from pinned SHA `62d0906`; copies no contract. | ✅ contracts/ folder references upstream paths only; generated output is a *derivation*, not a contract source. |
| 3 | POS-Pulse boundary | ✅ No Electron, SQLite, pairing, terminal logic (C-6). | ✅ No POS artifacts in the proposed tree. |
| 4 | Spec-first implementation | ✅ Gated by approved spec + this plan; clarify complete. | ✅ Phase 1 outputs authorize no UI; implementation deferred to gate clearance. |
| 5 | No hidden scope expansion | ✅ Plan covers only the eight G-1..G-9 artifacts. | ✅ Every dependency traces to a D-N (FR-002-006); a ninth artifact would need re-scope. |
| 6 | No backend/schema/OpenAPI ownership | ✅ Plan adds none. | ✅ Tree has no backend paths; generated client is consumption-only. |
| 7 | Tenant/store safety backend-enforced | ✅ No frontend authorization logic introduced. | ✅ The scaffold carries no scope/authz opinion. |
| 8 | Generated client consumption only | ✅ D-2 = generated client; no hand-written API code (C-3). | ✅ AC-002-5 forbids hand-written `fetch(` to DP2 paths in `src/`. |
| 9 | No package/lockfile/CI changes without approval | ✅ **Satisfied — slice 002 IS the approval mechanism** (spec §2 Background). It does not *violate* P9; it is the slice that *obtains* the per-artifact approvals P9 requires. The files are created only at implement-time, under the five-gate clearance. | ✅ Plan authorizes the artifacts but creates none; FR-002-007 holds — `/speckit-plan` output is not implementation. |
| 10 | No secrets or deployment assumptions | ✅ No secrets, no deployment files (C-8). | ✅ CI runtime (D-6, Node 22/ubuntu) is explicitly *not* deployment runtime (FR-002-005). No `.env*`. |

**Pre-research gate: PASS.** No principle is violated. Principle 9 is
*satisfied through* this slice, not violated by it — the foundation
constitution working as intended.

### Implementation readiness gates (per foundation spec FR-008 + constitution §Implementation readiness gates)

These five gates clear **per-slice**, with explicit human approval. For
slice 002 specifically:

- [x] **Spec approved** — PR #6 merged to `main`.
- [ ] **Plan approved** — **this document**; pending owner review + merge.
- [ ] **Task list approved** — `/speckit-tasks` produces; pending.
- [x] **API dependency map approved** — `api-readiness.md` (refreshed @
  `62d0906`, PR #8) verifies the consumed surfaces; the §Cross-cutting
  generated-client row is `deferred` and is promoted *in the
  implementation commit* per AC-002-7 (recorded as a task, not done
  here). The dependency *map* itself is approved; the row *sync* is an
  implementation deliverable.
- [ ] **Validation gates defined and approved** — **defined in
  §Validation gates below** (AC-002-1..10); pending owner approval.

**The implementation gate is NOT cleared by this plan.** Creating the
authorized files is forbidden until all five boxes above are checked for
this slice (FR-002-007, Principle 9).

---

## Project Structure

### Documentation (this feature)

```text
specs/002-tooling-and-scaffold/
├── spec.md                  # /speckit-specify (merged) + §Clarifications (e766a76)
├── checklists/
│   └── requirements.md      # spec quality checklist (merged)
├── plan.md                  # THIS FILE
├── research.md              # Phase 0 output (this plan): records picks vs alternatives
├── data-model.md            # Phase 1 output: scaffold "entities" (config artifacts)
├── contracts/
│   └── README.md            # Phase 1 output: the consumption contract the CI enforces
├── quickstart.md            # Phase 1 output: planning workflow (NOT a runtime runbook yet)
└── tasks.md                 # /speckit-tasks output (NOT created by /speckit-plan)
```

### Source code (repository root) — AUTHORIZED, not yet created

> Per Principle 9 + FR-007 + FR-002-007, the tree below is **authorized
> by this plan** but **created only at implement-time** after the
> five-gate clearance. It is the frontend-only, single-package layout
> (OQ-002-3) — the only structure the constitution permits.

```text
# Repository root after slice 002 implementation
package.json                 # one manifest (G-1); deps trace to D-N (FR-002-006)
pnpm-lock.yaml               # the single authorized lockfile (G-2, D-1)
tsconfig.json                # TypeScript strict config (G-4, D-8)
tsconfig.node.json           # Vite/tooling TS config (framework-specific, D-1)
vite.config.ts               # Vite SPA config (D-1)
vitest.config.ts             # or merged into vite.config.ts (D-3)
playwright.config.ts         # E2E config (D-4)
biome.json                   # lint + format config (D-5)
index.html                   # SPA entry document (D-1)
openapi-ts.config.ts         # generator config pinned to DP2 @ 62d0906 (D-2, C-4)

src/
├── main.tsx                 # React 19 app bootstrap (D-1, D-8)
├── App.tsx                  # root component (placeholder shell; NO RF-1 UI — that's slice 003)
├── generated/               # D-7: vendored OpenAPI client output, COMMITTED (not .gitignore'd)
│   ├── schema.d.ts          #   openapi-typescript output
│   └── client.ts            #   openapi-fetch typed client instance
└── (no components/, pages/, routes/ yet — those arrive per-family in slices 003+)

tests/
├── unit/                    # Vitest (D-3) — a smoke test proving the toolchain runs
└── e2e/                     # Playwright (D-4) — a smoke test proving the harness runs

.github/
└── workflows/
    └── ci.yml               # one workflow (G-9, D-6): install→build→lint→test→E2E
```

**Structure Decision**: **Single-package frontend-only SPA at the
repository root** (OQ-002-3). No workspace/monorepo (no
`pnpm-workspace.yaml`, no `packages/`, no `apps/`). The generated client
lives at `src/generated/` (D-7), clearly separable from hand-written
`src/` code per AC-002-5. The initial `src/` carries only the bootstrap
shell and the vendored client — **no RF-1..RF-7 UI**, which belongs to
slices 003..009. `tests/` carries one smoke test per level proving the
harness executes, not feature tests.

---

## Dependency → decision trace (FR-002-006)

Every dependency the implementation will add to `package.json` MUST cite
its decision label. This is the table the reviewer checks against
AC-002-6. Concrete versions are pinned at implement-time (latest stable
satisfying the constraints); the *trace* is fixed here.

| Dependency | dep / dev | Decision | Justification |
| --- | --- | --- | --- |
| `react`, `react-dom` | dep | D-1 | The chosen framework runtime. |
| `vite` | dev | D-1 | The chosen build tool (SPA mode). |
| `@vitejs/plugin-react` | dev | D-1 | React fast-refresh + JSX transform for Vite. |
| `typescript` | dev | D-8 | TypeScript strict compiler. |
| `@types/react`, `@types/react-dom` | dev | D-1+D-8 | Type declarations for the framework under TS. |
| `openapi-typescript` | dev | D-2 | Generates `src/generated/schema.d.ts` from DP2 OpenAPI @ `62d0906`. |
| `openapi-fetch` | dep | D-2 | Runtime typed fetch client (sends `dp2_session` cookie, C-2). |
| `vitest` | dev | D-3 | Unit/integration test runner (shares Vite transform). |
| `@vitest/coverage-v8` | dev | D-3 | Coverage reporter (supports the per-slice coverage gate). |
| `@playwright/test` | dev | D-4 | E2E runner; browsers cached in CI (D-6). |
| `@biomejs/biome` | dev | D-5 | Single lint + format tool. |

> No dependency in this table lacks a D-N. If the implementation needs a
> dependency not listed here (e.g. a router or state lib), that is a
> **slice 003** decision (foundation R-4/R-6) and MUST NOT be added in
> slice 002 — adding it would imply a hidden decision (FR-002-006).

---

## Validation gates (the fifth readiness gate — defined here, approved with this plan)

The implementation PR for slice 002 MUST pass all of the following. These
operationalize AC-002-1..10 into a reviewer-runnable checklist, and they
constitute the "Validation gates defined and approved" readiness gate.

1. **One manifest** — exactly one root `package.json` with `name`,
   `version`, `private: true`, `license`, plus framework-required fields;
   no extra top-level fields. *(AC-002-1)*
2. **One lockfile** — exactly one of `pnpm-lock.yaml` (the chosen one);
   not zero, not two. *(AC-002-2)*
3. **One CI workflow** — exactly one `.github/workflows/ci.yml` running
   install → build → lint → test → E2E per PR against `main`, on Node 22
   LTS / `ubuntu-latest`. *(AC-002-3)*
4. **Frontend-only tree** — `src/` exists in the shape above;
   `backend/`, `apps/api/`, `server/`, `worker/` do NOT exist. *(AC-002-4)*
5. **Generated client present, no hand-written API code** — output at
   `src/generated/`; `grep` for `fetch(` targeting Data-Pulse-2 paths in
   hand-written `src/` returns nothing. *(AC-002-5)*
6. **Dependency trace** — every `dependencies` + `devDependencies` entry
   cites a D-N in this plan's trace table. *(AC-002-6)*
7. **api-readiness row promoted in the same commit** — the foundation
   `api-readiness.md` §Cross-cutting generated-client row moves from
   `deferred` to the recorded toolchain (`openapi-typescript +
   openapi-fetch`) + location (`src/generated/`), in the *same commit*
   that introduces the toolchain. *(AC-002-7)*
8. **Foundation otherwise frozen** — no file under
   `specs/001-console-foundation/` is modified except the one
   api-readiness row in gate 7. *(AC-002-8)*
9. **No secrets** — `grep` for secret patterns and `.env*` filenames
   returns no new matches. *(AC-002-9)*
10. **Clarifications complete** — every D-1..D-8 has a `## Clarifications`
    entry. *(AC-002-10 — already satisfied by `e766a76`.)*

---

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| _none_ | — | — |

No constitution violations. Principle 9 is *satisfied through* this slice
(it is the approval mechanism), not violated by it. All eight authorized
artifacts map 1:1 to spec §2 Goals; every dependency traces to a decision
label; the tree is frontend-only.

---

## Post-design Constitution re-check (after Phase 1 outputs)

After writing `research.md`, `data-model.md`, `contracts/README.md`, and
`quickstart.md`, the 10 principles were re-evaluated against the produced
artifacts (see Pre/Post columns above). All ten remain satisfied: no
artifact creates backend semantics, the generated-client design consumes
(does not author) Data-Pulse-2 contracts, the CI runtime is scoped away
from deployment runtime, and no file forbidden by Principle 9 is created
by this plan (only authorized for implement-time).

**Post-design gate: PASS.**

---

## Cross-reference index

- Constitution: `.specify/memory/constitution.md` (v1.0.0)
- Spec: [`spec.md`](./spec.md) (+ §Clarifications, `e766a76`)
- Spec quality checklist: [`checklists/requirements.md`](./checklists/requirements.md)
- Phase 0 research: [`research.md`](./research.md)
- Phase 1 data model: [`data-model.md`](./data-model.md)
- Phase 1 consumption contract: [`contracts/README.md`](./contracts/README.md)
- Phase 1 quickstart: [`quickstart.md`](./quickstart.md)
- Foundation plan: [`../001-console-foundation/plan.md`](../001-console-foundation/plan.md)
- Foundation research: [`../001-console-foundation/research.md`](../001-console-foundation/research.md) (R-1..R-5)
- Foundation api-readiness: [`../001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md)
- Maestro playbook: `docs/agent-os/maestro-playbook.md` (§Stop rules, §Mock rule)

---

**End of Implementation Plan: Tooling and Scaffold.**

# Implementation Plan: Console Foundation

**Branch**: `001-console-foundation-plan` | **Date**: 2026-05-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-console-foundation/spec.md`

**Companion artifacts**:
- [api-readiness.md](./api-readiness.md) — Cross-repo verification artifact (Plan gate decision: **ready**)
- [research.md](./research.md) — Phase 0 output
- [data-model.md](./data-model.md) — Phase 1 output (read-side projection only; this repo owns no model)
- [contracts/](./contracts/) — Phase 1 output (consumption boundaries for Data-Pulse-2 surfaces)
- [quickstart.md](./quickstart.md) — Phase 1 output (planning workflow, not a setup runbook)
- [checklists/requirements.md](./checklists/requirements.md) — Spec quality checklist (from `/speckit-specify`)

---

## Summary

This is the **foundation plan** for Retail-Tower-Console. It is the planning
artifact that downstream per-route-family slices (RF-1 through RF-7) consume
when they open their own per-family `planning/spec` and `implementation`
slices.

**Primary requirement** (from spec.md): produce a single planning artifact
that sequences the seven route families RF-1 through RF-7, codifies the
contract-consumption boundary against Data-Pulse-2, and explicitly defers
every stack-and-tooling choice to a future approved slice.

**Technical approach** (from research): this plan **does not pick a frontend
framework, build tool, package manager, router, state store, styling
system, testing framework, or component library**. Those decisions are
gated by Constitution Principle 9 (no package/lockfile/CI changes without
approval) and spec.md FR-007 (no scaffold or package work until explicitly
approved). Each downstream choice is enumerated in `research.md` with the
proposed gating mechanism (a per-decision approved slice). The foundation
plan establishes (a) which route family is implemented first (RF-1, by §5
sequencing rule), (b) how Data-Pulse-2 contracts are consumed (generated
client only, per Principle 8), and (c) the implementation gate completeness
checklist that every per-family slice MUST clear before code begins.

---

## Technical Context

> **Posture.** Every "decision" line below carries one of three values:
>
> - **Constraint** — a property the eventual stack MUST satisfy. Recorded
>   here so that no downstream slice can quietly pick a stack that violates
>   it.
> - **Deferred to slice** — the choice is explicitly punted to a named
>   future slice that requires human approval (Principle 9, FR-007).
> - **N/A** — the spec.md non-goals or the constitution take this choice
>   off the table for this repository entirely.
>
> No line says "TypeScript" or "React" or "Vite" — those are slice-level
> decisions, not foundation-plan decisions.

**Language / Runtime**:
- **Constraint:** Must compile to JavaScript or WebAssembly that runs in
  modern evergreen browsers (Chrome / Edge / Firefox / Safari current and
  prior major). The console is browser-only per charter §Purpose.
- **Deferred to slice:** `002-tooling-and-scaffold` (see research.md R-1).

**Primary Dependencies**:
- **Constraint:** Must consume a generated API client produced from
  Data-Pulse-2 OpenAPI contracts. May not hand-write API client code
  (Principle 8). May not vendor or copy Data-Pulse-2 contract files
  (Principle 2).
- **Constraint:** No dependency may be added before its approved slice
  (Principle 9, FR-007). The first slice that adds dependencies is
  `002-tooling-and-scaffold` (deferred).
- **Deferred to slice:** `002-tooling-and-scaffold` for framework +
  client-generation toolchain choices.

**Storage**:
- **N/A.** This repository owns no storage. The browser may carry session
  state in cookies (set by Data-Pulse-2's `dp2_session` HttpOnly cookie —
  api-readiness.md §RF-1) and minimal UI state in client memory. No
  IndexedDB, no localStorage for business data, no service-worker cache
  for API responses unless approved per slice.

**Testing**:
- **Constraint:** Every per-family implementation slice MUST ship with
  tests at the level appropriate to the slice (unit / integration / E2E
  per the slice's plan). No "I'll add tests later" slices.
- **Constraint:** Tests MUST NOT depend on a live Data-Pulse-2 instance.
  Either mock the generated client (with the mock-approval rule from
  Maestro playbook §Mock rule), or use contract-conformance tests against
  the generated client's schema.
- **Deferred to slice:** `002-tooling-and-scaffold` (testing framework
  selection rides along with the scaffold decision).

**Target Platform**:
- **Constraint:** Modern evergreen desktop browsers. The console is an
  admin surface — A1 through A5 from spec.md §4 — not a customer-facing
  storefront. Mobile-browser support is a per-family slice decision.
- **Constraint:** No native installer, no Electron, no desktop app.
  Electron is POS-Pulse territory (Principle 3).

**Project Type**:
- **Web application — frontend only.** No `backend/` subtree. The only
  source-tree at the repository root that this plan authorizes (when a
  scaffold slice eventually runs) is the admin frontend.

**Performance Goals**:
- **Deferred to slice:** Per-family slices define their own performance
  targets. The Data-Pulse-2 context-resolution endpoint already meets
  p95 ≤ 200 ms (api-readiness.md §RF-1 corroboration — SC-5 verified at
  p95 = 7.0 ms). The console's *frontend* perf targets ride with the
  scaffold slice and the first UI slice (`003-rf1-auth-shell`).

**Constraints**:
- **No backend code, no schema, no SQL migrations, no OpenAPI source
  contracts, no worker code, no analytics warehouse code.** (Principles
  1, 3, 6.)
- **No `package.json`, lockfiles, `src/`, `app/`, `pages/`, `components/`,
  `.github/workflows/`, Dockerfile, docker-compose, or any deployment
  configuration** until an approved slice authorizes it.
  (Principle 9, FR-007.)
- **No secrets, credentials, tokens, or environment-specific values** in
  any artifact under this feature.
  (Principle 10, FR-010.)
- **Backend enforces authorization.** The console MUST NOT carry any
  tenant-, store-, or role-based authorization opinion that decides
  whether the user may see or do something. The console renders what the
  backend returns. (Principle 7, FR-002.)
- **POS is indirect-only.** The console may render POS-originated data
  delivered via Data-Pulse-2 (read-only). The console MUST NOT write to a
  POS device, run Electron code, or own POS terminal session state.
  (Principle 3, FR-003.)

**Scale / Scope**:
- **Scope per this plan:** 5 of the 7 route families (RF-1, RF-2, RF-3,
  RF-4a, RF-5, RF-6, RF-7 — RF-4a only within RF-4). RF-4b is deferred
  out via SD-1 (spec.md §11). Per-family slices may further narrow.
- **Scale:** Per the charter, the console is a multi-tenant admin
  surface. Tenant / store / user counts are Data-Pulse-2's concern; the
  console's frontend scale ceiling rides with the rendering stack and
  is a per-family decision.

---

## Constitution Check

**GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.**

Anchored to `.specify/memory/constitution.md` (v1.0.0, ratified 2026-05-25).

| # | Principle | Pre-research check | Post-design check |
| --- | --- | --- | --- |
| 1 | Frontend-only ownership | ✅ Plan adds zero backend, schema, worker, or analytics content. | ✅ Phase 1 contracts/ folder documents *consumption boundaries* only; no contract sources here. |
| 2 | Data-Pulse-2 contract authority | ✅ No OpenAPI content copied. References only to Data-Pulse-2 `main` @ `b5142fe`. | ✅ contracts/ folder references Data-Pulse-2 paths and SHAs; never inlines schema. |
| 3 | POS-Pulse boundary preservation | ✅ Plan treats POS as indirect-only; no Electron, SQLite, pairing, or terminal logic. | ✅ data-model.md §POS-originated entities marked read-only with FR-003 anchor. |
| 4 | Spec-first implementation | ✅ This plan is gated by spec.md + api-readiness.md (Plan gate = **ready**). | ✅ Phase 1 outputs do not authorize any UI implementation. |
| 5 | No hidden scope expansion | ✅ Plan covers spec.md §5 RF-1..RF-7 only; RF-4b is deferred via SD-1. | ✅ data-model.md and contracts/ contain only entities/contracts that map 1:1 to spec.md §5 + api-readiness.md. |
| 6 | No backend, schema, or OpenAPI ownership | ✅ Plan adds no such content. | ✅ contracts/ folder explicitly disclaims ownership; references upstream only. |
| 7 | Tenant and store safety is backend-enforced | ✅ Constraints section forbids frontend authorization logic. | ✅ data-model.md §Authorization line repeats the rule with FR-002 anchor. |
| 8 | Generated client consumption only | ✅ "Primary Dependencies" constraint requires generated client. | ✅ contracts/README.md (Phase 1) explicitly bans hand-written client code. |
| 9 | No package, lockfile, or CI changes without approval | ✅ Plan adds none of these. Scaffold decision deferred to `002-tooling-and-scaffold`. | ✅ Phase 1 outputs add no `package.json` or lockfile. |
| 10 | No secrets or deployment assumptions | ✅ Plan adds no secrets, no deployment files. | ✅ quickstart.md addresses *planning workflow*, not a runtime setup. |

**Pre-research gate: PASS.** (Re-evaluated post-design; see end of document.)

### Implementation readiness gates per spec.md FR-008

This plan does NOT clear any per-family implementation gate. Those clear
only per-slice, with explicit human approval. This plan establishes:

- [x] Spec approved (PR #1 + PR #3 merged to `main`)
- [x] Plan approved → **pending this PR's review and merge**
- [ ] Task list approved → `/speckit-tasks` produces; gated per-family
- [ ] API dependency map approved → `api-readiness.md` provides RF-1 + RF-4b; RF-2, RF-3, RF-5, RF-6, RF-7 still `unknown`
- [ ] Validation gates defined and approved → per-family

The five gates are evaluated **per per-family slice**, not for the
foundation as a whole. This foundation plan is itself the second gate
(approved when this PR merges) and the input to gate 3.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-console-foundation/
├── spec.md                       # /speckit-specify (merged)
├── api-readiness.md              # cross-repo verification (merged)
├── checklists/
│   └── requirements.md           # spec quality checklist (merged)
├── plan.md                       # THIS FILE
├── research.md                   # Phase 0 output (this PR)
├── data-model.md                 # Phase 1 output (this PR)
├── contracts/
│   ├── README.md                 # consumption-boundary policy
│   ├── rf1-auth-context.md       # RF-1 boundary, by surface
│   └── (no per-family contracts for RF-2..RF-7 yet; gated on their api-readiness rows)
├── quickstart.md                 # Phase 1 output: planning workflow
└── tasks.md                      # /speckit-tasks output (NOT created here)
```

### Source code (repository root)

**This plan creates no source-tree.** Per Principle 9 and FR-007, the
following will not exist on disk until an approved scaffold slice
(`002-tooling-and-scaffold`) authorizes them:

- `package.json`, lockfiles (`package-lock.json`, `yarn.lock`,
  `pnpm-lock.yaml`)
- `src/`, `app/`, `pages/`, `components/`, `routes/`
- `tsconfig.json`, `vite.config.*`, `next.config.*`, or equivalent
- `tests/`, `__tests__/`, `e2e/`
- `.github/workflows/`
- Dockerfile, docker-compose, k8s manifests, Terraform
- `.env`, `.env.local`, `.env.example`

**Structure decision**: The repository remains documentation-only on the
filesystem outside `specs/`, `docs/`, `.specify/`, and `.claude/` until
the scaffold slice runs. The "frontend project structure" that the
spec-kit template invites here is **deferred to slice
`002-tooling-and-scaffold`**.

When that slice eventually runs, the *frontend-only* structure (spec-kit
Option 2's `frontend/` subtree, without `backend/`) is the only structure
this constitution permits. The scaffold slice will reference this plan's
constraints when proposing the concrete tree.

---

## Per-family slice ordering

The downstream slices that follow this foundation plan, in the order
they MUST be opened (each one's `planning/spec` slice can open in
parallel with the next, but its `implementation` slice cannot start
until the previous family's implementation gate clears OR a parallel
implementation strategy is approved):

| Order | Slice | Family | Pre-conditions |
| --- | --- | --- | --- |
| 1 | `002-tooling-and-scaffold` | Repo-wide | This plan merged. Authorizes the first `package.json`, framework, build tool, test framework, lint, and CI workflow. Must explicitly cite this plan's Constraints section. |
| 2 | `003-rf1-auth-shell` | RF-1 | Slice `002` merged. Consumes Data-Pulse-2 `auth.openapi.yaml` + `context.openapi.yaml`. Establishes the app shell, route guard, and session-context provider for every subsequent family. |
| 3 | `004-rf2-tenant-store-mgmt` | RF-2 | Slice `003` merged. RF-2 api-readiness rows resolved (`unknown` → `stable`/`draft`). |
| 4 | `005-rf3-catalog-mgmt` | RF-3 | Slice `003` merged. RF-3 api-readiness rows resolved. |
| 5 | `006-rf5-operator-admin-mgmt` | RF-5 | Slice `003` merged. RF-5 api-readiness rows resolved (including POS-Pulse boundary check). |
| 6 | `007-rf4a-unknown-items` | RF-4a | Slice `003` + RF-3 (catalog identity model required to render unknown items linked to the catalog). RF-4a api-readiness `draft` re-verified. |
| 7 | `008-rf6-audit-search` | RF-6 | Slice `003` merged. RF-6 api-readiness rows resolved, including OQ-5 (POS-originated event surface). |
| 8 | `009-rf7-settings-system` | RF-7 | Slice `003` merged. RF-7 api-readiness rows resolved. |
| — | (deferred) | RF-4b | See SD-1. Re-evaluation trigger: Data-Pulse-2 Wave 2 promotion. |

**Ordering rationale.** RF-1 first because it is the hard prerequisite
for every other family (spec.md §5 sequencing rule). RF-2 / RF-3 / RF-5
in parallel after RF-1 because they all read tenant/store-scoped
backend data and they cross-reference each other (e.g., RF-5 lists
operators *within a store*, which presumes RF-2's store list). RF-4a
after RF-3 because the unknown-items queue is most useful when the
admin can see the catalog the items will eventually link to (even if
the *linking* — RF-4b — is deferred). RF-6 and RF-7 last because they
are read-mostly surfaces; their planning can begin earlier in parallel
but their implementation has the lowest urgency.

This is an ordering hint, not a binding contract. Each slice's
`planning/spec` may justify a different order against the constitution
and this plan.

---

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| _none_ | — | — |

No constitution violations. The plan defers all stack choices, owns no
backend/schema/POS content, and adds no forbidden files. The "scaffold
work is deferred" posture is not a violation — it is the constitution
working as intended.

---

## Post-design Constitution re-check (after Phase 1 outputs)

After writing `research.md`, `data-model.md`, `contracts/`, and
`quickstart.md`, the 10 principles were re-evaluated against the produced
artifacts (see the Pre/Post columns in the Constitution Check table
above). All ten principles remain satisfied. No `data-model.md` entity
owns backend semantics; the `contracts/` directory holds consumption
*policy* and references to Data-Pulse-2 paths, not contract content; the
`quickstart.md` describes the planning workflow, not a runtime setup.

**Post-design gate: PASS.**

---

## Cross-reference index

- Constitution: `.specify/memory/constitution.md` (v1.0.0)
- Charter: `docs/product/retail-tower-console-charter.md`
- Repo boundaries: `docs/product/repo-boundaries.md`
- Agent OS standing rules: `docs/agent-os/standing-rules.md`
- Maestro playbook: `docs/agent-os/maestro-playbook.md`
- Slice schema: `docs/agent-os/slice-schema.yaml`
- Spec: [`spec.md`](./spec.md)
- API readiness: [`api-readiness.md`](./api-readiness.md)
- Phase 0 research: [`research.md`](./research.md)
- Phase 1 data model: [`data-model.md`](./data-model.md)
- Phase 1 consumption boundaries: [`contracts/`](./contracts/)
- Phase 1 quickstart: [`quickstart.md`](./quickstart.md)

---

**End of Implementation Plan: Console Foundation.**

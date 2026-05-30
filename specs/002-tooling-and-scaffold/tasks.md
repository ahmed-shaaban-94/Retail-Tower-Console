---
description: "Task list for slice 002 — tooling and scaffold"
---

# Tasks: Tooling and Scaffold

**Input**: Design documents from `specs/002-tooling-and-scaffold/`
**Prerequisites**: plan.md ✅, spec.md ✅ (+ §Clarifications `e766a76`),
research.md ✅, data-model.md ✅, contracts/README.md ✅
**Basis commit**: `6a8a438` (plan + Phase 0/1 artifacts)

> ## ⛔ EXECUTION GATE — tasks.md does NOT authorize implementation
> This task list is a **planning artifact**. Per Constitution Principle 9,
> foundation spec FR-007, and slice spec **FR-002-007**, *none* of the
> tasks below may be executed until the **five readiness gates** clear for
> THIS slice with explicit human-owner approval:
> 1. Spec approved ✅ · 2. Plan approved ⬜ · 3. **Task list approved ⬜
> (this file)** · 4. API dependency map approved ✅ · 5. Validation gates
> defined & approved ⬜ (plan §Validation gates).
> Creating `package.json`, the lockfile, `.github/workflows/ci.yml`,
> `src/`, or the vendored client before all five clear is a constitution
> violation. **STOP at task-list approval; do not run T-anything yet.**

**Tests**: This slice explicitly scopes **smoke tests only** (data-model
A-12) — proving the harness *runs*, not feature behavior. Per spec, every
*implementation* slice ships tests; slice 002's tests are the toolchain
smoke tests, included below (not optional for this slice).

**Organization**: Grouped by the developer-value scenarios DS-1..DS-4
(spec §6). The bulk of deliverable work lands in Setup + Foundational,
because DS-1 (a slice-003 developer can scaffold, import the generated
client, and open a green-CI PR) is the primary outcome.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: parallelizable (different file, no dependency on an incomplete task)
- **[Story]**: DS-1..DS-4 (spec §6 developer scenarios); Setup/Foundational/Polish carry no story label
- Every dependency task cites its decision label **D-N** (FR-002-006)
- All paths are repository-root relative (single-package, OQ-002-3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: The manifest + base configs every later artifact depends on.

- [ ] T001 Create the frontend-only single-package root `package.json` with `name`, `version`, `private: true`, `license`, and scripts (`dev`, `build`, `test`, `test:e2e`, `lint`, `generate:client`) — **one** manifest, no backend fields *(A-1, G-1, AC-002-1)*
- [ ] T002 Add framework runtime deps `react`, `react-dom` to `package.json` *(D-1)*
- [ ] T003 Add build/dev deps `vite`, `@vitejs/plugin-react` to `package.json` *(D-1)*
- [ ] T004 Add `typescript`, `@types/react`, `@types/react-dom` to `package.json` *(D-8, D-1)*
- [ ] T005 Add generated-client deps: `openapi-typescript` (dev), `openapi-fetch` (runtime) to `package.json` *(D-2)*
- [ ] T006 Add test deps `vitest`, `@vitest/coverage-v8` (D-3) and `@playwright/test` (D-4) to `package.json`
- [ ] T007 Add lint/format dep `@biomejs/biome` to `package.json` *(D-5)*
- [ ] T008 Run `pnpm install` to produce the **single** `pnpm-lock.yaml` — verify no `package-lock.json`/`yarn.lock` exists *(A-2, G-2, D-1, AC-002-2)*

**Checkpoint**: manifest + lockfile exist; every dep traces to a D-N.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Configs + the vendored client that ALL developer scenarios
depend on. ⚠️ No DS-scenario task may begin until this phase completes.

- [ ] T009 [P] Create `tsconfig.json` (+ `tsconfig.node.json`) with `"strict": true`, target ES2022, `src/` and `src/generated/` in scope *(A-3, D-8, G-4)*
- [ ] T010 [P] Create `vite.config.ts` for SPA build (React plugin, no SSR adapter) *(A-4, D-1, G-3)*
- [ ] T011 [P] Create `vitest.config.ts` (or merge into vite config) with `@vitest/coverage-v8` *(A-5, D-3, G-6)*
- [ ] T012 [P] Create `playwright.config.ts` targeting the built SPA *(A-6, D-4, G-6)*
- [ ] T013 [P] Create `biome.json` — single lint + format config, TS+React aware *(A-7, D-5, G-7)*
- [ ] T014 Create `openapi-ts.config.ts` pinning Data-Pulse-2 OpenAPI to SHA `62d0906`, output to `src/generated/` *(A-8, D-2, C-4, G-8)*
- [ ] T015 Run `pnpm generate:client` to produce `src/generated/schema.d.ts` + `src/generated/client.ts`; **commit the output** (not `.gitignore`d) *(A-9, D-2, D-7, G-8, AC-002-5)*

**Checkpoint**: toolchain configured; vendored client present and committed.

---

## Phase 3: DS-1 — Slice-003 developer can scaffold, import client, open green-CI PR (Primary) 🎯

**Goal**: A developer opening slice 003 can add a component, import the
typed generated client (no hand-written fetch), and open a PR that CI
validates. This is the slice's reason to exist.

**Independent test**: `pnpm install && pnpm build && pnpm lint && pnpm test
&& pnpm test:e2e` all pass locally; the CI workflow runs the same on a PR
and reports green.

- [ ] T016 [US1] Create `index.html` SPA entry document *(A-10, D-1, G-5)*
- [ ] T017 [US1] Create `src/main.tsx` (React 19 bootstrap) and `src/App.tsx` (placeholder shell — **NO** RF-1..RF-7 UI; that is slices 003..009) *(A-10, D-1, G-5)*
- [ ] T018 [P] [US1] Add `tests/unit/smoke.test.ts` (Vitest) proving the toolchain runs — imports `src/generated/client.ts` to confirm the typed client compiles *(A-12, D-3)*
- [ ] T019 [P] [US1] Add `tests/e2e/smoke.spec.ts` (Playwright) proving the harness boots the built SPA *(A-12, D-4)*
- [ ] T020 [US1] Create `.github/workflows/ci.yml` — **one** workflow: Node 22 LTS, `ubuntu-latest`, cached Playwright browsers, steps install → build → lint → test → E2E per PR against `main` *(A-11, D-6, G-9, AC-002-3)*

**Checkpoint**: scaffold builds, lints, tests pass, CI is green on a PR.

---

## Phase 4: DS-4 — Reviewer can audit the slice-002 diff against AC-002-1..10

**Goal**: The implementation PR is auditable: a reviewer can mechanically
confirm the eight authorized artifacts and only those.

**Independent test**: every validation gate in plan §Validation gates
passes a `grep`/file-existence check.

- [ ] T021 [US4] Verify exactly one lockfile and no `backend/`, `apps/api/`, `server/`, `worker/` paths exist *(AC-002-2, AC-002-4)*
- [ ] T022 [US4] Verify no hand-written `fetch(`/`axios` targets a Data-Pulse-2 path in hand-written `src/` (greppable) *(AC-002-5)*
- [ ] T023 [US4] Verify every `dependencies`+`devDependencies` entry in `package.json` cites a D-N in plan §Dependency trace *(AC-002-6, FR-002-006)*
- [ ] T024 [US4] **In the SAME commit as T014/T015**, promote `specs/001-console-foundation/api-readiness.md` §Cross-cutting "Generated-client toolchain + storage location" row from `deferred` to `openapi-typescript + openapi-fetch / src/generated/` — the ONLY permitted foundation-doc edit *(AC-002-7, AC-002-8, FR-002-004)*
- [ ] T025 [US4] Verify no secret pattern and no `.env*` file added (greppable) *(AC-002-9, C-8)*

**Checkpoint**: all ten validation gates pass; diff is audit-clean.

---

## Phase 5: Polish & Cross-Cutting

**Purpose**: Final consistency before the implementation PR opens.

- [ ] T026 [P] Run `quickstart.md` "After gate clearance" command sequence end-to-end and confirm it matches reality
- [ ] T027 Confirm `## Clarifications` covers every D-1..D-8 (AC-002-10 — already satisfied by `e766a76`; re-verify no regression)
- [ ] T028 Open the slice-002 implementation PR into `main` (fresh PR; #6 is already merged/closed) with the AC-002-1..10 checklist in the body

---

## Dependencies & Execution Order

### Phase dependencies
- **Setup (P1)**: starts after task-list approval (gate 3). No code dep.
- **Foundational (P2)**: needs P1 (manifest+lockfile) complete. **Blocks all DS phases.**
- **DS-1 (P3)**: needs P2 (configs + vendored client) complete.
- **DS-4 (P4)**: needs DS-1 (the diff to audit exists). T024 is bound to the same commit as T014/T015.
- **Polish (P5)**: needs all prior phases.

### Scenario dependencies
- **DS-1** is the MVP and hard prerequisite — everything else validates *its* output.
- **DS-2** (future dep added in slice 004) and **DS-3** (DP2 contract change → re-pin) are **out of slice-002 scope** — they describe what slice 002 *enables*, not work slice 002 does. No tasks generated for them by design (spec §6 + §3 non-goals).

### Within DS-1
- App shell (T016, T017) → smoke tests (T018, T019) → CI (T020 runs them).

### Parallel opportunities
- T009–T013 (configs, different files) run in parallel.
- T018 + T019 (unit + e2e smoke, different files) run in parallel.
- T002–T007 edit the same `package.json` → **sequential** (no [P]).

---

## Parallel Example: Foundational configs

```bash
# After T008 (lockfile) — launch the independent config files together:
Task: "Create tsconfig.json with strict:true (T009)"
Task: "Create vite.config.ts SPA build (T010)"
Task: "Create vitest.config.ts (T011)"
Task: "Create playwright.config.ts (T012)"
Task: "Create biome.json (T013)"
```

---

## Implementation Strategy

### MVP = DS-1 (the whole slice, effectively)
1. Phase 1 Setup → 2. Phase 2 Foundational (CRITICAL, blocks DS-1) →
3. Phase 3 DS-1 → **STOP & VALIDATE** (run the independent test) →
4. Phase 4 DS-4 audit → 5. Phase 5 Polish → open PR.

### Notes
- [P] = different files, no incomplete-task dependency.
- T002–T007 all touch `package.json` → never parallel.
- **T024 (api-readiness promotion) MUST ride in the same commit as the
  toolchain (T014/T015)** — AC-002-7 is a same-commit rule.
- Commit after each logical group; every commit is deliberate (R-10,
  `auto_commit=false`).
- The execution gate at the top is binding: do not run T001+ until the
  five readiness gates are owner-approved for this slice.

---

**End of Tasks: Tooling and Scaffold.** 28 tasks · DS-1 = 5 · DS-4 = 5 ·
Setup = 8 · Foundational = 7 · Polish = 3.

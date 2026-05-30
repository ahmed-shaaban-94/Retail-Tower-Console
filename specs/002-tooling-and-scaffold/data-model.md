# Phase 1 Data Model: Tooling and Scaffold

**Feature**: 002-tooling-and-scaffold
**Phase**: 1 — Design
**Date**: 2026-05-30
**Input**: [`plan.md`](./plan.md), [`research.md`](./research.md)

---

## Posture

This slice has **no application domain entities** — it owns no business
data and renders no UI (that is slices 003..009). Per Constitution
Principle 1 & 6 and C-7, this repository owns no backend semantics, no
schema, no SQL.

What slice 002 *does* have is a set of **configuration artifacts** — the
scaffold's "entities." Modeling them here gives the reviewer a precise,
typed inventory of what the implementation creates, with the
"validation rules" (constraints) each must satisfy. This is the
audit-clean analogue of a data model for a tooling slice.

---

## Configuration artifacts (the "entities")

Each artifact below maps to a §2 Goal (G-N) and one or more decisions
(D-N). "Cardinality: exactly one" is the load-bearing rule from spec §2.

### A-1 — Package manifest
- **File:** `package.json` (repository root)
- **Goal / Decision:** G-1 / D-1, D-8
- **Cardinality:** **exactly one** (AC-002-1)
- **Required fields:** `name`, `version`, `private: true`, `license`,
  plus framework-required scripts (`dev`, `build`, `test`, `test:e2e`,
  `lint`, `generate:client`).
- **Validation rules:** every `dependencies` + `devDependencies` entry
  traces to a D-N in plan §Dependency trace (AC-002-6); no top-level
  field beyond what the framework requires.

### A-2 — Lockfile
- **File:** `pnpm-lock.yaml` (repository root)
- **Goal / Decision:** G-2 / D-1
- **Cardinality:** **exactly one** — not zero, not two; not
  `package-lock.json`, not `yarn.lock` (AC-002-2).

### A-3 — TypeScript config
- **Files:** `tsconfig.json` (+ `tsconfig.node.json` for tooling)
- **Goal / Decision:** G-4 / D-8
- **Validation rules:** `"strict": true`; targets ES2022; `src/` and
  `src/generated/` both in scope.

### A-4 — Build config
- **File:** `vite.config.ts`
- **Goal / Decision:** G-3 / D-1
- **Validation rules:** SPA build (no SSR adapter); React plugin enabled.

### A-5 — Unit test config
- **File:** `vitest.config.ts` (or merged into `vite.config.ts`)
- **Goal / Decision:** G-6 / D-3
- **Validation rules:** coverage via `@vitest/coverage-v8`; no live
  Data-Pulse-2 dependency (C-5).

### A-6 — E2E test config
- **File:** `playwright.config.ts`
- **Goal / Decision:** G-6 / D-4
- **Validation rules:** runs against the built SPA; browsers cached in CI.

### A-7 — Lint/format config
- **File:** `biome.json`
- **Goal / Decision:** G-7 / D-5
- **Validation rules:** single tool for lint + format; understands TS +
  React.

### A-8 — Generated-client toolchain config
- **File:** `openapi-ts.config.ts`
- **Goal / Decision:** G-8 / D-2, C-4
- **Validation rules:** pins Data-Pulse-2 source to SHA `62d0906`;
  outputs to `src/generated/`.

### A-9 — Generated client output
- **Files:** `src/generated/schema.d.ts`, `src/generated/client.ts`
- **Goal / Decision:** G-8 / D-2, D-7
- **Cardinality:** committed (NOT `.gitignore`d) (AC-002-5)
- **Validation rules:** no hand-written API code elsewhere in `src/`;
  the only Data-Pulse-2 call surface.

### A-10 — Initial source tree
- **Files:** `index.html`, `src/main.tsx`, `src/App.tsx`
- **Goal / Decision:** G-5 / D-1
- **Validation rules:** frontend-only; **no** `backend/`, `apps/api/`,
  `server/`, `worker/` (AC-002-4); **no** RF-1..RF-7 UI (that is slices
  003..009); `App.tsx` is a placeholder shell only.

### A-11 — CI workflow
- **File:** `.github/workflows/ci.yml`
- **Goal / Decision:** G-9 / D-6
- **Cardinality:** **exactly one** workflow file (AC-002-3)
- **Validation rules:** Node 22 LTS, `ubuntu-latest`; steps install →
  build → lint → test → E2E per PR against `main`.

### A-12 — Smoke tests
- **Files:** `tests/unit/*.test.ts`, `tests/e2e/*.spec.ts`
- **Goal / Decision:** derivative of G-6
- **Validation rules:** prove the harness *runs* (toolchain smoke), not
  feature behavior; one per level.

---

## Relationships (dependency order)

```text
A-1 (package.json) ──depends on──> all decisions D-1..D-8
A-2 (lockfile)     ──derived from──> A-1
A-3 (tsconfig)     ──governs──> A-4, A-5, A-9, A-10
A-4 (vite)         ──hosts──> A-5 (vitest shares transform)
A-8 (openapi-ts)   ──produces──> A-9 (generated output)
A-9 (generated)    ──imported by──> A-10 (app), A-12 (tests)
A-11 (ci.yml)      ──runs──> A-4, A-5, A-6, A-7 (build/test/lint/e2e)
```

---

## Authorization note

No artifact here carries any tenant-, store-, or role-based
authorization opinion (Principle 7, foundation FR-002). The scaffold
renders nothing and decides nothing about access; it is pure tooling.

---

**End of Phase 1 Data Model: Tooling and Scaffold.**

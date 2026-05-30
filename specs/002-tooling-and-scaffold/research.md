# Phase 0 Research: Tooling and Scaffold

**Feature**: 002-tooling-and-scaffold
**Phase**: 0 — Outline & Research
**Date**: 2026-05-30
**Input**: [`plan.md`](./plan.md) Technical Context + [`spec.md`](./spec.md) §Clarifications

---

## R-0 Posture (read this first)

Slice 001's research **deferred** every stack decision. Slice 002's
`/speckit-clarify` (committed `e766a76`) **resolved** them. This document
records each resolution in the standard Decision / Rationale /
Alternatives format, so a future reviewer sees *why* each pick won
without re-reading the clarify transcript. Nothing here is a new
decision — it is the durable record of confirmed ones.

Every decision satisfies the inherited constraints C-1..C-8 (spec §4).

---

## R-1 — Frontend framework + build tool *(D-1)*

- **Decision:** **React 19 + Vite 6**, SPA mode (no SSR). Package manager
  **pnpm**.
- **Rationale:** An admin console needs no SSR/SEO, so a plain SPA
  suffices (foundation R-1 explicitly permits this). A plain SPA carries
  *zero* server code, which keeps the repo cleanly inside Principle 1 /
  C-7 (no `backend/` temptation). Vite pairs natively with Vitest (D-3),
  removing a separate transpile step. Same-origin deployment lets the
  browser auto-send the `dp2_session` HttpOnly cookie (C-2) with no token
  plumbing. React has the deepest OpenAPI-client and component ecosystem
  of the candidates.
- **Alternatives considered:** Next.js (rejected — ships a Node server,
  friction against frontend-only, tempts `app/api/` routes); SvelteKit
  (viable, smaller runtime, but smaller OpenAPI-client ecosystem);
  Solid/Vue (viable, no decisive advantage); HTMX/vanilla (raises
  per-screen effort). Electron and any backend-requiring framework ruled
  out by Principles 3/1/6.

## R-2 — Generated OpenAPI client toolchain *(D-2)*

- **Decision:** **openapi-typescript** (build-time type generation) +
  **openapi-fetch** (~6 KB runtime fetch wrapper). Local generation
  against Data-Pulse-2 `main` @ `62d0906` (C-4).
- **Rationale:** OQ-002-1 (resolved 2026-05-30) confirmed Data-Pulse-2
  publishes **no** client package ("intentionally deferred"), so the
  "consume upstream package" branch is dead — generation must be local
  and output vendored (D-7). `openapi-fetch` is fetch-based, so it sends
  the `dp2_session` cookie automatically same-origin and needs no
  `Authorization: Bearer` header (C-2, C-3). Type-only output is the
  lightest option and is framework-agnostic, so it does not pre-commit
  the state/data-fetching decision foundation R-4 reserves for slice 003.
- **Alternatives considered:** orval (rejected here — bundles React
  Query/Zod hooks, pre-empting R-4's slice-003 decision); openapi-generator
  / swagger-codegen (rejected — JVM toolchain, heavyweight output);
  hand-rolled wrapper (ruled out by Principle 8).

## R-3 — Unit/integration test framework *(D-3)*

- **Decision:** **Vitest** (+ `@vitest/coverage-v8`).
- **Rationale:** Shares Vite's transform pipeline (D-1) → no separate
  transpile; ESM-first and TS-native; mocks the generated client to
  satisfy the no-live-Data-Pulse-2 rule (C-5).
- **Alternatives considered:** Jest (rejected — needs a separate Vite
  transform, friction); Node native runner (rejected — minimal, weaker
  ecosystem for component testing).

## R-4 — E2E test framework *(D-4)*

- **Decision:** **Playwright** (`@playwright/test`), running in CI with
  browser binaries cached.
- **Rationale:** Foundation R-3 names it the likely choice; drives real
  evergreen browsers (C-1); runs against the SPA with a mocked client, no
  live backend (C-5).
- **Alternatives considered:** Cypress (rejected — heavier in CI, weaker
  multi-browser story than Playwright).

## R-5 — Lint + format toolchain *(D-5)*

- **Decision:** **Biome** (`@biomejs/biome`) — one tool for both.
- **Rationale:** Single binary, single config, fast; understands TS +
  React (D-1, D-8); avoids the two-tool ESLint+Prettier config surface
  for a greenfield repo.
- **Alternatives considered:** ESLint+Prettier (rejected here — more
  config surface, slower, two runtimes; reconsiderable per-slice if a
  Biome-unsupported rule is ever needed); dprint/oxlint (partial tools,
  would need pairing).

## R-6 — CI workflow shape *(D-6)*

- **Decision:** **GitHub Actions** `.github/workflows/ci.yml`; **Node 22
  LTS** pinned single version (not a matrix); **`ubuntu-latest`**; per-PR
  steps **install → build → lint → test → E2E** against `main`.
- **Rationale:** D-6 constraint requires install+build+test+lint per PR;
  Node 22 is the active LTS; a single-app admin console gains nothing
  from a Node matrix. CI runtime is explicitly **not** deployment runtime
  (FR-002-005). E2E in CI with cached Playwright browsers.
- **Alternatives considered:** Node matrix (rejected — unnecessary for one
  app); other CI products (N/A — the `.github/workflows/` path implies
  GitHub Actions).

## R-7 — Generated client storage location *(D-7)*

- **Decision:** **Vendored at `src/generated/`, committed (NOT
  `.gitignore`d).**
- **Rationale:** Forced by OQ-002-1 (no upstream package) + the D-7
  constraint that output be committed so CI is reproducible without
  running the generator. `src/generated/` is clearly separable from
  hand-written `src/` (AC-002-5).
- **Alternatives considered:** published-package consumption (foreclosed
  by OQ-002-1); `.gitignore`d + generate-in-CI (rejected — D-7 constraint
  requires committed output for reproducibility).

## R-8 — TypeScript posture *(D-8)*

- **Decision:** **TypeScript, strict mode** (`"strict": true`).
- **Rationale:** The D-8 constraint states plain JS "loses ~70% of the
  value of the generated client." Strict mode enforces the most at the
  API boundary, where the generated client (D-2) delivers value.
- **Alternatives considered:** TS non-strict (rejected — forfeits boundary
  safety); JS+JSDoc / plain JS (rejected — loses compile-time enforcement).

## R-9 — Repository structure *(OQ-002-3)*

- **Decision:** **Single-package repo** (no pnpm workspace / Turborepo /
  Nx). Owner-confirmed 2026-05-30.
- **Rationale:** Frontend-only, one app; a workspace adds structure with
  no current second consumer and would conflict with G-1's "one
  `package.json`" semantics; keeps D-7's `src/generated/` location
  unambiguous. Migration to a workspace remains a future-slice option.
- **Alternatives considered:** pnpm workspace / monorepo (rejected now —
  premature; conflicts with G-1).

## R-10 — Browser support breadth *(OQ-002-4)*

- **Decision:** **Desktop evergreen only** — retains the existing
  foundation C-1 default. Not a new decision.
- **Rationale:** The console is an admin surface; mobile is unusual and is
  a per-family slice decision per the foundation. Recorded so
  `/speckit-plan`/downstream do not re-raise it.

---

## Resolved NEEDS CLARIFICATION (spec-kit template)

| Template field | Resolution |
| --- | --- |
| Language / Version | R-8 — TypeScript strict, ES2022 → JS for evergreen browsers |
| Primary Dependencies | R-1 + R-2 — React 19 + Vite 6; openapi-typescript + openapi-fetch; pnpm |
| Storage | N/A (no client-side business storage; cookie carried by browser) |
| Testing | R-3 + R-4 — Vitest (unit) + Playwright (E2E) |
| Target Platform | R-10 — desktop evergreen browsers |
| Project Type | R-9 — web app, frontend-only, single-package |
| Performance Goals | per-family deferral (slice 002 owns no UI) |
| Constraints | C-1..C-8 (spec §4) |
| Scale / Scope | the eight authorized artifacts (spec §2) |

**Zero `[NEEDS CLARIFICATION]` markers remain** — every field resolved by
a confirmed clarify answer or an explicit N/A.

---

**End of Phase 0 Research: Tooling and Scaffold.**

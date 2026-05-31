# Quickstart: Tooling and Scaffold (historical planning workflow)

**Feature**: 002-tooling-and-scaffold
**Phase**: 1 — Design
**Date**: 2026-05-30

---

> **Current status (2026-05-31):** slice 002 implementation is merged on
> `origin/main` in `7ac4dfb` (PR #11). This file is retained as the historical
> planning/approval workflow. For current scaffold commands, use the root
> `README.md`. The generated schema is produced from Data-Pulse-2 @ `62d0906`.

## What this is

This quickstart describes the **planning + approval workflow** for slice
002. It mirrors the foundation slice's quickstart posture.

The implementation gate has since cleared for slice 002, so the "After gate
clearance" section is a record of the planned runbook, not the current source
of truth for local setup.

---

## Where we are (state @ 2026-05-30)

```text
[x] spec.md            merged (PR #6)
[x] §Clarifications    committed e766a76 — D-1..D-8 + OQ-002-3/4 resolved
[x] plan.md            merged
[x] research.md        written (records picks vs alternatives)
[x] data-model.md      written (config-artifact inventory)
[x] contracts/README   written (consumption contract)
[x] quickstart.md      THIS FILE
[x] tasks.md           produced by /speckit-tasks
[x] implementation     merged in PR #11; schema regenerated from `62d0906`
```

## The five readiness gates (constitution §Implementation readiness gates)

Implementation may begin only when ALL are owner-approved **for this
slice**:

1. [x] Spec approved — PR #6.
2. [x] Plan approved — merged before implementation.
3. [x] Task list approved — produced by `/speckit-tasks`.
4. [x] API dependency map approved — api-readiness @ `62d0906`; the
   generated-client row is promoted in the implementation commit
   (AC-002-7).
5. [x] Validation gates defined and approved — defined in plan
   §Validation gates.

## Planning workflow (the path forward)

```text
/speckit-clarify   ── done (e766a76)
       │
/speckit-plan      ── done (this plan + Phase 0/1 artifacts)
       │
/speckit-tasks     ── NEXT: produces tasks.md (dependency-ordered)
       │
   [STOP] ── present five-gate status; obtain EXPLICIT owner approval
       │     (Principle 9 + FR-002-007 — plan/tasks do NOT authorize
       │      implementation)
       │
/speckit-implement ── only after all five gates checked for this slice
```

## After gate clearance (historical runbook)

Once approved, the implementation slice was expected to (per plan
§Project Structure and §Dependency trace):

```bash
# 1. Scaffold (creates the eight authorized artifacts — Principle 9 files)
pnpm init                      # one package.json (G-1)
# add deps per plan §Dependency trace (each traces to a D-N)

# 2. Generate the vendored client (D-2, D-7) pinned to DP2 @ 62d0906
pnpm generate:client           # writes src/generated/ (committed)

# 3. Verify the validation gates (plan §Validation gates, AC-002-1..10)
pnpm install && pnpm build && pnpm lint && pnpm test && pnpm test:e2e

# 4. In the SAME commit as the toolchain: promote the api-readiness row
#    (AC-002-7) — the only permitted foundation-doc change.
```

> The five gates are now checked for slice 002. This block remains
> documentation of the plan; use the root `README.md` for current local
> commands.

---

**End of Quickstart: Tooling and Scaffold.**

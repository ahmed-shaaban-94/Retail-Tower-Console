# Quickstart: Tooling and Scaffold (planning workflow)

**Feature**: 002-tooling-and-scaffold
**Phase**: 1 — Design
**Date**: 2026-05-30

---

## What this is

This quickstart describes the **planning + approval workflow** for slice
002 — not a runtime setup runbook (no app exists yet; this slice is
planning-only until the implementation gate clears). It mirrors the
foundation slice's quickstart posture.

When the implementation gate eventually clears, this file's "After gate
clearance" section becomes the developer runbook. Until then it documents
the path from here to there.

---

## Where we are (state @ 2026-05-30)

```text
[x] spec.md            merged (PR #6)
[x] §Clarifications    committed e766a76 — D-1..D-8 + OQ-002-3/4 resolved
[x] plan.md            written (this slice) — pending owner review + merge
[x] research.md        written (records picks vs alternatives)
[x] data-model.md      written (config-artifact inventory)
[x] contracts/README   written (consumption contract)
[x] quickstart.md      THIS FILE
[ ] tasks.md           /speckit-tasks — next
[ ] implementation     GATED — needs all five readiness gates
```

## The five readiness gates (constitution §Implementation readiness gates)

Implementation may begin only when ALL are owner-approved **for this
slice**:

1. [x] Spec approved — PR #6.
2. [ ] Plan approved — this plan, pending review/merge.
3. [ ] Task list approved — `/speckit-tasks`, pending.
4. [x] API dependency map approved — api-readiness @ `62d0906`; the
   generated-client row is promoted in the implementation commit
   (AC-002-7).
5. [ ] Validation gates defined and approved — defined in plan
   §Validation gates; pending approval.

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

## After gate clearance (future runbook — not active yet)

Once approved, the implementation slice will (per plan §Project Structure
and §Dependency trace):

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

> Do not run any of the above until the five gates are checked. This
> block is documentation of the *plan*, not an instruction to execute.

---

**End of Quickstart: Tooling and Scaffold.**

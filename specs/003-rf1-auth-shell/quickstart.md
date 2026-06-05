# Quickstart: RF-1 Auth Shell & Active Context

**Feature**: 003-rf1-auth-shell
**Phase**: 1 — Design & Contracts
**Audience**: Reviewers of this PR; agents/humans opening the RF-1 implementation gate or later RF-2..RF-7 slices.

> **What this quickstart is.** A planning-phase walkthrough for understanding
> the RF-1 planning artifacts. It is **not** a runtime setup runbook — RF-1
> authorizes no `src/` code (FR-003-009/011). The slice-002 scaffold already
> documents "how to run the app"; this slice adds no runtime.

---

## 1. Read the RF-1 artifacts in this order

1. **[`spec.md`](./spec.md)** — surfaces SF-1/SF-2/SF-3, the seven consumed
   operations (§6), FR-003-001..FR-003-013, AC-1..AC-9, OQ-1..OQ-5.
2. **[`api-readiness.md`](./api-readiness.md)** — RF-1 rows `stable` (carried
   forward from foundation, pin `62d0906`); the one residual is CSRF (OQ-3).
3. **[`contracts/rf1-auth-context.md`](./contracts/rf1-auth-context.md)** — the
   seven operations mapped to the surface that consumes each.
4. **[`plan.md`](./plan.md)** — surface sequencing (SF-3 → SF-1 → SF-2), the
   deferral discipline, the validation-gate shape (VG-1..VG-4).
5. **[`research.md`](./research.md)** — R3-1..R3-6: the deferred RF-1 primitives
   (router/state/data-fetching/form/error-surface/i18n), each with its constraint.
6. (For context) **[`data-model.md`](./data-model.md)** — the render-side
   projection (E-1/E-2/E-3, ST-1, VD-1..VD-5).

---

## 2. Read the governance + upstream documents these reference

- `.specify/memory/constitution.md` (v1.0.1) — Principles 1/2/3/7/8/9/10.
- Foundation [`spec.md`](../001-console-foundation/spec.md) — §4 actors, §5 RF-1
  sequencing, FR-002/003/006/007/008/009.
- Foundation [`contracts/rf1-auth-context.md`](../001-console-foundation/contracts/rf1-auth-context.md)
  — the boundary this slice restates.
- Slice 002 [`spec.md`](../002-tooling-and-scaffold/spec.md) — D-1..D-8 (fixed
  stack), C-1..C-8 (constraints), OQ-002-2 (CSRF input).

If any of those changed since this PR opened, treat the changed document as the
source of truth and reconcile this slice's claims before merging.

---

## 3. Confirm RF-1 readiness still holds

Before opening the RF-1 implementation gate:

```text
1. Open api-readiness.md.
2. Confirm all three RF-1 rows are still `stable` (no demotion logged in foundation api-readiness §Verification log).
3. Confirm the pin is still 62d0906 (slice 002 C-4); if Data-Pulse-2 re-pinned, re-check the RF-1 contract surface.
4. Resolve the CSRF residual (OQ-3) against the pinned contract; record the result in api-readiness.md + spec.md OQ-3.
```

If a foundation RF-1 row was demoted, RF-1 planning must re-verify before
implementation.

---

## 4. The RF-1 implementation gate (FR-008, five gates)

RF-1 implementation begins only after **all five** are approved for slice 003:

1. Spec approved (this `spec.md`).
2. Plan approved (`plan.md`).
3. Task list approved (`tasks.md` — produced by `/speckit-tasks`, not yet present).
4. API dependency map approved (RF-1 rows `stable` + OQ-3 CSRF residual resolved).
5. Validation gates defined + approved (`plan.md` VG-1..VG-4; finalized in `tasks.md`).

---

## 5. Don't-do list (review-time scanning)

While this PR is open, in this repository do NOT:

- Create any `src/` file, route, component, hook, or test for RF-1.
- Pick RF-1's router/state/data-fetching/form/error-surface (deferred R3-1..R3-5).
- Add a dependency to `package.json` (requires Principle 9 approval in the impl phase).
- Regenerate or re-pin `src/generated/schema.d.ts`.
- Copy any byte of Data-Pulse-2 OpenAPI into a file here.
- Write a hand-rolled `fetch` targeting a Data-Pulse-2 path.
- Add a mock without explicit approval + `disposable: true` + a removal task.
- Consume any auth operation beyond the seven (no password-reset / email-verify).
- Add a POS sign-in / terminal surface (FR-003-013).
- Modify any foundation or slice-002 artifact (FR-003-010).

---

## 6. What's intentionally absent from this slice

So a reviewer can confirm nothing was overlooked vs. quietly omitted:

- **Router / state / data-fetching / form / error-surface choices.** Deferred to
  `/speckit-clarify` (research R3-1..R3-5).
- **`refreshSession` cadence + auto-select behavior.** Deferred to `plan.md`
  (spec OQ-2, OQ-4).
- **`tasks.md`.** Produced by the next Spec Kit command (`/speckit-tasks`), per
  slice, not at `/speckit-specify`.
- **Any UI code.** Gated by FR-008.

---

## 7. Files this slice adds

```
specs/003-rf1-auth-shell/spec.md
specs/003-rf1-auth-shell/plan.md
specs/003-rf1-auth-shell/research.md
specs/003-rf1-auth-shell/data-model.md
specs/003-rf1-auth-shell/api-readiness.md
specs/003-rf1-auth-shell/contracts/rf1-auth-context.md
specs/003-rf1-auth-shell/quickstart.md
specs/003-rf1-auth-shell/checklists/requirements.md
```

Eight markdown files. No source code. No package manifest. No CI. No deployment
files. No secrets. No change to any foundation or slice-002 file.

---

**End of Quickstart: RF-1 Auth Shell & Active Context.**

# Quickstart: RF-6 Audit / Search

**Feature**: 006-rf6-audit-search
**Phase**: 1 — Design & Contracts
**Audience**: Reviewers of this PR; agents/humans opening the RF-6 implementation gate or sibling RF-2..RF-7 slices.

> **What this quickstart is.** A planning-phase walkthrough for understanding the
> RF-6 planning artifacts. It is **not** a runtime setup runbook — RF-6
> authorizes no `src/` code (FR-006-010/012). The slice-002 scaffold already
> documents "how to run the app"; this slice adds no runtime.

---

## 1. Read the RF-6 artifacts in this order

1. **[`spec.md`](./spec.md)** — surfaces SF-6-1/SF-6-2, the one consumed
   operation (§6), the error matrix, FR-006-001..FR-006-013, AC-1..AC-10,
   OQ-1..OQ-6.
2. **[`api-readiness.md`](./api-readiness.md)** — RF-6 dual readiness (`stable`
   audit core / `draft` POS sub-rows; pin `62d0906`); residuals OQ-3 (actor
   matrix), OQ-5 (POS re-verify).
3. **[`contracts/rf6-audit-search.md`](./contracts/rf6-audit-search.md)** — the
   one operation mapped to its surface; the POS ingestion endpoint named only to
   assert it is **never** consumed.
4. **[`plan.md`](./plan.md)** — surface sequencing (attachment → SF-6-1 → SF-6-2),
   the reuse discipline (zero new dep), the validation-gate shape (VG-1..VG-4).
5. **[`research.md`](./research.md)** — R6-1..R6-6: the RF-6 decisions, each
   reusing an RF-1 primitive, with its constraint.
6. **[`design-brief.md`](./design-brief.md)** — the `/impeccable shape` output:
   the state matrix, the tables-over-cards + drawer + gold-scope-only direction.
7. (For context) **[`data-model.md`](./data-model.md)** — the render-side
   projection (E-6, reused E-3, the state matrix VD-6-*).

---

## 2. Read the governance + upstream documents these reference

- `.specify/memory/constitution.md` (v1.0.1) — Principles 1/2/3/6/7/8/9/10.
- Foundation [`spec.md`](../001-console-foundation/spec.md) — §4 actors (incl. A6
  POS boundary), §5 RF-6 definition + sequencing, §6 RF-6 dual readiness,
  FR-002/003/005/006/007/008/009/011/014.
- RF-1 [`spec.md`](../003-rf1-auth-shell/spec.md) and the merged RF-1 source RF-6
  attaches to / reasons about: `src/App.tsx`, `src/shell/AppShell.tsx`
  (`GATED_NAV`), `src/shell/ProtectedArea.tsx`, `src/lib/client.ts`,
  `src/lib/auth-interceptor.ts`, `src/context/useActiveContext.ts`.
- Slice 002 [`spec.md`](../002-tooling-and-scaffold/spec.md) — D-1..D-8 (fixed
  stack), C-1..C-8 (constraints).
- Upstream contracts (referenced, never copied): `audit.openapi.yaml`
  (`listAuditEvents`), `pos-audit-events.openapi.yaml` (`posAuditEventsSync` —
  NOT consumed; the POS `action` catalogue source).

If any of those changed since this PR opened, treat the changed document as the
source of truth and reconcile this slice's claims before merging.

---

## 3. Confirm RF-6 readiness still holds

Before opening the RF-6 implementation gate:

```text
1. Open api-readiness.md.
2. Confirm the audit core row is still `stable` and the POS sub-rows still `draft` (no demotion logged in foundation api-readiness §Verification log).
3. Confirm the pin is still 62d0906 (slice 002 C-4); if Data-Pulse-2 re-pinned, re-check the RF-6 contract surface.
4. Resolve OQ-3 (actor → RF-6 permission matrix) against the pinned authorization model; record the result in api-readiness.md + spec.md OQ-3.
5. If any POS-label-dependent feature is in scope, re-verify the POS sub-rows (OQ-5) before that feature's gate (FR-006-007).
```

---

## 4. The RF-6 implementation gate (FR-008, five gates)

RF-6 implementation begins only after **all five** are approved for slice 006:

1. Spec approved (this `spec.md`).
2. Plan approved (`plan.md`).
3. Task list approved (`tasks.md`).
4. API dependency map approved (audit core `stable`; OQ-3 actor matrix resolved;
   POS sub-rows re-verified per FR-006-007 if any POS-dependent feature is in
   scope).
5. Validation gates defined + approved (`plan.md` VG-1..VG-4; finalized in
   `tasks.md`).

---

## 5. Don't-do list (review-time scanning)

While this PR is open, in this repository do NOT:

- Create any `src/` file, route, component, hook, or test for RF-6.
- Re-pick RF-1's router/state/data-fetching primitives (reused, not re-decided).
- Add a dependency to `package.json` (none is needed; a genuine need is Principle 9).
- Regenerate or re-pin `src/generated/schema.d.ts`.
- Copy any byte of Data-Pulse-2 OpenAPI into a file here (POS catalogue values are
  referenced, not reproduced).
- Write a hand-rolled `fetch` targeting a Data-Pulse-2 path.
- Consume any operation beyond `listAuditEvents` — in particular **never**
  `posAuditEventsSync`, and never an invented single-event read.
- Add a POS sign-in / terminal / device-token surface (FR-006-013).
- Wire any mutation/export/annotation affordance (RF-6 is read-only, FR-006-009).
- Add a mock without explicit approval + `disposable: true` + a removal task.
- Modify any foundation, slice-002, or slice-003 *spec* artifact (FR-006-011); the
  three source shared-file touches are the only RF-1-source edits, and they are
  additive.

---

## 6. What's intentionally absent / deferred from this slice

So a reviewer can confirm nothing was overlooked vs. quietly omitted:

- **POS-specific labelling/filtering.** Deferred behind the `draft` POS sub-row
  re-verification (research R6-6, spec OQ-5). At this slice POS rows render
  generically.
- **The audit-401 defensive branch.** OQ-1 sub-question (b): if a backend drops
  the active tenant mid-session, distinguishing "no active tenant" from expiry may
  need a per-call interceptor opt-out — an **RF-1 amendment**, out of RF-6 scope.
- **Single-event read / export / mutation.** No backend op exists / out of scope
  (spec OQ-2, FR-006-001/009).
- **Sorting / column configuration.** Not in this slice; would be reconsidered with
  a headless-table dependency *then* (research R6-4).
- **Any UI code.** Gated by FR-008.

---

## 7. Files this slice adds

```
specs/006-rf6-audit-search/spec.md
specs/006-rf6-audit-search/plan.md
specs/006-rf6-audit-search/research.md
specs/006-rf6-audit-search/data-model.md
specs/006-rf6-audit-search/api-readiness.md
specs/006-rf6-audit-search/contracts/rf6-audit-search.md
specs/006-rf6-audit-search/design-brief.md
specs/006-rf6-audit-search/quickstart.md
specs/006-rf6-audit-search/tasks.md
specs/006-rf6-audit-search/checklists/requirements.md
docs/design/rf6-audit-search/README.md
docs/design/rf6-audit-search/tokens.css
docs/design/rf6-audit-search/sf6-audit-search.mockup.html
docs/design/rf6-audit-search/sf6-row-inspect.mockup.html
```

Planning markdown + design mockups only. No source code. No package manifest. No
CI. No deployment files. No secrets. No change to any foundation / slice-002 /
slice-003 *spec* file. (The `docs/design/**` mockups are biome-ignored and
Vite-uncompiled, mirroring the slice-003 precedent.)

---

**End of Quickstart: RF-6 Audit / Search.**

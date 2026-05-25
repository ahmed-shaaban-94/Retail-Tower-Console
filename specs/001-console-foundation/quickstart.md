# Quickstart: Console Foundation

**Feature**: 001-console-foundation
**Phase**: 1 — Design & Contracts
**Audience**: Reviewers of this PR; agents and humans opening downstream slices.

> **What this quickstart is.** A planning-phase walkthrough for someone
> who needs to understand or work with the foundation artifacts. It is
> **not** a runtime setup runbook — there is no runtime yet (per
> Principle 9 / FR-007, no scaffold exists). When the scaffold slice
> (`002-tooling-and-scaffold`) ships, *that* slice owns the
> "how to run the app locally" quickstart.

---

## 1. Read the four foundation artifacts in this order

1. **[`spec.md`](./spec.md)** — actors A1–A7, route families RF-1..RF-7,
   functional requirements FR-001..FR-014, acceptance criteria AC-1..AC-10,
   open questions OQ-1..OQ-7, scope deferrals SD-1.
2. **[`api-readiness.md`](./api-readiness.md)** — current Data-Pulse-2
   verification state per route family. Plan gate decision:
   `/speckit-plan` status is **ready** as of 2026-05-25.
3. **[`plan.md`](./plan.md)** (this PR) — sequencing, Constitution Check,
   deferral discipline, per-family slice ordering.
4. **[`research.md`](./research.md)** (this PR) — R-1..R-11. Each
   research item is an *explicitly deferred* stack decision with the
   constraint(s) any future answer must satisfy.
5. (Then, for context) **[`data-model.md`](./data-model.md)** and
   **[`contracts/`](./contracts/)** — read-side projection of upstream
   entities and the RF-1 consumption boundary.

---

## 2. Read the governance documents these artifacts reference

- `.specify/memory/constitution.md` — v1.0.0. The ten principles each
  artifact above anchors to. Required reading once.
- `docs/agent-os/maestro-playbook.md` — slice lifecycle, stop rules,
  mock rule, escalation. Required reading once.
- `docs/product/repo-boundaries.md` — ownership matrix vs Data-Pulse-2
  and POS-Pulse.

If any of those have changed since this PR opened, treat the changed
document as the source of truth and reconcile this PR's claims to it
before merging.

---

## 3. Verify the Plan gate decision still holds

Before merging this PR (or before opening slice `002-tooling-and-scaffold`):

```text
1. Open api-readiness.md.
2. Confirm §Plan gate decision shows /speckit-plan status: ready.
3. Confirm Gate-lift condition 1 (RF-1 → draft) still references a Data-Pulse-2 SHA you trust.
4. Confirm Gate-lift condition 2 (RF-4b deferred via SD-1) still points at spec.md §11.
5. If either condition has been invalidated (e.g., RF-1 row demoted back to unknown by a re-verification), this PR's plan should not merge as-is.
```

If both conditions still hold, the foundation plan is mergeable.

---

## 4. Open the next slice

After this PR merges to `main`:

1. **Slice `002-tooling-and-scaffold`** opens first. Its
   `planning/spec` cites this plan's `## Technical Context` constraints
   and `research.md` R-1 through R-5 as inputs. The slice is the first
   to authorize:
   - `package.json` + lockfile
   - Framework / build tool / test framework choices
   - Generated client toolchain + storage location
   - The initial source tree shape (frontend-only)
   - `.github/workflows/` for build + test + lint
2. **Slice `003-rf1-auth-shell`** opens *after* slice `002` merges.
   It is the first slice that implements UI. It establishes the auth
   shell, route guards, active-context provider, error rendering for
   401/403/404/409/429/5xx, and session refresh strategy.
3. **Slices `004` through `009`** are RF-2..RF-7 per-family work in the
   order recorded in `plan.md` §Per-family slice ordering. Each opens
   its own `planning/spec` first, then verifies its api-readiness rows,
   then plans, then implements — five gates per slice (FR-008).

Each slice is a fresh `NNN-short-name` feature branch from `main`,
matching the pattern PR #1 / #2 / #3 used for this foundation.

---

## 5. Per-family slice opening checklist

When opening any of slices `004` through `009`:

```text
[ ] /speckit-specify with a clear feature description
[ ] Verify the api-readiness row(s) for the family against Data-Pulse-2 main
    (record findings in api-readiness.md AND spec.md §6 in the same edit
     — sync rule per api-readiness.md §How to update this file)
[ ] Confirm no row stays `unknown` before the slice's `/speckit-plan` runs
[ ] If any row resolves to `blocked`, decide:
        - scope it out via a new SD-N in spec.md (FR-009-symmetric amendment), OR
        - wait for upstream to unblock, OR
        - close the slice as not-yet-feasible.
[ ] If the family touches POS-originated data, re-confirm Principle 3
    boundary (read-only on this side; no write-back)
[ ] If the family appears to need backend authorization logic on the
    frontend, STOP — that's FR-002 / Principle 7 violation territory
```

---

## 6. Don't-do list (lift from the constitution; restated here for review-time scanning)

While this PR is open, do not, in this repository:

- Create `package.json`, lockfiles, framework configs, `src/`, `app/`,
  `pages/`, `components/`, `tests/`, `e2e/`, `.github/workflows/`,
  Dockerfiles, deployment configs, or `.env*` files.
- Copy any byte of Data-Pulse-2 OpenAPI content into a file in this repo.
- Write a hand-rolled HTTP client targeting a Data-Pulse-2 endpoint.
- Add a mock without explicit human approval + `disposable: true`
  marking + a removal task (Maestro playbook §Mock rule).
- Add a secret, credential, or environment-specific value.
- Reshape the constitution or the foundation spec without opening a
  separate slice for the amendment.

---

## 7. What's intentionally absent from this foundation

So a reviewer can confirm nothing was overlooked vs. quietly omitted:

- **A framework choice.** Deferred to slice `002` (research §R-1).
- **A generated client toolchain.** Deferred to slice `002` (R-2).
- **A test framework.** Deferred to slice `002` (R-3).
- **State management, styling, routing, error UX.** Deferred to slice
  `003` (R-4 through R-7).
- **i18n, observability tooling.** Deferred to slices `003` / `011`
  (R-8).
- **Per-family RF-2/3/5/6/7 API readiness resolution.** Each is its
  own slice's responsibility (R-11).
- **`/speckit-tasks` output.** This plan ends after Phase 1.
  `/speckit-tasks` is the next spec-kit command and would produce
  `tasks.md` — but that should run **per slice**, not for the
  foundation. The foundation plan's "tasks" are the slices themselves
  (see `plan.md` §Per-family slice ordering).

---

## 8. Files this PR adds

```
specs/001-console-foundation/plan.md
specs/001-console-foundation/research.md
specs/001-console-foundation/data-model.md
specs/001-console-foundation/contracts/README.md
specs/001-console-foundation/contracts/rf1-auth-context.md
specs/001-console-foundation/quickstart.md
```

Six markdown files. No source code. No package manifest. No CI. No
deployment files. No secrets.

Also updated: `CLAUDE.md` (the SPECKIT-marker block points to this
plan).

---

**End of Quickstart: Console Foundation.**

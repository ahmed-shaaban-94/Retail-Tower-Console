# Quickstart: RF-2 Tenant / Store Management

**Feature**: 004-rf2-tenant-store-mgmt
**Phase**: 1 — Design & Contracts
**Audience**: Reviewers of this PR; agents/humans opening the RF-2 implementation gate or later RF-3..RF-7 slices.

> **What this quickstart is.** A planning-phase walkthrough for understanding the
> RF-2 planning artifacts. It is **not** a runtime setup runbook — RF-2
> authorizes no `src/` code (FR-004-009/011). The slice-002 scaffold already
> documents "how to run the app"; this slice adds no runtime.

---

## 1. Read the RF-2 artifacts in this order

1. **[`spec.md`](./spec.md)** — surfaces SF-T1/T2/T3, SF-S1/S2/S3, SF-L; the ten
   consumed operations (§6); FR-004-001..FR-004-013; AC-1..AC-10; OQ-1..OQ-8.
2. **[`api-readiness.md`](./api-readiness.md)** — RF-2 rows `stable` (carried
   forward from foundation, pin `62d0906`); the residual is CSRF (OQ-6), resolved.
3. **[`contracts/rf2-tenant-store.md`](./contracts/rf2-tenant-store.md)** — the
   ten operations mapped to the surface that consumes each; the excluded ops.
4. **[`plan.md`](./plan.md)** — surface sequencing (tenant then store), the reuse
   discipline, the shared-file touches, the validation-gate shape (VG-1..VG-5).
5. **[`research.md`](./research.md)** — R4-1..R4-6: the **reuse** decisions for
   each RF-2 primitive (zero new dependency).
6. **[`design-brief.md`](./design-brief.md)** — the impeccable `shape` brief
   (self-confirmed, headless): the state matrix per surface, the visual contract
   extended from RF-1.
7. (For context) **[`data-model.md`](./data-model.md)** — the render-side
   projection (E-4 Tenant, E-5 Store, E-3 active context read from RF-1).

---

## 2. Read the governance + upstream documents these reference

- `.specify/memory/constitution.md` (v1.0.1) — Principles 1/2/3/5/7/8/9/10.
- Foundation [`spec.md`](../001-console-foundation/spec.md) — §4 actors, §5 RF-2
  definition + sequencing, §6 RF-2/RF-5 rows, FR-002/003/006/007/008/009.
- Slice 002 [`spec.md`](../002-tooling-and-scaffold/spec.md) — D-1..D-8 (fixed
  stack), C-1..C-8.
- RF-1 (reused) [`spec.md`](../003-rf1-auth-shell/spec.md) +
  [`plan.md`](../003-rf1-auth-shell/plan.md) — the shell, active-context
  provider, error surface, and client wiring RF-2 attaches to.

If any of those changed since this PR opened, treat the changed document as the
source of truth and reconcile this slice's claims before merging.

---

## 3. Confirm RF-2 readiness still holds

Before opening the RF-2 implementation gate:

```text
1. Open api-readiness.md.
2. Confirm both RF-2 rows are still `stable` (no demotion logged in foundation api-readiness §Verification log).
3. Confirm the pin is still 62d0906 (slice 002 C-4); if Data-Pulse-2 re-pinned, re-check the tenant/store contract surfaces.
4. Confirm the CSRF residual (OQ-6) still holds against the pinned tenant/store contracts; it is resolved (cookieAuth, no CSRF token).
```

If a foundation RF-2 row was demoted, RF-2 planning must re-verify before
implementation.

---

## 4. The RF-2 implementation gate (FR-008, five gates)

RF-2 implementation begins only after **all five** are approved for slice 004:

1. Spec approved (this `spec.md`).
2. Plan approved (`plan.md`).
3. Task list approved (`tasks.md`).
4. API dependency map approved (RF-2 rows `stable` + OQ-6 CSRF residual resolved).
5. Validation gates defined + approved (`plan.md` VG-1..VG-5; finalized in
   `tasks.md`), including the **no-frontend-authorization assertion** (VG-5).

---

## 5. Don't-do list (review-time scanning)

While this PR is open, in this repository do NOT:

- Create any `src/` file, route, component, hook, or test for RF-2.
- Edit `src/shell/AppShell.tsx` (GATED_NAV "Stores") or `src/lib/router.tsx` —
  those are the implementation slice's tracked shared-file touches, not planning
  edits.
- Re-pick RF-2's router/state/data-fetching/form/table/error primitives — they
  are **reused** from RF-1 (research R4-1..R4-5).
- Add a dependency to `package.json` (RF-2 expects to add **none**).
- Regenerate or re-pin `src/generated/schema.d.ts`.
- Copy any byte of Data-Pulse-2 OpenAPI into a file here (no field name, slug
  pattern, status enum, or validation rule literal).
- Write a hand-rolled `fetch` targeting a Data-Pulse-2 path.
- Add a mock without explicit approval + `disposable: true` + a removal task.
- Consume any operation beyond the ten (no `listMembers`, no
  `memberships.openapi.yaml`, no new context operation).
- Add any frontend authorization (no role-based pre-hide/pre-disable; no
  client-side list filter; roles are display-only).
- Add a POS surface (FR-004-013).
- Modify any foundation, slice-002, or RF-1 spec artifact (FR-004-010).

---

## 6. What's intentionally absent from this slice

So a reviewer can confirm nothing was overlooked vs. quietly omitted:

- **Membership / operator management** (`listMembers`, `memberships.openapi.yaml`)
  — RF-5, not RF-2 (FR-004-001).
- **New stack primitives.** RF-2 reuses RF-1's (research R4-1..R4-5); none added.
- **`tasks.md` execution.** `tasks.md` is a plan of record; nothing executes
  until the FR-008 gate clears.
- **Any UI code, and the two shared-file edits.** Gated by FR-008.

---

## 7. Files this slice adds

```
specs/004-rf2-tenant-store-mgmt/spec.md
specs/004-rf2-tenant-store-mgmt/plan.md
specs/004-rf2-tenant-store-mgmt/research.md
specs/004-rf2-tenant-store-mgmt/data-model.md
specs/004-rf2-tenant-store-mgmt/api-readiness.md
specs/004-rf2-tenant-store-mgmt/design-brief.md
specs/004-rf2-tenant-store-mgmt/contracts/rf2-tenant-store.md
specs/004-rf2-tenant-store-mgmt/quickstart.md
specs/004-rf2-tenant-store-mgmt/tasks.md
specs/004-rf2-tenant-store-mgmt/checklists/requirements.md
```

Ten markdown files. No source code. No package manifest. No CI. No deployment
files. No secrets. No change to any foundation, slice-002, or RF-1 file.

---

**End of Quickstart: RF-2 Tenant / Store Management.**

# Implementation Plan: RF-4a Unknown-Items Review Queue

**Branch**: `feat/console-rf4a-unknown-items` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Companion artifacts**:
- [research.md](./research.md) — Phase 0 (reuse + boundary decisions R4a-1..R4a-6)
- [data-model.md](./data-model.md) — Phase 1 (render-side projection; no owned model)
- [contracts/rf4a-unknown-items.md](./contracts/rf4a-unknown-items.md) — Phase 1 (the 3-op consumption boundary)
- [design-brief.md](./design-brief.md) — Phase 1 design (surfaces + state matrix)
- [api-readiness.md](./api-readiness.md) — runtime/contract gate carried forward
- [checklists/requirements.md](./checklists/requirements.md) — spec quality checklist

> **Mode contract.** Implementation. This plan sequences the RF-4a read surface
> against the three runtime-merged `catalog/unknown-items.yaml` ops and reuses
> the merged RF-1/RF-2 stack with zero new runtime dependency. It does NOT
> re-open RF-1/RF-2 primitives and does NOT authorize RF-4b / reopen /
> bulk-dismiss.

---

## Summary

RF-4a attaches a content route family to the merged RF-1 shell, mirroring RF-2's
structure: a typed data layer (`src/lib/unknown-items-queries.ts`), TanStack
Query hooks, and presentational surfaces under `src/unknown-items/`, wired by a
route fragment (`src/shell/rf4aRoutes.tsx`) mounted in `App.tsx`. It consumes
exactly three generated ops and reuses the shared presenters. The codegen pin is
unchanged (`62d0906`); the `catalog/unknown-items.yaml` source is added to
`openapi-ts.config.ts` and the client regenerated at the same SHA.

## Constitution / gate check

- **Principle 8 (single DP-2 call surface):** all calls via the generated
  client (VG-3). PASS by construction.
- **Principle 7 (no frontend authorization):** no role-conditioned hiding
  (VG-5). PASS.
- **Runtime gate:** three consumed ops have controller routes at `62d0906`
  (see api-readiness.md). PASS.
- **No new dependency:** reuses `@tanstack/react-query`, `openapi-fetch`,
  `react-router`. PASS.

## Phases

- **Phase 0 — research** (done): R4a-1..R4a-6.
- **Phase 1 — design** (done): data-model, contracts, design-brief.
- **Phase 2 — codegen**: add `UnknownItems` source to `openapi-ts.config.ts`;
  `pnpm generate:client`; confirm List/Inspect/Dismiss ops appear.
- **Phase 3 — data layer**: `src/lib/unknown-items-queries.ts` (wrappers + query
  keys + `mapUnknownItemError`) and `src/unknown-items/useUnknownItemQueries.ts`
  (TanStack hooks).
- **Phase 4 — surfaces**: `UnknownItemList.tsx`, `UnknownItemInspectDrawer.tsx`,
  `UnknownItemDismiss.tsx`, `useUnknownItemScope.ts`; route fragment
  `src/shell/rf4aRoutes.tsx`; mount in `App.tsx`.
- **Phase 5 — tests**: unit (error mapping, list/inspect render, dismiss flow),
  boundary (`tests/unit/rf4a-boundary.test.ts` VG-3/VG-4/VG-5), e2e + a11y.
- **Phase 6 — validation**: `pnpm build` (typecheck), `pnpm test`, `pnpm lint`,
  boundary test, regen-ops check.

## Reuse map (no new shared primitives)

| Need | Reused from |
| --- | --- |
| typed wrappers + error map | `src/lib/rf2-queries.ts` pattern |
| list table | `src/components/DataTable.tsx` |
| inspect panel | `src/components/Drawer.tsx` |
| dismiss confirm | `src/components/ConfirmDelete.tsx` |
| states | `src/components/ListState.tsx` / `Banner.tsx` |
| scope binding | `src/stores/useStoreScope.ts` pattern |
| route wiring | `src/shell/rf2Routes.tsx` pattern + `App.tsx` |

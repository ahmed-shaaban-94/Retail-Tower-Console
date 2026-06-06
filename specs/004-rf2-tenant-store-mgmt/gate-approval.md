# FR-008 Implementation Gate Approval — Slice 004 (RF-2 Tenant / Store Management)

**Date:** 2026-06-06
**Owner / approver:** Ahmed Shaaban (repository owner)
**Branch:** `004-rf2-impl`
**Authority:** Constitution v1.0.1 §Implementation readiness gates; foundation FR-008.

> This file records the owner's explicit approval to begin RF-2 implementation.
> The owner instructed implementation directly ("Sequential 004 -> 005 -> 006 …
> fire"). The gate guards against accidental scope creep, not the owner's direct,
> recorded instruction. This is the written trail the constitution requires. A
> gate cleared for slice 003 does **not** carry to 004; this is the per-slice
> record FR-008 demands.

## Five-gate checklist (Constitution v1.0.1)

- [x] **Spec approved** — `spec.md` (clarified Session 2026-06-06; PR #25).
- [x] **Plan approved** — `plan.md` (primitives resolved as reuse of RF-1; PR #25).
- [x] **Task list approved** — `tasks.md` (36 tasks; PR #25; analyze 0-critical,
      verify-audited, phantom-path + interceptor framing corrected pre-merge).
- [x] **API dependency map approved** — `api-readiness.md` + `contracts/rf2-tenant-store.md`:
      both RF-2 rows (`tenants.openapi.yaml` 5 ops, `stores.openapi.yaml` 5 ops)
      `stable` @ pin `62d0906`. The ten operations confirmed present in the pinned
      contracts (verified at implementation start). CSRF posture re-confirmed
      (OQ-6): global `security: [cookieAuth: []]`, no CSRF token/header in either
      contract — no CSRF plumbing.
- [x] **Validation gates defined and approved** — VG-1 (Vitest coverage), VG-2
      (Playwright journeys S1–S8), VG-3 (boundary grep), VG-4 (no-scope-creep grep),
      VG-5 (no-frontend-authorization assertion), per `plan.md` and `tasks.md`
      Polish phase.

## Constitution Principle 9 — dependency approval

**No new runtime dependency is added by slice 004.** RF-2 reuses RF-1's resolved
primitives verbatim (verified against `package.json` at implementation start):

- `react-router` — RF-2 routes register inside RF-1's protected boundary (R4-1).
- `@tanstack/react-query` — data fetching for the ten operations; reads scope from
  RF-1's `ActiveContextProvider` cache (R4-1/R4-2).
- `openapi-fetch` (generated client) — the only DP2 call surface (Principle 8).
- Form handling (uncontrolled native) + error surface (`Banner` + `InlineError`)
  reused from RF-1 — add **no** dependency.

If any implementation decision nonetheless requires a new dependency, work STOPS
until a separate Principle 9 approval is recorded (FR-004-009). None is anticipated.

## openapi-ts.config.ts edit — regeneration, NOT a re-pin (T003)

The implementation adds `tenants.openapi.yaml` + `stores.openapi.yaml` to
`OPENAPI_SOURCES` in `openapi-ts.config.ts` and re-runs `pnpm generate:client`
**at the same Data-Pulse-2 pin `62d0906`** so `src/generated/schema.d.ts` exposes
the ten RF-2 operations. This is **regeneration at the unchanged pinned SHA**, not
a re-pin (`DATA_PULSE_2_PIN` is unchanged). It edits a slice-002 scaffold config
surface; this is the explicit acknowledgment of that touch at the gate. The
generated output is never hand-edited.

## Scope reaffirmed

- Consumes exactly the ten RF-2 operations
  (`listTenants`/`readTenant`/`createTenant`/`updateTenant`/`softDeleteTenant`,
  `listStores`/`readStore`/`createStore`/`updateStore`/`softDeleteStore`).
- `listMembers` and all of `memberships.openapi.yaml` stay excluded (RF-5).
- Adds **zero** new context operation; reads scope via RF-1's provider (OQ-5).
- Generated client consumed as-is from `src/generated/`; client.ts unchanged by
  regeneration.
- No backend/schema/migration/OpenAPI/POS code (Principles 1, 3, 6).
- No frontend authorization: backend-scoped lists, actions never pre-hidden by
  role, roles display-only, 403 rendered on attempt (Principle 7, FR-004-004).
- Tests use a `disposable: true` mock (FR-004-012) with a removal task (T036);
  never live DP2.

## Build order (plan.md)

Setup → Foundational (RF-2 query/error mapping, shared table/list/confirm, routes,
"Stores" + "Tenants" nav) → Tenant surfaces (SF-T1→T2→T3, **MVP — STOP and
VALIDATE**) → Store surfaces (SF-S1→S2→S3) → Polish. TDD per surface (VG-1/VG-2
are gate items, not optional).

## Resolved at gate (the second-meaning-of-401, OQ-4 / OQ-10)

`listStores`/`createStore` return **`401` "No active tenant"** — a scope
precondition, a *second meaning* of `401` distinct from session expiry. Verified
against the merged RF-1 code: `createAuthRetry` (`src/lib/auth-interceptor.ts`) is
**not** global middleware — it is a `useRef`-local in
`src/context/useActiveContext.ts` wrapping **only** the `getActiveContext` query.
A `401` from a *new* RF-2 operation therefore does **not** flow through RF-1's
refresh-then-sign-out path. **Resolution: option (a) — pre-gate store calls on the
active tenant** read from `ActiveContextProvider`; no active tenant → route to the
RF-1 scope chooser, never issue the call. A residual scope-`401` (scope went stale
between gate and call) renders as a scope prompt directly, with **no** refresh
attempt. **No interceptor edit; no shared-file touch on `auth-interceptor.ts`.**
The verify agent's "interceptor touch is mandatory" finding rested on the false
premise that the interceptor is global; it is not.

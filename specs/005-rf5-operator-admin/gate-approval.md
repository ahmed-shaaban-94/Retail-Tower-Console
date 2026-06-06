# FR-008 Implementation Gate Approval — Slice 005 (RF-5 Operator / Admin Management)

**Date:** 2026-06-06
**Owner / approver:** Ahmed Shaaban (repository owner)
**Branch:** `005-rf5-impl`
**Authority:** Constitution v1.0.1 §Implementation readiness gates; foundation FR-008.

> Records the owner's explicit approval to begin RF-5 implementation. The owner
> instructed implementation directly ("fire 005 … to do list") in the sequential
> 004 → 005 → 006 arc. The gate guards against accidental scope creep, not the
> owner's direct, recorded instruction. A gate cleared for slice 004 does **not**
> carry to 005; this is the per-slice record FR-008 demands.

## Five-gate checklist (Constitution v1.0.1)

- [x] **Spec approved** — `spec.md` (clarified Session 2026-06-06; PR #26).
- [x] **Plan approved** — `plan.md` (primitives resolved as reuse of RF-1; PR #26).
- [x] **Task list approved** — `tasks.md` (36 tasks; PR #26; verify-audited).
- [x] **API dependency map approved** — `api-readiness.md` + `contracts/rf5-operator-admin.md`:
      five operations confirmed present in the regenerated client at pin `62d0906`
      (`listMembers` from `tenants.openapi.yaml`; `createInvitation`/
      `updateMembership`/`revokeMembership`/`acceptInvitation` from
      `memberships.openapi.yaml`). Verified at implementation start: the four
      paths `/api/v1/tenants/{tenant_id}/members`, `/api/v1/memberships/invite`,
      `/api/v1/memberships/{membership_id}`, `/api/v1/invitations/accept` resolve.
- [x] **Validation gates defined and approved** — VG-1 (Vitest coverage), VG-2
      (Playwright journeys S1–S7), VG-3 (boundary grep), VG-4 (POS-boundary grep:
      no `/api/pos/`, no `pos-operators`, no RF-2 `listStores` **in RF-5 files**),
      per `plan.md` and `tasks.md` Polish phase.

## Constitution Principle 9 — dependency approval

**No new runtime dependency is added by slice 005.** RF-5 reuses RF-1's resolved
primitives (react-router, @tanstack/react-query, openapi-fetch generated client,
ActiveContextProvider, Banner/InlineError, uncontrolled native forms) — verified
against `package.json` at implementation start. The client-generated
`Idempotency-Key` uses the platform `crypto.randomUUID()` (a v4 UUID satisfies
the contract format `^[\x21-\x7E]{16,128}$`); no UUID library is added.

## openapi-ts.config.ts edit — regeneration, NOT a re-pin (T002)

Added `memberships.openapi.yaml` to `OPENAPI_SOURCE_SPECS` and re-ran
`pnpm generate:client` **at the unchanged pin `62d0906`** so `schema.d.ts` exposes
the RF-5 membership ops. (`tenants.openapi.yaml`, which carries `listMembers`, was
already a source from slice 004.) This is regeneration at the unchanged pinned SHA,
not a re-pin (`DATA_PULSE_2_PIN` unchanged). It edits a slice-002 scaffold config
surface; this is the explicit acknowledgment of that touch at the gate. Generated
output is never hand-edited.

## Scope reaffirmed

- Consumes exactly the five RF-5 operations (`listMembers`, `createInvitation`,
  `updateMembership`, `revokeMembership`, `acceptInvitation`).
- Adds **zero** new context operation; reads `active_tenant.id` via RF-1's
  provider (FR-005-006).
- No POS-operator op, no `/api/pos/v1/*`, no RF-2 `listStores` (Principle 3,
  FR-005-001/013) — enforced by VG-4.
- No frontend authorization: backend 403/404 rendered verbatim, roles
  display-only (Principle 7, FR-005-004).
- Tests use a `disposable: true` mock (FR-005-014) with a removal task; never live DP2.

## Resolved at gate (OQ-1: the precondition-401, scoped to createInvitation)

Only `createInvitation` has a second 401 cause ("No active tenant", a
precondition; session still valid). Verified against the merged RF-1 code:
`createAuthRetry` (`src/lib/auth-interceptor.ts`) refreshes once on a 401 and
calls `onSessionLost()` only if the refresh itself fails. RF-5 wraps **only
`createInvitation`** with its **own** `createAuthRetry` instance: a 401 where the
refresh **fails** → sign-out (expiry); a 401 that **survives a successful
refresh** → precondition → route to the RF-1 scope chooser, never sign-out. The
discriminator is whether the injected `onSessionLost` fired. `listMembers`/
`updateMembership`/`revokeMembership` document no precondition 401 and use the
standard wrapper; the `listMembers` active-tenant precondition is guarded
*before* the call. No RF-1 modification; per-attempt-local interceptor instance.

## CSRF / security posture (T004)

Re-confirmed against the regenerated client + the memberships contract @ `62d0906`:
the mutating ops carry only the global `security: [cookieAuth: []]` with no CSRF
header/parameter; `acceptInvitation` is `security: []` (public — the accept token
in the body authenticates it). RF-5 inherits RF-1's `credentials: "include"`
posture; no CSRF plumbing. `Idempotency-Key` is a header, not a credential.

## Build order (plan.md)

Setup → Foundational (client wrappers, member query, **401-disambiguation**,
idempotency) → SF5-1 member list → SF5-2/3 invite + edit/revoke (**MVP — STOP and
VALIDATE**) → SF5-4 public accept → Polish. TDD per surface (VG-1/VG-2 are gate
items, not optional).

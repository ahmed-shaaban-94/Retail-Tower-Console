# API Readiness — 003 RF-1 Auth Shell & Active Context

| Field | Value |
| --- | --- |
| Spec | [spec.md](./spec.md) |
| Feature ID | 003 |
| Short name | rf1-auth-shell |
| Branch | `003-rf1-auth-shell` |
| Mode | Planning-only (per-slice readiness carried forward from foundation) |
| Owner | Ahmed Shaaban |
| Created | 2026-06-05 |
| Data-Pulse-2 pin | `62d0906` (slice 002 C-4 — the SHA the generated client is produced against) |
| Status | All three RF-1 rows `stable`, **carried forward by reference** from [`../001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md) §RF-1. This file does not re-derive or re-classify them. One residual re-verification before the implementation gate: CSRF posture (OQ-3). |

---

## Purpose

This is the per-slice readiness artifact for RF-1. It exists to:

1. **Carry forward** the foundation RF-1 `stable` verification by reference, so
   the RF-1 plan/tasks can cite a single per-slice readiness record (foundation
   `api-readiness.md` §How to update — downstream slices do not re-verify a
   `stable` row unless a demotion has been logged).
2. **Record the one residual** RF-1 must re-confirm before its FR-008
   implementation gate clears: the CSRF posture on the six POSTs + one DELETE
   (spec OQ-3 / foundation contract MUST-re-verify flag).
3. **Satisfy FR-005** (re-verify a non-`stable` residual before the
   implementation gate) and **FR-011** (no optimistic classification).

This file does **not** copy Data-Pulse-2 OpenAPI content (reference only) and
does **not** authorize implementation (FR-008 five-gate approval still required).

---

## Status legend

Same four statuses as foundation `spec.md` §6 / `api-readiness.md` (no
additional statuses): `stable` / `draft` / `blocked` / `unknown`. The
foundation §Status legend "Version-suffix convention rule" and "Promotion rule"
apply unchanged; this slice does not re-state them.

---

## RF-1 — Auth / session / context shell (carried forward)

All three rows are `stable`, carried forward from the foundation level against
Data-Pulse-2 `main` (foundation RF-1 verification SHA `b5142fe`; corroborated by
the upstream `001-foundation-auth-tenant-store/sc-verification.md`,
SC-1/SC-3/SC-4/SC-5 Verified). The generated client RF-1 consumes is **pinned at
`62d0906`** (slice 002 C-4), which separately re-asserts RF-1 `stable` at that
SHA. RF-1 **consumes** this readiness; it does not re-verify a `stable` row
absent a logged demotion.

| Backend surface (named, not specified) | Status | Carried from | Notes |
| --- | --- | --- | --- |
| Sign-in / session endpoint (`signIn`) | `stable` | [`../001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md) §RF-1 row 1 | `POST /api/v1/auth/signin`, `auth.openapi.yaml`. `SignInResponse.memberships[]` drives the SF-2 tenant chooser. Consumed by SF-1. |
| Session-context endpoint (`getActiveContext` + `switchActiveTenant`/`switchActiveStore`/`clearActiveStore`) | `stable` | §RF-1 row 2 | `context.openapi.yaml`. `ContextResponse` carries `user`/`active_tenant`/`active_store`/`active_role_code`/`memberships[]`. Source of truth for SF-3 (read-only projection). |
| Session lifecycle (`signOut`, `refreshSession`, expiry) | `stable` | §RF-1 row 3 | `auth.openapi.yaml`. `signOut POST /api/v1/auth/signout`; `refreshSession POST /api/v1/auth/refresh` (sliding window). Consumed by SF-2. |

**Gate impact.** RF-1 readiness is met for planning. The console may not *begin
implementation* until the full FR-008 five-gate approval for this slice, and
until the OQ-3 residual below is re-confirmed (FR-005).

---

## Residual to re-verify before the implementation gate

| Residual | Status | Verified against | Notes |
| --- | --- | --- | --- |
| CSRF posture on `signin` / `signout` / `refresh` + `context/tenant` / `context/store` (POST) / `context/store` (DELETE) | **needs verification** | To be confirmed against Data-Pulse-2 `main` @ `62d0906` before the RF-1 impl gate | Foundation `contracts/rf1-auth-context.md` flags a MUST-re-verify here. Slice 002 OQ-002-2 found **no** `X-CSRF-Token`/`X-XSRF-Token` header on any console-facing contract at `62d0906`, but the upstream auth plan reserves "double-submit token where needed." Net: RF-1 may plan for `SameSite=Lax` cookie transport with no CSRF-header plumbing against the current contract, but MUST re-confirm before the impl gate. If a token is required, record the resolution here (and in `spec.md` OQ-3) in the same edit. |

This is the only RF-1 residual. It does **not** demote any RF-1 row from
`stable`; it is a transport-detail confirmation the foundation contract already
reserved for this slice.

---

## What this slice does NOT touch in readiness

- It does not re-classify RF-1 (carried `stable`).
- It does not touch RF-2..RF-7 rows (out of scope).
- It does not touch RF-4b / SD-1 (foundation-owned; not in RF-1 scope).
- It does not re-pin the generated client (pin `62d0906` is slice-002-owned).

---

## How to update this file

If the OQ-3 residual is resolved during this slice's `/speckit-clarify` or a
pre-gate verification, record the exact Data-Pulse-2 reference (`main @ <sha>` or
`OpenAPI @ <path>:<sha>`), the date (ISO `YYYY-MM-DD`), and the confirmer, and
mirror the resolution in `spec.md` §10 OQ-3 in the same edit. Do not copy
Data-Pulse-2 contract content into this file (reference only). If a foundation
RF-1 row is ever demoted, this carried-forward record must be re-checked.

---

## Verification log

A dated, append-only journal. Most recent first.

### 2026-06-05 — Initial creation (RF-1 readiness carried forward)

- File created from `/speckit-specify` for slice 003.
- RF-1 (all three rows) recorded as `stable`, **carried forward by reference**
  from foundation `api-readiness.md` §RF-1 (pin `62d0906`). No re-derivation;
  no optimistic re-classification.
- CSRF posture recorded as the single residual (**needs verification**) to
  re-confirm before the RF-1 FR-008 implementation gate (spec OQ-3).
- Confirmer: Ahmed Shaaban.
- Verified against: this commit on branch `003-rf1-auth-shell`, citing the
  foundation verification at Data-Pulse-2 `main` @ `62d0906`.

---

**End of API Readiness: 003 RF-1 Auth Shell & Active Context.**

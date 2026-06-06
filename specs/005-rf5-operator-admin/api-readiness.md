# API Readiness — 005 RF-5 Operator / Admin Management

| Field | Value |
| --- | --- |
| Spec | [spec.md](./spec.md) |
| Feature ID | 005 |
| Short name | rf5-operator-admin |
| Branch | `005-rf5-operator-admin` |
| Mode | Planning-only (per-slice readiness carried forward from foundation) |
| Owner | Ahmed Shaaban |
| Created | 2026-06-06 |
| Data-Pulse-2 pin | `62d0906` (slice 002 C-4 — the SHA the generated client is produced against) |
| Status | All RF-5 rows `stable`, **carried forward by reference** from [`../001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md) §RF-5. This file does not re-derive or re-classify them. One residual before the implementation gate: the vendored client must be regenerated at the pin to expose the RF-5 ops (OQ-5). |

---

## Purpose

This is the per-slice readiness artifact for RF-5. It exists to:

1. **Carry forward** the foundation RF-5 `stable` verification by reference, so
   the RF-5 plan/tasks can cite a single per-slice readiness record (foundation
   `api-readiness.md` §How to update — downstream slices do not re-verify a
   `stable` row unless a demotion has been logged).
2. **Record the one residual** RF-5 must resolve before its FR-008 implementation
   gate: the generated client at `src/generated/schema.d.ts` (pin `62d0906`)
   currently exposes only the RF-1 auth+context subset and must be regenerated to
   include the RF-5 paths (OQ-5).
3. **Re-affirm the clean A6 / POS-operator boundary** (foundation §RF-5): the A6
   surface is the separate `pos-operators.openapi.yaml` and is **not** in console
   scope (FR-005-013).
4. **Satisfy FR-005 / FR-011** (no optimistic classification).

This file does **not** copy Data-Pulse-2 OpenAPI content (reference only) and does
**not** authorize implementation (FR-008 five-gate approval still required).

---

## Status legend

Same four statuses as foundation `spec.md` §6 / `api-readiness.md`: `stable` /
`draft` / `blocked` / `unknown`. The foundation §Status legend rules apply
unchanged; this slice does not re-state them.

---

## RF-5 — Operator / admin management (carried forward)

All RF-5 rows are `stable`, carried forward from the foundation level against
Data-Pulse-2 `main` @ `62d0906` (foundation §RF-5; corroborated by upstream
`sc-verification.md` SC-6 Verified). RF-5 **consumes** this readiness; it does not
re-verify a `stable` row absent a logged demotion.

| Backend surface (named, not specified) | Status | Carried from | Notes |
| --- | --- | --- | --- |
| Member list (`listMembers`) | `stable` | [`../001-console-foundation/api-readiness.md`](../001-console-foundation/api-readiness.md) §RF-5 | `GET /api/v1/tenants/{tenant_id}/members`, `tenants.openapi.yaml`. Returns `MembershipDetail[]`. Consumed by SF5-1. `{tenant_id}` = RF-1 `active_tenant.id`. |
| Invitation create (`createInvitation`) | `stable` | §RF-5 | `POST /api/v1/memberships/invite`, `memberships.openapi.yaml`. **`x-idempotency: required`** — client `Idempotency-Key` header. 201/replay/400/401(precondition)/403/409/425. Consumed by SF5-2. |
| Membership update / revoke (`updateMembership` / `revokeMembership`) | `stable` | §RF-5 | `PATCH` / `DELETE /api/v1/memberships/{membership_id}`, `memberships.openapi.yaml`. 200 / 204; uniform 404. Consumed by SF5-3. |
| Invitation accept (`acceptInvitation`) | `stable` | §RF-5 | `POST /api/v1/invitations/accept`, `memberships.openapi.yaml`. **Public (`security: []`).** 200 (session established) / 400 (invalid/expired token). Consumed by SF5-4. |

**A6 / POS-operator boundary (re-affirmed clean).** The A1–A5 membership graph
above is distinct from the A6 POS-operator surface (`pos-operators.openapi.yaml`,
`/api/pos/v1/operators/*`, Clerk-JWT, device-token). POS-operator management is
**not** in console scope (FR-005-013, Constitution Principle 3). No RF-5 readiness
row covers `/api/pos/v1/*`.

**Gate impact.** RF-5 readiness is met for planning. The console may not *begin
implementation* until the full FR-008 five-gate approval for this slice, and until
the OQ-5 client-regeneration residual below is completed.

---

## Residual to resolve before the implementation gate

| Residual | Status | Verified against | Notes |
| --- | --- | --- | --- |
| Vendored generated client (`src/generated/schema.d.ts`) does not yet expose the RF-5 paths | **OPEN — gated impl task** | `src/generated/schema.d.ts` @ pin `62d0906`, inspected 2026-06-06 | The vendored client lists only `/api/v1/auth/*` and `/api/v1/context/*` paths (the RF-1 subset slice 002 generated). It does **not** include `/api/v1/tenants/{tenant_id}/members`, `/api/v1/memberships/invite`, `/api/v1/memberships/{membership_id}`, or `/api/v1/invitations/accept`. The **contracts are `stable`** at this pin; the gap is purely that the client was generated for the RF-1 subset. RF-5 implementation requires regenerating the client at the **same pin** to include these ops. This is **not a re-pin** and **not a readiness demotion** — it is a mechanical regeneration scheduled as the first setup task in `tasks.md` (T002). |
| CSRF posture on the RF-5 mutating ops (`createInvitation` POST, `updateMembership` PATCH, `revokeMembership` DELETE) | **Inherits RF-1 resolution (no token); confirm at gate** | `memberships.openapi.yaml` @ `62d0906`, inspected 2026-06-06 | `memberships.openapi.yaml` declares global `security: [cookieAuth]`; no `X-CSRF-Token`/`X-XSRF` parameter or header on any RF-5 op. `acceptInvitation` is `security: []` (public). Matches RF-1's resolved posture (slice 003 OQ-3): cookie transport via `credentials: "include"`, no CSRF plumbing. Re-confirm against the regenerated client at the gate. |

Neither residual demotes any RF-5 row from `stable`.

---

## What this slice does NOT touch in readiness

- It does not re-classify RF-5 (carried `stable`).
- It does not touch RF-1/RF-2/RF-3/RF-4/RF-6/RF-7 rows (out of scope), except
  reusing RF-1's `stable` active-context readiness by reference.
- It does not touch the A6 POS-operator surface (out of console scope).
- It does not re-pin the generated client (pin `62d0906` is slice-002-owned);
  regenerating at that pin to add RF-5 ops is not a re-pin.

---

## How to update this file

If OQ-5 (client regeneration) is completed, or the CSRF posture re-confirmed,
record the exact Data-Pulse-2 reference (`main @ <sha>` or
`OpenAPI @ <path>:<sha>`), the date (ISO `YYYY-MM-DD`), and the confirmer, and
mirror any spec-relevant resolution in `spec.md` §10 in the same edit. Do not copy
Data-Pulse-2 contract content into this file (reference only). If a foundation
RF-5 row is ever demoted, this carried-forward record must be re-checked.

---

## Verification log

A dated, append-only journal. Most recent first.

### 2026-06-06 — Initial creation (RF-5 readiness carried forward)

- File created from `/speckit-specify` for slice 005.
- RF-5 (all rows) recorded as `stable`, **carried forward by reference** from
  foundation `api-readiness.md` §RF-5 (pin `62d0906`; upstream `sc-verification.md`
  SC-6 Verified). No re-derivation; no optimistic re-classification.
- Contracts read end-to-end at pin `62d0906`: `tenants.openapi.yaml`
  (`listMembers`), `memberships.openapi.yaml` (`createInvitation` /
  `updateMembership` / `revokeMembership` / `acceptInvitation`),
  `context.openapi.yaml` (reused), `pos-operators.openapi.yaml` (read to **exclude**
  the A6 surface).
- **Vendored-client gap (OQ-5)** recorded as the primary residual: the generated
  `schema.d.ts` exposes only the RF-1 auth+context subset; regeneration at the pin
  is required before implementation (gated task, not a re-pin).
- A6 / POS-operator boundary re-affirmed clean.
- Confirmer: Ahmed Shaaban (owner).
- Verified against: this commit on branch `005-rf5-operator-admin`, citing the
  foundation verification at Data-Pulse-2 `main` @ `62d0906`.

---

**End of API Readiness: 005 RF-5 Operator / Admin Management.**

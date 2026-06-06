# Quickstart: RF-5 Operator / Admin Management

**Feature**: 005-rf5-operator-admin
**Phase**: 1 — Design & Contracts
**Audience**: Reviewers of this PR; agents/humans opening the RF-5 implementation gate or sibling RF-2..RF-7 slices.

> **What this quickstart is.** A planning-phase walkthrough for understanding the
> RF-5 planning artifacts. It is **not** a runtime setup runbook — RF-5 authorizes
> no `src/` code (FR-005-010/012). The slice-002 scaffold already documents "how
> to run the app"; this slice adds no runtime.

---

## 1. Read the RF-5 artifacts in this order

1. **[`spec.md`](./spec.md)** — surfaces SF5-1..SF5-4, the five consumed
   operations (§6.1), the A6 exclusion (§6.4), FR-005-001..FR-005-014,
   AC-1..AC-9, OQ-1..OQ-6.
2. **[`api-readiness.md`](./api-readiness.md)** — RF-5 rows `stable` (carried
   forward from foundation §RF-5, pin `62d0906`); residuals: OQ-5 (regenerate the
   vendored client to expose the RF-5 paths) + CSRF confirm.
3. **[`contracts/rf5-operator-admin.md`](./contracts/rf5-operator-admin.md)** —
   the five operations mapped to surfaces, the idempotency contract, the excluded
   A6 ops, and the 401-disambiguation rule.
4. **[`plan.md`](./plan.md)** — surface sequencing (SF5-1 → SF5-2/3 → SF5-4), the
   **reuse-of-RF-1 table with file:line cites**, the **401-disambiguation design
   note**, the validation-gate shape (VG-1..VG-4).
5. **[`research.md`](./research.md)** — R5-1..R5-6: how RF-5 reuses each RF-1
   primitive and the RF-5-specific extension (esp. R5-4, the 401 handling).
6. **[`design-brief.md`](./design-brief.md)** — the `/impeccable shape` (register
   = product) DESIGN.md-grounded brief: member table, drawers, the state matrix.
7. (For context) **[`data-model.md`](./data-model.md)** — the render-side
   projection (E-2 membership, E-3 read-only context, ST-2 membership lifecycle,
   VD-1..VD-6).
8. **[`tasks.md`](./tasks.md)** — the gated task plan (gate banner: no execution
   until FR-008).

---

## 2. The five operations (consumption boundary)

| # | operationId | HTTP | Surface |
| --- | --- | --- | --- |
| 1 | `listMembers` | `GET /api/v1/tenants/{tenant_id}/members` | SF5-1 |
| 2 | `createInvitation` | `POST /api/v1/memberships/invite` | SF5-2 |
| 3 | `updateMembership` | `PATCH /api/v1/memberships/{membership_id}` | SF5-3 |
| 4 | `revokeMembership` | `DELETE /api/v1/memberships/{membership_id}` | SF5-3 |
| 5 | `acceptInvitation` | `POST /api/v1/invitations/accept` (public) | SF5-4 |

**Excluded (A6):** `posOperatorSignIn` / `posOperatorSignOut` /
`posOperatorRoster` / `posOperatorTakeoverConfirm` / `posOperatorActiveSession`
(`pos-operators.openapi.yaml`) — never consumed (FR-005-013). **Excluded (RF-2):**
`listStores`.

---

## 3. The two correctness traps to check first

1. **Precondition 401 ≠ session-expiry 401** (FR-005-007, OQ-1). `listMembers` /
   `createInvitation` 401 = "no active tenant" (session valid) → scope chooser,
   NOT sign-out. The discriminator is whether RF-1's reactive single-refresh
   fails. Grounded in `src/lib/auth-interceptor.ts:32-60` (refresh-once;
   `onSessionLost` fires only if refresh fails) — read the code, not the pattern.
2. **Idempotency on `createInvitation`** (§6.3). Client-generated
   `Idempotency-Key`; `Idempotent-Replayed: true` = same invite;
   `idempotency_key_conflict` 409 = terminal (new key); 425 = retry with same
   key+body. The current `src/lib/client.ts` wrappers pass body only — invite
   needs a new header-carrying wrapper shape.

---

## 4. Shared-file touches (for SEQUENTIAL implement)

These collide with sibling RF-2..RF-7 slices — note for sequential implementation:

- **`src/App.tsx`** — register the new protected Operators route + the public
  accept-invitation route (routing is **inline here**, verified `App.tsx:24-32`;
  there is NO `src/lib/router.tsx`).
- **`src/shell/AppShell.tsx`** — un-gate the `Operators` `GATED_NAV` entry
  (verified `AppShell.tsx:12-18`).
- **`src/lib/client.ts`** — add the five typed op wrappers (verified
  `client.ts:1-71`); `createInvitation` adds the `Idempotency-Key` header shape.

---

## 5. What clears the gate (FR-008 five-gate)

1. Spec approved (this slice's `spec.md`).
2. Plan approved (`plan.md`).
3. Task list approved (`tasks.md`).
4. API dependency map approved — RF-5 rows `stable` (`api-readiness.md`) **and**
   the OQ-5 client-regeneration task (T002) scheduled.
5. Validation gates approved (VG-1..VG-4 in `plan.md`/`tasks.md`).

Until all five clear for **this** slice, no RF-5 `src/` code is written.

---

**End of Quickstart: RF-5 Operator / Admin Management.**

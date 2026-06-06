# Phase 1 Data Model: RF-5 Operator / Admin Management

**Feature**: 005-rf5-operator-admin
**Phase**: 1 — Design & Contracts
**Date**: 2026-06-06
**Input**: [`spec.md`](./spec.md), [`api-readiness.md`](./api-readiness.md), [`contracts/rf5-operator-admin.md`](./contracts/rf5-operator-admin.md)
**Foundation reference**: [`001-console-foundation/data-model.md`](../001-console-foundation/data-model.md)
**RF-1 reference**: [`003-rf1-auth-shell/data-model.md`](../003-rf1-auth-shell/data-model.md) (E-1/E-2/E-3, ST-1)

---

## Ownership disclaimer (read this first)

This repository owns **zero domain entities**. Every entity RF-5 touches is
**owned by Data-Pulse-2** and rendered by the console. RF-5 defines no entity,
persists none, validates none (Constitution Principles 1, 2, 7).

This file documents only the **render-side projection** RF-5 needs for the
operator/admin management surface, by reference. It does **not** re-inline or
duplicate Data-Pulse-2 OpenAPI schemas (Principle 2 forbids that copy). Exact
field types are read from the generated client (`src/generated/schema.d.ts`,
regenerated at pin `62d0906` to include the RF-5 ops — OQ-5) at implementation
time.

---

## Entities RF-5 projects

### E-2 — Membership (the membership graph)

- **Foundation reference:** `001-console-foundation/data-model.md` E-2;
  RF-1 `data-model.md` E-2.
- **Origin:**
  - `tenants.openapi.yaml` `MembershipDetail` (from `listMembers`) — carries
    `membership_id`, `user { id, email, display_name }`, `role_code`,
    `store_access_kind` (`all`|`specific`), `accessible_store_ids[]`,
    `revoked_at`. **Richer than the POS roster's minimum-disclosure cashier
    record** (intentional — the console admin needs to identify members; spec
    AS-5).
  - `memberships.openapi.yaml` `Membership` (from `updateMembership` /
    `acceptInvitation`), `Invitation` (from `createInvitation`),
    `InvitationCreate` / `MembershipUpdate` (request shapes).
- **RF-5 render-side use:** SF5-1 renders `MembershipDetail[]` as a table (member
  identity, `role_code`, store-access policy, `revoked_at` marker). SF5-2 creates
  an `Invitation`; SF5-3 mutates a `Membership`. **No optimistic mutation** —
  every mutation re-fetches `listMembers` (FR-005-005).

### E-3 — Active context (READ-ONLY, owned by RF-1)

- **Foundation reference:** E-3; RF-1 `data-model.md` E-3.
- **Origin:** `context.openapi.yaml` `ContextResponse`.
- **RF-5 render-side use:** RF-5 **reads** `active_tenant.id` from RF-1's
  active-context provider to scope `listMembers`. RF-5 does **not** own, mutate,
  or re-fetch active context (FR-005-006). If `active_tenant` is null, RF-5 routes
  to the RF-1 scope chooser (precondition path, not a managed entity).

### E-5 — Operator/admin identity (= E-2 membership, NOT the A6 POS operator)

- **Clarification of scope.** Foundation `spec.md` §5 names RF-5 "operator/admin
  management." The "operator" RF-5 manages is the **A1–A5 platform membership**
  (E-2), **not** the A6 POS operator. The A6 POS-operator entity
  (`PosOperatorSummary` / `PosRosterCashierEntry` in `pos-operators.openapi.yaml`)
  is **out of scope** (spec §6.4, FR-005-013) — a separate, minimum-disclosure
  identity surface owned by POS-Pulse. RF-5 never projects it.

> Entities E-1 (User detail beyond membership), E-4 (Tenant), E-6 (Store),
> E-7..E-10 (Catalog, Unknown item, Audit, Setting) are **out of RF-5 scope**.
> RF-5 reads the User identity only as embedded in `MembershipDetail.user` and the
> Tenant only as `active_tenant.id` from RF-1.

---

## State the console holds (render-side only)

RF-5 holds no authoritative domain state. The only render-side state is the
**read-only projection of the membership graph** plus transient UI state (form
input, in-flight flags, the generated `Idempotency-Key` for the current invite).
All of it is derived from, and re-synced to, backend responses.

| Render-side state | Owned by | Refresh trigger |
| --- | --- | --- |
| Member-graph projection (E-2) | SF5-1 (TanStack Query, keyed by `active_tenant.id`) | `listMembers` on mount, after any mutation, on active-tenant change |
| Active-tenant id (E-3) | RF-1 `ActiveContextProvider` (read-only here) | RF-1's `getActiveContext` (RF-5 does not trigger) |
| Invite form input + `Idempotency-Key` | SF5-2 | Transient; key generated per attempt; never persisted (FR-005-010) |
| Edit form input | SF5-3 | Transient; never persisted |
| Accept-invitation token + form (public) | SF5-4 | Transient; from the emailed link; never persisted |

---

## State transitions consumed

### ST-2 — Membership lifecycle (RF-5 drives the management of this)

```
(no membership) ──(createInvitation 201)──> INVITED (pending)
                                                  │
                                                  │ (acceptInvitation 200, public SF5-4)
                                                  ▼
                                              ACTIVE MEMBER
                                                │     │
                                                │     ├─(updateMembership 200)──> ACTIVE (role/store-access changed)
                                                │     └─(revokeMembership 204)──> REVOKED (revoked_at set; soft-delete)
```

**Notes (RF-5 specifics):**

- Every transition is followed by a `listMembers` re-fetch (no optimistic update,
  FR-005-005).
- `createInvitation` is idempotent: a `201` with `Idempotent-Replayed: true` does
  **not** create a second invitation; `409 idempotency_key_conflict` is terminal
  (new key); `425` retries with the same key + body (spec §6.3).
- `acceptInvitation` (SF5-4) runs **public** (`security: []`); on success it
  establishes a session and the new member enters RF-1's ST-1 AUTHENTICATED state.
- REVOKED members still render in the list with a `revoked_at` marker (soft
  delete; the backend audit-logs the revoke).

### ST-1 — Session lifecycle (RF-1 owns; RF-5 only reacts to a 401)

RF-5 does not drive ST-1. It reacts to a `401` per the **401 disambiguation**
(FR-005-007, research R5-4). Per the contracts the precondition 401 occurs **only
on `createInvitation`**:

```
401 on createInvitation
   ├─ refresh fails  ───────────────> session-expiry → RF-1 SF-1 (sign-in)   [ST-1 → ANONYMOUS]
   └─ refresh ok, call still 401 ───> precondition "no active tenant"
                                       → RF-1 scope chooser (set active tenant) [NOT sign-out]

401 on listMembers / updateMembership / revokeMembership
   └─ generic auth → standard RF-1 expiry handling (no precondition path; their
      no-access case is 404, and the listMembers active-tenant precondition is
      guarded BEFORE the call by routing to the scope chooser when active_tenant null)
```

---

## Validation / display rules (render-side only)

Validation is **backend-enforced** (FR-005-004, Principle 7). RF-5 implements
**no business validation** (no role-permission checks, no tenant-isolation logic).
Display rules RF-5 honors:

- **VD-1** — `role_code` and `store_access_kind` are rendered for **display
  only**; they never gate which actions RF-5 shows (the backend returns 403).
- **VD-2** — `store_access_kind: "all"` → render "All stores";
  `store_access_kind: "specific"` → render the `accessible_store_ids` **count/ids**
  (NOT resolved store names — OQ-3; that needs RF-2's `listStores`).
- **VD-3** — `revoked_at != null` → render the member row with a revoked marker;
  do not hide it.
- **VD-4** — All backend 4xx carry `code`/`message`/`request_id` (or the
  `Error` envelope `{ error: { code, message, request_id } }`); RF-5 surfaces
  `request_id` in any user-visible error (FR-005-009).
- **VD-5** — `listMembers`/`updateMembership`/`revokeMembership` `404` rendered
  identically regardless of cause (not found vs. no access) — leak-avoidance.
- **VD-6** — `createInvitation` `400` distinguishes `validation_error` /
  `idempotency_key_required` / `idempotency_key_malformed` in the message;
  `409` distinguishes pending-invite-exists vs. `idempotency_key_conflict`.

---

## Cross-reference to readiness rows

| Entity | api-readiness row | Status (carried from foundation) |
| --- | --- | --- |
| E-2 Membership (list) | RF-5 `listMembers` | `stable` |
| E-2 Membership (manage) | RF-5 `createInvitation`/`updateMembership`/`revokeMembership`/`acceptInvitation` | `stable` |
| E-3 Active context (read-only) | RF-1 session-context (reused) | `stable` |

**Implication.** All RF-5 entities are `stable` (foundation `api-readiness.md`
§RF-5, pin `62d0906`) — RF-5 may plan against them now. The one residual before
the implementation gate is **OQ-5** (regenerate the vendored client at the pin to
expose the RF-5 ops), not an entity-readiness gap.

---

**End of Phase 1 Data Model: RF-5 Operator / Admin Management.**

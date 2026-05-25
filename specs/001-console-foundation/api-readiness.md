# API Readiness — 001 Console Foundation

| Field | Value |
| --- | --- |
| Spec | [spec.md](./spec.md) |
| Feature ID | 001 |
| Short name | console-foundation |
| Branch | `001-console-foundation` |
| Mode | Planning-only (cross-repo verification artifact) |
| Owner | Ahmed Shaaban |
| Created | 2026-05-25 |
| Last verified | 2026-05-25 (RF-1 promoted to `stable`; RF-4a and RF-4b verified) |
| Status | Partially verified — RF-1 (all 3 rows `stable`), RF-4a (both rows `draft`), and RF-4b (both rows `blocked`) carry dated Data-Pulse-2 references. RF-2 / RF-3 / RF-5 / RF-6 / RF-7 remain `unknown`. |

---

## Purpose

This file records the **cross-repo verification state** of every backend
surface the console depends on, as defined in `spec.md` §6 (Backend dependency
map). It exists for three reasons:

1. **Resolve OQ-1 through OQ-5 from `spec.md` §10** by capturing dated, source-
   linked confirmations from Data-Pulse-2 (and where relevant, POS-Pulse).
2. **Satisfy FR-005** (no per-family `implementation` slice opens until the
   relevant rows here are resolved away from `unknown`) and **FR-011** (no
   optimistic classification).
3. **Be the OQ-7 verification artifact**: a single human-readable, machine-
   greppable record of *which contract was confirmed, against which Data-Pulse-2
   reference, on which date, by whom*.

This file does **not**:

- Copy, paraphrase, or vendor Data-Pulse-2 OpenAPI content. References only.
- Authorize implementation. Implementation gating still requires the five
  human-approval gates in Constitution §Implementation readiness gates and
  `spec.md` FR-008.
- Replace `spec.md` §6. When a row here is updated, the corresponding row in
  `spec.md` §6 MUST be updated in the same edit (or in a follow-up edit on
  the same branch) to keep the two documents in sync.

---

## Status legend

Same four statuses as `spec.md` §6 (no additional statuses permitted):

- `stable` — Contract confirmed present and stable in Data-Pulse-2 `main` AND
  the OpenAPI source. Safe to plan a UI slice against.
- `draft` — Contract exists but is incomplete, in active change, or has open
  contract questions. UI may begin planning but **must** re-verify before any
  implementation gate clears.
- `blocked` — Contract is known to be absent, deferred, or intentionally not
  started in Data-Pulse-2. UI must not plan implementation against it yet.
- `unknown` — This repository has not yet performed (or cannot complete) a
  cross-repo confirmation. Default starting state. Forbidden as a final state
  before any per-family `implementation` slice opens.

**Promotion rule.** A row may move from `unknown` to one of the three other
statuses **only** when the "Verified against" cell on that row names a
specific Data-Pulse-2 reference (branch + SHA, OpenAPI file path + commit,
wave-status filename + date, or active spec path + commit). "I checked, looks
fine" is not a verification.

**Version-suffix convention rule.** Every OpenAPI file in
Data-Pulse-2 `packages/contracts/openapi/` carries the version label
`1.0.0-draft` (or `1.1.0-draft`, etc.). This is a Data-Pulse-2 repo-wide
**labeling convention**, not a per-surface stability flag. The `-draft`
suffix therefore does NOT, by itself, force a row to classify as `draft`.

A row MAY classify as `stable` despite an upstream `-draft` suffix when
**all three** of the following hold:

1. The named OpenAPI file (with `-draft` suffix) exists on Data-Pulse-2
   `main` and defines the operationId(s) the row depends on.
2. The upstream Data-Pulse-2 slice that owns those operationId(s)
   provides a `sc-verification.md` (or equivalent named verification
   artifact) declaring milestone completion at a specific Data-Pulse-2
   SHA.
3. That `sc-verification.md` reports the relevant Success Criteria as
   `Verified` (not `Partial`, not `Pending`).

Without all three, the row remains `draft` even if the OpenAPI file
looks complete. With all three, `stable` is the correct classification
and `draft` would be under-classification (which has its own audit
cost — see Demotion rule note).

**Demotion rule.** A row may move *back* to a less-stable status (e.g.,
`stable` → `draft`, or `draft` → `blocked`) if a subsequent verification
shows the contract changed or was withdrawn. The history of changes is
tracked in §Verification log below.

*Note on under-classification.* Classifying a `stable` surface as
`draft` is **not safer** than classifying it correctly. A `draft` row
triggers re-verification work on every downstream slice (FR-005), which
costs reviewer time and creates churn. The audit goal is *accurate*
classification, not maximally-conservative classification. The
Version-suffix convention rule above exists to enable correct
promotion when corroborating evidence is strong.

---

## Cross-repo references

The verifier (whoever is filling this file) MUST consult these sources, in
this order, before promoting a row away from `unknown`:

1. **Data-Pulse-2 `main` branch** — implementation truth.
   - Repo: `https://github.com/ahmed-shaaban-94/Data-Pulse-2`
   - Branch: `main`
   - HEAD at time of RF-1 verification: `b5142fe` (2026-05-25)
2. **Data-Pulse-2 OpenAPI source** — contract truth.
   - Path inside Data-Pulse-2: <!-- TODO(owner): record path on first verification -->
3. **Data-Pulse-2 active specs / execution maps / wave-status files** —
   in-flight contract intent.
   - Path inside Data-Pulse-2: <!-- TODO(owner): record path on first verification -->
4. **POS-Pulse `main` and active specs** — only required for rows whose
   surface is fed by POS (currently RF-4 unknown-item capture and RF-6 audit
   events).
   - Repo: `https://github.com/<org>/POS-Pulse` <!-- TODO(owner): record actual URL -->

Verification MUST NOT proceed from a fork, a feature branch, or a personal
copy. The reference is always Data-Pulse-2 `main` (or, for in-flight intent,
the named active spec/wave-status file on `main`).

**Constitution anchor.** This order matches `.specify/memory/constitution.md`
§Source-of-truth order.

---

## RF-1 — Auth / session / context shell

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Sign-in / session endpoint | `stable` | Data-Pulse-2 `packages/contracts/openapi/auth.openapi.yaml` on `main` @ `b5142fe` (`-draft` per repo convention; `operationId: signIn`, `POST /api/v1/auth/signin`; cookie-based dashboard sessions, `dp2_session` HttpOnly cookie); Data-Pulse-2 `specs/001-foundation-auth-tenant-store/sc-verification.md` on `main` (declares "All nine Success Criteria SC-1 … SC-9 are now Verified — Foundation milestone complete" at SHA `602ae5c`) | 2026-05-25 (promoted to `stable` per §Status legend Version-suffix convention rule) | Ahmed Shaaban | OQ-1 closed for this row. Promotion rationale: upstream SC-verification declares Foundation milestone complete at SHA `602ae5c`; SC-1, SC-3, SC-4, SC-5 (auth-relevant) all Verified. `-draft` suffix is the Data-Pulse-2 labeling convention. SignInResponse includes `memberships[]` driving the active-tenant chooser. |
| Session-context endpoint (active tenant + active store for the authenticated actor) | `stable` | Data-Pulse-2 `packages/contracts/openapi/context.openapi.yaml` on `main` @ `b5142fe` (`-draft` per repo convention; `operationId: getActiveContext`, `GET /api/v1/context/me`; also `switchActiveTenant POST /api/v1/context/tenant`, `switchActiveStore POST /api/v1/context/store`, `clearActiveStore DELETE /api/v1/context/store`); Data-Pulse-2 `specs/001-foundation-auth-tenant-store/sc-verification.md` SC-5 (p95 = 7.0 ms ≤ 200 ms threshold, Verified) | 2026-05-25 (promoted to `stable` per §Status legend Version-suffix convention rule) | Ahmed Shaaban | OQ-1 closed for this row. Promotion rationale: SC-5 directly Verified at p95 = 7.0 ms (35× headroom under target). ContextResponse carries `user`, `active_tenant`, `active_store`, `active_role_code`, `memberships[]` (with `store_access_kind` enum and `accessible_store_ids`). Sufficient for the console's tenant/store context shell. |
| Session lifecycle (sign-out, refresh, expiry semantics) | `stable` | Data-Pulse-2 `packages/contracts/openapi/auth.openapi.yaml` on `main` @ `b5142fe` (`operationId: signOut POST /api/v1/auth/signout`; `operationId: refreshSession POST /api/v1/auth/refresh` for sliding window within absolute cap); Data-Pulse-2 `specs/001-foundation-auth-tenant-store/frontend-bypass-probe.md` (server-only authorization confirmed via T205 automated test + manual probe — backs FR-002) | 2026-05-25 (promoted to `stable` per §Status legend Version-suffix convention rule) | Ahmed Shaaban | OQ-1 closed for this row. Promotion rationale: SC-4 (server-only authorization) Verified via T205 + manual probe. Auth surface also defines password-reset (`requestPasswordReset`, `confirmPasswordReset`) and email-verification (`requestEmailVerification`, `confirmEmailVerification`) — not required for RF-1 MVP but available to later RF-5 work. |

**Gate impact.** Until all RF-1 rows are at `stable` or `draft`, no per-family
`implementation` slice (RF-2..RF-7) may open. **All three RF-1 rows are now
at `stable`** (verified 2026-05-25 against Data-Pulse-2 `main` @ `b5142fe`,
promoted from `draft` to `stable` on 2026-05-25 per the §Status legend
Version-suffix convention rule). This gate is now met. The console may not
yet *begin implementation* — that still requires the full FR-008 five-gate
approval per slice — but planning is unblocked, and downstream slices
consuming RF-1 do NOT need to re-verify the surface (only re-verify if a
Data-Pulse-2 demotion event has been logged here).

---

## RF-2 — Tenant / store management

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Tenant list (scoped by actor) | `unknown` | — | — | — | OQ-3. |
| Tenant detail / create / update | `unknown` | — | — | — | OQ-3. A1-only for create per FR-002 (backend enforces). |
| Store list (scoped by tenant + actor) | `unknown` | — | — | — | OQ-3. |
| Store detail / create / update | `unknown` | — | — | — | OQ-3. |
| Tenant ↔ store ↔ actor scope graph (read of backend's authorization model) | `unknown` | — | — | — | OQ-4. Shape of the actor-permission matrix. |

---

## RF-3 — Catalog management

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Catalog read (scoped by tenant/store) | `unknown` | — | — | — | OQ-3. |
| Catalog write (create / update / delete catalog rows) | `unknown` | — | — | — | OQ-3. Write semantics + scope enforcement live in Data-Pulse-2. |
| Catalog row identity model (how a row is uniquely identified across stores) | `unknown` | — | — | — | OQ-3. Required before RF-4b reconciliation can be planned (a "link unknown to existing" call must know the existing row's identity). |

---

## RF-4 — Unknown items review

### RF-4a — List / dismiss

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Unknown-item list (scoped by tenant/store) | `draft` | Data-Pulse-2 `packages/contracts/openapi/catalog/unknown-items.yaml` on `main` @ `b5142fe` — Wave 1 `operationId: tenantAdminListUnknownItems` confirmed present (`-draft` per repo convention) | 2026-05-25 (verified incidental to RF-4b lookup) | Ahmed Shaaban | Classified `draft` (not `stable`): Wave 1 file's surrounding artifacts (Wave 2 gating) indicate active reconciliation work upstream. Must be re-verified before RF-4 implementation gate (FR-005). |
| Unknown-item dismiss | `draft` | Data-Pulse-2 `packages/contracts/openapi/catalog/unknown-items.yaml` on `main` @ `b5142fe` — Wave 1 `operationId: tenantAdminDismissUnknownItem` confirmed present | 2026-05-25 (verified incidental to RF-4b lookup) | Ahmed Shaaban | Same Wave 1 classification reasoning as list row above. |

### RF-4b — Link to existing / create new from unknown (reconciliation)

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Link unknown-item to existing catalog row | `blocked` | Data-Pulse-2 `packages/contracts/openapi/catalog/unknown-items.yaml` on `main` (v1.0.0-draft; Wave 1 only — `posCaptureItem`, `tenantAdminListUnknownItems`, `tenantAdminDismissUnknownItem`); Data-Pulse-2 `specs/005-pos-catalog-sync-reconciliation/wave-status.md` on `main` (Wave 2 `tenantAdminLinkUnknownItem` requires gated approval) | 2026-05-25 | Ahmed Shaaban | OQ-2 closed for this row: Wave 2 reconciliation operations are deferred to a separate gated extension in Data-Pulse-2 — contract is not stable in `main`. FR-012 guard remains active. |
| Create new catalog row from unknown-item | `blocked` | Data-Pulse-2 `packages/contracts/openapi/catalog/unknown-items.yaml` on `main` (v1.0.0-draft; Wave 1 only); Data-Pulse-2 `specs/005-pos-catalog-sync-reconciliation/wave-status.md` on `main` (Wave 2 `tenantAdminCreateProductFromUnknownItem` requires gated approval) | 2026-05-25 | Ahmed Shaaban | OQ-2 closed for this row: Wave 2 reconciliation operation is deferred to a separate gated extension. FR-012 guard remains active. |

**Cross-reference.** `spec.md` FR-012 codifies the reconciliation guard. Any
demotion of these two rows away from `blocked` is a spec-significant event
that must also update `spec.md` §6 in the same edit.

---

## RF-5 — Operator / admin management

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Identity list (for A1–A5 only; A6 is POS-Pulse-owned and must not appear here) | `unknown` | — | — | — | OQ-3 + OQ-4 boundary check. |
| Identity detail / invite / disable | `unknown` | — | — | — | OQ-3. |
| Role / scope assignment surface | `unknown` | — | — | — | OQ-4. Backend enforces the scope; the console reads + renders. |
| Boundary check: no overlap with POS-Pulse A6 operator surfaces | `unknown` | — | — | — | Cross-repo against POS-Pulse `main`. Must confirm A6 operators are *not* exposed via the same endpoints as A1–A5. |

---

## RF-6 — Audit / search

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Audit query (scoped by tenant + optionally store) | `unknown` | — | — | — | OQ-3. |
| Operational event search | `unknown` | — | — | — | OQ-3. |
| POS-originated event surface (which POS-Pulse event types reach the audit/search read API, and under which retention + visibility rules) | `unknown` | — | — | — | OQ-5. Requires verification against **both** Data-Pulse-2 (for ingestion + storage) and POS-Pulse (for emission semantics). |

---

## RF-7 — Settings / system management

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Tenant-level configuration surface | `unknown` | — | — | — | OQ-3. |
| Store-level configuration surface | `unknown` | — | — | — | OQ-3. |
| Platform-level configuration surface (A1 only) | `unknown` | — | — | — | OQ-3. Backend authorization restricts to A1 per FR-002. |

---

## Cross-cutting

| Concern | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Actor → route-family permission matrix shape | `unknown` | — | — | — | OQ-4. Read of Data-Pulse-2's authorization model. Frontend never decides scope (FR-002). |
| POS-Pulse boundary integrity (no console call ever writes back to a POS device or terminal) | `unknown` | — | — | — | Cross-repo against POS-Pulse `main` + active specs. The console MUST remain read-only for POS-originated data (FR-003). |
| Generated-client toolchain + storage location | `deferred` | — | — | — | OQ-6. Decision is **gated** by FR-006: the toolchain is not chosen here. Recording it in this file is allowed *only after* the human owner has approved a specific slice authorizing the choice. Until then this row stays `deferred`. |
| Verification artifact shape (this file) | `confirmed` | This document | 2026-05-25 | Ahmed Shaaban | OQ-7 closure: this file is the artifact. Format may evolve via amendment; the *existence* of the artifact is now answered. |

---

## Plan gate decision

A standing record of whether `/speckit-plan` may run against this feature.
Updated whenever a row above changes status enough to affect the gate.

| Field | Value |
| --- | --- |
| `/speckit-plan` status | **ready** |
| Decision date | 2026-05-25 (gate-lift) |
| Decided by | Ahmed Shaaban |

### Resolved blockers

- ~~**RF-1 auth/session/context remains `unknown`**~~ — **resolved
  2026-05-25.** All three RF-1 rows verified and promoted to `stable`
  against Data-Pulse-2 `main` @ `b5142fe` (`auth.openapi.yaml` +
  `context.openapi.yaml`; Data-Pulse-2 slice `001-foundation-auth-tenant-store`
  is past `sc-verification.md` with all 9 success criteria Verified at
  SHA `602ae5c`). Promoted from `draft` to `stable` on 2026-05-25 per
  the §Status legend Version-suffix convention rule (added in the same
  edit). OQ-1 closed in spec.md §10 traceability via the Verification
  log entry below. Gate-lift condition 1 now met (would have been met
  at `draft`; `stable` is the more accurate classification).
- ~~**RF-4b unknown-item link / create-new reconciliation remains
  `blocked`**~~ — resolved 2026-05-25 by `spec.md` §11 SD-1 (Scope
  deferrals). RF-4b is deferred *out* of the first-pass plan; the
  upstream Wave 2 gate no longer blocks planning. FR-012 guard remains
  active for any *future* slice that depends on RF-4b. Gate-lift
  condition 2b met.

### Allowed next work

- **Run `/speckit-plan`** against this spec. Both gate-lift conditions are
  met. The plan MUST:
  - Treat RF-1 as the foundational layer (spec.md §5 sequencing rule)
    and consume the Data-Pulse-2 endpoints recorded in §RF-1 above
    (signIn / signOut / refreshSession; getActiveContext /
    switchActiveTenant / switchActiveStore / clearActiveStore).
  - Honor SD-1: RF-4b is out of scope.
  - Treat RF-2 / RF-3 / RF-5 / RF-6 / RF-7 as still requiring per-family
    API readiness resolution. The plan may sequence their work but MUST
    NOT clear FR-008 gates for any of them in this round.
- Continue cross-repo API readiness verification for RF-2 / RF-3 / RF-5 /
  RF-6 / RF-7 — these remain `unknown` and gate their respective
  per-family implementation slices (not the foundation plan).
- Continue updating this file (and `spec.md` §6 in sync) as further
  verifications land.

### Not yet allowed

- Do not begin any per-family **implementation** slice. `/speckit-plan` is
  ready, but FR-008's full five-gate approval (spec + plan + tasks + API
  map + validation gates, all approved by the human owner) is still
  required per-slice.
- Do not add `package.json`, lockfile, `src/`, `app/`, `pages/`,
  `components/`, framework scaffold, generated client, CI workflow, or
  deployment configuration. These remain gated by the constitution
  regardless of plan-gate status.

### Gate-lift conditions

The `/speckit-plan` status MAY move from `blocked` to `ready` only when
**both** of the following hold:

1. RF-1 (all three rows under RF-1 in §RF-1 above) is resolved to
   `stable` or `draft` against a specific Data-Pulse-2 reference.
   **Status: met. All three rows `stable` against Data-Pulse-2 `main` @
   `b5142fe`, verified 2026-05-25 and promoted from `draft` to `stable`
   on 2026-05-25 per the Version-suffix convention rule (see
   Verification log).**
2. RF-4b is either (a) demoted to `draft` against a Data-Pulse-2 reference
   that supersedes the current Wave 2 "gated approval" posture, or
   (b) explicitly scoped *out* of the first-pass plan via an amendment to
   `spec.md` (in which case FR-009 "no silent scope expansion" requires
   that amendment to be visible and approved before planning proceeds).
   **Status: met via path (b) — `spec.md` §11 SD-1 (2026-05-25).**

**Both conditions met as of 2026-05-25.** `/speckit-plan` is unblocked.

Per-family planning for RF-2 / RF-3 / RF-5 / RF-6 / RF-7 remains additionally
gated on their own `unknown` rows resolving — but those are per-family
planning decisions, not the foundation plan gate above.

---

## How to update this file

When performing a cross-repo verification, update the affected row(s) and
**also** update `spec.md` §6 in the same edit so the two stay in sync.

For each row being promoted away from `unknown`:

1. Record the exact reference in **Verified against**. Acceptable forms:
   - `Data-Pulse-2 main @ <commit-sha>` (preferred)
   - `Data-Pulse-2 OpenAPI @ <path>:<commit-sha>`
   - `Data-Pulse-2 wave-status @ <filename> (<date>)`
   - `Data-Pulse-2 active spec @ <path>:<commit-sha>`
   - `POS-Pulse main @ <commit-sha>` (only for POS-touched rows)
2. Record **Date** as ISO `YYYY-MM-DD` (the date the verification was
   actually performed, not the date you typed the row).
3. Record **Confirmer** as the human who performed the verification.
4. Update **Current status** to one of `stable` / `draft` / `blocked` (never
   leave a row at `unknown` after a verification — record what you found).
5. Append a line to the §Verification log below describing the change.
6. If the change affects `spec.md` §6, edit that section in the same commit.
   A commit that updates this file without updating `spec.md` §6 (when §6
   needs updating) is incomplete and should be amended before push.

Do **not** record information that copies Data-Pulse-2 contract content
(field names, types, request/response shapes) into this file. Reference only.

---

## Verification log

A dated, append-only journal of every change to this file's row statuses.
One entry per verification event. Most recent first.

### 2026-05-25 — Initial creation

- File created from `/speckit-clarify` follow-up.
- All RF-1 / RF-2 / RF-3 / RF-5 / RF-6 / RF-7 rows initialized at `unknown`.
- RF-4a rows initialized at `draft` (carried from `spec.md` §6 per spec
  author instruction; not yet verified against any Data-Pulse-2 reference).
- RF-4b rows initialized at `blocked` (carried from `spec.md` §6 per
  spec.md FR-012; not yet verified).
- Cross-cutting row "Verification artifact shape" recorded as `confirmed`
  because the artifact (this file) now exists. Resolves OQ-7 from
  `spec.md` §10.
- Confirmer: Ahmed Shaaban.
- Verified against: this commit on branch `001-console-foundation`.

### 2026-05-25 — RF-1 promotion `draft` → `stable` + Version-suffix convention rule added

- §Status legend: added "Version-suffix convention rule" — a row MAY
  classify as `stable` despite an upstream `-draft` version suffix
  when (1) the OpenAPI file exists on Data-Pulse-2 `main` and defines
  the operationId(s), (2) the upstream slice owning those operations
  provides a `sc-verification.md` or equivalent, and (3) that
  verification artifact reports the relevant Success Criteria as
  `Verified`. Same section also adds an under-classification note:
  classifying a `stable` surface as `draft` is not safer than
  classifying it correctly.
- RF-1 "Sign-in / session endpoint": `draft` → `stable`.
- RF-1 "Session-context endpoint": `draft` → `stable`.
- RF-1 "Session lifecycle (sign-out / refresh / expiry)": `draft` → `stable`.
- Promotion evidence (unchanged from the original RF-1 verification —
  re-stated here for the audit trail):
  - All three rows verified earlier on 2026-05-25 against Data-Pulse-2
    `main` @ `b5142fe`. See the "2026-05-25 — RF-1 verification against
    Data-Pulse-2 (OQ-1)" entry below.
  - Upstream slice `001-foundation-auth-tenant-store`'s
    `sc-verification.md` declares "All nine Success Criteria
    SC-1 … SC-9 are now Verified — Foundation milestone complete"
    at Data-Pulse-2 SHA `602ae5c`.
  - SC-1, SC-3, SC-4, SC-5 are the auth/context-relevant criteria, all
    directly Verified (SC-5 measured at p95 = 7.0 ms vs 200 ms target).
- Confirmer: Ahmed Shaaban.
- Driver: 2026-05-25 external review (S-1) flagged that the literal
  "`-draft` suffix → `draft` row" rule was producing under-classification
  in the face of overwhelming corroborating evidence. The Version-suffix
  convention rule resolves the tension: literal rule still holds in the
  general case; explicit named exception when the SC-verification trio
  is met.
- `spec.md` §6 RF-1 row updated in the same commit (sync rule).

### 2026-05-25 — RF-4a verification (incidental to RF-4b lookup)

- RF-4a "Unknown-item list (scoped by tenant/store)":
  `draft` (seeded) → `draft` (verified, no status change).
- RF-4a "Unknown-item dismiss":
  `draft` (seeded) → `draft` (verified, no status change).
- Verified against:
  - Data-Pulse-2 `packages/contracts/openapi/catalog/unknown-items.yaml` on
    `main` @ `b5142fe` — Wave 1 operations confirmed present in the same
    lookup that verified RF-4b: `tenantAdminListUnknownItems`,
    `tenantAdminDismissUnknownItem`, and `posCaptureItem` (the latter is
    the POS-side capture that feeds the queue and is out of console scope
    for direct invocation; it produces the data the console reads).
- Confirmer: Ahmed Shaaban.
- Status promotion rationale: NOT promoted to `stable` even though the
  operations are present. Wave 1 sits inside an upstream wave-status
  process where Wave 2 reconciliation is explicitly gated; until
  Data-Pulse-2 publishes a SC-verification for the unknown-items surface
  comparable to slice `001-foundation-auth-tenant-store`'s, `draft` is
  the correct ceiling. The §Status legend Version-suffix convention rule
  requires an upstream SC-verification artifact for `stable` — absent
  for RF-4a today.
- Note: The seeded `draft` from spec.md author instruction is now backed
  by actual cross-repo evidence. Prior to this entry, the rows carried
  `draft` without a Verification log entry (an audit gap pointed out in
  the 2026-05-25 external review); this entry closes that gap.
- `spec.md` §6 RF-4a row does NOT need updating: status unchanged.

### 2026-05-25 — RF-1 verification against Data-Pulse-2 (OQ-1)

- RF-1 "Sign-in / session endpoint": `unknown` → `draft`.
- RF-1 "Session-context endpoint": `unknown` → `draft`.
- RF-1 "Session lifecycle (sign-out / refresh / expiry)": `unknown` → `draft`.
- Verified against:
  - Data-Pulse-2 `packages/contracts/openapi/auth.openapi.yaml` on `main`
    @ `b5142fe` — v1.0.0-draft, defines `signIn POST /api/v1/auth/signin`,
    `signOut POST /api/v1/auth/signout`, `refreshSession POST
    /api/v1/auth/refresh`, plus password-reset and email-verification
    sub-surfaces. Uses cookie-based dashboard sessions
    (`dp2_session` HttpOnly + Secure + SameSite=Lax).
  - Data-Pulse-2 `packages/contracts/openapi/context.openapi.yaml` on
    `main` @ `b5142fe` — v1.0.0-draft, defines `getActiveContext GET
    /api/v1/context/me`, `switchActiveTenant POST /api/v1/context/tenant`,
    `switchActiveStore POST /api/v1/context/store`, `clearActiveStore
    DELETE /api/v1/context/store`. ContextResponse includes user,
    active_tenant, active_store, active_role_code, memberships.
  - Data-Pulse-2 `specs/001-foundation-auth-tenant-store/sc-verification.md`
    on `main` — declares "All nine Success Criteria SC-1 … SC-9 are now
    Verified — Foundation milestone complete" at Data-Pulse-2 SHA
    `602ae5c`. SC-5 (context resolution p95 ≤ 200 ms) Verified at p95 =
    7.0 ms. SC-4 (server-only authorization) Verified.
  - Data-Pulse-2 `specs/001-foundation-auth-tenant-store/frontend-bypass-probe.md`
    on `main` — confirms FR-002 ("backend-enforced tenant/store safety")
    is operationally backed via T205 + manual probe.
- Confirmer: Ahmed Shaaban.
- Classification reasoning: All 10 OpenAPI files in Data-Pulse-2
  `packages/contracts/openapi/` carry the version label `1.0.0-draft`.
  This is a repo-wide convention, not a contract-instability marker.
  Per the literal Step 4 rule in this file ("file version is `*-draft`
  → `draft`"), all three rows classified `draft` rather than `stable`.
  Corroborating evidence (SC-verification "Foundation milestone
  complete") is strong but does not override the literal version-label
  rule. A future status promotion to `stable` would require the
  upstream `info.version` to drop the `-draft` suffix.
- OQ-1 from `spec.md` §10 is now answered for all three RF-1 rows.
- `spec.md` §6 RF-1 row MUST be updated in this same commit (sync rule):
  status `unknown` → `draft`, with reference to this verification log
  entry.

### 2026-05-25 — RF-4b verification against Data-Pulse-2 (OQ-2)

- RF-4b "Link unknown-item to existing catalog row": `blocked` → `blocked`
  (no status change; verification confirms the existing classification).
- RF-4b "Create new catalog row from unknown-item": `blocked` → `blocked`
  (no status change; verification confirms the existing classification).
- Verified against:
  - Data-Pulse-2 `packages/contracts/openapi/catalog/unknown-items.yaml`
    on `main` — v1.0.0-draft. Defines Wave 1 operations only:
    `posCaptureItem`, `tenantAdminListUnknownItems`,
    `tenantAdminDismissUnknownItem`. The same YAML states Wave 2
    reconciliation operations (link / create-new) are deferred to a
    separate gated extension.
  - Data-Pulse-2 `specs/005-pos-catalog-sync-reconciliation/wave-status.md`
    on `main` — Wave 2 contract for `tenantAdminLinkUnknownItem` and
    `tenantAdminCreateProductFromUnknownItem` requires gated approval.
- Confirmer: Ahmed Shaaban.
- OQ-2 from `spec.md` §10 is now answered for both RF-4b rows.
  FR-012 guard remains active until Data-Pulse-2 promotes the Wave 2
  contract out of "requires gated approval."
- Note: `spec.md` §6 RF-4b classification (currently `blocked`) does not
  need to change — the verification confirmed the existing status.

<!-- Append new entries below this line. Format:
### YYYY-MM-DD — <short title>
- RF-x.y "<row label>": <old status> → <new status>
- Verified against: <reference>
- Confirmer: <name>
- Notes: <optional, 1–3 lines>
-->

---

## Cross-reference index

- `.specify/memory/constitution.md` — Source-of-truth order; Implementation
  readiness gates; Principles 2, 3, 7, 8.
- [`spec.md`](./spec.md) — §6 Backend dependency map (must stay in sync with
  this file), §10 Open Questions (OQ-1..OQ-7), FR-005, FR-006, FR-011,
  FR-012.
- [`checklists/requirements.md`](./checklists/requirements.md) — Validation
  checklist for `spec.md`.
- `docs/agent-os/maestro-playbook.md` — §Cross-repo checks (when backend
  APIs / POS integration are relevant).
- `docs/product/repo-boundaries.md` — Ownership matrix that this file
  presupposes.

---

**End of API Readiness — 001 Console Foundation.**

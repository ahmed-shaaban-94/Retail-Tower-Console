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
| Last verified | _none yet_ |
| Status | Unverified — every row below is `unknown` until a Data-Pulse-2 confirmation is recorded. |

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

**Demotion rule.** A row may move *back* to a less-stable status (e.g.,
`stable` → `draft`, or `draft` → `blocked`) if a subsequent verification
shows the contract changed or was withdrawn. The history of changes is
tracked in §Verification log below.

---

## Cross-repo references

The verifier (whoever is filling this file) MUST consult these sources, in
this order, before promoting a row away from `unknown`:

1. **Data-Pulse-2 `main` branch** — implementation truth.
   - Repo: `https://github.com/<org>/Data-Pulse-2` <!-- TODO(owner): record actual URL when first verification runs -->
   - Branch: `main`
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
| Sign-in / session endpoint | `unknown` | — | — | — | OQ-1 (spec.md §10). Blocks every other RF (spec.md §5 sequencing rule). |
| Session-context endpoint (active tenant + active store for the authenticated actor) | `unknown` | — | — | — | OQ-1. |
| Session lifecycle (sign-out, refresh, expiry semantics) | `unknown` | — | — | — | OQ-1. |

**Gate impact.** Until all RF-1 rows are at `stable` or `draft`, no per-family
`implementation` slice (RF-2..RF-7) may open. This is the single hardest
gate in this file.

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
| Unknown-item list (scoped by tenant/store) | `draft` *(carried from spec.md §6 per author instruction)* | _Not yet verified against a specific Data-Pulse-2 ref_ | — | — | Must be re-verified before RF-4 implementation gate (FR-005). Status may demote to `blocked` or `unknown` if verification fails. |
| Unknown-item dismiss | `draft` *(carried from spec.md §6)* | _Not yet verified_ | — | — | Same as above. |

### RF-4b — Link to existing / create new from unknown (reconciliation)

| Backend surface (named, not specified) | Current status | Verified against | Date | Confirmer | Notes |
| --- | --- | --- | --- | --- | --- |
| Link unknown-item to existing catalog row | `blocked` | _No verification yet; classified blocked per spec.md FR-012_ | — | — | OQ-2. Must remain `blocked` or `draft` until Data-Pulse-2 confirms reconciliation contract is stable. Depends on RF-3 catalog identity model. |
| Create new catalog row from unknown-item | `blocked` | _No verification yet; classified blocked per spec.md FR-012_ | — | — | OQ-2. Same gate as link-to-existing. |

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

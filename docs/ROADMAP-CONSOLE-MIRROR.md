# Roadmap: Console Mirror — Retail Tower Console

> **Planning / roadmap document. Advisory only.** This is a durable sequencing artifact, not an approval to implement, and **not a green light to scaffold**. See the critical accuracy note in §1 before doing anything.

The admin console (`Retail-Tower-Console`) is the UI for **Retail Tower OS**. It owns **no** business logic. Under Constitution Principle IV (contract-first), every console screen is a **shadow** of a backend OpenAPI contract: a screen can only be built once the matching `[GATED]` contract is merged in the backend (`Data-Pulse-2`). This roadmap therefore mirrors the backend spec sequence one-to-one.

> **Console constitution rule:** this document references backend contracts **by path / operationId only**. It does **not** copy OpenAPI field shapes — the contract in `Data-Pulse-2/packages/contracts/openapi/` is the single source of truth.

---

## 1. CRITICAL accuracy note — the console is NOT green-lit to implement

The 002 console scaffold (`002-tooling-and-scaffold`, stack: React 19 · Vite 6 · TypeScript · Vitest · Playwright · Biome · GitHub Actions · pnpm) and **all** screens below are unblocked **only to be taken *through* the FR-008 five-checkbox approval gate** — they are **not** authorized for implementation.

Quoting the gate state from the 002 `plan.md` (FR-008, plan.md:151-170): the five-checkbox scaffold-authorization gate is **2 of 5 checked, 3 unchecked** (Spec ✓, API-dependency-map ✓; Plan, Task-list, Validation-gates ✗), and **file-creation is forbidden until all five clear** (plan.md:168-170).

> **⚠ Out-of-process deviation — disclose, do not paper over.** The scaffold is **absent on `origin/main`** (the top-level tree carries only docs/specs/config — no `package.json`, no `src/`), but it is **NOT merely "planning-only": a built scaffold is already COMMITTED on the unmerged branch `002-impl-tooling-scaffold`** (commit `215cb7b` — *"feat(002): scaffold tooling + framework (RF-1 client stubbed)"* — carrying `package.json` and `src/` as tracked blobs). That commit creates the very files the FR-008 gate authorizes — while the gate stands at **2/5 with "Plan approved" unchecked** (plan.md:157). So the accurate state is: **planning-only on `main`; an unmerged scaffold branch exists ahead of the gate.** This tension (committed-files vs ungated-plan) should be **reconciled before merge** — either by clearing the three open FR-008 boxes (Plan/Tasks/Validation approvals) so the commit becomes in-process, or by treating `215cb7b` as a deviation to remediate. Do not describe the console as "nothing built."

> **Naming-collision warning.** Console **FR-008** (this scaffold-authorization gate) is **unrelated** to backend spec **008 Sales / Transaction Capture**. Same number, different meaning. "Not green-lit" here refers to the FR-008 gate — it is **not** a statement that the console is waiting on backend Sales 008.

---

## 2. Per-RF readiness (from the console `api-readiness.md`)

Source: `Retail-Tower-Console/specs/001-console-foundation/api-readiness.md` (line anchors below).

| RF family | Verdict | Anchor |
| --- | --- | --- |
| **RF-1** auth / session / context | Stable | api-readiness.md 152-168 |
| **RF-2** tenant / store | Stable | api-readiness.md 172-181 |
| **RF-3** catalog | **Blocked, verified-absent** | api-readiness.md 184-190 |
| **RF-4a** list / dismiss / inspect | Draft (no SC-verification) | api-readiness.md 196-204 |
| **RF-4b** reconciliation | Draft (promoted from blocked FR-012) | api-readiness.md 206-211 |
| **RF-5** operator / admin (A6 boundary clean) | Stable | api-readiness.md 234-241 |
| **RF-6** audit-query + search | Stable (POS-event sub-row draft) | api-readiness.md 246-251 |
| **RF-7** settings | **Blocked, verified-absent** | api-readiness.md 255-261 |

---

## 3. Build now (through the gates) vs blocked-on-backend

**Eligible to take *through* the FR-008 gate** (stable backend contracts already merged) — still subject to the 3 unchecked FR-008 boxes before any file is created:

- **RF-1** auth / session / context — stable.
- **RF-2** tenant / store — stable.
- **RF-5** operator / admin — stable, A6 boundary clean.
- **RF-6** audit-query + search — stable (POS-event sub-row still draft).
- **RF-4a / RF-4b** review-queue list/dismiss/inspect + reconciliation — **draft** (shadow the shipped 005/007 contracts); buildable as drafts, but RF-4a has no SC-verification yet.

**Blocked on backend** (no merged contract to shadow):

- **RF-3** catalog — *verified-absent*. Unblocks only when the backend **Catalog-Management API** (parallel track, unnumbered) ships its `[GATED]` contract.
- **RF-7** settings — *verified-absent*. **No backend spec exists yet** to unblock it; do not assume one.

---

## 4. Contract -> RF mapping (the shadow sequence)

Each future console RF family lights up when its backend contract merges. This is the same ordered list as the backend roadmap (`Data-Pulse-2/docs/ROADMAP-ERP.md`).

| Backend spec / contract (Data-Pulse-2) | Console RF family it unblocks |
| --- | --- |
| Catalog-Management API (parallel track, unnumbered) | **RF-3** catalog management |
| **008** Sales / Transaction Capture | Future sales/transaction views (no RF family defined yet) |
| **009** Inventory & Stock Movements | Future inventory views |
| **010** Payments & Tender Reconciliation | Future payments / tender views |
| **012** Reporting / Analytics read-models | Future reporting / dashboard views |
| (none yet) | **RF-7** settings — no backend spec yet |

Notes on the chain (detail lives in the backend doc, not here):

- Backend **008** is the keystone and sits behind a money + temporal decision-slice gate; **009** and **010** are a parallel tier depending only on 008; **011** purchasing depends on 009; **012** reporting depends on all of them.
- **RF-3** does **not** wait on 008 — the Catalog-Management API is an independent parallel track.
- The live end-to-end sales loop additionally needs `POS-Pulse` to emit sale transactions against the backend 008 contract (it currently emits only a closed catalogue of audit events + unknown-item captures). That is a backend/POS dependency, not a console blocker.

---

## 5. Operating rule

Do not create console source files for any RF — including the otherwise-ready RF-1/2/5/6 — until the **FR-008 five-checkbox gate is fully cleared** (currently 3 of 5 unchecked, creation forbidden). Track gate state in the 002 `plan.md`, not in chat memory. **Note the §1 deviation:** an unmerged scaffold branch (`002-impl-tooling-scaffold` @ `215cb7b`) already created the gated files — reconcile that against the open gate before any merge, rather than letting it normalize ungated file creation.

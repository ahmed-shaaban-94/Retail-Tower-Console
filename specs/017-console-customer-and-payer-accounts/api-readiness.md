# 017 — API Readiness (CON-G3 evidence)

**Slice:** 017 console-customer-and-payer-accounts · **Date:** 2026-06-17
**Gate:** CON-G3 (upstream DP-2 035 G2 ratified + pinned). This document records the recheck-on-implement evidence. It does **not** clear CON-G5 (foundation FR-008 implementation gate) — that remains an owner approval, unsatisfied.

---

## Recheck-on-implement result — ✅ PASS

Verified read-only against **Data-Pulse-2 `origin/main`** (fresh fetch, 2026-06-17; plain `git fetch origin` per the documented sub-repo prune bug).

| Check | Result |
|---|---|
| DP-2 035 G2 contract present | ✅ `packages/contracts/openapi/settlement/settlement.yaml` |
| Contract version | `1.0.0-draft` |
| Contract last-touched commit (the G2 ratification) | `cb4a7e5` — *feat(035): … G2 contract draft (#574)* — **unchanged** |
| 035 runtime present | ✅ `SettlementModule` in `apps/api/src/app.module.ts` |
| **DP-2 `origin/main` pin (client codegen source)** | **`9874d44`** |

## Consumed operationIds — present & unchanged

017 consumes **exactly two** ops; both verified present (×1) in `settlement.yaml` on `origin/main`:

| operationId | Verb / path | Status |
|---|---|---|
| `consoleCreatePayerAccount` | `POST` payer-accounts | ✅ present |
| `consoleListPayerAccounts` | `GET` payer-accounts | ✅ present |

No third settlement op is consumed (boundary SC-001 — verified at design time; re-asserted in Phase 5).

## Pin to build the generated client from

When (post-FR-008) the DP-2 client is regenerated for 017, build it from **DP-2 `origin/main` @ `9874d44`** (or a fresh re-verify at that time — a pushed commit is not `main` truth until merged). The contract authority commit is `cb4a7e5`; tip `9874d44` is a later LOC-badge chore that does not touch settlement.

## Activation caveats (carried, not cleared by this doc)

- Contract is **`1.0.0-draft`** — not GA.
- DP-2 035 migration `0027` carries an **open human-review G3 gate** (apply on a non-prod DB).
- **CON-G5 / foundation FR-008** implementation gate is an owner approval and is **NOT satisfied** — `tasks.md` stays a plan of record until it clears.

> Re-run this recheck on a fresh fetch immediately before any client regeneration / implementation.

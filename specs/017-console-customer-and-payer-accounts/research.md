# 017 — Research & Foundation Reuse Map (CON-G4 evidence)

**Slice:** 017 console-customer-and-payer-accounts · **Date:** 2026-06-17
**Gate:** CON-G4 (reuse the 001 foundation primitives; author no new runtime dependency). This is design-phase evidence; no implementation is authorized (CON-G5 / FR-008 unsatisfied).

---

## Foundation primitives 017 reuses (verified present on Console `origin/main`)

017 adds **no new runtime dependency**. Every capability it needs already exists in the 001 foundation:

| Need | Reused primitive | Path (verified present) |
|---|---|---|
| Typed API calls in `{ status, data, error }` shape | `apiClient` + per-op wrappers | `src/lib/client.ts` |
| Generated OpenAPI client (typed paths) | openapi-typescript output | `src/generated/client.ts` |
| Active tenant/store scope | `ActiveContextProvider` + hook | `src/context/ActiveContextProvider.tsx`, `src/context/useActiveContext.ts` |
| Page-level status / success surface | `Banner` | `src/components/Banner.tsx` |
| Field-level validation surface | `InlineError` | `src/components/InlineError.tsx` |
| Query-key convention (cache keys + invalidation) | the `auditQueryKeys` pattern | `src/audit/auditQueryKeys.ts` (pattern to mirror) |
| Route registration + shell nav | app shell | `src/App.tsx` |

> The `{ status, data, error }` wrapper convention is established in `src/lib/client.ts` (e.g. `signIn`/`getActiveContext`/`switchActiveTenant` all return `{ status, data, error }`). 017's two payer wrappers (T005) follow it verbatim — they are **new wrappers over the existing generated client**, not a new client.

## Consumed contract (from DP-2 035, read-only)

- `consoleCreatePayerAccount` (POST) — body `PayerAccountCreate` → `PayerAccount` (201).
- `consoleListPayerAccounts` (GET) — `category` filter + opaque keyset cursor → `PayerAccountPage`.
- Pin + recheck evidence: see [`api-readiness.md`](./api-readiness.md). Contract `1.0.0-draft` @ `cb4a7e5`; DP-2 pin `9874d44`.

## Decisions inherited (not re-decided here)

- **OQ-CON-EDIT → AD-SALE-SETTLEMENT-2 (RATIFIED defer):** v1 is **read + create only**. `status`/`version` are rendered **read-only**; no `consoleUpdatePayerAccount`/suspend op is fabricated.
- **OQ-1:** a payer account is a **record, not an auth principal** — creating one issues no login/session/role.
- **OQ-7-applied:** operated by the Console admin/accounting human via `cookieAuth` + `Management`-family RBAC — **not** the cashier (that is POS-020).
- **OQ-CON-IDEMPOTENCY / LIST-FILTER / STORE-SCOPE:** see [`contracts/console-payer-accounts.md`](./contracts/console-payer-accounts.md).

## No-new-dependency assertion (CON-G4)

017 introduces **no** new npm package, no new client, no new global provider. It composes the primitives above. Any deviation is a CON-G4 failure and a STOP-and-raise.

## Out of scope (no tasks)

Payer edit/suspend (deferred v1.1); receivables/claims (018); apply-payment/reconciliation (019); POS settlement intent (020); any OpenAPI/backend/ERPNext authoring.

# 018 — Research: Reuse Map & Runtime-vs-Contract Status (Phase 0)

**Slice:** 018 console-receivables-and-insurance-claims · **Date:** 2026-06-17
**Phase 0 (authorable now, Markdown only).** The build phases (codegen onward) are **GATED on 018's own G-client + G-boundary**; this doc authors no code and clears no gate. The DP-2 035 runtime it consumes is already present @ DP-2 `origin/main`.

---

## Runtime-vs-contract status (T002) — verified

Read read-only against **DP-2 `origin/main`** (fresh fetch 2026-06-17, pin `9874d44`):

| Item | Status |
|---|---|
| DP-2 035 G2 contract `settlement.yaml` | ✅ present, `1.0.0-draft` @ `cb4a7e5` (unchanged) |
| 035 **runtime** (controller/services/`SettlementModule`) | ✅ present (`apps/api/src/app.module.ts`) — **NOT** "no controller exists yet" |
| 4 consumed ops present | ✅ `consoleGetReceivable`, `consoleListReceivables`, `consoleSubmitClaim`, `consoleReconcileRemittance` (each ×1) |
| Migration `0027` | present; **G3 human-review gate open** (non-prod apply) |

> **Trust the source tree, not the stale comment.** `settlement.yaml`'s header still carries a stale "no controller exists yet" line that predates the runtime merge. The runtime IS merged. 018's blocker is **its own G-client codegen step**, not an upstream gap.

## Reuse map (RF-1 / RF-2 primitives — verified present on Console `origin/main`)

| Need | Reused primitive | Path |
|---|---|---|
| Typed API wrappers (`{status,data,error}`) | `apiClient` + wrappers | `src/lib/client.ts` |
| Generated client | openapi-typescript output | `src/generated/client.ts` |
| Active tenant/store scope | `ActiveContextProvider` | `src/context/ActiveContextProvider.tsx` |
| List/table + drawer + filters pattern | the audit module | `src/audit/AuditTable.tsx`, `AuditInspectDrawer.tsx`, `AuditFilters.tsx`, `AuditPager.tsx` |
| Status / error surfaces | `Banner`, `InlineError` | `src/components/Banner.tsx`, `src/components/InlineError.tsx` |
| Query-key + invalidation pattern | `auditQueryKeys` | `src/audit/auditQueryKeys.ts` (mirror) |
| Route + shell nav | app shell | `src/App.tsx` |

018 adds **no new runtime dependency** — it composes the foundation + the audit-module list/drawer pattern.

## Consumed-vs-NOT-consumed partition (T003)

**Consumes (4):** `consoleGetReceivable`, `consoleListReceivables`, `consoleSubmitClaim`, `consoleReconcileRemittance`.

**Explicitly does NOT consume:**
- `consoleApplyPayment` — **owned by 019** (cash application). 018 reads receivables; it never applies payment. *(Earlier 018 prose that placed apply-payment in 017 was stale; corrected — it is 019's.)*
- payer CRUD (`consoleCreate/ListPayerAccount`) — 017.
- `posRecordSettlementIntent` — POS-020. Any reversal — DP-026 + Connector Arc A + POS-014.

## Gates (018-owned; none satisfied)

- **G-client** — generate the DP-2 035 client into the Console (Phase 2; the runtime it targets is present). 018's own codegen step, not an upstream blocker.
- **G-boundary** — author the VG-1..VG-4 boundary test (Phase 5).
- **Foundation FR-008 implementation gate** — owner approval; **unsatisfied** → tasks stay a plan of record.

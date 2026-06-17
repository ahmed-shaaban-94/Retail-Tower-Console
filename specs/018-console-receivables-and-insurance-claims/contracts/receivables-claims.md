# 018 — Consumed Contract: Receivables & Claims (Markdown design doc, NOT YAML)

**Slice:** 018 · **Date:** 2026-06-17
**CONSUME-ONLY. Authors NO OpenAPI YAML.** Authority is DP-2 `packages/contracts/openapi/settlement/settlement.yaml` (`1.0.0-draft`, @ `cb4a7e5`). If shapes diverge from DP-2 `origin/main`, DP-2 is authority — re-run the recheck. All four ops use `cookieAuth` (human session).

---

## 018's consumed surface — exactly four ops

### 1. `consoleListReceivables` — `GET /api/v1/settlement/receivables`
- **Query:** `store_id`, `state` (`ReceivableStateQuery`), `payerRef`, `cursor`, `page_size`.
- **Responses:** `200` → `ReceivablePage` (newest-first); `400/401/403/404/500`.

### 2. `consoleGetReceivable` — `GET /api/v1/settlement/receivables/{receivableRef}`
- **Object-level authz:** a receivable outside the operator's (tenant, store) scope returns a **non-disclosing `404`** (§II/§XII, FR-022) — render 404 and "not found", never reveal cross-tenant existence.
- **Responses:** `200` → `Receivable`; `400/401/403/404/500`.

### 3. `consoleSubmitClaim` — `POST` (submit a claim)
- **Body `ClaimCreate`:** `payerRef` (required) + `receivableRefs[]` (1..500, open/partially-applied receivables).
- **Response:** `Claim` (`status` ∈ `submitted|acknowledged|reconciled`).

### 4. `consoleReconcileRemittance` — `POST` (reconcile a remittance against a claim)
- **Body `RemittanceReconcile`:** `remittedAmount` (`Money` string, required — **may be 0** for a full-rejection remittance) + optional opaque `remittanceRef`.
- **Response:** `ReconciliationResult` (`claimedAmount`, `remittedAmount`, `variance`, `outcome`).

## Explicitly NOT consumed by 018 (boundary, VG-2)

- **`consoleApplyPayment`** — **owned by Console 019** (cash application; `x-idempotency: required`; transitions `settled`/`partially_applied`). 018 **reads** receivables and submits claims; it **never** applies payment. This is the corrected ownership (earlier 018 prose pointing at 017 was stale).
- payer CRUD → 017 · `posRecordSettlementIntent` → POS-020 · any reversal/void → DP-026 + Connector Arc A + POS-014.

## Typed wrappers to add (Phase 2 — definition only, gated on G-client)

Four wrappers in `src/lib/client.ts` in the `{ status, data, error }` shape:
```
consoleListReceivables(params: {store_id?, state?, payerRef?, cursor?, page_size?}) → ReceivablePage
consoleGetReceivable(receivableRef) → Receivable        // 404 = non-disclosing
consoleSubmitClaim(body: ClaimCreate) → Claim
consoleReconcileRemittance(claimRef, body: RemittanceReconcile) → ReconciliationResult
```
Compose the generated client; do not hand-edit `src/generated/client.ts`.

## Manual-insurer posture (OQ-3, decided)

v1 has **no insurer API and no remittance-file import** — claim submission + remittance reconciliation are **manual operator entries** only. An ingestion channel would be a forbidden new egress under the architecture boundary; out of scope.

## Money + tax

`Money` is an **exact-decimal string** — render verbatim, never coerce to float. `taxPlaceholder` is tax-pending (no VAT allocation v1); render nothing.

## Boundary assertion (VG-1..VG-4)

All calls via the generated client; **only these four ops**; no frontend role-branching; no new egress. Verified by the G-boundary test (Phase 5, T020).

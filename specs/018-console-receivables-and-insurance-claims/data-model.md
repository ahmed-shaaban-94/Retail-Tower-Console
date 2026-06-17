# 018 — Data Model (render-side projections only · Phase 1)

**Slice:** 018 · **Date:** 2026-06-17
**018 owns NO store of record.** DP-2 035 owns receivable + claim state. These are render-side projections held in TanStack Query cache for display only (mirrors 017's posture).

---

## Receivable (render projection — from DP-2 `Receivable`)

| Field | Type | Render note |
|---|---|---|
| `receivableRef` | uuid | row identity |
| `saleRef` | uuid | link to originating sale (008/032); never mutated by settlement |
| `payerRef` | uuid | who owes |
| `outstandingBalance` | `Money` (exact-decimal string) | render verbatim — **no float coercion** |
| `state` | `ReceivableState` | badge (see states) |
| `erpnextPaymentEntryRef` | string \| null | non-authoritative ERP pointer; **null until R1 posting gate clears** — show "not posted" when null |
| `taxPlaceholder` | object \| null | tax-pending; render nothing (no VAT in v1) |
| `version` | integer | optimistic-concurrency carrier; read-only in 018 (018 never mutates a receivable) |

### ReceivableState (the 5 non-reversal states)
`open → partially_applied → settled` · `open → claimed → (settled | partially_applied + variance)` · variance/net-zero-or-below → `flagged`.
**`reversal_consumed` is EXCLUDED** (DP-026 carve) — 018 renders only these five; do not invent a reversal state.

## Claim (render projection — from DP-2 `Claim`)

| Field | Type | Note |
|---|---|---|
| `claimRef` | uuid | identity |
| `payerRef` | uuid | claimant payer |
| `status` | `submitted \| acknowledged \| reconciled` | lifecycle badge |
| `receivableRefs` | uuid[] (≤500) | the bundled receivables |

## ReconciliationResult (render projection)

`claimRef`, `claimedAmount`, `remittedAmount`, `variance` (all `Money` strings), `outcome` — render variance + outcome read-only. Rejection of a line is **not** a new state here; it routes to DP-026 reuse (NG-1).

## Forms (consumed write ops — definition only, no code)

- **Submit claim** (`ClaimCreate`): `payerRef` (required) + `receivableRefs[]` (1..500 open/partially-applied receivables). → `Claim`.
- **Reconcile remittance** (`RemittanceReconcile`): `remittedAmount` (`Money`, required) + optional opaque `remittanceRef`. → `ReconciliationResult`. *(`remittedAmount` may be 0 — a full-rejection remittance is valid.)*

## Cache + invalidation

- Receivable list keyed by tenant + `ReceivableState` filter + opaque cursor → `ReceivablePage`.
- Submit-claim success invalidates the affected receivables + claim views; reconcile success invalidates the claim's reconciliation view. **No optimistic mutation** — render only server truth.

## Not modeled / out of scope

Apply-payment (019 owns `consoleApplyPayment`); payer CRUD (017); cross-receivable reconciliation beyond a single claim's remittance (019); reversals (DP-026 + Arc A); insurer API/file import (manual entry only, v1 — OQ-3); VAT math (G6 / tax-pending).

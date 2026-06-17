/**
 * 018 claim-submit + remittance-reconcile form validation — pure, no client.
 * Validates only what the consumed contract constrains:
 *   ClaimCreate        — payerRef (uuid, required) + receivableRefs (1..500).
 *   RemittanceReconcile — remittedAmount (Money: non-negative exact-decimal,
 *                         scale ≤4; 0 is valid = full-rejection remittance) +
 *                         optional opaque remittanceRef.
 * The server stays authoritative; this is a fail-fast UX guard. Mirrors 017's
 * payerCreateForm.
 */

export interface ClaimDraft {
  payerRef: string;
  receivableRefs: string[];
}

export type ClaimDraftErrors = Partial<Record<"payerRef" | "receivableRefs", string>>;

const CLAIM_MAX_RECEIVABLES = 500;

export function validateClaimDraft(draft: ClaimDraft): ClaimDraftErrors {
  const errors: ClaimDraftErrors = {};
  if (!draft.payerRef || draft.payerRef.trim().length === 0) {
    errors.payerRef = "Select a payer for this claim.";
  }
  const n = draft.receivableRefs.length;
  if (n < 1) {
    errors.receivableRefs = "Select at least one receivable to claim.";
  } else if (n > CLAIM_MAX_RECEIVABLES) {
    errors.receivableRefs = `A claim may bundle at most ${CLAIM_MAX_RECEIVABLES} receivables.`;
  }
  return errors;
}

export interface RemittanceDraft {
  remittedAmount: string;
  remittanceRef?: string | null;
}

export type RemittanceDraftErrors = Partial<Record<"remittedAmount", string>>;

/**
 * Money: non-negative exact-decimal string, up to 4 fractional digits. Unlike a
 * payment apply (>0), a remittance MAY be 0 — a full-rejection remittance is valid.
 */
const NON_NEGATIVE_MONEY = /^\d{1,15}(\.\d{1,4})?$/;

export function validateRemittanceDraft(draft: RemittanceDraft): RemittanceDraftErrors {
  const errors: RemittanceDraftErrors = {};
  const v = (draft.remittedAmount ?? "").trim();
  if (!NON_NEGATIVE_MONEY.test(v)) {
    errors.remittedAmount = "Enter a valid amount (e.g. 120.00).";
  }
  return errors;
}

/**
 * 019 apply-payment form validation — pure, no client. consoleApplyPayment is
 * 019's own cash-application surface (PaymentApplicationCreate: { amount, version,
 * note? }). amount is a STRICTLY POSITIVE exact-decimal Money string (scale ≤4) —
 * the contract's `payment_application_amount_positive` CHECK; an apply of 0 is a
 * meaningless no-op (distinct from a remittance, which may be 0 = full rejection).
 * version is the optimistic-concurrency carrier (stale → 409). Server stays
 * authoritative; this is a fail-fast UX guard.
 */

export interface ApplyPaymentDraft {
  amount: string;
  version: number;
  note?: string | null;
}

export type ApplyPaymentDraftErrors = Partial<Record<"amount" | "version", string>>;

/** Strictly-positive exact-decimal money, up to 4 fractional digits. */
const POSITIVE_MONEY = /^\d{1,15}(\.\d{1,4})?$/;

export function validateApplyPaymentDraft(draft: ApplyPaymentDraft): ApplyPaymentDraftErrors {
  const errors: ApplyPaymentDraftErrors = {};

  const v = (draft.amount ?? "").trim();
  if (!POSITIVE_MONEY.test(v) || Number(v) <= 0) {
    errors.amount = "Enter an amount greater than zero (e.g. 50.00).";
  }

  if (typeof draft.version !== "number" || !Number.isInteger(draft.version) || draft.version < 0) {
    errors.version = "A valid receivable version is required.";
  }

  return errors;
}

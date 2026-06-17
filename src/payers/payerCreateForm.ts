/**
 * 017 create-payer form validation — pure, no client (PayerAccountCreate shape).
 * Validates only what the consumed contract constrains: required `category`
 * (v1 enum) + `displayName` (1..200, trimmed). `externalRef`/`storeId`/
 * `creditTerms` are optional/opaque — no tax/credit-terms field is invented
 * (NG-8). The server remains authoritative; this is a fail-fast UX guard, not a
 * second source of truth.
 */

/** v1 payer categories (PayerCategory enum — extensible upstream, not here). */
export const PAYER_CATEGORIES = ["credit_customer", "corporate", "insurer"] as const;
export type PayerCategory = (typeof PAYER_CATEGORIES)[number];

export interface PayerCreateDraft {
  category: PayerCategory;
  displayName: string;
  externalRef?: string | null;
  storeId?: string | null;
  creditTerms?: Record<string, unknown> | null;
}

/** Field-keyed validation errors; empty object = valid. */
export type PayerDraftErrors = Partial<Record<"category" | "displayName", string>>;

const DISPLAY_NAME_MAX = 200;

export function validatePayerDraft(draft: PayerCreateDraft): PayerDraftErrors {
  const errors: PayerDraftErrors = {};

  if (!PAYER_CATEGORIES.includes(draft.category)) {
    errors.category = "Select a payer category.";
  }

  const name = (draft.displayName ?? "").trim();
  if (name.length === 0) {
    errors.displayName = "Display name is required.";
  } else if (draft.displayName.length > DISPLAY_NAME_MAX) {
    errors.displayName = `Display name must be at most ${DISPLAY_NAME_MAX} characters.`;
  }

  return errors;
}

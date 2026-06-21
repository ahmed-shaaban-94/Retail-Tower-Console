import { Banner } from "@/components/Banner";
import { Drawer } from "@/components/Drawer";
import { InlineError } from "@/components/InlineError";
import { type PaymentApplicationBody, consoleApplyPayment } from "@/lib/client";
import { classifyWriteOutcome, newIdempotencyKey } from "@/receivables/settlementWriteOutcome";
/**
 * 019 ApplyPayment drawer — 019's own cash-application surface (consoleApplyPayment,
 * DP-2-owned operational truth 7-C). Validates the amount (>0; wrapper NOT called
 * on invalid) → consoleApplyPayment(receivableRef, { amount, version }, key) with a
 * per-submit Idempotency-Key → classifyWriteOutcome. On 200 renders the updated
 * receivable (new outstandingBalance + state partially_applied|settled). version
 * is the receivable's optimistic-concurrency token — a stale version → 409. The
 * 032 posting-retry surface is NOT here (GATED on 032/G7). Mirrors the reconcile
 * drawer; reuses the shared write-outcome classifier.
 */
import { useState } from "react";
import { validateApplyPaymentDraft } from "./applyPaymentForm";

export interface ApplyPaymentProps {
  receivable: { receivableRef: string; outstandingBalance: string; version: number };
  onClose: () => void;
  onApplied: () => void;
}

interface ReceivableView {
  outstandingBalance: string;
  state: "open" | "partially_applied" | "settled" | "claimed" | "flagged";
}

type BannerState = { variant: "danger" | "warning"; message: string; requestId?: string };

export function ApplyPayment({
  receivable,
  onClose,
  onApplied,
}: ApplyPaymentProps): React.JSX.Element {
  const [amountError, setAmountError] = useState<string | undefined>();
  const [banner, setBanner] = useState<BannerState | undefined>();
  const [pending, setPending] = useState(false);
  const [updated, setUpdated] = useState<ReceivableView | undefined>();

  async function submitWithKey(body: PaymentApplicationBody, key: string): Promise<void> {
    const res = await consoleApplyPayment(receivable.receivableRef, body, key);
    const outcome = classifyWriteOutcome({
      status: res.status,
      headers: res.headers,
      error: res.error as { error?: { code?: string; request_id?: string } } | undefined,
    });
    switch (outcome.kind) {
      case "ok":
      case "replayed":
        setUpdated(res.data as ReceivableView | undefined);
        onApplied();
        return;
      case "validation":
        setAmountError("Check the amount and try again.");
        return;
      case "regenerate-key":
        await submitWithKey(body, newIdempotencyKey());
        return;
      case "unauthenticated":
        setBanner({ variant: "warning", message: "Your session has expired. Sign in again." });
        return;
      case "forbidden":
        setBanner({
          variant: "danger",
          message: "You do not have permission to apply payments for this tenant.",
          requestId: outcome.requestId,
        });
        return;
      case "key-conflict":
      case "conflict":
        // A 409 here is most often a STALE version (the receivable changed since
        // load) — non-disclosing; the operator should re-open the receivable.
        setBanner({
          variant: "danger",
          message: "This receivable changed since it was opened. Reopen it and try again.",
          requestId: outcome.requestId,
        });
        return;
      default:
        setBanner({
          variant: "danger",
          message: "Something went wrong applying the payment. Try again.",
          requestId: outcome.requestId,
        });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setAmountError(undefined);
    setBanner(undefined);

    const form = new FormData(e.currentTarget);
    const amount = String(form.get("amount") ?? "");
    const note = (String(form.get("note") ?? "").trim() || null) as string | null;

    const errors = validateApplyPaymentDraft({ amount, version: receivable.version });
    if (errors.amount || errors.version) {
      setAmountError(errors.amount ?? errors.version);
      return;
    }

    setPending(true);
    try {
      await submitWithKey({ amount, version: receivable.version, note }, newIdempotencyKey());
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer title="Apply payment" onClose={onClose}>
      {banner ? (
        <Banner variant={banner.variant} message={banner.message} requestId={banner.requestId} />
      ) : null}

      {updated ? (
        <div className="surface__result">
          <p className="surface__scope-line">
            Payment applied — receivable now <span className="badge">{updated.state}</span>
          </p>
          <dl className="data-pairs">
            <div>
              <dt>Outstanding</dt>
              <dd>{updated.outstandingBalance}</dd>
            </div>
          </dl>
          <div className="surface__actions">
            <button type="button" className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <form className="surface__form" onSubmit={onSubmit} noValidate>
          <p className="surface__scope-line">
            Applying a payment against receivable <strong>{receivable.receivableRef}</strong> —
            outstanding <strong>{receivable.outstandingBalance}</strong>.
          </p>
          <div className="field">
            <label htmlFor="apply-amount">Amount</label>
            <input
              id="apply-amount"
              name="amount"
              className="input"
              inputMode="decimal"
              aria-invalid={amountError ? "true" : undefined}
              aria-describedby={amountError ? "apply-amount-error" : undefined}
              autoComplete="off"
            />
            <span id="apply-amount-error">
              <InlineError message={amountError} />
            </span>
          </div>
          <div className="field">
            <label htmlFor="apply-note">Note (optional)</label>
            <input id="apply-note" name="note" className="input" autoComplete="off" />
          </div>
          <div className="surface__actions">
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? <span className="spinner" aria-hidden="true" /> : null}
              Apply payment
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </Drawer>
  );
}

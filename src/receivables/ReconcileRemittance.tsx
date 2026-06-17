import { Banner } from "@/components/Banner";
import { Drawer } from "@/components/Drawer";
import { InlineError } from "@/components/InlineError";
import { type RemittanceReconcileBody, consoleReconcileRemittance } from "@/lib/client";
/**
 * 018 ReconcileRemittance drawer. Records a remittance against a claim
 * (RemittanceReconcile: remittedAmount Money [may be 0 = full rejection] +
 * optional opaque remittanceRef) and renders the returned ReconciliationResult
 * (claimed / remitted / variance + outcome settled|partial|flagged). Client-
 * validates first (validateRemittanceDraft — wrapper NOT called on invalid),
 * sends a per-submit Idempotency-Key, routes via classifyWriteOutcome. Mirrors
 * 018's SubmitClaim. Completes 018's write surface.
 */
import { useState } from "react";
import { validateRemittanceDraft } from "./receivableForms";
import { classifyWriteOutcome, newIdempotencyKey } from "./settlementWriteOutcome";

export interface ReconcileRemittanceProps {
  claimRef: string;
  onClose: () => void;
  onReconciled: () => void;
}

interface ReconciliationResultView {
  claimedAmount: string;
  remittedAmount: string;
  variance: string;
  outcome: "settled" | "partial" | "flagged";
}

type BannerState = { variant: "danger" | "warning"; message: string; requestId?: string };

export function ReconcileRemittance({
  claimRef,
  onClose,
  onReconciled,
}: ReconcileRemittanceProps): React.JSX.Element {
  const [amountError, setAmountError] = useState<string | undefined>();
  const [banner, setBanner] = useState<BannerState | undefined>();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ReconciliationResultView | undefined>();

  async function submitWithKey(body: RemittanceReconcileBody, key: string): Promise<void> {
    const res = await consoleReconcileRemittance(claimRef, body, key);
    const outcome = classifyWriteOutcome({
      status: res.status,
      headers: res.headers,
      error: res.error as { error?: { code?: string; request_id?: string } } | undefined,
    });
    switch (outcome.kind) {
      case "ok":
      case "replayed":
        setResult(res.data as ReconciliationResultView | undefined);
        onReconciled();
        return;
      case "validation":
        setAmountError("Check the remittance amount and try again.");
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
          message: "You do not have permission to reconcile remittances for this tenant.",
          requestId: outcome.requestId,
        });
        return;
      case "key-conflict":
      case "conflict":
        setBanner({
          variant: "danger",
          message: "That remittance could not be reconciled. Please try again.",
          requestId: outcome.requestId,
        });
        return;
      default:
        setBanner({
          variant: "danger",
          message: "Something went wrong reconciling the remittance. Try again.",
          requestId: outcome.requestId,
        });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setAmountError(undefined);
    setBanner(undefined);

    const form = new FormData(e.currentTarget);
    const remittedAmount = String(form.get("remittedAmount") ?? "");
    const remittanceRef = (String(form.get("remittanceRef") ?? "").trim() || null) as string | null;

    const errors = validateRemittanceDraft({ remittedAmount });
    if (errors.remittedAmount) {
      setAmountError(errors.remittedAmount);
      return; // client guard: wrapper NOT called on an invalid amount
    }

    setPending(true);
    try {
      await submitWithKey({ remittedAmount, remittanceRef }, newIdempotencyKey());
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer title="Reconcile remittance" onClose={onClose}>
      {banner ? (
        <Banner variant={banner.variant} message={banner.message} requestId={banner.requestId} />
      ) : null}

      {result ? (
        <div className="surface__result">
          <p className="surface__scope-line">
            Outcome <span className="badge">{result.outcome}</span>
          </p>
          <dl className="data-pairs">
            <div>
              <dt>Claimed</dt>
              <dd>{result.claimedAmount}</dd>
            </div>
            <div>
              <dt>Remitted</dt>
              <dd>{result.remittedAmount}</dd>
            </div>
            <div>
              <dt>Variance</dt>
              <dd>{result.variance}</dd>
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
            Reconciling a remittance for claim <strong>{claimRef}</strong>.
          </p>
          <div className="field">
            <label htmlFor="remitted-amount">Remitted amount</label>
            <input
              id="remitted-amount"
              name="remittedAmount"
              className="input"
              inputMode="decimal"
              aria-invalid={amountError ? "true" : undefined}
              aria-describedby={amountError ? "remitted-amount-error" : undefined}
              autoComplete="off"
            />
            <span id="remitted-amount-error">
              <InlineError message={amountError} />
            </span>
          </div>
          <div className="field">
            <label htmlFor="remittance-ref">Remittance reference (optional)</label>
            <input
              id="remittance-ref"
              name="remittanceRef"
              className="input"
              placeholder="payer advice reference"
              autoComplete="off"
            />
          </div>
          <div className="surface__actions">
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? <span className="spinner" aria-hidden="true" /> : null}
              Reconcile
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

import { Banner } from "@/components/Banner";
import { Drawer } from "@/components/Drawer";
import { InlineError } from "@/components/InlineError";
import { type ClaimCreateBody, consoleSubmitClaim } from "@/lib/client";
/**
 * 018 SubmitClaim drawer. Submits the selected receivables as a claim for a payer
 * (ClaimCreate: payerRef + receivableRefs 1..500). Client-validates first
 * (validateClaimDraft — wrapper NOT called on invalid), sends a per-submit
 * Idempotency-Key, routes the outcome via classifyWriteOutcome. Mirrors 017's
 * PayerCreate.
 */
import { useState } from "react";
import { validateClaimDraft } from "./receivableForms";
import { classifyWriteOutcome, newIdempotencyKey } from "./settlementWriteOutcome";

export interface SubmitClaimProps {
  activeTenant: { id: string; name: string };
  payerRef: string;
  receivableRefs: string[];
  onClose: () => void;
  onSubmitted: () => void;
}

type BannerState = { variant: "danger" | "warning"; message: string; requestId?: string };

export function SubmitClaim({
  activeTenant,
  payerRef,
  receivableRefs,
  onClose,
  onSubmitted,
}: SubmitClaimProps): React.JSX.Element {
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [banner, setBanner] = useState<BannerState | undefined>();
  const [pending, setPending] = useState(false);

  async function submitWithKey(body: ClaimCreateBody, key: string): Promise<void> {
    const res = await consoleSubmitClaim(body, key);
    const outcome = classifyWriteOutcome({
      status: res.status,
      headers: res.headers,
      error: res.error as { error?: { code?: string; request_id?: string } } | undefined,
    });
    switch (outcome.kind) {
      case "ok":
      case "replayed":
        onSubmitted();
        return;
      case "validation":
        setFieldError("Check the claim and try again.");
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
          message: "You do not have permission to submit claims for this tenant.",
          requestId: outcome.requestId,
        });
        return;
      case "key-conflict":
      case "conflict":
        setBanner({
          variant: "danger",
          message: "That claim could not be submitted. Please try again.",
          requestId: outcome.requestId,
        });
        return;
      default:
        setBanner({
          variant: "danger",
          message: "Something went wrong submitting the claim. Try again.",
          requestId: outcome.requestId,
        });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setFieldError(undefined);
    setBanner(undefined);

    const errors = validateClaimDraft({ payerRef, receivableRefs });
    if (errors.payerRef || errors.receivableRefs) {
      setFieldError(errors.receivableRefs ?? errors.payerRef);
      return;
    }

    setPending(true);
    try {
      await submitWithKey({ payerRef, receivableRefs }, newIdempotencyKey());
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer title="Submit claim" onClose={onClose}>
      {banner ? (
        <Banner variant={banner.variant} message={banner.message} requestId={banner.requestId} />
      ) : null}

      <form className="surface__form" onSubmit={onSubmit} noValidate>
        <p className="surface__scope-line">
          Submitting a claim for <strong>{receivableRefs.length}</strong> receivable
          {receivableRefs.length === 1 ? "" : "s"} in <strong>{activeTenant.name}</strong>.
        </p>
        <span id="claim-error">
          <InlineError message={fieldError} />
        </span>
        <div className="surface__actions">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? <span className="spinner" aria-hidden="true" /> : null}
            Submit claim
          </button>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}

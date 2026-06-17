import { Banner } from "@/components/Banner";
import { Drawer } from "@/components/Drawer";
import { InlineError } from "@/components/InlineError";
import { type PayerAccountCreateBody, consoleCreatePayerAccount } from "@/lib/client";
/**
 * 017 SF2 — Create-payer drawer. Uncontrolled native form (category /
 * displayName / externalRef / store scope). Client-validates via
 * validatePayerDraft (fail-fast UX guard; server stays authoritative), then
 * calls consoleCreatePayerAccount with a per-submit Idempotency-Key and routes
 * the result through classifyPayerCreateOutcome:
 *
 *   201 / replayed   → onCreated (close + refetch list)
 *   400 validation   → inline field error
 *   400 key issue    → regenerate key + resubmit once (not user-facing)
 *   401              → session banner (interceptor owns the redirect)
 *   403              → permission banner
 *   409 key-conflict → regenerate key + "please retry" banner
 *   409 (other)      → non-disclosing conflict banner (no cross-tenant leak)
 *
 * No status/version field — v1 is create-only (OQ-CON-EDIT deferred). Mirrors
 * the InviteMember drawer, minus the 425/auth-disambiguation (payer create has none).
 */
import { useState } from "react";
import {
  type PayerCreateOutcome,
  classifyPayerCreateOutcome,
  newIdempotencyKey,
} from "./payerIdempotency";
import { type PayerCategory, type PayerCreateDraft, validatePayerDraft } from "./payerCreateForm";

export interface PayerCreateProps {
  activeTenant: { id: string; name: string };
  onClose: () => void;
  onCreated: () => void;
}

type BannerState = { variant: "danger" | "warning"; message: string; requestId?: string };

export function PayerCreate({ activeTenant, onClose, onCreated }: PayerCreateProps): React.JSX.Element {
  const [nameError, setNameError] = useState<string | undefined>();
  const [banner, setBanner] = useState<BannerState | undefined>();
  const [pending, setPending] = useState(false);

  async function submitWithKey(body: PayerAccountCreateBody, key: string): Promise<void> {
    const res = await consoleCreatePayerAccount(body, key);
    const classified: PayerCreateOutcome = classifyPayerCreateOutcome({
      status: res.status,
      headers: res.headers,
      error: res.error as { error?: { code?: string; request_id?: string } } | undefined,
    });

    switch (classified.kind) {
      case "created":
      case "replayed":
        onCreated();
        return;
      case "validation":
        setNameError("Check the payer details and try again.");
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
          message: "You do not have permission to create payer accounts for this tenant.",
          requestId: classified.requestId,
        });
        return;
      case "key-conflict":
        setBanner({
          variant: "danger",
          message: "That payer could not be created. Please try again.",
          requestId: classified.requestId,
        });
        return;
      case "conflict":
        setBanner({
          variant: "danger",
          message: "That payer account could not be created.",
          requestId: classified.requestId,
        });
        return;
      default:
        setBanner({
          variant: "danger",
          message: "Something went wrong creating the payer. Try again.",
          requestId: classified.requestId,
        });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setNameError(undefined);
    setBanner(undefined);

    const form = new FormData(e.currentTarget);
    const draft: PayerCreateDraft = {
      category: String(form.get("category") ?? "credit_customer") as PayerCategory,
      displayName: String(form.get("displayName") ?? ""),
      externalRef: (String(form.get("externalRef") ?? "").trim() || null) as string | null,
    };

    const errors = validatePayerDraft(draft);
    if (errors.displayName || errors.category) {
      setNameError(errors.displayName ?? errors.category);
      return; // client guard: wrapper NOT called on an invalid draft
    }

    const body: PayerAccountCreateBody = {
      category: draft.category,
      displayName: draft.displayName.trim(),
      externalRef: draft.externalRef,
    };
    setPending(true);
    try {
      await submitWithKey(body, newIdempotencyKey());
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer title="Create payer account" onClose={onClose}>
      {banner ? (
        <Banner variant={banner.variant} message={banner.message} requestId={banner.requestId} />
      ) : null}

      <form className="surface__form" onSubmit={onSubmit} noValidate>
        <p className="surface__scope-line">
          Creating a payer in tenant <strong>{activeTenant.name}</strong>.
        </p>

        <div className="field">
          <label htmlFor="payer-category">Category</label>
          <select id="payer-category" name="category" className="input" defaultValue="credit_customer">
            <option value="credit_customer">Credit customer</option>
            <option value="corporate">Corporate</option>
            <option value="insurer">Insurer</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="payer-name">Display name</label>
          <input
            id="payer-name"
            name="displayName"
            className="input"
            aria-invalid={nameError ? "true" : undefined}
            aria-describedby={nameError ? "payer-name-error" : undefined}
            autoComplete="off"
          />
          <span id="payer-name-error">
            <InlineError message={nameError} />
          </span>
        </div>

        <div className="field">
          <label htmlFor="payer-external-ref">External reference (optional)</label>
          <input
            id="payer-external-ref"
            name="externalRef"
            className="input"
            placeholder="e.g. insurer code"
            autoComplete="off"
          />
        </div>

        <div className="surface__actions">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? <span className="spinner" aria-hidden="true" /> : null}
            Create payer
          </button>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}

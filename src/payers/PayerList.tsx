import { Banner } from "@/components/Banner";
import { ListState } from "@/components/ListState";
import { useActiveContextValue } from "@/context/ActiveContextProvider";
/**
 * 017 SF1 — Payer-account list. Renders the active tenant's payer accounts as a
 * `.data-table` (displayName, category badge, status badge). Pre-call guard
 * (no active tenant → scope prompt, the list wrapper is never issued). 403/other
 * → banner. Empty → zero-state with the Create primary.
 *
 * `status` is DISPLAY-ONLY (OQ-CON-EDIT deferred to v1.1 — no edit/suspend op).
 * The create drawer is wired separately (PayerCreate); this list exposes the
 * Create affordance and refetches on success.
 */
import { useState } from "react";
import { PayerCreate } from "./PayerCreate";
import { type PayerCategory, usePayerAccounts } from "./usePayerAccounts";
import "../shell/surface.css";

interface PayerRowView {
  payerRef: string;
  displayName: string;
  category: PayerCategory;
  status: "active" | "suspended";
}

function ScopePrompt(): React.JSX.Element {
  return (
    <div className="surface">
      <p className="content__sub">Select a tenant to manage its payer accounts.</p>
    </div>
  );
}

export function PayerList(): React.JSX.Element {
  const { context } = useActiveContextValue();
  const rawTenant = context?.active_tenant ?? null;
  const { rows, isLoading, error, refetch } = usePayerAccounts(rawTenant?.id ?? null, {});
  const [creating, setCreating] = useState(false);

  // Pre-call guard: no active tenant -> scope prompt, list wrapper never issued.
  if (!rawTenant?.id) {
    return <ScopePrompt />;
  }
  const tenantName = rawTenant.name ?? rawTenant.id;
  const payers = rows as unknown as PayerRowView[];

  return (
    <div className="surface">
      <header className="surface__head">
        <div>
          <h1 className="content__title">Payer accounts</h1>
          <p className="content__sub">Credit, corporate &amp; insurer payers for {tenantName}.</p>
        </div>
        {!isLoading && !error && payers.length > 0 ? (
          <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
            Create payer
          </button>
        ) : null}
      </header>

      {error ? (
        <Banner
          variant="danger"
          message={
            error.kind === "forbidden"
              ? "You do not have access to payer accounts for this tenant."
              : "Payer accounts could not be loaded."
          }
          requestId={error.requestId}
        />
      ) : null}

      {isLoading ? <ListState state="loading" label="payer accounts" /> : null}

      {!isLoading && !error && payers.length === 0 ? (
        <ListState
          state="empty"
          emptyMessage="No payer accounts in this tenant yet."
          action={
            <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
              Create payer
            </button>
          }
        />
      ) : null}

      {!isLoading && !error && payers.length > 0 ? (
        <table className="data-table">
          <caption className="data-table__caption">Payer accounts</caption>
          <thead>
            <tr>
              <th scope="col">Payer</th>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {payers.map((row) => (
              <tr key={row.payerRef} className="data-table__row">
                <td>{row.displayName}</td>
                <td>
                  <span className="badge">{row.category}</span>
                </td>
                <td>
                  {row.status === "suspended" ? (
                    <span className="badge badge--suspended">suspended</span>
                  ) : (
                    <span className="badge">active</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {creating ? (
        <PayerCreate
          activeTenant={{ id: rawTenant.id, name: tenantName }}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            refetch();
          }}
        />
      ) : null}
    </div>
  );
}

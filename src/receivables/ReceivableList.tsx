import { Banner } from "@/components/Banner";
import { ListState } from "@/components/ListState";
import { useActiveContextValue } from "@/context/ActiveContextProvider";
/**
 * 018 SF — Receivable list. Table of the active tenant's receivables: payer +
 * sale refs, outstanding balance (exact-decimal Money rendered VERBATIM — never
 * float-coerced), lifecycle-state badge, and the ERP Payment-Entry pointer
 * ("not posted" until the 011-DR-POSTING-R1 gate clears → erpnextPaymentEntryRef
 * is null). Pre-call guard (no tenant → scope prompt, wrapper never issued).
 * 403/other → banner. Read-only here; claim-submit + reconcile drawers wire in
 * 018-D. Mirrors 017's PayerList.
 */
import { useState } from "react";
import type { ReceivableState } from "@/lib/client";
import { ApplyPayment } from "@/settlement-reconciliation/ApplyPayment";
import { ReconcileRemittance } from "./ReconcileRemittance";
import { SubmitClaim } from "./SubmitClaim";
import { useReceivables } from "./useReceivables";
import "../shell/surface.css";

interface ReceivableRowView {
  receivableRef: string;
  saleRef: string;
  payerRef: string;
  outstandingBalance: string;
  state: ReceivableState;
  erpnextPaymentEntryRef: string | null;
  version: number;
}

function ScopePrompt(): React.JSX.Element {
  return (
    <div className="surface">
      <p className="content__sub">Select a tenant to view its receivables.</p>
    </div>
  );
}

export function ReceivableList(): React.JSX.Element {
  const { context } = useActiveContextValue();
  const rawTenant = context?.active_tenant ?? null;
  const { rows, isLoading, error, refetch } = useReceivables(rawTenant?.id ?? null, {});
  const [claiming, setClaiming] = useState<{ payerRef: string; receivableRefs: string[] } | null>(
    null,
  );
  // After a claim is submitted, offer reconcile on its returned claimRef.
  const [reconciling, setReconciling] = useState<string | null>(null);
  // 019 apply-payment (cash application) against a selected receivable.
  const [applying, setApplying] = useState<ReceivableRowView | null>(null);

  if (!rawTenant?.id) {
    return <ScopePrompt />;
  }
  const tenantName = rawTenant.name ?? rawTenant.id;
  const receivables = rows as unknown as ReceivableRowView[];

  // Claimable = open/partially_applied receivables, grouped by payer for the claim.
  const claimable = receivables.filter(
    (r) => r.state === "open" || r.state === "partially_applied",
  );
  function startClaim(payerRef: string): void {
    setClaiming({
      payerRef,
      receivableRefs: claimable.filter((r) => r.payerRef === payerRef).map((r) => r.receivableRef),
    });
  }

  return (
    <div className="surface">
      <header className="surface__head">
        <div>
          <h1 className="content__title">Receivables</h1>
          <p className="content__sub">Money owed against sales for {tenantName}.</p>
        </div>
      </header>

      {error ? (
        <Banner
          variant="danger"
          message={
            error.kind === "forbidden"
              ? "You do not have access to receivables for this tenant."
              : "Receivables could not be loaded."
          }
          requestId={error.requestId}
        />
      ) : null}

      {isLoading ? <ListState state="loading" label="receivables" /> : null}

      {!isLoading && !error && receivables.length === 0 ? (
        <ListState state="empty" emptyMessage="No receivables in this tenant yet." />
      ) : null}

      {!isLoading && !error && receivables.length > 0 ? (
        <table className="data-table">
          <caption className="data-table__caption">Receivables</caption>
          <thead>
            <tr>
              <th scope="col">Receivable</th>
              <th scope="col">Payer</th>
              <th scope="col">Outstanding</th>
              <th scope="col">State</th>
              <th scope="col">ERP posting</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {receivables.map((row) => (
              <tr key={row.receivableRef} className="data-table__row">
                <td>{row.receivableRef}</td>
                <td>{row.payerRef}</td>
                {/* Exact-decimal Money string — rendered verbatim, never coerced. */}
                <td>{row.outstandingBalance}</td>
                <td>
                  <span className="badge">{row.state}</span>
                </td>
                <td>{row.erpnextPaymentEntryRef ?? "not posted"}</td>
                <td>
                  {row.state === "open" || row.state === "partially_applied" ? (
                    <>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setApplying(row)}
                      >
                        Apply payment
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => startClaim(row.payerRef)}
                      >
                        Submit claim
                      </button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {claiming ? (
        <SubmitClaim
          activeTenant={{ id: rawTenant.id, name: tenantName }}
          payerRef={claiming.payerRef}
          receivableRefs={claiming.receivableRefs}
          onClose={() => setClaiming(null)}
          onSubmitted={(claimRef) => {
            setClaiming(null);
            refetch();
            // Offer remittance reconciliation on the freshly-submitted claim.
            if (claimRef) setReconciling(claimRef);
          }}
        />
      ) : null}

      {reconciling ? (
        <ReconcileRemittance
          claimRef={reconciling}
          onClose={() => setReconciling(null)}
          onReconciled={() => refetch()}
        />
      ) : null}

      {applying ? (
        <ApplyPayment
          receivable={{
            receivableRef: applying.receivableRef,
            outstandingBalance: applying.outstandingBalance,
            version: applying.version,
          }}
          // Keep the drawer open on success so it can render the updated receivable
          // (its result view + "Done" button close it); refetch the list underneath.
          onClose={() => setApplying(null)}
          onApplied={() => refetch()}
        />
      ) : null}
    </div>
  );
}

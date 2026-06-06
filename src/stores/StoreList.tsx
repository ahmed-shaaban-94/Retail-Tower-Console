import { Banner } from "@/components/Banner";
import { DataTable } from "@/components/DataTable";
import { ListState } from "@/components/ListState";
import { useActiveContextValue } from "@/context/ActiveContextProvider";
/**
 * SF-S1 — Store roster (T026). Scoped to the ACTIVE TENANT read from RF-1's
 * provider. Pre-gate (OQ-4): with no active tenant we render the scope prompt
 * and never issue `listStores` (the scope-401 is avoided, not a sign-out). With
 * an active tenant, the backend-scoped store set renders as a table (no client
 * filter, OQ-2); zero rows is a successful empty state (OQ-8).
 *
 * A residual `401` (scope went stale after the gate) maps to `scope-required`
 * and renders the scope prompt, still never a sign-out. 403 → persistent banner;
 * 5xx → retryable banner.
 */
import { Link, useNavigate } from "react-router";
import { ScopePrompt } from "./ScopePrompt";
import { useStoreList } from "./useStoreQueries";
import "../shell/surface.css";

type StoreRow = { id: string; code: string; name: string; is_active?: boolean };

const COLUMNS = [
  { key: "name", header: "Name", cell: (s: StoreRow) => s.name },
  { key: "code", header: "Code", cell: (s: StoreRow) => s.code, mono: true },
  {
    key: "state",
    header: "State",
    cell: (s: StoreRow) => (
      <span className={s.is_active === false ? "badge badge--suspended" : "badge badge--active"}>
        {s.is_active === false ? "inactive" : "active"}
      </span>
    ),
  },
];

export function StoreList(): React.JSX.Element {
  const { context } = useActiveContextValue();
  const activeTenant = context?.active_tenant ?? null;
  const { result, isLoading } = useStoreList(activeTenant?.id ?? null);
  const navigate = useNavigate();

  // Pre-gate: no active tenant -> scope prompt, no listStores issued (OQ-4).
  if (!activeTenant) {
    return <ScopePrompt />;
  }
  // Residual scope-401 -> scope prompt, NOT a sign-out (OQ-4).
  if (result?.kind === "error" && result.render.kind === "scope-required") {
    return <ScopePrompt />;
  }

  const rows = result?.kind === "rows" ? result.rows : [];
  const error =
    result?.kind === "error" && result.render.kind === "banner" ? result.render : undefined;

  return (
    <div className="surface">
      <header className="surface__head">
        <div>
          <h1 className="content__title">Stores</h1>
          <p className="content__sub">Stores in {activeTenant.name}.</p>
        </div>
        {!isLoading && !error && rows.length > 0 ? (
          <Link to="/stores/new" className="btn-primary">
            New store
          </Link>
        ) : null}
      </header>

      {error ? (
        <Banner variant="danger" message={error.message} requestId={error.requestId} />
      ) : null}

      {isLoading ? <ListState state="loading" label="stores" /> : null}

      {!isLoading && !error && rows.length === 0 ? (
        <ListState
          state="empty"
          emptyMessage={`No stores in ${activeTenant.name} yet.`}
          action={
            <Link to="/stores/new" className="btn-primary">
              New store
            </Link>
          }
        />
      ) : null}

      {!isLoading && !error && rows.length > 0 ? (
        <DataTable
          caption="Stores"
          columns={COLUMNS}
          rows={rows}
          rowKey={(s) => s.id}
          onRowActivate={(s) => navigate(`/stores/${s.id}`)}
        />
      ) : null}
    </div>
  );
}

import { Banner } from "@/components/Banner";
import { DataTable } from "@/components/DataTable";
import { ListState } from "@/components/ListState";
/**
 * SF-T1 — Tenant roster (T016). The backend-scoped set rendered as a table
 * (DESIGN.md tables-over-cards); no client-side authorization filter (OQ-2).
 * Zero rows is a successful empty state (OQ-8). The "New tenant" primary is
 * always rendered, never role-hidden — a 403 surfaces on attempt (OQ-3).
 *
 * Errors route through RF-1's persistent Banner (reuse, not a new surface):
 * 403 with request_id, 5xx retryable. Built on the shared DataTable / ListState
 * presenters + the tenant query hook.
 */
import { Link, useNavigate } from "react-router";
import { useTenantList } from "./useTenantQueries";
import "../shell/surface.css";

type TenantRow = { id: string; slug: string; name: string };

const COLUMNS = [
  { key: "name", header: "Name", cell: (t: TenantRow) => t.name },
  { key: "slug", header: "Slug", cell: (t: TenantRow) => t.slug, mono: true },
];

export function TenantList(): React.JSX.Element {
  const { result, isLoading, refetch } = useTenantList();
  const navigate = useNavigate();

  const rows = result?.kind === "rows" ? result.rows : [];
  const error = result?.kind === "error" ? result.render : undefined;

  return (
    <div className="surface">
      <header className="surface__head">
        <div>
          <h1 className="content__title">Tenants</h1>
          <p className="content__sub">Every tenant you can administer.</p>
        </div>
        {/* Single-primary rule (DESIGN.md 6): the header primary shows only when
            there is a roster to act on; the empty state carries its own primary. */}
        {!isLoading && !error && rows.length > 0 ? (
          <Link to="/tenants/new" className="btn-primary">
            New tenant
          </Link>
        ) : null}
      </header>

      {error && error.kind === "banner" ? (
        <Banner
          variant="danger"
          message={error.message}
          requestId={error.requestId}
          action={
            error.retryable ? (
              <button type="button" className="btn-ghost" onClick={refetch}>
                Retry
              </button>
            ) : undefined
          }
        />
      ) : null}

      {isLoading ? <ListState state="loading" label="tenants" /> : null}

      {!isLoading && !error && rows.length === 0 ? (
        <ListState
          state="empty"
          emptyMessage="No tenants yet."
          action={
            <Link to="/tenants/new" className="btn-primary">
              New tenant
            </Link>
          }
        />
      ) : null}

      {!isLoading && !error && rows.length > 0 ? (
        <DataTable
          caption="Tenants"
          columns={COLUMNS}
          rows={rows}
          rowKey={(t) => t.id}
          onRowActivate={(t) => navigate(`/tenants/${t.id}`)}
        />
      ) : null}
    </div>
  );
}

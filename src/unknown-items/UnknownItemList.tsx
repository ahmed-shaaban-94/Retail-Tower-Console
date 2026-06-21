import { Banner } from "@/components/Banner";
import { DataTable } from "@/components/DataTable";
import { Icon } from "@/components/Icon";
import { ListState } from "@/components/ListState";
import type { ListUnknownItemsParams, ReviewQueueItem } from "@/lib/unknown-items-queries";
/**
 * SF-4a-1 — Unknown-items review queue (T006). The backend-scoped pending page
 * rendered as a table (tables-over-cards); no client-side authorization filter.
 * Zero rows is a successful empty state. Errors route through the persistent
 * Banner (403 forbidden, retryable 5xx) — never toasts.
 *
 * A local control row drives the 007 list params (source_system filter, sort,
 * group_by). Changing a control re-keys the query (the params are part of the
 * query key), so the queue re-fetches structurally. Row activation opens the
 * inspect drawer (SF-4a-2). No role-hiding of any action (VG-5).
 */
import { useState } from "react";
import { UnknownItemInspectDrawer } from "./UnknownItemInspectDrawer";
import { useUnknownItemList } from "./useUnknownItemQueries";
import { useUnknownItemScope } from "./useUnknownItemScope";
import "./unknown-items.css";

const COLUMNS = [
  {
    key: "identifier",
    header: "Identifier",
    cell: (r: ReviewQueueItem) => r.identifier_value,
    mono: true,
  },
  { key: "type", header: "Type", cell: (r: ReviewQueueItem) => r.identifier_type },
  { key: "store", header: "Store", cell: (r: ReviewQueueItem) => r.store_id, mono: true },
  {
    key: "source",
    header: "Source system",
    cell: (r: ReviewQueueItem) => r.source_system ?? "—",
  },
  { key: "encountered", header: "Encountered", cell: (r: ReviewQueueItem) => r.encountered_at },
];

export function UnknownItemList(): React.JSX.Element {
  const { activeTenantId, activeStoreId } = useUnknownItemScope();
  const [sourceSystem, setSourceSystem] = useState("");
  const [sort, setSort] = useState<NonNullable<ListUnknownItemsParams["sort"]>>("age_desc");
  const [groupBy, setGroupBy] = useState<ListUnknownItemsParams["group_by"] | "">("");
  const [inspectId, setInspectId] = useState<string | null>(null);

  // Compose the 007 list params. `status` defaults to `pending` per the
  // contract; an active store narrows the queue (RLS still applies server-side).
  const params: ListUnknownItemsParams = {
    status: "pending",
    sort,
    ...(activeStoreId ? { store_id: activeStoreId } : {}),
    ...(sourceSystem ? { source_system: sourceSystem } : {}),
    ...(groupBy ? { group_by: groupBy } : {}),
  };

  const { result, isLoading, refetch } = useUnknownItemList(activeTenantId, params);
  const rows = result?.kind === "page" ? result.items : [];
  const error = result?.kind === "error" ? result.render : undefined;

  return (
    <div className="surface">
      <header className="surface__head">
        <div>
          <h1 className="content__title">Unknown items</h1>
          <p className="content__sub">POS item references awaiting review in this tenant.</p>
        </div>
      </header>

      <fieldset className="unknown-item-controls">
        <legend className="unknown-item-controls__legend">
          <Icon name="search" size={14} className="unknown-item-controls__icon" />
          Queue filters
        </legend>
        <label className="unknown-item-controls__field">
          <span>Source system</span>
          <input
            type="text"
            value={sourceSystem}
            onChange={(e) => setSourceSystem(e.target.value)}
            placeholder="All sources"
          />
        </label>
        <label className="unknown-item-controls__field">
          <span>Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as NonNullable<ListUnknownItemsParams["sort"]>)}
          >
            <option value="age_desc">Newest first</option>
            <option value="age_asc">Oldest first</option>
            <option value="store">By store</option>
          </select>
        </label>
        <label className="unknown-item-controls__field">
          <span>Group by</span>
          <select
            value={groupBy}
            onChange={(e) =>
              setGroupBy(e.target.value as NonNullable<ListUnknownItemsParams["group_by"]> | "")
            }
          >
            <option value="">None</option>
            <option value="store">Store</option>
            <option value="source_system">Source system</option>
          </select>
        </label>
      </fieldset>

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
      {error && error.kind === "generic" ? (
        <Banner variant="danger" message={error.message} requestId={error.requestId} />
      ) : null}

      {isLoading ? <ListState state="loading" label="unknown items" /> : null}

      {!isLoading && !error && rows.length === 0 ? (
        <ListState state="empty" emptyMessage="No unknown items to review." />
      ) : null}

      {!isLoading && !error && rows.length > 0 ? (
        <DataTable
          caption="Unknown items"
          columns={COLUMNS}
          rows={rows}
          rowKey={(r) => r.id}
          onRowActivate={(r) => setInspectId(r.id)}
        />
      ) : null}

      {inspectId ? (
        <UnknownItemInspectDrawer
          id={inspectId}
          activeTenantId={activeTenantId}
          onClose={() => setInspectId(null)}
          onDismissed={() => {
            setInspectId(null);
            refetch();
          }}
        />
      ) : null}
    </div>
  );
}

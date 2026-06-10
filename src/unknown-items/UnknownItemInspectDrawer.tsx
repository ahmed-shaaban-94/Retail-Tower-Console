import { Banner } from "@/components/Banner";
import { Drawer } from "@/components/Drawer";
import { ListState } from "@/components/ListState";
import type { ReviewQueueItem } from "@/lib/unknown-items-queries";
/**
 * SF-4a-2 — inspect drawer (T007). Reuses the shared Drawer (right-side panel,
 * focus-trapped, Escape closes) to render the `ReviewQueueItem` projection
 * read-only. It renders ONLY ReviewQueueItem fields — it MUST NOT reference
 * `sale_context` (that field lives on `UnknownItem`, not the review projection;
 * FR-007 / FR-4a-004).
 *
 * For a `pending` item it offers a Dismiss entry, which swaps the body to the
 * dismiss confirm. The dismiss action and its inline error live in
 * UnknownItemDismiss; this surface just owns the panel + the read-only detail.
 */
import { useState } from "react";
import { UnknownItemDismiss } from "./UnknownItemDismiss";
import { useUnknownItemInspect } from "./useUnknownItemQueries";
import "./unknown-items.css";

export interface UnknownItemInspectDrawerProps {
  id: string;
  activeTenantId: string | null;
  onClose: () => void;
  /** Called after a successful dismiss so the parent can close + refresh. */
  onDismissed: () => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  return (
    <div className="unknown-item-detail__field">
      <dt className="unknown-item-detail__label">{label}</dt>
      <dd className="unknown-item-detail__value">{value ?? "—"}</dd>
    </div>
  );
}

function DetailBody({ item }: { item: ReviewQueueItem }): React.JSX.Element {
  return (
    <dl className="unknown-item-detail">
      <Field label="Identifier" value={item.identifier_value} />
      <Field label="Identifier type" value={item.identifier_type} />
      <Field label="Source system" value={item.source_system} />
      <Field label="Store" value={item.store_id} />
      <Field label="Status" value={item.resolution_status} />
      <Field label="Resolution action" value={item.resolution_action} />
      <Field label="Encountered at" value={item.encountered_at} />
      <Field label="Resolved at" value={item.resolved_at} />
      <Field label="Resolved by" value={item.resolved_by} />
    </dl>
  );
}

export function UnknownItemInspectDrawer({
  id,
  activeTenantId,
  onClose,
  onDismissed,
}: UnknownItemInspectDrawerProps): React.JSX.Element {
  const { result, isLoading } = useUnknownItemInspect(id);
  const [confirming, setConfirming] = useState(false);

  const item = result?.kind === "item" ? result.item : undefined;
  const error = result?.kind === "error" ? result.render : undefined;
  const isPending = item?.resolution_status === "pending";

  return (
    <Drawer title="Unknown item" onClose={onClose}>
      {isLoading ? <ListState state="loading" label="item" /> : null}

      {error && error.kind === "not-found" ? (
        <Banner variant="info" message={error.message} />
      ) : null}
      {error && (error.kind === "banner" || error.kind === "generic") ? (
        <Banner variant="danger" message={error.message} requestId={error.requestId} />
      ) : null}

      {item ? (
        <>
          <DetailBody item={item} />
          {isPending && !confirming ? (
            <div className="unknown-item-detail__actions">
              <button type="button" className="btn-destructive" onClick={() => setConfirming(true)}>
                Dismiss
              </button>
            </div>
          ) : null}
          {isPending && confirming ? (
            <UnknownItemDismiss
              item={item}
              activeTenantId={activeTenantId}
              onDismissed={onDismissed}
              onCancel={() => setConfirming(false)}
            />
          ) : null}
        </>
      ) : null}
    </Drawer>
  );
}

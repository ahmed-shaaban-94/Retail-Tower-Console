/**
 * SF-6-2 — Row inspect drawer (T026, OQ-2). Reuses the shared focus-trapped
 * `Drawer` (so it inherits Escape, focus-trap, focus-return, and the justified
 * a11y biome-ignores). Renders the ALREADY-FETCHED row — **no** backend call,
 * no single-event read op. Read-only: NO action buttons (no acknowledge /
 * annotate / export — FR-006-009). `request_id` has a copy-to-clipboard control;
 * `metadata` renders as a readable mono key/value block.
 */
import { Drawer } from "@/components/Drawer";
import type { AuditRow } from "./useAuditSearch";
import "./audit.css";

export interface AuditInspectDrawerProps {
  row: AuditRow;
  onClose: () => void;
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="field-row">
      <dt className="field-row__label">{label}</dt>
      <dd className={mono ? "field-row__value field-row__value--mono" : "field-row__value"}>
        {value}
      </dd>
    </div>
  );
}

export function AuditInspectDrawer({ row, onClose }: AuditInspectDrawerProps): React.JSX.Element {
  function copyRequestId(): void {
    if (row.request_id) void navigator.clipboard?.writeText(row.request_id);
  }

  const metadataEntries = Object.entries(row.metadata ?? {});

  return (
    <Drawer title="Audit event" onClose={onClose}>
      <dl className="surface__detail">
        <Field label="Time" value={row.occurred_at} mono />
        <Field label="Action" value={row.action} mono />
        <Field label="Actor" value={row.actor_label ?? row.actor_user_id ?? "—"} />
        <Field
          label="Target"
          value={row.target_type ? `${row.target_type} · ${row.target_id ?? "—"}` : "—"}
          mono
        />
        <Field label="Store" value={row.store_id ?? "—"} mono />
        <Field
          label="Request ID"
          value={
            <span className="audit-inspect__req">
              <span className="field-row__value--mono">{row.request_id ?? "—"}</span>
              {row.request_id ? (
                <button type="button" className="btn-ghost" onClick={copyRequestId}>
                  Copy
                </button>
              ) : null}
            </span>
          }
        />
      </dl>

      <section className="audit-inspect__metadata" aria-label="Metadata">
        <h3 className="drawer__danger-title">Metadata</h3>
        {metadataEntries.length === 0 ? (
          <p className="audit-table__muted">No metadata.</p>
        ) : (
          <dl className="audit-inspect__kv">
            {metadataEntries.map(([k, v]) => (
              <div key={k} className="audit-inspect__kv-row">
                <dt className="field-row__value--mono">{k}</dt>
                <dd className="field-row__value--mono">{JSON.stringify(v)}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </Drawer>
  );
}

/**
 * Shared destructive-confirm affordance (T008). An inline confirm step (not a
 * reflexive modal — modals are a last resort, DESIGN.md) that names the exact
 * resource before a soft-delete. Single destructive primary + a cancel
 * (single-primary rule). Used by SF-T3 / SF-S3 (design-brief §7).
 */
import "./confirm-delete.css";

export interface ConfirmDeleteProps {
  /** The exact resource the destructive action names. */
  resourceName: string;
  /** Destructive primary label, e.g. "Soft-delete". */
  confirmLabel: string;
  /** Disable the confirm while the delete is in flight (prevents double-fire). */
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDelete({
  resourceName,
  confirmLabel,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteProps): React.JSX.Element {
  return (
    <section className="confirm-delete" aria-label={`Confirm: ${confirmLabel}`}>
      <p className="confirm-delete__msg">
        {confirmLabel} <strong>{resourceName}</strong>? It can be restored by an administrator.
      </p>
      <div className="confirm-delete__actions">
        <button type="button" className="btn-destructive" onClick={onConfirm} disabled={pending}>
          {pending ? <span className="spinner" aria-hidden="true" /> : null}
          {confirmLabel}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={pending}>
          Cancel
        </button>
      </div>
    </section>
  );
}

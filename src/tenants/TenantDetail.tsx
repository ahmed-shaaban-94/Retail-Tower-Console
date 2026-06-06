import { Banner } from "@/components/Banner";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { ListState } from "@/components/ListState";
import { type Rf2ErrorRender, mapRf2Error } from "@/lib/rf2-queries";
/**
 * SF-T2 — Tenant detail (T017). Read-first: labeled field rows, a display-only
 * status badge, and a quiet action cluster (edit + soft-delete) rendered for
 * ALL actors — never pre-hidden by role; a 403 surfaces on attempt (OQ-3).
 * 404 renders uniformly regardless of cause (FR-004-008).
 *
 * Soft-delete (T019) is behind the shared inline ConfirmDelete that names the
 * resource; on success it re-fetches the list and routes back (S8).
 */
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useTenantDelete, useTenantDetail } from "./useTenantQueries";
import "../shell/surface.css";

const STATUS_CLASS: Record<string, string> = {
  active: "badge badge--active",
  suspended: "badge badge--suspended",
  pending: "badge badge--pending",
};

export function TenantDetail(): React.JSX.Element {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { result, isLoading } = useTenantDetail(tenantId);
  const del = useTenantDelete();
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<Rf2ErrorRender | undefined>();

  if (isLoading) {
    return (
      <div className="surface">
        <ListState state="loading" label="tenant" />
      </div>
    );
  }

  if (result?.kind === "error") {
    const r = result.render;
    return (
      <div className="surface">
        <Banner
          variant="danger"
          message={r.kind === "not-found" ? r.message : r.message}
          requestId={r.kind === "banner" ? r.requestId : undefined}
        />
        <Link to="/tenants" className="surface__back">
          ← Back to tenants
        </Link>
      </div>
    );
  }

  const tenant = result?.kind === "tenant" ? result.tenant : undefined;
  if (!tenant) {
    return <div className="surface" />;
  }
  const tenantId2 = tenant.id;

  async function onConfirmDelete(): Promise<void> {
    setDeleteError(undefined);
    const res = await del.mutateAsync(tenantId2);
    if (res.status >= 400) {
      setDeleteError(mapRf2Error({ ...res, context: "tenant" }));
      setConfirming(false);
      return;
    }
    navigate("/tenants");
  }

  return (
    <div className="surface">
      <Link to="/tenants" className="surface__back">
        ← Back to tenants
      </Link>
      <header className="surface__head">
        <h1 className="content__title">{tenant.name}</h1>
      </header>

      {deleteError && deleteError.kind === "banner" ? (
        <Banner variant="danger" message={deleteError.message} requestId={deleteError.requestId} />
      ) : null}

      <dl className="surface__detail">
        <div className="field-row">
          <dt className="field-row__label">Slug</dt>
          <dd className="field-row__value field-row__value--mono">{tenant.slug}</dd>
        </div>
        <div className="field-row">
          <dt className="field-row__label">Status</dt>
          <dd className="field-row__value">
            {tenant.status ? (
              <span className={STATUS_CLASS[tenant.status] ?? "badge"}>{tenant.status}</span>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="field-row">
          <dt className="field-row__label">Tenant ID</dt>
          <dd className="field-row__value field-row__value--mono">{tenant.id}</dd>
        </div>
      </dl>

      {confirming ? (
        <ConfirmDelete
          resourceName={tenant.name}
          confirmLabel="Soft-delete"
          pending={del.isPending}
          onConfirm={onConfirmDelete}
          onCancel={() => setConfirming(false)}
        />
      ) : (
        <div className="surface__actions">
          <Link to={`/tenants/${tenant.id}/edit`} className="btn-secondary">
            Edit
          </Link>
          <button type="button" className="btn-destructive" onClick={() => setConfirming(true)}>
            Soft-delete
          </button>
        </div>
      )}
    </div>
  );
}

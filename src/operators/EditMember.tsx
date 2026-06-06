import { Banner } from "@/components/Banner";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { Drawer } from "@/components/Drawer";
/**
 * SF5-3 — Edit / revoke member drawer (T022/T023). Pre-filled role + store-access
 * (uncontrolled native form); one `.btn-primary` "Save changes" via
 * `updateMembership`. A visually-isolated revoke section (top divider, not a
 * nested card — rule 5) with a `.btn-destructive` + confirm step via
 * `revokeMembership`. Both ops document only 200/204 + 404 → uniform banner.
 * On success: close, refresh the list (S4/S5).
 */
import { useState } from "react";
import type { MemberRow } from "./useMembers";
import { useRevokeMembership, useUpdateMembership } from "./useMembers";

export interface EditMemberProps {
  activeTenantId: string;
  member: MemberRow;
  onClose: () => void;
  onChanged: () => void;
}

const NOT_FOUND_MSG = "This member could not be found.";

export function EditMember({
  activeTenantId,
  member,
  onClose,
  onChanged,
}: EditMemberProps): React.JSX.Element {
  const update = useUpdateMembership(activeTenantId);
  const revoke = useRevokeMembership(activeTenantId);
  const [banner, setBanner] = useState<string | undefined>();
  const [confirming, setConfirming] = useState(false);
  const [specific, setSpecific] = useState(member.storeAccessKind === "specific");

  const pending = update.isPending || revoke.isPending;

  async function onSave(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setBanner(undefined);
    const form = new FormData(e.currentTarget);
    const res = await update.mutateAsync({
      membershipId: member.membershipId,
      body: {
        role_code: String(form.get("role_code") ?? ""),
        store_access_kind: specific ? "specific" : "all",
        store_ids: specific
          ? String(form.get("store_ids") ?? "")
              .split(/[\s,]+/)
              .filter(Boolean)
          : undefined,
      },
    });
    if (res.status >= 400) {
      setBanner(NOT_FOUND_MSG);
      return;
    }
    onChanged();
  }

  async function onRevoke(): Promise<void> {
    setBanner(undefined);
    const res = await revoke.mutateAsync(member.membershipId);
    if (res.status >= 400) {
      setBanner(NOT_FOUND_MSG);
      setConfirming(false);
      return;
    }
    onChanged();
  }

  const memberName = member.displayName ?? member.email;

  return (
    <Drawer title="Edit member" onClose={onClose}>
      {banner ? <Banner variant="danger" message={banner} /> : null}

      <form className="surface__form" onSubmit={onSave} noValidate>
        <p className="surface__scope-line">
          Editing <strong>{memberName}</strong>.
        </p>

        <div className="field">
          <label htmlFor="edit-role">Role</label>
          <input
            id="edit-role"
            name="role_code"
            className="input"
            defaultValue={member.roleCode}
            autoComplete="off"
          />
        </div>

        <div className="field">
          <span className="field-row__label">Store access</span>
          <div className="drawer__radio-group">
            <label className="drawer__radio">
              <input
                type="radio"
                name="store_access"
                checked={!specific}
                onChange={() => setSpecific(false)}
              />
              All stores
            </label>
            <label className="drawer__radio">
              <input
                type="radio"
                name="store_access"
                checked={specific}
                onChange={() => setSpecific(true)}
              />
              Specific stores
            </label>
          </div>
          {specific ? (
            <input
              name="store_ids"
              className="input"
              defaultValue={member.accessibleStoreIds.join(", ")}
              placeholder="Store ids, comma-separated"
              autoComplete="off"
            />
          ) : null}
        </div>

        <div className="surface__actions">
          <button type="submit" className="btn-primary" disabled={pending}>
            {update.isPending ? <span className="spinner" aria-hidden="true" /> : null}
            Save changes
          </button>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
            Cancel
          </button>
        </div>
      </form>

      <section className="drawer__danger-section" aria-label="Revoke membership">
        <h3 className="drawer__danger-title">Revoke membership</h3>
        {confirming ? (
          <ConfirmDelete
            resourceName={`${memberName}'s membership`}
            confirmLabel="Revoke"
            pending={revoke.isPending}
            onConfirm={onRevoke}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <button
            type="button"
            className="btn-destructive"
            onClick={() => setConfirming(true)}
            disabled={pending}
          >
            Revoke membership
          </button>
        )}
      </section>
    </Drawer>
  );
}

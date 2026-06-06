import { Banner } from "@/components/Banner";
import { ListState } from "@/components/ListState";
import { useActiveContextValue } from "@/context/ActiveContextProvider";
/**
 * SF5-1 — Member list (T012/T013). The membership graph for the active tenant
 * rendered as a `.data-table` (DESIGN.md rule 7): Member (name over mono email),
 * Role badge, Store access (All stores / N stores — ids/count not names, OQ-3),
 * State (Revoked badge when revoked_at). Page header + right-aligned "Invite
 * member" primary.
 *
 * Pre-call guard (FR-005-007): no active tenant → scope prompt, `listMembers`
 * never called (it has no precondition-401). `listMembers` documents only 404 →
 * uniform banner with request_id. The invite/edit drawers mount from here.
 */
import { useState } from "react";
import { EditMember } from "./EditMember";
import { InviteMember } from "./InviteMember";
import { OperatorScopePrompt } from "./OperatorScopePrompt";
import { type MemberRow, useMembers } from "./useMembers";
import "../shell/surface.css";

function storeAccessLabel(row: MemberRow): string {
  if (row.storeAccessKind === "all") return "All stores";
  const n = row.accessibleStoreIds.length;
  return `${n} ${n === 1 ? "store" : "stores"}`;
}

export function MemberList(): React.JSX.Element {
  const { context } = useActiveContextValue();
  const rawTenant = context?.active_tenant ?? null;
  const { result, isLoading, refetch } = useMembers(rawTenant?.id ?? null);
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState<MemberRow | null>(null);

  // Pre-call guard: no active tenant -> scope prompt, listMembers never issued.
  if (!rawTenant?.id) {
    return <OperatorScopePrompt />;
  }
  const activeTenant = { id: rawTenant.id, name: rawTenant.name ?? rawTenant.id };

  const rows = result?.kind === "rows" ? result.rows : [];
  const notFound = result?.kind === "not-found" ? { requestId: result.requestId } : undefined;

  return (
    <div className="surface">
      <header className="surface__head">
        <div>
          <h1 className="content__title">Operators</h1>
          <p className="content__sub">Members of {activeTenant.name}.</p>
        </div>
        {/* Single-primary (DESIGN.md 6): header invite shows only when there are
            rows; the empty state carries its own invite primary. */}
        {!isLoading && !notFound && rows.length > 0 ? (
          <button type="button" className="btn-primary" onClick={() => setInviting(true)}>
            Invite member
          </button>
        ) : null}
      </header>

      {notFound ? (
        <Banner
          variant="danger"
          message="Members are not available for this tenant."
          requestId={notFound.requestId}
        />
      ) : null}

      {isLoading ? <ListState state="loading" label="members" /> : null}

      {!isLoading && !notFound && rows.length === 0 ? (
        <ListState
          state="empty"
          emptyMessage="No other members in this tenant yet."
          action={
            <button type="button" className="btn-primary" onClick={() => setInviting(true)}>
              Invite member
            </button>
          }
        />
      ) : null}

      {!isLoading && !notFound && rows.length > 0 ? (
        <table className="data-table">
          <caption className="data-table__caption">Operators</caption>
          <thead>
            <tr>
              <th scope="col">Member</th>
              <th scope="col">Role</th>
              <th scope="col">Store access</th>
              <th scope="col">State</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.membershipId}
                className="data-table__row"
                tabIndex={0}
                onClick={() => setEditing(row)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEditing(row);
                  }
                }}
              >
                <td>
                  <span className="member-identity">
                    <span className="member-identity__name">{row.displayName ?? row.email}</span>
                    {row.displayName ? (
                      <span className="member-identity__email">{row.email}</span>
                    ) : null}
                  </span>
                </td>
                <td>
                  <span className="badge">{row.roleCode}</span>
                </td>
                <td>{storeAccessLabel(row)}</td>
                <td>
                  {row.revoked ? <span className="badge badge--suspended">Revoked</span> : "Active"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {inviting ? (
        <InviteMember
          activeTenant={activeTenant}
          onClose={() => setInviting(false)}
          onInvited={() => {
            setInviting(false);
            refetch();
          }}
        />
      ) : null}

      {editing ? (
        <EditMember
          activeTenantId={activeTenant.id}
          member={editing}
          onClose={() => setEditing(null)}
          onChanged={() => {
            setEditing(null);
            refetch();
          }}
        />
      ) : null}
    </div>
  );
}

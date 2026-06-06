import {
  type AcceptInvitationBody,
  type MembershipUpdateBody,
  acceptInvitation,
  listMembers,
  revokeMembership,
  updateMembership,
} from "@/lib/client";
/**
 * Member-graph query + mutations (T006). TanStack Query bindings over the RF-5
 * wrappers in `src/lib/client.ts`, reusing RF-1's query client. `listMembers` is
 * keyed by the active tenant id (re-scopes on tenant switch, like RF-2's stores);
 * the three mutations invalidate + re-fetch it (no optimistic mutation,
 * FR-005-005), mirroring RF-1's invalidate-after-mutation.
 *
 * RF-5 has its OWN error mapping (not RF-2's `mapRf2Error`): the RF-5 statuses
 * differ — `listMembers` documents only 404; `createInvitation` adds 403, a
 * precondition-401, two 409 causes, and 425 (handled in inviteIdempotency +
 * useInviteAuth, not here).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface MemberRow {
  membershipId: string;
  userId: string;
  email: string;
  displayName: string | null;
  roleCode: string;
  storeAccessKind: "all" | "specific";
  accessibleStoreIds: string[];
  revoked: boolean;
}

type RawMember = {
  membership_id: string;
  user: { id: string; email: string; display_name: string | null };
  role_code: string;
  store_access_kind: "all" | "specific";
  accessible_store_ids?: string[];
  revoked_at: string | null;
};

/** Reduce the contract's MembershipDetail[] to the row shape the table renders. */
export function toMemberRows(raw: RawMember[]): MemberRow[] {
  return raw.map((m) => ({
    membershipId: m.membership_id,
    userId: m.user.id,
    email: m.user.email,
    displayName: m.user.display_name,
    roleCode: m.role_code,
    storeAccessKind: m.store_access_kind,
    accessibleStoreIds: m.accessible_store_ids ?? [],
    revoked: m.revoked_at != null,
  }));
}

/** RF-5 member-list render decision. listMembers documents only 200 + 404. */
export type MemberListResult =
  | { kind: "rows"; rows: MemberRow[] }
  | { kind: "not-found"; requestId?: string };

const memberKeys = {
  list: (tenantId: string | null) => ["rf5", "members", tenantId] as const,
};

/** SF5-1 — the membership graph for the active tenant. */
export function useMembers(activeTenantId: string | null) {
  const query = useQuery<MemberListResult>({
    queryKey: memberKeys.list(activeTenantId),
    enabled: Boolean(activeTenantId),
    queryFn: async () => {
      const res = await listMembers(activeTenantId as string);
      if (res.status >= 400) {
        const err = res.error as { error?: { request_id?: string } } | undefined;
        return { kind: "not-found", requestId: err?.error?.request_id };
      }
      return { kind: "rows", rows: toMemberRows((res.data as RawMember[] | undefined) ?? []) };
    },
  });
  return { result: query.data, isLoading: query.isLoading, refetch: () => void query.refetch() };
}

/** Invalidate the active tenant's member list after a mutation (re-fetch). */
export function useMemberInvalidate(activeTenantId: string | null) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: memberKeys.list(activeTenantId) });
}

/** SF5-3 — edit a member's role / store-access. 200 → re-fetch; 404 uniform. */
export function useUpdateMembership(activeTenantId: string | null) {
  const invalidate = useMemberInvalidate(activeTenantId);
  return useMutation({
    mutationFn: ({ membershipId, body }: { membershipId: string; body: MembershipUpdateBody }) =>
      updateMembership(membershipId, body),
    onSuccess: () => void invalidate(),
  });
}

/** SF5-3 — revoke (soft-delete). 204 → re-fetch; 404 uniform. */
export function useRevokeMembership(activeTenantId: string | null) {
  const invalidate = useMemberInvalidate(activeTenantId);
  return useMutation({
    mutationFn: (membershipId: string) => revokeMembership(membershipId),
    onSuccess: () => void invalidate(),
  });
}

/** SF5-4 — public accept. 200 establishes a session; the caller re-fetches context. */
export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (body: AcceptInvitationBody) => acceptInvitation(body),
  });
}

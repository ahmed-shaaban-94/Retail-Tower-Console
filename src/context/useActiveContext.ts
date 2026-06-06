import {
  clearActiveStore,
  getActiveContext,
  switchActiveStore,
  switchActiveTenant,
} from "@/lib/client";
import { queryKeys } from "@/lib/query";
/**
 * Active-context hook (SF-3, T014-T016). The read-only projection of the
 * server-resolved context (FR-003-005). `getActiveContext` is the source of
 * truth; the three mutators change it backend-side, then we invalidate the
 * context query so it re-fetches. No optimistic local mutation.
 *
 * A tenant switch clears the store backend-side (FR-003-006); because we
 * re-fetch rather than patch, the dropped store is reflected automatically by
 * the next `getActiveContext` payload.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ActiveContextValue {
  context: NonNullable<Awaited<ReturnType<typeof getActiveContext>>["data"]> | null | undefined;
  isLoading: boolean;
  /** memberships.length === 0 → no-access (S7); used by SF-1/SF-2 branching. */
  membershipCount: number;
  switchTenant: (tenantId: string) => Promise<void>;
  switchStore: (storeId: string) => Promise<void>;
  clearStore: () => Promise<void>;
}

export function useActiveContext(): ActiveContextValue {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.activeContext,
    queryFn: async () => {
      const res = await getActiveContext();
      return res.data ?? null;
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.activeContext });

  const tenant = useMutation({
    mutationFn: (tenantId: string) => switchActiveTenant(tenantId),
    onSuccess: invalidate,
  });
  const store = useMutation({
    mutationFn: (storeId: string) => switchActiveStore(storeId),
    onSuccess: invalidate,
  });
  const clear = useMutation({
    mutationFn: () => clearActiveStore(),
    onSuccess: invalidate,
  });

  return {
    context: query.data,
    isLoading: query.isLoading,
    membershipCount: query.data?.memberships?.length ?? 0,
    switchTenant: async (tenantId) => {
      await tenant.mutateAsync(tenantId);
    },
    switchStore: async (storeId) => {
      await store.mutateAsync(storeId);
    },
    clearStore: async () => {
      await clear.mutateAsync();
    },
  };
}

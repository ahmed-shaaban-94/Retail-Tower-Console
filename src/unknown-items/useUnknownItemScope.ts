/**
 * RF-4a scope binding (T005, R4a-6). RF-4a holds NO authoritative scope: the
 * active tenant (and optional active store) are RF-1's, read from
 * `ActiveContextProvider`. Re-scoping the queue on a tenant/store switch is
 * structural, not imperative — the list query key is scoped by the active tenant
 * id (`unknownItemsQueryKeys.list(tenantId, params)`), so when RF-1's switch
 * changes the active tenant the key changes, TanStack Query fetches the new
 * tenant's queue, and the previous scope's view is dropped. No manual
 * invalidation, no scope copy.
 *
 * Mirrors `src/stores/useStoreScope.ts`. This is the single read point so the
 * binding is explicit and testable, and RF-4a never calls a context operation
 * (VG-4).
 */
import { useActiveContextValue } from "@/context/ActiveContextProvider";

export interface UnknownItemScope {
  /** The active tenant id, or null when no tenant is active (pre-gate). */
  activeTenantId: string | null;
  /** The active tenant name for the read-only scope line. */
  activeTenantName: string | null;
  /** The active store id, or null when the queue is tenant-wide. */
  activeStoreId: string | null;
}

export function useUnknownItemScope(): UnknownItemScope {
  const { context } = useActiveContextValue();
  const tenant = context?.active_tenant ?? null;
  const store = context?.active_store ?? null;
  return {
    activeTenantId: tenant?.id ?? null,
    activeTenantName: tenant?.name ?? null,
    activeStoreId: store?.id ?? null,
  };
}

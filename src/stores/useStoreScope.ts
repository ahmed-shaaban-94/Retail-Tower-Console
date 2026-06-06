/**
 * Store scope binding (T030, S7). RF-2 holds NO authoritative scope (OQ-5): the
 * active tenant is RF-1's, read from `ActiveContextProvider`. Re-scoping the
 * store list on a tenant switch is achieved structurally, not imperatively — the
 * store query keys are scoped by the active tenant id (`rf2QueryKeys.stores(id)`
 * / `store(id)`), so when RF-1's switch changes the active tenant the keys
 * change, TanStack Query fetches the new tenant's stores, and the previous
 * tenant's store-scoped views are dropped. No manual invalidation, no scope copy.
 *
 * This hook exposes the active tenant id the store surfaces pass to their query
 * hooks, the single read point so the binding is explicit and testable.
 */
import { useActiveContextValue } from "@/context/ActiveContextProvider";

export interface StoreScope {
  /** The active tenant id, or null when no tenant is active (pre-gate, OQ-4). */
  activeTenantId: string | null;
  /** The active tenant name for the read-only scope line (FR-004-005). */
  activeTenantName: string | null;
}

export function useStoreScope(): StoreScope {
  const { context } = useActiveContextValue();
  const tenant = context?.active_tenant ?? null;
  return {
    activeTenantId: tenant?.id ?? null,
    activeTenantName: tenant?.name ?? null,
  };
}

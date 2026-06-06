import {
  type Rf2ErrorRender,
  type StoreCreateBody,
  type StoreUpdateBody,
  createStore,
  listStores,
  mapRf2Error,
  readStore,
  rf2QueryKeys,
  softDeleteStore,
  updateStore,
} from "@/lib/rf2-queries";
/**
 * Store query/mutation hooks (Phase 4). Mirrors the tenant hooks but scopes the
 * cache by the active tenant id (S7 re-scope; OQ-5 — RF-2 holds no authoritative
 * scope, the id comes from RF-1's provider). The store list/detail queries are
 * gated by the caller on an active tenant being present (OQ-4): if there is no
 * active tenant the component routes to the scope chooser and does NOT enable
 * the query, so the scope-`401` is avoided rather than interpreted as a sign-out.
 *
 * A residual `401` (scope went stale between the gate and the call) maps to a
 * `scope-required` render, NOT a session-expiry — RF-2's calls do not run through
 * RF-1's per-call context interceptor (OQ-4/OQ-10), so no refresh/sign-out fires.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Store = {
  id: string;
  tenant_id?: string;
  code: string;
  name: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type StoreListResult =
  | { kind: "rows"; rows: Store[] }
  | { kind: "error"; render: Rf2ErrorRender };

export type StoreDetailResult =
  | { kind: "store"; store: Store }
  | { kind: "error"; render: Rf2ErrorRender };

/**
 * SF-S1 — the active tenant's stores. `activeTenantId` gates the query: when it
 * is null the caller pre-routes to the scope chooser and the query stays
 * disabled (no `listStores`, no scope-401). The key is scoped by tenant id so a
 * tenant switch re-scopes the cache (S7).
 */
export function useStoreList(activeTenantId: string | null) {
  const query = useQuery<StoreListResult>({
    queryKey: rf2QueryKeys.stores(activeTenantId),
    enabled: Boolean(activeTenantId),
    queryFn: async () => {
      const res = await listStores();
      if (res.status >= 400) {
        return { kind: "error", render: mapRf2Error({ ...res, context: "store" }) };
      }
      return { kind: "rows", rows: (res.data as Store[] | undefined) ?? [] };
    },
  });
  return { result: query.data, isLoading: query.isLoading };
}

/** SF-S2 — one store by id. 404 renders uniformly (FR-004-008). */
export function useStoreDetail(storeId: string | undefined) {
  const query = useQuery<StoreDetailResult>({
    queryKey: storeId ? rf2QueryKeys.store(storeId) : ["rf2", "store", "none"],
    enabled: Boolean(storeId),
    queryFn: async () => {
      const res = await readStore(storeId as string);
      if (res.status >= 400) {
        return { kind: "error", render: mapRf2Error({ ...res, context: "store" }) };
      }
      return { kind: "store", store: res.data as Store };
    },
  });
  return { result: query.data, isLoading: query.isLoading };
}

/** SF-S3 — create/update. Invalidates the active tenant's store list + detail. */
export function useStoreMutations(activeTenantId: string | null, storeId?: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: rf2QueryKeys.stores(activeTenantId) });
    if (storeId) void qc.invalidateQueries({ queryKey: rf2QueryKeys.store(storeId) });
  };

  const create = useMutation({
    mutationFn: (body: StoreCreateBody) => createStore(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: (body: StoreUpdateBody) => updateStore(storeId as string, body),
    onSuccess: invalidate,
  });
  return { create, update };
}

/** SF-S2/S3 — soft-delete behind a confirm; re-fetches the store list (S8). */
export function useStoreDelete(activeTenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (storeId: string) => softDeleteStore(storeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: rf2QueryKeys.stores(activeTenantId) }),
  });
}

import {
  type Rf2ErrorRender,
  type TenantCreateBody,
  type TenantUpdateBody,
  createTenant,
  listTenants,
  mapRf2Error,
  readTenant,
  rf2QueryKeys,
  softDeleteTenant,
  updateTenant,
} from "@/lib/rf2-queries";
/**
 * Tenant query/mutation hooks (Phase 3). Thin TanStack Query bindings over the
 * RF-2 wrappers in `src/lib/rf2-queries.ts`, reusing RF-1's query client. Each
 * surface (list/detail/form/delete) consumes one of these so the data wiring
 * lives in one place and the components stay presentational.
 *
 * The query RESULT carries the typed-error render decision (mapRf2Error) when a
 * call fails, so components branch on data, not on thrown errors — mirroring
 * RF-1's session-lost-in-the-result pattern (useActiveContext).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type TenantSummary = { id: string; slug: string; name: string };
type Tenant = TenantSummary & {
  status?: "active" | "suspended" | "pending";
  created_at?: string;
  updated_at?: string;
};

export type TenantListResult =
  | { kind: "rows"; rows: TenantSummary[] }
  | { kind: "error"; render: Rf2ErrorRender };

export type TenantDetailResult =
  | { kind: "tenant"; tenant: Tenant }
  | { kind: "error"; render: Rf2ErrorRender };

/** SF-T1 — the backend-scoped tenant roster. No client-side filter (OQ-2). */
export function useTenantList() {
  const query = useQuery<TenantListResult>({
    queryKey: rf2QueryKeys.tenants,
    queryFn: async () => {
      const res = await listTenants();
      if (res.status >= 400) {
        return { kind: "error", render: mapRf2Error({ ...res, context: "tenant" }) };
      }
      return { kind: "rows", rows: (res.data as TenantSummary[] | undefined) ?? [] };
    },
  });
  return { result: query.data, isLoading: query.isLoading, refetch: () => void query.refetch() };
}

/** SF-T2 — one tenant by id. 404 renders uniformly (FR-004-008). */
export function useTenantDetail(tenantId: string | undefined) {
  const query = useQuery<TenantDetailResult>({
    queryKey: tenantId ? rf2QueryKeys.tenant(tenantId) : ["rf2", "tenant", "none"],
    enabled: Boolean(tenantId),
    queryFn: async () => {
      const res = await readTenant(tenantId as string);
      if (res.status >= 400) {
        return { kind: "error", render: mapRf2Error({ ...res, context: "tenant" }) };
      }
      return { kind: "tenant", tenant: res.data as Tenant };
    },
  });
  return { result: query.data, isLoading: query.isLoading };
}

/** SF-T3 — create/update. Invalidates the list + the detail on success. */
export function useTenantMutations(tenantId?: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: rf2QueryKeys.tenants });
    if (tenantId) void qc.invalidateQueries({ queryKey: rf2QueryKeys.tenant(tenantId) });
  };

  const create = useMutation({
    mutationFn: (body: TenantCreateBody) => createTenant(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: (body: TenantUpdateBody) => updateTenant(tenantId as string, body),
    onSuccess: invalidate,
  });
  return { create, update };
}

/** SF-T2/T3 — soft-delete behind a confirm; re-fetches the list (S8). */
export function useTenantDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => softDeleteTenant(tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: rf2QueryKeys.tenants }),
  });
}

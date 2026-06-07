/**
 * Audit query-key factory + scope binding (T010, FR-006-005, S6). The key
 * includes the active tenant id, active store id, and the filter set, so a
 * scope switch (RF-1 SF-3) changes the key → TanStack Query re-queries and the
 * prior scope's results are dropped (no cross-scope bleed). RF-6 holds no
 * authoritative scope; the ids come from RF-1's provider at the call site.
 */
import type { AuditQuery } from "@/lib/client";

/** The filter subset the operator controls (cursor/limit are pagination, not filters). */
export type AuditFilters = Omit<AuditQuery, "cursor" | "limit">;

export const auditQueryKeys = {
  search: (activeTenantId: string | null, activeStoreId: string | null, filters: AuditFilters) =>
    ["audit", activeTenantId, activeStoreId, filters] as const,
};

import { type AuditQuery, listAuditEvents } from "@/lib/client";
/**
 * Audit search hook (T018). `useInfiniteQuery` over `listAuditEvents`, scope-keyed
 * (a tenant/store switch re-queries and drops prior results, S6). Read-only; no
 * optimistic mutation (research R6-2/R6-3).
 *
 * Cursor pagination (OQ-4): `initialPageParam` is the no-cursor first page;
 * `getNextPageParam` returns `next_cursor` or **undefined** to stop (returning
 * the raw null would not stop the query in v5). Rows are `data.pages.flatMap(
 * p => p.items)` — flattening every fetched page, not just page 0.
 *
 * The query is **disabled until `searched`** so the pre-query state is reachable
 * (the surface renders a prompt before any search runs). Errors are carried in
 * the query RESULT (403 → forbidden, other non-2xx → generic), mirroring RF-2/
 * RF-5; 401 is NOT special-cased (OQ-1) — it falls through to the generic banner.
 */
import { useInfiniteQuery } from "@tanstack/react-query";
import { type AuditFilters, auditQueryKeys } from "./auditQueryKeys";

export interface AuditRow {
  id: string;
  occurred_at: string;
  actor_user_id?: string | null;
  actor_label?: string | null;
  store_id?: string | null;
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  request_id?: string | null;
  metadata?: Record<string, unknown>;
}

type AuditPage = { items: AuditRow[]; next_cursor: string | null };

export type AuditError = { kind: "forbidden" | "generic"; requestId?: string };

interface PageResult {
  page: AuditPage;
}

export interface AuditSearchValue {
  rows: AuditRow[];
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  error?: AuditError;
  loadMore: () => void;
}

const INITIAL_CURSOR: string | undefined = undefined;

export function useAuditSearch(
  activeTenantId: string | null,
  activeStoreId: string | null,
  filters: AuditFilters,
  searched: boolean,
): AuditSearchValue {
  const query = useInfiniteQuery({
    queryKey: auditQueryKeys.search(activeTenantId, activeStoreId, filters),
    enabled: searched && Boolean(activeTenantId),
    initialPageParam: INITIAL_CURSOR,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }): Promise<PageResult> => {
      const params: AuditQuery = { ...filters, cursor: pageParam };
      const res = await listAuditEvents(params);
      if (res.status >= 400) {
        // Carry the typed error by throwing a tagged Error the selector reads.
        const requestId = (res.error as { error?: { request_id?: string } } | undefined)?.error
          ?.request_id;
        const tag: AuditError =
          res.status === 403 ? { kind: "forbidden", requestId } : { kind: "generic", requestId };
        throw Object.assign(new Error("audit"), { auditError: tag });
      }
      return { page: (res.data as AuditPage | undefined) ?? { items: [], next_cursor: null } };
    },
    getNextPageParam: (last) => last.page.next_cursor ?? undefined,
    retry: false,
  });

  const rows = (query.data?.pages ?? []).flatMap((p) => p.page.items);
  const error = query.error
    ? ((query.error as Error & { auditError?: AuditError }).auditError ?? { kind: "generic" })
    : undefined;

  return {
    rows,
    hasMore: Boolean(query.hasNextPage),
    isLoading: query.isLoading && searched,
    isFetchingNextPage: query.isFetchingNextPage,
    error,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    },
  };
}

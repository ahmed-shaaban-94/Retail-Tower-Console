/**
 * 018 receivable-list hook (useInfiniteQuery over consoleListReceivables,
 * scope-keyed by active tenant + state filter). Read-only; no optimistic
 * mutation. Pagination via the pure receivableListLogic helpers; 403→forbidden /
 * other→generic. Mirrors 017's usePayerAccounts.
 */
import { useInfiniteQuery } from "@tanstack/react-query";
import { type ReceivableListQuery, type ReceivableState, consoleListReceivables } from "@/lib/client";
import {
  type ReceivableListPage,
  flattenReceivablePages,
  nextReceivableCursor,
} from "./receivableListLogic";

export type ReceivableFilters = { state?: ReceivableState; payerRef?: string };

export type ReceivableListError = { kind: "forbidden" | "generic"; requestId?: string };

export interface ReceivablesValue {
  rows: ReceivableListPage["items"];
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  error?: ReceivableListError;
  loadMore: () => void;
  refetch: () => void;
}

export const receivableQueryKeys = {
  list: (activeTenantId: string | null, filters: ReceivableFilters) =>
    ["receivables", activeTenantId, filters] as const,
};

const INITIAL_CURSOR: string | undefined = undefined;

export function useReceivables(
  activeTenantId: string | null,
  filters: ReceivableFilters,
): ReceivablesValue {
  const query = useInfiniteQuery({
    queryKey: receivableQueryKeys.list(activeTenantId, filters),
    enabled: Boolean(activeTenantId),
    initialPageParam: INITIAL_CURSOR,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }): Promise<ReceivableListPage> => {
      const params: ReceivableListQuery = { ...filters, cursor: pageParam };
      const res = await consoleListReceivables(params);
      if (res.status >= 400) {
        const requestId = (res.error as { error?: { request_id?: string } } | undefined)?.error
          ?.request_id;
        const tag: ReceivableListError =
          res.status === 403 ? { kind: "forbidden", requestId } : { kind: "generic", requestId };
        throw Object.assign(new Error("receivable-list"), { receivableError: tag });
      }
      return (res.data as ReceivableListPage | undefined) ?? { items: [], nextCursor: null };
    },
    getNextPageParam: (last) => nextReceivableCursor(last),
    retry: false,
  });

  const rows = flattenReceivablePages(query.data?.pages ?? []);
  const error = query.error
    ? ((query.error as Error & { receivableError?: ReceivableListError }).receivableError ?? {
        kind: "generic",
      })
    : undefined;

  return {
    rows,
    hasMore: Boolean(query.hasNextPage),
    isLoading: query.isLoading && Boolean(activeTenantId),
    isFetchingNextPage: query.isFetchingNextPage,
    error,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    },
    refetch: () => {
      void query.refetch();
    },
  };
}

/**
 * 017 payer-account list hook (useInfiniteQuery over consoleListPayerAccounts,
 * scope-keyed by active tenant + category filter — a tenant switch re-queries,
 * S6). Mirrors useAuditSearch. Read-only; no optimistic mutation.
 *
 * Pagination uses the pure helpers in payerListLogic: getNextPageParam returns
 * `nextPayerCursor` (null → undefined to stop in v5); rows are
 * `flattenPayerPages` over every fetched page. Errors are carried in the query
 * RESULT: 403 → forbidden, other non-2xx → generic (401 is not special-cased —
 * the auth interceptor owns session expiry).
 */
import { useInfiniteQuery } from "@tanstack/react-query";
import { type PayerListQuery, consoleListPayerAccounts } from "@/lib/client";
import { type PayerListPage, flattenPayerPages, nextPayerCursor } from "./payerListLogic";

export type PayerCategory = "credit_customer" | "corporate" | "insurer";

/** The operator-controlled filter (cursor/page_size are pagination, not filters). */
export type PayerFilters = { category?: PayerCategory };

export type PayerListError = { kind: "forbidden" | "generic"; requestId?: string };

export interface PayerAccountsValue {
  rows: PayerListPage["items"];
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  error?: PayerListError;
  loadMore: () => void;
}

export const payerQueryKeys = {
  list: (activeTenantId: string | null, filters: PayerFilters) =>
    ["payer-accounts", activeTenantId, filters] as const,
};

const INITIAL_CURSOR: string | undefined = undefined;

export function usePayerAccounts(
  activeTenantId: string | null,
  filters: PayerFilters,
): PayerAccountsValue {
  const query = useInfiniteQuery({
    queryKey: payerQueryKeys.list(activeTenantId, filters),
    enabled: Boolean(activeTenantId),
    initialPageParam: INITIAL_CURSOR,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }): Promise<PayerListPage> => {
      const params: PayerListQuery = { ...filters, cursor: pageParam };
      const res = await consoleListPayerAccounts(params);
      if (res.status >= 400) {
        const requestId = (res.error as { error?: { request_id?: string } } | undefined)?.error
          ?.request_id;
        const tag: PayerListError =
          res.status === 403 ? { kind: "forbidden", requestId } : { kind: "generic", requestId };
        throw Object.assign(new Error("payer-list"), { payerError: tag });
      }
      return (res.data as PayerListPage | undefined) ?? { items: [], nextCursor: null };
    },
    getNextPageParam: (last) => nextPayerCursor(last),
    retry: false,
  });

  const rows = flattenPayerPages(query.data?.pages ?? []);
  const error = query.error
    ? ((query.error as Error & { payerError?: PayerListError }).payerError ?? { kind: "generic" })
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
  };
}

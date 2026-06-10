import {
  type ListUnknownItemsParams,
  type ReviewQueueItem,
  type UnknownItemErrorRender,
  dismissUnknownItem,
  inspectUnknownItem,
  listUnknownItems,
  mapUnknownItemError,
  unknownItemsQueryKeys,
} from "@/lib/unknown-items-queries";
/**
 * RF-4a query/mutation hooks (T004). Thin TanStack Query bindings over the
 * wrappers in `src/lib/unknown-items-queries.ts`, reusing RF-1's query client.
 * Each surface (list / inspect / dismiss) consumes one of these so the data
 * wiring lives in one place and the components stay presentational.
 *
 * The query RESULT carries the typed-error render decision (mapUnknownItemError)
 * when a call fails, so components branch on data, not on thrown errors —
 * mirroring RF-2's `useTenantQueries` pattern.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type UnknownItemListResult =
  | { kind: "page"; items: ReviewQueueItem[]; nextCursor: string | null }
  | { kind: "error"; render: UnknownItemErrorRender };

export type UnknownItemInspectResult =
  | { kind: "item"; item: ReviewQueueItem }
  | { kind: "error"; render: UnknownItemErrorRender };

/** SF-4a-1 — the backend-scoped review queue. No client-side authz filter. */
export function useUnknownItemList(activeTenantId: string | null, params: ListUnknownItemsParams) {
  const query = useQuery<UnknownItemListResult>({
    queryKey: unknownItemsQueryKeys.list(activeTenantId, params),
    queryFn: async () => {
      const res = await listUnknownItems(params);
      if (res.status >= 400) {
        return { kind: "error", render: mapUnknownItemError({ ...res, op: "list" }) };
      }
      const data = res.data as
        | { items?: ReviewQueueItem[]; next_cursor?: string | null }
        | undefined;
      return { kind: "page", items: data?.items ?? [], nextCursor: data?.next_cursor ?? null };
    },
  });
  return { result: query.data, isLoading: query.isLoading, refetch: () => void query.refetch() };
}

/** SF-4a-2 — inspect one item. 404 renders uniformly (SI-004). */
export function useUnknownItemInspect(id: string | undefined) {
  const query = useQuery<UnknownItemInspectResult>({
    queryKey: id ? unknownItemsQueryKeys.item(id) : ["rf4a", "unknown-item", "none"],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await inspectUnknownItem(id as string);
      if (res.status >= 400) {
        return { kind: "error", render: mapUnknownItemError({ ...res, op: "inspect" }) };
      }
      return { kind: "item", item: res.data as ReviewQueueItem };
    },
  });
  return { result: query.data, isLoading: query.isLoading };
}

/**
 * SF-4a-3 — dismiss behind a confirm. Invalidates the queue on success so the
 * terminal row drops from the pending page (S8 parity). The mutation result
 * carries the mapped error (including the dismiss-only 409 already_reconciled)
 * so the surface can render it inline.
 */
export function useUnknownItemDismiss(activeTenantId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await dismissUnknownItem(id);
      if (res.status >= 400) {
        return {
          ok: false as const,
          render: mapUnknownItemError({ ...res, op: "dismiss" }),
        };
      }
      return { ok: true as const, item: res.data as ReviewQueueItem };
    },
    onSuccess: (result) => {
      if (result.ok) {
        // Re-scope the active tenant's queue (any filter/sort/group variant).
        void qc.invalidateQueries({
          queryKey: ["rf4a", "unknown-items", activeTenantId],
        });
      }
    },
  });
}

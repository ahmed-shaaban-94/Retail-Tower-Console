/**
 * 018 receivable-list keyset pagination — pure helpers (no client/React/generated
 * types). The useInfiniteQuery binding (018-B) calls these: `nextReceivableCursor`
 * is the getNextPageParam rule (null → undefined stops in v5), `flattenReceivablePages`
 * is the data.pages.flatMap projection. Mirrors 017's payerListLogic.
 */

export interface ReceivableRow {
  receivableRef: string;
}

export interface ReceivableListPage {
  items: ReceivableRow[];
  nextCursor: string | null;
}

export function nextReceivableCursor(page: ReceivableListPage): string | undefined {
  return page.nextCursor ?? undefined;
}

export function flattenReceivablePages(pages: readonly ReceivableListPage[]): ReceivableRow[] {
  return pages.flatMap((page) => page.items);
}

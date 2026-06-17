/**
 * 017 payer-list keyset pagination — pure helpers (FR-007 / OQ-CON-LIST-FILTER).
 * No client, no React, no generated types. The useInfiniteQuery binding (in the
 * G-client slice) calls these: `nextPayerCursor` is the `getNextPageParam` rule,
 * `flattenPayerPages` is the `data.pages.flatMap` projection. Server-side
 * filtering is `category` + opaque cursor only; any displayName search is a
 * client-side affordance over the already-returned rows (not modeled here).
 */

/** A rendered payer row (subset; full projection lands with the generated type). */
export interface PayerRow {
  payerRef: string;
}

/** One page of the `PayerAccountPage` projection. */
export interface PayerListPage {
  items: PayerRow[];
  nextCursor: string | null;
}

/**
 * getNextPageParam rule: a present cursor means "more pages"; `null` means the
 * last page → return `undefined` so useInfiniteQuery stops.
 */
export function nextPayerCursor(page: PayerListPage): string | undefined {
  return page.nextCursor ?? undefined;
}

/** Flatten fetched pages into a single newest-first row list (fetch order). */
export function flattenPayerPages(pages: readonly PayerListPage[]): PayerRow[] {
  return pages.flatMap((page) => page.items);
}

/**
 * RF-4a data layer (T003): typed wrappers over the generated `apiClient` for the
 * three runtime-merged unknown-items review-queue operations
 * (`tenantAdminListUnknownItems`, `tenantAdminInspectUnknownItem`,
 * `tenantAdminDismissUnknownItem`), stable query keys, and the per-op typed-error
 * mapping the surfaces branch on.
 *
 * Reuse posture (research R4a-1): this mirrors `src/lib/rf2-queries.ts` exactly —
 * the same generated client (the ONLY DP2 call surface, Principle 8), the same
 * `{ status, data?, error? }` result shape, the same Banner/InlineError surface.
 * It adds NO new dependency and NO new context operation; scope (active tenant /
 * store) is read from RF-1's `ActiveContextProvider` at the call sites, not
 * fetched here.
 *
 * Boundary (VG-4): only the THREE consumed ops are wrapped. The other five ops in
 * `catalog/unknown-items.yaml` (posCapture / link / create-product / reopen /
 * bulk-dismiss) are NOT wrapped and NOT called — link / create-product are RF-4b
 * (SD-1 deferred); reopen / bulk-dismiss are runtime-absent at the pin.
 *
 * Error mapping (research R4a-3, AS-5 discipline): each op maps EXACTLY the
 * statuses its contract documents, asserting no undocumented status. Unlike RF-2,
 * the 409 here is `already_reconciled` (the item is already terminal), NOT a
 * slug/code uniqueness conflict. The 007 `forbidden` (403) is its own branch,
 * distinct from the non-disclosing 404. The contract documents NO 422/429, so
 * none is asserted.
 */
import { apiClient } from "@/generated/client";
import type { components, operations } from "@/generated/schema";

// --- Generated projections (no hand-typed shapes) -----------------------------

/** The review-surface projection: `UnknownItem` minus `sale_context` (FR-007). */
export type ReviewQueueItem = components["schemas"]["ReviewQueueItem"];
/** List response: `{ items: ReviewQueueItem[]; next_cursor: string | null }`. */
export type ListUnknownItemsResponse = components["schemas"]["ListUnknownItemsResponse"];
/** The typed query params for the list op (007 source_system / sort / group_by). */
export type ListUnknownItemsParams = NonNullable<
  operations["tenantAdminListUnknownItems"]["parameters"]["query"]
>;

// --- Typed operation wrappers -------------------------------------------------
// Each returns `{ status, data?, error? }` so callers branch on `status`
// uniformly, mirroring src/lib/rf2-queries.ts. No hand-rolled fetch (VG-3);
// cookie transport is already on the generated client.

/** GET /api/v1/catalog/unknown-items — the pending review queue (scoped by RLS). */
export async function listUnknownItems(params?: ListUnknownItemsParams) {
  const { data, error, response } = await apiClient.GET("/api/v1/catalog/unknown-items", {
    params: { query: params },
  });
  return { status: response.status, data, error };
}

/** GET /api/v1/catalog/unknown-items/{id} — inspect one item as a ReviewQueueItem. */
export async function inspectUnknownItem(id: string) {
  const { data, error, response } = await apiClient.GET("/api/v1/catalog/unknown-items/{id}", {
    params: { path: { id } },
  });
  return { status: response.status, data, error };
}

/** POST /api/v1/catalog/unknown-items/{id}/dismiss — terminate a pending item. */
export async function dismissUnknownItem(id: string) {
  const { data, error, response } = await apiClient.POST(
    "/api/v1/catalog/unknown-items/{id}/dismiss",
    { params: { path: { id } } },
  );
  return { status: response.status, data, error };
}

// --- Query keys ---------------------------------------------------------------
// Keys are scoped by the active tenant id (+ the list filter/sort/group params)
// so a tenant switch or a filter change re-keys the cache structurally (R4a-6);
// RF-4a holds no authoritative scope — the tenant id comes from the RF-1 provider
// at the call sites.

export const unknownItemsQueryKeys = {
  list: (tenantId: string | null, params?: ListUnknownItemsParams) =>
    ["rf4a", "unknown-items", tenantId, params ?? {}] as const,
  item: (id: string) => ["rf4a", "unknown-item", id] as const,
} as const;

// --- Typed error mapping ------------------------------------------------------

/** Backend error envelope: { error: { code, message, request_id } } (schema Error). */
interface BackendError {
  error?: { code?: string; message?: string; request_id?: string | null };
}

/** Which op raised the error — disambiguates which statuses are documented. */
export type UnknownItemOp = "list" | "inspect" | "dismiss";

export interface UnknownItemErrorContext {
  status: number;
  error?: BackendError;
  op: UnknownItemOp;
}

export type UnknownItemErrorRender =
  /** Persistent banner (403 forbidden, or retryable 5xx). Surfaces request_id. */
  | { kind: "banner"; message: string; requestId?: string; retryable: boolean }
  /** Uniform 404 — absent vs no-access indistinguishable (SI-004, inspect/dismiss). */
  | { kind: "not-found"; message: string }
  /** Dismiss 409 — the item is already terminal (`already_reconciled`). */
  | { kind: "already-reconciled"; message: string }
  /** Anything else (incl. a 400 bad param) — generic banner copy. */
  | { kind: "generic"; message: string; requestId?: string };

const COPY = {
  forbidden403: "You do not have permission to review unknown items in this scope.",
  notFound: "This item is not available.",
  alreadyReconciled: "This item has already been resolved. Refresh to see its current state.",
  serverError: "Something went wrong. Try again.",
  badRequest: "The request could not be completed.",
} as const;

function requestIdOf(input: UnknownItemErrorContext): string | undefined {
  return input.error?.error?.request_id ?? undefined;
}

/**
 * Map an RF-4a operation's failure to a render decision. Pure; no React, no
 * fetch. Each op maps only the statuses its contract documents (AS-5); an
 * undocumented status falls to the generic branch rather than inventing
 * handling (no 422/429 is documented on any of the three ops).
 *
 * Documented statuses:
 *   - list:    400 / 401 / 403            (no 404 — RLS filters to an empty page)
 *   - inspect: 400 / 401 / 403 / 404
 *   - dismiss: 400 / 401 / 403 / 404 / 409 (already_reconciled)
 *
 * 401 is intentionally NOT mapped to a scope/sign-out action here: the
 * generated client carries the cookie; a 401 on these dashboard ops is an
 * unauthenticated/expired session that RF-1's interceptor owns, so RF-4a renders
 * it as a generic banner and does not synthesize a refresh (parity with RF-2's
 * AS-5 restraint).
 */
export function mapUnknownItemError(input: UnknownItemErrorContext): UnknownItemErrorRender {
  const requestId = requestIdOf(input);
  switch (input.status) {
    case 403:
      // 007 8th category: `error.code = "forbidden"` — in-scope but insufficient
      // authority. Distinct from the non-disclosing 404. Rendered as a banner.
      return { kind: "banner", message: COPY.forbidden403, requestId, retryable: false };
    case 404:
      // Documented only on inspect / dismiss (SI-004 non-disclosing). The list
      // has no 404; a 404 there is undocumented and falls through to generic.
      if (input.op === "inspect" || input.op === "dismiss") {
        return { kind: "not-found", message: COPY.notFound };
      }
      return { kind: "generic", message: COPY.badRequest, requestId };
    case 409:
      // Documented only on dismiss: the item is already `resolved`/`dismissed`.
      if (input.op === "dismiss") {
        return { kind: "already-reconciled", message: COPY.alreadyReconciled };
      }
      return { kind: "generic", message: COPY.badRequest, requestId };
    default:
      if (input.status >= 500) {
        return { kind: "banner", message: COPY.serverError, requestId, retryable: true };
      }
      // 400 / 401 / any other documented-but-non-specific status.
      return { kind: "generic", message: COPY.badRequest, requestId };
  }
}

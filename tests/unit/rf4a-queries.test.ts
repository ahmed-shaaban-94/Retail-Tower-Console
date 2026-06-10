import { describe, expect, test } from "vitest";

import {
  type UnknownItemOp,
  mapUnknownItemError,
  unknownItemsQueryKeys,
} from "@/lib/unknown-items-queries";

/**
 * RF-4a error-mapping coverage (T010, AS-5 discipline). Asserts each op maps
 * EXACTLY its documented statuses and that an undocumented status falls to the
 * generic branch rather than inventing handling. Documented statuses:
 *   - list:    400 / 401 / 403
 *   - inspect: 400 / 401 / 403 / 404
 *   - dismiss: 400 / 401 / 403 / 404 / 409 (already_reconciled)
 * The contract documents NO 422/429 on any of the three ops.
 */
const env = (status: number, op: UnknownItemOp, requestId?: string) => ({
  status,
  op,
  error: requestId ? { error: { code: "x", message: "x", request_id: requestId } } : undefined,
});

describe("mapUnknownItemError — 403 forbidden (007 8th category)", () => {
  for (const op of ["list", "inspect", "dismiss"] as const) {
    test(`${op}: 403 -> persistent banner, not retryable`, () => {
      const r = mapUnknownItemError(env(403, op, "req-403"));
      expect(r.kind).toBe("banner");
      if (r.kind === "banner") {
        expect(r.retryable).toBe(false);
        expect(r.requestId).toBe("req-403");
        expect(r.message).toMatch(/permission/i);
      }
    });
  }
});

describe("mapUnknownItemError — 404 non-disclosing (inspect/dismiss only)", () => {
  test("inspect: 404 -> uniform not-found", () => {
    expect(mapUnknownItemError(env(404, "inspect")).kind).toBe("not-found");
  });
  test("dismiss: 404 -> uniform not-found", () => {
    expect(mapUnknownItemError(env(404, "dismiss")).kind).toBe("not-found");
  });
  test("list: 404 is undocumented -> generic (RLS filters to empty page, no 404)", () => {
    expect(mapUnknownItemError(env(404, "list")).kind).toBe("generic");
  });
});

describe("mapUnknownItemError — 409 already_reconciled (dismiss only)", () => {
  test("dismiss: 409 -> already-reconciled", () => {
    const r = mapUnknownItemError(env(409, "dismiss"));
    expect(r.kind).toBe("already-reconciled");
    if (r.kind === "already-reconciled") expect(r.message).toMatch(/already been resolved/i);
  });
  test("list: 409 is undocumented -> generic", () => {
    expect(mapUnknownItemError(env(409, "list")).kind).toBe("generic");
  });
  test("inspect: 409 is undocumented -> generic", () => {
    expect(mapUnknownItemError(env(409, "inspect")).kind).toBe("generic");
  });
});

describe("mapUnknownItemError — 5xx retryable, and undocumented 4xx fall to generic", () => {
  test("503 -> retryable banner", () => {
    const r = mapUnknownItemError(env(503, "list", "req-503"));
    expect(r.kind).toBe("banner");
    if (r.kind === "banner") expect(r.retryable).toBe(true);
  });
  test("400 -> generic (documented bad-request; no special branch)", () => {
    expect(mapUnknownItemError(env(400, "list")).kind).toBe("generic");
  });
  test("401 -> generic (owned by RF-1 interceptor; RF-4a does not synthesize scope/refresh)", () => {
    expect(mapUnknownItemError(env(401, "inspect")).kind).toBe("generic");
  });
  test("422 is undocumented anywhere -> generic (NOT a fabricated category)", () => {
    expect(mapUnknownItemError(env(422, "dismiss")).kind).toBe("generic");
  });
  test("429 is undocumented anywhere -> generic", () => {
    expect(mapUnknownItemError(env(429, "list")).kind).toBe("generic");
  });
});

describe("unknownItemsQueryKeys — scoped by tenant + params (re-keys on switch/filter)", () => {
  test("list key includes tenant id and params", () => {
    const k = unknownItemsQueryKeys.list("t1", { status: "pending", sort: "age_desc" });
    expect(k[0]).toBe("rf4a");
    expect(k[2]).toBe("t1");
    expect(k[3]).toEqual({ status: "pending", sort: "age_desc" });
  });
  test("a different tenant id produces a different key", () => {
    const a = unknownItemsQueryKeys.list("t1", { status: "pending" });
    const b = unknownItemsQueryKeys.list("t2", { status: "pending" });
    expect(a).not.toEqual(b);
  });
  test("item key is by id", () => {
    expect(unknownItemsQueryKeys.item("u1")).toEqual(["rf4a", "unknown-item", "u1"]);
  });
});

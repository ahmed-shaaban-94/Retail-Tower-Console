import { type Rf2ErrorContext, mapRf2Error } from "@/lib/rf2-queries";
import { describe, expect, test } from "vitest";

/**
 * RF-2 typed-error mapping (T005). Maps the statuses the tenant/store contracts
 * document @ 62d0906 to a render decision the surfaces branch on. No 422/429
 * (contracts document none). The store 401 is a scope precondition, NOT a
 * session-expiry — it must render a scope prompt, never a sign-out, and must NOT
 * attempt a refresh (createAuthRetry is per-call to RF-1's context query only).
 */
function backend(requestId?: string) {
  return { error: { code: "x", message: "m", request_id: requestId } };
}

describe("mapRf2Error", () => {
  test("403 -> banner with request_id (action attempted, not pre-blocked)", () => {
    const r = mapRf2Error({ status: 403, error: backend("req-403"), context: "tenant" });
    expect(r.kind).toBe("banner");
    if (r.kind === "banner") {
      expect(r.requestId).toBe("req-403");
    }
  });

  test("404 -> uniform not-available (no absent-vs-no-access distinction)", () => {
    const r = mapRf2Error({ status: 404, context: "tenant" });
    expect(r.kind).toBe("not-found");
  });

  test("409 on tenant -> inline conflict keyed to the slug field", () => {
    const r = mapRf2Error({ status: 409, context: "tenant" });
    expect(r.kind).toBe("conflict");
    if (r.kind === "conflict") {
      expect(r.field).toBe("slug");
    }
  });

  test("409 on store -> inline conflict keyed to the code field", () => {
    const r = mapRf2Error({ status: 409, context: "store" });
    expect(r.kind).toBe("conflict");
    if (r.kind === "conflict") {
      expect(r.field).toBe("code");
    }
  });

  test("401 on a store op -> scope prompt (distinct from session expiry)", () => {
    const r = mapRf2Error({ status: 401, context: "store" });
    expect(r.kind).toBe("scope-required");
  });

  test("401 on a tenant op -> generic (tenant ops document no 401; do not invent scope handling)", () => {
    const r = mapRf2Error({ status: 401, context: "tenant" });
    expect(r.kind).toBe("generic");
  });

  test("5xx -> retry-able banner", () => {
    const r = mapRf2Error({ status: 503, error: backend("req-503"), context: "store" });
    expect(r.kind).toBe("banner");
    if (r.kind === "banner") {
      expect(r.retryable).toBe(true);
      expect(r.requestId).toBe("req-503");
    }
  });

  test("403 banner is not retryable", () => {
    const r = mapRf2Error({ status: 403, context: "store" });
    if (r.kind === "banner") {
      expect(r.retryable).toBe(false);
    }
  });

  test("missing request_id surfaces undefined, not a crash", () => {
    const r = mapRf2Error({ status: 403, context: "tenant" } satisfies Rf2ErrorContext);
    if (r.kind === "banner") {
      expect(r.requestId).toBeUndefined();
    }
  });
});

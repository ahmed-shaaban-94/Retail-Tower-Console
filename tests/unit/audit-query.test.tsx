import { auditQueryKeys } from "@/audit/auditQueryKeys";
import { describe, expect, test } from "vitest";

/**
 * Audit query-key reduction (T011, VG-1). The key includes the active scope
 * (tenant + store) and the filter set, so a scope switch re-queries and prior
 * results drop (S6, FR-006-005). No cross-scope bleed.
 */
describe("auditQueryKeys.search", () => {
  test("key includes scope + filters", () => {
    const key = auditQueryKeys.search("t1", "s1", { action: "auth." });
    expect(key).toEqual(["audit", "t1", "s1", { action: "auth." }]);
  });

  test("a tenant switch changes the key (re-query, drop prior scope)", () => {
    const a = auditQueryKeys.search("t1", null, {});
    const b = auditQueryKeys.search("t2", null, {});
    expect(a).not.toEqual(b);
  });

  test("a store switch changes the key", () => {
    const a = auditQueryKeys.search("t1", "s1", {});
    const b = auditQueryKeys.search("t1", "s2", {});
    expect(a).not.toEqual(b);
  });

  test("a filter change changes the key", () => {
    const a = auditQueryKeys.search("t1", null, { action: "auth." });
    const b = auditQueryKeys.search("t1", null, { action: "shift." });
    expect(a).not.toEqual(b);
  });
});

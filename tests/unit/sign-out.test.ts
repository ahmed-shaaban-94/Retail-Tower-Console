import { describe, expect, test } from "vitest";
import { resolveSignOut } from "@/shell/sign-out";

/**
 * Sign-out resolution (SF-2, T030, Scenario S6). Both a 204 (session cleared)
 * and a 401 (session already expired) are treated as a successful sign-out
 * from the user's perspective. Any other status is still treated as signed-out
 * client-side (we drop local state regardless) but flagged.
 */
describe("resolveSignOut", () => {
  test("204 -> success", () => {
    expect(resolveSignOut(204)).toEqual({ signedOut: true });
  });

  test("401 (already expired) -> treated as success", () => {
    expect(resolveSignOut(401)).toEqual({ signedOut: true });
  });

  test("200 -> success", () => {
    expect(resolveSignOut(200)).toEqual({ signedOut: true });
  });

  test("500 -> still signs out locally", () => {
    expect(resolveSignOut(500)).toEqual({ signedOut: true });
  });
});

import { runInviteWithAuth } from "@/operators/useInviteAuth";
import { describe, expect, test, vi } from "vitest";

/**
 * createInvitation 401-disambiguation (T007/T010, VG-1, FR-005-007, OQ-1) — the
 * make-or-break rule, grounded in src/lib/auth-interceptor.ts:
 *   - 401 then refresh FAILS        → session-expired (the ONLY sign-out path)
 *   - 401 then refresh OK, still 401 → precondition ("No active tenant") → scope chooser
 *   - non-401                        → pass through
 * Each run uses a fresh interceptor instance (per-attempt-local; no leak between
 * submits).
 */

function inviteReturning(...statuses: number[]) {
  let i = 0;
  return vi.fn(async () => {
    const status = statuses[Math.min(i, statuses.length - 1)];
    i += 1;
    return { status, data: undefined, error: undefined, headers: new Headers() };
  });
}

describe("runInviteWithAuth", () => {
  test("201 first try -> ok, no refresh attempted", async () => {
    const invite = inviteReturning(201);
    const refreshSession = vi.fn(async () => ({ ok: true }));
    const out = await runInviteWithAuth(invite, refreshSession);
    expect(out.kind).toBe("ok");
    if (out.kind === "ok") expect(out.result.status).toBe(201);
    expect(refreshSession).not.toHaveBeenCalled();
  });

  test("401 then refresh FAILS -> session-expired (sign-out path)", async () => {
    const invite = inviteReturning(401);
    const refreshSession = vi.fn(async () => ({ ok: false }));
    const out = await runInviteWithAuth(invite, refreshSession);
    expect(out.kind).toBe("session-expired");
    expect(refreshSession).toHaveBeenCalledOnce();
    // interceptor returns the first 401 without re-issuing on refresh failure
    expect(invite).toHaveBeenCalledOnce();
  });

  test("401 then refresh OK but retry still 401 -> precondition (scope chooser, NOT sign-out)", async () => {
    const invite = inviteReturning(401, 401); // both attempts 401
    const refreshSession = vi.fn(async () => ({ ok: true }));
    const out = await runInviteWithAuth(invite, refreshSession);
    expect(out.kind).toBe("precondition");
    expect(refreshSession).toHaveBeenCalledOnce();
    expect(invite).toHaveBeenCalledTimes(2); // first 401, refresh ok, retried
  });

  test("401 then refresh OK and retry succeeds -> ok", async () => {
    const invite = inviteReturning(401, 201);
    const refreshSession = vi.fn(async () => ({ ok: true }));
    const out = await runInviteWithAuth(invite, refreshSession);
    expect(out.kind).toBe("ok");
    if (out.kind === "ok") expect(out.result.status).toBe(201);
  });

  test("non-401 error (403) -> ok pass-through (the caller classifies it)", async () => {
    const invite = inviteReturning(403);
    const refreshSession = vi.fn(async () => ({ ok: true }));
    const out = await runInviteWithAuth(invite, refreshSession);
    expect(out.kind).toBe("ok");
    if (out.kind === "ok") expect(out.result.status).toBe(403);
    expect(refreshSession).not.toHaveBeenCalled();
  });

  test("clean state between runs: a prior session-expired does not leak into a fresh precondition run", async () => {
    await runInviteWithAuth(
      inviteReturning(401),
      vi.fn(async () => ({ ok: false })),
    );
    const out = await runInviteWithAuth(
      inviteReturning(401, 401),
      vi.fn(async () => ({ ok: true })),
    );
    expect(out.kind).toBe("precondition");
  });
});

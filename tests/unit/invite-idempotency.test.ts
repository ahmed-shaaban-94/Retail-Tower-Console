import {
  type InviteCallResult,
  classifyInviteOutcome,
  newIdempotencyKey,
} from "@/operators/inviteIdempotency";
import { describe, expect, test } from "vitest";

/**
 * Invite idempotency (T008/T016, VG-1, FR-005-008). The Idempotency-Key is a
 * client-generated opaque token matching the contract format. The outcome
 * classifier maps a createInvitation result to the action the UI takes — the
 * replay/409-conflict/425 rules from the contract's idempotency table.
 */
describe("newIdempotencyKey", () => {
  test("matches the contract format ^[\\x21-\\x7E]{16,128}$", () => {
    const key = newIdempotencyKey();
    expect(key).toMatch(/^[\x21-\x7E]{16,128}$/);
  });

  test("is unique across calls", () => {
    const a = newIdempotencyKey();
    const b = newIdempotencyKey();
    expect(a).not.toBe(b);
  });
});

function res(partial: Partial<InviteCallResult>): InviteCallResult {
  return { status: 0, headers: new Headers(), error: undefined, ...partial };
}

describe("classifyInviteOutcome", () => {
  test("201 -> created", () => {
    expect(classifyInviteOutcome(res({ status: 201 })).kind).toBe("created");
  });

  test("201 with Idempotent-Replayed:true -> replayed (same invite, not a dup)", () => {
    const headers = new Headers({ "Idempotent-Replayed": "true" });
    expect(classifyInviteOutcome(res({ status: 201, headers })).kind).toBe("replayed");
  });

  test("400 validation_error -> field error (inline)", () => {
    const o = classifyInviteOutcome(
      res({ status: 400, error: { error: { code: "validation_error" } } }),
    );
    expect(o.kind).toBe("validation");
  });

  test("400 idempotency_key_* -> regenerate key and retry (not user-facing)", () => {
    const o = classifyInviteOutcome(
      res({ status: 400, error: { error: { code: "idempotency_key_malformed" } } }),
    );
    expect(o.kind).toBe("regenerate-key");
  });

  test("403 -> permission banner", () => {
    expect(classifyInviteOutcome(res({ status: 403 })).kind).toBe("forbidden");
  });

  test("409 pending invite -> distinct 'pending' outcome", () => {
    const o = classifyInviteOutcome(
      res({ status: 409, error: { error: { code: "pending_invitation" } } }),
    );
    expect(o.kind).toBe("pending-exists");
  });

  test("409 idempotency_key_conflict -> terminal, regenerate a NEW key", () => {
    const o = classifyInviteOutcome(
      res({ status: 409, error: { error: { code: "idempotency_key_conflict" } } }),
    );
    expect(o.kind).toBe("key-conflict");
  });

  test("425 Too Early -> retry-with-same-key after Retry-After seconds", () => {
    const headers = new Headers({ "Retry-After": "3" });
    const o = classifyInviteOutcome(res({ status: 425, headers }));
    expect(o.kind).toBe("too-early");
    if (o.kind === "too-early") {
      expect(o.retryAfterSeconds).toBe(3);
    }
  });

  test("425 with no Retry-After -> defaults to a small positive delay", () => {
    const o = classifyInviteOutcome(res({ status: 425 }));
    if (o.kind === "too-early") {
      expect(o.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  test("5xx -> generic retryable", () => {
    expect(classifyInviteOutcome(res({ status: 503 })).kind).toBe("error");
  });
});

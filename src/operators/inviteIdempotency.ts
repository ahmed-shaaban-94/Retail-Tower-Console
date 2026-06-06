/**
 * Invite idempotency helpers (T008, §6.3, FR-005-008). `createInvitation` is
 * `x-idempotency: required`: each attempt sends a client-generated opaque
 * `Idempotency-Key` header. This module owns key generation + the pure
 * classifier that maps a createInvitation result to the UI's next action, per
 * the contract's idempotency table:
 *
 *   201                              → created
 *   201 + Idempotent-Replayed:true   → replayed (same invite, not a duplicate)
 *   400 validation_error             → field error (inline)
 *   400 idempotency_key_*            → regenerate key + retry (not user-facing)
 *   403                              → permission banner
 *   409 pending_invitation           → "already pending for this email"
 *   409 idempotency_key_conflict     → terminal; generate a NEW key, do not auto-retry
 *   425 Too Early                    → retry with the SAME key after Retry-After
 *
 * No new dependency: the key is a v4 UUID from the platform `crypto.randomUUID`
 * (36 chars, satisfies the contract format `^[\x21-\x7E]{16,128}$`). v7's only
 * benefit is backend time-ordering, which has no client-correctness value.
 */

/** Backend error envelope: { error: { code, message, request_id } }. */
interface BackendError {
  error?: { code?: string; message?: string; request_id?: string };
}

export interface InviteCallResult {
  status: number;
  headers: Headers;
  error?: BackendError;
}

export type InviteOutcome =
  | { kind: "created"; replayed: false }
  | { kind: "replayed" }
  | { kind: "validation"; requestId?: string }
  | { kind: "regenerate-key" }
  | { kind: "forbidden"; requestId?: string }
  | { kind: "pending-exists"; requestId?: string }
  | { kind: "key-conflict"; requestId?: string }
  | { kind: "too-early"; retryAfterSeconds: number }
  | { kind: "error"; requestId?: string };

const DEFAULT_RETRY_AFTER_SECONDS = 2;

/**
 * Generate an Idempotency-Key. `crypto.randomUUID()` (v4) is 36 chars of
 * `[0-9a-f-]`, well inside the contract's `^[\x21-\x7E]{16,128}$`.
 */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

function codeOf(result: InviteCallResult): string | undefined {
  return result.error?.error?.code;
}

function requestIdOf(result: InviteCallResult): string | undefined {
  return result.error?.error?.request_id;
}

/** Pure classifier; no React, no fetch. Drives the SF5-2 outcome rendering. */
export function classifyInviteOutcome(result: InviteCallResult): InviteOutcome {
  const requestId = requestIdOf(result);

  if (result.status === 201) {
    return result.headers.get("Idempotent-Replayed") === "true"
      ? { kind: "replayed" }
      : { kind: "created", replayed: false };
  }

  if (result.status === 400) {
    const code = codeOf(result);
    // A malformed/missing key is a client-internal fault: regenerate + retry,
    // not a message to the operator (they did not type the key).
    if (code === "idempotency_key_required" || code === "idempotency_key_malformed") {
      return { kind: "regenerate-key" };
    }
    return { kind: "validation", requestId };
  }

  if (result.status === 403) {
    return { kind: "forbidden", requestId };
  }

  if (result.status === 409) {
    // Same key, different body — terminal; a new key is required (do not retry
    // with the same one). Distinct from a genuine duplicate-pending invite.
    return codeOf(result) === "idempotency_key_conflict"
      ? { kind: "key-conflict", requestId }
      : { kind: "pending-exists", requestId };
  }

  if (result.status === 425) {
    const header = result.headers.get("Retry-After");
    const parsed = header ? Number.parseInt(header, 10) : Number.NaN;
    const retryAfterSeconds =
      Number.isNaN(parsed) || parsed <= 0 ? DEFAULT_RETRY_AFTER_SECONDS : parsed;
    return { kind: "too-early", retryAfterSeconds };
  }

  return { kind: "error", requestId };
}

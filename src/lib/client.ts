/**
 * Typed RF-1 operation surface (T007). Thin wrappers over the generated
 * `apiClient` (the ONLY DP2 call surface, Principle 8) so the rest of `src/`
 * calls named operations, never hand-rolled fetch (FR-003-002). Cookie
 * transport is already set on the generated client (`credentials: "include"`,
 * no bearer, no CSRF header — matches the resolved OQ-3 posture).
 *
 * Each wrapper returns `{ status, data?, error? }` so callers (and the 401
 * interceptor) branch on `status` uniformly.
 */
import { apiClient } from "@/generated/client";

export interface SignInBody {
  email: string;
  password: string;
}

/** POST /api/v1/auth/signin */
export async function signIn(body: SignInBody) {
  const { data, error, response } = await apiClient.POST("/api/v1/auth/signin", { body });
  // Parse Retry-After (seconds) on 429 so SF-1 can show a real countdown.
  const retryAfter = response.headers.get("retry-after");
  const retryAfterSeconds = retryAfter ? Number.parseInt(retryAfter, 10) : undefined;
  return {
    status: response.status,
    data,
    error,
    retryAfterSeconds: Number.isNaN(retryAfterSeconds) ? undefined : retryAfterSeconds,
  };
}

/** POST /api/v1/auth/signout */
export async function signOut() {
  const { data, error, response } = await apiClient.POST("/api/v1/auth/signout", {});
  return { status: response.status, data, error };
}

/** POST /api/v1/auth/refresh */
export async function refreshSession() {
  const { data, error, response } = await apiClient.POST("/api/v1/auth/refresh", {});
  return { status: response.status, data, error };
}

/** GET /api/v1/context/me */
export async function getActiveContext() {
  const { data, error, response } = await apiClient.GET("/api/v1/context/me", {});
  return { status: response.status, data, error };
}

/** POST /api/v1/context/tenant */
export async function switchActiveTenant(tenantId: string) {
  const { data, error, response } = await apiClient.POST("/api/v1/context/tenant", {
    body: { tenant_id: tenantId },
  });
  return { status: response.status, data, error };
}

/** POST /api/v1/context/store */
export async function switchActiveStore(storeId: string) {
  const { data, error, response } = await apiClient.POST("/api/v1/context/store", {
    body: { store_id: storeId },
  });
  return { status: response.status, data, error };
}

/** DELETE /api/v1/context/store */
export async function clearActiveStore() {
  const { data, error, response } = await apiClient.DELETE("/api/v1/context/store", {});
  return { status: response.status, data, error };
}

// --- RF-5 operator / admin management (T005) --------------------------------
// Five typed wrappers in the existing { status, data, error } shape. Member
// listing reads RF-1's active tenant id; the membership mutations + the public
// accept use memberships.openapi.yaml. createInvitation is the only one that
// also sends an Idempotency-Key header and surfaces response headers (replay /
// Retry-After) — see src/operators/inviteIdempotency.ts.

export interface InvitationCreateBody {
  email: string;
  role_code: string;
  store_access_kind: "all" | "specific";
  store_ids?: string[];
}
export interface MembershipUpdateBody {
  role_code?: string;
  store_access_kind?: "all" | "specific";
  store_ids?: string[];
}
export interface AcceptInvitationBody {
  token: string;
  password?: string;
  display_name?: string;
}

/** GET /api/v1/tenants/{tenant_id}/members */
export async function listMembers(tenantId: string) {
  const { data, error, response } = await apiClient.GET("/api/v1/tenants/{tenant_id}/members", {
    params: { path: { tenant_id: tenantId } },
  });
  return { status: response.status, data, error };
}

/**
 * POST /api/v1/memberships/invite. `x-idempotency: required` — sends a
 * client-generated Idempotency-Key header and returns the response headers so
 * the caller can read `Idempotent-Replayed` / `Retry-After` (idempotency table).
 */
export async function createInvitation(body: InvitationCreateBody, idempotencyKey: string) {
  const { data, error, response } = await apiClient.POST("/api/v1/memberships/invite", {
    params: { header: { "Idempotency-Key": idempotencyKey } },
    body,
  });
  return { status: response.status, data, error, headers: response.headers };
}

/** PATCH /api/v1/memberships/{membership_id} */
export async function updateMembership(membershipId: string, body: MembershipUpdateBody) {
  const { data, error, response } = await apiClient.PATCH("/api/v1/memberships/{membership_id}", {
    params: { path: { membership_id: membershipId } },
    body,
  });
  return { status: response.status, data, error };
}

/** DELETE /api/v1/memberships/{membership_id} */
export async function revokeMembership(membershipId: string) {
  const { data, error, response } = await apiClient.DELETE("/api/v1/memberships/{membership_id}", {
    params: { path: { membership_id: membershipId } },
  });
  return { status: response.status, data, error };
}

/** POST /api/v1/invitations/accept — public (security: []); accept token authenticates. */
export async function acceptInvitation(body: AcceptInvitationBody) {
  const { data, error, response } = await apiClient.POST("/api/v1/invitations/accept", { body });
  return { status: response.status, data, error };
}

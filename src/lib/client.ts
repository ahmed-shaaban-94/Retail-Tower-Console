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

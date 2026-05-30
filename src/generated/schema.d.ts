/**
 * ⚠️ STUB — NOT generated output. ⚠️
 *
 * This file is a minimal, hand-checked stand-in for the openapi-typescript
 * output, covering RF-1's seven consumed operations (see
 * specs/001-console-foundation/contracts/rf1-auth-context.md). It exists so
 * the build, type-check, and tests are green before the real generated
 * client can be produced.
 *
 * It is NOT the generated client. Data-Pulse-2 is a separate private repo
 * not reachable from this workspace; `pnpm generate:client` (see
 * openapi-ts.config.ts, pinned to SHA 62d0906) replaces this stub with the
 * real types once the contracts are reachable. Do not hand-extend this —
 * regenerate instead.
 *
 * This stub is TYPES ONLY. All Data-Pulse-2 calls route through
 * openapi-fetch in ./client.ts (Principle 8 / AC-002-5: no hand-written
 * fetch to DP2 paths).
 *
 * Shape mirrors openapi-typescript v7 `paths` output so client.ts compiles
 * against either this stub or the real generated file unchanged.
 */

export interface paths {
  "/api/v1/auth/signin": {
    post: operations["signIn"];
  };
  "/api/v1/auth/signout": {
    post: operations["signOut"];
  };
  "/api/v1/auth/refresh": {
    post: operations["refreshSession"];
  };
  "/api/v1/context/me": {
    get: operations["getActiveContext"];
  };
  "/api/v1/context/tenant": {
    post: operations["switchActiveTenant"];
  };
  "/api/v1/context/store": {
    post: operations["switchActiveStore"];
    delete: operations["clearActiveStore"];
  };
}

export interface components {
  schemas: {
    Membership: {
      tenant_id: string;
      tenant_name: string;
      role: string;
    };
    SignInResponse: {
      memberships: components["schemas"]["Membership"][];
    };
    ActiveContext: {
      user_id: string;
      active_tenant_id: string | null;
      active_store_id: string | null;
      memberships: components["schemas"]["Membership"][];
    };
    Error: {
      code: string;
      message: string;
      request_id: string;
    };
  };
}

export interface operations {
  signIn: {
    requestBody: {
      content: {
        "application/json": { email: string; password: string };
      };
    };
    responses: {
      200: { content: { "application/json": components["schemas"]["SignInResponse"] } };
      401: { content: { "application/json": components["schemas"]["Error"] } };
      429: { content: { "application/json": components["schemas"]["Error"] } };
    };
  };
  signOut: {
    responses: {
      204: { content?: never };
      401: { content: { "application/json": components["schemas"]["Error"] } };
    };
  };
  refreshSession: {
    responses: {
      204: { content?: never };
      401: { content: { "application/json": components["schemas"]["Error"] } };
    };
  };
  getActiveContext: {
    responses: {
      200: { content: { "application/json": components["schemas"]["ActiveContext"] } };
      401: { content: { "application/json": components["schemas"]["Error"] } };
    };
  };
  switchActiveTenant: {
    requestBody: {
      content: { "application/json": { tenant_id: string } };
    };
    responses: {
      200: { content: { "application/json": components["schemas"]["ActiveContext"] } };
      401: { content: { "application/json": components["schemas"]["Error"] } };
    };
  };
  switchActiveStore: {
    requestBody: {
      content: { "application/json": { store_id: string } };
    };
    responses: {
      200: { content: { "application/json": components["schemas"]["ActiveContext"] } };
      409: { content: { "application/json": components["schemas"]["Error"] } };
    };
  };
  clearActiveStore: {
    responses: {
      204: { content?: never };
      401: { content: { "application/json": components["schemas"]["Error"] } };
    };
  };
}

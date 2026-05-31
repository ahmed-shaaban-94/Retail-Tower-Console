/**
 * Generated-client entry point (D-2 / D-7).
 *
 * This is the ONLY Data-Pulse-2 call surface in the console (Principle 8,
 * AC-002-5). Hand-written `fetch()`/`axios` against Data-Pulse-2 paths is
 * forbidden anywhere else in `src/` — every per-family slice imports this
 * typed client instead.
 *
 * Transport (C-2): `credentials: "include"` makes the browser attach the
 * `dp2_session` HttpOnly cookie automatically on same-origin requests.
 * JavaScript never reads the cookie; no `Authorization: Bearer` header is
 * attached (the bearer scheme is for POS-Pulse / server-to-server).
 *
 * `paths` is imported from ./schema.d.ts, which is generated from the
 * Data-Pulse-2 auth/context OpenAPI contracts pinned to 62d0906.
 * This file is unchanged by regeneration.
 */
import createClient from "openapi-fetch";
import type { paths } from "./schema";

/**
 * Base URL for Data-Pulse-2. Same-origin in production so the session
 * cookie is sent; overridable at build time via VITE_API_BASE_URL for
 * local dev against a proxy. No secret or environment value is committed
 * (C-8) — this reads an env var that defaults to same-origin.
 */
const baseUrl = import.meta.env?.VITE_API_BASE_URL ?? "/";

export const apiClient = createClient<paths>({
  baseUrl,
  credentials: "include",
});

export type ApiClient = typeof apiClient;

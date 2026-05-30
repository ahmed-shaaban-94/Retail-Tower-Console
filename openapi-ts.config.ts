// D-2 / C-4: Generated OpenAPI client toolchain configuration.
//
// This declares HOW the typed client is produced from Data-Pulse-2's
// OpenAPI contracts, pinned to commit SHA `62d0906` (C-4). It does NOT
// run automatically — `pnpm generate:client` invokes it.
//
// ┌─────────────────────────────────────────────────────────────────┐
// │ STATUS: toolchain configured; output STUBBED.                     │
// │ Data-Pulse-2 is a separate private repo, not reachable from this  │
// │ workspace. `src/generated/schema.d.ts` is a hand-checked,         │
// │ minimal STUB covering RF-1's seven operations so the build/tests  │
// │ are green. When the contracts are reachable, run:                 │
// │                                                                   │
// │   pnpm generate:client                                            │
// │                                                                   │
// │ to replace the stub with the real generated types pinned to       │
// │ `62d0906`. The stub is types-only; all calls route through        │
// │ openapi-fetch in src/generated/client.ts (Principle 8, AC-002-5). │
// └─────────────────────────────────────────────────────────────────┘

/**
 * Data-Pulse-2 pin (C-4). The generator reads OpenAPI sources from this
 * commit. Sources live in `packages/contracts/openapi/` upstream:
 *   - auth.openapi.yaml     (signIn, signOut, refreshSession)
 *   - context.openapi.yaml  (getActiveContext, switch/clear context)
 */
export const DATA_PULSE_2_PIN = "62d0906" as const;

/**
 * The OpenAPI sources consumed at this slice's RF-1 boundary.
 * (See specs/001-console-foundation/contracts/rf1-auth-context.md.)
 * Paths are relative to the Data-Pulse-2 repo root at the pinned SHA.
 */
export const OPENAPI_SOURCES = [
  "packages/contracts/openapi/auth.openapi.yaml",
  "packages/contracts/openapi/context.openapi.yaml",
] as const;

/**
 * Where openapi-typescript writes the schema types (D-7). Committed,
 * not .gitignore'd, so CI is reproducible without running the generator.
 */
export const OUTPUT_PATH = "src/generated/schema.d.ts" as const;

/**
 * Console-originated requests use the dp2_session cookie automatically
 * (C-2). No Authorization: Bearer plumbing. openapi-fetch sends
 * credentials same-origin; see src/generated/client.ts.
 */
export const CREDENTIALS_MODE = "include" as const;

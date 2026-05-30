# Slice 002 — Consumption Contract (what the scaffold + CI must enforce)

**Feature**: 002-tooling-and-scaffold
**Phase**: 1 — Design
**Date**: 2026-05-30

---

## What this folder is (and is not)

This slice **exposes no external API** — it is a build/tooling slice with
no runtime endpoints. So there are no request/response contracts here.

What it *does* define is the **consumption contract**: the rules the
generated-client toolchain (D-2) and the CI workflow (D-6) must enforce
so that every downstream per-family slice (003..009) consumes
Data-Pulse-2 the one permitted way. This mirrors the foundation
`contracts/README.md` policy — it references upstream, never inlines it.

> **Constitution anchor.** This repo never authors OpenAPI contracts
> (Principles 2, 6, 8). The generated client is a *derivation* of
> Data-Pulse-2's contracts pinned at SHA `62d0906`, not a contract source.

---

## C-1 — Generated client is the only Data-Pulse-2 call surface

- All Data-Pulse-2 calls go through the typed `openapi-fetch` client at
  `src/generated/client.ts` (D-2, D-7).
- **Forbidden:** any hand-written `fetch(`, `axios`, or `XMLHttpRequest`
  targeting a Data-Pulse-2 path anywhere in hand-written `src/`
  (Principle 8, AC-002-5). CI lint/grep enforces this.

## C-2 — Pinned source, vendored output

- The generator (`openapi-ts.config.ts`) pins Data-Pulse-2 OpenAPI to SHA
  **`62d0906`** (C-4). "Always latest main" is forbidden.
- The output (`src/generated/schema.d.ts`, `client.ts`) is **committed**
  (not `.gitignore`d) so CI is reproducible without running the generator
  (D-7).
- Regeneration is a deliberate, reviewed change (foundation R-2/R-9
  re-verification policy); cadence/automation is out of slice 002 scope.

## C-3 — Cookie transport, no bearer

- The client relies on the browser sending the `dp2_session` HttpOnly +
  Secure + SameSite=Lax cookie automatically on same-origin requests
  (C-2). JavaScript never reads the cookie.
- **Forbidden:** `Authorization: Bearer` header plumbing on
  console-originated calls (the bearer scheme in Data-Pulse-2's
  `auth.openapi.yaml` is for POS-Pulse / server-to-server use).
- A future Data-Pulse-2 endpoint *may* require a double-submit CSRF token
  (OQ-002-2, partially resolved); D-1's framework can add that header
  if/when a contract requires it. No CSRF plumbing is needed against the
  current contract surface.

## C-4 — Test isolation

- Tests (Vitest D-3, Playwright D-4) MUST NOT depend on a live
  Data-Pulse-2 (C-5). They mock the generated client (with per-slice mock
  approval per Maestro playbook §Mock rule). Slice 002 commits **no**
  mocks itself — only the harness that *can* mock.

## C-5 — api-readiness sync obligation

- When the implementation introduces the toolchain, it MUST promote the
  foundation `api-readiness.md` §Cross-cutting "Generated-client toolchain
  + storage location" row from `deferred` to
  `openapi-typescript + openapi-fetch / src/generated/`, **in the same
  commit** (AC-002-7, FR-002-004). This is the *only* permitted change to
  a `specs/001-console-foundation/` file (AC-002-8).

---

## Upstream references (never inlined)

- Data-Pulse-2 `main` @ `62d0906` — OpenAPI source of truth.
- Consumed surfaces verified in
  [`../../001-console-foundation/api-readiness.md`](../../001-console-foundation/api-readiness.md).
- RF-1 operations slice 003 will consume via this toolchain:
  [`../../001-console-foundation/contracts/rf1-auth-context.md`](../../001-console-foundation/contracts/rf1-auth-context.md).

---

**End of Slice 002 Consumption Contract.**

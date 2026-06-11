# Draft D8 — Console Switches to Provider-Auth Login (DP-2 resolves identity, issues the cookie)

> **DRAFT — NOT DISPATCHED.** Planning artifact under docs-only Orchestrator. No implementation, no contract, no migration, no gate mutation. Requires explicit scoped owner approval + G10 verification before any sibling-repo dispatch.

**Status:** SPECIFY-ONLY / DRAFT — for owner review. **Date:** 2026-06-11. **Owning repo:** Retail-Tower-Console (the dispatch target; the remediation contract is DP-2-led — see §0). **Deciders:** Owner (Ahmed Shaaban).

**Gating:** **gated — requires owner approval + G10 verification before any dispatch.** This is an auth/identity touching follow-up, so **G10** (Identity & Access Boundary Gate) is a hard gate; it additionally depends on **D3** (DP-2 `IdentityProviderPort` + provider-neutral identity link) and a **Console re-pin off the pre-008 DP-2 client** (`DATA_PULSE_2_PIN = 62d0906`).

**Relation to 028:** This realizes the **Console half of 028 §8 "First login"** and the **§7 "Console login" route row** under the **§16 provider-independence** model — Console moves from a DP-2-verified password to a provider-authenticated identity that DP-2's `verifyIdentityToken` (§16) resolves. 028 owns the boundary (authn separated from authz, identity owned by the external provider, authorization owned by DP-2); this draft conforms to it and does not re-open it. It is **downstream of 028 / G10**, never a re-specification of 028.

> ### authoring & placement notes (owner can redirect)
>
> - **Docs-only, no `.specify/` tooling.** This repo has no `.specify/` state, so the speckit template-copy / `feature.json` / branch steps no-op; this file was authored as a **draft following speckit structure**, mirroring `docs/specs/028-*/spec.md`. No kernel mutation, no Queue Item advanced — this is planning prose that *feeds* a future G10-gated Queue Item, it does not advance the kernel queue ("prose is not evidence").
> - **Draft surface only.** Written under `docs/specs/drafts/028-followups/d8-console-provider-auth/`. No file in any sibling implementation repo is created or edited (that would be stop-condition SC-04/SC-05). No `docs/gates/**`, `docs/kernel/**`, `docs/status/**`, 028/029 spec, README, or CLAUDE.md is touched.
> - **Ownership-vs-symptom (recorded, per the drift map).** The drift is **OBSERVED in Console** (it posts email+password today, E-1) but the **remediation is DP-2-LED**: the provider token has nowhere to be exchanged until DP-2 ships the §16 adapter (`verifyIdentityToken`) — i.e. **D3**. So D8 is carried as Console's item with a DP-2-led prerequisite, not a fabricated DP-2 row (`auth-028-drift-map.md` cross-repo observations).
> - **Boundary pre-emption.** Console reaching its own auth provider for human authentication is **sanctioned egress** (028 §0; Orchestrator CLAUDE.md: "Retail-Tower-Console: Data-Pulse-2 contracts only — plus its own auth provider"). Provider-auth login therefore does **not** breach "Data-Pulse-2 is the boundary": no business/catalog/inventory/sales data transits any path other than DP-2; only the human-authn handshake reaches the provider.

---

## Clarifications

### Session 2026-06-11

- Q: Who verifies the provider identity token — Console or Data-Pulse-2? → A: **Data-Pulse-2** — Console performs provider *authn* and presents the resulting identity token to DP-2; DP-2's `verifyIdentityToken` (§16) resolves the user and issues the cookie. Console never verifies the token nor holds provider admin secrets (028 §5 "Human identity" row authority=external provider, runtime=DP-2 authz; §16; SR-3).
- Q: Does the `dp2_session` cookie transport change? → A: **No** — the cookie is already HttpOnly + Secure + SameSite=Lax, `credentials: "include"`, no Authorization bearer, no CSRF header (E-2). Only the *credential proving who the human is* changes (password → provider token); the session-issuance + transport seam is unchanged. 028 §6 already classifies the Console session as cookie transport, target-shaped.
- Q: What is the operator-resolution join key after the switch? → A: **The DP-2 provider-neutral identity link** (`provider_key`/`issuer`/`subject` → `user_id`); `clerk_user_id` is a **bridge column behind it**, not the long-term join key (028 OQ-6 RESOLVED; §16). This is precisely the seam D3 introduces — D8 keys off it.
- Q: Does anything downstream of sign-in (membership chooser, active-context switch, the 401 reactive-refresh interceptor) change? → A: **No** — those already match target and stay. The membership-count branch (0→no-access / 1→auto-select / >1→chooser), `getActiveContext` as source of truth, and refresh-once-on-401 are unchanged (E-2; Console RF-1). D8 is scoped to the *authn handshake only* — the DAG note is explicit that "the rest of Console user/role/store/device admin is NOT gated on D3."
- Q: Does Console keep verifying or storing cloud passwords after the switch? → A: **No** — passwords/MFA/email-verification move to the external provider; Console never stores or verifies a cloud password, and DP-2's custom password path is retired for human login as part of the DP-2-led D3/D8 slice (028 G-8, N-2, SR-1). The legacy DP-2 password reset endpoints (`requestPasswordReset`/`confirmPasswordReset`, present at the pin, E-3) are superseded by provider-driven reset (028 §11).
- Q: Is provider migration (Clerk → Auth0/Keycloak/OIDC) in scope for this Console switch? → A: **No** — provider migration is architecture-readiness only, not build scope (028 OQ-7 RESOLVED). D8 adopts whatever single provider DP-2's §16 adapter resolves; Console depends on the *neutral* contract shape, not a provider-specific one.

---

## Evidence basis (verified this session, `origin/main`, 2026-06-11)

| Repo | `origin/main` HEAD | What was read |
|---|---|---|
| Retail-Tower-Console | `97a7d42` (#33) | `src/auth/signin-flow.ts`, `src/auth/SignIn.tsx`, `src/lib/client.ts`, `src/lib/auth-interceptor.ts`, `openapi-ts.config.ts`, `specs/001-console-foundation/contracts/rf1-auth-context.md` |
| Data-Pulse-2 | `0c57fed` substantive / `6588e86` badge (the auth authority); client pinned at `62d0906` | `packages/contracts/openapi/auth.openapi.yaml` **@ the Console pin `62d0906`** (the pre-008 client surface Console consumes) |
| Retail-Tower-Orchestrator | `main` (clean) | `docs/specs/028-*/spec.md` §5/§6/§7/§8/§11/§16; `docs/roadmap/auth-028-drift-map.md` (D3, D8 rows + DAG + build order); `docs/gates/cross-repo-gates.md` (G10) |

Load-bearing **current-runtime** facts (kept distinct from *target* and *open decisions*):

- **E-1 (Console human login is password-based today).** `src/auth/SignIn.tsx` collects `email` + `password` from an uncontrolled native form and calls `signIn({ email, password })`; `src/lib/client.ts` `signIn()` posts to **`POST /api/v1/auth/signin`**; `src/auth/signin-flow.ts` renders the generic failure "Sign-in failed. Check your email and password, then try again." **No external identity provider is in the login loop** — Console sends a password straight to DP-2.
- **E-2 (cookie transport already matches target).** `openapi-ts.config.ts` documents `CREDENTIALS_MODE = "include"`, "Console-originated requests use the `dp2_session` cookie automatically … No `Authorization: Bearer` plumbing", and the cookie is HttpOnly + Secure + SameSite=Lax (Console RF-1 contract). `src/lib/auth-interceptor.ts` does **reactive** refresh-once on 401 (no timer/focus refresh). The session transport seam is target-shaped — **only the credential that proves identity diverges.**
- **E-3 (DP-2 owns password authn at the consumed pin — no provider-token op exists there).** At the Console pin `62d0906`, `auth.openapi.yaml` `SignInRequest` requires `email` + `password` (`minLength: 8`); it ships `requestPasswordReset` / `confirmPasswordReset` (`new_password minLength: 12`) and email-verify ops; `security: [cookieAuth]` (`dp2_session`). There is **no** `verifyIdentityToken` / provider-identity-token exchange operation at this pin — confirming there is nowhere to present a provider token until D3 lands and Console re-pins.
- **E-4 (Console is pinned to a pre-008 DP-2 client — the re-pin prerequisite, invisible from the DP-2 side).** `openapi-ts.config.ts` hard-codes `export const DATA_PULSE_2_PIN = "62d0906"` and notes "The pin is **UNCHANGED** across slices." Adopting any §16 provider-auth contract requires Console to **re-pin off `62d0906`** to a DP-2 SHA that carries the D3 adapter contract and **regenerate** `src/generated/schema.d.ts`. This prerequisite is owned entirely on the Console side and is not observable from DP-2.

---

## 1. Summary

Today Retail-Tower-Console authenticates a human by sending **email + password** directly to Data-Pulse-2's `POST /api/v1/auth/signin`; DP-2 verifies the password (argon2id, custom credential store) and sets the `dp2_session` HttpOnly cookie (E-1, E-3). No external identity provider participates in the Console login loop.

028 §8/§16 places **human identity proof with the external identity provider** and **business authorization with DP-2**. The target login flow is: **Console performs provider authentication → Console presents the resulting provider identity token to DP-2 → DP-2's `verifyIdentityToken` (§16) resolves the user via the provider-neutral identity link → DP-2 issues the same `dp2_session` cookie.**

The **cookie transport already matches the target** (E-2): HttpOnly cookie, `credentials: "include"`, reactive 401-refresh, membership-chooser branch on sign-in response — **all of that stays.** The **only** divergence is the credential the human presents: a password verified by DP-2 today, vs. a provider-authenticated identity token DP-2 resolves at the target. This draft specifies that one seam — the authn switch — and nothing else.

This is a narrow leaf of the 028 boundary, deliberately scoped tight: it does **not** re-spec DP-2's adapter (that is **D3**'s spec), and it does **not** touch Console's user/role/store/device admin surfaces (the DAG verified those are **not** gated on D3).

## 2. Goals

- **G-1.** Replace Console's email+password login (E-1) with **provider authentication** — Console authenticates the human against the external identity provider's frontend/identity surface (sanctioned egress, 028 §0), never holding provider admin secrets (SR-3).
- **G-2.** Exchange the provider identity token at DP-2: Console **presents** the token; **DP-2 `verifyIdentityToken` resolves the user** (via the §16 provider-neutral identity link) and **issues the `dp2_session` cookie** — authn-vs-authz separation preserved (028 G-1).
- **G-3.** **Preserve the cookie transport and every downstream session behavior unchanged** (E-2): HttpOnly + Secure + SameSite=Lax cookie, `credentials: "include"`, reactive refresh-once-on-401, the membership-count branch (0/1/>1), and `getActiveContext` as the source of truth.
- **G-4.** Resolve the operator off the **provider-neutral identity link** (`provider_key`/`issuer`/`subject`), with `clerk_user_id` reclassified as a bridge column (028 OQ-6; the D3 seam).
- **G-5.** **Retire the cloud password from Console** — no password collected, stored, or verified client-side; password/MFA/email-verification become provider-owned, with reset provider-driven (028 G-8, N-2, §11).
- **G-6.** Keep refusal messages **non-enumerating** (no account-existence / membership / eligibility leak), surfacing only a `request_id` for support (028 SR-6; preserve the current generic-error posture in `signin-flow.ts`).
- **G-7.** Depend only on the **provider-neutral** contract shape from DP-2, so a future provider migration is a DP-2 adapter change with **no rewrite of Console access rules** (028 §16, OQ-7).

## 3. Non-goals

- **N-1.** No code, generated client, OpenAPI, migration, package/lock, CI, runtime-config, secret, env, or deployment change in this task. (Orchestrator is docs-only; this is SPECIFY-ONLY / DRAFT.)
- **N-2.** **No DP-2 adapter design here.** The `IdentityProviderPort` / `verifyIdentityToken` / provider-neutral identity link is **D3**'s spec. D8 consumes D3's contract; it does not define it.
- **N-3.** No change to Console user invite/create/disable/restore, role/store-access management, POS-eligibility, device management, or audit/support views — the DAG verified these are **not** gated on D3 and are out of D8's seam.
- **N-4.** No change to the `dp2_session` cookie transport, the 401 reactive-refresh interceptor, the membership chooser, or active-context switching (E-2 — already target-shaped).
- **N-5.** No second provider integration / provider migration build (028 OQ-7 — architecture-readiness only).
- **N-6.** No offline behavior. Console is an online admin SPA (028 §6 marks its session "n/a — online admin tool"); there is no offline login path to specify.
- **N-7.** No custom password database retained for human login. Cloud passwords move to the provider (028 N-2). (Whether a *transitional* password fallback is kept during cutover is an open question, OQ-3 — not auto-decided.)
- **N-8.** No POS / sale-sync / Connector surface. D8 is the Console human-login authn switch only.

## 4. Actors

| Actor | Role in D8 |
|---|---|
| **Tenant admin / store manager / support operator** | The humans who sign in to Console; after D8 they authenticate via the provider, not a DP-2 password. |
| **Retail-Tower-Console (the SPA)** | Performs provider authn (frontend/identity surface), presents the provider identity token to DP-2, consumes the `dp2_session` cookie + membership list. Holds **no** provider admin secret. |
| **Data-Pulse-2 (the authority — D3-led)** | Verifies the provider token (`verifyIdentityToken`), resolves the user via the provider-neutral link, issues `dp2_session`. (Specified by D3, not here.) |
| **External identity provider** | Authenticates the human (password/MFA/email verification). Today: Clerk (028 E-3); D8 depends on the neutral shape, not the provider. |

## 5. The authn seam (the one thing D8 changes)

> Technology described at spec altitude — **no code, no contract bytes, no field shapes.** The field/operation shapes are D3's contract (DP-2) once it exists.

**Current (E-1 / E-3):**
```
Console:  email + password  ──► DP-2 POST /api/v1/auth/signin (verifies password, argon2id)
                                 └─► Set-Cookie: dp2_session  +  { user, memberships } body
```

**Target (this draft):**
```
Console:  provider authn (provider frontend/identity surface — sanctioned egress)
            └─► provider identity token
                  ──► DP-2 token-exchange entry point (verifyIdentityToken, §16 — D3-owned)
                        └─► DP-2 resolves user via provider-neutral identity link
                              └─► Set-Cookie: dp2_session  +  { user, memberships } body  (unchanged shape/transport)
```

**Invariants held across the switch (all already true — E-2):**
- The session is a **DP-2-issued HttpOnly cookie**, not a client-held bearer; `credentials: "include"`; no Authorization header; no CSRF header.
- The sign-in success body still drives the **membership-count branch** (0 → no-access, 1 → auto-select, >1 → chooser).
- 401 handling stays **reactive refresh-once**; `getActiveContext` stays the source of truth.
- Refusals stay **non-enumerating** with a `request_id` for support.

**What moves:** the *credential proving identity* (DP-2-verified password → provider-verified identity token) and the *party that verifies it* (DP-2 password check → DP-2 `verifyIdentityToken` against the provider-neutral link). **What does not move:** everything downstream of cookie issuance.

## 6. Console-side change surface (post-dispatch, for the owning repo)

> Named at boundary altitude so the eventual Console spec can plan against it. **Not** authored or implemented here.

- **6.1 Re-pin + regenerate (the prerequisite, E-4).** Move `DATA_PULSE_2_PIN` off `62d0906` to the DP-2 SHA that carries D3's §16 contract; regenerate `src/generated/schema.d.ts`. Until this happens there is no `verifyIdentityToken` operation in the generated client to call.
- **6.2 Sign-in surface (`SignIn.tsx` / `signin-flow.ts`).** Replace the email+password form with the provider authn entry; the *resolution logic* (membership-count branch, generic non-enumerating error, 429 retry-after) is **preserved** — only its trigger changes from a password POST to a token exchange.
- **6.3 Client wrapper (`lib/client.ts`).** The `signIn` wrapper's transport (cookie, `{ status, data, error }` shape) is unchanged; the body it sends changes from `{ email, password }` to the provider-token exchange the regenerated client exposes.
- **6.4 Password retirement.** Remove client password collection/handling for human login (G-5); the legacy DP-2 password-reset surfaces (E-3) are no longer consumed by Console.
- **6.5 Untouched.** `auth-interceptor.ts`, the active-context provider, the membership chooser, and all RF-2…RF-7 admin surfaces stay as-is (N-3, N-4).

## 7. Acceptance criteria

- **A-1.** Console no longer collects, stores, or transmits a cloud password for human login; provider authentication is the sole human-authn path (G-1, G-5). *(Test: no password field reaches DP-2; no password persisted client-side.)*
- **A-2.** Console **presents** a provider identity token and **DP-2** (not Console) resolves the user and issues the cookie (G-2). *(Test: Console holds no provider verification secret; cookie originates from DP-2's token-exchange response.)*
- **A-3.** The `dp2_session` cookie transport is byte-for-byte unchanged in posture — HttpOnly + Secure + SameSite=Lax, `credentials: "include"`, no bearer, no CSRF header (G-3, E-2). *(Test: transport assertions from the current RF-1 contract still pass.)*
- **A-4.** Operator resolution keys off the **provider-neutral identity link**, not `clerk_user_id` directly (G-4). *(Test: a user with a neutral link but a stale/absent `clerk_user_id` still resolves; verified against D3's contract.)*
- **A-5.** Membership-count branching, active-context switching, and reactive 401-refresh behave identically to today (G-3). *(Test: existing RF-1 journey/unit suites pass unmodified in intent.)*
- **A-6.** Refusals remain non-enumerating with only a `request_id` exposed (G-6). *(Test: no account-existence/membership/eligibility leak in any client-visible message.)*
- **A-7.** Console depends only on the provider-neutral contract shape — no provider-specific field/scheme name leaks into Console's long-term code (G-7, 028 §16). *(Test: a provider swap at DP-2 requires no Console access-rule change.)*
- **A-8.** No forbidden file was edited and no implementation was performed in producing this draft (it is docs-only). *(Test: only files under this draft folder were created.)*

## 8. Dependencies & sequencing

This item is **double-gated** — both prerequisites must be satisfied before any dispatch, on top of the standing G10 gate.

- **G10 — Identity & Access Boundary Gate (hard gate).** Producer: Orchestrator **028** (merged on `main`, PR #85 / `76cfcc3`, per `cross-repo-gates.md`). Every auth/identity/access-touching spec must list G10; D8 touches human identity and so consumes G10. The residual plan-phase 028 OQs (OQ-2/3/4/9/11) are **non-blocking** for G10 and do not bear on a Console login switch.
- **D3 — DP-2 provider-neutral identity link + `IdentityProviderPort` (foundation; DP-2-led).** DAG edge **`D3 ──► D8` (VERIFIED)** in `auth-028-drift-map.md`. D8 cannot exchange a provider token until `verifyIdentityToken` + the neutral identity link exist on DP-2 (E-3 confirms neither is present at the consumed pin). The drift-map note scopes the edge precisely: *only the authn switch is gated on D3; the rest of Console admin is not.*
- **Console re-pin off `62d0906` (Console-owned prerequisite, E-4).** Invisible from the DP-2 side: Console is pinned to a **pre-008** generated client (`DATA_PULSE_2_PIN = 62d0906`) and **must re-pin + regenerate** before any §16 provider-auth contract is callable from the generated client. This is sequenced *after* D3 publishes the contract and *before* the Console authn-switch implementation.
- **Build order:** drift-map recommended order places D8 at **#6** — after D3 (#1) and parallel-independent of the DP-2 sale-sync spine (D1/D2/D4/D5/D7) and the Connector side-branch (D9/D10). D8 does **not** depend on D1/D5 (those carry the POS `pos_operator` envelope, irrelevant to Console human login).

**DAG (this item's neighborhood):**
```
028  ──produces──►  G10  ──gates──►  D8
D3 (DP-2 identity link + IdentityProviderPort)  ──VERIFIED──►  D8  (authn switch only)
Console re-pin off 62d0906 (E-4)               ──prerequisite──►  D8  (Console-owned, post-D3-contract)
```

## 9. Open questions (carried forward / genuinely open)

> 028 plan-phase OQs **OQ-2/3/4/9/11** are POS/offline/break-glass concerns and **do not bear on a Console login switch** — not carried here, not auto-decided. The questions below are the genuinely-open ones this draft surfaces; none is auto-decided.

- **OQ-D8-1 (provider authn surface).** Does Console use the provider's **hosted login page (redirect)** or an **embedded provider SDK widget** for the authn step? Both satisfy "sanctioned egress to the provider frontend/identity surface"; the choice affects Console's sign-in UX and CSP, and is a Console plan-phase decision — not a boundary decision.
- **OQ-D8-2 (cutover of existing password users).** How are users who only have a DP-2 password today migrated to a provider identity — invite-to-link, forced provider enrollment at next login, or admin-driven bulk link? Touches 028 §8 lifecycle and the D3 identity-link backfill; co-owned with D3, owner-decided.
- **OQ-D8-3 (transitional password fallback).** Is a DP-2 password fallback kept **during** the cutover window (dual authn), or is the switch a hard cutover? Affects N-7 and the retirement of DP-2's custom password path; owner-decided, not assumed.
- **OQ-D8-4 (sanctioned-egress list update).** If the chosen provider authn surface introduces a new remote target for Console beyond "its own auth provider," the Orchestrator CLAUDE.md allowed-egress set must be updated first (028 §0). Confirm the provider endpoint is within the already-sanctioned "Console → its own auth provider" allowance.

---

> **Docs-only record (SPECIFY-ONLY / DRAFT).** This draft records the Console authn-switch seam and its gating; it implements nothing, defines no contract, creates no migration, and mutates no gate or kernel state. No implementation is dispatched from it without explicit, scoped owner approval **after G10 verification and D3 landing**, and after the Console re-pin prerequisite is sequenced. Verified against `origin/main` HEADs as of 2026-06-11; re-verify if the repos move.

# Requirements Checklist — Draft D8 Console Provider-Auth Login

> **DRAFT — NOT DISPATCHED.** Planning artifact under docs-only Orchestrator. No implementation, no contract, no migration, no gate mutation. Requires explicit scoped owner approval + G10 verification before any sibling-repo dispatch.

**Purpose:** Validate that the D8 draft is scoped to the Console authn-switch seam, evidence-grounded on `origin/main`, correctly double-gated (G10 + D3 + re-pin), and free of forbidden side effects before it is used to plan any follow-up implementation.
**Created:** 2026-06-11
**Spec:** [../spec.md](../spec.md)
**Mode:** SPECIFY-ONLY / DRAFT (Orchestrator docs-only).

> A checked box means the draft text already satisfies the item, citing the section that satisfies it. Items depending on an owner decision are flagged and point at the relevant open question.

## Scope & framing

- [x] **Scoped to one seam** — the draft changes only the authn handshake (password → provider token; DP-2 verifies and issues the cookie), not Console admin surfaces or DP-2's adapter. *(§1; §5; N-2/N-3.)*
- [x] **Leaf-not-umbrella discipline** — mirrors 028 *style* but not its project-wide *scope*; explicitly defers DP-2 adapter design to D3 and excludes user/role/store/device admin (DAG: "not gated on D3"). *(§0 ownership note; §1; N-2/N-3; §8.)*
- [x] **Non-goals prevent scope creep** — explicit N-1…N-8, including "no implementation," "no DP-2 adapter design here," and "no offline behavior." *(§3.)*
- [x] **Scope is clearly bounded** — SPECIFY-ONLY / DRAFT; target vs current (E-1…E-4) vs open (OQ-D8-*) kept distinct. *(header; §5; §9.)*
- [x] **Ownership-vs-symptom recorded** — observed in Console, remediation DP-2-led (the §16 adapter = D3). *(§0 authoring notes; Relation-to-028 line.)*

## Requirement quality

- [x] **No implementation masquerading as requirements** — implementation appears only as *current runtime evidence* (E-1…E-4) or as the architecture invariant (the cookie/transport seam), each labeled; the §5 seam is described at spec altitude, no code/contract bytes. *(Evidence basis; §5; §6.)*
- [x] **Requirements are testable** — goals (G-1…G-7) and acceptance criteria (A-1…A-8) are individually checkable, each with a test note. *(§2; §7.)*
- [x] **Dependencies & assumptions identified** — the double prerequisite (D3 + Console re-pin) plus G10 are first-class; the evidence table pins each repo's `origin/main` HEAD and the consumed `62d0906` client pin. *(Evidence basis; §8.)*

## Journeys covered

- [x] **Human sign-in journey** — provider authn → present token → DP-2 `verifyIdentityToken` resolves → `dp2_session` issued → membership-count branch (0/1/>1) unchanged. *(§5; §6.2; A-2/A-5.)*
- [x] **Session continuity** — cookie transport, reactive 401-refresh, and active-context switching preserved across the switch. *(§5 invariants; G-3; A-3/A-5.)*
- [x] **Identity-resolution journey** — operator resolved off the provider-neutral link, `clerk_user_id` as bridge column. *(§2 G-4; A-4; clarifications.)*

## Offline behavior

- [x] **Offline is correctly N/A** — Console is an online admin SPA (028 §6 marks its session "n/a — online admin tool"); there is no offline login path, stated as N-6 rather than left ambiguous. *(N-6; §4.)*

## Security boundaries

- [x] **Sanctioned-egress objection pre-empted** — Console → its own auth provider is sanctioned egress (028 §0 / Orchestrator CLAUDE.md); no business data leaves the DP-2 path. *(§0 boundary pre-emption; OQ-D8-4.)*
- [x] **No provider admin secret in Console** — Console performs frontend/identity authn only; DP-2 verifies the token (SR-3). *(§2 G-1/G-2; §4; A-2; clarifications Q1.)*
- [x] **Authn-vs-authz separation preserved** — provider proves identity; DP-2 owns authorization and issues the cookie (028 G-1). *(§1; §5; A-2.)*
- [x] **Non-enumerating refusals retained** — generic error + `request_id` only, no account-existence/membership/eligibility leak (028 SR-6). *(G-6; A-6; preserves current `signin-flow.ts` posture.)*
- [x] **Credential scopes not interchangeable** — the Console session is a DP-2-issued cookie, never a client-held bearer; the provider token is identity proof only, exchanged once. *(§5 invariants; 028 SR-10.)*
- [x] **No cloud-password retention in Console** — passwords move to the provider; reset is provider-driven (028 G-8/N-2/§11). *(G-5; §6.4; A-1; N-7 with transition flagged OQ-D8-3.)*

## Provider independence

- [x] **Provider independence explicit** — Console depends only on DP-2's provider-neutral contract shape (the D3 seam); no provider-specific field/scheme leaks into Console's long-term code. *(§2 G-7; A-7; clarifications Q6.)*
- [x] **Migration must not require rewriting Console access rules** — a provider swap is a DP-2 adapter change (028 §16, OQ-7). *(G-7; N-5; A-7.)*

## Evidence discipline (SC-09)

- [x] **Current runtime evidence reflected without assuming unverified work** — Console password login verified on `origin/main` `97a7d42` (E-1: `SignIn.tsx`/`signin-flow.ts`/`lib/client.ts` → `POST /api/v1/auth/signin`); cookie transport (E-2: `openapi-ts.config.ts` `CREDENTIALS_MODE="include"`, no bearer); DP-2 password authn at the consumed pin (E-3: `auth.openapi.yaml` @ `62d0906`, `SignInRequest` email+password, no `verifyIdentityToken`); the re-pin prerequisite (E-4: `DATA_PULSE_2_PIN = 62d0906`). *(Evidence basis.)*
- [x] **Target defined without hardcoding the stale model** — current (password, E-1/E-3), target (provider token → DP-2 `verifyIdentityToken` → cookie), and open cutover questions (OQ-D8-2/3) kept distinct; the password path is recorded as drift, not blessed. *(§5; §9.)*
- [x] **No unverified status claimed as fact** — `verifyIdentityToken` and the neutral identity link are recorded as **absent at the consumed pin** (E-3) and owned by D3, not assumed shipped; G10 producer cited with PR #85 / `76cfcc3`. *(Evidence basis; §8.)*
- [x] **No fabricated DP-2 row** — the DP-2-led remediation is referenced as D3's responsibility, not duplicated as a D8 design. *(§0; N-2; §8.)*

## Gating discipline

- [x] **G10 listed among gates** — auth/identity-touching draft labeled "gated — requires owner approval + G10 verification before any dispatch." *(header Gating line; §8.)*
- [x] **Double prerequisite first-class** — D3 (DP-2-led) and the Console re-pin off `62d0906` (Console-owned, invisible from DP-2) each get their own dependency line + DAG edge. *(§8; E-4.)*
- [x] **028 is the input boundary that PRODUCES G10, not re-specified** — D8 is a downstream consumer of G10; 028 is referenced, never edited. *(Relation-to-028 line; §0; §8.)*
- [x] **Build-order position recorded** — D8 = #6 in the drift-map recommended order, after D3, independent of the DP-2 sale-sync spine and Connector side-branch. *(§8.)*

## Forbidden-files / process compliance

- [x] **No forbidden files edited** — only `docs/specs/drafts/028-followups/d8-console-provider-auth/spec.md` and this checklist were **created**. No file in any sibling implementation repo (Data-Pulse-2, POS-Pulse, Retail-Tower-Console, Connector) was created or edited (SC-04/SC-05). No `apps/**`, `packages/**`, migration, OpenAPI YAML, package/lock, CI, generated, secret, env, or deployment file anywhere. *(Confirmed by the authoring session.)*
- [x] **No existing Orchestrator file edited** — no `docs/gates/**`, `docs/kernel/**`, `docs/status/**`, 028/029 spec, README, or CLAUDE.md touched; only new files created in the draft folder. *(Confirmed.)*
- [x] **Sibling repos read-only** — all sibling evidence read via `git -C … show origin/main:<file>` (and at the pinned `62d0906` for the DP-2 client surface); no checkout/pull/merge/reset/stash; no working-tree read. *(Evidence basis.)*
- [x] **No git side effects** — nothing staged, committed, pushed, or PR'd; no `git add -A`/`git add .`; no branch switch (authored as a draft following speckit structure, not via `.specify/` tooling, which is absent here). *(Process.)*
- [x] **No secrets in output** — no raw tokens, keys, passwords, or attestation values reproduced; provider/DP-2 credentials referenced only by role. *(SR / N-1; confirmed.)*

## Notes / residual items (owner-facing, not blockers)

- **The drift (E-1) is recorded as content, not resolved** — resolving it is owner-gated future work (this draft) downstream of D3 and the Console re-pin (E-4).
- **OQ-D8-1…OQ-D8-4 are genuinely open** — provider authn surface (hosted vs embedded), existing-password-user cutover, transitional password fallback, and the sanctioned-egress list update are owner-decided, not auto-resolved here. *(§9.)*
- **This draft is not a kernel Queue Item** — it feeds a future G10-gated Queue Item only on owner approval; it does not advance or mutate the kernel queue.
- **Depth = SPECIFY+CLARIFY only** — no `plan.md` / `tasks.md` authored: D8's upstream (D3) is not built, so plan/tasks would be speculative. They are the owning repo's (Retail-Tower-Console) post-dispatch work once D3 lands and G10 is verified.

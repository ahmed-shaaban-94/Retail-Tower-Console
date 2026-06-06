# RF-5 Operator / Admin Management — Design Brief

> **Planning artifact. Authorizes no `src/` code.** Produced by `/impeccable shape`
> (register = **product**) to feed `specs/005-rf5-operator-admin` planning. It is
> **not** implementation, **not** the FR-005-014 API "mock", and **not** built or
> linted. It is DESIGN.md-grounded and extends slice 003's
> `docs/design/rf1-auth-shell/` mockups + `src/styles/tokens.css`. No library names
> appear in `spec.md` (AC-5); this brief lives outside the spec. Image-generation
> probes were skipped — this harness has no native image generation; the design is
> specified in tokens + structure (the appropriate fallback for a code-native UI).

## Register & theme (from DESIGN.md)

- **Register: product.** A dense administrative console, not marketing.
- **Theme: dark command room.** `--color-bg` (#0d1520) floor; `--color-surface`
  panels; **gold is scope-only** (DESIGN.md rule 1); **navy drives every action**
  (rule 2). RF-5 introduces no new color, space, radius, shadow, type, or motion
  value — it consumes the v0.1 tokens verbatim.

## Self-confirmed design direction (headless)

No human to confirm; the recommended direction is self-confirmed and recorded
here. Decisions baked in:

- **Member list = table, not cards.** DESIGN.md rule 7 (tables over cards for list
  data) and component `.data-table`. The membership graph is tabular data
  (identity, role, store-access, state) — a table is unambiguously correct.
- **Operators lives inside the app shell.** SF5-1..3 render in the existing SF-2
  shell content area (`src/shell/AppShell.tsx` `<main className="content">`),
  below the persistent gold scope header. Scope-before-action (rule 3): the table
  is always shown under the tenant scope it belongs to.
- **Invite + edit = side panel / drawer over the list, single primary.** One
  `.btn-primary` per context (rule 6): "Send invitation" on SF5-2, "Save changes"
  on SF5-3. The invite trigger on SF5-1 is the page-header action cluster
  (right-aligned, DESIGN.md Content Workspace).
- **Revoke = destructive confirm.** `.btn-destructive` with an explicit confirm
  step (rule: irreversible-ish soft delete). Never a one-click revoke in a row.
- **Errors = persistent banner + inline.** Rule 4 (persistent banners, not toasts).
  403/precondition-401/425 render as a persistent `.alert` banner; field-level
  400 (`validation_error`) renders inline via `InlineError`.
- **Accept-invitation = centered card on the command-room field.** Mirrors SF-1's
  one justified card use (slice 003 design). Public, standalone, no shell chrome.

## Surface-by-surface state matrix

Each surface is specified across the five states the tasks trace to
(default / empty / loading / error / success). All tokens are DESIGN.md v0.1.

### SF5-1 — Member list (`.data-table`)

| State | Design |
| --- | --- |
| default | `.data-table` with columns: Member (display_name over email, mono email in `--text-mono`), Role (`.badge--neutral`), Store access ("All stores" or "N stores" with id tooltip — OQ-3 ids not names), State (active, or `.badge--warning` "Revoked" when `revoked_at`). Page header: title "Operators" + subtitle (tenant name) + right-aligned "Invite member" `.btn-primary`. |
| empty | No members (only the current admin): centered muted text "No other members in this tenant yet." + the same Invite action. No decorative illustration (rule 7). |
| loading | Table header rendered; body shows skeleton rows (`--color-surface-raised` shimmer, motion respects `prefers-reduced-motion`). |
| error | Persistent `.alert--danger` banner above the table. 403 → "You do not have permission to view members." (permission). **Precondition 401** → route to scope chooser (not an error banner). `request_id` shown in `--text-mono` (FR-005-009). |
| success | After a mutation: the table re-fetches; a transient `.alert--success` confirms ("Invitation sent" / "Member updated" / "Member revoked"). Banner persists until dismissed (rule 4). |

### SF5-2 — Invite member (drawer, `--shadow-pane`)

| State | Design |
| --- | --- |
| default | Fields: Email (`.input`, type=email), Role (`.input` select), Store access (radio: All / Specific; Specific reveals a multi-select of store **ids** — OQ-3). One `.btn-primary` "Send invitation"; `.btn-secondary` "Cancel". |
| empty | n/a (form). |
| loading | "Send invitation" → disabled + spinner; `Idempotency-Key` generated once per submit; re-submit replays the same key (idempotent). |
| error | `400 validation_error` → inline `InlineError` on the offending field. `400 idempotency_key_*` → internal retry/regen (not user-facing). `403` → `.alert--danger` permission banner. `409 pending` → `.alert--warning` "An invitation is already pending for this email." `409 idempotency_key_conflict` → regenerate key + `.alert--danger` "Please retry." `425` → auto-retry after `Retry-After` (disabled submit + countdown, like SF-1's 429). |
| success | `201` (incl. `Idempotent-Replayed: true`) → close drawer, refresh SF5-1, `.alert--success`. |

### SF5-3 — Edit / revoke member (drawer)

| State | Design |
| --- | --- |
| default | Pre-filled Role + Store access (from `MembershipDetail`). One `.btn-primary` "Save changes". A separate, visually-isolated "Revoke membership" `.btn-destructive` (own section, top divider rule — no nested card, rule 5). |
| empty | n/a. |
| loading | Save / Revoke disabled + spinner during the call. |
| error | `404` (member gone / no access) → uniform `.alert--danger` "This member could not be found." (leak-avoidance, VD-5). `403` → permission banner. `request_id` in mono. |
| success | `200`/`204` → close drawer, refresh SF5-1, `.alert--success`. Revoke shows the member with a "Revoked" `.badge--warning` on the refreshed list. |
| revoke-confirm | Clicking "Revoke" opens a confirm step: "Revoke <name>'s membership? They lose access immediately." with `.btn-destructive` "Revoke" + `.btn-secondary` "Cancel". |

### SF5-4 — Accept invitation (public, centered card)

| State | Design |
| --- | --- |
| default | Centered `.card` on `--color-bg`; gold `TowerMark` lockup; "You've been invited to <tenant>." Fields: Display name + Password (`.input`, only if a new user). One `.btn-primary` "Accept invitation". |
| empty | n/a. |
| loading | Submit disabled + spinner during `acceptInvitation`. |
| error | `400` invalid/expired token → `.alert--danger` "This invitation link is invalid or has expired." Offer a link to sign-in. |
| success | `200` → session established → redirect into the RF-1 shell (SF-2) with the new tenant resolvable. |

## Binding-rule compliance (DESIGN.md §Design Rules)

| Rule | RF-5 honors it by |
| --- | --- |
| 1. Gold is authority, not decoration | Gold only on the inherited scope header + nav marker; no gold in the member table, badges, or buttons. |
| 2. Primary navy drives actions | Invite / Save use `.btn-primary` (navy); revoke uses `.btn-destructive` (red) — never gold. |
| 3. Scope before action | SF5-1..3 always render under the persistent gold scope header; precondition-401 routes to the scope chooser first. |
| 4. Persistent banners, not toasts | 403/409/425/success render as persistent `.alert`. |
| 5. No nested cards | Edit drawer groups role vs. revoke via `--color-surface-raised` + top divider, not a child card. |
| 6. Single primary per context | One `.btn-primary` per surface/drawer. |
| 7. Density over decoration | Member list is a table; empty state is text, no illustration. |
| 8. Flat by default | Drawers use `--shadow-pane`; table floor flat. |
| 9. Status colors contained | Semantic color only on the Revoked badge + alert banners. |
| 10. Touch-target floor 36px | All controls inherit `controls.css` geometry (≥36px). |

## Reuse of slice 003 assets

- Tokens: `src/styles/tokens.css` + `src/styles/controls.css` (verbatim).
- Components: `Banner` / `InlineError` (`src/components/`), `TowerMark`,
  the `.data-table` / `.btn-*` / `.alert` / `.badge` patterns from DESIGN.md.
- Mockup lineage: extends `docs/design/rf1-auth-shell/` (same dark-command-room
  field, same centered-card pattern for the public accept route).
- Shell: renders in the existing `AppShell` content area; un-gates the
  `Operators` nav entry.

## What this brief does NOT decide

- It names **no** router/state/data-fetching/form library (those are RF-1's,
  recorded in `plan.md`/`research.md`).
- It authorizes no `src/` file. The mechanical step (copying tokens into a
  component) is taken by the gated implementation.

---

**End of RF-5 Design Brief.**

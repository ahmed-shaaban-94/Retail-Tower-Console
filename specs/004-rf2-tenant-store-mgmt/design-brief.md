# RF-2 Design Brief — Tenant / Store Management

**Feature**: 004-rf2-tenant-store-mgmt
**Phase**: Planning (impeccable `shape`, register=product)
**Date**: 2026-06-06
**Status**: **Self-confirmed** (headless; no human present). The recommended
direction below is recorded as the confirmed shape brief for the RF-2
implementation slice, per the run instruction.
**Grounding**: [`PRODUCT.md`](../../PRODUCT.md), [`DESIGN.md`](../../DESIGN.md) v0.1,
the RF-1 visual contract ([`docs/design/rf1-auth-shell/`](../../docs/design/rf1-auth-shell/)
mockups + `src/styles/tokens.css`), this slice's [`spec.md`](./spec.md).

> **Planning artifact. Authorizes no `src/` code.** This brief shapes the RF-2
> surfaces for the gated implementation slice. It names **no** router/state/
> framework/table primitive (those are [`plan.md`](./plan.md) /
> [`research.md`](./research.md) decisions, kept out of spec-facing language per
> spec AC-5). Image-generation probes were **skipped**: this harness has no
> native image generation; the RF-1 high-fi HTML mockups are the visual contract
> this brief extends, which is the appropriate fallback for a code-native UI.

---

## 1. Feature summary

RF-2 is the tenant/store management surface of the Retail Tower Console: the
operator views the backend-scoped roster of tenants, opens a tenant to read or
edit it, provisions stores inside the active tenant, and edits or soft-deletes
either. It mounts inside RF-1's authenticated app shell and reads scope from
RF-1's active-context provider. It is the **first management surface**, and the
console's canonical tables-over-cards use case.

## 2. Primary user action

**Find the right tenant/store in scope, then act on it with confidence about
where the action lands.** Everything else (create, edit, soft-delete) is
secondary to the operator always knowing which tenant/store they are changing
(PRODUCT.md Principle 1, scope before action). The scope is answered by RF-1's
persistent gold scope header, never re-invented by RF-2.

## 3. Design direction

- **Color strategy: Restrained.** Tinted-neutral dark command-room surface
  (`--color-bg`/`--color-surface` carry the navy hue), navy/teal carry all
  actions, gold occupies under 10% as the scope-only authority signal. This is
  DESIGN.md's committed strategy; RF-2 inherits it verbatim and adds no new hue.
- **Theme scene sentence:** *A platform admin and tenant admins reviewing and
  reshaping tenant/store structure on a wide desktop monitor, mid-evening, low
  ambient light, under operational time pressure where a wrong-scope edit has
  consequences.* The sentence forces **dark** (RF-1's established theme) and
  forces **legible scope** above all decoration.
- **Anchor references (named, concrete):** Linear's issue/project tables (dense,
  keyboard-first, quiet rows), Vercel dashboard's project list (data-density
  without stat-card clutter), Stripe Dashboard's resource detail panes
  (read-first, edit-on-intent). All three are admin-of-real-resources, not
  marketing surfaces — the correct register.
- **Anti-references (refuse on sight, PRODUCT.md):** Bootstrap-era CRUD admin
  (dark navbar + blue buttons + table soup); bloated SaaS dashboard (gradient
  hero metrics, identical stat-card grids, glassmorphism, decorative motion).
  RF-2 has **no** hero metric above the table; the data is the content.

## 4. Scope

- **Fidelity:** production-ready (this brief feeds a gated implementation slice).
- **Breadth:** the whole RF-2 surface group — tenant list/detail/create-edit,
  store list/detail/create-edit, and the scope-aware layout they share.
- **Interactivity:** shipped-quality components reusing RF-1's primitives.
- **Time intent:** polish to ship; this is a real operator tool, not a sketch.

(Scope answers are task-scoped; not written back to PRODUCT.md / DESIGN.md.)

## 5. Layout strategy

RF-2 renders inside RF-1's `AppShell` (top-bar + gold `ScopeHeader` +
left-sidebar + content). RF-2 adds **no** new shell chrome.

- **List surfaces (SF-T1, SF-S1)** are the spine: a `.data-table` filling the
  content workspace (DESIGN.md tables-over-cards, rule 7; no card wrapping a
  table unless a toolbar/pagination attaches). Page header = display title +
  optional one-line subtitle + a **single** primary action right-aligned (rule 6
  single-primary; e.g. "New tenant" / "New store"). The action is **always
  rendered**, never pre-hidden by role (a 403 is rendered on attempt — spec OQ-3).
- **Detail surfaces (SF-T2, SF-S2)** are read-first: a workspace of labeled
  field rows (mono for IDs/slugs/`request_id`, `--text-mono`), a status `.badge`,
  and a quiet action cluster (edit = `.btn-secondary`; soft-delete =
  `.btn-destructive`). No nested cards (rule 5): internal grouping uses
  `--color-surface-raised` sections with a top divider rule.
- **Create/edit surfaces (SF-T3, SF-S3)** are a single column of `.input`
  fields, max ~65ch, one `.btn-primary` submit + one `.btn-secondary` cancel
  (single-primary). The **store** form has **no tenant picker** — the active
  tenant from RF-1's context is shown as a read-only scope line, not a field
  (spec FR-004-005). Field errors render inline (`InlineError`, `aria-invalid`),
  surface-level errors render in the persistent `Banner`.
- **Rhythm:** vary spacing (DESIGN.md spacing scale) — `--space-5` card/section
  padding, `--space-3`/`--space-4` table cell rhythm, `--space-7` workspace
  padding-block. Never uniform padding (monotony ban).

## 6. Key states (the full state matrix, per surface)

Every surface must implement **default / empty / loading / error / success**.
"Error" is first-class (PRODUCT.md Principle 4), rendered through RF-1's shared
surface — never a new surface.

### Tenant list (SF-T1) / Store list (SF-S1)

| State | What the operator sees |
| --- | --- |
| Default | `.data-table` of the **backend-scoped** rows (spec OQ-2 — no client filter). Columns: name, slug (mono), status `.badge`, store count / created (as the contract provides). Row click → detail. |
| Empty | Successful zero-row state, **distinct from loading and error** (spec OQ-8): a short message ("No tenants yet." / "No stores in {tenant} yet.") + the create entry point. Create is still **not** role-hidden (OQ-3). No decorative empty illustration (rule 7). |
| Loading | Quiet skeleton rows or a single inline progress affordance in the table region; the shell + scope header stay put (scope before action). No layout shift on resolve. |
| Error | Permission `403` → persistent `.alert--danger` `Banner` with `request_id` (no pre-hide; spec FR-004-004/007). `5xx` → persistent banner "Could not load {tenants/stores}. Retry." with retry. Store list with no active tenant `409` → **scope prompt**, not a raw error (route to RF-1 scope chooser; spec FR-004-006). |
| Success | After a create/edit/soft-delete elsewhere, the list re-fetches and reflects the change; a brief success `.alert--success` banner may confirm (persistent, not a toast — rule 4). |

### Tenant detail (SF-T2) / Store detail (SF-S2)

| State | What the operator sees |
| --- | --- |
| Default | Read view: field rows, status `.badge`, `is_platform_admin`/`role_code` as **display-only** badges (never a UI gate — FR-004-004). Edit (`.btn-secondary`) + soft-delete (`.btn-destructive`) rendered for all (403 on attempt). |
| Empty | N/A (a detail always has a subject; absence → 404). |
| Loading | Field-row skeletons; scope header stays. |
| Error | `404` rendered **uniformly** regardless of cause (absent vs no-access; spec FR-004-008) — "This {tenant/store} is not available." plus a way back to the list. `403` on a load → banner with `request_id`. |
| Success | Edit/soft-delete confirmation reflects back; soft-delete returns to the list with a persistent success banner. |

### Tenant create/edit (SF-T3) / Store create/edit (SF-S3)

| State | What the operator sees |
| --- | --- |
| Default | Single-column form. Create = empty fields; edit = backend values prefilled. One `.btn-primary` submit. Store form shows the **active tenant as a read-only scope line** (no tenant picker — FR-004-005). |
| Empty | N/A (the form is the surface). |
| Loading | Submit shows in-flight state; submit disabled while pending (prevents double-submit). |
| Error | `409` slug/identity conflict on `createTenant` → **inline** `InlineError` on the slug field ("That slug is already in use."). `409` no-active-tenant on store writes → **scope prompt** (resolve tenant first; FR-004-006). `422` field validation → inline against the offending field, message from the backend (RF-2 invents no validation — FR-004-004/AS-5). `403` → banner with `request_id`. `429` → retry-after banner with the submit disabled until the window elapses (FR-004-007). |
| Success | Route to the affected detail/list, re-fetch, persistent success banner. |

### Scope-aware layout (SF-L)

| State | What the operator sees |
| --- | --- |
| Default | RF-1's gold `ScopeHeader` shows `Tenant > Store` (or `All Stores` / `Platform`). RF-2 content sits below it. |
| No active tenant (store surfaces) | Route to RF-1's scope chooser before any store call (spec OQ-4); a `listStores`/`createStore` 409 renders as a scope prompt, not a raw error. |
| Scope switch | Switching tenant/store via the RF-1 header re-fetches RF-2 lists and drops store-scoped views (spec S7); RF-2 holds no authoritative scope (OQ-5). |

## 7. Interaction model

- **List → detail:** whole row is the target (36px+ touch floor, rule 10);
  keyboard-navigable, `aria` row semantics. Hover lifts the row
  (`--color-surface-raised`), selection tints gold-soft (the only gold in a
  table — scope-adjacent, used sparingly).
- **Create/edit:** intent-driven. Edit opens the form; submit calls the backend,
  shows in-flight, then routes on success or renders the typed error (inline vs
  banner per §6). No optimistic write (scope/data is server-resolved).
- **Soft-delete:** `.btn-destructive` opens an inline confirm step (not a
  reflexive modal — modals are a last resort; an inline confirm region or a
  scoped confirm dialog only if the destructive blast radius warrants it). The
  confirm names the exact resource. On confirm, call `softDelete*`, re-fetch.
- **403 anywhere:** the action was attempted (never pre-blocked); the persistent
  banner explains "You do not have permission to {action}." with the backend
  `request_id`, and the operator stays in place (spec S3/S6).
- **Motion:** confirms state change only (DESIGN.md motion tokens); respects
  `prefers-reduced-motion` (durations collapse to 0). No decorative motion.

## 8. Content requirements (copy)

Voice: matter-of-fact, short, says what happened and what to do next
(PRODUCT.md). No marketing language. No em dashes in shipped copy.

- **Titles:** "Tenants", "New tenant", "Edit tenant", "Stores", "New store",
  "Edit store". Detail title = the resource name.
- **Empty:** "No tenants yet." / "No stores in {tenant} yet." + the create CTA.
- **Errors:**
  - 403: "You do not have permission to {list/create/edit/delete} this
    {tenant/store}. Reference {request_id}."
  - 404 (uniform): "This {tenant/store} is not available." (no absent-vs-no-access
    distinction — FR-004-008).
  - 409 slug: "That slug is already in use. Choose a different one."
  - 409 no active tenant: "Select a tenant before managing stores." + scope CTA.
  - 422: the backend's field message, rendered inline (RF-2 does not author it).
  - 429: "Too many attempts. Try again in {n}s." with submit disabled.
  - 5xx: "Could not {load/save}. Try again." + retry, `request_id`.
- **Confirm (soft-delete):** "Soft-delete {name}? It can be restored by an
  administrator." Primary destructive label: "Soft-delete".
- **Display badges:** status (active/suspended/pending — values from the
  contract, rendered as `.badge`); "Platform admin" badge when
  `is_platform_admin` (display-only, FR-004-004).
- **Dynamic ranges:** tenant count 0 → dozens (A1) or 1 (single-tenant actor);
  store count 0 → dozens per tenant. Table must read well at both ends; no
  pagination decision baked into the brief (a `plan.md`/`research.md` concern).

## 9. Recommended references during implementation

- DESIGN.md component block: `.data-table`, `.btn-*`, `.input`, `.badge`,
  `.alert`, `.card`, `.nav-entry` (the un-gated "Stores" entry).
- RF-1 mockups (`docs/design/rf1-auth-shell/`) for the shell frame, scope
  header, banner, and field/error treatment to extend.
- impeccable `harden` (errors/edge cases/i18n posture) and `clarify` (error and
  empty-state copy) during the gated build.

## 10. Open questions (resolve during the gated build)

- **DB-1 — Table column set + sort/pagination affordance** per list. The columns
  are read from the generated client's response shape; sort/pagination is a
  `plan.md` R4-5 primitive decision, not a brief decision.
- **DB-2 — Soft-delete confirm form factor** (inline confirm region vs scoped
  confirm dialog). Default to inline; escalate to a dialog only if the blast
  radius (e.g. tenant soft-delete cascading to stores) warrants the friction.
  Backend cascade semantics are read from the contract, not assumed here.
- **DB-3 — i18n posture.** Copy above is English placeholder; do not couple copy
  to logic (foundation R-8 / RF-1 R3-6 i18n deferral carries forward).

---

## Self-confirmation record (headless)

No human was present to confirm this brief. Per the run instruction, the
recommended direction in §3 (Restrained dark command-room, tables-over-cards,
RF-1 contract extended, zero new hue) is **self-confirmed** as the RF-2 shape
brief. It honors all ten DESIGN.md binding rules and the five PRODUCT.md
principles; it names no framework primitive (spec AC-5); it introduces no
frontend authorization (spec FR-004-004). The implementation slice traces each
UI task to this brief's surface + state-matrix decisions and reuses
`src/styles/tokens.css` + the RF-1 components rather than re-deriving them.

**End of RF-2 Design Brief.**

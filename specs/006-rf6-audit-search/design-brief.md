# RF-6 Audit / Search — Design Brief (`/impeccable shape`, register=product)

**Feature**: 006-rf6-audit-search
**Phase**: 1 — Design (planning artifact; authorizes no `src/` code)
**Date**: 2026-06-06
**Context**: PRODUCT.md (register=product) + DESIGN.md v0.1, both loaded via the
impeccable context loader. Extends slice 003's `docs/design/rf1-auth-shell/`
mockups and the committed `src/styles/tokens.css` + `controls.css` +
`src/shell/app-shell.css`.
**Confirmation**: Self-confirmed (headless — no human to confirm). The
recommended direction below is recorded as the chosen brief.

> **Planning-only.** This brief shapes RF-6's two surfaces (SF-6-1 audit table,
> SF-6-2 row inspect) against the DESIGN.md binding rules. It names **no**
> framework/router/state library (those live in `plan.md`/`research.md`, never
> in `spec.md` — AC-5). It authorizes no `src/` code; the FR-008 five-gate is
> intact. The companion high-fi HTML mockups live under
> `docs/design/rf6-audit-search/`.

---

## 1. Scene sentence (forces the theme)

> A store manager at 9pm, mid-incident, scanning a dense audit log on a wide
> monitor to find the one `shift.forced_close` that explains a till discrepancy,
> under time pressure, needing to read fast and trust what they see.

This forces **dark** (command-room, low ambient light, long session — DESIGN.md
Theme) and **density over decoration** (PRODUCT.md Principle 2). RF-6 inherits
the established Console theme; it does **not** re-decide it.

**Category-reflex check.** "Audit log → dark blue table" is the first-order
reflex. We avoid the slop by (a) refusing the Bootstrap-CRUD table aesthetic
(PRODUCT.md primary anti-reference: no dark navbar + blue primary + zebra
striping), (b) using a **typographic, mono-aligned** table where the `action`
code and `request_id` are monospace and time is right-aligned tabular numerals —
an operational-terminal feel, not a SaaS data-grid. Second-order ("audit-not-SaaS
→ terminal-green") is avoided: no terminal-green; we stay in the Console navy/gold
family with status color contained to badges only.

---

## 2. Binding rules honored (DESIGN.md)

| Rule | How RF-6 honors it |
| --- | --- |
| **Gold is scope-only** | Gold appears **only** on the inherited scope header (RF-1 SF-2) and the active nav marker (the existing `.nav-entry--active::before` gold stripe, now on the un-gated `Audit` entry). **No gold** on audit rows, severity, the `forced_close` highlight, badges, or the "load more" button. Severity/POS emphasis uses contained status colors (danger-surface tint), never gold. |
| **Navy drives actions** | The search/apply control, "load more", and row-inspect affordance use the primary navy / accent family. Never gold. |
| **Status colors contained** | `shift.forced_close`, `cashier.pin.*`, and any 401/403 banner use `--color-danger`/`--color-warning` **only** on a badge or banner surface, not as a row side-stripe (banned) or hover accent. |
| **Tables over cards** | Audit is list data → a single semantic `<table>`, not a card grid (banned: identical-card-grid). SF-6-2 inspect is an inline expansion / side drawer, **not** a modal-first (banned) and **not** a nested card. |
| **Persistent banners, not toasts** | 401/403/generic errors render in the reusable `Banner` (persistent, surfaces `request_id`); never a transient toast. |
| **Density earns its place** | Compact row height, tabular numerals, mono `action`/`request_id`, ≤200 rows/page; no hero-metric block (banned), no decorative icons. |
| **No side-stripe borders / no gradient text / no glass** | Row emphasis is a background tint + a leading mono code, never a `border-left` accent. |

---

## 3. Surfaces

### SF-6-1 — Audit search table (mounts in the shell content area)

Mounts in the existing `AppShell` content region (via the content `<Outlet/>`
that R6-1 adds). Layout, top to bottom:

1. **View title** — `--text-display`, "Audit", one per view (DESIGN.md scale).
   A muted sub-line echoes the active scope (tenant · store) read from the RF-1
   context — reinforces "scope before action" without repeating the gold scope
   header.
2. **Filter bar** — a single dense row of uncontrolled native inputs (no form
   library): `action` (text, prefix-match, mono placeholder e.g. `auth.` /
   `shift.`), `actor` (id), `store` (id, shown only when scope permits a store
   filter), `from`/`to` (native date-time). One navy **Apply** button; a quiet
   **Clear** text button. Filters are URL-reflectable later; not required now.
3. **Result table** — columns: **Time** (right-aligned tabular numerals,
   relative + absolute on hover), **Action** (mono code; POS-catalogue values
   render identically to others — no POS-special styling at this slice, R6-6),
   **Actor** (`actor_label` or `actor_user_id`, muted), **Target**
   (`target_type` · short `target_id`), **Store** (when present), **Req** (mono
   short `request_id`). Row click → SF-6-2.
4. **Pager** — a single navy **Load more** button driven by `next_cursor`;
   hidden when `next_cursor` is null. A muted count line ("showing N"). **No**
   page-number pagination, **no** auto-fetch-until-exhausted (spec OQ-4).

### SF-6-2 — Row inspect (drill, no backend call)

A **right-side drawer** (overlay panel, DESIGN.md `--color-surface-overlay`)
opened from a row. Renders the **already-fetched** row payload (spec OQ-2 — no
single-event read op): `occurred_at` (full), `action` (mono), `actor_*`,
`target_type`/`target_id`, `store_id`, `request_id` (mono, copy-to-clipboard),
and the full `metadata` object as a readable mono key/value block. Read-only:
**no** action buttons (no acknowledge/annotate/export — spec FR-006-009). Closes
on Esc / backdrop / close button. Drawer (not modal) because it preserves the
list context behind it — the operator keeps their place (PRODUCT.md: recover
without losing context).

---

## 4. State matrix (the deliverable tasks.md traces to)

Every state is designed with equal care (PRODUCT.md Principle 4: errors are
first-class). Distinct, non-overlapping renders for SF-6-1:

| State | Trigger | Render |
| --- | --- | --- |
| **pre-query** | Surface mounted, no search run yet (or only defaults) | A quiet prompt in the content area: "Search audit activity for {scope}." with the filter bar ready and focused. **Not** an error, **not** an empty result. |
| **loading** | `listAuditEvents` in flight | Skeleton rows in the table body (fixed row height, no layout shift); filter bar stays interactive; `aria-busy`. |
| **rows** | 200 with `items.length > 0` | The table; "Load more" iff `next_cursor`. |
| **empty-after-filter** | 200 with `items.length === 0` | "No audit events match these filters." + a **Clear filters** affordance. Distinct from pre-query (a query ran and matched nothing). |
| **401 (no active scope)** | 401 "No active tenant" | Per spec OQ-1: not special-cased at this slice (scope gate makes it unreachable on the normal path); the shared interceptor handles a real expiry → redirect to SF-1. If the defensive edge is later wired, the design is a banner routing to the SF-3 scope gate, **not** sign-out. |
| **403 (not permitted)** | 403 "Insufficient role" | Persistent `Banner` (danger): "You do not have permission to view audit for this scope." + `request_id`. The table area shows a neutral "nothing to display" — the console drew no prior conclusion (FR-006-004). |
| **generic non-2xx** | Any other status | Persistent `Banner` (danger): "Audit search failed." + `request_id` + a Retry affordance. Defensive only — the contract enumerates just 200/401/403 (spec §6). |

SF-6-2 states: open (rows present) / closing. No loading state (data is already
in hand).

---

## 5. Accessibility (WCAG AA — PRODUCT.md)

- Semantic `<table>` with `<th scope="col">`; row-inspect trigger is a real
  `<button>` in the first cell (keyboard-activable), not a click-handler on
  `<tr>`.
- The drawer is a focus-trapped `role="dialog"` `aria-modal="true"` with a
  labelled heading; Esc closes; focus returns to the originating row.
- Banners are `role="alert"` (reuse existing `Banner`). Loading is `aria-busy`.
- AA contrast on all text against `--color-bg`/`--color-surface`; status badges
  use the mid-ramp `--color-*-on-dark` tokens already in `tokens.css`.
- `prefers-reduced-motion` respected (tokens already zero out durations); the
  drawer slide collapses to an instant show.

---

## 6. What this brief reuses vs. adds (no new dependency)

- **Reuses:** `src/styles/tokens.css` (all values), `src/styles/controls.css`
  (input/button), `src/shell/app-shell.css` (the shell frame + nav), the
  `Banner`/`InlineError` components, the RF-1 scope context.
- **Adds (styling only, at implementation):** an `audit-table` stylesheet
  (compact rows, mono columns, tabular numerals) and a drawer stylesheet, both
  built **from existing tokens** — no new color, no new font, no new dependency
  (FR-006-010). A right-drawer pattern is new to the codebase; it is composed
  from existing surface/overlay tokens.

---

## 7. Image-generation probe note

`/impeccable shape` Phase 1.5 visual probes were **skipped**: this harness has no
native image generation. High-fi static HTML mockups under
`docs/design/rf6-audit-search/` substitute — the appropriate fallback for a
code-native operational UI, consistent with the slice-003 precedent.

---

## 8. Decisions baked in (self-confirmed, headless)

- **SF-6-1 = single semantic table**, terminal-typographic (mono action/req,
  tabular time), not a SaaS data-grid and not Bootstrap zebra striping.
- **SF-6-2 = right drawer**, not a modal and not a nested card; read-only.
- **Pager = "Load more" from `next_cursor`** (spec OQ-4); no page numbers.
- **POS rows render generically** at this slice (R6-6); POS-specific labelling is
  deferred behind the `draft` re-verify (spec OQ-5).
- **Gold stays scope-only**; the only gold in RF-6 is the inherited scope header
  and the active-nav marker on the un-gated `Audit` entry.

---

**End of RF-6 Audit / Search Design Brief.**

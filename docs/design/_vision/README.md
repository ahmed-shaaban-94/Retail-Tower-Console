# Console Design Vision — Reference Mockups

High-fidelity UI mockups for the **Retail Tower Console** — the platform-admin frontend
of Retail Tower OS. These screens are the agreed visual target for the console: a single,
internally consistent design direction that every implementation slice builds toward.

> **Reference only — nothing here ships.** These live under `docs/**`, which Biome, Vite,
> and CI all ignore, so they never affect the FR-008 build gate. They are a picture of the
> destination, not code.

---

## One converged vision

Earlier rounds explored two competing directions (a light proposal and a dark proposal)
and asked which to pursue. That comparison is closed. **`vision-1/` now holds the single
chosen direction** — one dark command theme, one persistent app shell, one component
language shared across every screen. There is no longer a choice to make here; there is a
target to match.

The live product UI is **RTL Arabic**; these mockups are shown LTR for layout reference.
Mirror direction at implementation time — the layout, density, and component grammar carry
over unchanged.

---

## How this relates to the design system

These mockups are the *applied* form of the committed design system. The system of record is:

- [`DESIGN.md`](../../../DESIGN.md) — tokens (color, type, spacing, motion, elevation),
  the app-shell spec, component CSS, and the 10 binding design rules.
- [`docs/design/rf1-auth-shell/tokens.css`](../rf1-auth-shell/tokens.css) — the same tokens
  as a `:root` block, used by the RF-1 HTML mockups.

When a mockup and `DESIGN.md` disagree, **`DESIGN.md` wins** — a mockup is a snapshot, the
tokens are the contract. What you should be able to read straight off every screen below:

| What you see in the mockups | Where it's defined |
|---|---|
| Dark `#0d1520` page floor, layered `#131e2e` panels | `--color-bg` / `--color-surface` |
| Gold **only** on the logo mark, scope bar, and active-nav stripe | `--color-gold`; Design Rule 1 |
| Navy buttons and links — never gold for actions | `--color-primary`; Design Rule 2 |
| Dense data tables as the primary surface, not card grids | "Density over decoration"; Design Rule 7 |
| Top-bar (56px) + collapsible left sidebar (240/60px) + scrolling content | DESIGN.md → Layout → App Shell |
| Status only on badges / banners (green·amber·red·teal) | semantic tokens; Design Rule 9 |

---

## Screen index

Ten screens, named in the left-nav order shown in the mockups.

| # | Screen | File | Maps to slice |
|---|---|---|---|
| 01 | **Executive Overview** ("Welcome back" landing) | [`01-overview.png`](vision-1/01-overview.png) | `009-rf-overview-dashboard` |
| 02 | **Sales Monitor** | [`02-sales-monitor.png`](vision-1/02-sales-monitor.png) | `012-rf-sales` |
| 03 | **Reconciliation** | [`03-reconciliation.png`](vision-1/03-reconciliation.png) | — (no slice yet) |
| 04 | **Catalog & Inventory** | [`04-catalog-inventory.png`](vision-1/04-catalog-inventory.png) | `011-rf-inventory` |
| 05 | **Unknown Items Review** | [`05-unknown-items.png`](vision-1/05-unknown-items.png) | `007-rf4a-unknown-items` |
| 06 | **Stores & Tenants** | [`06-stores-tenants.png`](vision-1/06-stores-tenants.png) | — (no slice yet) |
| 07 | **Users & Roles** | [`07-users-roles.png`](vision-1/07-users-roles.png) | `005-rf5-operator-admin` |
| 08 | **Audit Logs** | [`08-audit-logs.png`](vision-1/08-audit-logs.png) | — (no slice yet) |
| 09 | **Settings & Integrations** | [`09-settings-integrations.png`](vision-1/09-settings-integrations.png) | `016-rf-connectors-settings` |
| 10 | **AI Studio** | [`10-ai-studio.png`](vision-1/10-ai-studio.png) | — (no slice yet) |

### What each surface is for

- **01 · Executive Overview** — the operator's landing view after sign-in. Headline KPIs
  (transactions, AOV, GMV), a sales trend, integration health, operational exceptions, and
  recent activity. The orientation screen before drilling into any other surface.
- **02 · Sales Monitor** — live sales: revenue/transaction KPIs, trend charts, a
  sortable/filterable transactions table, top-performing stores, payment breakdown, and a
  transaction-detail panel.
- **03 · Reconciliation** — matching across sources: pending/matched/exception counts, a
  posting timeline, an exceptions table, and a per-case detail panel with reconciliation health.
- **04 · Catalog & Inventory** — catalog tree + product master table, stock levels and
  coverage, replenishment alerts, stock-by-location, and a product-detail pane.
- **05 · Unknown Items Review** — the review queue for unrecognized items: confidence
  signals, a triage table with suggested matches, and a selected-item panel. (Read surface
  already specced as `007-rf4a-unknown-items`.)
- **06 · Stores & Tenants** — tenant hierarchy and store network: store directory, health
  and compliance indicators, a geographic view, and a store-detail panel.
- **07 · Users & Roles** — operator/admin management: user table, role distribution, MFA and
  access status, a permissions summary, and recent security actions.
- **08 · Audit Logs** — the audit trail: event-type breakdown, high-risk-event surfacing, a
  filterable log table, and an event-detail panel (actor, target, change diff).
- **09 · Settings & Integrations** — connector catalog and configuration: connection status
  per integration, sync settings, connector health, and a connector-detail panel.
- **10 · AI Studio** — AI-assisted analysis surface: forecasting, scenario planning,
  copilot workspace, and a report/workflow builder.

---

## Vision ↔ spec mapping

The design runs ahead of the spec — most surfaces have no slice yet.

- **Has a slice** (the mockup is the visual target for that slice): 005, 007, 009, 011, 012, 016.
- **No slice yet — seeds for future slices**: Reconciliation, Stores & Tenants, Audit Logs,
  and AI Studio. Treat these as design intent captured ahead of specification.
- **Slices folded into other surfaces** in this vision (no standalone screen): `010` Data
  Quality, `013` Monitoring / Pipeline Ops, `014` Monitoring & Alerts, and `015` Reports &
  Analytics. Their signals live inside Overview / Sales / Reconciliation / Audit / AI Studio.
  Each of those stub specs notes where it landed and flags the screen question for
  `/speckit-specify`.

---

## Using these as an implementation reference

1. **Match the tokens, not the pixels.** Pull color, spacing, type, and radius from
   `DESIGN.md` / `tokens.css`. The PNGs show *arrangement and density*; the tokens give the
   *exact values*. Never eyedrop a color off the image.
2. **Obey the 10 design rules** in `DESIGN.md` even where a mockup looks like it bends one —
   if you spot a conflict, the rule governs and the mockup is the bug.
3. **Build RTL.** These are LTR for reference; the product is Arabic RTL. Mirror layout,
   keep the component grammar.
4. **One screen ≠ one slice.** Some surfaces fold several concerns together (see the mapping
   above). Scope each slice against its spec, not against everything visible on the screen.

---

## Source

Imported from `E:\Tower OS\UI-UX\console\4`. GUID source filenames were renamed to the
descriptive, nav-ordered English names above. The prior two-direction sets (`vision-1` light
and `vision-2` dark) were removed when this direction was chosen.

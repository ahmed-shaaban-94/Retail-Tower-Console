# Console Design Vision — Reference Mockups

High-fidelity UI mockups for the **Retail Tower Console** admin frontend, kept as a
visual reference for implementation.

## One converged vision

`vision-1/` holds the **chosen design direction** for the console — a single, internally
consistent system: one dark command theme, one persistent left-nav, and one set of
screens that share layout, density, and component language. Earlier rounds explored two
competing proposals; this supersedes them. There is now a single vision to build toward.

The console UI is RTL Arabic (the live product language).

> These live under `docs/**`, which biome, Vite, and CI all ignore — so adding them
> does not affect the FR-008 build gate. They are reference only; nothing here ships.

## Screen index

Filenames follow the left-nav order shown in the mockups.

| # | Screen | File | Maps to slice |
|---|---|---|---|
| 01 | Executive Overview ("Welcome back") | `01-overview.png` | `009-rf-overview-dashboard` |
| 02 | Sales Monitor | `02-sales-monitor.png` | `012-rf-sales` |
| 03 | Reconciliation | `03-reconciliation.png` | — (no slice yet) |
| 04 | Catalog & Inventory | `04-catalog-inventory.png` | `011-rf-inventory` |
| 05 | Unknown Items Review | `05-unknown-items.png` | `007-rf4a-unknown-items` |
| 06 | Stores & Tenants | `06-stores-tenants.png` | — (no slice yet) |
| 07 | Users & Roles | `07-users-roles.png` | `005-rf5-operator-admin` |
| 08 | Audit Logs | `08-audit-logs.png` | — (no slice yet) |
| 09 | Settings & Integrations | `09-settings-integrations.png` | `016-rf-connectors-settings` |
| 10 | AI Studio | `10-ai-studio.png` | — (no slice yet) |

Several screens have no spec slice yet — the design runs ahead of the spec. Treat the
unmatched ones (Reconciliation, Stores & Tenants, Audit Logs, AI Studio) as seeds for
future slices. Slices `010` (Data Quality), `013` (Monitoring / Pipeline Ops),
`014` (Monitoring & Alerts), and `015` (Reports & Analytics) are folded into the
Overview / Sales / Audit surfaces in this vision rather than getting standalone screens.

## Source

Imported from `E:\Tower OS\UI-UX\console\4`. GUID filenames were renamed to the
descriptive, nav-ordered English names above.

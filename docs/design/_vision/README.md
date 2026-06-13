# Console Design Visions — Reference Mockups

High-fidelity UI mockups for the **Retail Tower Console** admin frontend, kept as a
visual reference for implementation.

## Two visions, not two themes

`vision-1/` and `vision-2/` are **two competing design directions** (iterations /
proposals) for the same console — *not* a light-theme vs dark-theme pair. Vision 1 is
rendered light and Vision 2 dark, but that is incidental. The intent is to compare the
two proposals **screen-by-screen** and pick a direction.

The console UI is RTL Arabic (the live product language); one overview screen is shown
in English.

> These live under `docs/**`, which biome, Vite, and CI all ignore — so adding them
> does not affect the FR-008 build gate. They are reference only; nothing here ships.

## Screen index

| Screen | Vision 1 (light) | Vision 2 (dark) | Maps to slice |
|---|---|---|---|
| Data Quality | `01-data-quality.png` | `01-data-quality.png` | — (no slice yet) |
| Inventory | `02-inventory.png` | `02-inventory.png` | — (no slice yet) |
| Sales | `03-sales.png` | `03-sales.png` | — (no slice yet) |
| Monitoring / Pipeline ops | `04-monitoring-ops.png` | `04-monitoring-ops.png` | — (no slice yet) |
| Reports & Analytics | `05-reports-analytics.png` | — | — (no slice yet) |
| Monitoring & Alerts | `08-monitoring-alerts.png` | `05-monitoring-alerts.png` | — (no slice yet) |
| Dead Letters (DLQ) | `06-dead-letters-dlq.png` | `06-dead-letters-dlq.png` | closest: `007-rf4a-unknown-items` |
| Users & Roles | `07-users-roles.png` | `07-users-roles.png` | `005-rf5-operator-admin` |
| Connectors / Settings | `09-connectors-settings.png` | `08-connectors-settings.png` | — (no slice yet) |
| Overview ("Welcome back", English) | — | `09-overview-welcome.png` | — (no slice yet) |

Most screens have no spec slice yet — the design runs ahead of the spec. Treat the
unmatched ones as seeds for future slices.

## Source

Imported from `E:\Tower OS\UI-UX\console\{1,2}`. Three exact-duplicate `(1).png`
copies present in the source were dropped; GUID filenames were renamed to the
descriptive English names above.

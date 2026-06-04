# Synchronization — Console in the Flow

> The Console is a **contract-only** admin surface. It reads from Data-Pulse-2 and never
> touches ERPNext directly.

<p align="center">
  <img src="../assets/architecture/retail-tower-sync-flow.svg" alt="Animated Retail Tower OS synchronization diagram, console focus" width="100%"/>
</p>

```text
Retail-Tower-Console ──▶ Data-Pulse-2 ──▶ ERPNext Connector ──▶ ERPNext / Frappe
```

## Two directions

| Direction | What moves | For the console |
|---|---|---|
| 🔵 **Read-DOWN** | Catalog, inventory, sales projections | Management screens render data pulled from Data-Pulse-2 contracts |
| 🟠 **Operations** | Settings, sync-ops, admin actions | Requests rise to Data-Pulse-2; never to ERPNext directly |

```mermaid
flowchart LR
    classDef edge fill:#0e7490,stroke:#5eead4,stroke-width:3px,color:#fff;
    classDef hub  fill:#7c3aed,stroke:#c4b5fd,color:#fff;
    classDef conn fill:#b45309,stroke:#fbbf24,color:#fff;
    classDef erp  fill:#0f766e,stroke:#5eead4,color:#fff;

    CON["📊 Retail-Tower-Console<br/><small>frontend-only · generated client</small>"]:::edge
    DP2["🛡️ Data-Pulse-2<br/><small>contract boundary</small>"]:::hub
    CONN["🔌 ERPNext Connector"]:::conn
    ERP["🏛️ ERPNext / Frappe"]:::erp

    DP2 -- "read-DOWN: catalog / inventory / sales" --> CON
    CON -- "operations / settings" --> DP2
    DP2 <--> CONN <--> ERP
```

The Console owns **no** backend logic, schema, migrations, POS code, workers, or secrets — it
consumes Data-Pulse-2's OpenAPI contracts only.

Program-wide view: the
[Retail-Tower-Orchestrator](https://github.com/ahmed-shaaban-94/Retail-Tower-Orchestrator)
control plane.

> Architecture is stable; this document does not assert feature/merge status. See `specs/**`
> and `CLAUDE.md` for the authoritative implementation state.

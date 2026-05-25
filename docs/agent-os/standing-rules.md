# Retail-Tower-Console Agent OS Standing Rules

## Status

Retail-Tower-Console is in planning-first mode. The repository exists to plan and later implement the Retail Tower OS admin web console, but implementation remains gated by approved specs and stable backend contracts.

## Source-of-truth order

When decisions conflict, use this order:

1. Data-Pulse-2 GitHub main branch
2. Data-Pulse-2 OpenAPI contracts
3. Data-Pulse-2 active specs, execution maps, and wave-status files
4. POS-Pulse GitHub main branch
5. POS-Pulse active specs
6. Retail-Tower-Console planning documents
7. Current human instruction

## Repository ownership

Retail-Tower-Console owns:

- Admin web frontend
- Browser-side UX
- Routes, layouts, navigation, and frontend state
- Tenant and store management UI
- Catalog management UI
- Unknown items review UI
- Operator/admin management UI
- Audit and operational search UI
- Settings and system-management UI when backed by Data-Pulse-2 APIs
- Generated API client consumption
- Frontend design-system usage and component composition

Retail-Tower-Console must not own:

- Backend business logic
- Database schema or migrations
- OpenAPI source-of-truth contracts
- POS terminal code
- Electron, local SQLite, hardware, or terminal pairing behavior
- Worker jobs or queues
- Infrastructure secrets
- Deployment infrastructure unless explicitly planned later
- Analytics warehouse, dbt, ClickHouse, Dagster, or reporting backend

## Implementation gates

Do not begin UI implementation for a screen until the relevant Data-Pulse-2 API surface is stable enough for that screen.

Known backend readiness gates include:

- Auth, tenant, store, and active-context APIs
- Catalog foundation APIs
- Unknown item capture, list, dismiss, link, and create-new APIs
- Operator/admin identity surfaces
- Audit and operational search APIs

## Change discipline

- Prefer small, reviewable slices.
- One concern per slice.
- Do not expand scope silently.
- Do not introduce package files, lockfiles, generated clients, CI, or deployment files without explicit approval.
- Do not create or edit OpenAPI source contracts in this repository.
- Do not duplicate backend DTOs or schema by hand.
- Do not move Data-Pulse-2 or POS-Pulse responsibilities into this repository.
- Do not commit secrets or environment-specific credentials.

## Current allowed work

Until specs are approved, allowed work is documentation and planning only:

- Product charter updates
- Repository boundary updates
- Agent OS bootstrap docs
- Console foundation specs, plans, tasks, execution maps, and wave-status files
- API dependency maps
- Route maps
- Acceptance criteria
- Non-goals and implementation gates

## Stop rules

Stop and ask for approval before:

- Creating a framework scaffold
- Adding package manager files
- Adding dependencies
- Adding CI workflows
- Adding generated clients
- Adding deployment configuration
- Implementing UI screens
- Creating backend logic or contracts
- Opening PRs or merging changes unless explicitly requested

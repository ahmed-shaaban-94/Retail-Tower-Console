# Retail-Tower-Console Charter

## Purpose

Retail-Tower-Console is the future admin web console for Retail Tower OS.

It exists to provide browser-based administration surfaces for tenants, stores,
catalog, unknown items, operators/admins, audit search, and system settings.

## Ownership

This repository owns:

- Admin web frontend
- Frontend routes, layout, navigation, and browser UX
- Tenant and store management UI
- Catalog management UI
- Unknown items review UI
- Operator/admin management UI
- Audit and operational search UI
- Frontend state and components
- Generated API client consumption

## Non-ownership

This repository must not own:

- Backend business logic
- Database schema
- SQL migrations
- OpenAPI source-of-truth contracts
- POS terminal code
- Worker jobs
- Infrastructure secrets
- Deployment infrastructure
- Analytics warehouse, dbt, ClickHouse, or reporting backend

## Source of truth

1. Data-Pulse-2 GitHub main branch
2. Data-Pulse-2 OpenAPI contracts
3. Data-Pulse-2 active specs and wave-status files
4. POS-Pulse GitHub main branch
5. POS-Pulse active specs
6. Retail-Tower-Console planning documents

## Implementation gate

No UI implementation should begin until the relevant Data-Pulse-2 APIs are stable
enough for the target screen.

Required backend readiness includes:

- Auth, tenant, store, and active context APIs
- Catalog foundation APIs
- Unknown item capture, list, dismiss, link, and create-new APIs
- Operator/admin identity surfaces
- Audit and operational search APIs

## Current status

Planning-only. No framework scaffold, package files, generated clients, CI, or
deployment configuration yet.

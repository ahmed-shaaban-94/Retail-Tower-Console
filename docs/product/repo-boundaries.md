# Retail-Tower-Console Repository Boundaries

## Boundary principle

Retail-Tower-Console is a frontend consumer of Data-Pulse-2 contracts. It must
not become a backend, POS terminal, infrastructure, or analytics repository.

## Ownership matrix

| Concern | Data-Pulse-2 | POS-Pulse | Retail-Tower-Console |
| --- | --- | --- | --- |
| Backend APIs | Owns | Consumes | Consumes |
| OpenAPI source contracts | Owns | Consumes | Consumes |
| Database schema | Owns | Does not own | Does not own |
| SQL migrations | Owns | Owns local SQLite only | Does not own |
| Auth/session/context truth | Owns backend truth | Owns local terminal session UX | Consumes backend truth |
| Tenant/store management UI | Backend support only | Does not own | Owns UI |
| Catalog management UI | Backend support only | POS usage only | Owns UI |
| Unknown items review UI | Backend support only | Captures POS-side events where scoped | Owns UI |
| POS terminal UI | Does not own | Owns | Does not own |
| Local SQLite | Does not own | Owns | Does not own |
| Terminal pairing | Backend contract/support only | Owns terminal behavior | Does not own |
| Operator sessions | Backend identity support | Owns POS terminal sessions | Admin UI only when API exists |
| Audit ingestion | Owns backend ingestion | Emits/syncs POS audit events | Search/review UI only |
| Audit/search UI | Backend support only | Does not own | Owns UI when API exists |
| Workers/queues | Owns | Does not own | Does not own |
| Deployment/secrets | Not owned here unless separately planned | Not owned here unless separately planned | Blocked / future decision |
| Generated API client consumption | Provides contracts | Consumes | Consumes |

## Forbidden scope

Retail-Tower-Console must not add backend shortcuts, copied DTOs, copied schema,
POS runtime code, Electron code, worker code, SQL migrations, or OpenAPI
source-of-truth files.

## First safe slice

The first safe slice is documentation only:

- README.md
- docs/product/retail-tower-console-charter.md
- docs/product/repo-boundaries.md

No implementation files yet.

<!--
SYNC IMPACT REPORT
==================
Version change:        1.0.0 → 1.0.1
Bump rationale:        Patch-level status synchronization after the slice 002
                       scaffold merged. No ownership boundary, source-of-truth
                       order, principle, or readiness-gate behavior changed.

Modified principles:   None (no content changes to principles 1–10)
Renamed principles:    None
Added sections:        None
Removed sections:      None
Deferred placeholders: None

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — "Constitution Check" gate is a generic
      hook ("[Gates determined based on constitution file]"). No edits required;
      it already defers to whatever this file says. /speckit-plan runs will read
      principles 1–10 and the Implementation readiness gates section at runtime.
  ✅ .specify/templates/spec-template.md — Generic feature-spec scaffold. No
      principle here imposes mandatory spec sections beyond what the template
      already covers (User Stories, Requirements, Success Criteria, Assumptions).
      No edits required.
  ✅ .specify/templates/tasks-template.md — Generic phased task layout. The
      "implementation readiness gates" are enforced at plan time, not task time,
      so no task-template changes required.
  ✅ .specify/templates/checklist-template.md — Not principle-bearing. No edits
      required.
  ✅ CLAUDE.md — Already instructs Claude to "read the current plan" for context.
      No edits required.

Follow-up TODOs:       None.
-->

# Retail-Tower-Console Constitution

## Current status

Planning-first. The slice 002 frontend scaffold, package manifest, lockfile,
generated-client storage location, smoke tests, and CI workflow now exist after
explicit slice approval. Product UI implementation remains gated per slice.

---

## Principles

### 1. Frontend-only ownership

Retail-Tower-Console owns the admin web frontend exclusively. It owns browser UX,
routes, layout, navigation, frontend state, components, and generated API client
consumption. It does not own anything outside that boundary.

### 2. Data-Pulse-2 contract authority

Data-Pulse-2 is the authoritative source for all backend APIs, OpenAPI contracts,
database schema, and SQL migrations. Retail-Tower-Console consumes those contracts
but does not define, copy, or override them. Any API surface required by this repo
must be confirmed stable in Data-Pulse-2 before implementation begins here.

### 3. POS-Pulse boundary preservation

POS-Pulse owns all POS terminal behavior: Electron code, local SQLite, hardware
pairing, terminal sessions, and POS-side runtime logic. Retail-Tower-Console does
not reproduce, duplicate, or take ownership of any POS-Pulse concern. If a
feature appears to touch POS behavior, stop and confirm scope before proceeding.

### 4. Spec-first implementation

No UI implementation begins without an approved spec, approved plan, approved task
list, approved API dependency map, and defined validation gates. The full gate list
is maintained in `docs/agent-os/maestro-playbook.md`. Skipping any gate is not
permitted.

### 5. No hidden scope expansion

Scope changes must be made explicitly and documented. No silent additions of
concerns, files, or responsibilities. If a slice grows beyond its defined
`allowed_files`, it must stop and be re-scoped with human approval.

### 6. No backend, schema, or OpenAPI ownership

This repository must never contain:
- Backend business logic or API handlers
- Database schema definitions
- SQL migration files
- OpenAPI source-of-truth contracts
- Worker jobs or queue logic
- Analytics warehouse, dbt, ClickHouse, or reporting backend code

### 7. Tenant and store safety is backend-enforced

Tenant isolation, store authorization, and data access control are enforced by
Data-Pulse-2 on the backend. This repository must not attempt to replicate,
shadow, or work around those controls in the frontend layer.

### 8. Generated client consumption only

This repository consumes generated API clients produced from Data-Pulse-2 OpenAPI
contracts. It does not maintain OpenAPI source contracts. It does not hand-write
API client code. Generated clients are only added to the repository after explicit
human approval of the relevant slice.

### 9. No package, lockfile, or CI changes without approval

The following require explicit human approval before being created or modified:
- `package.json` and any package manager manifest
- Lockfiles (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- `.github/workflows/` or any CI configuration
- Any dependency addition or removal

### 10. No secrets or deployment assumptions

No secrets, credentials, or environment-specific values may be committed to this
repository. Deployment configuration (Dockerfile, docker-compose, k8s manifests,
Terraform, Vercel/Fly/etc. config) does not exist here and may only be added after
an explicit architectural decision with human approval.

---

## Source-of-truth order

When decisions conflict, resolve using this order:

1. Data-Pulse-2 GitHub main branch
2. Data-Pulse-2 OpenAPI contracts
3. Data-Pulse-2 active specs, execution maps, and wave-status files
4. POS-Pulse GitHub main branch
5. POS-Pulse active specs
6. Retail-Tower-Console planning documents (this repo)
7. Current human instruction

---

## Implementation readiness gates

Before any `implementation` slice may begin, ALL of the following must be
explicitly approved by the human owner:

- [ ] Spec approved
- [ ] Plan approved
- [ ] Task list approved
- [ ] API dependency map approved (relevant Data-Pulse-2 contracts confirmed stable)
- [ ] Validation gates defined and approved

These gates are enforced per-slice. A gate cleared for one slice does not carry
over to another.

---

## Governance

### Amendment rule

Changes to ownership boundaries, source-of-truth order, or implementation gates
require explicit written approval from the human owner before taking effect.

No agent, assistant, or automated process may amend this constitution unilaterally.
Amendment proposals must be documented as a `planning/spec` slice and approved
before the change is applied.

### Versioning policy

The constitution uses semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Backward-incompatible governance changes, principle removals, or
  redefinitions that invalidate prior approvals (e.g., removing a readiness gate,
  weakening a boundary, changing the source-of-truth order).
- **MINOR**: New principle added, new readiness gate added, or material expansion
  of an existing principle's scope.
- **PATCH**: Clarifications, wording cleanup, formatting, metadata, or
  non-semantic refinements that do not change behavior or obligations.

### Compliance review

Every `/speckit-plan`, `/speckit-tasks`, and `/speckit-implement` run MUST verify
the proposed work against principles 1–10 and the Implementation readiness gates.
A plan that violates any principle MUST be rejected at the Constitution Check
gate; the violation may only proceed if documented in the plan's Complexity
Tracking section with explicit human approval recorded in the spec.

**Version**: 1.0.1 | **Ratified**: 2026-05-25 | **Last Amended**: 2026-05-31

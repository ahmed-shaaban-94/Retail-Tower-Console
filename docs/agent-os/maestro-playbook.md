# Retail-Tower-Console Maestro Playbook

## Default mode

Planning-first. No implementation work begins without an approved spec, approved
plan, approved tasks, approved API dependency map, and defined validation gates.

---

## Required repo-state checks before any slice

Before opening or executing any slice, verify:

1. `docs/agent-os/standing-rules.md` — confirm current allowed work and stop rules.
2. `docs/product/retail-tower-console-charter.md` — confirm ownership scope.
3. `docs/product/repo-boundaries.md` — confirm boundary matrix.
4. `.specify/memory/constitution.md` — confirm active constitution principles.
5. Any open slice files under `docs/slices/` — check for blockers or dependencies.

If any of the above are missing or clearly incomplete, fix them before proceeding.

---

## Cross-repo checks

### When backend APIs or contracts are relevant

Check Data-Pulse-2 before assuming any backend surface is stable:

- Data-Pulse-2 GitHub main branch (source of current implementation state)
- Data-Pulse-2 OpenAPI contracts (authoritative API surface)
- Data-Pulse-2 active specs, execution maps, and wave-status files

Do not implement a UI screen against an unstable or unverified backend contract.
Do not copy or duplicate Data-Pulse-2 DTOs or schema into this repository.

### When POS integration or terminal behavior is relevant

Check POS-Pulse before assuming any POS surface:

- POS-Pulse GitHub main branch
- POS-Pulse active specs

Retail-Tower-Console must not own POS terminal code, Electron code, local SQLite,
hardware pairing behavior, or any POS-side runtime logic. If a feature touches
POS behavior, stop and confirm scope before proceeding.

---

## Allowed slice types

| Type | Description |
| --- | --- |
| `docs` | README, charter, boundary, or planning document updates |
| `planning/spec` | Spec, plan, task list, API dependency map, route map, acceptance criteria, validation gates |
| `implementation` | UI code, routes, components, state, generated client wiring |

`implementation` slices are always blocked by default (see gates below).

---

## Implementation slice gates

An `implementation` slice is blocked until ALL of the following are approved:

- [ ] Spec approved
- [ ] Plan approved
- [ ] Task list approved
- [ ] API dependency map approved (backend contracts confirmed stable in Data-Pulse-2)
- [ ] Validation gates defined and approved

Do not begin coding until every gate above is explicitly cleared by the human owner.

---

## Mock rule

Mocks are not allowed by default.

A mock may only be created when:

1. Explicitly approved by the human owner in writing.
2. The mock is marked `disposable: true` in the slice file.
3. A removal task exists before the slice is closed.

Approved mocks must be replaced with real API client wiring before the slice is
considered done.

---

## Stop rules

Stop immediately and ask for approval before any of the following:

- Creating `package.json`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`,
  or any other package manager file
- Adding or modifying lockfiles
- Creating `.github/workflows/` or any CI configuration
- Generating or committing an API client from an OpenAPI spec
- Scaffolding a framework (Next.js, Vite, Remix, or any other)
- Implementing any UI screen, component, route, or page
- Creating deployment configuration (Dockerfile, docker-compose, k8s, Terraform,
  Fly.toml, Vercel config, etc.)
- Modifying or creating OpenAPI source contracts
- Adding backend logic, database schema, or SQL migrations
- Committing secrets, credentials, or environment-specific values

If any of these are reached during a slice, halt and report. Do not work around
the stop rule.

---

## Slice lifecycle

```
OPEN → PLANNING → SPEC_REVIEW → PLAN_REVIEW → TASK_REVIEW → API_MAP_REVIEW
     → GATES_DEFINED → APPROVED → (implementation slices only) → IMPLEMENTATION
     → VALIDATION → DONE
```

`docs` and `planning/spec` slices skip the implementation track and go:

```
OPEN → PLANNING → REVIEW → DONE
```

---

## Escalation

- Unknown boundary: stop and consult `docs/product/repo-boundaries.md` and
  `docs/agent-os/standing-rules.md`. If still unclear, ask the human owner.
- Data-Pulse-2 API not found or unstable: stop. Do not assume. Report.
- POS scope appears: stop. Confirm with human owner before proceeding.
- Scope appears to expand beyond frontend: stop and report.

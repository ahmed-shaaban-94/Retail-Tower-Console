# RF-1 Auth Shell — Design Mockups

> **Planning artifact. Authorizes no `src/` code.** These are visual mockups produced
> by `/impeccable shape` to feed `specs/003-rf1-auth-shell` planning (the `plan.md` /
> `/speckit-clarify` deferrals and OQ-4). They are **not** implementation, **not** the
> FR-003-012 API "mock", and **not** built or linted. They live under `docs/**`, which
> `biome.json` ignores and Vite does not compile. The FR-008 five-gate is intact.

## What's here

| File | Surface | States shown |
| --- | --- | --- |
| `tokens.css` | shared | DESIGN.md v0.1 tokens, verbatim, + shared button/input/alert/badge primitives |
| `sf1-signin.mockup.html` | **SF-1** sign-in | default · field focus · submitting · 401 generic · 429 retry-after |
| `sf2-scope-gate.mockup.html` | **SF-2** scope gate | tenant step (A1, searchable) · store step · no-access (S7) |
| `sf2-app-shell.mockup.html` | **SF-2** app shell | default in-context · scope-header switch open · session-expired redirect (S5) |

Open any `.mockup.html` in a browser. No build step, no server.

## Decisions baked in (from the confirmed design brief)

- **OQ-4 → auto-select.** Single-membership actors never see the scope gate; it auto-resolves
  and lands them in the shell. The gate is for multi-membership A1/A2 only.
- **S5 → full redirect.** A 401 on any call drops cached context and routes to SF-1. No modal,
  no place-preservation.
- **SF-1 → centered card** on the command-room field. The one justified card use; no split-panel
  marketing (avoids the Bootstrap-CRUD / SaaS anti-references).
- **Scope chooser → full-screen gate.** Unmissable; scales to a platform admin with many tenants.
  Tenant step then store step.
- **Scope header → persistent gold bar, click-to-switch.** Exactly DESIGN.md's spec. Switching
  re-fetches `getActiveContext` (no optimistic update); tenant switch clears the store.

## Design-system fidelity

Every color, space, radius, shadow, type, and motion value traces to `DESIGN.md` v0.1.
`tokens.css` is the bridge — copying it (or its values) into `src/` is the mechanical step the
later gated implementation takes. Binding rules honored: gold is scope-only (rule 1), navy drives
actions (rule 2), scope-before-action (rule 3), persistent banners not toasts (rule 4), no nested
cards (rule 5), single primary per context (rule 6), density over decoration (rule 7).

## What these mockups do NOT decide

Router, state store, data-fetching, and form primitives (spec OQ-1, plan R3-1..R3-5) — those stay
deferred to `/speckit-clarify`. These mockups are deliberately framework-agnostic static HTML.

## Image-generation probe note

`/impeccable shape` Phase 1.5 visual probes were skipped: this harness has no native image
generation. High-fi HTML mockups substitute, which is the appropriate fallback for a code-native UI.

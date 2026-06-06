# RF-6 Audit / Search — Design Mockups

> **Planning artifact. Authorizes no `src/` code.** These are visual mockups produced
> by `/impeccable shape` to feed `specs/006-rf6-audit-search` planning (the `plan.md` /
> `design-brief.md` decisions and OQ-4). They are **not** implementation, **not** the
> FR-006-013 API "mock", and **not** built or linted. They live under `docs/**`, which
> `biome.json` ignores and Vite does not compile. The FR-008 five-gate is intact.

## What's here

| File | Surface | States shown |
| --- | --- | --- |
| `tokens.css` | shared | Re-uses `src/styles/tokens.css` values verbatim (DESIGN.md v0.1) — symlink-in-spirit; the mockups import the committed token values |
| `sf6-audit-search.mockup.html` | **SF-6-1** audit table | pre-query · loading (skeleton) · rows (with POS `shift.forced_close` + `operator.session.takeover`) · empty-after-filter · 403 not-permitted · generic error |
| `sf6-row-inspect.mockup.html` | **SF-6-2** row inspect | right drawer with full metadata, mono `request_id`, read-only (no action buttons) |

Open any `.mockup.html` in a browser. No build step, no server.

## Decisions baked in (from the confirmed design brief)

- **Tables over cards.** Audit is list data → one dense semantic table, terminal-typographic
  (mono `action`/`request_id`, right-aligned tabular time). Not Bootstrap zebra striping
  (the PRODUCT.md primary anti-reference), not a SaaS data-grid.
- **Gold is scope-only.** No gold on audit rows, severity, or the `forced_close` highlight.
  The only gold is the inherited scope header and the active-nav marker on the un-gated `Audit`
  entry. Severity uses contained status colors on badges only.
- **Inspect = right drawer, not modal.** Preserves the list context behind it; read-only
  (no acknowledge/annotate/export — RF-6 is read-mostly). Data comes from the already-fetched
  row (OQ-2: there is no single-event read operation).
- **Pager = "Load more" from `next_cursor`.** No page numbers, no auto-fetch-until-exhausted
  (OQ-4).
- **POS rows render generically** at this slice. POS-specific labelling is deferred behind the
  `draft` POS sub-row re-verification (OQ-5).

## Design-system fidelity

Every color, space, radius, shadow, type, and motion value traces to `src/styles/tokens.css`
(DESIGN.md v0.1). Binding rules honored: gold is scope-only (rule 1), navy drives actions
(rule 2), status colors contained (rule 3), tables-over-cards + no nested cards, persistent
banners not toasts, density over decoration, no side-stripe borders.

## What these mockups do NOT decide

Router/route-attachment, list-query state store, data-fetching, and table primitives
(spec OQ-1 deferral note, plan/research R6-1..R6-5) — those stay in `plan.md`/`research.md`,
never in `spec.md`. These mockups are deliberately framework-agnostic static HTML.

## Image-generation probe note

`/impeccable shape` Phase 1.5 visual probes were skipped: this harness has no native image
generation. High-fi HTML mockups substitute, which is the appropriate fallback for a
code-native operational UI (slice-003 precedent).

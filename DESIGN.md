# Design System: Retail Tower Console

> **Version**: 0.1 — seeded before implementation. Re-run `/impeccable document` once
> the first component slice ships to capture real tokens.
>
> **Sibling system**: POS-Pulse owns the light-theme token set. This system inverts
> the same hue family to a dark surface with gold as the sole brand authority signal.
> Both systems share the same semantic color roles, motion tokens, and component conventions —
> they are deliberately compatible, not identical.

---

## Register

product

---

## Theme

**Dark.** The Console is the command view, not the retail counter. The physical scene:
a platform admin reviewing tenant health and audit on a multi-monitor desk, mid-evening,
ambient light low. The brand imagery (interior command room, city at night) resolves this
without ambiguity.

POS-Pulse is light because the pharmacy floor is bright and surfaces need to read under
overhead fluorescent. The Console operator is seated in a controlled environment where
a dark surface with gold accents projects authority and reduces eye strain over long sessions.

---

## Color

### Strategy

**Committed** dark surface. The background carries the hue; gold occupies 10–20% as
the brand authority signal; navy/teal carry interactive affordances. Status colors are
contained to their surfaces only.

### Palette

#### Surfaces

| Token | Name | Hex | OKLCH | Purpose |
|---|---|---|---|---|
| `--color-bg` | Command Room | `#0d1520` | `oklch(13% 0.032 236)` | Page background |
| `--color-surface` | Deep Panel | `#131e2e` | `oklch(17% 0.038 236)` | Primary surface (cards, panes) |
| `--color-surface-raised` | Lifted Panel | `#1a2840` | `oklch(22% 0.045 236)` | Elevated cards, hover states |
| `--color-surface-sunken` | Recessed | `#0a1018` | `oklch(10% 0.025 236)` | Input recesses, sidebar base |
| `--color-surface-overlay` | Overlay Panel | `#1e2d42` | `oklch(25% 0.048 236)` | Dialogs, drawers |
| `--color-border` | Quiet Edge | `#2a3d55` | `oklch(32% 0.052 236)` | Default borders |
| `--color-border-strong` | Firm Edge | `#3a5270` | `oklch(40% 0.062 236)` | Focus rings, emphasis borders |

#### Text

| Token | Name | Hex | OKLCH | Purpose |
|---|---|---|---|---|
| `--color-text` | Star White | `#e8eef5` | `oklch(93% 0.018 236)` | Primary text |
| `--color-text-muted` | Mist | `#8a9db5` | `oklch(64% 0.040 236)` | Secondary, help text, metadata |
| `--color-text-disabled` | Dim | `#4a5e78` | `oklch(44% 0.045 236)` | Disabled labels |
| `--color-text-inverse` | Midnight | `#0f1d2e` | `oklch(18% 0.040 236)` | Text on light surfaces (gold bg) |

#### Brand

| Token | Name | Hex | OKLCH | Purpose |
|---|---|---|---|---|
| `--color-gold` | Tower Gold | `#c8a24a` | `oklch(70% 0.110 72)` | Brand authority signal — logo mark, scope header, active nav marker |
| `--color-gold-soft` | Gilded Surface | `#2a2010` | `oklch(17% 0.040 72)` | Gold tinted background (selected rows, active surfaces) |
| `--color-gold-muted` | Aged Gold | `#8a6a2a` | `oklch(52% 0.100 72)` | Subdued brand element, breadcrumb active |

#### Interactive (shared with POS-Pulse)

| Token | Name | Hex | OKLCH | Purpose |
|---|---|---|---|---|
| `--color-primary` | Command Navy | `#1f4e7a` | `oklch(36% 0.085 236)` | Primary action fill |
| `--color-primary-hover` | Deep Command | `#163d61` | `oklch(29% 0.075 236)` | Primary hover |
| `--color-primary-subtle` | Navy Tint | `#0e1e30` | `oklch(17% 0.048 236)` | Primary tinted surface |
| `--color-accent` | Teal Marker | `#2e7da3` | `oklch(52% 0.085 218)` | Focus rings, active nav stripe |

#### Semantic

| Token | Name | Hex | Purpose |
|---|---|---|---|
| `--color-success` | Confirmation Green | `#1f8a5b` | Success state fill |
| `--color-success-surface` | — | `#0a1f16` | Success tinted background |
| `--color-warning` | Caution Amber | `#b87600` | Warning state fill |
| `--color-warning-surface` | — | `#1e1500` | Warning tinted background |
| `--color-danger` | Alert Red | `#b32e36` | Danger state fill |
| `--color-danger-surface` | — | `#1f0a0c` | Danger tinted background |
| `--color-info` | Info Teal | `#1e6f8c` | Info state fill |
| `--color-info-surface` | — | `#061520` | Info tinted background |

### Rules

- **Gold is brand-only.** `--color-gold` appears on: the logo mark, the scope context header
  (tenant/store selector bar), and the active nav marker. It is never a button fill, badge
  color, or decorative flourish.
- **Primary navy drives actions.** All interactive affordances (buttons, links, focus rings)
  use the primary/accent navy family. Never gold for actions.
- **Status colors are contained.** Success/warning/danger/info appear only on badges,
  banners, and alert callouts. Not as hover accents, brand fills, or decorative use.
- **No pure black.** `--color-bg` is the darkest surface; always carry hue (chroma ≥ 0.025).

---

## Typography

### Typefaces

| Role | Stack |
|---|---|
| Sans | `'Inter Variable', Inter, 'Segoe UI', system-ui, -apple-system, sans-serif` |
| Mono | `ui-monospace, 'Cascadia Code', 'JetBrains Mono', 'Consolas', monospace` |

**Single sans typeface rule** (inherited from POS-Pulse): weight contrast alone carries
hierarchy. No Inter Tight, no secondary display face. Heading weight is achieved via
`font-weight: 700` and negative letter-spacing, not a separate typeface.

### Scale

| Token | Size | Weight | Line-height | Letter-spacing | Use |
|---|---|---|---|---|---|
| `--text-display` | 1.875rem (30px) | 700 | 1.25 | −0.015em | Screen title. One per view. |
| `--text-headline` | 1.25rem (20px) | 600 | 1.3 | −0.010em | Section header, panel title |
| `--text-title` | 1rem (16px) | 600 | 1.375 | −0.005em | Card title, group label |
| `--text-body` | 0.875rem (14px) | 400 | 1.5 | 0 | Paragraph, description text. Max 65ch. |
| `--text-label` | 0.8125rem (13px) | 600 | 1.25 | 0 | Badge, chip, table header. No all-caps. |
| `--text-caption` | 0.75rem (12px) | 400 | 1.4 | 0 | Timestamp, secondary metadata |
| `--text-mono` | 0.8125rem (13px) | 400 | 1.5 | 0 | IDs, refs, audit strings, UUIDs |
| `--text-mono-lg` | 0.875rem (14px) | 500 | 1.5 | 0.04em | Scope header context values |

---

## Elevation & Shadows

Dark surfaces use shadows tinted toward the background hue to avoid generic gray.
Shadow flood color: `#0d1520` (background).

| Token | Value | Purpose |
|---|---|---|
| `--shadow-none` | `none` | Default flat state |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Inline chips |
| `--shadow-card` | `0 2px 4px rgba(13,21,32,0.4), 0 8px 24px rgba(13,21,32,0.3)` | Standard card |
| `--shadow-raised` | `0 4px 12px rgba(13,21,32,0.5), 0 1px 3px rgba(13,21,32,0.3)` | Hover lift |
| `--shadow-pane` | `0 20px 60px rgba(13,21,32,0.7)` | Dialogs, drawers |
| `--shadow-inset` | `inset 0 1px 0 rgba(255,255,255,0.04), inset 0 0 0 1px rgba(255,255,255,0.03)` | Recessed input wells |
| `--shadow-gold-ring` | `0 0 0 3px rgba(200,162,74,0.25)` | Gold-tinted focus ring for scope elements |

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 4px | Badges, chips, micro elements |
| `--radius-md` | 6px | Table rows (hover), minor containers |
| `--radius-control` | 10px | Buttons, inputs, selects |
| `--radius-card` | 12px | Standard cards, panes |
| `--radius-dialog` | 16px | Dialogs, drawers |
| `--radius-pill` | 9999px | Badge pills, tags |

---

## Spacing

4px base. Vary by rhythm — never use the same value for every gap on a surface.

| Token | px | Typical use |
|---|---|---|
| `--space-1` | 4px | Icon-to-label gap, dot margin |
| `--space-2` | 8px | Button padding-inline tight, badge padding |
| `--space-3` | 12px | Input padding-block, compact row gap |
| `--space-4` | 16px | Standard row gap, section gutter |
| `--space-5` | 24px | Card padding, section padding |
| `--space-6` | 32px | Workspace padding-inline tight |
| `--space-7` | 48px | Workspace padding-block, page section gap |
| `--space-8` | 64px | Page-level vertical rhythm |
| `--space-9` | 96px | Hero spacing, large inter-section gaps |

---

## Motion

Identical to POS-Pulse. Motion confirms state change; it does not entertain.

| Token | Value | Purpose |
|---|---|---|
| `--duration-1` | 80ms | Micro-interactions: hover fills, pulse onset |
| `--duration-2` | 150ms | Standard transitions: button hover, focus, border |
| `--duration-3` | 220ms | Panel slides, sidebar expand/collapse |
| `--duration-4` | 320ms | Dialog entrance, route fade |
| `--ease-out` | `cubic-bezier(0.2, 0.7, 0.25, 1)` | All exit/in easing. Expo-style. |
| `--ease-in-out` | `cubic-bezier(0.45, 0.05, 0.25, 1)` | Bidirectional: sidebar toggle |

No bounce, no elastic. No animation of CSS layout properties. `prefers-reduced-motion`
collapses all durations to 0ms and opacity transitions to instant.

---

## Layout

### App Shell

The Console uses a **top-bar + left-sidebar + content** shell.

- **Top bar**: 56px. Contains the Retail Tower OS logo mark (gold shield + wordmark),
  the **scope header** (tenant name / store name selector, gold-tinted), user menu, notifications.
- **Sidebar**: Collapsible. 240px expanded, 60px icon-only, 0px hidden (mobile).
  Background: `--color-surface-sunken`. Nav entries use the same pattern as POS-Pulse
  nav rail but on dark surfaces.
- **Content area**: `flex: 1`, scrollable. Background: `--color-bg`.

### Content Workspace

```
max-width: none (tables need room)
padding-block: var(--space-7)      /* 48px */
padding-inline: var(--space-6)     /* 32px — grows to 48px at ≥1440px */
```

Page headers: display title + optional subtitle + action button cluster (right-aligned).
Never a hero metric above a table. The data IS the content.

### Scope Header

A persistent bar directly below the top bar when inside a tenant/store context.
Height: 40px. Background: `--color-gold-soft`. Text in `--color-gold`.
Always shows: `Tenant Name > Store Name` (or `All Stores` / `Platform`).
This is the primary answer to the "Scope before action" principle.

### Breakpoints

| Name | Value | Behavior |
|---|---|---|
| `--bp-mobile` | 768px | Sidebar hides, top bar gains hamburger |
| `--bp-sidebar-icon` | 1024px | Sidebar collapses to 60px icon-only |
| `--bp-sidebar-full` | 1280px | Sidebar expands to 240px with labels |
| `--bp-content-wide` | 1440px | Content padding-inline grows from 32px to 48px |

---

## Components

### Primary Button

```css
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; height: 36px; padding: 0 14px;
  background-color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-control);
  color: #ffffff;
  font-size: var(--text-label); font-weight: 600;
  letter-spacing: -0.005em; line-height: 1;
  transition: background-color var(--duration-2) var(--ease-out),
              box-shadow var(--duration-2) var(--ease-out);
}
.btn-primary:hover { background-color: var(--color-primary-hover); }
.btn-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(31,78,122,0.45);
}
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
```

### Secondary Button

Border-only, inherits surface background. On dark surfaces:

```css
.btn-secondary {
  /* same geometry as primary */
  background-color: transparent;
  border: 1px solid var(--color-border-strong);
  color: var(--color-text);
}
.btn-secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
  background-color: var(--color-primary-subtle);
}
```

### Ghost Button

No border, no background. For toolbar icon buttons, inline actions in tables:

```css
.btn-ghost {
  background: transparent; border: none;
  color: var(--color-text-muted);
  height: 32px; padding: 0 8px;
  border-radius: var(--radius-md);
}
.btn-ghost:hover {
  background-color: var(--color-surface-raised);
  color: var(--color-text);
}
```

### Destructive Button

```css
.btn-destructive {
  background-color: var(--color-danger);
  border: 1px solid var(--color-danger);
  color: #ffffff;
}
.btn-destructive:hover { background-color: #8e2329; }
.btn-destructive:focus-visible {
  box-shadow: 0 0 0 3px rgba(179,46,54,0.40);
}
```

### Input Field

```css
.input {
  display: block; width: 100%;
  min-height: 36px; padding: 6px 12px;
  background-color: var(--color-surface-sunken);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  color: var(--color-text);
  font-size: var(--text-body);
  transition: border-color var(--duration-2) var(--ease-out),
              box-shadow var(--duration-2) var(--ease-out);
}
.input:focus-visible {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(46,125,163,0.30);
  outline: none;
}
.input::placeholder { color: var(--color-text-disabled); }
.input[aria-invalid="true"] {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(179,46,54,0.25);
}
```

### Card

```css
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: var(--space-5);
}
```

No nested cards. Internal grouping via `--color-surface-raised` background sections
with `--radius-md` and a top rule (`border-top: 1px solid var(--color-border)`).

### Navigation Sidebar Entry

```css
.nav-entry {
  position: relative;
  display: flex; align-items: center;
  gap: 12px; height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: background-color var(--duration-2) var(--ease-out),
              color var(--duration-2) var(--ease-out);
  overflow: hidden; white-space: nowrap;
}
.nav-entry:hover {
  background-color: var(--color-surface-raised);
  color: var(--color-text);
}
.nav-entry--active {
  background-color: var(--color-primary-subtle);
  color: var(--color-text);
}
.nav-entry--active::before {
  content: '';
  position: absolute; top: 50%; left: 0;
  transform: translateY(-50%);
  width: 3px; height: 20px;
  border-radius: 0 2px 2px 0;
  background-color: var(--color-gold);   /* Gold marker, not teal */
}
```

**Note**: The active nav marker uses gold (`--color-gold`), not the teal accent. This is
the primary visual differentiator from POS-Pulse and the only persistent gold use in navigation.

### Scope Header Bar

```css
.scope-header {
  display: flex; align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-6);
  background-color: var(--color-gold-soft);
  border-bottom: 1px solid rgba(200,162,74,0.18);
  font-size: var(--text-label);
  font-weight: 600;
  color: var(--color-gold);
}
.scope-header__breadcrumb { opacity: 0.7; }
.scope-header__separator { opacity: 0.4; padding: 0 var(--space-1); }
.scope-header__current { opacity: 1; }
```

### Badge

```css
.badge {
  display: inline-flex; align-items: center;
  gap: 6px; height: 22px; padding: 0 8px;
  border-radius: var(--radius-pill);
  font-size: var(--text-caption); font-weight: 600;
  line-height: 1; white-space: nowrap;
}
.badge::before {
  content: ''; width: 6px; height: 6px;
  border-radius: 9999px; flex-shrink: 0;
  background-color: currentColor;
}
.badge--success { background: var(--color-success-surface); color: #52b986; }
.badge--warning { background: var(--color-warning-surface); color: #d49030; }
.badge--danger  { background: var(--color-danger-surface);  color: #c84d55; }
.badge--info    { background: var(--color-info-surface);    color: #50a2c0; }
.badge--neutral { background: var(--color-surface-raised);  color: var(--color-text-muted); }
```

On dark surfaces, status badge text uses the **mid-ramp** tone of each semantic color
(not the full saturation value) to maintain AA contrast against dark backgrounds.

### Data Table

```css
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead tr {
  border-bottom: 1px solid var(--color-border);
}
.data-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--text-label); font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
}
.data-table td {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-body);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}
.data-table tbody tr:hover td {
  background-color: var(--color-surface-raised);
}
.data-table tbody tr.is-selected td {
  background-color: var(--color-gold-soft);
}
```

Tables are the primary data surface. No card wrapping a table unless pagination
controls or action toolbars are attached to it.

### Alert / Status Banner

Full-width, persistent. Same rules as POS-Pulse: never auto-dismisses.
On dark surfaces, use the `*-surface` color tokens.

```css
.alert {
  display: flex; align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  border: 1px solid transparent;
}
.alert--danger  { background: var(--color-danger-surface);  color: #c84d55;  border-color: rgba(179,46,54,0.30); }
.alert--warning { background: var(--color-warning-surface); color: #d49030;  border-color: rgba(184,118,0,0.30); }
.alert--success { background: var(--color-success-surface); color: #52b986;  border-color: rgba(31,138,91,0.30); }
.alert--info    { background: var(--color-info-surface);    color: #50a2c0;  border-color: rgba(30,111,140,0.30); }
```

---

## Icons

Shared with Data-Pulse-2 brand icon system. 10 approved SVG icons:
`branch-ops`, `access-control`, `catalog`, `inventory`, `pos-core`,
`store-network`, `integrations`, `audit-compliance`, `dashboard`, `security`.

**Icon style contract** (from Data-Pulse-2 `icon-system.md`):
- ViewBox: `0 0 24 24`
- Stroke-only, `fill: none`
- Stroke width: 1.75 primary, 1.5 accents
- Stroke caps/joins: `round`
- Color: `currentColor` (inherits from parent, respects `--color-text-muted` in nav)

For nav entries: render at 18×18px, color `currentColor`.
For page headers / empty states: render at 24×24px.

Do not use the gradient-filled variants (gold/cyan gradients) in application UI —
those are brand/marketing assets only. Use the stroke-only version in app context.

---

## Design Rules

These rules are binding. They apply to every screen in the Console.

1. **Gold is authority, not decoration.** `--color-gold` appears on: the scope header bar,
   the active nav marker stripe, and the logo mark. Nowhere else.
2. **Primary navy drives every action.** Buttons, links, interactive affordances: navy family.
   Never gold as a button fill.
3. **Scope before action.** The scope header bar is always visible when inside a tenant/store
   context. It is never hidden to save vertical space.
4. **Persistent banners, not toasts, for operational state.** If a condition requires
   attention (permission error, API degraded, session expiry warning), the banner stays.
5. **No nested cards.** Internal card grouping uses `--color-surface-raised` background
   with a top divider rule, never a child card component.
6. **Single primary per context.** No screen or dialog has more than one `.btn-primary` visible.
7. **Density over decoration.** Tables over cards for list data. No illustrative icons
   or empty decorative SVGs. If a cell has data, show it — no sparklines or micro-bars
   unless they carry information that text cannot.
8. **Flat by default.** Shadows respond to layering structure, not to hover decoration.
   `--shadow-card` on cards; `--shadow-pane` on dialogs; nothing on the workspace floor.
9. **Status colors are contained.** Semantic colors appear only on badges, banners, and
   alert callouts — never as button variants, hover tints, or brand fills.
10. **Touch-target floor: 36×36px minimum.** All interactive elements. The Console is
    primarily used on desktop monitors but keyboard navigation and mouse precision both
    require adequate target size.

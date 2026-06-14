---
name: Retail Tower Console
description: Dark-default command console for Retail Tower OS, with an AA-compliant light alternate. Gold is the sole authority signal; navy drives every action; tables are the surface.
colors:
  # Theme-agnostic brand + interactive primitives (identical hex in both themes)
  primary: "#1f4e7a"
  primary-hover: "#163d61"
  accent: "#2e7da3"
  gold: "#c8a24a"
  gold-strong: "#6f5320"
  # Dark theme surfaces (default)
  dark-bg: "#0d1520"
  dark-surface: "#131e2e"
  dark-surface-raised: "#1a2840"
  dark-surface-sunken: "#0a1018"
  dark-border: "#2a3d55"
  dark-text: "#e8eef5"
  dark-text-muted: "#8a9db5"
  dark-gold-soft: "#2a2010"
  # Light theme surfaces (alternate)
  light-bg: "#f4f7fa"
  light-surface: "#ffffff"
  light-surface-raised: "#eef2f7"
  light-surface-sunken: "#e7edf3"
  light-border: "#d4dde7"
  light-text: "#16202e"
  light-text-muted: "#566578"
  light-gold-soft: "#f4ecd6"
  # Semantic (state) — fills are theme-agnostic; on-surface text shifts per theme
  success: "#1f8a5b"
  warning: "#b87600"
  danger: "#b32e36"
  info: "#1e6f8c"
  # Semantic ROLE aliases — what components consume. Values shown are the DARK
  # default (the static snapshot); at runtime each role resolves to its light
  # primitive under [data-theme="light"] / prefers-color-scheme. See tokens.css.
  bg: "#0d1520"
  surface: "#131e2e"
  surface-sunken: "#0a1018"
  text: "#e8eef5"
  text-muted: "#8a9db5"
  gold-soft: "#2a2010"
typography:
  display:
    fontFamily: "Inter Variable, Inter, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Inter Variable, Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter Variable, Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Inter Variable, Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter Variable, Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  mono:
    fontFamily: "ui-monospace, Cascadia Code, JetBrains Mono, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "6px"
  control: "10px"
  card: "12px"
  dialog: "16px"
  pill: "9999px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "64px"
  s9: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "36px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#ffffff"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "36px"
  button-destructive:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    height: "36px"
  input:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
    height: "36px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.s5}"
  badge:
    rounded: "{rounded.pill}"
    height: "22px"
    padding: "0 8px"
    typography: "{typography.label}"
  nav-entry:
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "0 12px"
  scope-header:
    backgroundColor: "{colors.gold-soft}"
    textColor: "{colors.gold-strong}"
    height: "40px"
    padding: "0 32px"
---

# Design System: Retail Tower Console

## 1. Overview

**Creative North Star: "The Lit Command Desk"**

The Console is the seat from which one operator governs an entire retail platform: tenants,
stores, catalog, audit, money. It is not a marketing surface and not a retail counter. The
design answers a single question on every screen, *"where am I acting, and is the system
healthy,"* before it answers anything else. Authority reads as a quiet gold signal against a
deep navy field; every action reads as navy; the data itself, dense and legible, is the
content. Nothing decorates. If a pixel does not help an operator act correctly under time
pressure, it is removed.

This system is **dark by default and light by preference.** The default scene is concrete:
a platform admin reviewing tenant health on a multi-monitor desk, mid-evening, ambient light
low, gold accents projecting authority and reducing strain over a long session. That scene
sets the brand. But operators work in real rooms, including bright ones, and accessibility is
not optional, so a fully specified light alternate ships alongside the dark one and the
operator chooses. The toggle is a setting, not a theme war: the two themes are the same system
expressed on two grounds, sharing every token role, component, and rule. Only surface and text
primitives change.

It explicitly rejects the **Bootstrap-era CRUD admin** (dark navbar, blue primary buttons, a
flat wall of tables, 2015 Rails aesthetic) and the **bloated SaaS dashboard** (gradient hero
metrics, identical stat-card grids, glassmorphism, generic indigo, decorative motion). The
dark navbar is the trap nearest to us: we use a dark ground, so we must out-execute the cliche
with disciplined gold-as-authority, real density, and zero chrome, never coast on "dark looks
serious."

**Key Characteristics:**
- Dark default, AA-compliant light alternate, one shared system across both.
- Gold is authority only. Navy drives every action. The two never swap jobs.
- Density earns its place: tables over cards, information over whitespace, never clutter.
- Scope before action: the active tenant/store context is always legible.
- Flat by default; depth is structural, never decorative.

## 2. Colors

A deep navy field on dark, a faintly navy-tinted paper on light, both carrying a single gold
authority hue (72 deg) and a navy/teal interactive family (236 deg / 218 deg). The palette is
**Committed** on dark (the navy surface carries the identity) and **Restrained** on light (tinted
neutrals plus the same accents). No pure black, no pure white: every neutral is tinted toward
the 236 deg hue.

Tokens are theme-agnostic *roles* (`--color-bg`, `--color-text`, `--color-gold-strong`); each
role resolves to a dark or light primitive at runtime via `[data-theme]` or
`prefers-color-scheme`. The hex values below are the primitives behind each role.

### Primary
- **Command Navy** (`#1f4e7a`, oklch(36% 0.085 236)): the single action color. Primary button
  fills, active links, the focus family. Identical in both themes. White text on it scores 8.6:1.
- **Deep Command** (`#163d61`): primary hover.
- **Teal Marker** (`#2e7da3`, accent): focus rings and the active interactive stripe. Shared with
  POS-Pulse. Never an action fill on its own.

### Secondary
- **Tower Gold** (`#c8a24a`, oklch(70% 0.110 72)): the brand authority signal. On **dark** it
  carries the logo mark and the active-nav marker against the page field (7.6:1 on `#0d1520`), and
  the scope-header text against the gilded `--color-gold-soft` surface (`#2a2010`, 6.65:1). On
  **light** it is restricted to non-text use only (the nav marker stripe, the logo), because at 70%
  lightness it scores 2.4:1 on a light ground and fails text contrast.
- **Deep Gold / Gold-Strong** (`#6f5320`, oklch(44% 0.090 72)): the **light-theme** authority
  signal for anything that carries text or meaning (scope-header text, active breadcrumb). It must
  read on the gilded scope-header surface (`--color-gold-soft` `#f4ecd6`), not just on neutral
  surfaces, so it is set deep: 6.07:1 on the gold-soft ground and 6.07 to 7.16:1 on neutral light
  surfaces, AA pass. The mid-tone `#8a6a2a` was rejected, it scores only 4.27:1 on gold-soft and fails the
  4.5:1 text threshold (the scope label is 13px/600, not WCAG "large"). On dark it stays subdued.

### Tertiary (semantic state)
Fills are theme-agnostic; the text/icon tone shifts per theme to hold AA on the ground.
- **Confirmation Green** (`#1f8a5b`): success. On dark, text uses `#52b986`; on light, `#147a4d`.
- **Caution Amber** (`#b87600`): warning. Dark text `#d49030`; light text `#8a5a00`.
- **Alert Red** (`#b32e36`): danger. Dark text `#d16168` (lightened to 5.08:1 on the dark danger
  surface; the deeper `#c84d55` scored only 4.20:1 and failed); light text `#b32e36`.
- **Info Teal** (`#1e6f8c`): info. Dark text `#50a2c0`; light text `#1a6079`.

### Neutral

Dark theme:
- **Command Room** (`#0d1520`): page floor. **Deep Panel** (`#131e2e`): cards, panes.
- **Lifted Panel** (`#1a2840`): hover, elevation. **Recessed** (`#0a1018`): input wells, sidebar.
- **Quiet Edge** (`#2a3d55`): borders. **Star White** (`#e8eef5`): primary text (14:1+).
- **Mist** (`#8a9db5`): muted text (5:1+).

Light theme:
- **Paper** (`#f4f7fa`): page floor. **Card White** (`#ffffff`): cards, panes.
- **Soft Raise** (`#eef2f7`): hover, elevation. **Well** (`#e7edf3`): input wells, sidebar.
- **Hairline** (`#d4dde7`): borders. **Ink** (`#16202e`): primary text (15:1+).
- **Slate** (`#566578`): muted text (5.5:1+).

### Named Rules
**The Gold Authority Rule.** Gold is brand authority, never decoration and never an action. It
appears on exactly three things: the logo mark, the scope-header, and the active-nav marker.
Nowhere else, in either theme. On light, gold that carries text becomes `--color-gold-strong`
(`#6f5320`); the bright gold is reserved for the non-text marker and logo.

**The Two-Ground Rule.** Light is not a recolor of dark; it is the same role system resolved on
a light ground. A token role (`--color-text`) means the same thing in both themes; only its
primitive value differs. Never hardcode a hex where a role token exists, or the toggle breaks.

**The No-Extremes Rule.** Never `#000` or `#fff` as a surface. The darkest surface is `#0d1520`;
the lightest is `#ffffff` reserved for cards only, with the page floor a tinted `#f4f7fa`. Every
neutral carries chroma toward the 236 deg hue.

## 3. Typography

**Display / Body / Label Font:** Inter Variable (with Inter, Segoe UI, system-ui, -apple-system, sans-serif fallback)
**Mono Font:** ui-monospace (with Cascadia Code, JetBrains Mono, Consolas fallback)

**Character:** One sans family, full stop. Weight contrast alone carries hierarchy, no display
face, no Inter Tight. Mono is reserved for the things that must be unambiguous under audit: IDs,
request refs, UUIDs, scope context values. The voice is matter-of-fact, like the product: a
label says what it is in the fewest accurate words.

### Hierarchy
- **Display** (700, 1.875rem/30px, 1.25, -0.015em): the screen title. One per view, never more.
- **Headline** (600, 1.25rem/20px, 1.3, -0.01em): section header, panel title.
- **Title** (600, 1rem/16px, 1.375, -0.005em): card title, group label.
- **Body** (400, 0.875rem/14px, 1.5): paragraph and description text. Prose capped at 65ch; data
  tables run denser, up to 120ch+, which is correct for the surface.
- **Label** (600, 0.8125rem/13px, 1.25): badge, chip, table header. No all-caps, ever.
- **Caption** (400, 0.75rem/12px, 1.4): timestamps, secondary metadata.
- **Mono** (400, 0.8125rem/13px, 1.5): IDs, refs, audit strings. **Mono-lg** (500, 0.875rem/14px,
  0.04em): scope-header context values.

### Named Rules
**The Single-Voice Rule.** One typeface for the entire product UI. A heading is a heavier weight
and tighter tracking of the same family, never a different font. Display faces in labels, buttons,
or data are prohibited.

## 4. Elevation

**Flat by default.** Surfaces sit flat at rest; shadow is a response to layering structure, not to
hover. The workspace floor carries no shadow. Cards carry `--shadow-card`; dialogs and drawers
carry `--shadow-pane`; nothing else lifts. On dark, shadows flood toward the background hue
(`#0d1520`) so they never read as generic gray; on light, shadows are softer and cooler, tuned so
a card reads as raised paper, not a drop-shadow sticker.

### Shadow Vocabulary
- **sm** (`0 1px 2px rgba(0,0,0,0.3)` dark / `0 1px 2px rgba(22,32,46,0.08)` light): inline chips.
- **card** (`0 2px 4px / 0 8px 24px` flooded to `#0d1520` at 0.4/0.3 dark; softer cool on light):
  the standard resting card and pane.
- **raised** (`0 4px 12px / 0 1px 3px`): hover lift, used sparingly.
- **pane** (`0 20px 60px` at 0.7 dark / lighter on light): dialogs, drawers, overlays.
- **inset** (`inset 0 1px 0 rgba(255,255,255,0.04)` dark): recessed input wells on dark only.
- **gold-ring** (`0 0 0 3px rgba(200,162,74,0.25)`): the gold-tinted focus ring for scope elements.

### Named Rules
**The Flat-By-Default Rule.** If a surface has a shadow, it must be because it sits structurally
above another surface (card over floor, dialog over card). Shadow as hover decoration is forbidden.
A 2014-app smell test: if a flat list row gains a drop shadow on hover, the shadow is wrong, use a
background tint (`--color-surface-raised`) instead.

## 5. Components

Every interactive component ships all of its states: default, hover, focus-visible, active,
disabled, and where relevant loading, error, selected. Half a component is not shippable.
Affordances are consistent across every screen: the same button shape, the same form-control
vocabulary, the same icon style, screen to screen.

### Buttons
- **Shape:** gently rounded (`--radius-control`, 10px), 36px tall, 0 14px padding.
- **Primary:** Command Navy fill (`#1f4e7a`), white text, one per context. Hover deepens to
  `#163d61`; focus shows a 3px navy ring. Disabled drops to 0.4 opacity.
- **Secondary:** transparent fill, `--color-border-strong` border, surface text. Hover borrows the
  primary border and a faint navy-tint background.
- **Ghost:** no border, no background, muted text, 32px tall. For toolbar icon buttons and inline
  table actions. Hover gains a `--color-surface-raised` background.
- **Destructive:** Alert Red fill, white text, red focus ring. For irreversible actions only.

### Chips / Badges
- **Style:** pill (`--radius-pill`), 22px tall, label type, a 6px leading status dot in `currentColor`.
- **State:** success / warning / danger / info / neutral, each a tinted `*-surface` background with
  mid-ramp text tuned for AA on the active ground. Selected table rows tint to `--color-gold-soft`.

### Cards / Containers
- **Corner Style:** `--radius-card` (12px).
- **Background:** `--color-surface` (Deep Panel dark / Card White light), 1px `--color-border`.
- **Shadow Strategy:** `--shadow-card` at rest (see Elevation). No hover shadow.
- **Internal Padding:** `--space-5` (24px). Group internally with a `--color-surface-raised`
  section and a top divider rule, never a child card.

### Inputs / Fields
- **Style:** recessed well (`--color-surface-sunken`), 1px `--color-border`, `--radius-control`,
  36px min height.
- **Focus:** border shifts to Teal Marker with a 3px teal glow. No layout shift.
- **Error:** `aria-invalid="true"` shifts border to danger with a red glow. **Disabled:** muted
  placeholder; low-contrast disabled text is intentional (WCAG 1.4.3 exempts inactive controls).

### Navigation
- **Style:** left sidebar, 40px entries, `--radius-md`, 18px stroke icons in `currentColor`, muted
  text at rest. Hover gains `--color-surface-raised` + full-strength text.
- **Active:** a 3px **gold** marker stripe on the leading edge plus a faint navy-tint background.
  The gold marker is the Console's primary visual differentiator from POS-Pulse and the only
  persistent gold in navigation.
- **Mobile:** sidebar hides under 768px, top bar gains a hamburger; 1024px collapses to 60px
  icon-only; 1280px expands to 240px with labels.

### Scope Header (signature component)
A persistent bar directly below the 56px top bar whenever inside a tenant/store context. 40px tall,
`--color-gold-soft` background, gold text (bright on dark, `--color-gold-strong` on light). Always
shows `Tenant > Store` (or `All Stores` / `Platform`). This is the literal answer to "Scope before
action" and is never hidden to reclaim vertical space.

### Theme Toggle (signature component)
A ghost-button control in the top bar (sun/moon stroke icon) that switches `[data-theme]` between
`dark` and `light` and persists the choice. On first load, with no stored choice, the system
follows `prefers-color-scheme`, defaulting to dark when the OS expresses no preference. The control
is keyboard-reachable and announces the active theme. *(Implementation note for slice 003+: set
`[data-theme]` on the document element from a synchronous pre-hydration script to avoid a
flash-of-wrong-theme; persist to `localStorage`. The mockups demonstrate both themes statically.)*

### App Shell
Top bar (56px: gold logo lockup, scope selector, theme toggle, notifications, user menu) plus the
collapsible left sidebar plus a `flex: 1` scrolling content area on `--color-bg`. Content workspace:
no max-width (tables need room), `--space-7` (48px) block padding, `--space-6` (32px) inline padding
growing to 48px at 1440px+. Page headers are a display title plus optional subtitle plus a
right-aligned action cluster. Never a hero metric above a table: the data is the content.

### Icons
Shared Data-Pulse-2 brand icon system, 10 approved glyphs (`branch-ops`, `access-control`,
`catalog`, `inventory`, `pos-core`, `store-network`, `integrations`, `audit-compliance`,
`dashboard`, `security`). Contract: 24x24 viewBox, stroke-only (`fill: none`), 1.75 stroke primary
/ 1.5 accent, round caps and joins, `currentColor`. Nav renders at 18x18; page headers and empty
states at 24x24. The gradient-filled brand variants are marketing-only and prohibited in app UI.

## 6. Do's and Don'ts

### Do:
- **Do** keep gold to the three authority surfaces only (logo, scope header, active-nav marker),
  and on light swap text-bearing gold to `--color-gold-strong` (`#6f5320`) to hold AA.
- **Do** drive every action with the Command Navy family, and show exactly **one** `.btn-primary`
  per context: no screen or dialog has more than a single primary button visible at once.
- **Do** reach for a token *role* (`--color-bg`, `--color-text`), never a raw hex, so the
  dark/light toggle resolves correctly.
- **Do** contain status colors. Success/warning/danger/info appear only on badges, banners, and
  alert callouts, never as a button variant, a hover tint, or a brand fill.
- **Do** keep every interactive element to a **36x36px minimum touch target**. The Console is
  desktop-first, but keyboard navigation and mouse precision both require adequate target size.
- **Do** prefer a dense, well-organized table to a grid of cards for list data.
- **Do** keep operational state in a persistent banner, not a toast: permission errors, degraded
  API, session-expiry warnings stay until resolved.
- **Do** meet WCAG AA in both themes. Every text/surface pair in this spec is contrast-verified
  on its *actual* ground, including text on tinted surfaces (gold text on the gilded scope header,
  semantic text on its badge/alert surface), not just text on the neutral surfaces.
- **Do** respect `prefers-reduced-motion`: collapse all durations to 0ms, transitions to instant.

### Don't:
- **Don't** build the **Bootstrap-era CRUD admin**: dark navbar with blue primary buttons and a
  flat wall of tables. We share its dark ground, so we must out-execute it, never resemble it.
- **Don't** build the **bloated SaaS dashboard**: gradient hero metrics, identical stat-card grids,
  glassmorphism panels, generic purple/indigo, decorative animation.
- **Don't** use gold as a button fill, a badge color, or any decorative flourish, in either theme.
- **Don't** use a `border-left`/`border-right` greater than 1px as a colored accent stripe on cards,
  rows, callouts, or alerts. Use full borders, background tints, or leading icons.
- **Don't** nest cards. Group inside a card with a raised-surface section and a divider rule.
- **Don't** animate layout properties, add bounce/elastic easing, or run page-load choreography.
  Motion confirms state change; it does not entertain.
- **Don't** let any pattern look like a default component library with the theme left unchanged.
- **Don't** claim or duplicate POS-Pulse's palette. POS-Pulse owns its own light token set (see
  the sibling-system note below); Console-light harmonizes with it but is defined here independently.

---

> **Sibling system (boundary note):** POS-Pulse is the retail-counter app and owns its own
> light-theme token set; per the project constitution this repo must not reproduce or take
> ownership of POS-Pulse concerns. Both systems share the same semantic color roles, the same
> motion tokens, and the same single-sans / component conventions, and they are deliberately
> compatible. The Console now ships both a dark default and a light alternate; its light theme is
> designed to harmonize with POS-Pulse light, not to mirror or override it. POS-Pulse tokens are
> not reachable from this repo, so any cross-system value here is an intentional independent choice,
> stated, not silently copied.

> **Version 1.0** — supersedes v0.1. Engages the converged "Vision 4" mockups
> (`docs/design/_vision/`), introduces the dark-default + light-alternate theming model, and
> migrates to the Stitch DESIGN.md format. Re-run `/impeccable document` after the first themed
> component slice ships to capture real rendered tokens.

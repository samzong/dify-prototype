---
version: alpha
name: Dify Prototype
description: Source-faithful frontend prototype design system for Dify screens, derived from the synced Dify web source and @langgenius/dify-ui.
colors:
  primary: "#155aef"
  primary-hover: "#004aeb"
  primary-active: "#296dff"
  primary-soft: "#eff4ff"
  secondary: "#354052"
  tertiary: "#676f83"
  neutral: "#f2f4f7"
  neutral-25: "#fcfcfd"
  neutral-50: "#f9fafb"
  neutral-100: "#f2f4f7"
  neutral-200: "#e9ebf0"
  neutral-300: "#d0d5dc"
  neutral-400: "#98a2b2"
  neutral-900: "#101828"
  surface: "#ffffff"
  surface-subtle: "#fcfcfd"
  surface-section: "#f9fafb"
  surface-burn: "#e9ebf0"
  on-surface: "#101828"
  on-surface-secondary: "#354052"
  on-surface-tertiary: "#676f83"
  panel: "#ffffff"
  panel-item: "#ffffff"
  panel-item-hover: "#f9fafb"
  card: "#fcfcfd"
  card-border: "#ffffff"
  input-bg: "rgba(200, 206, 218, 0.25)"
  input-bg-hover: "rgba(200, 206, 218, 0.14)"
  input-border-active: "#d0d5dc"
  divider-subtle: "rgba(16, 24, 40, 0.04)"
  divider-regular: "rgba(16, 24, 40, 0.08)"
  divider-deep: "rgba(16, 24, 40, 0.14)"
  state-hover: "rgba(200, 206, 218, 0.2)"
  state-active: "rgba(200, 206, 218, 0.4)"
  workflow-bg: "#f2f4f7"
  workflow-block: "#fcfcfd"
  workflow-block-param: "#f2f4f7"
  workflow-line: "#d0d5dc"
  success: "#17b26a"
  warning: "#f79009"
  error: "#f04438"
  on-primary: "#ffffff"
  dark-surface: "#222225"
  dark-background: "#1d1d20"
  dark-on-surface: "#fbfbfc"
typography:
  title-4xl-semi-bold:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0em
  title-3xl-semi-bold:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0em
  title-2xl-semi-bold:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0em
  title-xl-semi-bold:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0em
  system-md-semibold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0em
  system-md-regular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0em
  system-sm-medium:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0em
  system-xs-regular:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0em
  system-xs-medium:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0em
  system-2xs-medium-uppercase:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: 500
    lineHeight: 12px
    letterSpacing: 0em
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 10px
  xl: 12px
  workflow-node: 15px
  panel: 12px
  full: 9999px
spacing:
  unit: 8px
  hairline: 0.5px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  page-x: 48px
  header-height: 56px
  panel-width: 430px
  rail-width: 212px
  app-card-height: 160px
  knowledge-card-height: 190px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.system-sm-medium}"
    rounded: "{rounded.md}"
    height: 32px
    padding: 14px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.system-sm-medium}"
    rounded: "{rounded.md}"
    height: 32px
    padding: 14px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.secondary}"
    typography: "{typography.system-sm-medium}"
    rounded: "{rounded.md}"
    height: 32px
    padding: 8px
  input-field:
    backgroundColor: "{colors.input-bg}"
    textColor: "{colors.on-surface}"
    typography: "{typography.system-sm-medium}"
    rounded: "{rounded.md}"
    height: 32px
    padding: 12px
  card-app:
    backgroundColor: "{colors.card}"
    textColor: "{colors.on-surface-secondary}"
    rounded: "{rounded.xl}"
    height: "{spacing.app-card-height}"
    padding: 14px
  card-knowledge:
    backgroundColor: "{colors.card}"
    textColor: "{colors.on-surface-secondary}"
    rounded: "{rounded.xl}"
    height: "{spacing.knowledge-card-height}"
    padding: 16px
  panel-side:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    width: "{spacing.panel-width}"
    padding: 16px
  segmented-control:
    backgroundColor: "{colors.state-hover}"
    textColor: "{colors.on-surface-tertiary}"
    typography: "{typography.system-xs-medium}"
    rounded: "{rounded.md}"
    padding: 4px
  segmented-control-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-secondary}"
    typography: "{typography.system-xs-medium}"
    rounded: "{rounded.sm}"
    padding: 8px
  badge:
    backgroundColor: "{colors.state-hover}"
    textColor: "{colors.on-surface-tertiary}"
    typography: "{typography.system-2xs-medium-uppercase}"
    rounded: "{rounded.sm}"
    padding: 8px
  workflow-canvas:
    backgroundColor: "{colors.workflow-bg}"
    textColor: "{colors.on-surface}"
  workflow-node:
    backgroundColor: "{colors.workflow-block}"
    textColor: "{colors.on-surface-secondary}"
    typography: "{typography.system-sm-medium}"
    rounded: "{rounded.workflow-node}"
    width: 240px
    padding: 12px
---

# Dify Prototype Design System

## Overview

Dify Prototype is not a new visual brand. It is a source-faithful prototype workspace for Dify frontend screens. The design goal is to make local prototypes look and behave like real Dify web surfaces, using the synced upstream source as the hard visual authority.

The current prototype imports `@langgenius/dify-ui/styles.css`, `dify-source/web/app/styles/preflight.css`, `dify-source/web/themes/manual-light.css`, `dify-source/web/themes/manual-dark.css`, and the Dify icon plugin. The synchronized upstream snapshot is recorded in `.dify-source.json`; at the time this file was written it points to `langgenius/dify` commit `a15ecf6becd476f078a08c1bdc999d47ee315800`.

This system should feel like a dense, production Dify workspace: quiet, practical, high-information, and built for repeated use. Prototype screens should start with usable product UI, not marketing pages or decorative compositions.

## Colors

The palette is Dify's existing workbench palette. It is based on light neutral surfaces, dark gray text, a single blue interaction accent, subtle dividers, and low-alpha hover states.

- **Primary blue:** Use `#155aef` for primary actions, selected navigation, active tabs, and important links. Use `#004aeb` for primary hover states and `#296dff` for active or selected accents where the source uses the brighter blue.
- **Neutral surfaces:** Use `#f2f4f7` for page and workflow backgrounds, `#fcfcfd` for cards, and `#ffffff` for panels, popovers, selected segmented-control items, and raised controls.
- **Text:** Use `#101828` for primary text, `#354052` for titles and control text, `#676f83` for metadata, placeholders, and secondary controls.
- **Borders and dividers:** Prefer 0.5px or 1px borders with low-alpha gray values such as `rgba(16, 24, 40, 0.04)`, `0.08`, and `0.14`. Heavy outlines are not part of this system.
- **Workflow colors:** Workflow canvas uses `#f2f4f7`, blocks use `#fcfcfd`, and node icon accents come from Dify icon background tokens such as blue, green, indigo, warning, and violet.
- **Dark mode:** Dark tokens exist in `packages/dify-ui/src/themes/dark.css`; only mirror them when the prototype implements actual theme switching. Do not invent a separate dark palette.

## Typography

Typography uses Inter through Dify utility classes. The prototype should use the local utilities from `packages/dify-ui/src/styles/utilities.css` rather than ad hoc text sizing.

- **Titles:** Use `title-*` utilities for page titles, dialog titles, cards with strong names, and sign-in headings. Keep title scale modest inside workbench surfaces.
- **System text:** Use `system-*` utilities for labels, controls, metadata, badges, side panels, and dense settings UI.
- **Body text:** Use `body-*` utilities for explanatory text where a slightly more relaxed reading rhythm is required.
- **Uppercase labels:** Use `system-2xs-medium-uppercase`, `system-xs-semibold-uppercase`, or `system-sm-semibold-uppercase` for compact section labels and badges.
- **No viewport-scaled type:** Text size should remain stable across desktop and mobile. Responsive layout changes should not be achieved by scaling fonts with viewport width.

## Layout

Layouts should follow Dify workspace structure rather than landing-page structure.

- Use compact headers around 56px tall, sticky top bars, and dense control rows.
- Page gutters are typically 48px on desktop product pages, with card grids using 12-16px gaps.
- Cards are fixed-height and information-dense: app cards are about 160px tall and knowledge cards are about 190px tall in the current prototype.
- Workflow screens use a full-height shell: top bar, optional left node rail, central dotted canvas, and a fixed right settings panel around 430px wide.
- Keep interactions within the current work surface. Use panels, popovers, segmented controls, tabs, drawers, and dialogs as Dify source does.
- Do not create a hero section, decorative intro page, oversized marketing copy, abstract illustration, or ornamental gradient background for normal prototype screens.

## Elevation & Depth

Depth is functional and restrained. Dify uses tonal separation, hairline borders, and soft shadows rather than dramatic elevation.

- Cards use `shadow-xs` or `shadow-sm` at rest and may move to `shadow-md` or `shadow-lg` on hover when the source pattern does so.
- Panels and side drawers can use `shadow-xl`, especially when they sit above a workflow canvas.
- Buttons and selected nav items may use `shadow-xs` or `shadow-md`; secondary buttons may include subtle backdrop blur when sourced from `@langgenius/dify-ui/button`.
- Avoid dark, large, or theatrical shadows. The UI should read as a precise product surface, not a presentation mockup.

## Shapes

The shape language is softly technical.

- Use 8px radius for most buttons, filter chips, row hover targets, and small controls.
- Use 10px radius for larger controls and icon tiles where Dify source uses `rounded-[10px]`.
- Use 12px radius for app cards, knowledge cards, grouped settings panels, and picker containers.
- Workflow node cards use a larger rounded shell: 16px outside with a 15px inner block in the current prototype.
- Badges and tags use 6px radius unless the source calls for a pill.
- Do not mix sharp editorial shapes or highly rounded playful components into Dify workspace screens.

## Components

Use Dify primitives first. In this repository that means importing from `@langgenius/dify-ui/*` for buttons, inputs, fields, forms, checkboxes, switches, selects, sliders, tabs, popovers, tooltips, dialogs, drawers, and toasts.

### Buttons

Use `Button` from `@langgenius/dify-ui/button`. Primary actions use Dify blue, secondary actions use white surfaces with 0.5px borders and subtle shadows, ghost actions use text plus hover fill. Do not hand-roll button styling unless a source-equivalent primitive is unavailable.

### Inputs And Fields

Use `Input`, `FieldRoot`, `FieldLabel`, `FieldControl`, and related Dify UI form primitives. Inputs use low-alpha gray backgrounds, active borders, and Inter system typography. Labels sit above controls in settings panels and forms.

### Cards

App and knowledge cards are dense, fixed-format containers with icon tiles, title, metadata, short description, tags, and small footer stats. They use Dify card tokens, subtle borders, and hover shadows. Do not convert cards into large marketing tiles.

### Navigation

Top navigation is compact and centered in the header. Active nav items use a white selected surface, blue active text, and a soft shadow. Workspace selector, sandbox badge, theme/settings buttons, and avatar controls follow the real Dify header density.

### Workflow

Workflow screens must use a canvas-first layout. Nodes sit on a dotted canvas, connections are thin lines, node icons come from Dify workflow icon classes, and settings live in a right side panel. Knowledge Retrieval settings should preserve Dify field order: query variables, selected knowledge, retrieval settings, metadata filtering, and output variables.

### Icons

Use Dify icon systems: `i-ri-*`, `i-custom-*`, `@remixicon/react`, and synced SVG assets. Icons should be functional and small, usually 12-20px. Do not create custom decorative SVGs for standard controls.

## Do's and Don'ts

- Do run `pnpm sync:dify` before creating or updating a Dify prototype screen.
- Do locate the closest real Dify source path before designing a screen.
- Do reuse `@langgenius/dify-ui` primitives, Dify CSS tokens, Dify icon classes, and synced layout structure.
- Do keep product screens dense, scannable, and operational.
- Do use local fixtures or adapters for data; mock behavior is allowed when clearly local.
- Do verify rendered UI visually before claiming a screen is complete.
- Don't invent colors, spacing, typography, shadows, radii, table styles, dialogs, or page structures when Dify source has an equivalent.
- Don't edit synced upstream mirrors directly; put prototype adapters, fixtures, and new screens in the prototype app or prototype kit.
- Don't connect prototypes to real Dify backend services unless explicitly requested.
- Don't make landing pages, hero sections, decorative backgrounds, or abstract brand art for ordinary Dify workspace screens.
- Don't expose low-level backend or storage vocabulary in normal user-facing UI when the product language should be Dify `datasets`, Knowledge, apps, and workflow nodes.

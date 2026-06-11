# Dify Prototype Agent Rules

## Mission

This project creates source-faithful Dify frontend prototypes. The goal is not "Dify-like" UI. The goal is prototype screens that follow real Dify frontend source for layout, components, tokens, typography, spacing, icons, dialogs, tables, states, and visual behavior.

## Source Of Truth

Do not assume Dify exists on the local machine.

Default upstream:

- `https://github.com/langgenius/dify.git`

Two commands manage the upstream mirror:

- `pnpm sync:dify` materializes the mirror at the commit pinned in `.dify-source.json`. Idempotent, produces no git diff. Run it after a fresh clone or whenever the mirror is missing.
- `pnpm bump:dify` advances the pin to the upstream `main` HEAD and re-materializes. It produces a one-line pin change in `.dify-source.json`; commit it as `chore: bump dify to <sha>`.

Before creating or updating a Dify prototype screen, run:

```bash
pnpm bump:dify
```

These two commands are the only sync interface. Do not add flags, alternate modes, local-path assumptions, version selectors, or extra workflow options unless the user explicitly asks.

## Synced Sources

The sync commands fetch Dify into `.dify-upstream/`, then copy approved frontend sources into this repository.

The mirror directories (`dify-source/`, `packages/dify-ui`, `packages/iconify-collections`, `packages/tsconfig`) are generated artifacts: gitignored, never committed, always reproducible from the pin in `.dify-source.json`. They must stay searchable for agents — the root `.ignore` file re-includes them for ripgrep-based search tools. If a search under `dify-source/` returns nothing, first verify the mirror is materialized (run `pnpm sync:dify`) instead of concluding the source does not exist.

Primary synced sources:

- `packages/dify-ui`
- `packages/iconify-collections`
- `packages/tsconfig`
- `dify-source/web/app/styles`
- `dify-source/web/themes`
- `dify-source/web/public`
- `dify-source/web/app/signin`
- `dify-source/web/app/components/base`
- `dify-source/web/app/components/header`
- `dify-source/web/app/components/app-sidebar`
- `dify-source/web/app/components/apps`
- `dify-source/web/app/components/app`
- `dify-source/web/app/components/datasets`
- `dify-source/web/app/components/workflow`
- `dify-source/web/features/tag-management`
- `dify-source/web/i18n/en-US`

`.dify-source.json` records the upstream repo, branch, commit, and synced paths.

## Hard Rules

- Do not invent Dify colors, spacing, radii, shadows, typography, table styles, dialog styles, button styles, or page structure when Dify source has an equivalent.
- Use `@langgenius/dify-ui/*` primitives for buttons, dialogs, drawers, dropdowns, fields, forms, inputs, tabs, popovers, tooltips, selects, switches, checkboxes, and related controls.
- Use Dify CSS tokens and Tailwind utility classes from the synced source.
- Use Dify icon systems from the synced source: `i-ri-*`, `i-custom-*`, `@remixicon/react`, and Dify SVG icon components.
- Mock data is allowed. Fake visual styling is not.
- Do not connect prototypes to real Dify backend services unless the user explicitly requests it.
- Do not edit synced upstream mirrors directly. Put prototype adapters, fixtures, and new screens in the prototype app or prototype kit.

## DESIGN.md Memory

Before creating or updating a prototype screen, read root `DESIGN.md` after syncing and locating the closest Dify source paths.

`DESIGN.md` is the project design-memory layer for agents. It summarizes the durable Dify Prototype visual rules, tokens, component constraints, and maintenance expectations. It does not override synced Dify source; when `DESIGN.md` conflicts with real Dify source, trust the source and update `DESIGN.md` if the rule has changed.

Maintain `DESIGN.md` whenever any durable prototype design rule changes, including visual authority, token usage, typography, spacing, radii, elevation, component usage, icon systems, screen layout patterns, or recurring do/don't guidance.

After editing `DESIGN.md`, validate it with:

```bash
pnpm dlx @google/design.md lint DESIGN.md
```

Keep `DESIGN.md` and this file in English because they are repository-tracked agent instructions.

## Vocabulary

- `knowledgebase`, `knowledge base`, and `知识库` map to Dify `datasets`.
- A knowledgebase creation page maps first to Dify dataset creation source under `dify-source/web/app/components/datasets/create`.
- Login and sign-in screens map first to `dify-source/web/app/signin`.
- App list/detail/create screens map first to `dify-source/web/app/components/apps` and `dify-source/web/app/components/app`.
- Workflow screens map first to `dify-source/web/app/components/workflow`.
- Header and navigation shells map first to `dify-source/web/app/components/header` and `dify-source/web/app/components/app-sidebar`.

## Prototype Workflow

When asked to create a screen:

1. Run `pnpm bump:dify`.
2. Locate the closest real Dify source paths.
3. Reuse Dify primitives, tokens, icons, and layout structure.
4. Replace backend/service calls with local fixtures or adapters.
5. State which Dify source paths were used.
6. Verify the rendered prototype visually before claiming it is done.

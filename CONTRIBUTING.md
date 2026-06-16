# Contributing to Dify Prototype

This repository builds source-faithful Dify frontend prototypes. Follow these rules so multiple contributors can work in parallel without merge conflicts.

## Prerequisites

```bash
pnpm install
pnpm sync:dify   # if dify-source/ or packages/* are missing
```

Before UI work that tracks upstream Dify, run `pnpm bump:dify` and read `DESIGN.md` plus the closest paths under `dify-source/`.

## Repository layout

| Layer | Path | Role |
| --- | --- | --- |
| Pin | `.dify-source.json` | Upstream commit pin (tracked) |
| Mirror | `dify-source/`, `packages/*` | Generated from pin (gitignored) |
| Prototype app | `apps/prototype/` | Vite SPA, mock-backed screens |
| Agent rules | `AGENTS.md`, `DESIGN.md` | Visual and workflow constraints |

Do not edit files under `dify-source/` or other synced mirrors. Put adapters, fixtures, and new screens under `apps/prototype/`.

## Prototype app structure (`apps/prototype/src`)

Phase 1–3 established the layout below. Do not add new root-level feature files when a feature folder exists.

```text
src/
  main.tsx
  styles.css
  App.tsx                 # re-exports app/App.tsx

  app/                    # thin compose shell
    App.tsx
    AppProviders.tsx
    AuthenticatedApp.tsx

  routing/                # URL is source of truth (Dify-shaped paths)
  preferences/            # auth + theme client persistence
  shared/                 # cross-feature, no product semantics
    components/
    constants.ts
    icons/

  features/               # one folder per Dify product domain
    signin/               # /signin
    studio/               # /apps
    datasets/             # /datasets/* — DatasetsSection, views/, fixtures/types + dataset-items/
    workflow/             # /app/:id/workflow
    settings/             # ?settings=* — types.ts, fixtures/

  shell/                  # header, top nav, account dropdown
    Header.tsx
    AccountDropdown.tsx
    components/
```

### URL vocabulary (must match routing)

| Prototype area | URL | Dify source anchor |
| --- | --- | --- |
| Sign in | `/signin` | `dify-source/web/app/signin` |
| Studio | `/apps` | `dify-source/web/app/components/apps` |
| Knowledge base list | `/datasets` | `dify-source/web/app/components/datasets/list` |
| Dataset detail tabs | `/datasets/:id/overview`, `/sources`, `/documents`, `/hitTesting`, `/quality`, `/settings`, `/pipeline` | `dify-source/web/app/components/app-sidebar/dataset-detail-section.tsx` |
| Dataset create | `/datasets/create`, `/create-from-pipeline`, `/connect` | `dify-source/web/app/components/datasets/create` |
| Workflow | `/app/:appId/workflow` | `dify-source/web/app/components/workflow` |
| Workspace settings | `?settings=provider` etc. | `dify-source/web/app/components/header/account-setting` |

Use `routing/prototype-location.ts` and `routing/dataset-routes.ts` for path parsing and building. Internal route sections use `studio`, `datasets`, and `workflow`. Dataset sidebar tabs must update the URL (no local-only tab state). Do not invent parallel path enums in feature code.

## Import boundaries

These rules reduce cross-team conflicts:

1. **`features/A` must not import `features/B` internals.** Share through `shared/`, `routing/`, or explicit public entry files only.
2. **`routing/` and `preferences/` must not import feature UI.** Import neutral types from `features/settings/types.ts` (e.g. `SettingsTab`) instead of view modules.
3. **Fixtures stay inside the owning feature** (`features/studio/fixtures`, `features/settings/fixtures`, …). Do not import another feature's fixtures.
4. **`app/App.tsx` composes features; it must not grow business UI.** Keep it ≤150 lines; route orchestration lives in `AuthenticatedApp.tsx`.
5. **Provider logos** come from synced Dify SVG or Marketplace icon URLs — never letter placeholders (see `AGENTS.md`).

## File size and naming

- Page or layout files: **≤300 lines**. Split into `views/` or `components/` before exceeding that.
- Name directories after **Dify product terms**: `datasets` not `knowledge`, `studio` maps to `/apps`.
- Avoid iteration suffixes (`Knowledge2`, `v2`) in new code; rename when touching a module in a dedicated refactor PR.

## Parallel development ownership

| Directory | Typical owner / PR scope |
| --- | --- |
| `features/studio/` | Studio list, app cards |
| `features/datasets/` | Knowledge list, detail tabs |
| `features/settings/` | Account settings tabs |
| `features/workflow/` | Workflow canvas |
| `routing/` | Infra — coordinate before merging |
| `shell/` | Header and global nav |
| `shared/` | Cross-feature widgets — coordinate |

One PR should prefer **one feature directory** (or one infra area). Do not mix feature work with large moves across unrelated folders.

## Worktrees (recommended)

Use [gmc](https://github.com/samzong/gmc) for isolated work:

```bash
gmc wt share add .local --strategy link   # once per clone
gmc wt add my-feature -b main
cd ../dify-prototype--my-feature
pnpm install && pnpm sync:dify
```

Shared `.local` is linked into new worktrees automatically after `gmc wt share add`.

## Verification

Before claiming a UI change is done:

```bash
pnpm -C apps/prototype build
pnpm -C apps/prototype dev   # visual check in browser
```

## Commits and PRs

- Conventional commits in English: `feat(prototype): …`, `refactor(prototype): …`, `chore: bump dify to <sha>`.
- Dify pin bumps: single-line change in `.dify-source.json` only.
- Describe which Dify source paths were used for new or updated screens.

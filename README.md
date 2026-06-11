# Dify Prototype

Source-faithful Dify frontend prototype workspace.

Setup after clone:

```bash
pnpm sync:dify
pnpm install
```

`pnpm sync:dify` materializes the Dify frontend mirror (`dify-source/`, synced `packages/*`) at the commit pinned in `.dify-source.json`. The mirror is gitignored and fully reproducible from the pin. Run sync before install: the workspace declares `file:` dependencies on synced packages.

To advance the pin to the latest upstream `main`:

```bash
pnpm bump:dify
```

This rewrites the pin in `.dify-source.json` (a one-line diff) and re-materializes the mirror. Upstream is `https://github.com/langgenius/dify.git`.

Synced source is the visual authority. Prototype code should reuse Dify tokens, primitives, icons, assets, and page/component structure instead of inventing styles.

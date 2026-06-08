# Dify Prototype

Source-faithful Dify frontend prototype workspace.

Run:

```bash
pnpm sync:dify
```

The sync command fetches `https://github.com/langgenius/dify.git`, copies the approved frontend design sources into this project, and records the exact upstream commit in `.dify-source.json`.

Synced source is the visual authority. Prototype code should reuse Dify tokens, primitives, icons, assets, and page/component structure instead of inventing styles.

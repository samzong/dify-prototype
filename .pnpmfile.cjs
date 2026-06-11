const { execFileSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const path = require('node:path')

// The workspace declares file: dependencies on synced Dify packages.
// The mirror is gitignored, so on fresh checkouts (CI included) it must be
// materialized before pnpm resolves dependencies. pnpm loads this file
// before resolution, which makes it the only reliable pre-install hook.
const mirror = path.join(__dirname, 'packages/iconify-collections')
if (!existsSync(mirror)) {
  console.log('[pnpmfile] Dify mirror missing - running sync:dify before install')
  execFileSync('node', [path.join(__dirname, 'scripts/sync-dify.mjs'), 'sync'], { stdio: 'inherit' })
}

module.exports = {}

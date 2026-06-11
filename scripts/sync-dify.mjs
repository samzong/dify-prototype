import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const upstreamUrl = 'https://github.com/langgenius/dify.git'
const upstreamBranch = 'main'
const upstreamRoot = path.join(root, '.dify-upstream')
const repoDir = path.join(upstreamRoot, 'repo')
const manifestPath = path.join(root, '.dify-source.json')

const mode = process.argv[2] ?? 'sync'
if (mode !== 'sync' && mode !== 'bump') {
  console.error(`Unknown mode: ${mode}. Use "sync" (materialize pinned commit) or "bump" (advance pin to upstream HEAD).`)
  process.exit(1)
}

const syncedDirs = [
  ['packages/dify-ui', 'packages/dify-ui'],
  ['packages/iconify-collections', 'packages/iconify-collections'],
  ['packages/tsconfig', 'packages/tsconfig'],
  ['web/app/styles', 'dify-source/web/app/styles'],
  ['web/themes', 'dify-source/web/themes'],
  ['web/app/signin', 'dify-source/web/app/signin'],
  ['web/app/components/base', 'dify-source/web/app/components/base'],
  ['web/app/components/header', 'dify-source/web/app/components/header'],
  ['web/app/components/app-sidebar', 'dify-source/web/app/components/app-sidebar'],
  ['web/app/components/apps', 'dify-source/web/app/components/apps'],
  ['web/app/components/app', 'dify-source/web/app/components/app'],
  ['web/app/components/datasets', 'dify-source/web/app/components/datasets'],
  ['web/app/components/workflow', 'dify-source/web/app/components/workflow'],
  ['web/features/tag-management', 'dify-source/web/features/tag-management'],
  ['web/i18n/en-US', 'dify-source/web/i18n/en-US'],
]

const publicEntries = [
  'apple-touch-icon.png',
  'browserconfig.xml',
  'favicon.ico',
  'manifest.json',
  'logo',
]

function run(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    ...options,
  })
}

function capture(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    ...options,
  }).trim()
}

function readManifest() {
  if (!existsSync(manifestPath))
    return null
  return JSON.parse(readFileSync(manifestPath, 'utf8'))
}

function ensureParent(target) {
  mkdirSync(path.dirname(target), { recursive: true })
}

function copyPath(sourceRelative, targetRelative) {
  const source = path.join(repoDir, sourceRelative)
  const target = path.join(root, targetRelative)

  if (!existsSync(source))
    throw new Error(`Missing Dify source path: ${sourceRelative}`)

  rmSync(target, { recursive: true, force: true })
  ensureParent(target)
  cpSync(source, target, { recursive: true })
}

function copyPublic() {
  const sourcePublic = path.join(repoDir, 'web/public')
  const targetPublic = path.join(root, 'dify-source/web/public')
  rmSync(targetPublic, { recursive: true, force: true })
  mkdirSync(targetPublic, { recursive: true })

  for (const entry of publicEntries)
    copyPath(`web/public/${entry}`, `dify-source/web/public/${entry}`)

  for (const entry of readdirSync(sourcePublic)) {
    if (!/^icon-\d+x\d+\.png$/.test(entry))
      continue

    const source = path.join(sourcePublic, entry)
    if (!statSync(source).isFile())
      continue

    copyPath(`web/public/${entry}`, `dify-source/web/public/${entry}`)
  }
}

function ensureRepo() {
  mkdirSync(upstreamRoot, { recursive: true })

  if (!existsSync(repoDir)) {
    run('git', ['clone', '--depth', '1', '--branch', upstreamBranch, upstreamUrl, repoDir])
    return
  }

  run('git', ['-C', repoDir, 'remote', 'set-url', 'origin', upstreamUrl])
}

function checkoutCommit(commit) {
  const head = capture('git', ['-C', repoDir, 'rev-parse', 'HEAD'])
  if (head === commit)
    return

  run('git', ['-C', repoDir, 'fetch', '--depth', '1', 'origin', commit])
  run('git', ['-C', repoDir, 'checkout', '--detach', commit])
}

function checkoutUpstreamHead() {
  run('git', ['-C', repoDir, 'fetch', '--depth', '1', 'origin', upstreamBranch])
  run('git', ['-C', repoDir, 'checkout', '--detach', 'FETCH_HEAD'])
  return capture('git', ['-C', repoDir, 'rev-parse', 'HEAD'])
}

function writeManifest(commit) {
  const manifest = {
    repo: upstreamUrl,
    branch: upstreamBranch,
    commit,
    syncedAt: new Date().toISOString(),
    paths: [
      ...syncedDirs.map(([, target]) => target),
      'dify-source/web/public',
    ],
  }

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
}

function materialize() {
  for (const [source, target] of syncedDirs)
    copyPath(source, target)

  copyPublic()
}

ensureRepo()

if (mode === 'bump') {
  const previous = readManifest()?.commit
  const commit = checkoutUpstreamHead()
  materialize()

  if (commit === previous) {
    console.log(`Dify pin already at upstream HEAD ${commit}`)
  }
  else {
    writeManifest(commit)
    console.log(`Bumped Dify pin to ${commit} (${upstreamUrl} ${upstreamBranch})`)
  }
}
else {
  const manifest = readManifest()
  if (!manifest?.commit) {
    console.error('No pinned commit in .dify-source.json. Run "pnpm bump:dify" first.')
    process.exit(1)
  }

  checkoutCommit(manifest.commit)
  materialize()
  console.log(`Synced Dify ${manifest.commit} from ${upstreamUrl}`)
}

import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const upstreamUrl = 'https://github.com/langgenius/dify.git'
const upstreamBranch = 'main'
const upstreamRoot = path.join(root, '.dify-upstream')
const repoDir = path.join(upstreamRoot, 'repo')

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

function syncRepo() {
  mkdirSync(upstreamRoot, { recursive: true })

  if (!existsSync(repoDir)) {
    run('git', ['clone', '--depth', '1', '--branch', upstreamBranch, upstreamUrl, repoDir])
    return
  }

  run('git', ['-C', repoDir, 'remote', 'set-url', 'origin', upstreamUrl])
  run('git', ['-C', repoDir, 'fetch', '--depth', '1', 'origin', upstreamBranch])
  run('git', ['-C', repoDir, 'checkout', '--detach', 'FETCH_HEAD'])
}

function writeSourceManifest(commit) {
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

  writeFileSync(
    path.join(root, '.dify-source.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )
}

syncRepo()

const commit = capture('git', ['-C', repoDir, 'rev-parse', 'HEAD'])

for (const [source, target] of syncedDirs)
  copyPath(source, target)

copyPublic()
writeSourceManifest(commit)

console.log(`Synced Dify ${commit} from ${upstreamUrl}`)

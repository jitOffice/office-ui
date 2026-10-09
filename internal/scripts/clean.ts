/**
 * 清理构建产物（根 `pnpm clean`）。
 *
 * 不用 `rm -rf packages/<name>/dist`：那行在本仓库的开发机（Windows）上根本跑不起来，
 * 而且会连**入库的** `packages/tokens/dist` 一起删掉 —— 门禁和 `exports` 检查读的就是它，
 * 删完 `git status` 只显示六个文件被删，很容易被当成自己的改动一起提交。
 */

import { readdirSync, rmSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const rootSep = repoRoot + sep

/** 入库的生成产物：只由 `pnpm tokens:gen` 重建，clean 不碰。 */
const TRACKED_DIST = new Set([join('packages', 'tokens', 'dist')])

const removed: string[] = []

/** 某个包的产物目录（相对仓库根的绝对路径）。 */
function distDir(pkg: string, name = 'dist'): string {
  return join(repoRoot, 'packages', pkg, name)
}

function isDir(abs: string): boolean {
  try {
    return statSync(abs).isDirectory()
  } catch {
    return false
  }
}

function wipe(abs: string, rel: string): void {
  if (TRACKED_DIST.has(rel)) return
  rmSync(abs, { recursive: true, force: true })
  removed.push(rel)
}

for (const pkg of readdirSync(join(repoRoot, 'packages'))) {
  for (const name of ['dist', '.turbo']) {
    const abs = distDir(pkg, name)
    if (isDir(abs)) wipe(abs, relativeToRoot(abs))
  }
}

for (const abs of [join(repoRoot, 'node_modules', '.vite'), join(repoRoot, '.turbo')]) {
  if (isDir(abs)) wipe(abs, relativeToRoot(abs))
}

function relativeToRoot(abs: string): string {
  return abs.startsWith(rootSep) ? abs.slice(rootSep.length) : abs
}

const kept = [...TRACKED_DIST].filter((rel) => isDir(join(repoRoot, rel)))
console.log(
  `[clean] 移除 ${removed.length} 个目录${removed.length > 0 ? `：${removed.join('、')}` : ''}` +
    (kept.length > 0 ? ` · 保留 ${kept.join('、')}（入库产物，用 pnpm tokens:gen 重建）` : ''),
)

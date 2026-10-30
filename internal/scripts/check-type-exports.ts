/**
 * 类型出口门禁（02 §7「类型 | attw」）。
 *
 * 检查的是**发布出去的那张脸**在各种模块解析模式下是否自洽：node10（老 TS / webpack4）、
 * node16 的 CJS 与 ESM 两个方向、bundler。它不是类型正确性检查——`tsc --noEmit` 管那个；
 * 这条管的是"声明文件与 JS 产物是否配对"。
 *
 * 第一次跑就抓到真问题（2026-10-30）：五个包全部 `Masquerading as ESM`。
 * 根因是 dual package 只发了一份 `.d.ts`，而 `package.json` 的 `"type": "module"` 让它被判定为
 * ESM 声明，`require` 分支却指向 `.cjs`。修法是构建期生成 `.d.cts` 镜像，
 * 并把 `exports` 改成每个分支内嵌 `types`（顶层 `types` 会先于 `require` 命中，等于白配）。
 *
 * 资源子路径（`./style.css`、`./sprite.svg`、`./manifest.json`）按 exports 自动排除：
 * attw 会把这些报成 `No resolution`，但"CSS 没有类型声明"不是缺陷，是 CSS 的属性。
 * 排除列表**从 package.json 推导**而不是写死，新增资源入口不必回来改门禁。
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const packagesDir = join(repoRoot, 'packages')

type Json = Record<string, unknown>

function attwBin(): string {
  const pkgFile = join(repoRoot, 'node_modules', '@arethetypeswrong', 'cli', 'package.json')
  if (!existsSync(pkgFile)) {
    console.error('[types] 找不到 @arethetypeswrong/cli，先 pnpm install')
    process.exit(1)
  }
  const pkg = JSON.parse(readFileSync(pkgFile, 'utf8')) as { bin?: string | Json }
  const bin = typeof pkg.bin === 'string' ? pkg.bin : (pkg.bin?.attw as string | undefined)
  if (bin === undefined) {
    console.error('[types] @arethetypeswrong/cli 没有 attw 可执行入口')
    process.exit(1)
  }
  return join(dirname(pkgFile), bin)
}

/** 一个 exports 值里所有的字符串目标（条件嵌套任意深） */
function targetsOf(node: unknown): string[] {
  if (typeof node === 'string') return [node]
  if (Array.isArray(node)) return node.flatMap(targetsOf)
  if (node !== null && typeof node === 'object') return Object.values(node).flatMap(targetsOf)
  return []
}

/** 子路径里没有一个 JS 目标的，就是资源入口，交给 attw 检查只会得到必然的 `No resolution` */
function resourceEntrypoints(exportsField: Json | undefined): string[] {
  const out: string[] = []
  for (const [key, value] of Object.entries(exportsField ?? {})) {
    if (key === '.') continue
    const targets = targetsOf(value)
    if (targets.length === 0) continue
    if (targets.some((target) => /\.(?:c|m)?js$/.test(target))) continue
    out.push(key)
  }
  return out
}

const bin = attwBin()
const failures: string[] = []
let checked = 0
let excluded = 0

for (const dir of readdirSync(packagesDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  const file = join(packagesDir, dir.name, 'package.json')
  if (!existsSync(file)) continue
  const pkg = JSON.parse(readFileSync(file, 'utf8')) as { name?: string; private?: boolean; exports?: Json }
  if (pkg.private === true || !pkg.name) continue

  const skip = resourceEntrypoints(pkg.exports)
  excluded += skip.length
  const args = ['--pack', join(packagesDir, dir.name), '--format', 'ascii']
  if (skip.length > 0) args.push('--exclude-entrypoints', ...skip)

  const result = spawnSync(process.execPath, [bin, ...args], { cwd: repoRoot, encoding: 'utf8' })
  checked += 1
  if (result.status !== 0) {
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
    failures.push(`[${pkg.name}]\n${output.split('\n').filter((line) => line.trim().length > 0).slice(0, 24).join('\n')}`)
  }
}

if (failures.length > 0) {
  console.error(`[types] ${failures.length} 个包的类型出口有问题：`)
  for (const failure of failures) console.error(failure)
  process.exit(1)
}

console.log(
  `[types] 通过 · ${checked} 个发布包在 node10 / node16-CJS / node16-ESM / bundler 四种解析下自洽` +
    `（按 exports 自动排除 ${excluded} 个资源子路径）`,
)

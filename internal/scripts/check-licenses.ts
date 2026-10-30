/**
 * 许可门禁（02 §7「许可 | license-checker --onlyAllow」、00 §4 红线 1）。
 *
 * 为什么不装 `license-checker`：那个包的依赖树本身有几十个传递依赖，而它要防的正是
 * "依赖树里出现不该出现的许可"——用一个庞大依赖树去审计依赖树，是自相矛盾的。
 * 本脚本零依赖，直接读 `createRequire` 解析出来的真实包，速度也快（几百毫秒）。
 *
 * 检查范围是**生产依赖树**（dependencies / optionalDependencies / peerDependencies 递归），
 * 不是整个 node_modules：开发工具链里的 MPL-2.0（sass 相关的 lightningcss）、
 * Python-2.0（构建脚本）、CC-BY-4.0（caniuse 数据）都不会进产物，
 * 把它们拦下来只会逼人往白名单里加例外，最后白名单失去意义。
 * devDependencies 里的非白名单项**照实打印**，供人知道，但不失败。
 *
 * 白名单口径按 00 §4：MIT / Apache-2.0 / BSD / ISC / OFL，另加几个法律上等价于 MIT 的
 * 公共领域式许可（0BSD / Unlicense / CC0 / BlueOak），它们的限制比 MIT 还少。
 */

import { createRequire } from 'node:module'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const packagesDir = join(repoRoot, 'packages')

const ALLOWED = new Set([
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  '0BSD',
  'OFL-1.1',
  'Unlicense',
  'CC0-1.0',
  'BlueOak-1.0.0',
])

/** SPDX 表达式：`OR` 任一即可，`AND` 必须全满足，括号直接剥掉 */
function allows(expression: string): boolean {
  const cleaned = expression.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim()
  const anyOf = cleaned.split(/\s+OR\s+/i)
  if (anyOf.length > 1) return anyOf.some(allows)
  const allOf = cleaned.split(/\s+AND\s+/i)
  if (allOf.length > 1) return allOf.every(allows)
  return ALLOWED.has(cleaned)
}

type PackageJson = {
  name?: string
  version?: string
  license?: string
  licenses?: { type?: string }[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  peerDependenciesMeta?: Record<string, { optional?: boolean }>
}

function licenseOf(pkg: PackageJson): string {
  if (typeof pkg.license === 'string' && pkg.license.length > 0) return pkg.license
  const legacy = pkg.licenses?.map((entry) => entry.type).filter((type): type is string => Boolean(type))
  if (legacy !== undefined && legacy.length > 0) return legacy.join(' OR ')
  return '（未声明）'
}

type Found = { name: string; version: string; license: string; via: string }

/** 从某个包目录出发递归解析生产依赖；`via` 记录是谁引入的，便于定位 */
function walkProduction(rootDir: string): Found[] {
  const requireFrom = createRequire(join(rootDir, 'package.json'))
  const seen = new Set<string>()
  const out: Found[] = []
  const queue: { name: string; via: string }[] = []

  const enqueue = (pkg: PackageJson, via: string): void => {
    const fields = [pkg.dependencies, pkg.optionalDependencies, pkg.peerDependencies]
    for (const table of fields) {
      for (const name of Object.keys(table ?? {})) queue.push({ name, via })
    }
  }

  const rootPkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8')) as PackageJson
  enqueue(rootPkg, rootPkg.name ?? '(根)')

  while (queue.length > 0) {
    const item = queue.shift()!
    let pkgFile: string
    try {
      pkgFile = requireFrom.resolve(`${item.name}/package.json`)
    } catch {
      // 解析不到通常是对等依赖没装（可选的），不是许可问题
      continue
    }
    const key = dirname(pkgFile)
    if (seen.has(key)) continue
    seen.add(key)

    const pkg = JSON.parse(readFileSync(pkgFile, 'utf8')) as PackageJson
    out.push({
      name: pkg.name ?? item.name,
      version: pkg.version ?? '?',
      license: licenseOf(pkg),
      via: item.via,
    })
    enqueue(pkg, pkg.name ?? item.name)
  }
  return out
}

const problems: string[] = []
const summary = new Map<string, number>()
let checked = 0

for (const dir of readdirSync(packagesDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  const file = join(packagesDir, dir.name, 'package.json')
  if (!existsSync(file)) continue
  const pkg = JSON.parse(readFileSync(file, 'utf8')) as PackageJson & { private?: boolean }
  if (pkg.private === true || !pkg.name) continue

  for (const found of walkProduction(join(packagesDir, dir.name))) {
    checked += 1
    summary.set(found.license, (summary.get(found.license) ?? 0) + 1)
    if (allows(found.license)) continue
    problems.push(
      `${pkg.name} 的生产依赖 ${found.name}@${found.version} 用的是 ${found.license}` +
        `（由 ${found.via} 引入）：不在允许列表内`,
    )
  }
}

// devDependencies 只报告不失败：它们不进 dist，也不进消费者机器
const devOffenders = new Map<string, string[]>()
for (const dir of readdirSync(packagesDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  const file = join(packagesDir, dir.name, 'package.json')
  if (!existsSync(file)) continue
  const requireFrom = createRequire(file)
  const pkg = JSON.parse(readFileSync(file, 'utf8')) as PackageJson
  for (const name of Object.keys(pkg.devDependencies ?? {})) {
    try {
      const devPkg = JSON.parse(readFileSync(requireFrom.resolve(`${name}/package.json`), 'utf8')) as PackageJson
      const license = licenseOf(devPkg)
      if (allows(license)) continue
      const bucket = devOffenders.get(license) ?? []
      if (!bucket.includes(name)) bucket.push(name)
      devOffenders.set(license, bucket)
    } catch {
      // 解析不到的 devDependency（平台相关可选包）直接跳过
    }
  }
}

if (problems.length > 0) {
  console.error(`[license] ${problems.length} 项违反：`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

const summaryText = [...summary.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([license, count]) => `${license} × ${count}`)
  .join(' · ')

console.log(`[license] 通过 · 生产依赖树 ${checked} 个包全部在允许列表内（${summaryText}）`)
if (devOffenders.size > 0) {
  const text = [...devOffenders.entries()]
    .map(([license, names]) => `${license}（${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}）`)
    .join(' · ')
  console.log(`[license] 仅报告 · 开发依赖里有非白名单许可，不进产物：${text}`)
}

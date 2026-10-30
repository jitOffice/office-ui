/**
 * 发布前的最后一个门禁：**真的打一次包，检查 tarball 里到底有什么**。
 *
 * 契约 12 检查的是"package.json 的字段与 exports 同源"，契约 10 检查的是"exports 不指回 src"——
 * 两者都只看**仓库里的文件**。但发布事故通常发生在 tarball 这一层：
 *
 *   1. `files` 漏配 → dist 没进包 → 下游 `import '@jitoffice/ui'` 直接 MODULE_NOT_FOUND；
 *   2. `catalog:` / `workspace:` 协议没被解析 → 下游装包时报 "Unsupported URL Type"。
 *      **实测（2026-10-30）**：同一个 `packages/ui`，`pnpm pack` 产出 `peerDependencies.vue: "~3.5.43"`，
 *      `npm pack` 原样保留 `"catalog:"`。changesets v3 会按 `packageManager` 选 `pnpm publish`
 *      （`getPublishTool` 里显式判断），所以 CI 路径是安全的；但谁本地 `npm publish` 一次就发出毒包。
 *      本脚本故意用 `pnpm pack`——与 CI 实际发布路径一致；`npm publish` 的禁令写在 SECURITY.md；
 *   3. 测试文件、源文件误入包体 → 体积与"源码直出"双重回归。
 *
 * 这三条只有解包能答。所以这里的做法是 `pnpm pack` → `tar -tzf` / `tar -xzOf` → 逐条断言，
 * 而不是读源 package.json 猜结果。
 *
 * 需要先 `pnpm build`（dist 是包体内容）。
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const packagesDir = join(repoRoot, 'packages')

const problems: string[] = []
const packDir = mkdtempSync(join(tmpdir(), 'oj-pack-'))

function run(cmd: string, args: string[], cwd: string): string {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

const releasePkgs: { dir: string; name: string }[] = []
for (const dir of readdirSync(packagesDir)) {
  const file = join(packagesDir, dir, 'package.json')
  try {
    const pkg = JSON.parse(readFileSync(file, 'utf8')) as { name?: string; private?: boolean }
    if (pkg.private === true || !pkg.name) continue
    releasePkgs.push({ dir, name: pkg.name })
  } catch {
    // 没有 package.json 的目录跳过
  }
}

const DEP_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies'] as const

for (const { dir, name } of releasePkgs) {
  let tarball: string
  try {
    run('pnpm', ['--filter', name, 'pack', '--pack-destination', packDir], repoRoot)
    const tgz = readdirSync(packDir).filter((f) => f.endsWith('.tgz'))
    if (tgz.length !== 1) throw new Error(`期望 1 个 tarball，实际 ${tgz.length}`)
    tarball = join(packDir, tgz[0] as string)
  } catch (error) {
    problems.push(`[${name}] 打包失败：${(error as Error).message.split('\n')[0]}`)
    continue
  }

  const entries = run('tar', ['-tzf', tarball], repoRoot)
    .split('\n')
    .filter(Boolean)
    .map((line) => line.replace(/^package\//, ''))

  // ① 包体里不许有源码与测试
  for (const entry of entries) {
    if (entry.startsWith('src/')) problems.push(`[${name}] 包体含源码 ${entry}（files 配置有过宽）`)
    if (/\.test\.[a-z]+$|\.spec\.[a-z]+$/.test(entry)) {
      problems.push(`[${name}] 包体含测试文件 ${entry}（files 配置有过宽）`)
    }
  }

  // ② 协议必须已解析
  const packed = JSON.parse(run('tar', ['-xzOf', tarball, 'package/package.json'], repoRoot)) as Record<
    string,
    unknown
  >
  for (const field of DEP_FIELDS) {
    const deps = packed[field]
    if (deps === undefined || deps === null || typeof deps !== 'object') continue
    for (const [dep, range] of Object.entries(deps as Record<string, string>)) {
      if (/^(catalog|workspace):/.test(range)) {
        problems.push(
          `[${name}] ${field}.${dep} 仍是 "${range}"：发布工具没解析协议，下游装不上` +
            `（changesets v3 会按 packageManager 选 pnpm publish；换成 npm publish 就会这样）`,
        )
      }
    }
  }

  // ③ provenance 要求 repository 与构建来源一致，缺了会退化成未签名发布
  const repository = packed.repository as { url?: string } | undefined
  if (!repository?.url) {
    problems.push(`[${name}] 缺 repository.url：npm provenance 无法关联构建来源`)
  }

  // ④ 对外声明的每个入口都必须真的在包里（files 漏配的典型症状）
  const declared = ['main', 'module', 'types', 'unpkg', 'jsdelivr'] as const
  for (const field of declared) {
    const target = packed[field]
    if (typeof target !== 'string') continue
    const normalized = target.replace(/^\.\//, '')
    if (!entries.includes(normalized)) {
      problems.push(`[${name}] ${field} 指向 ${target}，但 tarball 里没有这个文件`)
    }
  }

  rmSync(tarball, { force: true })
}

rmSync(packDir, { recursive: true, force: true })

if (problems.length > 0) {
  console.error(`[package] ${problems.length} 项问题：`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log(
  `[package] 通过 · ${releasePkgs.length} 个发布包的 tarball：` +
    `无源码/测试泄漏 · 无未解析协议 · repository 齐全 · 五个入口文件都在包里`,
)

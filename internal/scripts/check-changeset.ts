/**
 * PR 必须附 changeset（02 §A3、CONTRIBUTING §2）。
 *
 * 为什么这条要写成脚本而不是靠人review：changeset 缺失的症状是**发布时才发现**——
 * 版本号不动、CHANGELOG 里少一条、下游看 changelog 判断要不要升级时被误导。
 * 那时候改动已经合进去了，补一条 changeset 也补不回"当时为什么改"的上下文。
 *
 * 判定规则刻意保守：
 *   - 只要求 `packages/<发布包>/src/**` 与 `packages/*\/package.json` 的改动必须配 changeset；
 *   - 测试、dist 生成物、文档站、CI 配置都不强制（它们不进发布包，逼着写 changeset 只会产生噪声）；
 *   - 私有包（docs、internal-build）不算发布面。
 *
 * 本地跑要能通过：没有 `origin/<base>` 时直接跳过并说明原因，不制造"本机红、CI 绿"的假象。
 * 逃生口只有一个环境变量 `SKIP_CHANGESET_CHECK=1`，用于维护者确认过的例外。
 */

import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/** 与 `pnpm-workspace.yaml` 的 packages/* 里 `private` 为 false 的那五个一致 */
export const RELEASE_PACKAGES = ['ui', 'icons', 'tokens', 'i18n', 'shared'] as const

/** 改了这些文件就要有 changeset：源码（公共行为的来源）与包清单（依赖/导出面） */
export function isReleaseSurface(file: string): boolean {
  for (const name of RELEASE_PACKAGES) {
    if (file === `packages/${name}/package.json`) return true
    if (file.startsWith(`packages/${name}/src/`)) return true
  }
  return false
}

/** `.changeset/*.md` 里排除自动生成的 README */
export function isChangesetFile(file: string): boolean {
  return file.startsWith('.changeset/') && file.endsWith('.md') && file !== '.changeset/README.md'
}

export type ChangesetVerdict = {
  needs: boolean
  has: boolean
  sources: string[]
  changesets: string[]
}

export function evaluate(files: string[]): ChangesetVerdict {
  const sources = files.filter(isReleaseSurface)
  const changesets = files.filter(isChangesetFile)
  return { needs: sources.length > 0, has: changesets.length > 0, sources, changesets }
}

function git(args: string[]): string {
  // stderr 关掉：探测 `origin/<base>` 是否存在时失败是预期路径，不该在日志里留 `fatal:`
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
}

function main(): void {
  if (process.env.SKIP_CHANGESET_CHECK === '1') {
    console.log('[changeset] 已跳过（SKIP_CHANGESET_CHECK=1，仅限维护者确认的例外）')
    return
  }

  const base = process.env.GITHUB_BASE_REF || process.env.CHANGESET_BASE || 'main'

  // 优先 `origin/<base>`（CI 的 GITHUB_BASE_REF 就是这个形态）；
  // 回退到裸 ref，好让本地能用 `CHANGESET_BASE=<sha>` 验证门禁真的会红。
  let baseRef: string | null = null
  for (const ref of [`origin/${base}`, base]) {
    try {
      git(['rev-parse', '--verify', ref])
      baseRef = ref
      break
    } catch {
      // 试下一个
    }
  }
  if (baseRef === null) {
    console.log(
      `[changeset] 跳过 · 找不到 ${base} / origin/${base}，无法确定改动范围` +
        `（CI 用 actions/checkout 的 fetch-depth: 0 一定能取到）`,
    )
    return
  }

  const mergeBase = git(['merge-base', baseRef, 'HEAD'])

  const files = git(['diff', '--name-only', mergeBase, 'HEAD']).split('\n').filter(Boolean)
  const verdict = evaluate(files)

  if (!verdict.needs) {
    const scope =
      files.length === 0 ? '与基线无差异' : `${files.length} 个改动文件都不在 packages/*/src`
    console.log(`[changeset] 通过 · 未触及发布包源码（${scope}）`)
    return
  }
  if (verdict.has) {
    console.log(
      `[changeset] 通过 · ${verdict.sources.length} 个发布包文件改动 ↔ ` +
        `${verdict.changesets.length} 份 changeset（${verdict.changesets.join(', ')}）`,
    )
    return
  }

  console.error('[changeset] 缺失 · 改动触及发布包源码，但没有新增 .changeset/*.md')
  for (const file of verdict.sources.slice(0, 10)) console.error(`  - ${file}`)
  if (verdict.sources.length > 10) console.error(`  … 另有 ${verdict.sources.length - 10} 个文件`)
  console.error('')
  console.error('  修复：pnpm changeset  # 写"使用方能感知的变化"，不是"改了哪个文件"（CONTRIBUTING §2）')
  process.exitCode = 1
}

// 被 import 时不执行（测试要引 evaluate，不能顺手跑 git）
if (process.argv[1] === fileURLToPath(import.meta.url)) main()

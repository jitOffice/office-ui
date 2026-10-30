/**
 * 文档站「零外联」断言（04 §1）。
 *
 * 为什么这条必须是机器检查而不是自觉：VitePress 默认主题的 `fonts.css` 里有一句
 * `@import url('https://fonts.googleapis.com/…')`，用了默认主题的文档站会**静默**发起
 * Google Fonts 请求——页面能渲染（有回退），只是首屏被一个永远超时的请求拖住，
 * 而这条请求会出现在客户的外联审计报告里。靠人肉 review 是挡不住的。
 *
 * 只盯**会发起请求的引用**（`<script|link|img|iframe|source>` 的 src/href、CSS 的 `url()` 与
 * `@import`）。普通 `<a href="https://github.com/…">` 是点击才跳的文本链接，不算外联资源——
 * 把它一起算进来会让守卫变成"文档里不许出现任何网址"，那不是我们要的东西。
 *
 * 零依赖，可在装不上依赖的环境里跑；但需要先有 `docs/dist`（构建产物）。
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const dist = join(repoRoot, 'docs', 'dist')

/**
 * 白名单只有两条，都很窄：
 *   1. `www.w3.org` 的 XML 命名空间——它是标识符，不会被请求。
 *   2. VitePress 默认主题的 social-link 图标 helper（`api.iconify.design/simple-icons/…`）。
 *      这段代码被**无条件**打进 theme chunk，但只有配置了 `socialLinks` 才会执行；
 *      我们的 `config.ts` 刻意没有 `socialLinks`，所以这条路径不可达。
 *      **前提是它必须一直不可达**：将来真要放社交链接，图标得换成本地 SVG，
 *      否则这条守卫会替一个真实的外联请求背书。
 */
const ALLOWED = [
  /^https?:\/\/www\.w3\.org\//i,
  /^https?:\/\/api\.iconify\.design\/simple-icons\//i,
]

const PATTERNS: { name: string; re: RegExp }[] = [
  { name: '<script src>', re: /<script\b[^>]*\bsrc\s*=\s*["'](https?:\/\/[^"']+)/gi },
  { name: '<link href>', re: /<link\b[^>]*\bhref\s*=\s*["'](https?:\/\/[^"']+)/gi },
  { name: '<img|iframe|source|video|audio src>', re: /<(?:img|iframe|source|video|audio)\b[^>]*\bsrc\s*=\s*["'](https?:\/\/[^"']+)/gi },
  { name: 'srcset', re: /\bsrcset\s*=\s*["']([^"']*https?:\/\/[^"']+)/gi },
  { name: 'CSS url()', re: /url\(\s*["']?(https?:\/\/[^)"']+)/gi },
  { name: 'CSS @import', re: /@import\s+(?:url\()?["']?(https?:\/\/[^)"']+)/gi },
]

const SCANNED = ['.html', '.css', '.js', '.mjs', '.json', '.svg']
const SKIP = new Set(['node_modules'])

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path, out)
    else if (SCANNED.some((ext) => entry.name.endsWith(ext))) out.push(path)
  }
  return out
}

if (!existsSync(dist)) {
  console.error('[docs:offline] 没有找到 docs/dist，先跑 `pnpm --filter @jitoffice/docs build`')
  process.exit(1)
}

const problems: string[] = []
for (const file of walk(dist)) {
  const source = readFileSync(file, 'utf8')
  for (const { name, re } of PATTERNS) {
    for (const match of source.matchAll(re)) {
      const url = match[1] as string
      if (ALLOWED.some((allow) => allow.test(url))) continue
      problems.push(`${relative(repoRoot, file)} · ${name} → ${url}`)
    }
  }
}

if (problems.length > 0) {
  console.error(`[docs:offline] 文档站产物里出现了 ${problems.length} 处外部资源引用：`)
  for (const problem of [...new Set(problems)]) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log('[docs:offline] 通过 · docs/dist 没有引用任何外部资源（脚本 / 样式 / 图片 / 字体）')

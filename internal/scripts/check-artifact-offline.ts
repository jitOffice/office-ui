/**
 * 产物外链扫描（02 §7 / A3 验收第三行："故意引入一个 `https://fonts.googleapis.com` 引用"）。
 *
 * 为什么必须在**产物**上扫，而不是在 `src` 上扫：组件库的使用方拿到的是 `dist`。
 * 源码里一句 `@import url('https://fonts.googleapis.com/…')` 会被 Sass/vite 原样带进
 * `office-ui.css`；反过来源码里没有、由某个依赖注入的外链只有产物看得见。
 * 而这条引用在**内网/离线**环境下不会报错——它只是让首屏挂在一个永远超时的请求上，
 * 同时出现在客户的外联审计报告里（本项目第一类使用场景就是这种东西打不进去的环境）。
 *
 * 口径刻意很窄：只盯**会发起请求**的引用（CSS 的 `url()` / `@import`、HTML/SVG 里
 * `<script|link|img|iframe|source|video|audio|use|image>` 的 `src`/`href`/`srcset`）。
 * 不扫"产物里出现任何 http 字符串"：`svg xmlns="http://www.w3.org/2000/svg"` 是命名空间
 * 标识符（浏览器不会去解析它），`tiptap.dev/docs/…` 这种只出现在报错文案里的 URL 也不会
 * 被请求。把它们一起算进来，守卫就退化成"产物里不许出现网址"，然后被迫加一堆白名单，
 * 白名单一长就没有人再相信它了（与 `check-docs-offline.ts` 同一口径）。
 *
 * 零依赖（只读 `node:*`），不需要 `node_modules`；但需要 `dist` 已存在（入库的生成物即可，
 * 或先跑 `pnpm build`）。
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const packagesDir = join(repoRoot, 'packages')

/** 唯一白名单：XML 命名空间是标识符，不是可获取资源。 */
const ALLOWED: RegExp[] = [/^https?:\/\/www\.w3\.org\//i]

const PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'CSS url()', re: /url\(\s*["']?(https?:\/\/[^)"'\s]+)/gi },
  // 只认字符串形式；`@import url(...)` 已被上一条吃掉，不必重复报两次。
  { name: 'CSS @import', re: /@import\s+["'](https?:\/\/[^"']+)/gi },
  { name: '<script src>', re: /<script\b[^>]*\bsrc\s*=\s*["'](https?:\/\/[^"']+)/gi },
  { name: '<link href>', re: /<link\b[^>]*\bhref\s*=\s*["'](https?:\/\/[^"']+)/gi },
  {
    name: '<img|iframe|source|video|audio|use|image>',
    re: /<(?:img|iframe|source|video|audio|use|image)\b[^>]*\b(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)/gi,
  },
  { name: 'srcset', re: /\bsrcset\s*=\s*["']([^"']*https?:\/\/[^"']+)/gi },
]

// 只扫可能承载上述语法的文本产物；`.map` 与二进制（字体/图片）跳过。
const SCANNED = ['.css', '.js', '.cjs', '.mjs', '.svg', '.html']
const SKIP_DIRS = new Set(['node_modules'])

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path, out)
    else if (SCANNED.some((ext) => entry.name.endsWith(ext))) out.push(path)
  }
  return out
}

/** 报错要能定位到行——只报"某文件里有外链"等于让人在 5000 行产物里肉眼找。 */
function lineAt(source: string, index: number): number {
  let line = 1
  for (let i = 0; i < index; i += 1) if (source.charCodeAt(i) === 10) line += 1
  return line
}

const releasePkgs: { dir: string; name: string }[] = []
for (const dir of readdirSync(packagesDir)) {
  try {
    const pkg = JSON.parse(readFileSync(join(packagesDir, dir, 'package.json'), 'utf8')) as {
      name?: string
      private?: boolean
    }
    if (pkg.private === true || !pkg.name) continue
    releasePkgs.push({ dir, name: pkg.name })
  } catch {
    // 没有 package.json 的目录跳过
  }
}

if (releasePkgs.length === 0) {
  console.error('[offline] 没有找到任何发布包，脚本本身坏了')
  process.exit(1)
}

const problems: string[] = []
const missingDist: string[] = []
let files = 0

for (const { dir, name } of releasePkgs) {
  const dist = join(packagesDir, dir, 'dist')
  if (!existsSync(dist)) {
    // 缺 dist 不能当"通过"：那会让整条门禁在该包上静默失效。
    missingDist.push(name)
    continue
  }
  for (const file of walk(dist)) {
    files += 1
    const source = readFileSync(file, 'utf8')
    for (const { name: kind, re } of PATTERNS) {
      for (const match of source.matchAll(re)) {
        const url = match[1] as string
        if (ALLOWED.some((allow) => allow.test(url))) continue
        const where = relative(repoRoot, file)
        problems.push(`${where}:${lineAt(source, match.index ?? 0)} · ${kind} → ${url}`)
      }
    }
  }
}

if (missingDist.length > 0) {
  console.error(`[offline] 以下包没有 dist，先跑 \`pnpm build\`：${missingDist.join(' · ')}`)
  process.exit(1)
}

if (problems.length > 0) {
  console.error(`[offline] 产物里出现了 ${problems.length} 处会发起请求的外部资源引用：`)
  for (const problem of [...new Set(problems)]) console.error(`  - ${problem}`)
  console.error('  内网/离线环境下这些请求不会报错，只会让首屏一直等下去——改成本地资源或内联。')
  process.exit(1)
}

console.log(
  `[offline] 通过 · ${releasePkgs.length} 个发布包的 dist（${files} 个文本产物）没有引用任何外部资源`,
)

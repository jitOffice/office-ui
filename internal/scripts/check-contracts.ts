/**
 * 契约检查（根 `pnpm lint`）。
 *
 * 只检查"违反了就必然在半年后变成烂账"的结构性约束，不做风格检查（那是 ESLint 的活）。
 * 零依赖、可用 Node 直接执行，因此在装不上依赖的环境里也能跑。
 *
 * 覆盖：
 *  1. ADR-0004 —— 发布包的 `dependencies` 必须为空，重引擎只能作为 peerDependency
 *  2. ADR-0001 —— 发射样式的包不得写 `sideEffects: false`（会把样式入口整棵摇掉）
 *  3. `exports` 声明的每个文件必须真实存在（先构建再发布，不能靠 CI 顺序侥幸）
 *  4. tokens 的 dist 必须是最新生成，改 seed 忘记重跑必须被抓到
 *  5. `catalog:` 引用必须命中 pnpm-workspace.yaml 里真实存在的键
 *  6. ADR-0005 —— 框架无关包的**根入口**不得把 vue 拖进模块图
 *  7. i18n 的 `IntlKey` 生成表必须与语言包同源（改文案忘记重跑必须被抓到）
 *  8. i18n 的 `locale.name` / `locale.tokenLang` 必须命中 tokens 实际发射的 `html[lang|="…"]` 层
 *     （变量覆写层与元素级排版层都要命中，且产物里不许出现 `[lang="…"]` 精确匹配）
 *  9. 治理文档（README / CONTRIBUTING / SECURITY / SUPPORT / CoC / ADR / prd）的内部链接必须真实存在
 *
 * 第 8 条守的是一类会静默通过的缺陷：选择器写成语义精确匹配的 `html[lang="ja"]`，而语言包
 * `name` 是 `ja-JP`，于是整层字号/字距/行高覆写对日文界面完全不生效，两边各自测试都还是绿的。
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildArtifacts } from '../../packages/tokens/scripts/generate.ts'
import { buildKeys, locales, parityProblems } from '../../packages/i18n/scripts/gen-keys.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const rootSep = repoRoot + sep
const problems: string[] = []

/** 允许根入口依赖 Vue 的包：`ui` 本身就是 Vue 组件包。其余包的根入口必须框架无关（ADR-0005）。 */
const FRAMEWORK_ENTRY = new Set(['ui'])

interface PkgJson {
  license?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  sideEffects?: unknown
  exports?: unknown
}

/** 递归收集 exports 里的字符串目标（含条件导出与通配符）。 */
function exportTargets(node: unknown, path: string[] = []): { pointer: string; target: string }[] {
  if (typeof node === 'string') return [{ pointer: path.join(' > ') || '.', target: node }]
  if (Array.isArray(node)) return node.flatMap((v, i) => exportTargets(v, [...path, `[${i}]`]))
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => exportTargets(v, [...path, k]))
  }
  return []
}

/** 顶层 import/export 语句里的模块说明符，含无绑定的副作用 import。 */
function importSpecifiers(text: string): string[] {
  const out: string[] = []
  for (const m of text.matchAll(/(?:^|\n)\s*(?:import|export)[^'"]*?\sfrom\s*['"]([^'"]+)['"]/g)) {
    if (m[1]) out.push(m[1])
  }
  for (const m of text.matchAll(/(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g)) {
    if (m[1]) out.push(m[1])
  }
  return out
}

/** 按 `.ts` / `dir/index.ts` / 原样三种写法解析相对说明符。 */
function resolveSpecifier(fromFile: string, spec: string): string | undefined {
  const base = resolve(dirname(fromFile), spec)
  for (const candidate of [base, `${base}.ts`, join(base, 'index.ts')]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
  return undefined
}

function visit(file: string, out: Set<string>): void {
  if (out.has(file)) return
  out.add(file)
  for (const spec of importSpecifiers(readFileSync(file, 'utf8'))) {
    if (!spec.startsWith('.')) continue
    const next = resolveSpecifier(file, spec)
    if (next) visit(next, out)
  }
}

/** 从入口文件出发、沿相对 import 可达的全部源文件。 */
function moduleGraph(entry: string): Set<string> {
  const out = new Set<string>()
  visit(entry, out)
  return out
}

function catalogKeys(): Set<string> {
  const text = readFileSync(join(repoRoot, 'pnpm-workspace.yaml'), 'utf8')
  const lines = text.split(/\r?\n/)
  const keys = new Set<string>()
  let inside = false
  for (const line of lines) {
    if (/^catalog:\s*$/.test(line)) {
      inside = true
      continue
    }
    if (inside && /^\S/.test(line)) inside = false
    if (!inside) continue
    // 键可能带单引号或双引号（`'@playwright/test': ^1.64.0`），必须剥掉再比：
    // 连引号一起收进集合时，包里的 catalog: 引用永远对不上，门禁会假报"catalog 里没有这个键"。
    const m = line.match(/^\s+([^\s:]+):\s*\S/)
    const key = m?.[1]?.replace(/^['"]|['"]$/g, '')
    if (key) keys.add(key)
  }
  return keys
}

const catalog = catalogKeys()
const packagesDir = join(repoRoot, 'packages')
const pkgNames = existsSync(packagesDir) ? readdirSync(packagesDir) : []

if (pkgNames.length === 0) problems.push('packages/ 下一个包都没有')

for (const dir of pkgNames) {
  const file = join(packagesDir, dir, 'package.json')
  if (!existsSync(file)) {
    problems.push(`packages/${dir} 缺 package.json`)
    continue
  }
  const pkg = JSON.parse(readFileSync(file, 'utf8')) as PkgJson
  const label = `packages/${dir}`

  const deps = Object.keys(pkg.dependencies ?? {})
  if (deps.length > 0) problems.push(`${label}: dependencies 必须为空（ADR-0004），实到 ${deps.join(', ')}`)

  const targets = exportTargets(pkg.exports)
  const shipsCss = targets.some(({ target }) => target.endsWith('.css'))

  // 只有"这个包会发射样式"时 sideEffects: false 才是致命错误；
  // 纯逻辑包（shared、i18n）标 false 是对的，不该被同一条规则误伤。
  if (pkg.sideEffects === false && shipsCss) {
    problems.push(`${label}: sideEffects 不得为 false，样式入口会被整棵摇掉（02 §2.1）`)
  }

  if (pkg.license !== 'Apache-2.0') problems.push(`${label}: license 应为 Apache-2.0，实为 ${pkg.license}`)

  for (const { pointer, target } of targets) {
    if (target.includes('*')) continue
    if (!target.startsWith('./')) {
      problems.push(`${label} exports ${pointer}: 目标必须是相对路径，实为 ${target}`)
      continue
    }
    if (!existsSync(join(packagesDir, dir, target))) {
      problems.push(`${label} exports ${pointer} 指向不存在的文件 ${target}（先跑 pnpm build）`)
    }
  }

  for (const [field, table] of [
    ['dependencies', pkg.dependencies],
    ['devDependencies', pkg.devDependencies],
    ['peerDependencies', pkg.peerDependencies],
  ] as const) {
    for (const [name, range] of Object.entries(table ?? {})) {
      if (range === 'catalog:' && !catalog.has(name)) {
        problems.push(`${label}: ${field} "${name}" 用了 catalog: 但 pnpm-workspace.yaml 里没有这个键`)
      }
    }
  }

  // ADR-0005：框架无关包的**根入口**不得把 vue 拖进模块图。
  // 只查根入口可达的文件，是因为 `/vue` 子路径本来就是设计好的框架层。
  if (!FRAMEWORK_ENTRY.has(dir)) {
    const entry = join(packagesDir, dir, 'src', 'index.ts')
    if (existsSync(entry)) {
      for (const file of moduleGraph(entry)) {
        for (const spec of importSpecifiers(readFileSync(file, 'utf8'))) {
          if (spec === 'vue' || spec.startsWith('vue/')) {
            problems.push(
              `${label} 根入口经 ${relative(repoRoot, file)} import 了 "${spec}"：` +
                `框架无关包的入口不得依赖 Vue，Vue 适配请放子路径（ADR-0005）`,
            )
          }
        }
      }
    }
  }
}

// ---------------------------------------------------------------- 产物新鲜度
const artifacts = buildArtifacts()
for (const [rel, content] of Object.entries(artifacts)) {
  const target = join(packagesDir, 'tokens', rel)
  if (!existsSync(target)) {
    problems.push(`packages/tokens/${rel} 缺失，运行 node packages/tokens/scripts/generate.ts`)
  } else if (readFileSync(target, 'utf8') !== content) {
    problems.push(`packages/tokens/${rel} 已过期：src 与 dist 不同源，重跑 tokens:gen`)
  }
}

// ---------------------------------------------------------------- i18n 生成表
const parity = parityProblems()
if (parity.length > 0) {
  for (const p of parity) problems.push(`[i18n] ${p}`)
} else {
  const keysFile = join(packagesDir, 'i18n', 'src', 'generated', 'keys.ts')
  if (!existsSync(keysFile)) {
    problems.push('packages/i18n/src/generated/keys.ts 缺失，运行 node packages/i18n/scripts/gen-keys.ts')
  } else if (readFileSync(keysFile, 'utf8') !== buildKeys()) {
    problems.push('packages/i18n/src/generated/keys.ts 已过期：语言包改过就重跑 i18n:gen')
  }
}

// ---------------------------------------------------------------- i18n ↔ tokens 语言档位
/**
 * CSS `|=` 的语义：属性值整体等于目标值，或以「目标值 + `-`」开头（CSS 2.1 §6.3.1）。
 * 按原文大小写比较——写 `html[lang]` 的是我们自己的 Provider，值必然逐字等于 `locale.name`；
 * 真要放宽，得连 Provider 一起改，不能只动这里。
 */
function subtagMatches(target: string, attr: string): boolean {
  return attr === target || attr.startsWith(`${target}-`)
}

/**
 * 产物里以 `html[lang|="…"]` 开头的层分两类：声明 `--oj-*` 的是**变量覆写层**，
 * 不声明的是**元素级排版层**（`line-break` 那一类）。两类都必须命中内置语言，
 * 但"同一语言只该命中一层"只在同类内部成立。
 */
interface LangLayer {
  selector: string
  values: string[]
  kind: 'var' | 'reset'
}

/** 判断前先剥注释：注释里写的往往是反面案例（`not([lang="ja"])`），留着会污染选择器与属性匹配。 */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

const langCss = stripComments(artifacts['dist/index.css'] ?? '')

function langLayers(css: string): LangLayer[] {
  const out: LangLayer[] = []
  for (const block of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = (block[1] as string).trim().replace(/\s+/g, ' ')
    const values = [...selector.matchAll(/html\[lang\|="([^"]+)"\]/g)].map((m) => m[1] as string)
    if (values.length === 0) continue
    out.push({ selector, values, kind: /--oj-/.test(block[2] as string) ? 'var' : 'reset' })
  }
  return out
}

const layers = langLayers(langCss)
const varLayers = layers.filter((l) => l.kind === 'var')
const resetLayers = layers.filter((l) => l.kind === 'reset')
const BASE_TIER = 'zh'

/**
 * 目前只有日文有元素级排版规则，zh / zh-TW 的差异全在字体栈上。
 * 将来给繁体加排版层时把档位填进来，门禁才会要求它存在；不填也不会误报。
 */
const TYPOGRAPHY_TIERS = new Set(['ja'])

for (const locale of locales) {
  const hits = (list: LangLayer[]): LangLayer[] =>
    list.filter((l) => l.values.some((v) => subtagMatches(v, locale.name)))

  if (locale.tokenLang === BASE_TIER) {
    // 基底档不该被任何覆写层捞走，否则 en/zh 界面会读到别的语言的字号与字距。
    const captured = [...hits(varLayers), ...hits(resetLayers)]
    if (captured.length > 0) {
      problems.push(
        `[i18n] ${locale.name} 是基底档（tokenLang: zh）却命中覆写层 ${captured.map((l) => l.selector).join(' | ')}`,
      )
    }
    continue
  }

  const hit = hits(varLayers)
  if (hit.length === 0) {
    problems.push(`[i18n] ${locale.name}（tokenLang: ${locale.tokenLang}）没有命中的语言覆写层：字体档位不会生效`)
    continue
  }
  for (const layer of hit) {
    if (!layer.values.includes(locale.tokenLang)) {
      problems.push(
        `[i18n] ${locale.name} 命中了 ${layer.selector}，但该层不含档位 ${locale.tokenLang}：` +
          `tokens 的覆写层与语言档位不同源`,
      )
    }
  }
  if (hit.length > 1) {
    problems.push(`[i18n] ${locale.name} 同时命中 ${hit.length} 个覆写层，级联结果取决于书写顺序`)
  }

  if (TYPOGRAPHY_TIERS.has(locale.tokenLang)) {
    const typography = hits(resetLayers)
    if (typography.length === 0) {
      problems.push(
        `[i18n] ${locale.name} 没有命中的排版重置层：line-break、下划线位置这类元素级规则不会生效`,
      )
    } else if (typography.length > 1) {
      problems.push(`[i18n] ${locale.name} 同时命中 ${typography.length} 个排版重置层，级联结果取决于书写顺序`)
    }
  }
}

for (const layer of layers) {
  if (!locales.some((l) => layer.values.some((v) => subtagMatches(v, l.name)))) {
    problems.push(`[tokens] 覆写层 ${layer.selector} 匹配不到任何内置语言，是死层`)
  }
}

// 产物里出现精确匹配的语言选择器一律算违反：`html[lang="ja"]` 命不中 `lang="ja-JP"`，整层静默失效；
// 写在 not() 里更糟——日文界面会被判成"非日文"而落进 antialiased 作用域，笔画发虚。
for (const m of langCss.matchAll(/\[lang\s*=/g)) {
  problems.push(
    `[tokens] 产物里有精确匹配的语言选择器 ${m[0]}：必须写成 [lang|="…"]，否则带地区子标签的 lang 命不中`,
  )
}

// ---------------------------------------------------------------- 治理文档链接
/**
 * 逐级**区分大小写**地判断路径可达。
 * 开发机在 Windows / macOS（NTFS、APFS 默认大小写不敏感），CI 在 Linux（敏感）：
 * `existsSync('./docs/adr/Readme.md')` 在本机返回 true，于是断链能一路通过到 CI 才炸。
 * 而治理文档是贡献者的唯一入口，链接坏了等于流程坏了。
 */
function existsCaseSensitive(abs: string): boolean {
  const rel = abs.startsWith(rootSep) ? abs.slice(rootSep.length) : abs
  let dir = repoRoot
  for (const part of rel.split(/[\\/]/)) {
    if (part === '.' || part === '') continue
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return false
    }
    if (!entries.includes(part)) return false
    dir = join(dir, part)
  }
  return true
}

const governanceDocs = [
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
  'CODE_OF_CONDUCT.md',
  ...readdirSync(join(repoRoot, 'docs', 'adr')).map((f) => join('docs', 'adr', f)),
  ...readdirSync(join(repoRoot, 'prd')).map((f) => join('prd', f)),
]

for (const rel of governanceDocs) {
  const text = readFileSync(join(repoRoot, rel), 'utf8')
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const link = m[1] as string
    if (/^(https?:|mailto:|#)/.test(link)) continue
    const path = link.split('#')[0] as string
    if (path === '') continue
    const abs = join(dirname(join(repoRoot, rel)), path)
    if (!existsCaseSensitive(abs)) problems.push(`${rel} 的链接指向不存在的文件 ${link}`)
  }
}

if (problems.length > 0) {
  console.error(`\n[contracts] ${problems.length} 项违反：`)
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}

console.log(
  `[contracts] 通过 · 检查 ${pkgNames.length} 个包 · catalog ${catalog.size} 个键 · ` +
    `i18n ${locales.length} 语 ↔ tokens ${varLayers.length} 个变量覆写层 + ${resetLayers.length} 个排版层 · ` +
    `${governanceDocs.length} 份治理文档链接完好`,
)

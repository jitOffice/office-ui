/**
 * 契约检查（根 `pnpm lint`）。
 *
 * 只检查"违反了就必然在半年后变成烂账"的结构性约束，不做风格检查（那是 ESLint 的活）。
 * 零依赖、可用 Node 直接执行，因此在装不上依赖的环境里也能跑。
 *
 * 覆盖：
 *  1. ADR-0004 —— 发布包的 `dependencies` 必须为空，重引擎只能作为 peerDependency
 *  2. ADR-0001 —— 发射样式的包不得写 `sideEffects: false`（会把样式入口整棵摇掉）
 *  3. `exports` 与 `main`/`module`/`types`/`unpkg`/`jsdelivr` 声明的每个文件必须真实存在
 *     （先构建再发布，不能靠 CI 顺序侥幸；后五个字段是 webpack4 / CDN 用户先命中的那张脸）
 *  4. tokens 的 dist 必须是最新生成，改 seed 忘记重跑必须被抓到
 *  5. `catalog:` 引用必须命中 pnpm-workspace.yaml 里真实存在的键
 *  6. ADR-0005 —— 框架无关包的**根入口**不得把 vue 拖进模块图
 *  7. i18n 的 `IntlKey` 生成表必须与语言包同源（改文案忘记重跑必须被抓到）
 *  8. i18n 的 `locale.name` / `locale.tokenLang` 必须命中 tokens 实际发射的 `html[lang|="…"]` 层
 *     （变量覆写层与元素级排版层都要命中，且产物里不许出现 `[lang="…"]` 精确匹配）
 *  9. 治理文档（README / CONTRIBUTING / SECURITY / SUPPORT / CoC / ADR / prd）的内部链接必须真实存在
 * 10. A2 硬门禁 —— 发布包的 `exports` 不得指回 `src/`：源码直出状态一旦跟着 M0 的代码漏出去，
 *     下游拿到的就是需要自己装 TypeScript 才能用的包
 * 11. `dist` 里每个 `.d.ts` 的相对说明符都必须能在产物树里解析到（类型面断链是静默的：
 *     tsc 7.0.2 实测不把 d.ts 里的 `./x.ts` 改写成 `./x.js`，现在靠 TS 的声明文件后缀回退才没断，
 *     构建器或 emit 配置一变就会断，而 `tsc --noEmit` 在自己的树上查不出来）
 * 12. 老消费方那张脸必须和 `exports` 同源：`main`/`module`/`types` 逐字等于 `exports["."]` 的
 *     `require`/`import`/`types` 目标（对侧条件存在却缺字段同样违反），有 `dist/umd` 产物就必须
 *     声明 `unpkg`/`jsdelivr` 并指向其中的文件 —— 只改一张脸会在 webpack4 / Jest / CDN 用户里坏掉
 * 13. 组件样式只能引用 token：每个 `var(--oj-*)` 都要在 token 产物里有声明，且不许写字面色值
 *     （拼错的变量名会让整条声明静默失效，而两侧测试各自都是绿的）。
 *     同一条规则也扫 `docs/.vitepress/theme/`：文档站是组件库的第一个真实消费者，
 *     它曾把 `--vp-c-bg` 映射到不存在的 `--oj-bg-layout`，整站底色一直是空值
 * 14. `ui` 的 UMD 必须把 `vue` 留在外部：Vue 层产物要引用全局 `Vue`，框架无关产物一个引用都不许有
 *     （内联进去的后果是页面上出现两份 Vue，`provide`/`inject` 静默失效）
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

/** 递归收集一个目录下的全部 `.d.ts`（类型面断链检查的作用域）。 */
function dtsFiles(root: string, dir = root): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name)
    if (statSync(abs).isDirectory()) out.push(...dtsFiles(root, abs))
    else if (name.endsWith('.d.ts')) out.push(abs)
  }
  return out
}

/** 目录下的全部 `.js`（目录不存在返回空表）：用来判断这个包到底有没有 UMD 产物。 */
function jsFilesUnder(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name)
    if (statSync(abs).isDirectory()) out.push(...jsFilesUnder(abs))
    else if (name.endsWith('.js')) out.push(abs)
  }
  return out
}

/**
 * 声明文件里的相对说明符必须落到产物树里真实存在的 `.d.ts`。
 * TS 读声明时的写法是 `./x.js`（指向运行时文件），而 tsc 7.0.2 实测**不会**把源码里
 * `./x.ts` 的写法改写掉，所以两种后缀都会出现在入库的 d.ts 里——这里一律剥掉后缀再找 `.d.ts`。
 */
function resolveDeclaration(fromFile: string, spec: string): string | undefined {
  const base = resolve(dirname(fromFile), spec).replace(/\.(?:ts|mts|cts|js|mjs|cjs)$/, '')
  for (const candidate of [`${base}.d.ts`, join(base, 'index.d.ts')]) {
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

/** 契约 11 实际扫过的 `.d.ts` 份数，用于在通过日志里说明检查面。 */
let declarationFiles = 0

/** 契约 12 实际对账过的扁平发布字段数。 */
let publishFaces = 0

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
    // A2 硬门禁：指回源码的 exports 在本机一切正常，下游却必须自己装 TypeScript 才能用这个包。
    if (target.startsWith('./src/')) {
      problems.push(
        `${label} exports ${pointer} 指向源码 ${target}：发布前必须改指 dist 产物（05 A2 硬验收项）`,
      )
    }
  }

  // main / module / types / unpkg / jsdelivr 是 exports 之外的另一张脸：webpack4、Jest、
  // `<script>` 直连 CDN 的用户先命中它们，写错一个字节就是在这些消费方里坏掉，
  // 而 exports 的用例与检查全都看不见。
  const flatFields = ['main', 'module', 'types', 'unpkg', 'jsdelivr'] as const
  const flat = pkg as unknown as Record<(typeof flatFields)[number], unknown>
  /** 形状或存在性已经不合法的字段：契约 12 不再对它们补一条对账失败，一处缺陷只报一次。 */
  const invalidFlat = new Set<string>()
  for (const field of flatFields) {
    const value = flat[field]
    if (value === undefined) continue
    if (typeof value !== 'string' || !value.startsWith('./')) {
      problems.push(`${label}: ${field} 应是以 ./ 开头的相对路径，实为 ${JSON.stringify(value)}`)
      invalidFlat.add(field)
      continue
    }
    if (!existsSync(join(packagesDir, dir, value))) {
      problems.push(`${label}: ${field} 指向不存在的文件 ${value}（先跑 pnpm build）`)
      invalidFlat.add(field)
      continue
    }
  }

  // 契约 12：期望值不写逐包白名单，而是从 exports["."] 的对应条件推（02 §2 的 canonical 形状）。
  // 条件在、字段缺席也算违反——"整张脸都没写"比"写错一个字节"更静默：tokens 曾三个字段全空，
  // 上一轮的形状与存在性检查对着 undefined 一路放行，而 webpack4 用户 `require` 它直接解析失败。
  const rootEntry = new Map(
    targets
      .filter(({ pointer }) => pointer.startsWith('. > '))
      .map(({ pointer, target }) => [pointer.slice('. > '.length), target] as const),
  )
  for (const [field, pointer] of [
    ['main', 'require > default'],
    ['module', 'import > default'],
    ['types', 'types'],
  ] as const) {
    const expected = rootEntry.get(pointer)
    if (expected === undefined || invalidFlat.has(field)) continue
    publishFaces += 1
    if (flat[field] !== expected) {
      problems.push(
        `${label}: ${field} 必须逐字等于 exports["."] 的 ${pointer} 目标 ${expected}，` +
          `实为 ${JSON.stringify(flat[field])}（只改一张脸 = 新打包器绿、webpack4 / Jest 红）`,
      )
    }
  }

  // dual package 的每条 JS 分支都要有自己的类型声明（2026-10-30，attw 实测后补）。
  // 只发一份 `.d.ts` 时，`type: module` 让它被当成 ESM 声明，而 `require` 指向 `.cjs` ——
  // TS 在 node16+CJS 下直接拒绝这个包，attw 称之为 Masquerading as ESM。
  // 这条**必须在这里**守着：顶层 `types` 存在会让"缺 CJS 类型"看起来像没问题。
  for (const [pointer, expectExt] of [
    ['require > types', '.d.cts'],
    ['import > types', '.d.ts'],
  ] as const) {
    const target = rootEntry.get(pointer)
    if (target === undefined) continue
    publishFaces += 1
    if (!target.endsWith(expectExt)) {
      problems.push(
        `${label}: exports["."] 的 ${pointer} 指向 ${target}，应以 ${expectExt} 结尾` +
          `（CJS 与 ESM 必须各有一份声明，否则 node16 下有一侧会解析到错的模块格式）`,
      )
    }
  }

  // 有 dist/umd 就必须挂上 unpkg / jsdelivr：CDN 的裸包名 URL 靠这两个字段定位默认文件，
  // 不挂等于那一趟 legacy 构建白跑。
  const umdFiles = jsFilesUnder(join(packagesDir, dir, 'dist', 'umd'))
  if (umdFiles.length > 0) {
    for (const field of ['unpkg', 'jsdelivr'] as const) {
      if (invalidFlat.has(field)) continue
      publishFaces += 1
      const value = flat[field]
      if (value === undefined) {
        problems.push(
          `${label}: 有 ${umdFiles.length} 个 dist/umd 产物却没声明 ${field}：` +
            `CDN 的裸包名 URL 找不到默认文件，UMD 等于白构建`,
        )
      } else if (typeof value === 'string' && !umdFiles.includes(resolve(packagesDir, dir, value))) {
        problems.push(`${label}: ${field} 指向 ${value}，不在 dist/umd 的 ${umdFiles.length} 个产物里`)
      }
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

  // 契约 11：类型面断链。dist 没构建时跳过——那是契约 3 的职责，这里不该重复报一条。
  const distDir = join(packagesDir, dir, 'dist')
  if (existsSync(distDir)) {
    const declarations = dtsFiles(distDir)
    declarationFiles += declarations.length
    for (const dtsFile of declarations) {
      for (const spec of importSpecifiers(readFileSync(dtsFile, 'utf8'))) {
        if (!spec.startsWith('.')) continue
        if (resolveDeclaration(dtsFile, spec)) continue
        problems.push(
          `${relative(repoRoot, dtsFile)} 引用了无法解析的 ${spec}：类型面断链，` +
            `消费方拿到的 .d.ts 会在这里失去类型（02 §2）`,
        )
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

// ---------------------------------------------------------------- 组件样式 ↔ token 表
/**
 * 组件 CSS 不许出现字面色值，且每个 `var(--oj-*)` 都必须在 token 产物里有声明（02 §7 一致性）。
 *
 * 拼错的变量名是这个仓库里最安静的一类缺陷：`var(--oj-text-4)` 写成 `var(--oj-txt-4)`，
 * 浏览器不会报错、不会回退，而是**整条声明失效**——按钮背景退回 UA 默认色。
 * 组件测试读的是 JS 状态，tokens 测试读的是自己那张表，两边都是绿的。
 *
 * token 名字只从 `dist/index.css` 与两个主题产物里取，不读生成器常量：与契约 8 同一条规矩，
 * 门禁要盯的是发出去的东西。
 */
const declaredVars = new Set<string>()
for (const [rel, content] of Object.entries(artifacts)) {
  if (!rel.endsWith('.css')) continue
  for (const m of content.matchAll(/(--oj-[\w-]+)\s*:/g)) declaredVars.add(m[1] as string)
}

/**
 * 组件自己设置的局部变量（`--oj-gp-row` 这类）不是 token，但它们**必须在组件源码里被赋值**。
 * 一开始这里写的是白名单，实测第一轮就发现它已经漏了 `--oj-gp-cols`：白名单会漂移，
 * 而"谁赋的值"是数据，不是维护者的记忆。
 */
function assignedVars(dir: string): Set<string> {
  const out = new Set<string>()
  const walk = (current: string): void => {
    for (const name of readdirSync(current)) {
      const abs = join(current, name)
      if (statSync(abs).isDirectory()) walk(abs)
      else if (name.endsWith('.ts') && existsSync(abs)) {
        for (const m of readFileSync(abs, 'utf8').matchAll(/['"](--oj-[\w-]+)['"]\s*:/g)) {
          out.add(m[1] as string)
        }
      }
    }
  }
  const src = join(packagesDir, dir, 'src')
  if (existsSync(src)) walk(src)
  return out
}

let styleVars = 0
for (const dir of pkgNames) {
  const file = join(packagesDir, dir, 'src', 'style.css')
  if (!existsSync(file)) continue
  const css = stripComments(readFileSync(file, 'utf8'))
  const relFile = relative(repoRoot, file)
  // 字面色值等于绕过主题与暗色镜像：暗色模式下这一处不会跟着变。
  for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g)) {
    problems.push(`${relFile} 出现字面色值 ${m[0]}：组件样式只能引用 var(--oj-*)（02 §7）`)
  }
  const local = assignedVars(dir)
  const used = new Set([...css.matchAll(/var\((--oj-[\w-]+)/g)].map((m) => m[1] as string))
  styleVars += used.size
  for (const name of used) {
    if (declaredVars.has(name) || local.has(name)) continue
    problems.push(
      `${relFile} 用了未定义的 ${name}：既不在 token 表里，也没有任何组件源码给它赋值` +
        `——浏览器会丢弃整条声明，而两侧测试都是绿的`,
    )
  }
}

// ---------------------------------------------------------------- 文档站样式 ↔ token 表
/**
 * 文档站是组件库的**第一个真实消费者**，它的样式同样只能引用 token 表里存在的变量。
 *
 * 这条是补上去的：`docs/.vitepress/theme/styles/glass.css` 曾把 `--vp-c-bg` 映射成
 * `var(--oj-bg-layout)`，而 token 表里只有 `--oj-bg-page`。自定义属性解析成无效值后，
 * 整站的 `--vp-c-bg` 一直是空的——白底页面看不出来，搜索浮层一出现就是一块透明面板。
 * 契约 13 当时只扫 `packages/包名/src/style.css`，文档站是自建样式的法外之地。
 */
let docsVars = 0
const docsThemeDir = join(repoRoot, 'docs', '.vitepress', 'theme')
const nameChars = 'abcdefghijklmnopqrstuvwxyz0123456789-'
for (const sub of ['styles', 'components']) {
  const dir = join(docsThemeDir, sub)
  if (!existsSync(dir)) continue
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith('.css') && !entry.endsWith('.vue')) continue
    const file = join(dir, entry)
    const relFile = relative(repoRoot, file)
    const text = stripComments(readFileSync(file, 'utf8'))
    const used = new Set<string>()
    let at = text.indexOf('var(--oj-')
    while (at !== -1) {
      const start = at + 4
      let end = start
      while (end < text.length && nameChars.includes(text[end] ?? '')) end += 1
      used.add(text.slice(start, end))
      at = text.indexOf('var(--oj-', end)
    }
    docsVars += used.size
    for (const name of used) {
      if (declaredVars.has(name)) continue
      problems.push(relFile + ' 用了未定义的 ' + name + ' · 文档站也吃这张 token 表')
    }
  }
}

// ---------------------------------------------------------------- UMD 与外部框架
/**
 * `office-ui.js` 是 Vue 层的兼容线产物，`vue` 必须留在外部（页面上的全局 `Vue`）。
 * 外部化被改回内联的话产物照样能跑，代价藏在两处：体积翻倍，以及页面上同时存在两份 Vue ——
 * `inject` / `provide` / 全局指令全部失效，症状是"组件渲染出来了但点击没反应"。
 * `office-ui-core.js` 是框架无关入口，任何 vue 引用出现在那里都是错的。
 */
for (const file of jsFilesUnder(join(packagesDir, 'ui', 'dist', 'umd'))) {
  const text = readFileSync(file, 'utf8')
  const relFile = relative(repoRoot, file)
  const expectsVue = file.endsWith('office-ui.js')
  const referencesVue = /require\("vue"\)|global\.Vue/.test(text)
  if (expectsVue && !referencesVue) {
    problems.push(`${relFile} 没有把 vue 作为外部依赖：Vue 运行时被内联进了产物（02 §2 四套产物）`)
  }
  if (!expectsVue && referencesVue) {
    problems.push(`${relFile} 是框架无关入口，却把 vue 拉进了产物（ADR-0005）`)
  }
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
    `${declarationFiles} 份入库 .d.ts 说明符全部可解析 · ` +
    `${publishFaces} 个发布面扁平字段与 exports 同源 · ` +
    `组件样式 ${styleVars} 个变量全部命中 token 表 · ` +
    `文档站 ${docsVars} 个变量全部命中 token 表 · ` +
    `i18n ${locales.length} 语 ↔ tokens ${varLayers.length} 个变量覆写层 + ${resetLayers.length} 个排版层 · ` +
    `${governanceDocs.length} 份治理文档链接完好`,
)

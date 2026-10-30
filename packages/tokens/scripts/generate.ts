/**
 * 双产物生成器：一份注册表 → CSS 变量 + 已解析字面值的 JS 对象。
 *
 * 运行：node packages/tokens/scripts/generate.ts （无需安装依赖）
 *
 * 为什么必须双产物：canvas 渲染的网格、标尺、选区拿不到 CSS 变量，只能
 * getComputedStyle 逐个读，在 60fps 网格循环里是灾难性开销。见 prd/01-design-tokens.md §6。
 *
 * CSS 侧保留 `var()` 引用（浏览器惰性解析，主题切换才跟得上）；
 * JS 侧在**合并后的主题表**上展开成字面值。两者由同一 entries 表发射，天然同源。
 *
 * `buildArtifacts()` 被 internal/scripts/check-contracts.ts 复用，用来判断 dist 是否过期，
 * 因此它必须是纯函数：只返回内容，不写盘。
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { entries, type Entry } from '../src/tokens.ts'
import {
  allCombinations,
  buildRawMap,
  cssVarName,
  resolveMap,
  validateRegistry,
  type ResolvedMap,
} from '../src/resolve.ts'

const HEADER = `@jitoffice/tokens — 由 packages/tokens/scripts/generate.ts 生成，请勿手改。
源：packages/tokens/src/tokens.ts（唯一手写来源）。`

function fail(message: string): never {
  console.error(`\n[tokens] ${message}\n`)
  process.exit(1)
}

/** 覆写块的先后顺序即优先级：dark < compact < lang，与 src/resolve.ts 的 pick() 一致。 */
type LayerField = 'dark' | 'compact' | 'ja' | 'zhTw'
interface Layer {
  selector: string
  field: LayerField
}

const DARK: Layer = { selector: 'html[data-oj-theme="dark"],\nhtml.dark', field: 'dark' }
const COMPACT: Layer = { selector: 'html[data-oj-density="compact"]', field: 'compact' }
// `|=` 而不是 `=`：语言属性常带地区子标签（`ja-JP`），精确匹配会让整层覆写静默失效。
// `|="ja"` 同时命中 `ja` 与 `ja-*`，这是 CSS 2.1 为语言子标签设计的写法，无需 `@supports`。
const ZH_TW: Layer = { selector: 'html[lang|="zh-TW"],\nhtml[lang|="zh-Hant"]', field: 'zhTw' }
const JA: Layer = { selector: 'html[lang|="ja"]', field: 'ja' }

function decl(name: string, value: string, note?: string): string {
  return `  ${name}: ${value};${note ? `  /* ${note} */` : ''}`
}

function groupsOf(list: Entry[]): Map<string, Entry[]> {
  const m = new Map<string, Entry[]>()
  for (const e of list) {
    const arr = m.get(e.group)
    if (arr) arr.push(e)
    else m.set(e.group, [e])
  }
  return m
}

function block(selector: string, body: string[]): string {
  return `${selector} {\n${body.join('\n')}\n}`
}

function overrideBody(layer: Layer): string[] {
  const out: string[] = []
  for (const e of entries) {
    const v = e[layer.field]
    if (v === undefined || v === e.light) continue
    out.push(decl(cssVarName(e.path), v))
  }
  return out
}

/**
 * 语言排版重置层（01 §7）。`line-break` 这类是**元素级规则**，组件既不取值也不该取值，
 * 所以不进注册表：CSS 里有它们，JS 产物与 `tokenNames` 里没有。
 *
 * 选择器一律 `|=`，`not()` 里也一样 —— 写成 `not([lang="ja"])` 时 `lang="ja-JP"` 会被判成
 * "非日文"，antialiased 反而作用到日文界面上，Yu Gothic 笔画发虚。这是反向失效，比缺覆写更难察觉。
 */
function resetSection(): string {
  return [
    block('html[lang|="ja"] body', [
      '  line-break: strict;',
      '  word-break: normal;',
      '  text-underline-position: from-font;',
      '  text-autospace: normal;',
    ]),
    '',
    block('html:not([lang|="ja"]) body', ['  -webkit-font-smoothing: antialiased;']),
    '',
  ].join('\n')
}

type Tree = Record<string, unknown>

/** 变量名 → 点分路径。必须反查而不是按 '-' 拆变量名，`--oj-bg-glass-soft` 的路径段是 `glassSoft`。 */
const pathByName = new Map(entries.map((e) => [cssVarName(e.path), e.path]))

function toTree(flat: ResolvedMap): Tree {
  const tree: Tree = {}
  for (const [name, value] of Object.entries(flat)) {
    const path = pathByName.get(name)
    if (!path) fail(`Emitter has no path for ${name}`)
    const parts = path.split('.')
    let node: Tree = tree
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i] as string
      const child = node[key]
      if (child === undefined || typeof child !== 'object') node[key] = {}
      node = node[key] as Tree
    }
    node[parts[parts.length - 1] as string] = value
  }
  return tree
}

const banner = `/*\n * ${HEADER}\n */\n\n`

/**
 * 类型树：与运行时 `toTree()` 用同一套 `path.split('.')`，因此 JS 值与 `.d.ts` 同源。
 * 索引签名写法（`[group: string]: Record<string, unknown>`）会让 `tokens.bg.contaier`
 * 这种拼错在用户侧安静通过并得到 `unknown`——双产物同源必须包括类型，否则 163 个变量
 * 对使用者而言只有一份"字符串映射"，补全与拼写检查全部失效。
 */
interface TypeBranch {
  kids: Map<string, TypeBranch>
  doc?: string
}

function buildTypeTree(): TypeBranch {
  const root: TypeBranch = { kids: new Map() }
  for (const e of entries) {
    let node = root
    for (const seg of e.path.split('.')) {
      let kid = node.kids.get(seg)
      if (!kid) {
        kid = { kids: new Map() }
        node.kids.set(seg, kid)
      }
      node = kid
    }
    node.doc = e.note ? `${cssVarName(e.path)} · ${e.note}` : cssVarName(e.path)
  }
  return root
}

function emitTypeBranch(node: TypeBranch, indent: string): string {
  const lines: string[] = []
  for (const [key, kid] of node.kids) {
    const doc = kid.doc ? `${indent}/** ${kid.doc.replace(/\*\//g, '* /')} */\n` : ''
    lines.push(
      kid.kids.size > 0
        ? `${doc}${indent}${key}: {\n${emitTypeBranch(kid, `${indent}  `)}\n${indent}}`
        : `${doc}${indent}${key}: string`,
    )
  }
  return lines.join('\n')
}

export function buildArtifacts(): Record<string, string> {
  const problems = validateRegistry()
  if (problems.length > 0) fail(`注册表校验未通过:\n  - ${problems.join('\n  - ')}`)

  // ------------------------------------------------------------ CSS
  const rootBody: string[] = ['  color-scheme: light;']
  for (const [group, list] of groupsOf(entries)) {
    rootBody.push(`  /* ---- ${group} ---- */`)
    for (const e of list) rootBody.push(decl(cssVarName(e.path), e.light, e.note))
  }

  const darkBody = overrideBody(DARK)
  const compactBody = overrideBody(COMPACT)
  const twBody = overrideBody(ZH_TW)
  const jaBody = overrideBody(JA)

  const css = [
    banner,
    block(':root', rootBody),
    '',
    block(DARK.selector, ['  color-scheme: dark;', ...darkBody]),
    '',
    block(COMPACT.selector, compactBody),
    '',
    block(ZH_TW.selector, twBody),
    '',
    block(JA.selector, jaBody),
    '',
    '/* ---- 排版重置：元素级规则，不是 token，因此不出现在 JS 产物与 tokenNames 里。',
    '   text-autospace 不加 @supports：老内核丢掉这条声明的后果只是少插 0.25em 间隙，不会排错版，',
    '   也确实没有可降级的替代值可给。实测 Chromium 150 里 UA 默认值就是 no-autospace，',
    '   所以这条声明是载荷性的：每个中日韩↔拉丁边界插入 0.25em（16px 样本实测 +8px）。',
    '   注意该内核只认 normal 与 no-autospace 两个关键字，写成 ideograph-alpha ideograph-numeric',
    '   会被整条丢弃——不要"顺手写全一点"。',
    '   line-break: strict 实测生效（行末可断字符集与 auto/loose 不同），代价是长音符 ー 也禁止',
    '   落在行末，个别行会提前折行——这是 JIS 惯例，与「。」『」落在行首相比，',
    '   后者才是日文读者无法接受的错误。 */',
    resetSection(),
  ].join('\n')

  // ------------------------------------------------------------ JS
  const resolvedAll = new Map<string, ResolvedMap>()
  for (const c of allCombinations()) {
    resolvedAll.set(`${c.theme}.${c.density}.${c.lang}`, resolveMap(buildRawMap(c.theme, c.density, c.lang)))
  }

  const baseKey = 'light.comfortable.zh'
  const baseMap = resolvedAll.get(baseKey)
  if (!baseMap) fail(`缺少基底组合 ${baseKey}`)

  // 差异按"解析后的字面值"计算，而不是按原始值。这样 dist 里只需深合并，
  // 无需在运行时携带 var() 解析器。
  const diffs: Record<string, Tree> = {}
  for (const [key, map] of resolvedAll) {
    if (key === baseKey) continue
    const changed: ResolvedMap = {}
    for (const [name, value] of Object.entries(map)) if (value !== baseMap[name]) changed[name] = value
    if (Object.keys(changed).length > 0) diffs[key] = toTree(changed)
  }

  const BODY = `/*
 * ${HEADER}
 *
 * 值已全部解析为字面量，不含 var()，可在 canvas、Worker 与 SSR 中直接使用。
 * canvas 侧不要长期缓存：主题切换时重新调用 createTokens()。
 */

const BASE = ${JSON.stringify(toTree(baseMap), null, 2)}

const DIFFS = ${JSON.stringify(diffs, null, 2)}

const tokenNames = ${JSON.stringify(Object.keys(baseMap).sort())}

const CACHE = new Map()

function isNode(v) {
  return typeof v === 'object' && v !== null
}

function merge(a, b) {
  const out = {}
  for (const k of Object.keys(a)) out[k] = a[k]
  for (const k of Object.keys(b)) {
    const prev = out[k]
    out[k] = isNode(prev) && isNode(b[k]) ? merge(prev, b[k]) : b[k]
  }
  return out
}

function comboKey(options) {
  const o = options || {}
  return (o.theme || 'light') + '.' + (o.density || 'comfortable') + '.' + (o.lang || 'zh')
}

/**
 * 嵌套形态：createTokens({ theme: 'dark' }).bg.container
 * lang 只接受会产生视觉差异的 'zh' | 'zh-TW' | 'ja'，en 与基底同值。
 */
function createTokens(options) {
  const key = comboKey(options)
  if (key === 'light.comfortable.zh') return BASE
  let tree = CACHE.get(key)
  if (!tree) {
    tree = Object.keys(DIFFS).indexOf(key) >= 0 ? merge(BASE, DIFFS[key]) : BASE
    CACHE.set(key, tree)
  }
  return tree
}
`

  const esm = `${BODY}
export { createTokens, tokenNames }
export const tokens = BASE
`

  const cjs = `"use strict";
${BODY}
module.exports = { createTokens, tokenNames, tokens: BASE }
`

  const dts = `/**
 * ${HEADER}
 */

export type OjTheme = 'light' | 'dark'
export type OjDensity = 'comfortable' | 'compact'
export type OjLang = 'zh' | 'zh-TW' | 'ja'

export interface OjTokenOptions {
  theme?: OjTheme
  density?: OjDensity
  lang?: OjLang
}

/** 用 type 别名而非 interface：别名才有隐式索引签名，Object.entries(tokens) 与扁平化工具才不用重新断言。 */
export type OjTokens = {
${emitTypeBranch(buildTypeTree(), '  ')}
}

export declare function createTokens(options?: OjTokenOptions): OjTokens
export declare const tokens: OjTokens
export declare const tokenNames: string[]
`

  return {
    'dist/index.css': css,
    'dist/index.js': esm,
    'dist/index.cjs': cjs,
    'dist/index.d.ts': dts,
    // CJS 类型镜像：tokens 的类型不走 tsc（由本脚本直接发射），所以 .d.cts 也得在这里生成，
    // 否则 `exports.require.types` 指向一个不存在的文件，attw 对 node16-CJS 报 No types
    'dist/index.d.cts': dts,
    'dist/themes/dark.css': banner + block(DARK.selector, ['  color-scheme: dark;', ...darkBody]) + '\n',
    'dist/themes/compact.css': banner + block(COMPACT.selector, compactBody) + '\n',
  }
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const invokedDirectly = process.argv[1] ? resolve(process.argv[1]) === resolve(import.meta.filename) : false

if (invokedDirectly) {
  const artifacts = buildArtifacts()
  const kb = (s: string): string => `${(new TextEncoder().encode(s).length / 1024).toFixed(1)} KB`
  for (const [rel, content] of Object.entries(artifacts)) {
    const target = join(root, rel)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content)
  }
  console.log(
    `[tokens] ${entries.length} 个变量 → ${Object.keys(artifacts).length} 个产物 · ` +
      `index.css ${kb(artifacts['dist/index.css'] as string)} · index.js ${kb(artifacts['dist/index.js'] as string)}`,
  )
}
